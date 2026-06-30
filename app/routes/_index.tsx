import { useState, useCallback } from "react";
import {
  useSearchParams,
  useLoaderData,
  useRevalidator,
} from "@remix-run/react";
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { TopBar } from "~/components/layout/TopBar";
import { HeroHeader } from "~/components/layout/HeroHeader";
import { ArticleFeed } from "~/components/article/ArticleFeed";
import { ViewToggle } from "~/components/layout/ViewToggle";
import { Tabs } from "~/components/ui/Tabs";
import { MAIN_TABS } from "~/constants/navigation";
import { useArticles } from "~/hooks/useArticles";
import { useArticleFeedbackHandlers } from "~/hooks/useArticleFeedbackHandlers";
import { useInfiniteScroll } from "~/hooks/useInfiniteScroll";
import { useViewPreference } from "~/hooks/useViewPreference";
import { createAuthenticatedFetch } from "~/server/auth.server";
import { parseArticlesResponse, type Article } from "~/schemas/article";
import { EmptyState, ErrorState } from "~/components/feedback";
import { SearchIcon, InboxIcon } from "~/components/layout/Icons";

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

// Error strategy convention: list route loaders return json({error, ...partial data}) so the
// page can render with whatever data is available. Detail route loaders (e.g. articles.$articleID)
// throw Response so Remix's ErrorBoundary handles the failure instead.
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
    refetch,
    error: fetchError,
  } = useArticles(searchQuery, { initialArticles });

  // Combine loader and fetch errors
  const error = loaderError ?? fetchError?.message;

  const revalidator = useRevalidator();
  const handleRetry = useCallback(() => {
    revalidator.revalidate();
    refetch();
  }, [revalidator, refetch]);

  // Shared feedback handlers with optimistic updates
  const { handleThumbsUp, handleThumbsDown, handleMarkAsRead } =
    useArticleFeedbackHandlers({ setArticles });

  // Infinite scroll
  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
  });

  const [viewMode, setViewMode] = useViewPreference();

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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <Tabs tabs={MAIN_TABS} activeTab="all" />
            <div className="flex flex-shrink-0 justify-end">
              <ViewToggle viewMode={viewMode} onChange={setViewMode} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {error && articles.length === 0 ? (
            <ErrorState description={error} onRetry={handleRetry} />
          ) : (
            <>
              <ArticleFeed
                viewMode={viewMode}
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
                emptyState={
                  searchQuery ? (
                    <EmptyState
                      icon={<SearchIcon />}
                      title={`No results for "${searchQuery}"`}
                      description="Try a different keyword, or clear the search to see the full feed."
                      action={{
                        label: "Clear search",
                        onClick: () => handleSearch(""),
                      }}
                    />
                  ) : (
                    <EmptyState
                      icon={<InboxIcon />}
                      title="No articles yet"
                      description="New AI-safety research will appear here as it's published."
                    />
                  )
                }
              />

              {/* Infinite scroll sentinel - always rendered to avoid layout shifts */}
              {hasMore && (
                <div ref={sentinelRef} className="h-10" aria-hidden="true" />
              )}

              {/* End of results indicator */}
              {!hasMore && articles.length > 0 && (
                <div className="text-center py-8 text-slate-600 dark:text-slate-300">
                  You’ve reached the end of the results.
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
