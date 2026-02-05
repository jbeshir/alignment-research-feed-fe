import { useState, useCallback } from "react";
import { useSearchParams, useLoaderData } from "@remix-run/react";
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { TopBar } from "~/components/TopBar";
import { HeroHeader } from "~/components/HeroHeader";
import { ArticleGrid } from "~/components/ArticleGrid";
import { Tabs } from "~/components/ui/Tabs";
import { MAIN_TABS } from "~/constants/navigation";
import { useArticles } from "~/hooks/useArticles";
import { useArticleFeedbackHandlers } from "~/hooks/useArticleFeedbackHandlers";
import { useInfiniteScroll } from "~/hooks/useInfiniteScroll";
import { createAuthenticatedFetch } from "~/server/auth.server";
import { parseArticlesResponse, type Article } from "~/schemas/article";

export const meta: MetaFunction = () => {
  return [
    { title: "Alignment Feed - AI Safety Research" },
    {
      name: "description",
      content: "Your personalised AI Safety research feed.",
    },
    { property: "og:title", content: "Alignment Feed - AI Safety Research" },
    {
      property: "og:description",
      content: "Your personalised AI Safety research feed.",
    },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Alignment Feed" },
    { name: "twitter:card", content: "summary" },
  ];
};

type LoaderData = {
  initialArticles: Article[];
  initialSearchQuery: string;
  error?: string;
};

export const loader = async ({
  request,
  context,
}: LoaderFunctionArgs): Promise<ReturnType<typeof json<LoaderData>>> => {
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get("q") || "";

  const apiBaseURL = context.cloudflare.env.ALIGNMENT_FEED_BASE_URL;

  try {
    const { authFetch } = await createAuthenticatedFetch(request, context);

    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("page_size", "20");
    params.set("sort", "published_at_desc");
    if (searchQuery) {
      params.set("filter_title_fulltext", searchQuery);
    }

    const response = await authFetch(`${apiBaseURL}/v1/articles?${params}`);

    if (!response.ok) {
      console.error("Failed to fetch initial articles:", response.status);
      return json({
        initialArticles: [],
        initialSearchQuery: searchQuery,
        error: "Failed to load articles. Please try again later.",
      });
    }

    const result = parseArticlesResponse(await response.json());

    if (!result.success) {
      console.error("Failed to parse articles response:", result.error);
      return json({
        initialArticles: [],
        initialSearchQuery: searchQuery,
        error:
          "Failed to load articles. The server returned an unexpected response.",
      });
    }

    return json({
      initialArticles: result.data.data,
      initialSearchQuery: searchQuery,
    });
  } catch (error) {
    console.error("Error fetching initial articles:", error);
    return json({
      initialArticles: [],
      initialSearchQuery: searchQuery,
      error:
        "Failed to load articles. Please check your connection and try again.",
    });
  }
};

export default function Index() {
  const {
    initialArticles,
    initialSearchQuery,
    error: loaderError,
  } = useLoaderData<LoaderData>();

  const [searchParams, setSearchParams] = useSearchParams();

  // Search query state (for controlled input with debouncing)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

  // Hooks for data fetching
  const {
    articles,
    isLoading,
    hasMore,
    loadMore,
    setArticles,
    error: fetchError,
  } = useArticles(searchQuery, { initialArticles });

  // Combine loader and fetch errors
  const error = loaderError ?? fetchError?.message;

  // Shared feedback handlers with optimistic updates
  const { handleThumbsUp, handleThumbsDown, handleMarkAsRead } =
    useArticleFeedbackHandlers({ setArticles });

  // Infinite scroll
  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
  });

  // Handle search - update URL with search query
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      const params = new URLSearchParams(searchParams);
      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      setSearchParams(params, { preventScrollReset: true });
    },
    [searchParams, setSearchParams]
  );

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-brand-bg-dark">
      <TopBar />

      <main>
        <HeroHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearch={handleSearch}
        />

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 pt-8">
          <Tabs tabs={MAIN_TABS} activeTab="all" />
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {error && articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
            </div>
          ) : (
            <>
              <ArticleGrid
                articles={articles}
                isLoading={isLoading}
                onThumbsUp={handleThumbsUp}
                onThumbsDown={handleThumbsDown}
                onMarkAsRead={handleMarkAsRead}
                emptyMessage={
                  searchQuery
                    ? `No articles found for "${searchQuery}"`
                    : "No articles found"
                }
              />

              {/* Infinite scroll sentinel - always rendered to avoid layout shifts */}
              {hasMore && (
                <div ref={sentinelRef} className="h-10" aria-hidden="true" />
              )}

              {/* End of results indicator */}
              {!hasMore && articles.length > 0 && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  You&apos;ve reached the end of the results.
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
