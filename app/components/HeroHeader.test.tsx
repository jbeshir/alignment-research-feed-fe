import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroHeader } from "./HeroHeader";

vi.mock("~/root", () => ({
  useRootLoaderData: vi.fn(),
}));

import { useRootLoaderData } from "~/root";
const mockUseRootLoaderData = vi.mocked(useRootLoaderData);

describe("HeroHeader", () => {
  it("renders heading text", () => {
    mockUseRootLoaderData.mockReturnValue({
      isAuthenticated: false,
      rssUrl: "",
    });
    render(<HeroHeader showSearch={false} />);
    expect(
      screen.getByText("Your personalised AI Safety research feed.")
    ).toBeInTheDocument();
  });

  it("shows RSS link when rssUrl present", () => {
    mockUseRootLoaderData.mockReturnValue({
      isAuthenticated: false,
      rssUrl: "https://example.com/rss",
    });
    render(<HeroHeader showSearch={false} />);
    expect(screen.getByText("RSS")).toBeInTheDocument();
    expect(screen.getByText("RSS").closest("a")).toHaveAttribute(
      "href",
      "https://example.com/rss"
    );
  });

  it("shows search bar when showSearch is true with callbacks", () => {
    mockUseRootLoaderData.mockReturnValue({
      isAuthenticated: false,
      rssUrl: "",
    });
    render(
      <HeroHeader
        showSearch={true}
        searchQuery=""
        onSearchChange={() => {}}
        onSearch={() => {}}
      />
    );
    expect(screen.getByLabelText("Search articles")).toBeInTheDocument();
  });

  it("hides search bar when showSearch is false", () => {
    mockUseRootLoaderData.mockReturnValue({
      isAuthenticated: false,
      rssUrl: "",
    });
    render(<HeroHeader showSearch={false} />);
    expect(screen.queryByLabelText("Search articles")).not.toBeInTheDocument();
  });
});
