import { useState, useEffect, useCallback, useRef } from "react";
import { useRevalidator } from "@remix-run/react";
import { type Article, parseArticlesResponse } from "~/schemas/article";

export type UserArticleStatus = "unreviewed" | "liked" | "disliked";

interface UseUserArticlesOptions {
  initialArticles?: Article[];
  pageSize?: number;
}

interface UseUserArticlesResult {
  articles: Article[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
}

/**
 * Hook for fetching user-specific articles with pagination (unreviewed, liked, disliked).
 *
 * Uses the Remix proxy routes which handle auth server-side.
 */
export function useUserArticles(
  status: UserArticleStatus,
  options: UseUserArticlesOptions = {}
): UseUserArticlesResult {
  const { initialArticles = [], pageSize = 20 } = options;
  const revalidator = useRevalidator();

  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialArticles.length === pageSize);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Track status and first article to detect navigation (avoids reference comparison issues)
  const prevStatusRef = useRef<UserArticleStatus>(status);
  const prevFirstIdRef = useRef<string | undefined>(
    initialArticles[0]?.hash_id
  );

  // Sync state when status or initial articles change (e.g., on navigation)
  useEffect(() => {
    const currentFirstId = initialArticles[0]?.hash_id;
    const statusChanged = status !== prevStatusRef.current;
    const articlesChanged = currentFirstId !== prevFirstIdRef.current;

    if (statusChanged || articlesChanged) {
      prevStatusRef.current = status;
      prevFirstIdRef.current = currentFirstId;
      setArticles(initialArticles);
      setPage(1);
      setHasMore(initialArticles.length === pageSize);
    }
  }, [status, initialArticles, pageSize]);

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

        const response = await fetch(`/api/articles/${status}?${params}`, {
          signal,
        });

        if (signal.aborted) return;

        if (response.status === 401) {
          throw new Error("Authentication required");
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = parseArticlesResponse(await response.json());

        if (!result.success) {
          throw new Error(`Invalid ${status} articles response from server`);
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
        if (!abortControllerRef.current?.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [status, pageSize]
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
