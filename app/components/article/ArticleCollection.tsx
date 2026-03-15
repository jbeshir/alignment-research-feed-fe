import { type Article } from "~/schemas/article";

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
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          {emptyMessage}
        </p>
      </div>
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
