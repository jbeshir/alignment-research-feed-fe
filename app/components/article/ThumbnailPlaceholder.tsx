import { getSourcePlaceholderIcon } from "~/constants/sourceIcons";

interface ThumbnailPlaceholderProps {
  source: string;
  className?: string;
  iconClassName?: string;
}

export function ThumbnailPlaceholder({
  source,
  className = "",
  iconClassName = "w-10 h-10",
}: ThumbnailPlaceholderProps) {
  const Icon = getSourcePlaceholderIcon(source);
  return (
    <div
      className={`flex items-center justify-center bg-stone-100 dark:bg-stone-800 ${className}`}
      data-testid="thumbnail-placeholder"
    >
      <Icon className={`${iconClassName} text-stone-400 dark:text-stone-600`} />
    </div>
  );
}
