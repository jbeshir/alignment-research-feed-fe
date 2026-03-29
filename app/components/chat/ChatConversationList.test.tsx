import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatConversationList } from "./ChatConversationList";
import {
  type Conversation,
  type UserId,
  type ConversationId,
} from "~/server/chat.server";

function makeConversation(
  overrides: Omit<Partial<Conversation>, "id"> & { id: string }
): Conversation {
  const { id, ...rest } = overrides;
  return {
    id: id as ConversationId,
    user_id: "user-1" as UserId,
    title: null,
    created_at: "2024-01-01T00:00:00",
    updated_at: "2024-01-01T00:00:00",
    ...rest,
  };
}

describe("ChatConversationList", () => {
  it("renders empty state when no conversations", () => {
    render(
      <ChatConversationList
        conversations={[]}
        activeId={null}
        onSelect={vi.fn()}
        onNew={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText("No conversations yet")).toBeInTheDocument();
  });

  it("renders conversation titles", () => {
    const conversations = [
      makeConversation({ id: "1", title: "About RLHF" }),
      makeConversation({ id: "2", title: "Interpretability research" }),
    ];
    render(
      <ChatConversationList
        conversations={conversations}
        activeId={null}
        onSelect={vi.fn()}
        onNew={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText("About RLHF")).toBeInTheDocument();
    expect(screen.getByText("Interpretability research")).toBeInTheDocument();
  });

  it("shows 'New conversation' for untitled conversations", () => {
    const conversations = [makeConversation({ id: "1", title: null })];
    render(
      <ChatConversationList
        conversations={conversations}
        activeId={null}
        onSelect={vi.fn()}
        onNew={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByText("New conversation")).toBeInTheDocument();
  });

  it("calls onNew when New Chat button is clicked", () => {
    const onNew = vi.fn();
    render(
      <ChatConversationList
        conversations={[]}
        activeId={null}
        onSelect={vi.fn()}
        onNew={onNew}
        onDelete={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText("+ New Chat"));
    expect(onNew).toHaveBeenCalledOnce();
  });

  it("calls onSelect when a conversation is clicked", () => {
    const onSelect = vi.fn();
    const conversations = [
      makeConversation({ id: "conv-1", title: "My Chat" }),
    ];
    render(
      <ChatConversationList
        conversations={conversations}
        activeId={null}
        onSelect={onSelect}
        onNew={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText("My Chat"));
    expect(onSelect).toHaveBeenCalledWith("conv-1");
  });
});
