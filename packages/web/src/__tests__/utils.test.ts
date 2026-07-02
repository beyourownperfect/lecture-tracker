import { describe, it, expect } from "vitest";
import { cn } from "../lib/utils";

describe("cn utility", () => {
  it("merges Tailwind classes", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("handles falsy values", () => {
    const hidden: string | false = false;
    expect(cn("base", hidden, undefined, null)).toBe("base");
  });

  it("handles conditional classes", () => {
    const active = true;
    const extraClass = active ? "active" : null;
    expect(cn("base", extraClass)).toBe("base active");
  });
});

describe("api utility", () => {
  it("exists as an importable module", async () => {
    const mod = await import("../lib/api");
    expect(mod.api).toBeDefined();
    expect(typeof mod.api.get).toBe("function");
    expect(typeof mod.api.post).toBe("function");
    expect(typeof mod.api.put).toBe("function");
    expect(typeof mod.api.delete).toBe("function");
  });
});
