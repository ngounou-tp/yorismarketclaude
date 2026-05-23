import { describe, it, expect } from "vitest";
import { isProfileAccessible } from "../userMutations";

describe("isProfileAccessible", () => {
  it("returns true for active profile", () => {
    expect(isProfileAccessible({ actif: true, deleted_at: null })).toBe(true);
    expect(isProfileAccessible({ actif: null })).toBe(true);
  });

  it("returns false when suspended or deleted", () => {
    expect(isProfileAccessible({ actif: false })).toBe(false);
    expect(isProfileAccessible({ deleted_at: "2026-01-01T00:00:00Z" })).toBe(false);
    expect(isProfileAccessible(null)).toBe(false);
  });
});
