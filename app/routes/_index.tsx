import type {LoaderFunction, MetaFunction} from "@remix-run/cloudflare";
import {useLoaderData} from "@remix-run/react";
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import {GetRowIdParams, IDatasource} from "ag-grid-community";
import {AgGridReact} from "ag-grid-react";
import {useCallback} from "react";
import {z} from "zod";

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


const Article = z.object({
  hash_id: z.string(),
  title: z.string(),
  link: z.string(),
  text_start: z.string(),
  authors: z.string(),
  source: z.string(),
  published_at: z.string().datetime().pipe(z.coerce.date()),
});

type Article = z.infer<typeof Article>;

export const loader: LoaderFunction = async ({ context }): Promise<LoaderData> => {
  return { apiBaseURL: context.cloudflare.env.ALIGNMENT_FEED_BASE_URL};
};

function MakeLinkCellRenderer(baseCellRenderer: any) {
  return (props: any) => {
    if (props.data === undefined) {
      return "";
    }

    return (
        <a href={props.data.link} target='_blank' style={{height: '100%', width: '100%', display:'inline-block'}}>
          {baseCellRenderer(props)}
        </a>
    );
  }
}

export default function Index() {
  const { apiBaseURL } = useLoaderData<LoaderData>();

  const columnDefs = [
    { flex: 3, field: 'title', cellRenderer: MakeLinkCellRenderer((props: any) => {
        return props.value || "";
      })
    },
    { flex: 2, field: 'authors', cellRenderer: MakeLinkCellRenderer((props: any) => {
        return props.value || "";
      })
    },
    { flex: 1, field: 'source', cellRenderer: MakeLinkCellRenderer((props: any) => {
        return props.value || "";
      })
    },
    { flex: 1, field: 'published_at', cellRenderer: MakeLinkCellRenderer((props: any) => {
        return props.value?.toLocaleString() || "";
      })
    },
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

        return Article.parse(item);
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