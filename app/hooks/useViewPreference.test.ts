import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useViewPreference } from "./useViewPreference";

describe("useViewPreference", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to "list" when localStorage is empty', () => {
    const { result } = renderHook(() => useViewPreference());
    expect(result.current[0]).toBe("list");
  });

  it('returns "grid" when stored', () => {
    localStorage.setItem("viewPreference", "grid");
    const { result } = renderHook(() => useViewPreference());
    expect(result.current[0]).toBe("grid");
  });

  it("setViewMode updates both state and localStorage", () => {
    const { result } = renderHook(() => useViewPreference());
    act(() => {
      result.current[1]("grid");
    });
    expect(result.current[0]).toBe("grid");
    expect(localStorage.getItem("viewPreference")).toBe("grid");
  });

  it('invalid localStorage values fall back to "list"', () => {
    localStorage.setItem("viewPreference", "invalid-value");
    const { result } = renderHook(() => useViewPreference());
    expect(result.current[0]).toBe("list");
  });
});
