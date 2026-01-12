import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import AlignmentFeedTable from "~/components/AlignmentFeedTable";
import TopBar from "~/components/TopBar";
import { createAuthenticatedFetch } from "~/services/auth.server";
import { useMemo } from "react";
import {
  Article,
  SerializedArticle,
  deserializeArticle,
  serializeArticle,
} from "~/types/article";

export const meta: MetaFunction = () => {
  return [
    { title: "Alignment Feed" },
    {
      name: "description",
      content: "Feed of content in the alignment research dataset",
    },
  ];
};

type LoaderData = {
  initialArticles: SerializedArticle[];
  totalCount: number | null;
};

export const loader = async ({
  request,
  context,
}: LoaderFunctionArgs): Promise<ReturnType<typeof json<LoaderData>>> => {
  const apiBaseURL = context.cloudflare.env.ALIGNMENT_FEED_BASE_URL;
  const sessionSecret = context.cloudflare.env.AUTH_SESSION_SECRET;

  // Create an authenticated fetch function for this request
  const authFetch = await createAuthenticatedFetch(request, sessionSecret);

  // Fetch the first page of articles server-side
  const apiParams = new URLSearchParams();
  apiParams.set("page", "1");
  apiParams.set("page_size", "100");

  const response = await authFetch(
    `${apiBaseURL}/v1/articles?${apiParams.toString()}`
  );

  if (!response.ok) {
    console.error(
      `[Index Loader] Failed to fetch articles: ${response.status} ${response.statusText}`
    );
    // Return empty data on error - the client-side will retry
    return json({ initialArticles: [], totalCount: null });
  }

  const { data } = (await response.json()) as { data: unknown[] };

  const articles = data.map((item: unknown): Article => {
    if (typeof item !== "object" || item === null) {
      throw new Error("item is not object");
    }
    return Article.parse(item);
  });

  const serializedArticles = articles.map(serializeArticle);

  // If we got fewer than 100 articles, we know the total count
  const totalCount = articles.length < 100 ? articles.length : null;

  return json({ initialArticles: serializedArticles, totalCount });
};

export default function Index() {
  const { initialArticles: serializedArticles, totalCount } =
    useLoaderData<LoaderData>();

  // Deserialize articles - stable reference as long as loader data doesn't change
  const initialArticles = useMemo(
    () => serializedArticles.map(deserializeArticle),
    [serializedArticles]
  );

  return (
    <div className="h-screen w-full flex flex-col space-y-4 pb-5">
      <TopBar />
      <div className="text-xl font-medium text-black dark:text-white px-5">
        A feed of all content in the{" "}
        <a
          href="https://github.com/StampyAI/alignment-research-dataset"
          className="text-emerald-500 hover:underline"
        >
          Alignment Research Dataset
        </a>
        , updated every day.
      </div>
      <div className="grow px-5">
        <AlignmentFeedTable
          initialArticles={initialArticles}
          initialTotalCount={totalCount}
        />
      </div>
      <div className="text-xl font-medium text-black dark:text-white px-5">
        An RSS feed of new items coming into this dataset is available{" "}
        <a
          href="https://alignmentfeed.beshir.org/rss"
          className="text-emerald-500 hover:underline"
        >
          here
        </a>
        .
      </div>
    </div>
  );
}
