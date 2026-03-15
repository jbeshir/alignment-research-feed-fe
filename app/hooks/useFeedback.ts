import { useCallback } from "react";

type FeedbackAction = "thumbs_up" | "thumbs_down" | "read";

/**
 * Hook for making feedback API calls (thumbs up/down, mark as read).
 *
 * Uses the Remix proxy route (/api/articles/:id/feedback) which handles auth server-side.
 */
export function useFeedback() {
  const sendFeedback = useCallback(
    async (
      articleId: string,
      action: FeedbackAction,
      value: boolean
    ): Promise<void> => {
      const response = await fetch(`/api/articles/${articleId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, value }),
      });

      if (!response.ok) {
        throw new Error(`Feedback request failed: ${response.status}`);
      }
    },
    []
  );

  return { sendFeedback };
}
