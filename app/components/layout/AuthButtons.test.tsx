import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRemixStub } from "@remix-run/testing";
import { AuthButtons } from "./AuthButtons";

vi.mock("~/root", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "~/root";
const mockUseAuth = vi.mocked(useAuth);

function renderAuthButtons() {
  const Stub = createRemixStub([{ path: "/", Component: AuthButtons }]);
  return render(<Stub />);
}

describe("AuthButtons", () => {
  it("when not authenticated: shows Log In and Sign Up", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false });
    renderAuthButtons();
    expect(await screen.findByText("Log In")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });

  it("when authenticated: shows Log Out", async () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: true });
    renderAuthButtons();
    expect(await screen.findByText("Log Out")).toBeInTheDocument();
    expect(screen.queryByText("Log In")).not.toBeInTheDocument();
    expect(screen.queryByText("Sign Up")).not.toBeInTheDocument();
  });
});
