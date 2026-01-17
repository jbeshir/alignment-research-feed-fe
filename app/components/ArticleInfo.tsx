import { type Article, formatPublishedDate } from "~/schemas/article";
import { getSourceHeaderColor, getSourceDisplayName } from "~/constants/sources";
import {
  ThumbsUpIcon,
  ThumbsUpFilledIcon,
  ThumbsDownIcon,
  ThumbsDownFilledIcon,
  ExternalLinkIcon,
  CheckCircleIcon,
} from "./Icons";

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
  const thumbsUp = article.thumbs_up ?? false;
  const thumbsDown = article.thumbs_down ?? false;
  const haveRead = article.have_read ?? false;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
      {/* Source header strip - like the card */}
      <div className={`h-14 px-6 flex items-center justify-between ${getSourceHeaderColor(article.source)}`}>
        <span className="font-medium">{getSourceDisplayName(article.source, article.authors)}</span>
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

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
          <span>{article.authors}</span>
          <span className="text-slate-400 dark:text-slate-500">•</span>
          <span>{formatPublishedDate(article.published_at)}</span>
        </div>

        {/* Actions row */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
          {/* Read article button */}
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                thumbsUp
                  ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                  : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-green-300 dark:hover:border-green-700 hover:text-green-600 dark:hover:text-green-400"
              }`}
              aria-label={thumbsUp ? "Remove thumbs up" : "Thumbs up"}
            >
              {thumbsUp ? (
                <ThumbsUpFilledIcon className="w-5 h-5" />
              ) : (
                <ThumbsUpIcon className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">More like this</span>
            </button>
            <button
              type="button"
              onClick={() => onThumbsDown?.(article.hash_id, !thumbsDown)}
              disabled={isUpdating}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                thumbsDown
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                  : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-red-300 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400"
              }`}
              aria-label={thumbsDown ? "Remove thumbs down" : "Thumbs down"}
            >
              {thumbsDown ? (
                <ThumbsDownFilledIcon className="w-5 h-5" />
              ) : (
                <ThumbsDownIcon className="w-5 h-5" />
              )}
              <span className="text-sm font-medium">Less like this</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
