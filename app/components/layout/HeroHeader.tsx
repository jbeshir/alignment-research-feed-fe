import { SearchBar } from "./SearchBar";
import { RssIcon, DocumentIcon, CodeBracketIcon } from "./Icons";
import { useRootLoaderData } from "~/root";

const GITHUB_RELEASES_URL =
  "https://github.com/jbeshir/alignment-research-feed/releases";

interface HeroHeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearch?: (query: string) => void;
  showSearch?: boolean;
}

export function HeroHeader({
  searchQuery = "",
  onSearchChange,
  onSearch,
  showSearch = true,
}: HeroHeaderProps) {
  const rootData = useRootLoaderData();

  return (
    <section className="text-center pt-20 pb-8 px-4 bg-brand-bg dark:bg-brand-bg-dark">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-light italic text-slate-900 dark:text-slate-100 mb-8 font-serif">
        Your personalised AI Safety research feed.
      </h1>
      {showSearch && onSearchChange && onSearch && (
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          onSearch={onSearch}
        />
      )}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-400 dark:text-slate-500">
        {rootData?.rssUrl && (
          <a
            href={rootData.rssUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <RssIcon className="w-3.5 h-3.5" />
            RSS
          </a>
        )}
        <a
          href="/docs/api.html"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <DocumentIcon className="w-3.5 h-3.5" />
          API Docs
        </a>
        <a
          href={GITHUB_RELEASES_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <CodeBracketIcon className="w-3.5 h-3.5" />
          MCP Server
        </a>
      </div>
    </section>
  );
}
