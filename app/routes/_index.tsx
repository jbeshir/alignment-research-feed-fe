import type {LoaderFunction, MetaFunction} from "@remix-run/cloudflare";
import {useLoaderData} from "@remix-run/react";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {ColDef} from "ag-grid-community";

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

  const body = await response.json();
  const data = body.data;
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

  const columnDefs = [
    { field: 'hash_id' },
    { field: 'title' },
    { field: 'published_at', valueFormatter: (params: any) => params.value.toLocaleString() },
  ]

  return (
      <div className="ag-theme-alpine" style={{height: 400, width: '100%'}}>
        <AgGridReact
            rowData={articles}
            columnDefs={columnDefs}
            domLayout='autoHeight'
        />
        Tit
      </div>
  );
}
