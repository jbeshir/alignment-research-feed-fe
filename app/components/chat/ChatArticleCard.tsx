import { type Article, formatPublishedDate } from "~/schemas/article";

interface ChatArticleCardProps {
  article: Article;
  onArticleClick?: ((hashId: string) => void) | undefined;
}

export function ChatArticleCard({
  article,
  onArticleClick,
}: ChatArticleCardProps) {
  return (
    <a
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      onClick={
        onArticleClick ? () => onArticleClick(article.hash_id) : undefined
      }
      className="block rounded-lg border border-stone-200 dark:border-slate-600 bg-stone-50 dark:bg-slate-700 p-3 hover:border-accent dark:hover:border-brand-dark transition-colors"
    >
      <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2">
        {article.title}
      </h4>
      <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-stone-500 dark:text-slate-400">
        {article.authors && <span>{article.authors}</span>}
        <span>{article.source}</span>
        {article.published_at && (
          <span>{formatPublishedDate(article.published_at)}</span>
        )}
      </div>
      {article.summary && (
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
          {article.summary}
        </p>
      )}
    </a>
  );
}
