import { describe, expect, it } from "vitest";
import { inviteEmail, inviteProblem, inviteUrl, newToken } from "@/lib/teamInvites";
import { isToken } from "@/lib/invites";

const NOW = new Date("2026-11-10T12:00:00Z");
const base = { email: "Analyst@Team.gg", role: "staff", expires_at: "2026-11-15T00:00:00Z", accepted_at: null, revoked_at: null };

describe("inviteProblem", () => {
  it("accepts a valid invite for the right email, ignoring case and spaces", () => {
    expect(inviteProblem(base, { email: " analyst@team.gg " }, NOW)).toBeNull();
  });
  it("names every reason it can fail", () => {
    expect(inviteProblem(null, { email: "a@b.c" }, NOW)).toBe("invalid");
    expect(inviteProblem({ ...base, revoked_at: "2026-11-09T00:00:00Z" }, { email: "analyst@team.gg" }, NOW)).toBe("revoked");
    expect(inviteProblem({ ...base, accepted_at: "2026-11-09T00:00:00Z" }, { email: "analyst@team.gg" }, NOW)).toBe("used");
    expect(inviteProblem({ ...base, expires_at: "2026-11-09T00:00:00Z" }, { email: "analyst@team.gg" }, NOW)).toBe("expired");
    expect(inviteProblem(base, { email: "other@team.gg" }, NOW)).toBe("wrong_email");
    expect(inviteProblem(base, null, NOW)).toBe("wrong_email");
  });
});

describe("invite links and email", () => {
  it("makes tokens that pass the shared token check", () => {
    expect(isToken(newToken())).toBe(true);
    expect(inviteUrl("abc", "https://x.test")).toBe("https://x.test/join/abc");
  });
  it("escapes the team and inviter names in the email", () => {
    const { html, text } = inviteEmail({ teamName: "<b>Evil</b>", role: "viewer", url: "https://x.test/join/t", inviter: "A&B" });
    expect(html).not.toContain("<b>Evil</b>");
    expect(html).toContain("&lt;b&gt;Evil&lt;/b&gt;");
    expect(html).toContain("A&amp;B");
    expect(text).toContain("https://x.test/join/t");
  });
});
