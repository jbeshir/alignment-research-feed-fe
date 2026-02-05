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
    { title: "Unreviewed - Alignment Feed" },
    {
      name: "description",
      content: "Articles you haven't reviewed yet.",
    },
    { property: "og:title", content: "Unreviewed - Alignment Feed" },
    {
      property: "og:description",
      content: "Articles you haven't reviewed yet.",
    },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Alignment Feed" },
    { name: "twitter:card", content: "summary" },
  ];
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  return fetchArticlesFromApi(request, context, {
    endpoint: "/v1/articles/unreviewed",
    params: createPaginationParams(),
    requireAuth: true,
    label: "unreviewed articles",
  });
};

export default function Unreviewed() {
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
  } = useUserArticles("unreviewed", { initialArticles });

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
            <Tabs tabs={MAIN_TABS} activeTab="unreviewed" />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {showLoginPrompt ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-4">
                Log in to see your unreviewed articles.
              </p>
              <Link to="/auth/login">
                <Button variant="primary" type="button">
                  Log In to See Unreviewed Articles
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
                emptyMessage="No unreviewed articles. You've reviewed everything!"
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
