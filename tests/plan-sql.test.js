import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PLANS } from "@/lib/plans";

// The limits live twice: in lib/plans.js (shown to users) and in the migration (enforced). They must match.
const sql = ["0006_plans.sql", "0008_team_staff.sql"].map((f) => readFileSync(`supabase/migrations/${f}`, "utf8")).join("\n");

function sqlLimit(what) {
  // Later migrations redefine plan_limit, so the last definition is the one in force.
  const all = [...sql.matchAll(new RegExp(`when '${what}' then case p_plan when 'pro' then (\\d+) else (\\d+) end`, "g"))];
  const match = all[all.length - 1];
  if (!match) throw new Error(`limit for ${what} not found in the migration`);
  return { pro: Number(match[1]), free: Number(match[2]) };
}

describe("plan limits in SQL match lib/plans.js", () => {
  for (const what of ["teams", "players", "notes", "staff"]) {
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
