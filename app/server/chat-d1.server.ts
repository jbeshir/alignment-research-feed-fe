import type {
  ChatStorage,
  Conversation,
  ConversationId,
  Message,
  SaveMessageInput,
  UserId,
} from "./chat.server";

export class D1ChatStorage implements ChatStorage {
  constructor(private db: D1Database) {}

  async createConversation(userId: UserId): Promise<ConversationId> {
    const id = crypto.randomUUID() as ConversationId;
    await this.db
      .prepare("INSERT INTO conversations (id, user_id) VALUES (?1, ?2)")
      .bind(id, userId)
      .run();
    return id;
  }

  async listConversations(
    userId: UserId,
    limit: number = 50
  ): Promise<Conversation[]> {
    const result = await this.db
      .prepare(
        "SELECT * FROM conversations WHERE user_id = ?1 ORDER BY updated_at DESC LIMIT ?2"
      )
      .bind(userId, limit)
      .all<Conversation>();
    return result.results;
  }

  async getConversation(
    userId: UserId,
    conversationId: ConversationId
  ): Promise<{ conversation: Conversation; messages: Message[] } | null> {
    const conversation = await this.db
      .prepare("SELECT * FROM conversations WHERE id = ?1 AND user_id = ?2")
      .bind(conversationId, userId)
      .first<Conversation>();

    if (!conversation) return null;

    const messagesResult = await this.db
      .prepare(
        "SELECT * FROM messages WHERE user_id = ?1 AND conversation_id = ?2 ORDER BY created_at ASC"
      )
      .bind(userId, conversationId)
      .all<Message>();

    return { conversation, messages: messagesResult.results };
  }

  async saveMessages(
    userId: UserId,
    conversationId: ConversationId,
    messages: SaveMessageInput[]
  ): Promise<void> {
    const batch = messages.map(msg =>
      this.db
        .prepare(
          "INSERT INTO messages (id, user_id, conversation_id, role, content, tool_calls, tool_results) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)"
        )
        .bind(
          crypto.randomUUID(),
          userId,
          conversationId,
          msg.role,
          msg.content,
          msg.toolCalls ?? null,
          msg.toolResults ?? null
        )
    );

    batch.push(
      this.db
        .prepare(
          "UPDATE conversations SET updated_at = datetime('now') WHERE id = ?1"
        )
        .bind(conversationId)
    );

    await this.db.batch(batch);
  }

  async updateConversationTitle(
    userId: UserId,
    conversationId: ConversationId,
    title: string
  ): Promise<void> {
    await this.db
      .prepare(
        "UPDATE conversations SET title = ?1 WHERE id = ?2 AND user_id = ?3"
      )
      .bind(title, conversationId, userId)
      .run();
  }

  async deleteConversation(
    userId: UserId,
    conversationId: ConversationId
  ): Promise<boolean> {
    const result = await this.db
      .prepare("DELETE FROM conversations WHERE id = ?1 AND user_id = ?2")
      .bind(conversationId, userId)
      .run();
    return result.meta.changes > 0;
  }
}
