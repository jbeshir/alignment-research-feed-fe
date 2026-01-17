import { describe, it, expect } from "vitest";
import { formatPublishedDate } from "./formatting";

describe("formatPublishedDate", () => {
  it("formats ISO date string correctly", () => {
    const result = formatPublishedDate("2024-01-15T12:00:00Z");
    expect(result).toBe("Jan 15, 2024");
  });

  it("formats date without time", () => {
    const result = formatPublishedDate("2024-03-20");
    expect(result).toBe("Mar 20, 2024");
  });

  it("handles different months", () => {
    expect(formatPublishedDate("2024-06-01")).toBe("Jun 1, 2024");
    expect(formatPublishedDate("2024-12-25")).toBe("Dec 25, 2024");
  });

  it("returns original string for invalid date", () => {
    expect(formatPublishedDate("not-a-date")).toBe("not-a-date");
    expect(formatPublishedDate("")).toBe("");
  });
});
