import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { getServerAuthContext } from "~/server/auth.server";
import { createChatStorage, type UserId } from "~/server/chat.server";

/**
 * GET /api/chat/conversations
 * Lists the authenticated user's conversations.
 */
export async function loader({ request, context }: LoaderFunctionArgs) {
  const { authContext } = await getServerAuthContext(request, context);

  if (!authContext.isAuthenticated || !authContext.user) {
    return json({ conversations: [] });
  }

  const storage = createChatStorage(context.cloudflare.env);
  const conversations = await storage.listConversations(
    authContext.user.id as UserId
  );
  return json({ conversations });
}
