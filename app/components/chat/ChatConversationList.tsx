import { type Conversation } from "~/server/chat.server";

interface ChatConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function ChatConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: ChatConversationListProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="p-3">
        <button
          onClick={onNew}
          className="w-full rounded-lg border border-stone-300 dark:border-slate-600 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors"
        >
          + New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map(conv => (
          <button
            key={conv.id}
            type="button"
            className={`group flex w-full items-center gap-2 border-b border-stone-200 dark:border-slate-700 px-3 py-3 cursor-pointer hover:bg-stone-200 dark:hover:bg-slate-700/50 text-left ${
              conv.id === activeId ? "bg-stone-200 dark:bg-slate-700" : ""
            }`}
            onClick={() => onSelect(conv.id)}
          >
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm text-slate-800 dark:text-slate-200">
                {conv.title || "New conversation"}
              </p>
              <p className="text-xs text-stone-500 dark:text-slate-500">
                {formatRelativeTime(conv.updated_at)}
              </p>
            </div>
            <button
              onClick={e => {
                e.stopPropagation();
                onDelete(conv.id);
              }}
              className="hidden group-hover:block text-stone-400 hover:text-red-500 dark:hover:text-red-400 text-xs"
              aria-label="Delete conversation"
            >
              ✕
            </button>
          </button>
        ))}

        {conversations.length === 0 && (
          <p className="px-3 py-8 text-center text-sm text-stone-500 dark:text-slate-500">
            No conversations yet
          </p>
        )}
      </div>
    </div>
  );
}
