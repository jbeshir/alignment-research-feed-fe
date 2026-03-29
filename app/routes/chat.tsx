import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { Link, useLoaderData } from "@remix-run/react";
import { TopBar } from "~/components/layout/TopBar";
import { HeroHeader } from "~/components/layout/HeroHeader";
import { Tabs } from "~/components/ui/Tabs";
import { Button } from "~/components/ui/Button";
import { MAIN_TABS } from "~/constants/navigation";
import { ChatPanel } from "~/components/chat/ChatPanel";
import { getServerAuthContext } from "~/server/auth.server";
import {
  createChatStorage,
  type Conversation,
  type UserId,
} from "~/server/chat.server";

export const meta: MetaFunction = () => {
  return [
    { title: "AI Assistant - Alignment Feed" },
    {
      name: "description",
      content:
        "Chat with an AI assistant about AI alignment research articles.",
    },
    { property: "og:title", content: "AI Assistant - Alignment Feed" },
    {
      property: "og:description",
      content:
        "Chat with an AI assistant about AI alignment research articles.",
    },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Alignment Feed" },
    { name: "twitter:card", content: "summary" },
  ];
};

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const { authContext } = await getServerAuthContext(request, context);

  let conversations: Conversation[] = [];
  if (authContext.isAuthenticated && authContext.user) {
    try {
      const storage = createChatStorage(context.cloudflare.env);
      conversations = await storage.listConversations(
        authContext.user.id as UserId
      );
    } catch (error) {
      console.error("Failed to load chat conversations:", error);
      // Page still renders — just with empty conversation list
    }
  }

  return json({
    isAuthenticated: authContext.isAuthenticated,
    conversations,
  });
};

export default function Chat() {
  const { isAuthenticated, conversations } = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-brand-bg-dark">
      <TopBar />

      <main>
        <HeroHeader showSearch={false} />

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-6 pt-8">
          <Tabs tabs={MAIN_TABS} activeTab="chat" />
        </div>

        {/* Content */}
        {!isAuthenticated ? (
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-4">
                Log in to chat with the AI research assistant.
              </p>
              <Link to="/auth/login">
                <Button variant="primary" type="button">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto mt-4 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            <ChatPanel initialConversations={conversations} />
          </div>
        )}
      </main>
    </div>
  );
}
