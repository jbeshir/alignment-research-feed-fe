import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRemixStub } from "@remix-run/testing";
import { ArticleCard } from "./ArticleCard";
import { mockArticle } from "~/test/helpers";
import type { Article } from "~/schemas/article";

vi.mock("~/root", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "~/root";
const mockUseAuth = vi.mocked(useAuth);

function renderArticleCard(
  article: Article,
  handlers?: {
    onThumbsUp?: (id: string, value: boolean) => Promise<void>;
    onThumbsDown?: (id: string, value: boolean) => Promise<void>;
    onMarkAsRead?: (id: string) => Promise<void>;
  }
) {
  const Stub = createRemixStub([
    {
      path: "/",
      Component: () => <ArticleCard article={article} {...handlers} />,
    },
  ]);
  return render(<Stub />);
}

describe("ArticleCard", () => {
  it("renders article title, author, and date", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    const article = mockArticle({
      title: "My Test Article",
      authors: "Jane Doe",
      published_at: "2024-01-15T00:00:00Z",
    });
    renderArticleCard(article);

    expect(await screen.findByText("My Test Article")).toBeInTheDocument();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Jan 15, 2024")).toBeInTheDocument();
  });

  it("renders source display name in header", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    const article = mockArticle({ source: "arxiv" });
    renderArticleCard(article);
    expect(await screen.findByText("arXiv")).toBeInTheDocument();
  });

  it("shows category badge when category present", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    const article = mockArticle({ category: "Interpretability" });
    renderArticleCard(article);
    expect(await screen.findByText("Interpretability")).toBeInTheDocument();
  });

  it("calls onThumbsUp on thumbs up click", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    const onThumbsUp = vi.fn().mockResolvedValue(undefined);
    const article = mockArticle({ thumbs_up: false });
    renderArticleCard(article, { onThumbsUp });

    const thumbsUpBtn = await screen.findByLabelText("Thumbs up");
    await userEvent.click(thumbsUpBtn);

    expect(onThumbsUp).toHaveBeenCalledWith(article.hash_id, true);
  });

  it("calls onThumbsDown on thumbs down click", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    const onThumbsDown = vi.fn().mockResolvedValue(undefined);
    const article = mockArticle({ thumbs_down: false });
    renderArticleCard(article, { onThumbsDown });

    const thumbsDownBtn = await screen.findByLabelText("Thumbs down");
    await userEvent.click(thumbsDownBtn);

    expect(onThumbsDown).toHaveBeenCalledWith(article.hash_id, true);
  });

  it("shows Details button", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    renderArticleCard(mockArticle());
    expect(
      await screen.findByLabelText("View article details")
    ).toBeInTheDocument();
  });

  it("renders thumbnail when thumbnail_url is present", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    const article = mockArticle({
      thumbnail_url: "https://example.com/img.jpg",
    });
    renderArticleCard(article);

    const img = await screen.findByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/img.jpg");
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("does not render thumbnail when thumbnail_url is null", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    const article = mockArticle({ thumbnail_url: null });
    renderArticleCard(article);

    await screen.findByText(article.title);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
