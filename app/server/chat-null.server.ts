import type {
  ChatStorage,
  Conversation,
  ConversationId,
  Message,
} from "./chat.server";

export class NullChatStorage implements ChatStorage {
  async createConversation(): Promise<ConversationId> {
    return crypto.randomUUID() as ConversationId;
  }

  async listConversations(): Promise<Conversation[]> {
    return [];
  }

  async getConversation(): Promise<{
    conversation: Conversation;
    messages: Message[];
  } | null> {
    return null;
  }

  async saveMessages(): Promise<void> {}

  async updateConversationTitle(): Promise<void> {}

  async deleteConversation(): Promise<boolean> {
    return false;
  }
}
