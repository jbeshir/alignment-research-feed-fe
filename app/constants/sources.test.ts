import { describe, it, expect } from "vitest";
import { getSourceColor, SOURCE_COLORS } from "./sources";

describe("getSourceColor", () => {
  it("returns correct color for known sources", () => {
    expect(getSourceColor("arxiv")).toBe(SOURCE_COLORS["arxiv"]);
    expect(getSourceColor("lesswrong")).toBe(SOURCE_COLORS["lesswrong"]);
    expect(getSourceColor("alignmentforum")).toBe(SOURCE_COLORS["alignmentforum"]);
    expect(getSourceColor("youtube")).toBe(SOURCE_COLORS["youtube"]);
  });

  it("handles case-insensitive matching", () => {
    expect(getSourceColor("ArXiv")).toBe(SOURCE_COLORS["arxiv"]);
    expect(getSourceColor("LESSWRONG")).toBe(SOURCE_COLORS["lesswrong"]);
    expect(getSourceColor("YouTube")).toBe(SOURCE_COLORS["youtube"]);
  });

  it("returns default color for unknown sources", () => {
    expect(getSourceColor("unknown")).toContain("bg-slate");
    expect(getSourceColor("random-source")).toContain("bg-slate");
  });
});
