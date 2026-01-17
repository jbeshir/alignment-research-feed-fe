import { type Article } from "~/schemas/article";
import { ArticleCard } from "./ArticleCard";
import { LoadingCard } from "./LoadingCard";

interface ArticleGridProps {
  articles: Article[];
  isLoading: boolean;
  onThumbsUp?: (articleId: string, value: boolean) => Promise<void>;
  onThumbsDown?: (articleId: string, value: boolean) => Promise<void>;
  onMarkAsRead?: (articleId: string) => Promise<void>;
  emptyMessage?: string;
}

export function ArticleGrid({
  articles,
  isLoading,
  onThumbsUp,
  onThumbsDown,
  onMarkAsRead,
  emptyMessage = "No articles found",
}: ArticleGridProps) {
  // Show loading skeletons
  if (isLoading && articles.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    );
  }

  // Show empty state
  if (!isLoading && articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <p className="text-slate-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {articles.map((article) => (
        <ArticleCard
          key={article.hash_id}
          article={article}
          {...(onThumbsUp ? { onThumbsUp } : {})}
          {...(onThumbsDown ? { onThumbsDown } : {})}
          {...(onMarkAsRead ? { onMarkAsRead } : {})}
        />
      ))}
      {/* Show loading cards at the end when loading more */}
      {isLoading &&
        Array.from({ length: 4 }).map((_, i) => (
          <LoadingCard key={`loading-${i}`} />
        ))}
    </div>
  );
}
