import { type UIMessage, isToolUIPart } from "ai";
import { ChatArticleCard } from "./ChatArticleCard";
import { ArticleSchema } from "~/schemas/article";

interface ChatMessageProps {
  message: UIMessage;
}

function renderParts(message: UIMessage) {
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < message.parts.length; i++) {
    const part = message.parts[i]!;

    if (part.type === "text" && part.text) {
      elements.push(
        <div key={i} className="whitespace-pre-wrap text-sm">
          {part.text}
        </div>
      );
    } else if (isToolUIPart(part)) {
      if (
        part.state === "input-streaming" ||
        part.state === "input-available"
      ) {
        elements.push(
          <div
            key={i}
            className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 my-2"
          >
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Searching...
          </div>
        );
      } else if (part.state === "output-available") {
        const result = part.output;
        if (result && typeof result === "object") {
          const data = (result as { data?: unknown[] }).data;
          if (Array.isArray(data)) {
            const articles = data
              .map(item => ArticleSchema.safeParse(item))
              .filter(r => r.success)
              .map(r => r.data);

            if (articles.length > 0) {
              elements.push(
                <div key={i} className="my-2 space-y-2">
                  {articles.map(article => (
                    <ChatArticleCard
                      key={article.hash_id}
                      article={article}
                    />
                  ))}
                </div>
              );
            }
          }
        }
      }
    }
  }

  return elements;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 ${
          isUser
            ? "bg-brand-dark text-white"
            : "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-600"
        }`}
      >
        {renderParts(message)}
      </div>
    </div>
  );
}
