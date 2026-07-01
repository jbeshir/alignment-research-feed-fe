import { useState, useEffect, useRef } from "react";
import { type UIMessage, isToolUIPart, getToolName } from "ai";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatArticleCard } from "./ChatArticleCard";
import { ArticleSchema } from "~/schemas/article";

interface ChatMessageProps {
  message: UIMessage;
  isStreaming?: boolean;
  onArticleClick?: ((hashId: string) => void) | undefined;
}

const TOOL_LABELS: Record<string, string> = {
  search_articles: "Search Articles",
  semantic_search: "Semantic Search",
  get_article: "Get Article",
  get_similar_articles: "Similar Articles",
  get_recommendations: "Recommendations",
  list_liked: "Liked Articles",
  list_disliked: "Disliked Articles",
  list_unreviewed: "Unreviewed Articles",
};

function StreamingText({
  text,
  isStreaming,
  articleLinks,
  onArticleClick,
}: {
  text: string;
  isStreaming: boolean;
  articleLinks?: Map<string, string> | undefined;
  onArticleClick?: ((hashId: string) => void) | undefined;
}) {
  const [visibleCount, setVisibleCount] = useState(0);
  const prevTextRef = useRef(text);
  const words = text.split(/(\s+)/);

  useEffect(() => {
    if (!isStreaming) {
      setVisibleCount(words.length);
      return;
    }

    if (text !== prevTextRef.current) {
      prevTextRef.current = text;
    }

    if (visibleCount >= words.length) return;

    const timer = setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 1, words.length));
    }, 15);
    return () => clearTimeout(timer);
  }, [isStreaming, visibleCount, words.length, text]);

  if (!isStreaming) {
    return (
      <ChatMarkdown
        text={text}
        articleLinks={articleLinks}
        onArticleClick={onArticleClick}
      />
    );
  }

  const visible = words.slice(0, visibleCount).join("");
  return (
    <>
      <ChatMarkdown
        text={visible}
        articleLinks={articleLinks}
        onArticleClick={onArticleClick}
      />
      {visibleCount < words.length && (
        <span className="inline-block w-1.5 h-4 ml-0.5 -mb-0.5 bg-current animate-pulse" />
      )}
    </>
  );
}

function ChatMarkdown({
  text,
  articleLinks,
  onArticleClick,
}: {
  text: string;
  articleLinks?: Map<string, string> | undefined;
  onArticleClick?: ((hashId: string) => void) | undefined;
}) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children }) => {
          const hashId = href ? articleLinks?.get(href) : undefined;
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={
                hashId && onArticleClick
                  ? () => onArticleClick(hashId)
                  : undefined
              }
              className="text-teal-700 dark:text-accent-dark-fg underline hover:text-teal-900 dark:hover:text-accent-dark-fg-hover"
            >
              {children}
            </a>
          );
        },
        ul: ({ children }) => (
          <ul className="list-disc pl-5 my-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 my-1">{children}</ol>
        ),
        li: ({ children }) => <li className="my-0.5">{children}</li>,
        p: ({ children }) => (
          <p className="my-2 first:mt-0 last:mb-0">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),
        h1: ({ children }) => (
          <h1 className="text-base font-bold mt-3 mb-1">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-bold mt-3 mb-1">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-bold mt-2 mb-1">{children}</h3>
        ),
        code: ({ children, className }) => {
          const isBlock = className?.startsWith("language-");
          if (isBlock) {
            return (
              <code className="block bg-stone-100 dark:bg-slate-800 rounded p-2 my-1 text-xs overflow-x-auto">
                {children}
              </code>
            );
          }
          return (
            <code className="bg-stone-100 dark:bg-slate-800 rounded px-1 py-0.5 text-xs">
              {children}
            </code>
          );
        },
        pre: ({ children }) => <pre className="my-1">{children}</pre>,
      }}
    >
      {text}
    </Markdown>
  );
}

function ExpandableSection({
  label,
  icon,
  children,
  defaultOpen = false,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="my-3 rounded border border-stone-200 dark:border-slate-600 overflow-hidden"
      open={defaultOpen}
    >
      <summary className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-600 dark:text-slate-300 bg-stone-50 dark:bg-slate-800 cursor-pointer select-none hover:bg-stone-100 dark:hover:bg-slate-700">
        <span>{icon}</span>
        {label}
      </summary>
      <div className="px-3 py-2 text-sm">{children}</div>
    </details>
  );
}

function formatToolInput(input: unknown): string {
  if (!input || typeof input !== "object") return "";
  return Object.entries(input as Record<string, unknown>)
    .filter(([, v]) => v != null && v !== "")
    .map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
    .join(", ");
}

function renderToolPart(
  part: { state: string; input?: unknown; output?: unknown },
  toolName: string,
  key: React.Key,
  onArticleClick?: (hashId: string) => void
) {
  const label = TOOL_LABELS[toolName] ?? toolName;
  const isLoading =
    part.state === "input-streaming" || part.state === "input-available";

  if (isLoading) {
    return (
      <ExpandableSection key={key} label={label} icon="🔧" defaultOpen>
        <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-slate-300">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Searching...
        </div>
        {part.input != null && (
          <p className="mt-1 text-xs text-stone-500 dark:text-slate-500">
            {formatToolInput(part.input)}
          </p>
        )}
      </ExpandableSection>
    );
  }

  if (part.state !== "output-available") return null;

  const articles = extractArticles(part.output);

  return (
    <ExpandableSection key={key} label={label} icon="🔧">
      {part.input != null && (
        <p className="mb-2 text-xs text-stone-500 dark:text-slate-500">
          {formatToolInput(part.input)}
        </p>
      )}
      {articles.length > 0 ? (
        <div className="space-y-2">
          {articles.map(article => (
            <ChatArticleCard
              key={article.hash_id}
              article={article}
              onArticleClick={onArticleClick}
            />
          ))}
        </div>
      ) : (
        <p className="text-xs text-stone-500 dark:text-slate-500">No results</p>
      )}
    </ExpandableSection>
  );
}

function extractArticles(output: unknown) {
  if (!output || typeof output !== "object") return [];
  const data = (output as { data?: unknown[] }).data;
  if (!Array.isArray(data)) return [];
  return data
    .map(item => ArticleSchema.safeParse(item))
    .filter(r => r.success)
    .map(r => r.data);
}

function renderParts(
  message: UIMessage,
  isStreaming: boolean,
  onArticleClick?: (hashId: string) => void
) {
  const elements: React.ReactNode[] = [];
  // Accumulate article URL → hash_id as we encounter tool outputs
  const articleLinks = new Map<string, string>();

  let lastTextIndex = -1;
  for (let i = message.parts.length - 1; i >= 0; i--) {
    if (message.parts[i]!.type === "text") {
      lastTextIndex = i;
      break;
    }
  }

  for (let i = 0; i < message.parts.length; i++) {
    const part = message.parts[i]!;

    if (isToolUIPart(part) && part.state === "output-available") {
      for (const article of extractArticles(part.output)) {
        articleLinks.set(article.link, article.hash_id);
      }
    }

    if (part.type === "text" && part.text) {
      const isLastText = i === lastTextIndex;
      // Snapshot the current map so this text part's links resolve correctly
      const linksSnapshot =
        articleLinks.size > 0 ? new Map(articleLinks) : undefined;
      elements.push(
        <div key={i} className="text-sm">
          <StreamingText
            text={part.text}
            isStreaming={isStreaming && isLastText}
            articleLinks={linksSnapshot}
            onArticleClick={onArticleClick}
          />
        </div>
      );
    } else if (part.type === "reasoning") {
      const reasoningPart = part as { text: string; state?: string };
      if (reasoningPart.text) {
        elements.push(
          <ExpandableSection key={i} label="Thinking" icon="💭">
            <p className="whitespace-pre-wrap text-xs text-stone-600 dark:text-slate-300">
              {reasoningPart.text}
            </p>
            {reasoningPart.state === "streaming" && (
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
          </ExpandableSection>
        );
      }
    } else if (isToolUIPart(part)) {
      const name = getToolName(part);
      const element = renderToolPart(part, name, i, onArticleClick);
      if (element) elements.push(element);
    }
  }

  return elements;
}

export function ChatMessage({
  message,
  isStreaming = false,
  onArticleClick,
}: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-accent text-white dark:bg-accent-dark"
            : "bg-stone-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-stone-200 dark:border-slate-600"
        }`}
      >
        {isUser ? (
          <div className="whitespace-pre-wrap text-sm">
            {message.parts
              .filter(
                (p): p is { type: "text"; text: string } => p.type === "text"
              )
              .map(p => p.text)
              .join("")}
          </div>
        ) : (
          renderParts(message, isStreaming, onArticleClick)
        )}
      </div>
    </div>
  );
}
