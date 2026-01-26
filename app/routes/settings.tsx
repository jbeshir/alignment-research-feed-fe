import type { MetaFunction } from "@remix-run/cloudflare";
import { Link } from "@remix-run/react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "~/root";
import { TopBar } from "~/components/TopBar";
import { HeroHeader } from "~/components/HeroHeader";
import { Button } from "~/components/ui/Button";
import { TrashIcon, ClipboardIcon } from "~/components/Icons";
import { formatPublishedDate } from "~/utils/formatting";

export const meta: MetaFunction = () => {
  return [
    { title: "Settings - Alignment Feed" },
    {
      name: "description",
      content: "Manage your account settings and API tokens.",
    },
  ];
};

type Token = {
  id: string;
  prefix: string;
  name?: string | null;
  created_at: string;
  last_used_at?: string | null;
  expires_at?: string | null;
  revoked: boolean;
};

type CreateTokenResponse = {
  id: string;
  token: string;
  prefix: string;
};

type NewTokenState = CreateTokenResponse & {
  name: string;
};

function TokenCard({
  token,
  onDelete,
  isDeleting,
}: {
  token: Token;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const displayName = token.name || `Token ${token.prefix}...`;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-brand-dark dark:text-brand-light truncate">
            {displayName}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Created: {formatPublishedDate(token.created_at)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Last used:{" "}
            {token.last_used_at
              ? formatPublishedDate(token.last_used_at)
              : "Never"}
          </p>
        </div>
        <div className="ml-4">
          {showConfirm ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(false)}
                className="text-xs px-2 py-1"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => onDelete(token.id)}
                className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 border-red-600 dark:border-red-600"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Confirm"}
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirm(true)}
              className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              aria-label="Delete token"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function NewTokenDisplay({
  tokenValue,
  tokenName,
  onDismiss,
}: {
  tokenValue: string;
  tokenName: string;
  onDismiss: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(tokenValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
          Token Created: {tokenName || "Unnamed Token"}
        </h3>
      </div>
      <p className="text-xs text-green-700 dark:text-green-300 mb-3">
        Copy this token now. It will only be shown once.
      </p>
      <div className="flex items-center gap-2 mb-3">
        <code className="flex-1 bg-white dark:bg-slate-800 border border-green-200 dark:border-green-700 rounded px-3 py-2 text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto">
          {tokenValue}
        </code>
        <button
          onClick={handleCopy}
          className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800/30 rounded transition-colors"
          aria-label={copied ? "Copied" : "Copy token"}
        >
          {copied ? (
            <span className="text-xs font-medium">Copied!</span>
          ) : (
            <ClipboardIcon className="w-5 h-5" />
          )}
        </button>
      </div>
      <Button variant="outline" onClick={onDismiss} className="text-xs">
        I&apos;ve copied the token
      </Button>
    </div>
  );
}

function CreateTokenForm({
  onTokenCreated,
}: {
  onTokenCreated: (response: CreateTokenResponse, name: string) => void;
}) {
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    const tokenName = name.trim();

    try {
      const response = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tokenName || undefined }),
      });

      if (!response.ok) {
        throw new Error("Failed to create token");
      }

      const data = (await response.json()) as CreateTokenResponse;
      onTokenCreated(data, tokenName);
      setName("");
    } catch {
      setError("Failed to create token. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Token name (optional)"
          className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-brand-dark dark:text-brand-light placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-dark dark:focus:ring-brand-light"
        />
        <Button type="submit" variant="primary" disabled={isCreating}>
          {isCreating ? "Creating..." : "Create Token"}
        </Button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </form>
  );
}

export default function Settings() {
  const { isAuthenticated } = useAuth();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newToken, setNewToken] = useState<NewTokenState | null>(null);
  const [deletingTokenId, setDeletingTokenId] = useState<string | null>(null);

  const loadTokens = useCallback(async () => {
    try {
      const response = await fetch("/api/tokens");
      if (!response.ok) {
        if (response.status === 401) {
          setTokens([]);
          return;
        }
        throw new Error("Failed to load tokens");
      }
      const data = (await response.json()) as { data: Token[] };
      // Filter out revoked tokens
      setTokens((data.data || []).filter(t => !t.revoked));
    } catch {
      setError("Failed to load tokens");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadTokens();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, loadTokens]);

  const handleTokenCreated = (response: CreateTokenResponse, name: string) => {
    setNewToken({ ...response, name });
    // Add the new token to the list (without the token value)
    setTokens(prev => [
      {
        id: response.id,
        prefix: response.prefix,
        name: name || null,
        created_at: new Date().toISOString(),
        last_used_at: null,
        revoked: false,
      },
      ...prev,
    ]);
  };

  const handleDeleteToken = async (tokenId: string) => {
    setDeletingTokenId(tokenId);
    try {
      const response = await fetch(`/api/tokens/${tokenId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setTokens(prev => prev.filter(t => t.id !== tokenId));
      }
    } catch {
      // Error handling is silent - the token will remain in the list
    } finally {
      setDeletingTokenId(null);
    }
  };

  const showLoginPrompt = !isAuthenticated;

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-brand-bg-dark">
      <TopBar />

      <main>
        <HeroHeader showSearch={false} />

        {/* Content */}
        <div className="max-w-2xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-semibold text-brand-dark dark:text-brand-light mb-8">
            Settings
          </h1>

          {showLoginPrompt ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-4">
                Log in to manage your settings.
              </p>
              <Link to="/auth/login">
                <Button variant="primary" type="button">
                  Log In
                </Button>
              </Link>
            </div>
          ) : (
            <section>
              <h2 className="text-lg font-medium text-brand-dark dark:text-brand-light mb-4">
                API Tokens
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                API tokens allow you to access the Alignment Feed API
                programmatically.
              </p>

              {newToken && (
                <NewTokenDisplay
                  tokenValue={newToken.token}
                  tokenName={newToken.name}
                  onDismiss={() => setNewToken(null)}
                />
              )}

              <CreateTokenForm onTokenCreated={handleTokenCreated} />

              {isLoading ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  Loading tokens...
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-600 dark:text-red-400">
                  {error}
                </div>
              ) : tokens.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  No API tokens yet. Create one to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {tokens.map(token => (
                    <TokenCard
                      key={token.id}
                      token={token}
                      onDelete={handleDeleteToken}
                      isDeleting={deletingTokenId === token.id}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
