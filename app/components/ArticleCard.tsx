import { Link } from "@remix-run/react";
import { useCallback, useState } from "react";
import { useAuth } from "~/root";
import { type Article, formatPublishedDate } from "~/schemas/article";
import {
  ThumbsUpIcon,
  ThumbsUpFilledIcon,
  ThumbsDownIcon,
  ThumbsDownFilledIcon,
  PlayIcon,
  CheckCircleIcon,
  EllipsisIcon,
} from "./Icons";
import { getSourceColor } from "~/constants/sources";

interface ArticleCardProps {
  article: Article;
  onThumbsUp?: (articleId: string, value: boolean) => Promise<void>;
  onThumbsDown?: (articleId: string, value: boolean) => Promise<void>;
  onMarkAsRead?: (articleId: string) => Promise<void>;
}

function isVideoSource(source: string): boolean {
  return source.toLowerCase() === "youtube";
}

/**
 * ArticleCard is a controlled component - it reads state from article props
 * and delegates all state changes to parent via callbacks.
 * This ensures a single source of truth for article state.
 */
export function ArticleCard({
  article,
  onThumbsUp,
  onThumbsDown,
  onMarkAsRead,
}: ArticleCardProps) {
  const { isAuthenticated } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  // Read state directly from props (single source of truth)
  const thumbsUp = article.thumbs_up ?? false;
  const thumbsDown = article.thumbs_down ?? false;
  const haveRead = article.have_read ?? false;

  // Mark as read when card is clicked (if authenticated)
  const handleCardClick = useCallback(() => {
    if (!isAuthenticated || !onMarkAsRead || haveRead) return;

    // Fire and forget - parent handles state update
    onMarkAsRead(article.hash_id).catch((error) => {
      console.error("Failed to mark as read:", error);
    });
  }, [isAuthenticated, onMarkAsRead, haveRead, article.hash_id]);

  const handleThumbsUp = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isAuthenticated) {
        // Redirect to login
        window.location.href = "/auth/login";
        return;
      }

      if (isUpdating || !onThumbsUp) return;

      setIsUpdating(true);
      try {
        // Parent handles optimistic update and rollback
        await onThumbsUp(article.hash_id, !thumbsUp);
      } catch (error) {
        console.error("Failed to update thumbs up:", error);
      } finally {
        setIsUpdating(false);
      }
    },
    [isAuthenticated, isUpdating, onThumbsUp, thumbsUp, article.hash_id]
  );

  const handleThumbsDown = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isAuthenticated) {
        // Redirect to login
        window.location.href = "/auth/login";
        return;
      }

      if (isUpdating || !onThumbsDown) return;

      setIsUpdating(true);
      try {
        // Parent handles optimistic update and rollback
        await onThumbsDown(article.hash_id, !thumbsDown);
      } catch (error) {
        console.error("Failed to update thumbs down:", error);
      } finally {
        setIsUpdating(false);
      }
    },
    [isAuthenticated, isUpdating, onThumbsDown, thumbsDown, article.hash_id]
  );

  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleCardClick}
      className="flex flex-col bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group h-full"
    >
      {/* Thumbnail placeholder */}
      <div className="aspect-video bg-slate-200 flex items-center justify-center relative flex-shrink-0">
        {isVideoSource(article.source) ? (
          <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center group-hover:bg-white transition-colors">
            <PlayIcon className="w-8 h-8 text-slate-700 ml-1" />
          </div>
        ) : (
          <div className="text-slate-400 text-sm font-medium">
            {article.source}
          </div>
        )}
        {/* Read marker overlay */}
        {haveRead && (
          <div className="absolute top-2 right-2 bg-white/70 text-green-600 rounded-full p-0.5" title="Read">
            <CheckCircleIcon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Content - flex-grow to fill available space */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Source and date tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          <span
            className={`text-xs px-2 py-0.5 rounded ${getSourceColor(article.source)}`}
          >
            {article.source}
          </span>
          <span className="text-xs text-slate-400">
            {formatPublishedDate(article.published_at)}
          </span>
        </div>

        {/* Author */}
        <p className="text-sm text-slate-600 mb-1 truncate">{article.authors}</p>

        {/* Title */}
        <h3 className="font-medium text-slate-900 line-clamp-2 mb-3 group-hover:text-brand-dark transition-colors">
          {article.title}
        </h3>

        {/* Spacer to push engagement to bottom */}
        <div className="flex-grow" />

        {/* Engagement metrics - pinned to bottom */}
        <div className="flex items-center gap-4 text-sm text-slate-500 mt-auto pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={handleThumbsUp}
            disabled={isUpdating}
            className={`flex items-center gap-1 hover:text-green-600 transition-colors ${
              thumbsUp ? "text-green-600" : ""
            }`}
            aria-label={thumbsUp ? "Remove thumbs up" : "Thumbs up"}
          >
            {thumbsUp ? (
              <ThumbsUpFilledIcon className="w-4 h-4" />
            ) : (
              <ThumbsUpIcon className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={handleThumbsDown}
            disabled={isUpdating}
            className={`flex items-center gap-1 hover:text-red-600 transition-colors ${
              thumbsDown ? "text-red-600" : ""
            }`}
            aria-label={thumbsDown ? "Remove thumbs down" : "Thumbs down"}
          >
            {thumbsDown ? (
              <ThumbsDownFilledIcon className="w-4 h-4" />
            ) : (
              <ThumbsDownIcon className="w-4 h-4" />
            )}
          </button>
          <Link
            to={`/articles/${article.hash_id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 hover:text-slate-700 transition-colors ml-auto"
            aria-label="View details"
          >
            <EllipsisIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </a>
  );
}
