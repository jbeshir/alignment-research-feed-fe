import { describe, it, expect, vi, beforeEach } from "vitest";
import { action } from "~/routes/api.articles.$articleId.feedback";
import { createAuthenticatedFetch } from "~/server/auth.server";

vi.mock("~/server/auth.server", () => ({
  createAuthenticatedFetch: vi.fn(),
}));

const mockCreateAuthFetch = vi.mocked(createAuthenticatedFetch);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeContext(baseUrl = "https://api.example.com"): any {
  return { cloudflare: { env: { ALIGNMENT_FEED_BASE_URL: baseUrl } } };
}

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/articles/abc123/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("api.articles.$articleId.feedback action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when articleId is missing from params", async () => {
    const response = await action({
      request: makeRequest({ action: "thumbs_up", value: true }),
      params: {},
      context: makeContext(),
    });
    expect(response.status).toBe(400);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe("Article ID required");
  });

  it("returns 400 for invalid action value", async () => {
    mockCreateAuthFetch.mockResolvedValue({
      authFetch: vi.fn(),
      isAuthenticated: true,
    });
    const response = await action({
      request: makeRequest({ action: "invalid_action", value: true }),
      params: { articleId: "abc123" },
      context: makeContext(),
    });
    expect(response.status).toBe(400);
    const data = (await response.json()) as { error: string };
    expect(data.error).toBe("Invalid request body");
  });

  it("returns 400 for missing value field", async () => {
    mockCreateAuthFetch.mockResolvedValue({
      authFetch: vi.fn(),
      isAuthenticated: true,
    });
    const response = await action({
      request: makeRequest({ action: "thumbs_up" }),
      params: { articleId: "abc123" },
      context: makeContext(),
    });
    expect(response.status).toBe(400);
  });

  it("returns 401 when not authenticated", async () => {
    mockCreateAuthFetch.mockResolvedValue({
      authFetch: vi.fn(),
      isAuthenticated: false,
    });
    const response = await action({
      request: makeRequest({ action: "thumbs_up", value: true }),
      params: { articleId: "abc123" },
      context: makeContext(),
    });
    expect(response.status).toBe(401);
  });

  it("proxies thumbs_up correctly and returns success", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }));
    mockCreateAuthFetch.mockResolvedValue({
      authFetch: mockFetch,
      isAuthenticated: true,
    });

    const response = await action({
      request: makeRequest({ action: "thumbs_up", value: true }),
      params: { articleId: "abc123" },
      context: makeContext(),
    });

    expect(response.status).toBe(200);
    const data = (await response.json()) as { success: boolean };
    expect(data.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.com/v1/articles/abc123/thumbs_up/true",
      { method: "POST" }
    );
  });

  it("proxies thumbs_down correctly", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }));
    mockCreateAuthFetch.mockResolvedValue({
      authFetch: mockFetch,
      isAuthenticated: true,
    });

    await action({
      request: makeRequest({ action: "thumbs_down", value: false }),
      params: { articleId: "abc123" },
      context: makeContext(),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.com/v1/articles/abc123/thumbs_down/false",
      { method: "POST" }
    );
  });

  it("proxies read correctly", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 200 }));
    mockCreateAuthFetch.mockResolvedValue({
      authFetch: mockFetch,
      isAuthenticated: true,
    });

    await action({
      request: makeRequest({ action: "read", value: true }),
      params: { articleId: "abc123" },
      context: makeContext(),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.example.com/v1/articles/abc123/read/true",
      { method: "POST" }
    );
  });

  it("returns upstream status code on API error", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 503 }));
    mockCreateAuthFetch.mockResolvedValue({
      authFetch: mockFetch,
      isAuthenticated: true,
    });

    const response = await action({
      request: makeRequest({ action: "thumbs_up", value: true }),
      params: { articleId: "abc123" },
      context: makeContext(),
    });

    expect(response.status).toBe(503);
  });
});
