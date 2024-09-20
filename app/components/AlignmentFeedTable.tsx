import {useCallback, useRef, useState, useMemo} from 'react';
import {AgGridReact} from "@ag-grid-community/react";
import {z} from "zod";

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import {ModuleRegistry, GetRowIdParams, IDatasource, SortModelItem} from "@ag-grid-community/core";
import { InfiniteRowModelModule } from "@ag-grid-community/infinite-row-model";

// interface AlignmentFeedTableProps {
//     apiBaseURL: string;
// }

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

function MakeLinkCellRenderer(baseCellRenderer: any) {
    return useCallback((props: any) => {
        if (props.data === undefined) {
            return "";
        }

        return (
            <a href={props.data.link} target='_blank' rel='noreferrer' style={{height: '100%', width: '100%', display:'inline-block'}}>
                {baseCellRenderer(props)}
            </a>
        );
    }, [baseCellRenderer]);
}

function AlignmentFeedTable({ apiBaseURL, darkMode }: { apiBaseURL: string, darkMode:string }){
    ModuleRegistry.registerModules([
        InfiniteRowModelModule,
    ]);

    const columnDefs = [
        { flex: 3, colId: 'title', field: 'title', sortable: false,
            filter: 'agTextColumnFilter',
            filterParams: {
                filterOptions: ['contains'],
                maxNumConditions: 1
            },
            cellRenderer: MakeLinkCellRenderer(useCallback((props: any) => {
                return props.value || "";
            }, []))
        },
        { flex: 2, colId: 'authors', field: 'authors', sortable: false,
            filter: 'agTextColumnFilter',
            filterParams: {
                filterOptions: ['contains'],
                maxNumConditions: 1
            },
            cellRenderer: MakeLinkCellRenderer(useCallback((props: any) => {
                return props.value || "";
            }, []))
        },
        { flex: 1, colId: 'source', field: 'source',
            filter: 'agTextColumnFilter',
            filterParams: {
                filterOptions: ['equals'],
                maxNumConditions: 1
            },
            cellRenderer: MakeLinkCellRenderer(useCallback((props: any) => {
                return props.value || "";
            }, []))
        },
        { flex: 1, colId: 'published_at', field: 'published_at', headerName: 'Published At',
            filter: 'agDateColumnFilter',
            filterParams: {
                defaultOption: 'greaterThanOrEqual',
                filterOptions: ['inRange', 'lessThanOrEqual', 'greaterThanOrEqual'],
                maxNumConditions: 1
            },
            cellRenderer: MakeLinkCellRenderer(useCallback((props: any) => {
                return props.value?.toLocaleString() || "";
            }, []))
        },
    ];

    const defaultColDefs = useMemo(() => {
        return {
            filter: 'agTextColumnFilter',
            floatingFilter: true,
        };
    }, []);

    const dataSource: IDatasource = {
        getRows: useCallback(async (params) => {
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
            const response = await fetch(apiURL);
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
        }, [apiBaseURL])
    };

    const getRowId = useCallback((params: GetRowIdParams) => {
        return params.data.hash_id;
    }, []);

    return (
        <div className={`ag-theme-quartz${darkMode}`} style={{height: '100%', width: '100%'}}>
            <AgGridReact
                columnDefs={columnDefs}
                defaultColDef={defaultColDefs}
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

export default AlignmentFeedTable;