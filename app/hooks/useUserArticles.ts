import { useEffect, useCallback, useRef } from "react";
import { type Article } from "~/schemas/article";
import {
  usePaginatedArticles,
  type UsePaginatedArticlesResult,
} from "./usePaginatedArticles";

type UserArticleStatus = "unreviewed" | "liked" | "disliked";

interface UseUserArticlesOptions {
  initialArticles?: Article[];
  pageSize?: number;
}

export function useUserArticles(
  status: UserArticleStatus,
  options: UseUserArticlesOptions = {}
): UsePaginatedArticlesResult {
  const { initialArticles = [], pageSize = 20 } = options;

  const buildUrl = useCallback(
    (pageNum: number, ps: number) => {
      const params = new URLSearchParams();
      params.set("page", pageNum.toString());
      params.set("page_size", ps.toString());
      return `/api/articles/${status}?${params}`;
    },
    [status]
  );

  const result = usePaginatedArticles({ buildUrl, initialArticles, pageSize });
  const { resetTo } = result;

  // Track status and first article to detect navigation (avoids reference comparison issues)
  const prevStatusRef = useRef<UserArticleStatus>(status);
  const prevFirstIdRef = useRef<string | undefined>(
    initialArticles[0]?.hash_id
  );

  useEffect(() => {
    const currentFirstId = initialArticles[0]?.hash_id;
    const statusChanged = status !== prevStatusRef.current;
    const articlesChanged = currentFirstId !== prevFirstIdRef.current;

    if (statusChanged || articlesChanged) {
      prevStatusRef.current = status;
      prevFirstIdRef.current = currentFirstId;
      resetTo(initialArticles);
    }
  }, [status, initialArticles, resetTo]);

  return result;
}
