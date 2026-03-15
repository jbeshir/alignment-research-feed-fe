import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { LoadingCard } from "./LoadingCard";

describe("LoadingCard", () => {
  it("renders with animate-pulse class", () => {
    const { container } = render(<LoadingCard />);
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
  });
});
