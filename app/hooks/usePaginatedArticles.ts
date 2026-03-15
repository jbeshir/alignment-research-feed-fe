import { useState, useEffect, useCallback, useRef } from "react";
import { useRevalidator } from "@remix-run/react";
import { type Article, parseArticlesResponse } from "~/schemas/article";

interface UsePaginatedArticlesOptions {
  buildUrl: (pageNum: number, pageSize: number) => string;
  initialArticles?: Article[];
  pageSize?: number;
}

export interface UsePaginatedArticlesResult {
  articles: Article[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
  /** Reset state to a new article list (e.g. on navigation). */
  resetTo: (newArticles: Article[]) => void;
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
}

/**
 * Base hook for paginated article fetching with abort, revalidation, and load-more.
 * useArticles and useUserArticles are thin wrappers over this hook.
 */
export function usePaginatedArticles({
  buildUrl,
  initialArticles = [],
  pageSize = 20,
}: UsePaginatedArticlesOptions): UsePaginatedArticlesResult {
  const revalidator = useRevalidator();

  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialArticles.length === pageSize);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchArticles = useCallback(
    async (pageNum: number, reset: boolean = false) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      const { signal } = abortControllerRef.current;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(buildUrl(pageNum, pageSize), { signal });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = parseArticlesResponse(await response.json());

        if (!result.success) {
          throw new Error("Invalid articles response from server");
        }

        if (!signal.aborted) {
          setArticles(prev =>
            reset ? result.data.data : [...prev, ...result.data.data]
          );
          setHasMore(result.data.data.length === pageSize);
          setPage(pageNum);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [buildUrl, pageSize]
  );

  // Cleanup: cancel any pending request on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Revalidate loader data when Remix revalidates (e.g., after login/logout)
  useEffect(() => {
    if (revalidator.state === "idle" && initialArticles.length > 0) {
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
    setArticles([]);
    setPage(1);
    setHasMore(true);
    fetchArticles(1, true);
  }, [fetchArticles]);

  const resetTo = useCallback(
    (newArticles: Article[]) => {
      setArticles(newArticles);
      setPage(1);
      setHasMore(newArticles.length === pageSize);
    },
    [pageSize]
  );

  return {
    articles,
    isLoading,
    error,
    hasMore,
    loadMore,
    refetch,
    resetTo,
    setArticles,
  };
}
