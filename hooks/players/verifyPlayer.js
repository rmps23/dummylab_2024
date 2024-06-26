export async function verifyPlayer(gameName, tagLine, region) {
  let riot_data = {};

  try {
    const response = await fetch(
      `/api/riot/${gameName}/${tagLine}/${region.zone}`
    );

    const data = await response.json();
    riot_data = {
      puuid: data.puuid,
    };

  } catch (error) {
    console.error("Error fetching player:", error);
    return { error: error.message };
  }

  try {
    const response = await fetch(
      `/api/lol/summoner/v4/summoners/by-puuid/${riot_data.puuid}/${region.code}`
    );

    const data = await response.json();
    riot_data.acc_id = data.id;

    if (!riot_data.puuid || !riot_data.acc_id) {
      return { error: "Error fetching player" };
    }

    return riot_data;
  } catch (error) {
    console.error("Error fetching player:", error);
    return { error: error.message };
  }
}
