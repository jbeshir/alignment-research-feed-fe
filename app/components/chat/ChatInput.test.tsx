import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ChatInput } from "./ChatInput";

describe("ChatInput", () => {
  it("renders textarea and send button", () => {
    render(
      <ChatInput
        value=""
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        isLoading={false}
      />
    );
    expect(
      screen.getByPlaceholderText("Ask about alignment research...")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
  });

  it("shows powered by label", () => {
    render(
      <ChatInput
        value=""
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        isLoading={false}
      />
    );
    expect(screen.getByText("Powered by MiniMax")).toBeInTheDocument();
  });

  it("disables textarea and button when loading", () => {
    render(
      <ChatInput
        value="test"
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        isLoading={true}
      />
    );
    expect(
      screen.getByPlaceholderText("Ask about alignment research...")
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "..." })).toBeDisabled();
  });

  it("disables send button when value is empty", () => {
    render(
      <ChatInput
        value=""
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        isLoading={false}
      />
    );
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });

  it("calls onSubmit when form is submitted", () => {
    const onSubmit = vi.fn();
    render(
      <ChatInput
        value="hello"
        onChange={vi.fn()}
        onSubmit={onSubmit}
        isLoading={false}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("calls onChange when textarea value changes", () => {
    const onChange = vi.fn();
    render(
      <ChatInput
        value=""
        onChange={onChange}
        onSubmit={vi.fn()}
        isLoading={false}
      />
    );
    fireEvent.change(
      screen.getByPlaceholderText("Ask about alignment research..."),
      { target: { value: "test" } }
    );
    expect(onChange).toHaveBeenCalledWith("test");
  });
});
