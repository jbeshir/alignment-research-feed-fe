import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRemixStub } from "@remix-run/testing";
import { TopBar } from "./TopBar";

vi.mock("~/root", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "~/root";
const mockUseAuth = vi.mocked(useAuth);

function renderTopBar() {
  const Stub = createRemixStub([{ path: "/", Component: TopBar }]);
  return render(<Stub />);
}

describe("TopBar", () => {
  it('renders "Alignment Feed" link', async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    renderTopBar();
    expect(await screen.findByText("Alignment Feed")).toBeInTheDocument();
  });

  it("when authenticated: shows settings icon", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    renderTopBar();
    expect(await screen.findByLabelText("Settings")).toBeInTheDocument();
  });

  it("when not authenticated: no settings icon", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    renderTopBar();
    // Wait for component to render
    await screen.findByText("Alignment Feed");
    expect(screen.queryByLabelText("Settings")).not.toBeInTheDocument();
  });
});
