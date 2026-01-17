// Source-specific colors for visual differentiation
export const SOURCE_COLORS: Record<string, string> = {
  arxiv: "bg-red-100 text-red-700",
  lesswrong: "bg-green-100 text-green-700",
  alignmentforum: "bg-purple-100 text-purple-700",
  youtube: "bg-red-100 text-red-700",
  default: "bg-slate-100 text-slate-600",
};

const DEFAULT_COLOR = "bg-slate-100 text-slate-600";

export function getSourceColor(source: string): string {
  const normalized = source.toLowerCase();
  return SOURCE_COLORS[normalized] ?? DEFAULT_COLOR;
}
