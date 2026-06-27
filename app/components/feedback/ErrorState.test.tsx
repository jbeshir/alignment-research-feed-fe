import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ErrorState } from "./ErrorState";

describe("ErrorState", () => {
  it("renders default title and description", () => {
    render(
      <MemoryRouter>
        <ErrorState />
      </MemoryRouter>
    );
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText("We couldn’t load this content. Please try again.")
    ).toBeInTheDocument();
  });

  it("renders custom title and description", () => {
    render(
      <MemoryRouter>
        <ErrorState title="Custom error" description="Custom description" />
      </MemoryRouter>
    );
    expect(screen.getByText("Custom error")).toBeInTheDocument();
    expect(screen.getByText("Custom description")).toBeInTheDocument();
  });

  it("fires onRetry when retry button is clicked", () => {
    const onRetry = vi.fn();
    render(
      <MemoryRouter>
        <ErrorState onRetry={onRetry} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("renders back link when backTo is provided", () => {
    render(
      <MemoryRouter>
        <ErrorState backTo="/" backLabel="Go home" />
      </MemoryRouter>
    );
    expect(screen.getByRole("button", { name: "Go home" })).toBeInTheDocument();
  });
});
