import { type Article, formatPublishedDate } from "~/schemas/article";
import {
  getCategoryHeaderColor,
  getSourceDisplayName,
} from "~/constants/sources";
import { useState } from "react";
import {
  ThumbsUpIcon,
  ThumbsUpFilledIcon,
  ThumbsDownIcon,
  ThumbsDownFilledIcon,
  ExternalLinkIcon,
  CheckCircleIcon,
} from "../layout/Icons";
import { ThumbnailPlaceholder } from "./ThumbnailPlaceholder";

type ArticleInfoProps = {
  article: Article;
  onThumbsUp?: (articleId: string, value: boolean) => Promise<void>;
  onThumbsDown?: (articleId: string, value: boolean) => Promise<void>;
  isUpdating?: boolean;
};

export function ArticleInfo({
  article,
  onThumbsUp,
  onThumbsDown,
  isUpdating = false,
}: ArticleInfoProps) {
  const [imageError, setImageError] = useState(false);
  const thumbsUp = article.thumbs_up ?? false;
  const thumbsDown = article.thumbs_down ?? false;
  const haveRead = article.have_read ?? false;

  return (
    <div className="bg-stone-50 dark:bg-surface-2 rounded-xl shadow-panel overflow-hidden">
      {/* Source header strip - like the card */}
      <div
        className={`h-14 px-6 flex items-center justify-between ${getCategoryHeaderColor(article.category)}`}
      >
        <span className="font-medium">
          {getSourceDisplayName(article.source, article.authors)}
        </span>
        <div className="flex items-center gap-3">
          {haveRead && (
            <span className="flex items-center gap-1 text-sm opacity-80">
              <CheckCircleIcon className="w-4 h-4" />
              Read
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
          {article.title}
        </h1>

        {/* Thumbnail */}
        <div className="rounded-lg overflow-hidden max-w-2xl">
          {article.thumbnail_url && !imageError ? (
            <img
              src={article.thumbnail_url}
              alt=""
              loading="eager"
              className="w-full h-auto object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <ThumbnailPlaceholder
              source={article.source}
              className="w-full aspect-video"
            />
          )}
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-200">
          <span className="min-w-0 break-words">{article.authors}</span>
          {article.published_at && (
            <>
              <span className="text-stone-400 dark:text-slate-500">•</span>
              <span>{formatPublishedDate(article.published_at)}</span>
            </>
          )}
        </div>

        {/* Actions row */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-stone-100 dark:border-slate-700">
          {/* Read article button */}
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent dark:bg-accent-dark text-white rounded-lg font-medium hover:bg-accent-hover dark:hover:bg-accent-dark-hover transition-colors"
          >
            Read Article
            <ExternalLinkIcon className="w-4 h-4" />
          </a>

          {/* Feedback buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => onThumbsUp?.(article.hash_id, !thumbsUp)}
              disabled={isUpdating}
              className={`flex items-center gap-2 px-4 py-2 min-h-[48px] rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-surface-2 ${
                thumbsUp
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 ring-1 ring-green-500/40 dark:ring-green-400/40 focus-visible:ring-green-600 dark:focus-visible:ring-green-400"
                  : "border-stone-200 dark:border-slate-600 text-slate-500 dark:text-slate-200 hover:border-green-300 dark:hover:border-green-700 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50/50 dark:hover:bg-green-900/10 focus-visible:ring-green-600 dark:focus-visible:ring-green-400"
              }`}
              aria-label={thumbsUp ? "Remove thumbs up" : "Thumbs up"}
            >
              {thumbsUp ? (
                <ThumbsUpFilledIcon className="w-6 h-6" />
              ) : (
                <ThumbsUpIcon className="w-6 h-6" />
              )}
              <span className="text-sm font-medium">More like this</span>
            </button>
            <button
              type="button"
              onClick={() => onThumbsDown?.(article.hash_id, !thumbsDown)}
              disabled={isUpdating}
              className={`flex items-center gap-2 px-4 py-2 min-h-[48px] rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-surface-2 ${
                thumbsDown
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 ring-1 ring-red-500/40 dark:ring-red-400/40 focus-visible:ring-red-600 dark:focus-visible:ring-red-400"
                  : "border-stone-200 dark:border-slate-600 text-slate-500 dark:text-slate-200 hover:border-red-300 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/10 focus-visible:ring-red-600 dark:focus-visible:ring-red-400"
              }`}
              aria-label={thumbsDown ? "Remove thumbs down" : "Thumbs down"}
            >
              {thumbsDown ? (
                <ThumbsDownFilledIcon className="w-6 h-6" />
              ) : (
                <ThumbsDownIcon className="w-6 h-6" />
              )}
              <span className="text-sm font-medium">Less like this</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
