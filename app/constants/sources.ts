// Category-based header colors for card/row header backgrounds
// Tint + left-border in both light and dark schemes; dark uses a deep tint with colored border and text
const CATEGORY_HEADER_COLORS: Record<string, string> = {
  Interpretability:
    "bg-teal-50 border-l-4 border-l-teal-600 text-teal-900 dark:bg-teal-950/40 dark:border-l-teal-800 dark:text-teal-100",
  "Safety Techniques":
    "bg-blue-50 border-l-4 border-l-blue-600 text-blue-900 dark:bg-blue-950/40 dark:border-l-blue-800 dark:text-blue-100",
  "Governance & Policy":
    "bg-indigo-50 border-l-4 border-l-indigo-600 text-indigo-900 dark:bg-indigo-950/40 dark:border-l-indigo-800 dark:text-indigo-100",
  "Deception & Misalignment":
    "bg-red-50 border-l-4 border-l-red-600 text-red-900 dark:bg-red-950/40 dark:border-l-red-800 dark:text-red-100",
  "AI Capabilities & Behavior":
    "bg-amber-50 border-l-4 border-l-amber-600 text-amber-900 dark:bg-amber-950/40 dark:border-l-amber-800 dark:text-amber-100",
  "Risks & Strategy":
    "bg-rose-50 border-l-4 border-l-rose-600 text-rose-900 dark:bg-rose-950/40 dark:border-l-rose-800 dark:text-rose-100",
  Forecasting:
    "bg-cyan-50 border-l-4 border-l-cyan-600 text-cyan-900 dark:bg-cyan-950/40 dark:border-l-cyan-800 dark:text-cyan-100",
  "AI & Society":
    "bg-purple-50 border-l-4 border-l-purple-600 text-purple-900 dark:bg-purple-950/40 dark:border-l-purple-800 dark:text-purple-100",
  "Field Building":
    "bg-green-50 border-l-4 border-l-green-600 text-green-900 dark:bg-green-950/40 dark:border-l-green-800 dark:text-green-100",
  Other:
    "bg-stone-100 border-l-4 border-l-stone-500 text-stone-800 dark:bg-slate-800/60 dark:border-l-slate-600 dark:text-slate-200",
};

const DEFAULT_HEADER_COLOR =
  "bg-stone-100 border-l-4 border-l-stone-500 text-stone-800 dark:bg-slate-800/60 dark:border-l-slate-600 dark:text-slate-200";

export function getCategoryHeaderColor(
  category: string | null | undefined
): string {
  if (!category) return DEFAULT_HEADER_COLOR;
  return CATEGORY_HEADER_COLORS[category] ?? DEFAULT_HEADER_COLOR;
}

// Display names for sources (proper formatting)
const SOURCE_DISPLAY_NAMES: Record<string, string> = {
  // Research organizations (from dataset)
  arxiv: "arXiv",
  miri: "MIRI",
  "openai.research": "OpenAI Research",
  deepmind_blog: "DeepMind Blog",
  deepmind_technical_blog: "DeepMind Technical",
  "eleuther.ai": "EleutherAI",
  "transformer-circuits": "Transformer Circuits",

  // Forums (from dataset)
  lesswrong: "LessWrong",
  alignmentforum: "Alignment Forum",
  eaforum: "EA Forum",

  // Academic (from dataset)
  distill: "Distill",

  // Blogs (from dataset)
  axrp: "AXRP Podcast",
  aiimpacts: "AI Impacts",
  "aisafety.camp": "AI Safety Camp",
  jsteinhardt_blog: "Jacob Steinhardt",
  vkrakovna_blog: "Victoria Krakovna",
  yudkowsky_blog: "Eliezer Yudkowsky",
  gwern_blog: "Gwern",
  cold_takes: "Cold Takes",
  "generative.ink": "Generative Ink",
  "carado.moe": "Carado",
  importai: "Import AI",
  ml_safety_newsletter: "ML Safety Newsletter",
  alignment_newsletter: "Alignment Newsletter",

  // AGISF (from dataset)
  agisf_governance: "AGISF Governance",
  agisf_readings_alignment: "AGISF Alignment",
  agisf_readings_governance: "AGISF Gov Readings",

  // Other sources (from dataset)
  agentmodels: "Agent Models",
  "aisafety.info": "AI Safety Info",
  indices: "Indices",
  special_docs: "Special Docs",

  // Video (from dataset)
  youtube: "YouTube",

  // Article format types (from dataset)
  pdfs: "PDFs",
  pdf: "PDF",
  html_articles: "HTML Articles",
  html: "HTML",
  ebooks: "eBooks",
  xmls: "XML Files",
  xml: "XML",
  markdown: "Markdown",
  gdocs: "Google Docs",
  docx: "Word Doc",

  // Generic platforms (for fallback)
  blogs: "Blogs",
  substack: "Substack",
  medium: "Medium",
};

function toTitleCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatSourceName(source: string): string {
  const normalized = source.toLowerCase();
  return SOURCE_DISPLAY_NAMES[normalized] ?? toTitleCase(source);
}

// Generic blog source identifiers that should use author name instead
const GENERIC_BLOG_SOURCES = new Set(["blogs", "blog", "substack", "medium"]);

function isGenericBlogSource(source: string): boolean {
  return GENERIC_BLOG_SOURCES.has(source.toLowerCase());
}

function getFirstAuthor(authors: string): string {
  // Handle comma or "and" separated author lists, take first author
  const parts = authors.split(/,|\band\b/);
  const firstAuthor = parts[0]?.trim() ?? "";
  return firstAuthor || authors;
}

export function getSourceDisplayName(source: string, authors?: string): string {
  // For generic blog sources, prefer author name if available
  if (isGenericBlogSource(source) && authors) {
    const authorName = getFirstAuthor(authors);
    if (authorName) {
      return authorName;
    }
  }
  return formatSourceName(source);
}
