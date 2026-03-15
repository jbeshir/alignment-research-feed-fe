import { useCallback, useState } from "react";
import { useAuth } from "~/root";
import { type Article } from "~/schemas/article";

interface UseArticleInteractionsOptions {
  article: Article;
  onThumbsUp?: (articleId: string, value: boolean) => Promise<void>;
  onThumbsDown?: (articleId: string, value: boolean) => Promise<void>;
  onMarkAsRead?: (articleId: string) => Promise<void>;
}

interface UseArticleInteractionsResult {
  handleThumbsUp: (e: React.MouseEvent) => Promise<void>;
  handleThumbsDown: (e: React.MouseEvent) => Promise<void>;
  handleMarkAsRead: () => void;
  isUpdating: boolean;
  feedbackError: string | null;
}

export function useArticleInteractions({
  article,
  onThumbsUp,
  onThumbsDown,
  onMarkAsRead,
}: UseArticleInteractionsOptions): UseArticleInteractionsResult {
  const { isAuthenticated } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const thumbsUp = article.thumbs_up ?? false;
  const thumbsDown = article.thumbs_down ?? false;
  const haveRead = article.have_read ?? false;

  const handleThumbsUp = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isAuthenticated) {
        window.location.href = "/auth/login";
        return;
      }
      if (isUpdating || !onThumbsUp) return;
      setIsUpdating(true);
      setFeedbackError(null);
      try {
        await onThumbsUp(article.hash_id, !thumbsUp);
      } catch (error) {
        console.error("Failed to update thumbs up:", error);
        setFeedbackError("Failed to update. Please try again.");
      } finally {
        setIsUpdating(false);
      }
    },
    [isAuthenticated, isUpdating, onThumbsUp, thumbsUp, article.hash_id]
  );

  const handleThumbsDown = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isAuthenticated) {
        window.location.href = "/auth/login";
        return;
      }
      if (isUpdating || !onThumbsDown) return;
      setIsUpdating(true);
      setFeedbackError(null);
      try {
        await onThumbsDown(article.hash_id, !thumbsDown);
      } catch (error) {
        console.error("Failed to update thumbs down:", error);
        setFeedbackError("Failed to update. Please try again.");
      } finally {
        setIsUpdating(false);
      }
    },
    [isAuthenticated, isUpdating, onThumbsDown, thumbsDown, article.hash_id]
  );

  const handleMarkAsRead = useCallback(() => {
    if (!isAuthenticated || !onMarkAsRead || haveRead) return;
    onMarkAsRead(article.hash_id).catch(error => {
      console.error("Failed to mark as read:", error);
    });
  }, [isAuthenticated, onMarkAsRead, haveRead, article.hash_id]);

  return {
    handleThumbsUp,
    handleThumbsDown,
    handleMarkAsRead,
    isUpdating,
    feedbackError,
  };
}
