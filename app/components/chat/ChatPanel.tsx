import { useRef, useEffect, useState, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ChatConversationList } from "./ChatConversationList";
import { type Conversation } from "~/server/chat.server";

interface ChatPanelProps {
  initialConversations: Conversation[];
}

export function ChatPanel({ initialConversations }: ChatPanelProps) {
  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef<string | null>(null);

  // Keep the ref in sync with state
  conversationIdRef.current = activeConversationId;

  const { messages, sendMessage, setMessages, status, error, clearError } =
    useChat({
      experimental_throttle: 50,
      transport: new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({
          conversationId: conversationIdRef.current,
        }),
        fetch: async (url, init) => {
          const response = await globalThis.fetch(url, init);
          const serverId = response.headers.get("X-Conversation-Id");
          if (serverId && !conversationIdRef.current) {
            setActiveConversationId(serverId);
          }
          return response;
        },
      }),
      onFinish: () => {
        refreshConversations();
      },
    });

  const refreshConversations = useCallback(async () => {
    try {
      const resp = await fetch("/api/chat/conversations");
      if (resp.ok) {
        const data = (await resp.json()) as { conversations: Conversation[] };
        setConversations(data.conversations);
      }
    } catch {
      // Silently fail — conversation list is non-critical
    }
  }, []);

  // Only auto-scroll when the user is already near the bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom < 150) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    clearError();
    const text = input;
    setInput("");
    sendMessage({ text });
  };

  const handleSelectConversation = async (id: string) => {
    setActiveConversationId(id);
    setSidebarOpen(false);
    clearError();

    try {
      const resp = await fetch(`/api/chat/conversations/${id}`);
      if (!resp.ok) {
        setMessages([]);
        return;
      }
      const data = (await resp.json()) as {
        messages: Array<{
          id: string;
          role: string;
          content: string;
          parts_json: string | null;
        }>;
      };
      const uiMessages: UIMessage[] = data.messages
        .filter(m => m.role === "user" || m.role === "assistant")
        .map(m => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          parts: m.parts_json
            ? (JSON.parse(m.parts_json) as UIMessage["parts"])
            : [{ type: "text" as const, text: m.content }],
        }));
      setMessages(uiMessages);
    } catch {
      setMessages([]);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setSidebarOpen(false);
    clearError();
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      const resp = await fetch(`/api/chat/conversations/${id}`, {
        method: "DELETE",
      });
      if (!resp.ok) return;
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversationId === id) {
        handleNewChat();
      }
    } catch {
      // Network failure — leave the conversation in the list
    }
  };

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <div className="flex h-[calc(100vh-280px)] min-h-[400px]">
      {/* Sidebar — conversations (desktop) */}
      <div className="hidden md:block w-64 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <ChatConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={handleSelectConversation}
          onNew={handleNewChat}
          onDelete={handleDeleteConversation}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div
            className="absolute left-0 top-0 bottom-0 w-64 bg-slate-50 dark:bg-slate-800 shadow-lg"
            onClick={e => e.stopPropagation()}
          >
            <ChatConversationList
              conversations={conversations}
              activeId={activeConversationId}
              onSelect={handleSelectConversation}
              onNew={handleNewChat}
              onDelete={handleDeleteConversation}
            />
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile sidebar toggle */}
        <div className="md:hidden border-b border-slate-200 dark:border-slate-700 px-4 py-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
          >
            ☰ Conversations
          </button>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {messages.length === 0 && !error && (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">
                  Alignment Feed AI Assistant
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
                  Ask me about AI alignment research. I can search articles,
                  find related papers, check your recommendations, and more.
                </p>
              </div>
            </div>
          )}

          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {error && (
            <div className="flex justify-start">
              <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400 max-w-[85%]">
                Something went wrong. Please try again.
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSend}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
