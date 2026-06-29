import type { ReactNode } from "react";
import { type Article } from "~/schemas/article";
import type { ViewMode } from "../layout/ViewToggle";
import { ArticleList } from "./ArticleList";
import { ArticleGrid } from "./ArticleGrid";

interface ArticleFeedProps {
  articles: Article[];
  isLoading: boolean;
  viewMode: ViewMode;
  onThumbsUp?: (articleId: string, value: boolean) => Promise<void>;
  onThumbsDown?: (articleId: string, value: boolean) => Promise<void>;
  onMarkAsRead?: (articleId: string) => Promise<void>;
  emptyMessage?: string;
  emptyState?: ReactNode;
}

export function ArticleFeed({ viewMode, ...props }: ArticleFeedProps) {
  if (viewMode === "grid") {
    return <ArticleGrid {...props} />;
  }
  return <ArticleList {...props} />;
}
