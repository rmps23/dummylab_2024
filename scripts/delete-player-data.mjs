// Deletes every record of a player identified by PUUID (for example after a Riot or GDPR deletion
// request). Player rows cascade to match history and rank; orphaned matches are removed by a trigger.
//
// Usage: node --env-file=.env.local scripts/delete-player-data.mjs <puuid> [--yes]
import { createAdminClient } from "../lib/supabase/admin.js";

const [puuid, flag] = process.argv.slice(2);
if (!puuid) {
  console.error("Usage: node --env-file=.env.local scripts/delete-player-data.mjs <puuid> [--yes]");
  process.exit(1);
}

const admin = createAdminClient();
const { data: players, error } = await admin.from("player").select("id, name, team_id").eq("riot_puuid", puuid);
if (error) {
  console.error("Lookup failed:", error.message);
  process.exit(1);
}

console.log(`Found ${players.length} player record(s) for this PUUID.`);
if (players.length === 0) process.exit(0);
if (flag !== "--yes") {
  console.log("Dry run. Re-run with --yes to delete them.");
  process.exit(0);
}

const { error: deleteError } = await admin.from("player").delete().eq("riot_puuid", puuid);
if (deleteError) {
  console.error("Delete failed:", deleteError.message);
  process.exit(1);
}
console.log("Deleted.");
