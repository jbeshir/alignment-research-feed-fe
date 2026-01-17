// Source-specific colors for visual differentiation (used in tags)
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

// Header-specific colors with higher contrast for card header backgrounds
// All dark backgrounds with white text for consistency
export const SOURCE_HEADER_COLORS: Record<string, string> = {
  // Research organizations (from dataset)
  arxiv: "bg-red-800 text-white",
  miri: "bg-indigo-800 text-white",
  "openai.research": "bg-emerald-800 text-white",
  deepmind_blog: "bg-blue-800 text-white",
  deepmind_technical_blog: "bg-blue-900 text-white",
  "eleuther.ai": "bg-purple-800 text-white",
  "transformer-circuits": "bg-teal-800 text-white",

  // Forums (from dataset - currently disabled but may have historical data)
  lesswrong: "bg-green-800 text-white",
  alignmentforum: "bg-violet-800 text-white",
  eaforum: "bg-sky-800 text-white",

  // Academic (from dataset)
  distill: "bg-amber-800 text-white",

  // Blogs (from dataset)
  axrp: "bg-purple-900 text-white",
  aiimpacts: "bg-cyan-800 text-white",
  "aisafety.camp": "bg-emerald-900 text-white",
  jsteinhardt_blog: "bg-orange-800 text-white",
  vkrakovna_blog: "bg-pink-800 text-white",
  yudkowsky_blog: "bg-rose-800 text-white",
  gwern_blog: "bg-slate-700 text-white",
  cold_takes: "bg-teal-900 text-white",
  "generative.ink": "bg-fuchsia-800 text-white",
  "carado.moe": "bg-fuchsia-900 text-white",
  importai: "bg-sky-900 text-white",
  ml_safety_newsletter: "bg-teal-800 text-white",
  alignment_newsletter: "bg-green-900 text-white",

  // AGISF (from dataset)
  agisf_governance: "bg-blue-900 text-white",
  agisf_readings_alignment: "bg-indigo-800 text-white",
  agisf_readings_governance: "bg-indigo-900 text-white",

  // Other sources (from dataset)
  agentmodels: "bg-amber-900 text-white",
  "aisafety.info": "bg-green-800 text-white",
  indices: "bg-gray-700 text-white",
  special_docs: "bg-slate-700 text-white",

  // Video (from dataset)
  youtube: "bg-red-800 text-white",

  // Article format types (from dataset)
  pdfs: "bg-stone-700 text-white",
  pdf: "bg-stone-700 text-white",
  html_articles: "bg-stone-700 text-white",
  html: "bg-stone-700 text-white",
  ebooks: "bg-stone-800 text-white",
  xmls: "bg-zinc-700 text-white",
  xml: "bg-zinc-700 text-white",
  markdown: "bg-zinc-700 text-white",
  gdocs: "bg-blue-800 text-white",
  docx: "bg-blue-800 text-white",

  // Generic platforms (for fallback)
  blogs: "bg-slate-700 text-white",
  substack: "bg-orange-800 text-white",
  medium: "bg-stone-700 text-white",

  // Default
  default: "bg-slate-700 text-white",
};

const DEFAULT_HEADER_COLOR = "bg-slate-700 text-white";

export function getSourceHeaderColor(source: string): string {
  const normalized = source.toLowerCase();
  return SOURCE_HEADER_COLORS[normalized] ?? DEFAULT_HEADER_COLOR;
}

// Display names for sources (proper formatting)
export const SOURCE_DISPLAY_NAMES: Record<string, string> = {
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
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatSourceName(source: string): string {
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

export function getSourceDisplayName(
  source: string,
  authors?: string
): string {
  // For generic blog sources, prefer author name if available
  if (isGenericBlogSource(source) && authors) {
    const authorName = getFirstAuthor(authors);
    if (authorName) {
      return `Blogs - ${authorName}`;
    }
  }
  return formatSourceName(source);
}
