import type { ActionFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { createMinimax } from "vercel-minimax-ai-provider";
import {
  createAuthenticatedFetch,
  getServerAuthContext,
} from "~/server/auth.server";
import { createChatTools } from "~/server/chat-tools.server";
import { SYSTEM_PROMPT } from "~/server/chat-system-prompt.server";
import {
  createChatStorage,
  type UserId,
  type ConversationId,
} from "~/server/chat.server";

/**
 * Stops generation after `maxToolSteps` tool-calling steps, but only once
 * the model produces a step without tool calls (the text summary).
 * This ensures the model always gets a chance to respond with text after
 * its tool calls, rather than being cut off mid-tool-use.
 */
function stopAfterToolSteps(maxToolSteps: number) {
  return ({ steps }: { steps: Array<{ toolCalls: unknown[] }> }) => {
    const lastStep = steps[steps.length - 1];
    const hasToolCallsInLastStep =
      lastStep != null && lastStep.toolCalls.length > 0;
    const toolSteps = steps.filter(s => s.toolCalls.length > 0).length;
    // Stop if we've hit the tool limit AND the last step was text-only,
    // OR if we've exceeded the limit (hard cap safety)
    return (
      (toolSteps >= maxToolSteps && !hasToolCallsInLastStep) ||
      steps.length >= maxToolSteps + 2
    );
  };
}

function extractTextFromMessage(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map(p => p.text)
    .join("");
}

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

  let storage;
  try {
    storage = createChatStorage(env);
  } catch (error) {
    console.error("Failed to create chat storage:", error);
    return json({ error: "Chat service is not configured" }, { status: 503 });
  }

  let conversationId = (requestedConversationId ??
    null) as ConversationId | null;

  try {
    if (conversationId) {
      const existing = await storage.getConversation(userId, conversationId);
      if (!existing) {
        return json({ error: "Conversation not found" }, { status: 404 });
      }
    } else {
      conversationId = await storage.createConversation(userId);
    }
  } catch (error) {
    console.error("Chat storage error:", error);
    return json({ error: "Failed to load conversation" }, { status: 500 });
  }

  const minimax = createMinimax({ apiKey: env.MINIMAX_API_KEY });

  const tools = createChatTools({
    authFetch,
    apiBaseURL: env.ALIGNMENT_FEED_BASE_URL,
    isAuthenticated,
  });

  let modelMessages;
  try {
    modelMessages = await convertToModelMessages(uiMessages, {
      tools,
      ignoreIncompleteToolCalls: true,
    });
  } catch (error) {
    console.error("Failed to convert messages:", error);
    return json({ error: "Failed to process messages" }, { status: 400 });
  }

  const result = streamText({
    model: minimax(env.MINIMAX_MODEL),
    system: SYSTEM_PROMPT,
    messages: modelMessages,
    tools,
    stopWhen: stopAfterToolSteps(5),
    maxOutputTokens: 2048,
  });

  const response = result.toUIMessageStreamResponse({
    originalMessages: uiMessages,
    onFinish: async ({ messages }) => {
      try {
        // Find the new messages (user + assistant) added since the previous state
        // The SDK gives us the complete updated message list
        const lastUserMsg = uiMessages[uiMessages.length - 1];
        const responseMsg = messages[messages.length - 1];
        if (!lastUserMsg || !responseMsg) return;

        const userText = extractTextFromMessage(lastUserMsg);
        const assistantText = extractTextFromMessage(responseMsg);

        await storage.saveMessages(userId, conversationId, [
          {
            role: "user",
            content: userText,
            partsJson: JSON.stringify(lastUserMsg.parts),
          },
          {
            role: "assistant",
            content: assistantText,
            partsJson: JSON.stringify(responseMsg.parts),
          },
        ]);

        if (uiMessages.length <= 1) {
          await storage.updateConversationTitle(
            userId,
            conversationId,
            userText.slice(0, 100)
          );
        }
      } catch (error) {
        console.error("Failed to persist chat messages:", error);
      }
    },
  });

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
