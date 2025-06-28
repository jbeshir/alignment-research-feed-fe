import type { LoaderFunction, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import ArticleTable, { Article } from "~/components/ArticleTable";
import ArticleInfo from "~/components/ArticleInfo";
import TopBar from "~/components/TopBar";
import { Auth0ContextInterface, useAuth0 } from "@auth0/auth0-react";
import { AuthenticatedFetch } from "~/utils/request";
import { useEffect, useState } from "react";
import { useApi } from "~/contexts/ApiContext";

export const meta: MetaFunction = () => {
  return [
    { title: "Alignment Feed - Similar Articles" },
    {
      name: "description",
      content: "Similar articles in the alignment research dataset",
    },
  ];
};

type LoaderData = {
  articleID: string;
};

type ArticleDetailsData = {
  article: Article;
  similarArticles: Article[];
};

export const loader: LoaderFunction = async ({
  params,
}): Promise<LoaderData> => {
  return {
    articleID: params.articleID!,
  };
};

export default function ArticleDetails() {
  const loaderData = useLoaderData<LoaderData>();
  const auth0Context = useAuth0();
  const { baseURL: apiBaseURL } = useApi();

  const [data, setData] = useState<ArticleDetailsData | null>(null);

  useEffect(() => {
    const newDataPromise = (async function () {
      const similarArticlesPromise = fetchSimilarArticles(
        apiBaseURL,
        auth0Context,
        loaderData.articleID
      );

      const articlePromise = fetchArticle(
        apiBaseURL,
        auth0Context,
        loaderData.articleID
      );

      return {
        article: await articlePromise,
        similarArticles: await similarArticlesPromise,
      };
    })();

    newDataPromise.then(newData => {
      if (newData.article && newData.similarArticles) {
        setData({
          article: newData.article,
          similarArticles: newData.similarArticles,
        });
      }
    });
  }, [loaderData, auth0Context, apiBaseURL]);

  if (!data) {
    return (
      <div className="h-screen w-full flex flex-col space-y-4 pb-5">
        <TopBar />
        <h2 className="text-1xl text-center font-medium text-black dark:text-white p-5">
          Loading...
        </h2>
      </div>
    );
  } else {
    return (
      <div className="h-screen w-full flex flex-col space-y-4 pb-5">
        <TopBar />
        <h2 className="text-3xl text-center font-medium text-black dark:text-white p-5">
          {data.article.title}
        </h2>
        <div className="px-5">
          <ArticleInfo article={data.article} />
        </div>
        <div className="text-xl font-medium text-black dark:text-white px-5">
          Articles similar to this one in the dataset.
        </div>
        <div className="grow px-5">
          <ArticleTable articles={data.similarArticles} />
        </div>
      </div>
    );
  }
}

async function fetchArticle(
  apiBaseURL: string,
  auth0Context: Auth0ContextInterface,
  articleID: string
): Promise<Article | null> {
  const apiURL = `${apiBaseURL}/v1/articles/${encodeURIComponent(articleID)}`;
  const response = await AuthenticatedFetch(new Request(apiURL), auth0Context);
  if (!response) {
    return null;
  }

  const data = await response.json();
  return Article.parse(data);
}

async function fetchSimilarArticles(
  apiBaseURL: string,
  auth0Context: Auth0ContextInterface,
  articleID: string
): Promise<Article[] | null> {
  const apiURL = `${apiBaseURL}/v1/articles/${encodeURIComponent(
    articleID
  )}/similar`;
  const req = new Request(apiURL);
  const response = await AuthenticatedFetch(req, auth0Context);
  if (!response) {
    return null;
  }

  if (response.status !== 200) {
    const responseText = await response.text();
    console.log(
      "fetching similar articles: unexpected status code [" +
        response.status +
        "]: " +
        responseText
    );
    return [];
  }
  const { data } = (await response.json()) as { data: unknown[] };

  return data.map((item: unknown): Article => {
    if (typeof item !== "object" || item === null) {
      throw new Error("item is not object");
    }

    return Article.parse(item);
  });
}
