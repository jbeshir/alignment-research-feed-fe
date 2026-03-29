/**
 * Chat storage driver interface and factory.
 *
 * Configured via CHAT_STORAGE_DRIVER env var:
 *   - "d1": Cloudflare D1 persistence (requires CHAT_DB binding)
 *   - "null" or unset: No-op, chat works but history is not persisted
 */

export type UserId = string & { readonly __brand: "UserId" };
export type ConversationId = string & { readonly __brand: "ConversationId" };

export type Conversation = {
  id: ConversationId;
  user_id: UserId;
  title: string | null;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  user_id: UserId;
  conversation_id: ConversationId;
  role: "user" | "assistant" | "tool";
  content: string;
  tool_calls: string | null;
  tool_results: string | null;
  created_at: string;
};

export type SaveMessageInput = {
  role: "user" | "assistant" | "tool";
  content: string;
  toolCalls?: string;
  toolResults?: string;
};

export interface ChatStorage {
  createConversation(userId: UserId): Promise<ConversationId>;
  listConversations(userId: UserId, limit?: number): Promise<Conversation[]>;
  getConversation(
    userId: UserId,
    conversationId: ConversationId
  ): Promise<{ conversation: Conversation; messages: Message[] } | null>;
  saveMessages(
    userId: UserId,
    conversationId: ConversationId,
    messages: SaveMessageInput[]
  ): Promise<void>;
  updateConversationTitle(
    userId: UserId,
    conversationId: ConversationId,
    title: string
  ): Promise<void>;
  deleteConversation(
    userId: UserId,
    conversationId: ConversationId
  ): Promise<boolean>;
}

import { D1ChatStorage } from "./chat-d1.server";
import { MemoryChatStorage } from "./chat-memory.server";
import { NullChatStorage } from "./chat-null.server";

type ChatEnv = {
  CHAT_STORAGE_DRIVER?: string;
  CHAT_DB?: D1Database;
};

export function setupChatStorage(env: ChatEnv): ChatStorage {
  const driver = env.CHAT_STORAGE_DRIVER;
  if (!driver) {
    throw new Error("CHAT_STORAGE_DRIVER env var is required");
  }

  switch (driver) {
    case "d1": {
      if (!env.CHAT_DB) {
        throw new Error(
          "CHAT_STORAGE_DRIVER=d1 requires CHAT_DB binding to be configured"
        );
      }
      return new D1ChatStorage(env.CHAT_DB);
    }
    case "memory":
      return new MemoryChatStorage();
    case "null":
      return new NullChatStorage();
    default:
      throw new Error(`Unknown chat storage driver: ${driver}`);
  }
}
