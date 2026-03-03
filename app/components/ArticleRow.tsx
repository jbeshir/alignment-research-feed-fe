import { useNavigate } from "@remix-run/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "~/root";
import { type Article, formatPublishedDate } from "~/schemas/article";
import { parseArticlesResponse } from "~/schemas/article";
import {
  ThumbsUpIcon,
  ThumbsUpFilledIcon,
  ThumbsDownIcon,
  ThumbsDownFilledIcon,
  PlayIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
} from "./Icons";
import {
  getSourceHeaderColor,
  getSourceDisplayName,
} from "~/constants/sources";

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

function isVideoSource(source: string): boolean {
  return source.toLowerCase() === "youtube";
}

export function ArticleRow({
  article,
  onThumbsUp,
  onThumbsDown,
  onMarkAsRead,
}: ArticleRowProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null);
  const [similarArticles, setSimilarArticles] = useState<Article[] | null>(
    null
  );
  const [isFetchingSimilar, setIsFetchingSimilar] = useState(false);

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

  const hasKeyPoints = article.key_points && article.key_points.length > 0;
  const hasImplication = !!article.implication;

  const handleMarkAsRead = useCallback(() => {
    if (!isAuthenticated || !onMarkAsRead || haveRead) return;
    onMarkAsRead(article.hash_id).catch(error => {
      console.error("Failed to mark as read:", error);
    });
  }, [isAuthenticated, onMarkAsRead, haveRead, article.hash_id]);

  const handleThumbsUp = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!isAuthenticated) {
        window.location.href = "/auth/login";
        return;
      }

      if (isUpdating || !onThumbsUp) return;

      setIsUpdating(true);
      try {
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
        window.location.href = "/auth/login";
        return;
      }

      if (isUpdating || !onThumbsDown) return;

      setIsUpdating(true);
      try {
        await onThumbsDown(article.hash_id, !thumbsDown);
      } catch (error) {
        console.error("Failed to update thumbs down:", error);
      } finally {
        setIsUpdating(false);
      }
    },
    [isAuthenticated, isUpdating, onThumbsDown, thumbsDown, article.hash_id]
  );

  const toggleSection = useCallback(
    (section: ExpandedSection) => {
      if (expandedSection === section) {
        setExpandedSection(null);
        return;
      }

      setExpandedSection(section);

      // Fetch similar articles on first expand
      if (section === "similar" && similarArticles === null) {
        setIsFetchingSimilar(true);
        fetch(`/api/articles/${article.hash_id}/similar`)
          .then(res => {
            if (!res.ok) throw new Error("Failed to fetch similar articles");
            return res.json();
          })
          .then(data => {
            const result = parseArticlesResponse(data);
            if (result.success) {
              setSimilarArticles(result.data.data);
            } else {
              setSimilarArticles([]);
            }
          })
          .catch(error => {
            console.error("Failed to fetch similar articles:", error);
            setSimilarArticles([]);
          })
          .finally(() => {
            setIsFetchingSimilar(false);
          });
      }
    },
    [expandedSection, similarArticles, article.hash_id]
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
      {/* Source header strip */}
      <div
        className={`h-10 px-4 flex items-center justify-between ${getSourceHeaderColor(article.source)}`}
      >
        <span className="font-medium text-sm">
          {getSourceDisplayName(article.source, article.authors)}
        </span>
        <div className="flex items-center gap-2">
          {article.category && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-white/20 dark:bg-black/20">
              {article.category}
            </span>
          )}
          {isVideoSource(article.source) && <PlayIcon className="w-5 h-5" />}
          {haveRead && (
            <span title="Read">
              <CheckCircleIcon className="w-4 h-4 text-green-300" />
            </span>
          )}
        </div>
      </div>

      {/* Two-column content area: 2fr metadata, 3fr summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4">
        {/* Left: metadata (2/5) */}
        <div className="min-w-0 md:col-span-2">
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleMarkAsRead}
            className="group block"
          >
            <h3 className="font-medium text-slate-900 dark:text-slate-100 group-hover:text-brand-dark dark:group-hover:text-brand-light transition-colors">
              {article.title}
            </h3>
          </a>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {article.authors}
            {article.published_at && (
              <>
                <span className="mx-1.5 text-slate-300 dark:text-slate-600">
                  &middot;
                </span>
                {formatPublishedDate(article.published_at)}
              </>
            )}
          </p>
        </div>

        {/* Right: AI summary (3/5) */}
        {article.summary && (
          <div className="min-w-0 md:col-span-3">
            <p
              ref={summaryRef}
              className="text-sm text-slate-600 dark:text-slate-400 line-clamp-4"
            >
              {article.summary}
            </p>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2 flex-wrap">
        {/* Thumbs up/down */}
        <button
          type="button"
          onClick={handleThumbsUp}
          disabled={isUpdating}
          className={`flex items-center gap-1 px-2 py-1 rounded text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
            thumbsUp
              ? "text-green-600 dark:text-green-400"
              : "text-slate-500 dark:text-slate-400"
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
          className={`flex items-center gap-1 px-2 py-1 rounded text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
            thumbsDown
              ? "text-red-600 dark:text-red-400"
              : "text-slate-500 dark:text-slate-400"
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
        <div className="w-px h-5 bg-slate-200 dark:bg-slate-600 mx-1" />

        {/* Expand buttons - only shown when data exists */}
        {isSummaryTruncated && (
          <button
            type="button"
            onClick={() => toggleSection("summary")}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              expandedSection === "summary"
                ? "bg-brand-dark text-white dark:bg-brand-light dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            Summary
          </button>
        )}
        {hasKeyPoints && (
          <button
            type="button"
            onClick={() => toggleSection("key_points")}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              expandedSection === "key_points"
                ? "bg-brand-dark text-white dark:bg-brand-light dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            Key Points
          </button>
        )}
        {hasImplication && (
          <button
            type="button"
            onClick={() => toggleSection("implication")}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              expandedSection === "implication"
                ? "bg-brand-dark text-white dark:bg-brand-light dark:text-slate-900"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            Implication
          </button>
        )}
        <button
          type="button"
          onClick={() => toggleSection("similar")}
          className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
            expandedSection === "similar"
              ? "bg-brand-dark text-white dark:bg-brand-light dark:text-slate-900"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
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
          className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          Read
          <ExternalLinkIcon className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Expanded section */}
      {expandedSection && (
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
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
                  <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 border-t-slate-600 dark:border-t-slate-300 rounded-full animate-spin" />
                  Loading similar articles...
                </div>
              ) : similarArticles && similarArticles.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {similarArticles.map(similar => (
                    <button
                      key={similar.hash_id}
                      type="button"
                      onClick={() => navigate(`/articles/${similar.hash_id}`)}
                      className="flex-shrink-0 w-64 rounded-md border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 p-3 text-left hover:border-slate-300 dark:hover:border-slate-500 transition-colors"
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
