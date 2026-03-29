import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatMessage } from "./ChatMessage";
import { type UIMessage } from "ai";

function makeMessage(
  overrides: Partial<UIMessage> & { role: UIMessage["role"] }
): UIMessage {
  return {
    id: "test-id",
    parts: [],
    ...overrides,
  };
}

describe("ChatMessage", () => {
  it("renders user message text", () => {
    const message = makeMessage({
      role: "user",
      parts: [{ type: "text", text: "Hello world" }],
    });
    render(<ChatMessage message={message} />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders assistant message text", () => {
    const message = makeMessage({
      role: "assistant",
      parts: [{ type: "text", text: "Here are some articles" }],
    });
    render(<ChatMessage message={message} />);
    expect(screen.getByText("Here are some articles")).toBeInTheDocument();
  });

  it("shows loading indicator for active tool calls", () => {
    const message = makeMessage({
      role: "assistant",
      parts: [
        // In AI SDK v5, tool parts use type "tool-<name>" at runtime
        {
          type: "tool-search_articles" as "text",
          toolCallId: "call-1",
          state: "input-available",
          input: { query: "test" },
        } as unknown as { type: "text"; text: string },
      ],
    });
    render(<ChatMessage message={message} />);
    expect(screen.getByText("Searching...")).toBeInTheDocument();
  });

  it("renders article cards from tool results", () => {
    const message = makeMessage({
      role: "assistant",
      parts: [
        { type: "text", text: "Found these:" },
        {
          type: "tool-search_articles" as "text",
          toolCallId: "call-1",
          state: "output-available",
          input: { query: "test" },
          output: {
            data: [
              {
                hash_id: "abc123",
                title: "Test Article",
                link: "https://example.com",
                text_start: "Some text",
                authors: "Author A",
                source: "arxiv",
                published_at: "2024-01-01",
              },
            ],
          },
        } as unknown as { type: "text"; text: string },
      ],
    });
    render(<ChatMessage message={message} />);
    expect(screen.getByText("Test Article")).toBeInTheDocument();
  });

  it("renders markdown in assistant messages", () => {
    const message = makeMessage({
      role: "assistant",
      parts: [
        {
          type: "text",
          text: "Here is a **bold** word and a [link](https://example.com)",
        },
      ],
    });
    render(<ChatMessage message={message} />);
    expect(screen.getByText("bold").tagName).toBe("STRONG");
    const link = screen.getByRole("link", { name: "link" });
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders user messages as plain text without markdown", () => {
    const message = makeMessage({
      role: "user",
      parts: [{ type: "text", text: "This has **asterisks**" }],
    });
    render(<ChatMessage message={message} />);
    expect(screen.getByText("This has **asterisks**")).toBeInTheDocument();
  });

  it("renders markdown lists in assistant messages", () => {
    const message = makeMessage({
      role: "assistant",
      parts: [{ type: "text", text: "- Item one\n- Item two" }],
    });
    render(<ChatMessage message={message} />);
    expect(screen.getByText("Item one")).toBeInTheDocument();
    expect(screen.getByText("Item two")).toBeInTheDocument();
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("ignores malformed articles in tool results", () => {
    const message = makeMessage({
      role: "assistant",
      parts: [
        {
          type: "tool-search_articles" as "text",
          toolCallId: "call-1",
          state: "output-available",
          input: { query: "test" },
          output: {
            data: [
              { hash_id: "abc123" }, // missing required fields
              {
                hash_id: "def456",
                title: "Valid Article",
                link: "https://example.com",
                text_start: "Text",
                authors: "Author",
                source: "arxiv",
                published_at: "2024-01-01",
              },
            ],
          },
        } as unknown as { type: "text"; text: string },
      ],
    });
    render(<ChatMessage message={message} />);
    // Only the valid article should render
    expect(screen.getByText("Valid Article")).toBeInTheDocument();
    expect(screen.queryAllByRole("link")).toHaveLength(1);
  });
});
