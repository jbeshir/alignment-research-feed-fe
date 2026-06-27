import type { ReactNode } from "react";
import { type Article } from "~/schemas/article";
import { EmptyState } from "~/components/feedback";
import { InboxIcon } from "~/components/layout/Icons";

interface ArticleItemProps {
  article: Article;
  onThumbsUp?: (articleId: string, value: boolean) => Promise<void>;
  onThumbsDown?: (articleId: string, value: boolean) => Promise<void>;
  onMarkAsRead?: (articleId: string) => Promise<void>;
}

export interface ArticleCollectionProps {
  articles: Article[];
  isLoading: boolean;
  emptyMessage?: string;
  emptyState?: ReactNode;
  onThumbsUp?: (articleId: string, value: boolean) => Promise<void>;
  onThumbsDown?: (articleId: string, value: boolean) => Promise<void>;
  onMarkAsRead?: (articleId: string) => Promise<void>;
  wrapperClassName: string;
  initialSkeletonCount: number;
  loadMoreSkeletonCount: number;
  ItemComponent: React.ComponentType<ArticleItemProps>;
  SkeletonComponent: React.ComponentType;
}

export function ArticleCollection({
  articles,
  isLoading,
  emptyMessage = "No articles found",
  emptyState,
  onThumbsUp,
  onThumbsDown,
  onMarkAsRead,
  wrapperClassName,
  initialSkeletonCount,
  loadMoreSkeletonCount,
  ItemComponent,
  SkeletonComponent,
}: ArticleCollectionProps) {
  if (isLoading && articles.length === 0) {
    return (
      <div className={wrapperClassName}>
        {Array.from({ length: initialSkeletonCount }).map((_, i) => (
          <SkeletonComponent key={i} />
        ))}
      </div>
    );
  }

  if (!isLoading && articles.length === 0) {
    return (
      <>
        {emptyState ?? (
          <EmptyState
            icon={<InboxIcon />}
            title="No articles yet"
            description={emptyMessage}
          />
        )}
      </>
    );
  }

  return (
    <div className={wrapperClassName}>
      {articles.map(article => (
        <ItemComponent
          key={article.hash_id}
          article={article}
          {...(onThumbsUp ? { onThumbsUp } : {})}
          {...(onThumbsDown ? { onThumbsDown } : {})}
          {...(onMarkAsRead ? { onMarkAsRead } : {})}
        />
      ))}
      {isLoading &&
        Array.from({ length: loadMoreSkeletonCount }).map((_, i) => (
          <SkeletonComponent key={`loading-${i}`} />
        ))}
    </div>
  );
}
