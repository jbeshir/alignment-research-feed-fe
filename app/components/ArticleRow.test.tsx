import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRemixStub } from "@remix-run/testing";
import { ArticleRow } from "./ArticleRow";
import { mockArticle } from "~/test/helpers";
import type { Article } from "~/schemas/article";

vi.mock("~/root", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "~/root";
const mockUseAuth = vi.mocked(useAuth);

function renderArticleRow(article: Article) {
  const Stub = createRemixStub([
    {
      path: "/",
      Component: () => <ArticleRow article={article} />,
    },
  ]);
  return render(<Stub />);
}

describe("ArticleRow", () => {
  it("renders article title, author, and source", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    const article = mockArticle({
      title: "Row Test Title",
      authors: "Row Author",
      source: "arxiv",
    });
    renderArticleRow(article);

    expect(await screen.findByText("Row Test Title")).toBeInTheDocument();
    expect(screen.getByText(/Row Author/)).toBeInTheDocument();
    expect(screen.getByText("arXiv")).toBeInTheDocument();
  });

  it("renders thumbnail when thumbnail_url is present", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    const article = mockArticle({
      thumbnail_url: "https://example.com/row-thumb.jpg",
    });
    renderArticleRow(article);

    const img = await screen.findByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/row-thumb.jpg");
  });

  it("does not render thumbnail when thumbnail_url is null", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    const article = mockArticle({ thumbnail_url: null });
    renderArticleRow(article);

    await screen.findByText(article.title);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
