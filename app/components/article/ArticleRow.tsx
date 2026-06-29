import { useNavigate } from "@remix-run/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type Article,
  formatPublishedDate,
  parseArticlesResponse,
} from "~/schemas/article";
import {
  ThumbsUpIcon,
  ThumbsUpFilledIcon,
  ThumbsDownIcon,
  ThumbsDownFilledIcon,
  PlayIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
} from "../layout/Icons";
import { ThumbnailPlaceholder } from "./ThumbnailPlaceholder";
import {
  getCategoryHeaderColor,
  getSourceDisplayName,
} from "~/constants/sources";
import { isVideoSource } from "~/constants/sourceIcons";
import { useArticleInteractions } from "~/hooks/useArticleInteractions";

interface ArticleRowProps {
  article: Article;
  onThumbsUp?: (articleId: string, value: boolean) => Promise<void>;
  onThumbsDown?: (articleId: string, value: boolean) => Promise<void>;
  onMarkAsRead?: (articleId: string) => Promise<void>;
}

type ExpandedSection =
  | null
  | "summary"
  | "key_points"
  | "implication"
  | "similar";

export function ArticleRow({
  article,
  onThumbsUp,
  onThumbsDown,
  onMarkAsRead,
}: ArticleRowProps) {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null);
  const [similarArticles, setSimilarArticles] = useState<Article[] | null>(
    null
  );
  const [isFetchingSimilar, setIsFetchingSimilar] = useState(false);
  const [imageError, setImageError] = useState(false);

  const thumbsUp = article.thumbs_up ?? false;
  const thumbsDown = article.thumbs_down ?? false;
  const haveRead = article.have_read ?? false;

  const summaryRef = useRef<HTMLParagraphElement>(null);
  const [isSummaryTruncated, setIsSummaryTruncated] = useState(false);

  useEffect(() => {
    const el = summaryRef.current;
    if (!el) return;
    setIsSummaryTruncated(el.scrollHeight > el.clientHeight);
  }, [article.summary]);

  useEffect(() => {
    if (expandedSection !== "similar" || similarArticles !== null) return;

    setIsFetchingSimilar(true);

    async function fetchSimilar() {
      try {
        const res = await fetch(`/api/articles/${article.hash_id}/similar`);
        if (!res.ok) throw new Error("Failed to fetch similar articles");
        const data = await res.json();
        const result = parseArticlesResponse(data);
        setSimilarArticles(result.success ? result.data.data : []);
      } catch (error) {
        console.error("Failed to fetch similar articles:", error);
        setSimilarArticles([]);
      } finally {
        setIsFetchingSimilar(false);
      }
    }

    fetchSimilar();
  }, [expandedSection, similarArticles, article.hash_id]);

  const { handleThumbsUp, handleThumbsDown, handleMarkAsRead, isUpdating } =
    useArticleInteractions({
      article,
      ...(onThumbsUp ? { onThumbsUp } : {}),
      ...(onThumbsDown ? { onThumbsDown } : {}),
      ...(onMarkAsRead ? { onMarkAsRead } : {}),
    });

  const hasKeyPoints = article.key_points && article.key_points.length > 0;
  const hasImplication = !!article.implication;

  const handleSectionToggle = useCallback((section: ExpandedSection) => {
    setExpandedSection(prev => (prev === section ? null : section));
  }, []);

  return (
    <div className="bg-stone-50 dark:bg-slate-800 rounded-lg shadow shadow-stone-300/50 overflow-hidden dark:border dark:border-slate-700/70 dark:shadow-lg dark:shadow-black/30">
      {/* Source header strip */}
      <div
        className={`h-10 px-4 flex items-center justify-between ${getCategoryHeaderColor(article.category)}`}
      >
        <span className="font-medium text-sm">
          {getSourceDisplayName(article.source, article.authors)}
        </span>
        <div className="flex items-center gap-2">
          {article.category && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-black/10 dark:bg-black/20">
              {article.category}
            </span>
          )}
          {isVideoSource(article.source) && <PlayIcon className="w-4 h-4" />}
          {haveRead && (
            <span title="Read">
              <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-300" />
            </span>
          )}
        </div>
      </div>

      {/* Two-column content area: 2fr metadata, 3fr summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4">
        {/* Left: metadata (2/5) */}
        <div className="min-w-0 md:col-span-2">
          <div className="flex gap-3">
            <div className="hidden sm:block flex-shrink-0 w-16 h-16 rounded overflow-hidden">
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
                  iconClassName="w-7 h-7"
                />
              )}
            </div>
            <div className="min-w-0">
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleMarkAsRead}
                className="group block"
              >
                <h3 className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-brand-dark dark:group-hover:text-brand-light transition-colors line-clamp-3">
                  {article.title}
                </h3>
              </a>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                {article.authors}
                {article.published_at && (
                  <>
                    <span className="mx-1.5 text-stone-300 dark:text-slate-600">
                      &middot;
                    </span>
                    {formatPublishedDate(article.published_at)}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right: AI summary (3/5) */}
        {article.summary && (
          <div className="min-w-0 md:col-span-3">
            <p
              ref={summaryRef}
              className="text-sm text-slate-600 dark:text-slate-400 line-clamp-4 max-w-prose"
            >
              {article.summary}
            </p>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="px-4 py-2 border-t border-stone-100 dark:border-slate-700 flex items-center gap-2 flex-wrap">
        {/* Thumbs up/down */}
        <button
          type="button"
          onClick={handleThumbsUp}
          disabled={isUpdating}
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors ${
            thumbsUp
              ? "text-green-600 dark:text-green-400 bg-green-600/15 dark:bg-green-500/20 ring-1 ring-green-600/50 dark:ring-green-400/50"
              : "text-slate-500 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-700"
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
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors ${
            thumbsDown
              ? "text-red-600 dark:text-red-400 bg-red-600/15 dark:bg-red-500/20 ring-1 ring-red-600/50 dark:ring-red-400/50"
              : "text-slate-500 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-700"
          }`}
          aria-label={thumbsDown ? "Remove thumbs down" : "Thumbs down"}
        >
          {thumbsDown ? (
            <ThumbsDownFilledIcon className="w-4 h-4" />
          ) : (
            <ThumbsDownIcon className="w-4 h-4" />
          )}
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-stone-200 dark:bg-slate-600 mx-1" />

        {/* Expand buttons - only shown when data exists */}
        {isSummaryTruncated && (
          <button
            type="button"
            onClick={() => handleSectionToggle("summary")}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              expandedSection === "summary"
                ? "bg-accent text-white dark:bg-accent-dark"
                : "text-slate-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-700"
            }`}
          >
            Summary
          </button>
        )}
        {hasKeyPoints && (
          <button
            type="button"
            onClick={() => handleSectionToggle("key_points")}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              expandedSection === "key_points"
                ? "bg-accent text-white dark:bg-accent-dark"
                : "text-slate-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-700"
            }`}
          >
            Key Points
          </button>
        )}
        {hasImplication && (
          <button
            type="button"
            onClick={() => handleSectionToggle("implication")}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              expandedSection === "implication"
                ? "bg-accent text-white dark:bg-accent-dark"
                : "text-slate-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-700"
            }`}
          >
            Implication
          </button>
        )}
        <button
          type="button"
          onClick={() => handleSectionToggle("similar")}
          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            expandedSection === "similar"
              ? "bg-accent text-white dark:bg-accent-dark"
              : "text-slate-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-700"
          }`}
        >
          Similar
        </button>

        {/* Right-aligned read link */}
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleMarkAsRead}
          className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-700 transition-colors"
        >
          Read
          <ExternalLinkIcon className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Expanded section */}
      {expandedSection && (
        <div className="px-4 py-3 border-t border-stone-100 dark:border-slate-700 bg-stone-100 dark:bg-slate-800/50">
          {expandedSection === "summary" && article.summary && (
            <div>
              <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Summary
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {article.summary}
              </p>
            </div>
          )}

          {expandedSection === "key_points" &&
            article.key_points &&
            article.key_points.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Key Points
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  {article.key_points.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

          {expandedSection === "implication" && article.implication && (
            <div>
              <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Implications for AI Alignment
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                {article.implication}
              </p>
            </div>
          )}

          {expandedSection === "similar" && (
            <div>
              <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Similar Articles
              </h4>
              {isFetchingSimilar ? (
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 py-2">
                  <div className="w-4 h-4 border-2 border-stone-300 dark:border-slate-600 border-t-stone-600 dark:border-t-slate-300 rounded-full animate-spin" />
                  Loading similar articles...
                </div>
              ) : similarArticles && similarArticles.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {similarArticles.map(similar => (
                    <button
                      key={similar.hash_id}
                      type="button"
                      onClick={() => navigate(`/articles/${similar.hash_id}`)}
                      className="flex-shrink-0 w-64 rounded-md border border-stone-200 dark:border-slate-600 bg-stone-50 dark:bg-slate-700 p-3 text-left hover:border-stone-300 dark:hover:border-slate-500 transition-colors"
                    >
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 truncate">
                        {getSourceDisplayName(similar.source, similar.authors)}
                      </p>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
                        {similar.title}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 py-1">
                  No similar articles found.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
