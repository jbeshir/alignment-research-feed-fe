import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { useAuth } from "~/root";
import { TopBar } from "~/components/TopBar";
import { HeroHeader } from "~/components/HeroHeader";
import { ArticleGrid } from "~/components/ArticleGrid";
import { Tabs } from "~/components/ui/Tabs";
import { Button } from "~/components/ui/Button";
import { MAIN_TABS } from "~/constants/navigation";
import { useRecommended } from "~/hooks/useRecommended";
import { useArticleFeedbackHandlers } from "~/hooks/useArticleFeedbackHandlers";

export const meta: MetaFunction = () => {
  return [
    { title: "Recommended - Alignment Feed" },
    {
      name: "description",
      content: "Personalized AI Safety research recommendations.",
    },
  ];
};

export default function Recommended() {
  const { isAuthenticated } = useAuth();

  const { articles, isLoading, error } = useRecommended();

  // Shared feedback handlers (no local state update for recommended)
  const { handleThumbsUp, handleThumbsDown, handleMarkAsRead } =
    useArticleFeedbackHandlers();

  // Show login prompt when not authenticated
  const showLoginPrompt = !isAuthenticated;

  return (
    <div className="min-h-screen bg-brand-bg">
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
              <p className="text-slate-600 text-lg mb-4">
                Log in to see personalized recommendations based on your interests.
              </p>
              <Link to="/auth/login">
                <Button variant="primary" type="button">
                  Log In to See Recommendations
                </Button>
              </Link>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <p className="text-red-600 text-lg mb-2">
                Failed to load recommendations
              </p>
              <p className="text-slate-500 text-sm">
                {error.message}
              </p>
            </div>
          ) : (
            <ArticleGrid
              articles={articles}
              isLoading={isLoading}
              onThumbsUp={handleThumbsUp}
              onThumbsDown={handleThumbsDown}
              onMarkAsRead={handleMarkAsRead}
              emptyMessage="No recommendations yet. Like some articles to get personalized suggestions!"
            />
          )}
        </div>
      </main>
    </div>
  );
}
