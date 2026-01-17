import { useCallback } from "react";

/**
 * Hook for making feedback API calls (thumbs up/down, mark as read).
 *
 * Uses the Remix proxy route (/api/articles/:id/feedback) which handles auth server-side.
 */
export function useFeedback() {
  const setThumbsUp = useCallback(
    async (articleId: string, value: boolean): Promise<void> => {
      const response = await fetch(`/api/articles/${articleId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "thumbs_up", value }),
      });

      if (!response.ok) {
        throw new Error("Failed to update thumbs up");
      }
    },
    []
  );

  const setThumbsDown = useCallback(
    async (articleId: string, value: boolean): Promise<void> => {
      const response = await fetch(`/api/articles/${articleId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "thumbs_down", value }),
      });

      if (!response.ok) {
        throw new Error("Failed to update thumbs down");
      }
    },
    []
  );

  const markAsRead = useCallback(
    async (articleId: string, value: boolean): Promise<void> => {
      const response = await fetch(`/api/articles/${articleId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "read", value }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark as read");
      }
    },
    []
  );

  return { setThumbsUp, setThumbsDown, markAsRead };
}
