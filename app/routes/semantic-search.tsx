import { useState, useCallback } from "react";
import type { MetaFunction } from "@remix-run/cloudflare";
import { TopBar } from "~/components/TopBar";
import { HeroHeader } from "~/components/HeroHeader";
import { ArticleGrid } from "~/components/ArticleGrid";
import { Tabs } from "~/components/ui/Tabs";
import { Button } from "~/components/ui/Button";
import { MAIN_TABS } from "~/constants/navigation";
import { useArticleFeedbackHandlers } from "~/hooks/useArticleFeedbackHandlers";
import { parseArticlesResponse, type Article } from "~/schemas/article";

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

  const { handleThumbsUp, handleThumbsDown, handleMarkAsRead } =
    useArticleFeedbackHandlers({ setArticles });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = text.trim();
      if (!trimmed) return;

      setIsLoading(true);
      setError(null);
      setHasSearched(true);

      try {
        const response = await fetch("/api/articles/semantic-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed, limit: 20 }),
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
    },
    [text]
  );

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-brand-bg-dark">
      <TopBar />

      <main>
        <HeroHeader showSearch={false} />

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 pt-8">
          <Tabs tabs={MAIN_TABS} activeTab="semantic-search" />
        </div>

        {/* Search Input */}
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste a snippet, abstract, or topic description to find related research..."
              rows={4}
              className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-brand-dark dark:text-brand-light px-4 py-3 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-dark dark:focus:ring-brand-light resize-y"
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
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
            </div>
          ) : (
            <ArticleGrid
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
            />
          )}
        </div>
      </main>
    </div>
  );
}
