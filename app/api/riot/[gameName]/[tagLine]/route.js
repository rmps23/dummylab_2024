import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const { gameName, tagLine } = params;
    const apiKey = process.env.NEXT_PUBLIC_RIOT_API_KEY;

    const accountUrl = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${apiKey}`;

    console.log(`Fetching account data from: ${accountUrl}`);

    try {
        const accountResponse = await fetch(accountUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!accountResponse.ok) {
            console.error(`Error fetching account data: ${accountResponse.statusText}`);
            return NextResponse.json({ error: `Error fetching account data: ${accountResponse.statusText}` }, { status: accountResponse.status });
        }

        const accountData = await accountResponse.json();

        // Extract puuid from accountData
        const puuid = accountData.puuid;

        // Construct matches URL with extracted puuid
        const matchesUrl = `https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=20&api_key=${apiKey}`;

        console.log(`Fetching matches data from: ${matchesUrl}`);

        // Now, make another GET request for matches data using the constructed URL
        const matchesResponse = await fetch(matchesUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!matchesResponse.ok) {
            console.error(`Error fetching matches data: ${matchesResponse.statusText}`);
            return NextResponse.json({ error: `Error fetching matches data: ${matchesResponse.statusText}` }, { status: matchesResponse.status });
        }

        const matchesData = await matchesResponse.json();

        return NextResponse.json({ accountData, matchesData });
    } catch (error) {
        console.error("Error fetching data:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

}
