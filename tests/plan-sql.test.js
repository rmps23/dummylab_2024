import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PLANS } from "@/lib/plans";

// The limits live twice: in lib/plans.js (shown to users) and in the migration (enforced). They must match.
const sql = readFileSync("supabase/migrations/0006_plans.sql", "utf8");

function sqlLimit(what) {
  const match = new RegExp(`when '${what}' then case p_plan when 'pro' then (\\d+) else (\\d+) end`).exec(sql);
  if (!match) throw new Error(`limit for ${what} not found in the migration`);
  return { pro: Number(match[1]), free: Number(match[2]) };
}

describe("plan limits in SQL match lib/plans.js", () => {
  for (const what of ["teams", "players", "notes"]) {
    it(what, () => {
      const limit = sqlLimit(what);
      expect(limit.free).toBe(PLANS.free.limits[what]);
      expect(limit.pro).toBe(PLANS.pro.limits[what]);
    });
  }

  it("clamps free stats to the same number of days", () => {
    expect(sql).toContain(`interval '${PLANS.free.limits.statsDays} days'`);
  });
});
