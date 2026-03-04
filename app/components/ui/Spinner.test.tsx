import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("renders SVG with animate-spin", () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg!.className.baseVal).toContain("animate-spin");
  });

  it('default size "md" applies w-8 h-8', () => {
    const { container } = render(<Spinner />);
    const svg = container.querySelector("svg")!;
    expect(svg.className.baseVal).toContain("w-8");
    expect(svg.className.baseVal).toContain("h-8");
  });

  it('size="sm" applies w-4 h-4', () => {
    const { container } = render(<Spinner size="sm" />);
    const svg = container.querySelector("svg")!;
    expect(svg.className.baseVal).toContain("w-4");
    expect(svg.className.baseVal).toContain("h-4");
  });

  it('size="lg" applies w-12 h-12', () => {
    const { container } = render(<Spinner size="lg" />);
    const svg = container.querySelector("svg")!;
    expect(svg.className.baseVal).toContain("w-12");
    expect(svg.className.baseVal).toContain("h-12");
  });
});
