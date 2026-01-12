import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import {
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import ArticleTable from "~/components/ArticleTable";
import ArticleInfo from "~/components/ArticleInfo";
import TopBar from "~/components/TopBar";
import { createAuthenticatedFetch } from "~/services/auth.server";
import { useMemo } from "react";
import {
  Article,
  SerializedArticle,
  deserializeArticle,
  serializeArticle,
} from "~/types/article";

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
  article: SerializedArticle;
  similarArticles: SerializedArticle[];
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
  const sessionSecret = context.cloudflare.env.AUTH_SESSION_SECRET;

  // Create an authenticated fetch function for this request
  const authFetch = await createAuthenticatedFetch(request, sessionSecret);

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
  const article = Article.parse(articleData);

  // Handle similar articles - don't fail if this request fails
  let similarArticles: Article[] = [];
  if (similarResponse.ok) {
    const similarJson = await similarResponse.json();
    const { data } = similarJson as { data: unknown[] };
    if (data && Array.isArray(data)) {
      similarArticles = data.map((item: unknown): Article => {
        if (typeof item !== "object" || item === null) {
          throw new Error("Similar article item is not an object");
        }
        return Article.parse(item);
      });
    }
  }

  return json({
    article: serializeArticle(article),
    similarArticles: similarArticles.map(serializeArticle),
  });
};

export default function ArticleDetails() {
  const loaderData = useLoaderData<LoaderData>();

  // Deserialize articles back to proper types with Date objects
  const article = useMemo(
    () => deserializeArticle(loaderData.article),
    [loaderData.article]
  );
  const similarArticles = useMemo(
    () => loaderData.similarArticles.map(deserializeArticle),
    [loaderData.similarArticles]
  );

  return (
    <div className="h-screen w-full flex flex-col space-y-4 pb-5">
      <TopBar />
      <h2 className="text-3xl text-center font-medium text-black dark:text-white p-5">
        {article.title}
      </h2>
      <div className="px-5">
        <ArticleInfo article={article} />
      </div>
      <div className="text-xl font-medium text-black dark:text-white px-5">
        Articles similar to this one in the dataset.
      </div>
      <div className="grow px-5">
        <ArticleTable articles={similarArticles} />
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div className="h-screen w-full flex flex-col space-y-4 pb-5">
      <TopBar />
      <div className="flex flex-col items-center justify-center flex-grow p-5">
        {isRouteErrorResponse(error) ? (
          <>
            <h2 className="text-3xl font-medium text-black dark:text-white mb-4">
              {error.status === 404
                ? "Article Not Found"
                : `Error ${error.status}`}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {error.status === 404
                ? "The article you're looking for doesn't exist or may have been removed."
                : error.data ||
                  "Something went wrong while loading this article."}
            </p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-medium text-black dark:text-white mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              We encountered an unexpected error. Please try again later.
            </p>
          </>
        )}
        <a href="/" className="mt-6 text-emerald-500 hover:underline">
          Return to home
        </a>
      </div>
    </div>
  );
}
