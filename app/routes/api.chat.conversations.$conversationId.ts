import type {
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { getServerAuthContext } from "~/server/auth.server";
import {
  createChatStorage,
  type UserId,
  type ConversationId,
} from "~/server/chat.server";

/**
 * GET /api/chat/conversations/:conversationId
 * Loads a conversation with its messages.
 */
export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const conversationId = params.conversationId;
  if (!conversationId) {
    return json({ error: "Conversation ID required" }, { status: 400 });
  }

  const { authContext } = await getServerAuthContext(request, context);

  if (!authContext.isAuthenticated || !authContext.user) {
    return json({ error: "Not authenticated" }, { status: 401 });
  }

  const storage = createChatStorage(context.cloudflare.env);
  const result = await storage.getConversation(
    authContext.user.id as UserId,
    conversationId as ConversationId
  );

  if (!result) {
    return json({ error: "Conversation not found" }, { status: 404 });
  }

  return json(result);
}

/**
 * DELETE /api/chat/conversations/:conversationId
 * Deletes a conversation.
 */
export async function action({ request, params, context }: ActionFunctionArgs) {
  if (request.method !== "DELETE") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const conversationId = params.conversationId;
  if (!conversationId) {
    return json({ error: "Conversation ID required" }, { status: 400 });
  }

  const { authContext } = await getServerAuthContext(request, context);

  if (!authContext.isAuthenticated || !authContext.user) {
    return json({ error: "Not authenticated" }, { status: 401 });
  }

  const storage = createChatStorage(context.cloudflare.env);
  const deleted = await storage.deleteConversation(
    authContext.user.id as UserId,
    conversationId as ConversationId
  );

  if (!deleted) {
    return json({ error: "Conversation not found" }, { status: 404 });
  }

  return json({ success: true });
}
