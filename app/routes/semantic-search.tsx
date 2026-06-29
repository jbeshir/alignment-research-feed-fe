import { useState, useCallback, useRef } from "react";
import type { MetaFunction } from "@remix-run/cloudflare";
import { TopBar } from "~/components/layout/TopBar";
import { HeroHeader } from "~/components/layout/HeroHeader";
import { ArticleFeed } from "~/components/article/ArticleFeed";
import { ViewToggle } from "~/components/layout/ViewToggle";
import { Tabs } from "~/components/ui/Tabs";
import { Button } from "~/components/ui/Button";
import { MAIN_TABS } from "~/constants/navigation";
import { useArticleFeedbackHandlers } from "~/hooks/useArticleFeedbackHandlers";
import { useViewPreference } from "~/hooks/useViewPreference";
import { parseArticlesResponse, type Article } from "~/schemas/article";
import { EmptyState, ErrorState } from "~/components/feedback";
import { SearchIcon, SparklesIcon } from "~/components/layout/Icons";

export const meta: MetaFunction = () => {
  return [
    { title: "Find Related Research - Alignment Feed" },
    {
      name: "description",
      content:
        "Find AI Safety research semantically similar to your text or topic.",
    },
    {
      property: "og:title",
      content: "Find Related Research - Alignment Feed",
    },
    {
      property: "og:description",
      content:
        "Find AI Safety research semantically similar to your text or topic.",
    },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Alignment Feed" },
    { name: "twitter:card", content: "summary" },
  ];
};

export default function SemanticSearch() {
  const [text, setText] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const lastQueryRef = useRef("");

  const [viewMode, setViewMode] = useViewPreference();

  const { handleThumbsUp, handleThumbsDown, handleMarkAsRead } =
    useArticleFeedbackHandlers({ setArticles });

  const runSearch = useCallback(async (query: string) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch("/api/articles/semantic-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: query, limit: 20 }),
      });

      if (!response.ok) {
        setError("Search failed. Please try again later.");
        setArticles([]);
        return;
      }

      const result = parseArticlesResponse(await response.json());

      if (!result.success) {
        setError("Failed to parse search results.");
        setArticles([]);
        return;
      }

      setArticles(result.data.data);
    } catch {
      setError("Search failed. Please check your connection and try again.");
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = text.trim();
      if (!trimmed) return;
      lastQueryRef.current = trimmed;
      runSearch(trimmed);
    },
    [text, runSearch]
  );

  const retry = useCallback(() => {
    if (lastQueryRef.current) runSearch(lastQueryRef.current);
  }, [runSearch]);

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-brand-bg-dark">
      <TopBar />

      <main>
        <HeroHeader showSearch={false} />

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 pt-8">
          <div className="flex items-center justify-between">
            <Tabs tabs={MAIN_TABS} activeTab="semantic-search" />
            <ViewToggle viewMode={viewMode} onChange={setViewMode} />
          </div>
        </div>

        {/* Search Input */}
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <form onSubmit={handleSubmit} className="max-w-3xl space-y-3">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste a snippet, abstract, or topic description to find related research..."
              rows={4}
              className="w-full rounded-md border border-stone-300 dark:border-slate-600 bg-stone-50 dark:bg-slate-800 text-brand-dark dark:text-brand-light px-4 py-3 text-sm placeholder:text-stone-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent dark:focus:ring-accent-dark-fg resize-y"
            />
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading || !text.trim()}
            >
              {isLoading ? "Searching..." : "Find Related Research"}
            </Button>
          </form>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {error ? (
            <ErrorState description={error} onRetry={retry} />
          ) : (
            <ArticleFeed
              viewMode={viewMode}
              articles={articles}
              isLoading={isLoading}
              onThumbsUp={handleThumbsUp}
              onThumbsDown={handleThumbsDown}
              onMarkAsRead={handleMarkAsRead}
              emptyMessage={
                hasSearched
                  ? "No related articles found for your text."
                  : "Paste text above to find similar research."
              }
              emptyState={
                hasSearched ? (
                  <EmptyState
                    icon={<SearchIcon />}
                    title="No related research found"
                    description="No semantically similar articles turned up. Try rephrasing or adding more detail."
                  />
                ) : (
                  <EmptyState
                    icon={<SparklesIcon />}
                    title="Find related research"
                    description="Paste an abstract, snippet, or topic above to discover semantically similar papers."
                  />
                )
              }
            />
          )}
        </div>
      </main>
    </div>
  );
}
