import type {
  ChatStorage,
  Conversation,
  ConversationId,
  Message,
  SaveMessageInput,
  UserId,
} from "./chat.server";

export class MemoryChatStorage implements ChatStorage {
  private conversations = new Map<ConversationId, Conversation>();
  private messages = new Map<ConversationId, Message[]>();

  async createConversation(userId: UserId): Promise<ConversationId> {
    const id = crypto.randomUUID() as ConversationId;
    const now = new Date().toISOString();
    this.conversations.set(id, {
      id,
      user_id: userId,
      title: null,
      created_at: now,
      updated_at: now,
    });
    this.messages.set(id, []);
    return id;
  }

  async listConversations(
    userId: UserId,
    limit: number = 50
  ): Promise<Conversation[]> {
    return [...this.conversations.values()]
      .filter(c => c.user_id === userId)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .slice(0, limit);
  }

  async getConversation(
    userId: UserId,
    conversationId: ConversationId
  ): Promise<{ conversation: Conversation; messages: Message[] } | null> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation || conversation.user_id !== userId) return null;
    return {
      conversation,
      messages: this.messages.get(conversationId) ?? [],
    };
  }

  async saveMessages(
    userId: UserId,
    conversationId: ConversationId,
    messages: SaveMessageInput[]
  ): Promise<void> {
    const existing = this.messages.get(conversationId) ?? [];
    const now = new Date().toISOString();
    for (const msg of messages) {
      existing.push({
        id: crypto.randomUUID(),
        user_id: userId,
        conversation_id: conversationId,
        role: msg.role,
        content: msg.content,
        parts_json: msg.partsJson ?? null,
        created_at: now,
      });
    }
    this.messages.set(conversationId, existing);

    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.updated_at = now;
    }
  }

  async updateConversationTitle(
    userId: UserId,
    conversationId: ConversationId,
    title: string
  ): Promise<void> {
    const conversation = this.conversations.get(conversationId);
    if (conversation && conversation.user_id === userId) {
      conversation.title = title;
    }
  }

  async deleteConversation(
    userId: UserId,
    conversationId: ConversationId
  ): Promise<boolean> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation || conversation.user_id !== userId) return false;
    this.conversations.delete(conversationId);
    this.messages.delete(conversationId);
    return true;
  }
}
