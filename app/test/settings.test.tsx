import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRemixStub } from "@remix-run/testing";
import Settings from "~/routes/settings";
import { useAuth, useRootLoaderData } from "~/root";

vi.mock("~/root", () => ({
  useAuth: vi.fn(),
  useRootLoaderData: vi.fn(),
}));
const mockUseAuth = vi.mocked(useAuth);
const mockUseRootLoaderData = vi.mocked(useRootLoaderData);

function renderSettings() {
  const Stub = createRemixStub([{ path: "/", Component: Settings }]);
  return render(<Stub />);
}

describe("Settings route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    mockUseRootLoaderData.mockReturnValue({
      isAuthenticated: false,
      rssUrl: "",
    });
  });

  it("shows login prompt when not authenticated", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    renderSettings();
    expect(await screen.findByText(/Manage your account/i)).toBeInTheDocument();
  });

  it("shows API Tokens section when authenticated", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), { status: 200 })
    );
    renderSettings();
    expect(await screen.findByText("API Tokens")).toBeInTheDocument();
  });

  it("renders existing tokens after load", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            {
              id: "tok-1",
              prefix: "abc",
              name: "My Token",
              created_at: "2024-01-01T00:00:00Z",
              last_used_at: null,
              expires_at: null,
              revoked: false,
            },
          ],
        }),
        { status: 200 }
      )
    );
    renderSettings();
    expect(await screen.findByText("My Token")).toBeInTheDocument();
  });

  it("shows empty state when no tokens exist", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ data: [] }), { status: 200 })
    );
    renderSettings();
    expect(await screen.findByText(/No API tokens yet/i)).toBeInTheDocument();
  });

  it("creates token and shows NewTokenDisplay", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [] }), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            id: "tok-2",
            token: "secret-value-xyz",
            prefix: "sec",
          }),
          { status: 200 }
        )
      );

    renderSettings();
    await screen.findByText(/No API tokens yet/i);

    const createBtn = screen.getByRole("button", { name: /Create Token/i });
    await userEvent.click(createBtn);

    expect(await screen.findByText("secret-value-xyz")).toBeInTheDocument();
    expect(screen.getByText(/Copy this token now/i)).toBeInTheDocument();
  });

  it("removes token from list after delete confirmation", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              {
                id: "tok-1",
                prefix: "abc",
                name: "Delete Me",
                created_at: "2024-01-01T00:00:00Z",
                last_used_at: null,
                expires_at: null,
                revoked: false,
              },
            ],
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(new Response(null, { status: 200 }));

    renderSettings();
    expect(await screen.findByText("Delete Me")).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText("Delete token"));
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => {
      expect(screen.queryByText("Delete Me")).not.toBeInTheDocument();
    });
  });

  it("MCP Server section is always visible", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    renderSettings();
    expect(
      await screen.findByRole("heading", { name: "MCP Server" })
    ).toBeInTheDocument();
  });

  it("API Documentation section is always visible", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    renderSettings();
    expect(
      await screen.findByRole("heading", { name: "API Documentation" })
    ).toBeInTheDocument();
  });
});
