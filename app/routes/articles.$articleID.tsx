import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import {
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import { TopBar } from "~/components/TopBar";
import { ArticleInfo } from "~/components/ArticleInfo";
import { ArticleGrid } from "~/components/ArticleGrid";
import { useArticleFeedbackHandlers } from "~/hooks/useArticleFeedbackHandlers";
import { createAuthenticatedFetch } from "~/server/auth.server";
import {
  type Article,
  ArticleSchema,
  parseArticlesResponse,
} from "~/schemas/article";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const title = data?.article?.title ?? "Article";
  return [
    { title: `${title} - Alignment Feed` },
    {
      name: "description",
      content: "Similar articles in the alignment research dataset",
    },
  ];
};

type LoaderData = {
  article: Article;
  similarArticles: Article[];
};

export const loader = async ({
  params,
  request,
  context,
}: LoaderFunctionArgs): Promise<ReturnType<typeof json<LoaderData>>> => {
  const articleID = params.articleID;
  if (!articleID) {
    throw new Response("Article ID is required", { status: 400 });
  }

  const apiBaseURL = context.cloudflare.env.ALIGNMENT_FEED_BASE_URL;

  // Create an authenticated fetch function for this request
  const { authFetch } = await createAuthenticatedFetch(request, context);

  // Fetch article and similar articles in parallel
  const [articleResponse, similarResponse] = await Promise.all([
    authFetch(`${apiBaseURL}/v1/articles/${encodeURIComponent(articleID)}`),
    authFetch(
      `${apiBaseURL}/v1/articles/${encodeURIComponent(articleID)}/similar`
    ),
  ]);

  // Handle article fetch errors
  if (!articleResponse.ok) {
    if (articleResponse.status === 404) {
      throw new Response("Article not found", { status: 404 });
    }
    throw new Response(
      `Failed to fetch article: ${articleResponse.statusText}`,
      { status: articleResponse.status }
    );
  }

  const articleData = await articleResponse.json();
  const article = ArticleSchema.parse(articleData);

  // Handle similar articles - don't fail if this request fails
  let similarArticles: Article[] = [];
  if (similarResponse.ok) {
    const similarJson = await similarResponse.json();
    const parsedResponse = parseArticlesResponse(similarJson);
    if (parsedResponse.success) {
      similarArticles = parsedResponse.data.data;
    }
  }

  return json({ article, similarArticles });
};

export default function ArticleDetails() {
  const { article, similarArticles } = useLoaderData<LoaderData>();

  // Shared feedback handlers (no local state update for detail page)
  const { handleThumbsUp, handleThumbsDown, handleMarkAsRead } =
    useArticleFeedbackHandlers();

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-brand-bg-dark">
      <TopBar />

      <main>
        {/* Article Header */}
        <div className="max-w-4xl mx-auto px-6 pt-12 pb-8">
          <a
            href="/"
            className="block text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 mb-6"
          >
            ← Back to feed
          </a>
          <ArticleInfo
            article={article}
            onThumbsUp={handleThumbsUp}
            onThumbsDown={handleThumbsDown}
          />
        </div>

        {/* Similar Articles Section */}
        {similarArticles.length > 0 && (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
              Similar Articles
            </h2>
            <ArticleGrid
              articles={similarArticles}
              isLoading={false}
              onThumbsUp={handleThumbsUp}
              onThumbsDown={handleThumbsDown}
              onMarkAsRead={handleMarkAsRead}
              emptyMessage="No similar articles found"
            />
          </div>
        )}
      </main>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-brand-bg-dark">
      <TopBar />

      <main>
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-6">
          {isRouteErrorResponse(error) ? (
            <>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                {error.status === 404
                  ? "Article Not Found"
                  : `Error ${error.status}`}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
                {error.status === 404
                  ? "The article you're looking for doesn't exist or may have been removed."
                  : error.data ||
                    "Something went wrong while loading this article."}
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Something went wrong
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
                We encountered an unexpected error. Please try again later.
              </p>
            </>
          )}
          <a
            href="/"
            className="mt-8 px-6 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-md hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            Return to home
          </a>
        </div>
      </main>
    </div>
  );
}
