import {AgGridReact} from "@ag-grid-community/react";
import {z} from "zod";

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';
import {ModuleRegistry, GetRowIdParams, ColDef, ICellRendererParams} from "@ag-grid-community/core";
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {Link} from "@remix-run/react";
import Button from "~/components/Button";

type ArticleTableProps = {
    articles: Article[]
}

export const Article = z.object({
    hash_id: z.string(),
    title: z.string(),
    link: z.string(),
    text_start: z.string(),
    authors: z.string(),
    source: z.string(),
    published_at: z.string().datetime().pipe(z.coerce.date()),
});

export type Article = z.infer<typeof Article>;

export const ArticleColumnDefs: ColDef[] = [
    { flex: 3, colId: 'title', field: 'title', sortable: true,
        cellRenderer: MakeLinkCellRenderer((props: ICellRendererParams<Article>) => {
            return props.value || "";
        })
    },
    { flex: 2, colId: 'authors', field: 'authors', sortable: true,
        cellRenderer: MakeLinkCellRenderer((props: ICellRendererParams<Article>) => {
            return props.value || "";
        })
    },
    { flex: 1, colId: 'source', field: 'source', sortable: true,
        cellRenderer: MakeLinkCellRenderer((props: ICellRendererParams<Article>) => {
            return props.value || "";
        })
    },
    { flex: 1, colId: 'published_at', field: 'published_at', headerName: 'Published At', sortable: true,
        cellRenderer: MakeLinkCellRenderer((props: ICellRendererParams<Article>) => {
            return props.value?.toLocaleString() || "";
        })
    },
    { colId: 'details_link', field: '', headerName: '', resizable: false, width: 100, lockPosition: 'right',
        cellRenderer: (props: ICellRendererParams<Article>) => {
            if (props.data) {
                const detailsURL = `/articles/${props.data.hash_id}`;
                return <Link className="bg-blue-500 hover:bg-blue-700 dark:bg-blue-800 hover:dark:bg-blue-500 text-white px-2 py-2 rounded" to={detailsURL}>Similar</Link>;
            }
            return "";
        }
    },
];

export const GetArticleRowId = (params: GetRowIdParams) => {
    return params.data.hash_id;
};

function MakeLinkCellRenderer(baseCellRenderer: any) {
    const LinkCell = (props: ICellRendererParams<Article>) => {
        if (props.data === undefined) {
            return "";
        }

        return (
            <a href={props.data.link} target='_blank' rel='noreferrer' className='inline-block h-full w-full'>
                {baseCellRenderer(props)}
            </a>
        );
    };
    LinkCell.displayName = 'LinkCell';
    return LinkCell;
}

function ArticleTable({articles} : ArticleTableProps) {
    ModuleRegistry.registerModules([
        ClientSideRowModelModule,
    ]);

    return (
        <div className="ag-theme-quartz-auto-dark">
            <AgGridReact
                columnDefs={ArticleColumnDefs}
                rowData={articles}
                getRowId={GetArticleRowId}
                domLayout="autoHeight"
            />
        </div>
    );
}

export default ArticleTable;