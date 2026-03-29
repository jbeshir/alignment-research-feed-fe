import { describe, it, expect } from "vitest";
import { MemoryChatStorage } from "./chat-memory.server";
import type { UserId, ConversationId } from "./chat.server";

const userId = "user-1" as UserId;
const otherUserId = "user-2" as UserId;

describe("MemoryChatStorage", () => {
  it("creates and retrieves a conversation", async () => {
    const storage = new MemoryChatStorage();
    const id = await storage.createConversation(userId);
    const result = await storage.getConversation(userId, id);
    expect(result).not.toBeNull();
    expect(result!.conversation.id).toBe(id);
    expect(result!.conversation.user_id).toBe(userId);
    expect(result!.messages).toEqual([]);
  });

  it("lists conversations ordered by updated_at desc", async () => {
    const storage = new MemoryChatStorage();
    const id1 = await storage.createConversation(userId);
    const id2 = await storage.createConversation(userId);

    // Save a message to id1 to update its timestamp
    await storage.saveMessages(userId, id1, [
      { role: "user", content: "hello" },
    ]);

    const conversations = await storage.listConversations(userId);
    expect(conversations).toHaveLength(2);
    // id1 was updated more recently
    expect(conversations[0]!.id).toBe(id1);
    expect(conversations[1]!.id).toBe(id2);
  });

  it("isolates conversations by user", async () => {
    const storage = new MemoryChatStorage();
    await storage.createConversation(userId);
    await storage.createConversation(otherUserId);

    expect(await storage.listConversations(userId)).toHaveLength(1);
    expect(await storage.listConversations(otherUserId)).toHaveLength(1);
  });

  it("prevents accessing another user's conversation", async () => {
    const storage = new MemoryChatStorage();
    const id = await storage.createConversation(userId);
    const result = await storage.getConversation(otherUserId, id);
    expect(result).toBeNull();
  });

  it("saves and retrieves messages", async () => {
    const storage = new MemoryChatStorage();
    const id = await storage.createConversation(userId);

    await storage.saveMessages(userId, id, [
      { role: "user", content: "What is RLHF?" },
      { role: "assistant", content: "RLHF stands for..." },
    ]);

    const result = await storage.getConversation(userId, id);
    expect(result!.messages).toHaveLength(2);
    expect(result!.messages[0]!.role).toBe("user");
    expect(result!.messages[0]!.content).toBe("What is RLHF?");
    expect(result!.messages[1]!.role).toBe("assistant");
  });

  it("updates conversation title", async () => {
    const storage = new MemoryChatStorage();
    const id = await storage.createConversation(userId);

    await storage.updateConversationTitle(userId, id, "My Chat");
    const result = await storage.getConversation(userId, id);
    expect(result!.conversation.title).toBe("My Chat");
  });

  it("does not update title for wrong user", async () => {
    const storage = new MemoryChatStorage();
    const id = await storage.createConversation(userId);

    await storage.updateConversationTitle(otherUserId, id, "Hacked");
    const result = await storage.getConversation(userId, id);
    expect(result!.conversation.title).toBeNull();
  });

  it("deletes a conversation", async () => {
    const storage = new MemoryChatStorage();
    const id = await storage.createConversation(userId);

    const deleted = await storage.deleteConversation(userId, id);
    expect(deleted).toBe(true);
    expect(await storage.getConversation(userId, id)).toBeNull();
    expect(await storage.listConversations(userId)).toHaveLength(0);
  });

  it("does not delete another user's conversation", async () => {
    const storage = new MemoryChatStorage();
    const id = await storage.createConversation(userId);

    const deleted = await storage.deleteConversation(otherUserId, id);
    expect(deleted).toBe(false);
    expect(await storage.getConversation(userId, id)).not.toBeNull();
  });

  it("respects limit on listConversations", async () => {
    const storage = new MemoryChatStorage();
    await storage.createConversation(userId);
    await storage.createConversation(userId);
    await storage.createConversation(userId);

    const limited = await storage.listConversations(userId, 2);
    expect(limited).toHaveLength(2);
  });

  it("returns false when deleting non-existent conversation", async () => {
    const storage = new MemoryChatStorage();
    const deleted = await storage.deleteConversation(
      userId,
      "nonexistent" as ConversationId
    );
    expect(deleted).toBe(false);
  });
});
