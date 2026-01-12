import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import {
  ModuleRegistry,
  GetRowIdParams,
  ColDef,
  ICellRendererParams,
} from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { Link } from "@remix-run/react";
import { useAuth0 } from "@auth0/auth0-react";
import { useCallback } from "react";

import ArticleLink from "~/components/ArticleLink";
import { useApi } from "~/contexts/ApiContext";
import { AuthenticatedFetch } from "~/utils/request";
import {
  ThumbsUpIcon,
  ThumbsDownIcon,
  CheckCircleIcon,
} from "~/components/Icons";
import { Article } from "~/types/article";

// Register module once at module level (not inside component)
ModuleRegistry.registerModules([ClientSideRowModelModule]);

type ArticleTableProps = {
  articles: Article[];
};

const FeedbackCell = (props: ICellRendererParams<Article>) => {
  const { data } = props;
  const auth0Context = useAuth0();
  const { baseURL: apiBaseURL } = useApi();

  const thumbsUp = data?.thumbs_up ?? false;
  const thumbsDown = data?.thumbs_down ?? false;
  const haveRead = data?.have_read ?? false;

  const handleToggle = useCallback(
    async (type: "read" | "thumbs_up" | "thumbs_down", value: boolean) => {
      if (!auth0Context.isAuthenticated || !data) return;

      // Store previous state for rollback
      const prevState = {
        have_read: data.have_read,
        thumbs_up: data.thumbs_up,
        thumbs_down: data.thumbs_down,
      };

      const newValue = !value;

      // Update grid data optimistically
      if (type === "read") {
        data.have_read = newValue;
      } else if (type === "thumbs_up") {
        data.thumbs_up = newValue;
        if (newValue) data.thumbs_down = false;
      } else if (type === "thumbs_down") {
        data.thumbs_down = newValue;
        if (newValue) data.thumbs_up = false;
      }

      // Force cell refresh to reflect changes
      if (props.node && props.api) {
        props.api.refreshCells({ rowNodes: [props.node], force: true });
      }

      // Endpoint pattern for feedback labels: /v1/articles/:id/:label/:value
      const endpoint = type;
      const apiURL = `${apiBaseURL}/v1/articles/${encodeURIComponent(
        data.hash_id
      )}/${endpoint}/${newValue}`;

      try {
        const req = new Request(apiURL, { method: "POST" });
        await AuthenticatedFetch(req, auth0Context);
      } catch (e) {
        console.error("Failed to update feedback", e);
        // Revert to previous state on failure
        data.have_read = prevState.have_read;
        data.thumbs_up = prevState.thumbs_up;
        data.thumbs_down = prevState.thumbs_down;

        if (props.node && props.api) {
          props.api.refreshCells({ rowNodes: [props.node], force: true });
        }
      }
    },
    [apiBaseURL, auth0Context, data, props.api, props.node]
  );

  if (!data) return null;

  return (
    <div className="flex items-center gap-1 h-full">
      <button
        onClick={e => {
          e.stopPropagation();
          handleToggle("thumbs_up", thumbsUp);
        }}
        className={`p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
          thumbsUp
            ? "text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20"
            : "text-slate-400 dark:text-slate-500"
        }`}
        title="Thumbs Up"
      >
        <ThumbsUpIcon className="w-4 h-4" />
      </button>
      <button
        onClick={e => {
          e.stopPropagation();
          handleToggle("thumbs_down", thumbsDown);
        }}
        className={`p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
          thumbsDown
            ? "text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-900/20"
            : "text-slate-400 dark:text-slate-500"
        }`}
        title="Thumbs Down"
      >
        <ThumbsDownIcon className="w-4 h-4" />
      </button>
      <button
        onClick={e => {
          e.stopPropagation();
          handleToggle("read", haveRead);
        }}
        className={`p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${
          haveRead
            ? "text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "text-slate-400 dark:text-slate-500"
        }`}
        title="Mark as Read"
      >
        <CheckCircleIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

export const MakeArticleColumnDefs = (isAuthenticated: boolean): ColDef[] => {
  const columns: ColDef[] = [
    {
      flex: 3,
      colId: "title",
      field: "title",
      sortable: true,
      cellRenderer: MakeLinkCellRenderer(
        (props: ICellRendererParams<Article>) => {
          return props.value || "";
        }
      ),
    },
    {
      flex: 2,
      colId: "authors",
      field: "authors",
      sortable: true,
      cellRenderer: MakeLinkCellRenderer(
        (props: ICellRendererParams<Article>) => {
          return props.value || "";
        }
      ),
    },
    {
      flex: 1,
      colId: "source",
      field: "source",
      sortable: true,
      cellRenderer: MakeLinkCellRenderer(
        (props: ICellRendererParams<Article>) => {
          return props.value || "";
        }
      ),
    },
    {
      flex: 1,
      colId: "published_at",
      field: "published_at",
      headerName: "Published At",
      sortable: true,
      cellRenderer: MakeLinkCellRenderer(
        (props: ICellRendererParams<Article>) => {
          return props.value?.toLocaleString() || "";
        }
      ),
    },
    {
      colId: "feedback",
      headerName: "Feedback",
      width: 130,
      resizable: false,
      sortable: false,
      cellRenderer: FeedbackCell,
    },
    {
      colId: "details_link",
      field: "",
      headerName: "",
      resizable: false,
      width: 100,
      lockPosition: "right",
      cellRenderer: (props: ICellRendererParams<Article>) => {
        if (props.data) {
          const detailsURL = `/articles/${props.data.hash_id}`;
          return (
            <Link
              className="bg-blue-500 hover:bg-blue-700 dark:bg-blue-800 hover:dark:bg-blue-500 text-white px-2 py-2 rounded"
              to={detailsURL}
            >
              Similar
            </Link>
          );
        }
        return "";
      },
    },
  ];

  if (!isAuthenticated) {
    return columns.filter(col => col.colId !== "feedback");
  }
  return columns;
};

export const GetArticleRowId = (params: GetRowIdParams) => {
  return params.data.hash_id;
};

function MakeLinkCellRenderer(
  baseCellRenderer: (props: ICellRendererParams<Article>) => string
) {
  const LinkCell = (props: ICellRendererParams<Article>) => {
    if (props.data === undefined) {
      return "";
    }

    return (
      <ArticleLink
        article={props.data}
        className="inline-block h-full w-full"
        onRead={() => {
          if (props.data) {
            props.data.have_read = true;
            // Force refresh of the row to update other cells (FeedbackCell)
            if (props.node && props.api) {
              props.api.refreshCells({ rowNodes: [props.node], force: true });
            }
          }
        }}
      >
        {baseCellRenderer(props)}
      </ArticleLink>
    );
  };
  LinkCell.displayName = "LinkCell";
  return LinkCell;
}

function ArticleTable({ articles }: ArticleTableProps) {
  const { isAuthenticated } = useAuth0();

  return (
    <div className="ag-theme-quartz-auto-dark">
      <AgGridReact
        columnDefs={MakeArticleColumnDefs(isAuthenticated)}
        rowData={articles}
        getRowId={GetArticleRowId}
        domLayout="autoHeight"
      />
    </div>
  );
}

export default ArticleTable;
