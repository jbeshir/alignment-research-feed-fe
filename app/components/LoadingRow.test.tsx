import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { LoadingRow } from "./LoadingRow";

describe("LoadingRow", () => {
  it("renders with animate-pulse class", () => {
    const { container } = render(<LoadingRow />);
    expect(container.querySelector(".animate-pulse")).toBeTruthy();
  });
});
