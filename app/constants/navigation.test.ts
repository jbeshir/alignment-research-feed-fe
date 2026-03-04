import { describe, it, expect } from "vitest";
import { MAIN_TABS } from "./navigation";

describe("MAIN_TABS", () => {
  it("is non-empty", () => {
    expect(MAIN_TABS.length).toBeGreaterThan(0);
  });

  it("each tab has id, label, and to", () => {
    for (const tab of MAIN_TABS) {
      expect(tab.id).toBeTruthy();
      expect(tab.label).toBeTruthy();
      expect(tab.to).toBeTruthy();
    }
  });

  it("tab IDs are unique", () => {
    const ids = MAIN_TABS.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all paths start with /", () => {
    for (const tab of MAIN_TABS) {
      expect(tab.to).toMatch(/^\//);
    }
  });
});
