import { type Article } from "~/schemas/article";
import { ArticleRow } from "./ArticleRow";
import { LoadingRow } from "./LoadingRow";

interface ArticleListProps {
  articles: Article[];
  isLoading: boolean;
  onThumbsUp?: (articleId: string, value: boolean) => Promise<void>;
  onThumbsDown?: (articleId: string, value: boolean) => Promise<void>;
  onMarkAsRead?: (articleId: string) => Promise<void>;
  emptyMessage?: string;
}

export function ArticleList({
  articles,
  isLoading,
  onThumbsUp,
  onThumbsDown,
  onMarkAsRead,
  emptyMessage = "No articles found",
}: ArticleListProps) {
  // Show loading skeletons
  if (isLoading && articles.length === 0) {
    return (
      <div className="flex flex-col gap-4 p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <LoadingRow key={i} />
        ))}
      </div>
    );
  }

  // Show empty state
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
    <div className="flex flex-col gap-4 p-6">
      {articles.map(article => (
        <ArticleRow
          key={article.hash_id}
          article={article}
          {...(onThumbsUp ? { onThumbsUp } : {})}
          {...(onThumbsDown ? { onThumbsDown } : {})}
          {...(onMarkAsRead ? { onMarkAsRead } : {})}
        />
      ))}
      {/* Show loading rows at the end when loading more */}
      {isLoading &&
        Array.from({ length: 3 }).map((_, i) => (
          <LoadingRow key={`loading-${i}`} />
        ))}
    </div>
  );
}
