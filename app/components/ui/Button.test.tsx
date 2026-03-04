import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: "Click me" })
    ).toBeInTheDocument();
  });

  it("default variant is outline", () => {
    render(<Button>Default</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-transparent");
  });

  it('variant="primary" applies primary classes', () => {
    render(<Button variant="primary">Primary</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-brand-dark");
  });

  it("merges custom className", () => {
    render(<Button className="my-custom">Styled</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("my-custom");
  });

  it("passes disabled prop", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
