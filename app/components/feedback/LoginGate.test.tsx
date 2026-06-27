import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LoginGate } from "./LoginGate";

describe("LoginGate", () => {
  it("renders title and description", () => {
    render(
      <MemoryRouter>
        <LoginGate title="Log in required" description="You need to log in." />
      </MemoryRouter>
    );
    expect(screen.getByText("Log in required")).toBeInTheDocument();
    expect(screen.getByText("You need to log in.")).toBeInTheDocument();
  });

  it("renders default CTA linking to /auth/login", () => {
    render(
      <MemoryRouter>
        <LoginGate title="Log in" description="Please log in." />
      </MemoryRouter>
    );
    const link = screen.getByRole("link", { name: "Log In" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/auth/login");
  });

  it("renders custom ctaLabel", () => {
    render(
      <MemoryRouter>
        <LoginGate
          title="Log in"
          description="Please log in."
          ctaLabel="Sign In"
        />
      </MemoryRouter>
    );
    expect(screen.getByRole("link", { name: "Sign In" })).toBeInTheDocument();
  });

  it("renders custom to path", () => {
    render(
      <MemoryRouter>
        <LoginGate title="Log in" description="Please log in." to="/login" />
      </MemoryRouter>
    );
    const link = screen.getByRole("link", { name: "Log In" });
    expect(link).toHaveAttribute("href", "/login");
  });
});
