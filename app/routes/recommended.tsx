import React, { Suspense } from "react";
import type { ReactNode } from "react";
import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, Await, useRevalidator } from "@remix-run/react";
import { TopBar } from "~/components/layout/TopBar";
import { HeroHeader } from "~/components/layout/HeroHeader";
import { ArticleFeed } from "~/components/article/ArticleFeed";
import { ViewToggle, type ViewMode } from "~/components/layout/ViewToggle";
import { Tabs } from "~/components/ui/Tabs";
import { MAIN_TABS } from "~/constants/navigation";
import { useArticleFeedbackHandlers } from "~/hooks/useArticleFeedbackHandlers";
import { useViewPreference } from "~/hooks/useViewPreference";
import {
  fetchArticlesDeferred,
  type FetchArticlesResult,
} from "~/server/articles.server";
import { RecommendationsLoading } from "~/components/article/RecommendationsLoading";
import { EmptyState, ErrorState, LoginGate } from "~/components/feedback";
import { SparklesIcon } from "~/components/layout/Icons";

export const meta: MetaFunction = () => {
  return [
    { title: "Recommended - Alignment Feed" },
    {
      name: "description",
      content: "Personalized AI Safety research recommendations.",
    },
    { property: "og:title", content: "Recommended - Alignment Feed" },
    {
      property: "og:description",
      content: "Personalized AI Safety research recommendations.",
    },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Alignment Feed" },
    { name: "twitter:card", content: "summary" },
  ];
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  return fetchArticlesDeferred(request, context, {
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
  viewMode,
  emptyState,
}: {
  articlesData: FetchArticlesResult;
  viewMode: ViewMode;
  emptyState?: ReactNode;
}) {
  const { handleThumbsUp, handleThumbsDown, handleMarkAsRead } =
    useArticleFeedbackHandlers();

  return (
    <ArticleFeed
      viewMode={viewMode}
      articles={articlesData.articles}
      isLoading={false}
      onThumbsUp={handleThumbsUp}
      onThumbsDown={handleThumbsDown}
      onMarkAsRead={handleMarkAsRead}
      emptyMessage="No recommendations yet. Like some articles to get personalized suggestions!"
      emptyState={emptyState}
    />
  );
}

export default function Recommended() {
  const { isAuthenticated, articlesData } = useLoaderData<LoaderData>();
  const [viewMode, setViewMode] = useViewPreference();
  const revalidator = useRevalidator();
  const showLoginPrompt = !isAuthenticated;

  const emptyState = (
    <EmptyState
      icon={<SparklesIcon />}
      title="No recommendations yet"
      description="Like a few articles and we'll surface related research here."
      action={{ label: "Browse the feed", to: "/" }}
    />
  );

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-brand-bg-dark">
      <TopBar />

      <main>
        <HeroHeader showSearch={false} />

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 pt-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <Tabs tabs={MAIN_TABS} activeTab="recommended" />
            <div className="flex flex-shrink-0 justify-end">
              <ViewToggle viewMode={viewMode} onChange={setViewMode} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {showLoginPrompt ? (
            <LoginGate
              icon={<SparklesIcon />}
              title="Personalised recommendations"
              description="Log in and like a few articles to get research picked for your interests."
            />
          ) : (
            <Suspense fallback={<RecommendationsLoading />}>
              <Await
                resolve={articlesData}
                errorElement={
                  <ErrorState
                    title="Couldn't load recommendations"
                    description="Something went wrong fetching your picks."
                    onRetry={() => revalidator.revalidate()}
                  />
                }
              >
                {/* Cast needed: Remix's Await type inference doesn't preserve deferred promise types */}
                {
                  ((resolved: FetchArticlesResult) => (
                    <RecommendedContent
                      articlesData={resolved}
                      viewMode={viewMode}
                      emptyState={emptyState}
                    />
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
