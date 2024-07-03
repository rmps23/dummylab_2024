export async function GET(request, { params }) {
  const { puuid, region } = params;
  const apiKey = process.env.NEXT_PUBLIC_RIOT_API_KEY;

  // Convert the date to a UNIX timestamp
  const startDate = new Date("2024-05-15");
  const startTime = Math.floor(startDate.getTime() / 1000);

  const region_lower = region.toLowerCase();

  let start = 0;
  const count = 100; // Maximum allowed by Riot API
  let allMatchIds = [];

  try {
    while (true) {
      // const gameList = `https://${region_lower}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}&startTime=${startTime}&api_key=${apiKey}`;
      const gameList = `https://${region_lower}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${10}&api_key=${apiKey}`;
      const response = await fetch(gameList);

      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }

      const matchIds = await response.json();

      if (matchIds.length === 0) {
        break;
      }

      allMatchIds = allMatchIds.concat(matchIds);
      start += count; // Move to the next set of matches

      // If the number of matches returned is less than the count, we can break early
      if (matchIds.length < count) {
        break;
      }
    }

    return new Response(JSON.stringify(allMatchIds), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Server error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
