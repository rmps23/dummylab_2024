import { json, requireUser } from "@/lib/auth";
import { getAccountByRiotId, RiotError } from "@/lib/riot";

export async function GET(request) {
  const { error } = await requireUser();
  if (error) return error;

  const params = request.nextUrl.searchParams;
  const gameName = (params.get("gameName") || "").trim();
  const tagLine = (params.get("tagLine") || "").trim();
  const region = params.get("region") || "";

  if (!gameName || gameName.length > 32 || !/^[\p{L}\p{N}]{2,8}$/u.test(tagLine)) {
    return json({ error: "Invalid Riot ID" }, 400);
  }

  try {
    const account = await getAccountByRiotId(gameName, tagLine, region);
    if (!account) return json({ error: "Player not found" }, 404);
    return json({
      puuid: account.puuid,
      riotId: `${account.gameName}#${account.tagLine}`,
    });
  } catch (e) {
    const status = e instanceof RiotError ? e.status : 500;
    return json({ error: e.message }, status);
  }
}
