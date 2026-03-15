import { useCallback } from "react";
import { useFeedback } from "./useFeedback";
import { type Article } from "~/schemas/article";

type ArticleUpdater = (updater: (prev: Article[]) => Article[]) => void;

interface UseArticleFeedbackHandlersOptions {
  /** Optional callback to update article list state after feedback */
  setArticles?: ArticleUpdater;
}

interface UseArticleFeedbackHandlersResult {
  handleThumbsUp: (articleId: string, value: boolean) => Promise<void>;
  handleThumbsDown: (articleId: string, value: boolean) => Promise<void>;
  handleMarkAsRead: (articleId: string) => Promise<void>;
}

async function withOptimisticVote(
  articleId: string,
  value: boolean,
  field: "thumbs_up" | "thumbs_down",
  apiCall: (id: string, value: boolean) => Promise<void>,
  setArticles: ArticleUpdater | undefined
): Promise<void> {
  let originalThumbsUp: boolean | null | undefined;
  let originalThumbsDown: boolean | null | undefined;
  const oppositeField = field === "thumbs_up" ? "thumbs_down" : "thumbs_up";

  if (setArticles) {
    setArticles(prev =>
      prev.map(article => {
        if (article.hash_id === articleId) {
          originalThumbsUp = article.thumbs_up;
          originalThumbsDown = article.thumbs_down;
          return {
            ...article,
            [field]: value,
            [oppositeField]: value ? false : article[oppositeField],
          };
        }
        return article;
      })
    );
  }

  try {
    await apiCall(articleId, value);
  } catch (error) {
    if (setArticles) {
      setArticles(prev =>
        prev.map(article =>
          article.hash_id === articleId
            ? {
                ...article,
                thumbs_up: originalThumbsUp,
                thumbs_down: originalThumbsDown,
              }
            : article
        )
      );
    }
    throw error;
  }
}

/**
 * Shared hook for article feedback handlers with optimistic updates.
 * Encapsulates the common pattern of updating feedback state across routes.
 */
export function useArticleFeedbackHandlers(
  options: UseArticleFeedbackHandlersOptions = {}
): UseArticleFeedbackHandlersResult {
  const { setArticles } = options;
  const { sendFeedback } = useFeedback();

  const handleThumbsUp = useCallback(
    (articleId: string, value: boolean) =>
      withOptimisticVote(
        articleId,
        value,
        "thumbs_up",
        (id, val) => sendFeedback(id, "thumbs_up", val),
        setArticles
      ),
    [sendFeedback, setArticles]
  );

  const handleThumbsDown = useCallback(
    (articleId: string, value: boolean) =>
      withOptimisticVote(
        articleId,
        value,
        "thumbs_down",
        (id, val) => sendFeedback(id, "thumbs_down", val),
        setArticles
      ),
    [sendFeedback, setArticles]
  );

  const handleMarkAsRead = useCallback(
    async (articleId: string) => {
      let originalHaveRead: boolean | null | undefined;

      if (setArticles) {
        setArticles(prev =>
          prev.map(article => {
            if (article.hash_id === articleId) {
              originalHaveRead = article.have_read;
              return { ...article, have_read: true };
            }
            return article;
          })
        );
      }

      try {
        await sendFeedback(articleId, "read", true);
      } catch (error) {
        if (setArticles) {
          setArticles(prev =>
            prev.map(article =>
              article.hash_id === articleId
                ? { ...article, have_read: originalHaveRead }
                : article
            )
          );
        }
        throw error;
      }
    },
    [sendFeedback, setArticles]
  );

  return { handleThumbsUp, handleThumbsDown, handleMarkAsRead };
}
