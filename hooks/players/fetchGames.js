import { supabase } from "@/supabase";



export async function fetchGames(puuid, acc_id, player_id) {

  /* GET THE GAME LIST */

  let game_list = [];
  try {
    const response = await fetch(`/api/lol/match/v5/matches/by-puuid/${puuid}/ids`);
    if (!response.ok) {
      throw new Error(`Error fetching games: ${response.statusText}`);
    }
    const data = await response.json();
    game_list = data;
  } catch (error) {
    console.error("Failed to fetch games:", error);
    throw error;
  }

  /* FETCH EACH GAME DETAILS ASYNCHRONOUSLY */

  try {
    // Initialize an array to store the details of each game
    const gameDetails = [];
    let test = 0;

    for (const game of game_list) {
      if (test < 5) {
        const details = await fetchGameDetails(game); // Fetch the details for each game
        if (details.info.queueId == 420) {
          gameDetails.id = game;
          gameDetails.player_id = player_id;
          gameDetails.game_time = details.info.gameDuration;

          gameDetails.blue_top = details.info.participants[0].championName;
          gameDetails.blue_jungler = details.info.participants[1].championName;
          gameDetails.blue_mid = details.info.participants[2].championName;
          gameDetails.blue_bottom = details.info.participants[3].championName;
          gameDetails.blue_support = details.info.participants[4].championName;

          gameDetails.red_top = details.info.participants[5].championName;
          gameDetails.red_jungler = details.info.participants[6].championName;
          gameDetails.red_mid = details.info.participants[7].championName;
          gameDetails.red_bottom = details.info.participants[8].championName;
          gameDetails.red_support = details.info.participants[9].championName;

          gameDetails.end_timestamp = details.info.gameEndTimestamp;
          gameDetails.patch = details.info.gameVersion;

          for (const participant of details.info.participants) {
            if (participant.puuid == puuid) {
              gameDetails.win = participant.win;
            }
          }


          const response = await insertGameSupa(gameDetails);
          console.log(response);

          // gameDetails.push(details);
        }
      }
      test++;
    }

    return gameDetails;

  } catch (error) {
    console.error("Failed to fetch game details:", error);
    throw error;
  }
}

// Helper function to fetch game details
async function fetchGameDetails(gameId) {
  try {
    const response = await fetch(`/api/lol/match/v5/matches/${gameId}`);
    if (!response.ok) {
      throw new Error(`Error fetching game ${gameId}: ${response.statusText}`);
    }
    const data = await response.json();
    return data; // Return the fetched game details
  } catch (error) {
    console.error(`Failed to fetch game ${gameId}:`, error);
    throw error; // Re-throw the error for the caller to handle
  }
}

async function insertGameSupa(game) {
  const { data, error } = await supabase.from("soloq")
    .insert({
      id: game.id,
      player_id: game.player_id,
      game_time: game.game_time,
      blue_top: game.blue_top,
      blue_jungler: game.blue_jungler,
      blue_mid: game.blue_mid,
      blue_bottom: game.blue_bottom,
      blue_support: game.blue_support,
      red_top: game.red_top,
      red_jungler: game.red_jungler,
      red_mid: game.red_mid,
      red_bottom: game.red_bottom,
      red_support: game.red_support,
      end_timestamp: game.end_timestamp,
      patch: game.patch,
      win: game.win
    })
    .select();

  if (error) {
    console.error("Error inserting game data:", error.message);
    return null;
  }
  return data;  // Optionally return the inserted data if you need it
}

