import { supabase } from "@/supabase";

async function updateStats(playerID) {
    try {
        const { data, error } = await supabase
            .from("game_list")
            .select("*")
            .eq('player_id', playerID);

        if (error) {
            console.error("Error fetching players:", error.message);
            return null;
        }

        let stats = {
            total_games: data.length,
            kills: 0,
            deaths: 0,
            assists: 0,
            championIds: {},
            kill_part: 0,
            total_minions: 0,
            dmg_dealt_turrets: 0,
            dmg_dealt_objs: 0,
            total_gold: 0,
            teamPositions: [] // Array to store different team positions and their counts
        };

        data.forEach(game => {
            stats['kills'] += game.kills;
            stats['deaths'] += game.deaths;
            stats['assists'] += game.assists;

            // Count and collect champion IDs
            if (stats.championIds.hasOwnProperty(game.championId)) {
                stats.championIds[game.championId]++;
            } else {
                stats.championIds[game.championId] = 1;
            }

            stats['kill_part'] += game.killParticipation;
            stats['total_minions'] += game.totalMinionsKilled;
            stats['dmg_dealt_turrets'] += game.damageDealtToTurrets;
            stats['dmg_dealt_objs'] += game.damageDealtToObjectives;
            stats['total_gold'] += game.goldEarned;

            // Count team positions
            const positionIndex = stats.teamPositions.findIndex(pos => pos.position === game.teamPosition);
            if (positionIndex !== -1) {
                stats.teamPositions[positionIndex].count++;
            } else {
                stats.teamPositions.push({ position: game.teamPosition, count: 1 });
            }
        });

        let championArray = [];
        for (let championId in stats.championIds) {
            championArray.push({ championId, count: stats.championIds[championId] });
        }
        championArray.sort((a, b) => b.count - a.count);
        const top5Champions = championArray.slice(0, 5);
        stats.championIds = top5Champions;

        return stats;

    } catch (error) {
        console.error("Error fetching players:", error.message);
        return null;
    }
}

export { updateStats };
