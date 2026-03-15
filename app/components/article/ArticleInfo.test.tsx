import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArticleInfo } from "./ArticleInfo";
import { mockArticle } from "~/test/helpers";

describe("ArticleInfo", () => {
  it("renders article title", () => {
    render(
      <ArticleInfo article={mockArticle({ title: "Alignment Advances" })} />
    );
    expect(
      screen.getByRole("heading", { name: "Alignment Advances" })
    ).toBeInTheDocument();
  });

  it("renders authors and formatted date", () => {
    render(
      <ArticleInfo
        article={mockArticle({
          authors: "Jane Doe",
          published_at: "2024-01-15T00:00:00Z",
        })}
      />
    );
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Jan 15, 2024")).toBeInTheDocument();
  });

  it("shows thumbs-up in active state when article.thumbs_up is true", () => {
    render(<ArticleInfo article={mockArticle({ thumbs_up: true })} />);
    expect(screen.getByLabelText("Remove thumbs up")).toBeInTheDocument();
  });

  it("shows thumbs-up in inactive state when article.thumbs_up is false", () => {
    render(<ArticleInfo article={mockArticle({ thumbs_up: false })} />);
    expect(screen.getByLabelText("Thumbs up")).toBeInTheDocument();
  });

  it("shows Read indicator when have_read is true", () => {
    render(<ArticleInfo article={mockArticle({ have_read: true })} />);
    expect(screen.getByText("Read")).toBeInTheDocument();
  });

  it("does not show Read indicator when have_read is false", () => {
    render(<ArticleInfo article={mockArticle({ have_read: false })} />);
    expect(screen.queryByText("Read")).not.toBeInTheDocument();
  });

  it("renders thumbnail img when thumbnail_url is present", () => {
    render(
      <ArticleInfo
        article={mockArticle({ thumbnail_url: "https://example.com/img.jpg" })}
      />
    );
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://example.com/img.jpg");
  });

  it("falls back to ThumbnailPlaceholder when thumbnail_url is null", () => {
    render(<ArticleInfo article={mockArticle({ thumbnail_url: null })} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByTestId("thumbnail-placeholder")).toBeInTheDocument();
  });

  it("calls onThumbsUp with toggled value when thumbs-up clicked", async () => {
    const onThumbsUp = vi.fn().mockResolvedValue(undefined);
    const article = mockArticle({ thumbs_up: false });
    render(<ArticleInfo article={article} onThumbsUp={onThumbsUp} />);

    await userEvent.click(screen.getByLabelText("Thumbs up"));

    expect(onThumbsUp).toHaveBeenCalledWith(article.hash_id, true);
  });

  it("calls onThumbsDown with toggled value when thumbs-down clicked", async () => {
    const onThumbsDown = vi.fn().mockResolvedValue(undefined);
    const article = mockArticle({ thumbs_down: true });
    render(<ArticleInfo article={article} onThumbsDown={onThumbsDown} />);

    await userEvent.click(screen.getByLabelText("Remove thumbs down"));

    expect(onThumbsDown).toHaveBeenCalledWith(article.hash_id, false);
  });

  it("disables buttons when isUpdating is true", () => {
    render(<ArticleInfo article={mockArticle()} isUpdating={true} />);
    expect(screen.getByLabelText("Thumbs up")).toBeDisabled();
    expect(screen.getByLabelText("Thumbs down")).toBeDisabled();
  });
});
