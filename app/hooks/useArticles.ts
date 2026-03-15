import { useEffect, useCallback, useRef } from "react";
import { type Article } from "~/schemas/article";
import {
  usePaginatedArticles,
  type UsePaginatedArticlesResult,
} from "./usePaginatedArticles";

interface UseArticlesOptions {
  initialArticles?: Article[];
  pageSize?: number;
}

export function useArticles(
  searchQuery: string,
  options: UseArticlesOptions = {}
): UsePaginatedArticlesResult {
  const { initialArticles = [], pageSize = 20 } = options;

  const buildUrl = useCallback(
    (pageNum: number, ps: number) => {
      const params = new URLSearchParams();
      params.set("page", pageNum.toString());
      params.set("page_size", ps.toString());
      params.set("sort", "published_at_desc");
      if (searchQuery.trim()) {
        params.set("filter_title_fulltext", searchQuery.trim());
      }
      return `/api/articles?${params}`;
    },
    [searchQuery]
  );

  const result = usePaginatedArticles({ buildUrl, initialArticles, pageSize });
  const { refetch } = result;

  const lastSearchRef = useRef(searchQuery);
  useEffect(() => {
    if (searchQuery !== lastSearchRef.current) {
      lastSearchRef.current = searchQuery;
      refetch();
    }
  }, [searchQuery, refetch]);

  return result;
}
