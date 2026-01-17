import { useState, useEffect, useCallback, useRef } from "react";
import { useRevalidator } from "@remix-run/react";
import { type Article, parseArticlesResponse } from "~/schemas/article";

interface UseArticlesOptions {
  initialArticles?: Article[];
  pageSize?: number;
}

interface UseArticlesResult {
  articles: Article[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
}

/**
 * Hook for fetching and managing articles with pagination.
 *
 * Uses the Remix proxy route (/api/articles) which handles auth server-side.
 */
export function useArticles(
  searchQuery: string,
  options: UseArticlesOptions = {}
): UseArticlesResult {
  const { initialArticles = [], pageSize = 20 } = options;
  const revalidator = useRevalidator();

  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialArticles.length === pageSize);

  // Track the last search query to detect changes
  const lastSearchRef = useRef(searchQuery);
  // Track if we've done the initial load (to avoid refetching server-loaded data)
  const initialLoadDone = useRef(initialArticles.length > 0);
  // AbortController for cancelling stale requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchArticles = useCallback(
    async (pageNum: number, reset: boolean = false) => {
      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("page", pageNum.toString());
        params.set("page_size", pageSize.toString());
        params.set("sort", "published_at_desc");

        if (searchQuery.trim()) {
          params.set("filter_title_fulltext", searchQuery.trim());
        }

        // Use the Remix proxy route (same-origin, no CORS issues)
        const response = await fetch(`/api/articles?${params}`, {
          signal,
        });

        // Check if request was aborted
        if (signal.aborted) return;

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = parseArticlesResponse(await response.json());

        if (!result.success) {
          throw new Error("Invalid articles response from server");
        }

        // Only update state if request wasn't aborted
        if (!signal.aborted) {
          setArticles(prev =>
            reset ? result.data.data : [...prev, ...result.data.data]
          );
          setHasMore(result.data.data.length === pageSize);
          setPage(pageNum);
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [searchQuery, pageSize]
  );

  // Reset and fetch when search query changes (user-initiated search)
  useEffect(() => {
    if (searchQuery !== lastSearchRef.current) {
      lastSearchRef.current = searchQuery;
      initialLoadDone.current = false; // Allow fetching for new search
      setArticles([]);
      setPage(1);
      setHasMore(true);
      fetchArticles(1, true);
    }
  }, [searchQuery, fetchArticles]);

  // Cleanup: cancel any pending request on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Revalidate loader data when Remix revalidates (e.g., after login/logout)
  // This ensures we get fresh server data with the new auth state
  useEffect(() => {
    if (revalidator.state === "idle" && initialArticles.length > 0) {
      // Reset to initial articles from the loader (which has fresh auth state)
      setArticles(initialArticles);
      setPage(1);
      setHasMore(initialArticles.length === pageSize);
    }
  }, [initialArticles, pageSize, revalidator.state]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchArticles(page + 1);
    }
  }, [isLoading, hasMore, page, fetchArticles]);

  const refetch = useCallback(() => {
    initialLoadDone.current = false;
    setArticles([]);
    setPage(1);
    setHasMore(true);
    fetchArticles(1, true);
  }, [fetchArticles]);

  return {
    articles,
    isLoading,
    error,
    hasMore,
    loadMore,
    refetch,
    setArticles,
  };
}
