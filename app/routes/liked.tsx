import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { TopBar } from "~/components/TopBar";
import { HeroHeader } from "~/components/HeroHeader";
import { ArticleGrid } from "~/components/ArticleGrid";
import { Tabs } from "~/components/ui/Tabs";
import { Button } from "~/components/ui/Button";
import { MAIN_TABS } from "~/constants/navigation";
import { useArticleFeedbackHandlers } from "~/hooks/useArticleFeedbackHandlers";
import { useUserArticles } from "~/hooks/useUserArticles";
import { useInfiniteScroll } from "~/hooks/useInfiniteScroll";
import {
  fetchArticlesFromApi,
  createPaginationParams,
} from "~/server/articles.server";

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
    error: fetchError,
  } = useUserArticles("liked", { initialArticles });

  const { handleThumbsUp, handleThumbsDown, handleMarkAsRead } =
    useArticleFeedbackHandlers({ setArticles });

  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
  });

  const showLoginPrompt = !isAuthenticated;
  const error = loaderError ?? fetchError?.message;

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-brand-bg-dark">
      <TopBar />

      <main>
        <HeroHeader showSearch={false} />

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 pt-8">
          <div className="flex items-center justify-between">
            <Tabs tabs={MAIN_TABS} activeTab="liked" />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {showLoginPrompt ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-4">
                Log in to see your liked articles.
              </p>
              <Link to="/auth/login">
                <Button variant="primary" type="button">
                  Log In to See Liked Articles
                </Button>
              </Link>
            </div>
          ) : error ? (
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
                emptyMessage="No liked articles yet. Like some articles to see them here!"
              />

              {hasMore && (
                <div ref={sentinelRef} className="h-10" aria-hidden="true" />
              )}

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
