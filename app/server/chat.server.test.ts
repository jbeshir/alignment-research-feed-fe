import { describe, it, expect } from "vitest";
import { createChatStorage } from "./chat.server";
import { NullChatStorage } from "./chat-null.server";
import { MemoryChatStorage } from "./chat-memory.server";
import { D1ChatStorage } from "./chat-d1.server";

describe("createChatStorage", () => {
  it("returns NullChatStorage for 'null' driver", () => {
    const storage = createChatStorage({ CHAT_STORAGE_DRIVER: "null" });
    expect(storage).toBeInstanceOf(NullChatStorage);
  });

  it("returns MemoryChatStorage for 'memory' driver", () => {
    const storage = createChatStorage({ CHAT_STORAGE_DRIVER: "memory" });
    expect(storage).toBeInstanceOf(MemoryChatStorage);
  });

  it("returns same MemoryChatStorage instance across calls", () => {
    const a = createChatStorage({ CHAT_STORAGE_DRIVER: "memory" });
    const b = createChatStorage({ CHAT_STORAGE_DRIVER: "memory" });
    expect(a).toBe(b);
  });

  it("returns D1ChatStorage for 'd1' driver with CHAT_DB", () => {
    const fakeDb = {} as D1Database;
    const storage = createChatStorage({
      CHAT_STORAGE_DRIVER: "d1",
      CHAT_DB: fakeDb,
    });
    expect(storage).toBeInstanceOf(D1ChatStorage);
  });

  it("throws for 'd1' driver without CHAT_DB", () => {
    expect(() => createChatStorage({ CHAT_STORAGE_DRIVER: "d1" })).toThrow(
      "CHAT_DB"
    );
  });

  it("throws for unknown driver", () => {
    expect(() => createChatStorage({ CHAT_STORAGE_DRIVER: "redis" })).toThrow(
      "Unknown chat storage driver: redis"
    );
  });
});
