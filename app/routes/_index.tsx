import type {LoaderFunction, MetaFunction} from "@remix-run/cloudflare";
import {json, useLoaderData} from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    {
      name: "description",
      content: "Welcome to Remix on Cloudflare!",
    },
  ];
};

type LoaderData = {
  ok: boolean;
  articles: Article[];
}

type Article = {
  hash_id: string;
  title: string;
  link: string;
  text_start: string;
  authors: string;
  source: string;
  published_at: Date;
}

export const loader: LoaderFunction = async ({ context }): Promise<LoaderData> => {
  const response = await fetch(context.cloudflare.env.ALIGNMENT_FEED_BASE_URL + "/v1/articles");

  if (!response.ok) {
    return { ok: false, articles: []};
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    return { ok: false, articles: []};
  }


  try {
    const articles = data.map((item: unknown): Article => {
      if (typeof item !== 'object' || item === null) {
        throw new Error("item is not object")
      }

      item.published_at = new Date(item.published_at);
      return item as Article;
    });

    return { ok: true, articles: articles };
  } catch {
    return { ok: false, articles: []};
  }
};

export default function Index() {
  const { articles} = useLoaderData<LoaderData>();

  return (
      <div className="font-sans p-4">
        <h1 className="text-3xl">Welcome to Remix on Cloudflare</h1>
        <ul>
          {articles.map(article => (
              <li key={article.hash_id}>{article.title}</li>
          ))}
        </ul>
      </div>
  );
}
