import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatArticleCard } from "./ChatArticleCard";
import { type Article } from "~/schemas/article";

const article: Article = {
  hash_id: "abc123",
  title: "Scaling Monosemanticity",
  link: "https://example.com/article",
  text_start: "We present...",
  authors: "Anthropic",
  source: "arxiv",
  published_at: "2024-05-21",
  summary: "An analysis of features in neural networks.",
};

describe("ChatArticleCard", () => {
  it("renders article title", () => {
    render(<ChatArticleCard article={article} />);
    expect(screen.getByText("Scaling Monosemanticity")).toBeInTheDocument();
  });

  it("renders as a link to the article", () => {
    render(<ChatArticleCard article={article} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com/article");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders authors and source", () => {
    render(<ChatArticleCard article={article} />);
    expect(screen.getByText("Anthropic")).toBeInTheDocument();
    expect(screen.getByText("arxiv")).toBeInTheDocument();
  });

  it("renders summary when present", () => {
    render(<ChatArticleCard article={article} />);
    expect(
      screen.getByText("An analysis of features in neural networks.")
    ).toBeInTheDocument();
  });

  it("does not render summary when absent", () => {
    const noSummary = { ...article, summary: undefined };
    render(<ChatArticleCard article={noSummary} />);
    expect(
      screen.queryByText("An analysis of features in neural networks.")
    ).not.toBeInTheDocument();
  });
});
