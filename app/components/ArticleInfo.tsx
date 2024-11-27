import {Article} from "~/components/ArticleTable";

type ArticleInfoProps = {
    article: Article
}

function ArticleInfo({article}: ArticleInfoProps) {
    return <div className="text-black dark:text-white space-y-2">
        <div className="h-fill py-2 px-4 flex flex-row bg-slate-200 dark:bg-slate-700">
            <span className="inline-block w-40 font-bold">Title</span>
            <span className="inline-block grow">{article.title}</span>
        </div>
        <div className="h-fill py-2 px-4 flex flex-row bg-slate-200 dark:bg-slate-700">
            <span className="inline-block w-40 font-bold">Authors</span>
            <span className="inline-block grow">{article.authors}</span>
        </div>
        <div className="h-fill py-2 px-4 flex flex-row bg-slate-200 dark:bg-slate-700">
            <span className="inline-block w-40 font-bold">URL</span>
            <span className="inline-block grow"><a href={article.link}>{article.link}</a></span>
        </div>
        <div className="h-fill py-2 px-4 flex flex-row bg-slate-200 dark:bg-slate-700">
            <span className="inline-block w-40 font-bold">Source</span>
            <span className="inline-block grow">{article.source}</span>
        </div>
        <div className="h-fill py-2 px-4 flex flex-row bg-slate-200 dark:bg-slate-700">
            <span className="inline-block w-40 font-bold">Published At</span>
            <span className="inline-block grow">{article.published_at.toLocaleString()}</span>
        </div>
    </div>
}

export default ArticleInfo;