import { type Article, formatPublishedDate } from "~/schemas/article";

type ArticleInfoProps = {
  article: Article;
};

export function ArticleInfo({ article }: ArticleInfoProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      <div className="space-y-1">
        <span className="text-sm font-medium text-slate-500">Title</span>
        <p className="text-lg font-semibold text-slate-900">{article.title}</p>
      </div>
      <div className="space-y-1">
        <span className="text-sm font-medium text-slate-500">Authors</span>
        <p className="text-slate-700">{article.authors}</p>
      </div>
      <div className="space-y-1">
        <span className="text-sm font-medium text-slate-500">URL</span>
        <a
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline break-all"
        >
          {article.link}
        </a>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-sm font-medium text-slate-500">Source</span>
          <p className="text-slate-700">{article.source}</p>
        </div>
        <div className="space-y-1">
          <span className="text-sm font-medium text-slate-500">Published</span>
          <p className="text-slate-700">{formatPublishedDate(article.published_at)}</p>
        </div>
      </div>
    </div>
  );
}
