import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { TopBar } from "~/components/layout/TopBar";
import { HeroHeader } from "~/components/layout/HeroHeader";
import { ArticleFeed } from "~/components/article/ArticleFeed";
import { ViewToggle } from "~/components/layout/ViewToggle";
import { Tabs } from "~/components/ui/Tabs";
import { MAIN_TABS } from "~/constants/navigation";
import { useArticleFeedbackHandlers } from "~/hooks/useArticleFeedbackHandlers";
import { useUserArticles } from "~/hooks/useUserArticles";
import { useInfiniteScroll } from "~/hooks/useInfiniteScroll";
import { useViewPreference } from "~/hooks/useViewPreference";
import {
  fetchArticlesFromApi,
  createPaginationParams,
} from "~/server/articles.server";
import { EmptyState, ErrorState, LoginGate } from "~/components/feedback";
import { ThumbsUpIcon } from "~/components/layout/Icons";

export const meta: MetaFunction = () => {
  return [
    { title: "Liked - Alignment Feed" },
    {
      name: "description",
      content: "Articles you've liked.",
    },
    { property: "og:title", content: "Liked - Alignment Feed" },
    { property: "og:description", content: "Articles you've liked." },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Alignment Feed" },
    { name: "twitter:card", content: "summary" },
  ];
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  return fetchArticlesFromApi(request, context, {
    endpoint: "/v1/articles/liked",
    params: createPaginationParams(),
    requireAuth: true,
    label: "liked articles",
  });
};

export default function Liked() {
  const {
    articles: initialArticles,
    isAuthenticated,
    error: loaderError,
  } = useLoaderData<typeof loader>();

  const {
    articles,
    isLoading,
    hasMore,
    loadMore,
    setArticles,
    refetch,
    error: fetchError,
  } = useUserArticles("liked", { initialArticles });

  const { handleThumbsUp, handleThumbsDown, handleMarkAsRead } =
    useArticleFeedbackHandlers({ setArticles });

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
  });

  const [viewMode, setViewMode] = useViewPreference();
  const revalidator = useRevalidator();

  const showLoginPrompt = !isAuthenticated;
  const error = loaderError ?? fetchError?.message;
  const handleRetry = () => {
    revalidator.revalidate();
    refetch();
  };

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-brand-bg-dark">
      <TopBar />

      <main>
        <HeroHeader showSearch={false} />

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 pt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <Tabs tabs={MAIN_TABS} activeTab="liked" />
            <div className="flex flex-shrink-0 justify-end">
              <ViewToggle viewMode={viewMode} onChange={setViewMode} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {showLoginPrompt ? (
            <LoginGate
              icon={<ThumbsUpIcon />}
              title="Your liked articles"
              description="Log in to keep a personal library of the research you've liked."
            />
          ) : error ? (
            <ErrorState description={error} onRetry={handleRetry} backTo="/" />
          ) : (
            <>
              <ArticleFeed
                viewMode={viewMode}
                articles={articles}
                isLoading={isLoading}
                onThumbsUp={handleThumbsUp}
                onThumbsDown={handleThumbsDown}
                onMarkAsRead={handleMarkAsRead}
                emptyMessage="No liked articles yet. Like some articles to see them here!"
                emptyState={
                  <EmptyState
                    icon={<ThumbsUpIcon />}
                    title="No liked articles yet"
                    description="Like an article and it'll collect here for easy reference."
                    action={{ label: "Browse the feed", to: "/" }}
                  />
                }
              />

              {hasMore && (
                <div ref={sentinelRef} className="h-10" aria-hidden="true" />
              )}

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
