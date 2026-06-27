import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import { type Article, formatPublishedDate } from "~/schemas/article";
import {
  ThumbsUpIcon,
  ThumbsUpFilledIcon,
  ThumbsDownIcon,
  ThumbsDownFilledIcon,
  PlayIcon,
  CheckCircleIcon,
} from "../layout/Icons";
import { ThumbnailPlaceholder } from "./ThumbnailPlaceholder";
import {
  getCategoryHeaderColor,
  getSourceDisplayName,
} from "~/constants/sources";
import { isVideoSource } from "~/constants/sourceIcons";
import { useArticleInteractions } from "~/hooks/useArticleInteractions";

interface ArticleCardProps {
  article: Article;
  onThumbsUp?: (articleId: string, value: boolean) => Promise<void>;
  onThumbsDown?: (articleId: string, value: boolean) => Promise<void>;
  onMarkAsRead?: (articleId: string) => Promise<void>;
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
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const thumbsUp = article.thumbs_up ?? false;
  const thumbsDown = article.thumbs_down ?? false;
  const haveRead = article.have_read ?? false;

  const {
    handleThumbsUp,
    handleThumbsDown,
    handleMarkAsRead,
    isUpdating,
    feedbackError,
  } = useArticleInteractions({
    article,
    ...(onThumbsUp ? { onThumbsUp } : {}),
    ...(onThumbsDown ? { onThumbsDown } : {}),
    ...(onMarkAsRead ? { onMarkAsRead } : {}),
  });

  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleMarkAsRead}
      className="flex flex-col bg-stone-50 dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group h-full"
    >
      {/* Source header strip */}
      <div
        className={`h-12 px-4 flex items-center justify-between gap-2 flex-shrink-0 ${getCategoryHeaderColor(article.category)}`}
      >
        <span className="font-medium text-sm truncate">
          {getSourceDisplayName(article.source, article.authors)}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {article.category && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-black/10 dark:bg-black/20">
              {article.category}
            </span>
          )}
          {isVideoSource(article.source) && <PlayIcon className="w-5 h-5" />}
          {haveRead && (
            <span title="Read">
              <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-300" />
            </span>
          )}
        </div>
      </div>

      {/* Thumbnail */}
      <div className="aspect-video w-full overflow-hidden">
        {article.thumbnail_url && !imageError ? (
          <img
            src={article.thumbnail_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <ThumbnailPlaceholder
            source={article.source}
            className="h-full w-full"
          />
        )}
      </div>

      {/* Content - flex-grow to fill available space */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Date */}
        {article.published_at && (
          <div className="text-xs text-slate-600 dark:text-slate-300 mb-2">
            {formatPublishedDate(article.published_at)}
          </div>
        )}

        {/* Author */}
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-1 truncate">
          {article.authors}
        </p>

        {/* Title */}
        <h3 className="font-medium text-slate-900 dark:text-slate-100 line-clamp-2 mb-3 group-hover:text-brand-dark dark:group-hover:text-brand-light transition-colors">
          {article.title}
        </h3>

        {/* Spacer to push engagement to bottom */}
        <div className="flex-grow" />

        {/* Engagement metrics - pinned to bottom */}
        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-auto pt-2 border-t border-stone-100 dark:border-slate-700">
          <button
            type="button"
            onClick={handleThumbsUp}
            disabled={isUpdating}
            className={`flex items-center gap-1 rounded-full px-2 py-1 transition-colors ${
              thumbsUp
                ? "text-green-600 dark:text-green-400 bg-green-600/15 dark:bg-green-500/20 ring-1 ring-green-600/50 dark:ring-green-400/50"
                : "hover:text-green-600 dark:hover:text-green-400"
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
            className={`flex items-center gap-1 rounded-full px-2 py-1 transition-colors ${
              thumbsDown
                ? "text-red-600 dark:text-red-400 bg-red-600/15 dark:bg-red-500/20 ring-1 ring-red-600/50 dark:ring-red-400/50"
                : "hover:text-red-600 dark:hover:text-red-400"
            }`}
            aria-label={thumbsDown ? "Remove thumbs down" : "Thumbs down"}
          >
            {thumbsDown ? (
              <ThumbsDownFilledIcon className="w-4 h-4" />
            ) : (
              <ThumbsDownIcon className="w-4 h-4" />
            )}
          </button>
          {feedbackError && (
            <span className="text-xs text-red-600 dark:text-red-400">
              {feedbackError}
            </span>
          )}
          <button
            type="button"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              navigate(`/articles/${article.hash_id}`);
            }}
            className="flex items-center gap-1 text-xs hover:text-slate-700 dark:hover:text-slate-300 transition-colors ml-auto"
            aria-label="View article details"
          >
            Details
          </button>
        </div>
      </div>
    </a>
  );
}
