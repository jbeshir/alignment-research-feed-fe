import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ViewToggle } from "./ViewToggle";

describe("ViewToggle", () => {
  it("renders list and grid buttons with correct aria-pressed", () => {
    render(<ViewToggle viewMode="list" onChange={() => {}} />);
    expect(screen.getByLabelText("List view")).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByLabelText("Grid view")).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });

  it("grid mode has correct aria-pressed", () => {
    render(<ViewToggle viewMode="grid" onChange={() => {}} />);
    expect(screen.getByLabelText("List view")).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(screen.getByLabelText("Grid view")).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it('calls onChange with "grid" when grid button clicked', async () => {
    const onChange = vi.fn();
    render(<ViewToggle viewMode="list" onChange={onChange} />);
    await userEvent.click(screen.getByLabelText("Grid view"));
    expect(onChange).toHaveBeenCalledWith("grid");
  });

  it('calls onChange with "list" when list button clicked', async () => {
    const onChange = vi.fn();
    render(<ViewToggle viewMode="grid" onChange={onChange} />);
    await userEvent.click(screen.getByLabelText("List view"));
    expect(onChange).toHaveBeenCalledWith("list");
  });
});
