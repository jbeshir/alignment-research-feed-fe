import type {LoaderFunction, MetaFunction} from "@remix-run/cloudflare";
import {useLoaderData} from "@remix-run/react";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import {GetRowIdParams, IDatasource} from "ag-grid-community";
import {AgGridReact} from "ag-grid-react";
import {useCallback} from "react";

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
  apiBaseURL: string;
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
  return { apiBaseURL: context.cloudflare.env.ALIGNMENT_FEED_BASE_URL};
};

export default function Index() {
  const { apiBaseURL } = useLoaderData<LoaderData>();

  const columnDefs = [
    { field: 'title', flex: 3 },
    { field: 'authors', flex: 2 },
    { field: 'source', flex: 1 },
    { field: 'published_at', valueFormatter: (params: any) => params.value?.toLocaleString() || "", flex: 1 },
  ]

  const dataSource: IDatasource = {
    getRows: async (params) => {
      const page = Math.floor(params.startRow / 100) + 1;
      const pageSize = 100;  // We're using a fixed page size of 100 for this example

      const apiParams = new URLSearchParams();
      apiParams.set('page', page.toString());
      apiParams.set('page_size', pageSize.toString());
      const apiURL = `${apiBaseURL}/v1/articles?${apiParams.toString()}`
      const response = await fetch(apiURL);
      const { data, metadata } = await response.json();

      const articles = data.map((item: unknown): Article => {
        if (typeof item !== 'object' || item === null) {
          throw new Error("item is not object")
        }

        item.published_at = new Date(item.published_at);
        return item as Article;
      });

      params.successCallback(articles, metadata.total_rows);
    }
  };

  const getRowId = useCallback((params: GetRowIdParams) => {
    return params.data.hash_id;
  }, []);

  return (
      <div className="ag-theme-quartz-auto-dark" style={{height: '100vh', width: '100%'}}>
        <AgGridReact
            columnDefs={columnDefs}
            rowModelType='infinite'
            cacheBlockSize={100}
            datasource={dataSource}
            getRowId={getRowId}
            pagination={true}
            paginationAutoPageSize={true}
            maxConcurrentDatasourceRequests={1}
            maxBlocksInCache={10}
        />
      </div>
  );
}