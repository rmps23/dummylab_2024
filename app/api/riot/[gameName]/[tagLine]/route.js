import { NextResponse } from "next/server";
import { supabase } from "@/supabase"; // Assuming you have a database connection file

export async function GET(request, { params, query }) {
  const { gameName, tagLine, playerID } = params; // Extract playerID from params
  const apiKey = process.env.NEXT_PUBLIC_RIOT_API_KEY;

  const accountUrl = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${apiKey}`;

  try {
    const accountResponse = await fetch(accountUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!accountResponse.ok) {
      return NextResponse.json(
        { error: `Error fetching account data: ${accountResponse.statusText}` },
        { status: accountResponse.status }
      );
    }

    const accountData = await accountResponse.json();
    const puuid = accountData.puuid;

    const matchesUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${apiKey}`;

    const matchesResponse = await fetch(matchesUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!matchesResponse.ok) {
      return NextResponse.json(
        { error: `Error fetching matches data: ${matchesResponse.statusText}` },
        { status: matchesResponse.status }
      );
    }

    const matchesData = await matchesResponse.json();
    const detailedMatches = [];

    for (const matchId of matchesData) {
      const matchUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${apiKey}`;
      const matchResponse = await fetch(matchUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (matchResponse.ok) {
        const matchData = await matchResponse.json();

        if (matchData.info.queueId === 420) {
          const timelineUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}/timeline?api_key=${apiKey}`;
          const timelineResponse = await fetch(timelineUrl, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (timelineResponse.ok) {
            const timelineData = await timelineResponse.json();
            await saveMatchData(playerID, matchId, timelineData); // Pass playerID here
            detailedMatches.push({ matchId, timelineData });
          }
        }
      }
    }

    return NextResponse.json({ accountData, matchesData, detailedMatches });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function saveMatchData(playerId, matchId, timelineData) {
  try {
    // Check if the game ID already exists in the database for the given player
    const { data: existingGameData, error: existingGameError } = await supabase
      .from("game_stats")
      .select("*")
      .eq("game_id", matchId)
      .eq("player_id", playerId);

    if (existingGameError) {
      console.error(
        "Error checking existing game data:",
        existingGameError.message
      );
      return;
    }

    // If the game ID doesn't exist for the player, insert it into the database
    if (!existingGameData || existingGameData.length === 0) {
      const { error: insertError } = await supabase
        .from("game_stats")
        .insert([
          { player_id: playerId, game_id: matchId, stats: timelineData },
        ]);

      if (insertError) {
        console.error("Error saving match data:", insertError.message);
      } else {
        console.log("Match data saved successfully.");
      }
    } else {
      console.log("Match data already exists for the player.");
    }
  } catch (error) {
    console.error("Error saving match data:", error.message);
  }
}
