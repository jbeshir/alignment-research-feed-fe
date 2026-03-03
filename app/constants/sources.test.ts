import { describe, it, expect } from "vitest";
import { getCategoryHeaderColor } from "./sources";

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
