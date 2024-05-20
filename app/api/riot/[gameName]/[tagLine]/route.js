import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const { gameName, tagLine } = params;
    const apiKey = process.env.NEXT_PUBLIC_RIOT_API_KEY;

    const url = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${apiKey}`;

    console.log(`Fetching data from: ${url}`);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`Error fetching matches: ${response.statusText}`);
            return NextResponse.json({ error: `Error fetching matches: ${response.statusText}` }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching player matches:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
