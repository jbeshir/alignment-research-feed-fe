import React, {useMemo} from 'react';
import {AgGridReact} from "@ag-grid-community/react";
import {Article, ArticleColumnDefs, GetArticleRowId} from "./ArticleTable"

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import {ModuleRegistry, IDatasource, SortModelItem} from "@ag-grid-community/core";
import { InfiniteRowModelModule } from "@ag-grid-community/infinite-row-model";
import {AuthenticatedFetch} from "~/utils/request";
import {useAuth0} from "@auth0/auth0-react";

type AlignmentFeedTableProps = {
    apiBaseURL: string
}

// Avoids unnecessary blinking of the table as it reloads its datasources when it doesn't need to rerender.
const MemoizedAgGridReact = React.memo(AgGridReact);

// Add filtering and sorting rules appropriate supported by our infinite datasource to our column definitions.
const FeedColumnDefs = ArticleColumnDefs.map((def) => {

    // Set filtering rules
    const newDef = { ...def };
    switch (newDef.colId) {
        case 'title':
        case 'authors':
        case 'source':
            newDef.filter = 'agTextColumnFilter';
            newDef.filterParams = {
                filterOptions: ['contains'],
                maxNumConditions: 1
            };
            break;
        case 'published_at':
            newDef.filter = 'agDateColumnFilter';
            newDef.filterParams = {
                defaultOption: 'greaterThanOrEqual',
                filterOptions: ['inRange', 'lessThanOrEqual', 'greaterThanOrEqual'],
                maxNumConditions: 1
            };
    }

    // Set sorting rules; these two produce weird and unwanted results if you try to sort by them right now.
    switch (newDef.colId) {
        case 'title':
        case 'details_link':
        case 'authors':
            newDef.sortable = false;
    }

    return newDef;
});

function AlignmentFeedTable({apiBaseURL} : AlignmentFeedTableProps) {
    ModuleRegistry.registerModules([
        InfiniteRowModelModule,
    ]);

    const auth0Context = useAuth0();

    const dataSource: IDatasource = useMemo(() => {return {
        getRows: async (params) => {
            const page = Math.floor(params.startRow / 100) + 1;
            const pageSize = 100;  // We're using a fixed page size of 100 for this example

            const apiParams = new URLSearchParams();
            apiParams.set('page', page.toString());
            apiParams.set('page_size', pageSize.toString());

            const sort = params.sortModel.map((item: SortModelItem): string => {
                return item.colId + (item.sort === 'desc' ? '_desc' : '');
            }).join(',')
            if (sort !== "") {
                apiParams.set('sort', sort.toString());
            }

            const titleFilter = params.filterModel?.title?.filter;
            if (titleFilter) {
                apiParams.set('filter_title_fulltext', titleFilter);
            }

            const authorsFilter = params.filterModel?.authors?.filter;
            if (authorsFilter) {
                apiParams.set('filter_authors_fulltext', authorsFilter);
            }

            const publishedAfterFilter = params.filterModel?.published_at?.dateFrom;
            if (publishedAfterFilter) {
                apiParams.set('filter_published_after', (new Date(publishedAfterFilter)).toISOString());
            }

            const publishedBeforeFilter = params.filterModel?.published_at?.dateTo;
            if (publishedBeforeFilter) {
                apiParams.set('filter_published_before', (new Date(publishedBeforeFilter)).toISOString());
            }

            const sourceFilter = params.filterModel?.source?.filter;
            if (sourceFilter) {
                apiParams.set('filter_sources_allowlist', sourceFilter);
            }

            const apiURL = `${apiBaseURL}/v1/articles?${apiParams.toString()}`
            const req = new Request(apiURL);
            const response = await AuthenticatedFetch(req, auth0Context);
            if (!response) {
                params.failCallback();
                return;
            }
            const { data, metadata } = await response.json();

            const articles = data.map((item: unknown): Article => {
                if (typeof item !== 'object' || item === null) {
                    throw new Error("item is not object")
                }

                return Article.parse(item);
            });

            // Set only once known
            const lastRow = articles.length < pageSize
                ? (page-1) * pageSize + articles.length
                : null;

            params.successCallback(articles, lastRow);
        }
    }}, [apiBaseURL, auth0Context]);

    return (
        <div className="ag-theme-quartz-auto-dark" style={{height: '100%'}}>
            <MemoizedAgGridReact
                columnDefs={FeedColumnDefs}
                rowModelType='infinite'
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