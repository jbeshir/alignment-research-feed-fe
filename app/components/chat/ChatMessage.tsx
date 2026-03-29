import { type UIMessage } from "ai";
import { ChatArticleCard } from "./ChatArticleCard";
import { type Article } from "~/schemas/article";

interface ChatMessageProps {
  message: UIMessage;
}

type ToolPart = {
  type: string;
  state: string;
  output?: unknown;
  toolCallId: string;
};

function isToolPart(part: { type: string }): part is ToolPart {
  return part.type.startsWith("tool-") || part.type === "dynamic-tool";
}

function extractArticlesFromParts(message: UIMessage): Article[] {
  const articles: Article[] = [];

  for (const part of message.parts) {
    if (isToolPart(part) && part.state === "output-available") {
      const result = part.output as unknown;
      if (result && typeof result === "object") {
        const data = result as { data?: unknown[] };
        if (Array.isArray(data.data)) {
          for (const item of data.data) {
            if (item && typeof item === "object" && "hash_id" in item) {
              articles.push(item as Article);
            }
          }
        }
      }
    }
  }

  return articles;
}

function getTextContent(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text"
    )
    .map(part => part.text)
    .join("");
}

function hasActiveToolCalls(message: UIMessage): boolean {
  return message.parts.some(
    part =>
      isToolPart(part) &&
      (part.state === "input-streaming" || part.state === "input-available")
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const textContent = getTextContent(message);
  const articles = isUser ? [] : extractArticlesFromParts(message);
  const isToolLoading = !isUser && hasActiveToolCalls(message);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-brand-primary text-white"
            : "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-600"
        }`}
      >
        {textContent && (
          <div className="whitespace-pre-wrap text-sm">{textContent}</div>
        )}

        {isToolLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Searching...
          </div>
        )}

        {articles.length > 0 && (
          <div className="mt-3 space-y-2">
            {articles.map(article => (
              <ChatArticleCard key={article.hash_id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
