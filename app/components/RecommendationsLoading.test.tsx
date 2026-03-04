import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecommendationsLoading } from "./RecommendationsLoading";

describe("RecommendationsLoading", () => {
  it("renders spinner and loading text", () => {
    const { container } = render(<RecommendationsLoading />);
    expect(container.querySelector(".animate-spin")).toBeTruthy();
    expect(
      screen.getByText("Generating recommendations...")
    ).toBeInTheDocument();
  });
});
