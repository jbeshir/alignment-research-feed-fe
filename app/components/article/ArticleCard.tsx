import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import {
  type Article,
  formatPublishedDate,
  formatAuthorsByline,
} from "~/schemas/article";
import {
  ThumbsUpIcon,
  ThumbsUpFilledIcon,
  ThumbsDownIcon,
  ThumbsDownFilledIcon,
  PlayIcon,
  CheckCircleIcon,
  ArrowRightIcon,
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
      className="flex flex-col bg-stone-50 dark:bg-slate-800 rounded-lg shadow shadow-stone-300/50 hover:shadow-md transition-shadow overflow-hidden group h-full dark:border dark:border-slate-700/70 dark:shadow-lg dark:shadow-black/30"
    >
      {/* Source header strip */}
      <div
        className={`h-12 px-4 flex items-center justify-between gap-2 flex-shrink-0 ${getCategoryHeaderColor(article.category)}`}
      >
        <span className="font-medium text-sm truncate min-w-0 flex-1">
          {getSourceDisplayName(article.source, article.authors)}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0 max-w-[55%]">
          {article.category && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-black/10 dark:bg-black/20 min-w-0 truncate">
              {article.category}
            </span>
          )}
          {isVideoSource(article.source) && (
            <PlayIcon className="w-4 h-4 flex-shrink-0" />
          )}
          {haveRead && (
            <span title="Read" className="flex-shrink-0">
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
          <div className="text-[13px] text-slate-600 dark:text-slate-300 mb-2">
            {formatPublishedDate(article.published_at)}
          </div>
        )}

        {/* Author */}
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-1 truncate">
          {formatAuthorsByline(article.authors)}
        </p>

        {/* Title */}
        <h3 className="font-medium text-slate-900 dark:text-slate-100 text-pretty line-clamp-2 mb-3 group-hover:text-brand-dark dark:group-hover:text-brand-light transition-colors">
          {article.title}
        </h3>

        {/* Spacer to push engagement to bottom */}
        <div className="flex-grow" />

        {/* Engagement metrics - pinned to bottom */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-auto pt-2 border-t border-stone-100 dark:border-slate-700">
          <button
            type="button"
            onClick={handleThumbsUp}
            disabled={isUpdating}
            className={`inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-800 ${
              thumbsUp
                ? "text-green-800 dark:text-green-400 bg-green-600/15 dark:bg-green-500/20 ring-1 ring-green-600/60 dark:ring-green-400/60 focus-visible:ring-green-600 dark:focus-visible:ring-green-400"
                : "text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-600/10 dark:hover:bg-green-500/10 focus-visible:ring-green-600 dark:focus-visible:ring-green-400"
            }`}
            aria-label={thumbsUp ? "Remove thumbs up" : "Thumbs up"}
          >
            {thumbsUp ? (
              <ThumbsUpFilledIcon className="w-5 h-5" />
            ) : (
              <ThumbsUpIcon className="w-5 h-5" />
            )}
          </button>
          <button
            type="button"
            onClick={handleThumbsDown}
            disabled={isUpdating}
            className={`inline-flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-800 ${
              thumbsDown
                ? "text-red-600 dark:text-red-400 bg-red-600/15 dark:bg-red-500/20 ring-1 ring-red-600/60 dark:ring-red-400/60 focus-visible:ring-red-600 dark:focus-visible:ring-red-400"
                : "text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-600/10 dark:hover:bg-red-500/10 focus-visible:ring-red-600 dark:focus-visible:ring-red-400"
            }`}
            aria-label={thumbsDown ? "Remove thumbs down" : "Thumbs down"}
          >
            {thumbsDown ? (
              <ThumbsDownFilledIcon className="w-5 h-5" />
            ) : (
              <ThumbsDownIcon className="w-5 h-5" />
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
            className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-stone-200 dark:border-slate-600 px-3 min-h-[44px] text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-accent hover:text-accent hover:bg-accent/5 dark:hover:text-accent-dark-fg dark:hover:border-accent-dark-fg dark:hover:bg-accent-dark-fg/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:focus-visible:ring-accent-dark-fg focus-visible:ring-offset-1 dark:focus-visible:ring-offset-slate-800 transition-colors"
            aria-label="View article details"
          >
            View details
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </a>
  );
}
