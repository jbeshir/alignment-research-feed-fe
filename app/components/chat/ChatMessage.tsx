import { useState, useEffect, useRef } from "react";
import { type UIMessage, isToolUIPart } from "ai";
import { ChatArticleCard } from "./ChatArticleCard";
import { ArticleSchema } from "~/schemas/article";

interface ChatMessageProps {
  message: UIMessage;
  isStreaming?: boolean;
}

/**
 * Reveals text word-by-word during streaming for a smoother feel.
 * Once streaming ends, shows the full text immediately.
 */
function StreamingText({
  text,
  isStreaming,
}: {
  text: string;
  isStreaming: boolean;
}) {
  const [visibleCount, setVisibleCount] = useState(0);
  const prevTextRef = useRef(text);
  const words = text.split(/(\s+)/);

  useEffect(() => {
    if (!isStreaming) {
      setVisibleCount(words.length);
      return;
    }

    // When new text arrives, start revealing from where we were
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
    return <>{text}</>;
  }

  const visible = words.slice(0, visibleCount).join("");
  return (
    <>
      {visible}
      {visibleCount < words.length && (
        <span className="inline-block w-1.5 h-4 ml-0.5 -mb-0.5 bg-current animate-pulse" />
      )}
    </>
  );
}

function renderParts(message: UIMessage, isStreaming: boolean) {
  const elements: React.ReactNode[] = [];

  // Find the last text part index
  let lastTextIndex = -1;
  for (let i = message.parts.length - 1; i >= 0; i--) {
    if (message.parts[i]!.type === "text") {
      lastTextIndex = i;
      break;
    }
  }

  for (let i = 0; i < message.parts.length; i++) {
    const part = message.parts[i]!;

    if (part.type === "text" && part.text) {
      const isLastText = i === lastTextIndex;
      elements.push(
        <span key={i} className="whitespace-pre-wrap text-sm">
          <StreamingText
            text={part.text}
            isStreaming={isStreaming && isLastText}
          />
        </span>
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
                    <ChatArticleCard key={article.hash_id} article={article} />
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

export function ChatMessage({
  message,
  isStreaming = false,
}: ChatMessageProps) {
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
        {renderParts(message, isStreaming && !isUser)}
      </div>
    </div>
  );
}
