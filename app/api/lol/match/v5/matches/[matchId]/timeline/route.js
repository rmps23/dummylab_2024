export async function GET(request, { params }) {
    const { matchId } = params;
    const apiKey = process.env.NEXT_PUBLIC_RIOT_API_KEY;

    const gameList = `https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}/timeline?api_key=${apiKey}`;

    try {
        const response = await fetch(gameList);

        if (!response.ok) {
            console.error(`Error fetching data: ${response.status} ${response.statusText}`);
            throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error("Server error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}
