import { describe, expect, it } from "vitest";
import { honeypotTripped, safeNext, validateCredentials } from "@/lib/authForm";

describe("validateCredentials", () => {
  it("accepts a normal email and password", () => {
    expect(validateCredentials({ email: "coach@team.gg", password: "longenough" })).toBeNull();
  });
  it("rejects bad emails and short passwords", () => {
    expect(validateCredentials({ email: "nope", password: "longenough" })).toMatch(/valid email/);
    expect(validateCredentials({ email: "a@b.co", password: "short" })).toMatch(/at least 8/);
  });
  it("does not need a password for the reset request", () => {
    expect(validateCredentials({ email: "a@b.co" }, { requirePassword: false })).toBeNull();
  });
});

describe("honeypotTripped", () => {
  it("only trips when the hidden field has text", () => {
    expect(honeypotTripped("")).toBe(false);
    expect(honeypotTripped(undefined)).toBe(false);
    expect(honeypotTripped("http://spam.example")).toBe(true);
  });
});

describe("safeNext", () => {
  it("keeps local paths", () => {
    expect(safeNext("/reset-password")).toBe("/reset-password");
  });
  it("falls back for anything that could leave the site", () => {
    for (const bad of ["https://evil.com", "//evil.com", "/\\evil.com", "evil", null, undefined, 5]) {
      expect(safeNext(bad)).toBe("/dashboard");
    }
  });
});
