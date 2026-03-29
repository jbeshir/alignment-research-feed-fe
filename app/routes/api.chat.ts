import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import {
  streamText,
  stepCountIs,
  convertToModelMessages,
  type UIMessage,
} from "ai";
import { createMinimax } from "vercel-minimax-ai-provider";
import {
  createAuthenticatedFetch,
  getServerAuthContext,
} from "~/server/auth.server";
import { createChatTools } from "~/server/chat-tools.server";
import { SYSTEM_PROMPT } from "~/server/chat-system-prompt.server";
import {
  setupChatStorage,
  type UserId,
  type ConversationId,
} from "~/server/chat.server";

/**
 * Streaming chat endpoint.
 * POST /api/chat
 * Body: { messages: UIMessage[], conversationId?: string }
 */
export async function action({ request, context }: ActionFunctionArgs) {
  const env = context.cloudflare.env;

  const body = (await request.json().catch(() => null)) as {
    messages?: UIMessage[];
    conversationId?: string;
  } | null;

  if (!body || !Array.isArray(body.messages)) {
    return json({ error: "Invalid request body" }, { status: 400 });
  }

  const { messages: uiMessages, conversationId: requestedConversationId } =
    body;

  const { authFetch, isAuthenticated } = await createAuthenticatedFetch(
    request,
    context
  );
  const { authContext } = await getServerAuthContext(request, context);
  const rawUserId = authContext.user?.id ?? null;

  if (!isAuthenticated || !rawUserId) {
    return json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = rawUserId as UserId;
  const storage = setupChatStorage(env);
  let conversationId = (requestedConversationId ??
    null) as ConversationId | null;

  if (conversationId) {
    const existing = await storage.getConversation(userId, conversationId);
    if (!existing) {
      return json({ error: "Conversation not found" }, { status: 404 });
    }
  } else {
    conversationId = await storage.createConversation(userId);
  }

  const minimax = createMinimax({ apiKey: env.MINIMAX_API_KEY });

  const tools = createChatTools({
    authFetch,
    apiBaseURL: env.ALIGNMENT_FEED_BASE_URL,
    isAuthenticated,
  });

  // Convert UI messages to model messages for streamText
  const modelMessages = await convertToModelMessages(uiMessages, {
    tools,
    ignoreIncompleteToolCalls: true,
  });

  const result = streamText({
    model: minimax(env.MINIMAX_MODEL),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    tools,
    stopWhen: stepCountIs(5),
    maxOutputTokens: 2048,
    onFinish: async ({ text }) => {
      try {
        // Find the last user message text
        const lastUserMsg = uiMessages[uiMessages.length - 1];
        const userText =
          lastUserMsg?.role === "user"
            ? lastUserMsg.parts
                .filter(
                  (p): p is { type: "text"; text: string } => p.type === "text"
                )
                .map(p => p.text)
                .join("")
            : null;

        if (userText) {
          await storage.saveMessages(userId, conversationId, [
            { role: "user", content: userText },
            { role: "assistant", content: text },
          ]);

          // Set conversation title from first user message
          if (uiMessages.length <= 1) {
            await storage.updateConversationTitle(
              userId,
              conversationId,
              userText.slice(0, 100)
            );
          }
        }
      } catch (error) {
        console.error("Failed to persist chat messages:", error);
      }
    },
  });

  const response = result.toUIMessageStreamResponse();

  if (conversationId) {
    const headers = new Headers(response.headers);
    headers.set("X-Conversation-Id", conversationId);
    return new Response(response.body, {
      status: response.status,
      headers,
    });
  }

  return response;
}
