import React, { useEffect, useMemo, useRef } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import {
  ModuleRegistry,
  IDatasource,
  SortModelItem,
  ColDef,
  IGetRowsParams,
} from "@ag-grid-community/core";
import { InfiniteRowModelModule } from "@ag-grid-community/infinite-row-model";
import { AuthenticatedFetch } from "~/utils/request";
import { useAuth0 } from "@auth0/auth0-react";
import { useApi } from "~/contexts/ApiContext";
import {
  GetArticleRowId,
  MakeArticleColumnDefs,
} from "~/components/ArticleTable";
import { Article } from "~/types/article";
import { useIsAuthenticated } from "~/contexts/AuthContext";

// Register module once at module level (not inside component)
ModuleRegistry.registerModules([InfiniteRowModelModule]);

// Avoids unnecessary blinking of the table as it reloads its datasources when it doesn't need to rerender.
const MemoizedAgGridReact = React.memo(AgGridReact);

type AlignmentFeedTableProps = {
  /** Initial articles fetched server-side */
  initialArticles?: Article[];
  /** Total count if known from server-side fetch */
  initialTotalCount?: number | null;
};

/**
 * Custom hook that builds column definitions with filtering and sorting rules
 * appropriate for our infinite datasource.
 */
function useFeedColumnDefs(): ColDef[] {
  const isAuthenticated = useIsAuthenticated();

  return MakeArticleColumnDefs(isAuthenticated).map((def: ColDef) => {
    // Set filtering rules
    const newDef = { ...def };
    switch (newDef.colId) {
      case "title":
      case "authors":
      case "source":
        newDef.filter = "agTextColumnFilter";
        newDef.filterParams = {
          filterOptions: ["contains"],
          maxNumConditions: 1,
        };
        break;
      case "published_at":
        newDef.filter = "agDateColumnFilter";
        newDef.filterParams = {
          defaultOption: "greaterThanOrEqual",
          filterOptions: ["inRange", "lessThanOrEqual", "greaterThanOrEqual"],
          maxNumConditions: 1,
        };
    }

    // Set sorting rules; these two produce weird and unwanted results if you try to sort by them right now.
    switch (newDef.colId) {
      case "title":
      case "authors":
        newDef.sortable = false;
    }

    return newDef;
  });
}

/**
 * Check if the request is for the default first page (no filters, no sort)
 */
function isDefaultFirstPage(params: IGetRowsParams): boolean {
  if (params.startRow !== 0) return false;
  if (params.sortModel && params.sortModel.length > 0) return false;
  if (params.filterModel && Object.keys(params.filterModel).length > 0)
    return false;
  return true;
}

function AlignmentFeedTable({
  initialArticles = [],
  initialTotalCount,
}: AlignmentFeedTableProps) {
  const auth0Context = useAuth0();
  const { baseURL: apiBaseURL } = useApi();

  // Track whether we've used the initial data for the current datasource instance
  const usedInitialData = useRef(false);

  // Reset the usedInitialData flag when datasource will be recreated
  // (when initialArticles changes, useMemo creates a new datasource, so reset the flag)
  useEffect(() => {
    usedInitialData.current = false;
  }, [initialArticles, initialTotalCount]);

  // Store values in refs to avoid recreating datasource when auth state changes
  const auth0ContextRef = useRef(auth0Context);
  const apiBaseURLRef = useRef(apiBaseURL);

  // Update refs when values change (but don't trigger datasource recreation)
  auth0ContextRef.current = auth0Context;
  apiBaseURLRef.current = apiBaseURL;

  // Datasource that recreates when server-side data changes (after revalidation)
  // Uses refs for auth0Context/apiBaseURL to avoid recreation on every auth state change
  const dataSource: IDatasource = useMemo(() => {
    return {
      getRows: async (params: IGetRowsParams) => {
        const pageSize = 100;

        // Use server-side initial data for the first page if available and not yet used
        if (
          !usedInitialData.current &&
          isDefaultFirstPage(params) &&
          initialArticles.length > 0
        ) {
          usedInitialData.current = true;

          const lastRow =
            initialTotalCount ??
            (initialArticles.length < pageSize
              ? initialArticles.length
              : undefined);

          params.successCallback(initialArticles, lastRow);
          return;
        }

        // Fetch from API for subsequent pages or when filters/sort are applied
        const page = Math.floor(params.startRow / 100) + 1;

        const apiParams = new URLSearchParams();
        apiParams.set("page", page.toString());
        apiParams.set("page_size", pageSize.toString());

        const sort = params.sortModel
          .map((item: SortModelItem): string => {
            return item.colId + (item.sort === "desc" ? "_desc" : "");
          })
          .join(",");
        if (sort !== "") {
          apiParams.set("sort", sort.toString());
        }

        const titleFilter = params.filterModel?.title?.filter;
        if (titleFilter) {
          apiParams.set("filter_title_fulltext", titleFilter);
        }

        const authorsFilter = params.filterModel?.authors?.filter;
        if (authorsFilter) {
          apiParams.set("filter_authors_fulltext", authorsFilter);
        }

        const publishedAfterFilter = params.filterModel?.published_at?.dateFrom;
        if (publishedAfterFilter) {
          apiParams.set(
            "filter_published_after",
            new Date(publishedAfterFilter).toISOString()
          );
        }

        const publishedBeforeFilter = params.filterModel?.published_at?.dateTo;
        if (publishedBeforeFilter) {
          apiParams.set(
            "filter_published_before",
            new Date(publishedBeforeFilter).toISOString()
          );
        }

        const sourceFilter = params.filterModel?.source?.filter;
        if (sourceFilter) {
          apiParams.set("filter_sources_allowlist", sourceFilter);
        }

        const apiURL = `${apiBaseURLRef.current}/v1/articles?${apiParams.toString()}`;
        const req = new Request(apiURL);
        const response = await AuthenticatedFetch(req, auth0ContextRef.current);

        if (!response) {
          params.failCallback();
          return;
        }

        const { data } = (await response.json()) as { data: unknown[] };

        const articles = data.map((item: unknown): Article => {
          if (typeof item !== "object" || item === null) {
            throw new Error("item is not object");
          }
          return Article.parse(item);
        });

        const lastRow =
          articles.length < pageSize
            ? (page - 1) * pageSize + articles.length
            : undefined;

        params.successCallback(articles, lastRow);
      },
    };
    // Depend on initialArticles so datasource recreates when server data changes
    // This triggers ag-Grid to refetch and display the new authenticated data
    // We use refs for auth0Context/apiBaseURL to avoid recreation on every auth state change
  }, [initialArticles, initialTotalCount]);

  return (
    <div className="ag-theme-quartz-auto-dark" style={{ height: "100%" }}>
      <MemoizedAgGridReact
        columnDefs={useFeedColumnDefs()}
        rowModelType="infinite"
        cacheBlockSize={100}
        datasource={dataSource}
        getRowId={GetArticleRowId}
        pagination={true}
        paginationAutoPageSize={true}
        maxConcurrentDatasourceRequests={1}
        maxBlocksInCache={10}
      />
    </div>
  );
}

export default AlignmentFeedTable;
