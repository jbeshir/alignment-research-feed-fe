import { describe, it, expect } from "vitest";
import { NullChatStorage } from "./chat-null.server";
import type { ChatStorage, UserId, ConversationId } from "./chat.server";

const userId = "user-1" as UserId;

describe("NullChatStorage", () => {
  it("createConversation returns a UUID", async () => {
    const storage: ChatStorage = new NullChatStorage();
    const id = await storage.createConversation(userId);
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it("listConversations returns empty array", async () => {
    const storage: ChatStorage = new NullChatStorage();
    const result = await storage.listConversations(userId);
    expect(result).toEqual([]);
  });

  it("getConversation returns null", async () => {
    const storage: ChatStorage = new NullChatStorage();
    const result = await storage.getConversation(
      userId,
      "conv-1" as ConversationId
    );
    expect(result).toBeNull();
  });

  it("saveMessages completes without error", async () => {
    const storage: ChatStorage = new NullChatStorage();
    await expect(
      storage.saveMessages(userId, "conv-1" as ConversationId, [
        { role: "user", content: "hello" },
      ])
    ).resolves.toBeUndefined();
  });

  it("deleteConversation returns false", async () => {
    const storage: ChatStorage = new NullChatStorage();
    const result = await storage.deleteConversation(
      userId,
      "conv-1" as ConversationId
    );
    expect(result).toBe(false);
  });
});
