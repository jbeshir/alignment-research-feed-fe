import { SearchBar } from "./SearchBar";

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
  return (
    <section className="text-center pt-20 pb-8 px-4 bg-brand-bg dark:bg-brand-bg-dark">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-light italic text-slate-900 dark:text-slate-100 mb-8 font-serif">
        Everything on AI Safety, all in one place.
      </h1>
      {showSearch && onSearchChange && onSearch && (
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          onSearch={onSearch}
        />
      )}
    </section>
  );
}
