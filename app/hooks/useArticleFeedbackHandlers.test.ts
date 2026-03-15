import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useArticleFeedbackHandlers } from "./useArticleFeedbackHandlers";
import type { Article } from "~/schemas/article";
import { mockArticle } from "~/test/helpers";

// Mock the useFeedback hook
const mockSetThumbsUp = vi.fn();
const mockSetThumbsDown = vi.fn();
const mockMarkAsRead = vi.fn();

vi.mock("./useFeedback", () => ({
  useFeedback: () => ({
    setThumbsUp: mockSetThumbsUp,
    setThumbsDown: mockSetThumbsDown,
    markAsRead: mockMarkAsRead,
  }),
}));

/**
 * Creates a setArticles mock that behaves like React setState:
 * stores current state and applies updaters to it.
 */
function createArticleState(initial: Article[]) {
  let articles = [...initial];
  const setArticles = vi.fn((updater: (prev: Article[]) => Article[]) => {
    articles = updater(articles);
  });
  return {
    setArticles,
    /** Returns the first article. Only use when the state was initialized with at least one article. */
    get first() {
      return articles[0]!;
    },
  };
}

describe("useArticleFeedbackHandlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSetThumbsUp.mockResolvedValue(undefined);
    mockSetThumbsDown.mockResolvedValue(undefined);
    mockMarkAsRead.mockResolvedValue(undefined);
  });

  it("handleThumbsUp calls setThumbsUp", async () => {
    const { result } = renderHook(() => useArticleFeedbackHandlers());
    await act(() => result.current.handleThumbsUp("id-1", true));
    expect(mockSetThumbsUp).toHaveBeenCalledWith("id-1", true);
  });

  it("handleThumbsUp optimistically updates articles", async () => {
    const state = createArticleState([
      mockArticle({ hash_id: "id-1", thumbs_up: false, thumbs_down: true }),
    ]);

    const { result } = renderHook(() =>
      useArticleFeedbackHandlers({ setArticles: state.setArticles })
    );
    await act(() => result.current.handleThumbsUp("id-1", true));

    expect(state.setArticles).toHaveBeenCalled();
    expect(state.first.thumbs_up).toBe(true);
    expect(state.first.thumbs_down).toBe(false);
  });

  it("handleThumbsUp rolls back on API error", async () => {
    mockSetThumbsUp.mockRejectedValue(new Error("API error"));

    const state = createArticleState([
      mockArticle({ hash_id: "id-1", thumbs_up: false, thumbs_down: true }),
    ]);

    const { result } = renderHook(() =>
      useArticleFeedbackHandlers({ setArticles: state.setArticles })
    );

    let caughtError: Error | undefined;
    await act(async () => {
      try {
        await result.current.handleThumbsUp("id-1", true);
      } catch (e) {
        caughtError = e as Error;
      }
    });

    expect(caughtError?.message).toBe("API error");
    // Called twice: optimistic update + rollback
    expect(state.setArticles).toHaveBeenCalledTimes(2);
    // After rollback: original state restored
    expect(state.first.thumbs_up).toBe(false);
    expect(state.first.thumbs_down).toBe(true);
  });

  it("handleThumbsUp without setArticles just calls API", async () => {
    const { result } = renderHook(() => useArticleFeedbackHandlers());
    await act(() => result.current.handleThumbsUp("id-1", true));
    expect(mockSetThumbsUp).toHaveBeenCalledWith("id-1", true);
  });

  it("handleThumbsDown calls setThumbsDown and clears thumbsUp", async () => {
    const state = createArticleState([
      mockArticle({ hash_id: "id-1", thumbs_up: true, thumbs_down: false }),
    ]);

    const { result } = renderHook(() =>
      useArticleFeedbackHandlers({ setArticles: state.setArticles })
    );
    await act(() => result.current.handleThumbsDown("id-1", true));

    expect(mockSetThumbsDown).toHaveBeenCalledWith("id-1", true);
    expect(state.first.thumbs_down).toBe(true);
    expect(state.first.thumbs_up).toBe(false);
  });

  it("handleThumbsDown rolls back on error", async () => {
    mockSetThumbsDown.mockRejectedValue(new Error("fail"));

    const state = createArticleState([
      mockArticle({ hash_id: "id-1", thumbs_up: true, thumbs_down: false }),
    ]);

    const { result } = renderHook(() =>
      useArticleFeedbackHandlers({ setArticles: state.setArticles })
    );

    let caughtError: Error | undefined;
    await act(async () => {
      try {
        await result.current.handleThumbsDown("id-1", true);
      } catch (e) {
        caughtError = e as Error;
      }
    });

    expect(caughtError?.message).toBe("fail");
    expect(state.first.thumbs_up).toBe(true);
    expect(state.first.thumbs_down).toBe(false);
  });

  it("handleMarkAsRead optimistically sets have_read=true", async () => {
    const state = createArticleState([
      mockArticle({ hash_id: "id-1", have_read: false }),
    ]);

    const { result } = renderHook(() =>
      useArticleFeedbackHandlers({ setArticles: state.setArticles })
    );
    await act(() => result.current.handleMarkAsRead("id-1"));

    expect(mockMarkAsRead).toHaveBeenCalledWith("id-1");
    expect(state.first.have_read).toBe(true);
  });

  it("handleMarkAsRead rolls back on error", async () => {
    mockMarkAsRead.mockRejectedValue(new Error("fail"));

    const state = createArticleState([
      mockArticle({ hash_id: "id-1", have_read: false }),
    ]);

    const { result } = renderHook(() =>
      useArticleFeedbackHandlers({ setArticles: state.setArticles })
    );

    let caughtError: Error | undefined;
    await act(async () => {
      try {
        await result.current.handleMarkAsRead("id-1");
      } catch (e) {
        caughtError = e as Error;
      }
    });

    expect(caughtError?.message).toBe("fail");
    expect(state.first.have_read).toBe(false);
  });
});
