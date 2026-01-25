import React, { Suspense } from "react";
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Link, useLoaderData, Await } from "@remix-run/react";
import { useAuth } from "~/root";
import { TopBar } from "~/components/TopBar";
import { HeroHeader } from "~/components/HeroHeader";
import { ArticleGrid } from "~/components/ArticleGrid";
import { Tabs } from "~/components/ui/Tabs";
import { Button } from "~/components/ui/Button";
import { MAIN_TABS } from "~/constants/navigation";
import { useArticleFeedbackHandlers } from "~/hooks/useArticleFeedbackHandlers";
import {
  fetchArticlesDeferred,
  type FetchArticlesResult,
} from "~/server/articles.server";
import { RecommendationsLoading } from "~/components/RecommendationsLoading";

export const meta: MetaFunction = () => {
  return [
    { title: "Recommended - Alignment Feed" },
    {
      name: "description",
      content: "Personalized AI Safety research recommendations.",
    },
  ];
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  return fetchArticlesDeferred(request, context.cloudflare.env, {
    endpoint: "/v1/articles/recommended",
    requireAuth: true,
    label: "recommended articles",
  });
};

// Explicit type for deferred loader data - avoids complex Remix type inference
type LoaderData = {
  isAuthenticated: boolean;
  articlesData: Promise<FetchArticlesResult>;
};

function RecommendedContent({
  articlesData,
}: {
  articlesData: FetchArticlesResult;
}) {
  const { handleThumbsUp, handleThumbsDown, handleMarkAsRead } =
    useArticleFeedbackHandlers();

  return (
    <ArticleGrid
      articles={articlesData.articles}
      isLoading={false}
      onThumbsUp={handleThumbsUp}
      onThumbsDown={handleThumbsDown}
      onMarkAsRead={handleMarkAsRead}
      emptyMessage="No recommendations yet. Like some articles to get personalized suggestions!"
    />
  );
}

export default function Recommended() {
  const { isAuthenticated: loaderAuthenticated, articlesData } =
    useLoaderData<LoaderData>();
  const { isAuthenticated: clientAuthenticated } = useAuth();

  const isAuthenticated = loaderAuthenticated || clientAuthenticated;
  const showLoginPrompt = !isAuthenticated;

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-brand-bg-dark">
      <TopBar />

      <main>
        <HeroHeader showSearch={false} />

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 pt-8">
          <div className="flex items-center justify-between">
            <Tabs tabs={MAIN_TABS} activeTab="recommended" />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {showLoginPrompt ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-4">
                Log in to see personalized recommendations based on your
                interests.
              </p>
              <Link to="/auth/login">
                <Button variant="primary" type="button">
                  Log In to See Recommendations
                </Button>
              </Link>
            </div>
          ) : (
            <Suspense fallback={<RecommendationsLoading />}>
              <Await
                resolve={articlesData}
                errorElement={
                  <div className="flex flex-col items-center justify-center py-16 px-4">
                    <p className="text-red-600 dark:text-red-400 text-lg">
                      Failed to load recommendations. Please try again later.
                    </p>
                  </div>
                }
              >
                {/* Cast needed: Remix's Await type inference doesn't preserve deferred promise types */}
                {
                  ((resolved: FetchArticlesResult) => (
                    <RecommendedContent articlesData={resolved} />
                  )) as (value: unknown) => React.ReactNode
                }
              </Await>
            </Suspense>
          )}
        </div>
      </main>
    </div>
  );
}
