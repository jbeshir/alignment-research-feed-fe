// Category-based header colors for card/row header backgrounds
// Dark backgrounds with white text; slightly lighter in dark mode for contrast
const CATEGORY_HEADER_COLORS: Record<string, string> = {
  Interpretability: "bg-teal-800 dark:bg-teal-700 text-white",
  "Safety Techniques": "bg-blue-800 dark:bg-blue-700 text-white",
  "Governance & Policy": "bg-indigo-800 dark:bg-indigo-700 text-white",
  "Deception & Misalignment": "bg-red-800 dark:bg-red-700 text-white",
  "AI Capabilities & Behavior": "bg-amber-800 dark:bg-amber-700 text-white",
  "Risks & Strategy": "bg-rose-800 dark:bg-rose-700 text-white",
  Forecasting: "bg-cyan-800 dark:bg-cyan-700 text-white",
  "AI & Society": "bg-purple-800 dark:bg-purple-700 text-white",
  "Field Building": "bg-green-800 dark:bg-green-700 text-white",
  Other: "bg-slate-700 dark:bg-slate-600 text-white",
};

const DEFAULT_HEADER_COLOR = "bg-slate-700 dark:bg-slate-600 text-white";

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
