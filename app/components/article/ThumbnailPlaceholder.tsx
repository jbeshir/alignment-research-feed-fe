import { getSourcePlaceholderIcon } from "~/constants/sourceIcons";

interface ThumbnailPlaceholderProps {
  source: string;
  className?: string;
}

export function ThumbnailPlaceholder({
  source,
  className = "",
}: ThumbnailPlaceholderProps) {
  const Icon = getSourcePlaceholderIcon(source);
  return (
    <div
      className={`flex items-center justify-center bg-slate-100 dark:bg-slate-700 ${className}`}
      data-testid="thumbnail-placeholder"
    >
      <Icon className="w-10 h-10 text-slate-400 dark:text-slate-500" />
    </div>
  );
}
