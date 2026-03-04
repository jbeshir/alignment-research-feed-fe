import { describe, it, expect } from "vitest";
import { getCategoryHeaderColor, getSourceDisplayName } from "./sources";

describe("getCategoryHeaderColor", () => {
  it("returns correct color for known categories", () => {
    expect(getCategoryHeaderColor("Interpretability")).toContain("bg-teal");
    expect(getCategoryHeaderColor("Safety Techniques")).toContain("bg-blue");
    expect(getCategoryHeaderColor("Governance & Policy")).toContain(
      "bg-indigo"
    );
    expect(getCategoryHeaderColor("Deception & Misalignment")).toContain(
      "bg-red"
    );
    expect(getCategoryHeaderColor("AI Capabilities & Behavior")).toContain(
      "bg-amber"
    );
    expect(getCategoryHeaderColor("Risks & Strategy")).toContain("bg-rose");
    expect(getCategoryHeaderColor("Forecasting")).toContain("bg-cyan");
    expect(getCategoryHeaderColor("AI & Society")).toContain("bg-purple");
    expect(getCategoryHeaderColor("Field Building")).toContain("bg-green");
    expect(getCategoryHeaderColor("Other")).toContain("bg-slate");
  });

  it("returns default color for unknown categories", () => {
    expect(getCategoryHeaderColor("unknown")).toContain("bg-slate");
    expect(getCategoryHeaderColor("random-category")).toContain("bg-slate");
  });

  it("returns default color for null or undefined", () => {
    expect(getCategoryHeaderColor(null)).toContain("bg-slate");
    expect(getCategoryHeaderColor(undefined)).toContain("bg-slate");
  });
});

describe("getSourceDisplayName", () => {
  it("returns formatted name for known sources", () => {
    expect(getSourceDisplayName("arxiv")).toBe("arXiv");
    expect(getSourceDisplayName("lesswrong")).toBe("LessWrong");
    expect(getSourceDisplayName("miri")).toBe("MIRI");
    expect(getSourceDisplayName("youtube")).toBe("YouTube");
  });

  it("handles case-insensitive matching", () => {
    expect(getSourceDisplayName("ArXiv")).toBe("arXiv");
    expect(getSourceDisplayName("LESSWRONG")).toBe("LessWrong");
  });

  it("title-cases unknown sources", () => {
    expect(getSourceDisplayName("some_new_source")).toBe("Some New Source");
    expect(getSourceDisplayName("my-blog")).toBe("My Blog");
  });

  it("uses author name for generic blog sources", () => {
    expect(getSourceDisplayName("blogs", "Jane Smith")).toBe("Jane Smith");
    expect(getSourceDisplayName("substack", "John Doe, Jane Smith")).toBe(
      "John Doe"
    );
    expect(getSourceDisplayName("medium", "Alice and Bob")).toBe("Alice");
  });

  it("falls back to source name when generic blog has no authors", () => {
    expect(getSourceDisplayName("blogs")).toBe("Blogs");
    expect(getSourceDisplayName("substack")).toBe("Substack");
  });
});
