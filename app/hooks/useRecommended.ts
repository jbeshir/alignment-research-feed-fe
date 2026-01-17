import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "~/root";
import {
  type Article,
  parseArticlesResponse,
} from "~/schemas/article";

interface UseRecommendedResult {
  articles: Article[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * Hook for fetching recommended articles.
 *
 * Uses the Remix proxy route (/api/articles/recommended) which handles auth server-side.
 */
export function useRecommended(): UseRecommendedResult {
  const { isAuthenticated } = useAuth();

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  // AbortController for cancelling stale requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchRecommended = useCallback(async () => {
    if (!isAuthenticated) {
      setArticles([]);
      return;
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setIsLoading(true);
    setError(null);

    try {
      // Use the Remix proxy route (same-origin, no CORS issues)
      const response = await fetch("/api/articles/recommended", {
        signal,
      });

      // Check if request was aborted
      if (signal.aborted) return;

      if (response.status === 401) {
        throw new Error("Authentication required");
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = parseArticlesResponse(await response.json());

      if (!result.success) {
        throw new Error("Invalid recommendations response from server");
      }

      // Only update state if request wasn't aborted
      if (!signal.aborted) {
        setArticles(result.data.data);
      }
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setArticles([]);
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
        setHasFetched(true);
      }
    }
  }, [isAuthenticated]);

  // Fetch recommendations when authenticated and not already fetched
  useEffect(() => {
    if (isAuthenticated && !hasFetched) {
      fetchRecommended();
    }
  }, [isAuthenticated, hasFetched, fetchRecommended]);

  // Reset when auth state changes to not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setArticles([]);
      setHasFetched(false);
    }
  }, [isAuthenticated]);

  // Cleanup: cancel any pending request on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const refetch = useCallback(() => {
    setHasFetched(false);
    fetchRecommended();
  }, [fetchRecommended]);

  return {
    articles,
    isLoading,
    error,
    refetch,
  };
}
