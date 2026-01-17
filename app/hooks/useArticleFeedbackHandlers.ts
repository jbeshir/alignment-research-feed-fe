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

/**
 * Shared hook for article feedback handlers with optimistic updates.
 * Encapsulates the common pattern of updating feedback state across routes.
 */
export function useArticleFeedbackHandlers(
  options: UseArticleFeedbackHandlersOptions = {}
): UseArticleFeedbackHandlersResult {
  const { setArticles } = options;
  const { setThumbsUp, setThumbsDown, markAsRead } = useFeedback();

  const handleThumbsUp = useCallback(
    async (articleId: string, value: boolean) => {
      // Capture original state for rollback
      let originalThumbsUp: boolean | null | undefined;
      let originalThumbsDown: boolean | null | undefined;

      // Optimistic update if setArticles is provided
      if (setArticles) {
        setArticles(prev =>
          prev.map(article => {
            if (article.hash_id === articleId) {
              originalThumbsUp = article.thumbs_up;
              originalThumbsDown = article.thumbs_down;
              return {
                ...article,
                thumbs_up: value,
                thumbs_down: value ? false : article.thumbs_down,
              };
            }
            return article;
          })
        );
      }

      try {
        await setThumbsUp(articleId, value);
      } catch (error) {
        // Rollback to original state on error
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
    },
    [setThumbsUp, setArticles]
  );

  const handleThumbsDown = useCallback(
    async (articleId: string, value: boolean) => {
      // Capture original state for rollback
      let originalThumbsUp: boolean | null | undefined;
      let originalThumbsDown: boolean | null | undefined;

      // Optimistic update if setArticles is provided
      if (setArticles) {
        setArticles(prev =>
          prev.map(article => {
            if (article.hash_id === articleId) {
              originalThumbsUp = article.thumbs_up;
              originalThumbsDown = article.thumbs_down;
              return {
                ...article,
                thumbs_down: value,
                thumbs_up: value ? false : article.thumbs_up,
              };
            }
            return article;
          })
        );
      }

      try {
        await setThumbsDown(articleId, value);
      } catch (error) {
        // Rollback to original state on error
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
    },
    [setThumbsDown, setArticles]
  );

  const handleMarkAsRead = useCallback(
    async (articleId: string) => {
      // Capture original state for rollback
      let originalHaveRead: boolean | null | undefined;

      // Optimistic update if setArticles is provided
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
        await markAsRead(articleId, true);
      } catch (error) {
        // Rollback to original state on error
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
    [markAsRead, setArticles]
  );

  return { handleThumbsUp, handleThumbsDown, handleMarkAsRead };
}
