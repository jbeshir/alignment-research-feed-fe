import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { EmptyState } from "./EmptyState";
import { InboxIcon } from "~/components/layout/Icons";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(
      <MemoryRouter>
        <EmptyState
          icon={<InboxIcon />}
          title="No articles yet"
          description="New research will appear here."
        />
      </MemoryRouter>
    );
    expect(screen.getByText("No articles yet")).toBeInTheDocument();
    expect(
      screen.getByText("New research will appear here.")
    ).toBeInTheDocument();
  });

  it("renders action button when action.to is provided", () => {
    render(
      <MemoryRouter>
        <EmptyState
          icon={<InboxIcon />}
          title="No articles"
          action={{ label: "Browse feed", to: "/" }}
        />
      </MemoryRouter>
    );
    expect(
      screen.getByRole("button", { name: "Browse feed" })
    ).toBeInTheDocument();
  });

  it("fires onClick when action.onClick button is clicked", () => {
    const onClick = vi.fn();
    render(
      <MemoryRouter>
        <EmptyState
          icon={<InboxIcon />}
          title="No articles"
          action={{ label: "Refresh", onClick }}
        />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: "Refresh" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders icon as svg", () => {
    const { container } = render(
      <MemoryRouter>
        <EmptyState icon={<InboxIcon />} title="No articles" />
      </MemoryRouter>
    );
    expect(container.querySelector("svg")).toBeTruthy();
  });
});
