import { insertPlayer } from '@/hooks/insertPlayer';
import { userStore } from '@/store/userStore';
import { playerStore } from '@/store/playerStore';
import React, { useState } from 'react';
import { useParams } from 'next/navigation';

const AddPlayer = ({ onClose }) => {
    const [playerName, setPlayerName] = useState("");
    const [riotId, setRiotId] = useState("");
    const [tagLine, setTagLine] = useState("");
    const [role, setRole] = useState("1");
    const [loading, setLoading] = useState(false);
    const user = userStore((state) => state.user);
    const params = useParams();
    const { addPlayer } = playerStore(state => ({
        addPlayer: state.addPlayer,
    }));

    const handlePlayerSubmit = async () => {
        if (!playerName || !riotId || !tagLine) {
            // Basic form validation, all fields must be filled
            return;
        }

        setLoading(true);

        try {
            const riotID = `${riotId}#${tagLine}`;
            const newPlayer = await insertPlayer(playerName, role, riotID, user.id, params.team_id);
            await addPlayer(newPlayer); // Update playerStore with new player
            setLoading(false);
            onClose(); // Close modal after successful player insertion
        } catch (error) {
            console.error('Error adding player:', error);
            setLoading(false);
            // Handle error (e.g., show error message to user)
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <p className="text-sm uppercase">Player name</p>
                <input
                    type="text"
                    className="outline-none bg-zinc-950 p-2 rounded-md"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                />
            </div>
            <div className="flex flex-col gap-2">
                <p className="text-sm uppercase">Riot ID</p>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        className="outline-none bg-zinc-950 p-2 rounded-md w-1/3"
                        value={riotId}
                        onChange={(e) => setRiotId(e.target.value)}
                    />
                    <p className="w-auto">#</p>
                    <input
                        type="text"
                        className="outline-none bg-zinc-950 p-2 rounded-md w-1/3"
                        value={tagLine}
                        onChange={(e) => setTagLine(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <p className="text-sm uppercase">Role</p>
                <select
                    className="outline-none bg-zinc-950 p-2 rounded-md"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                >
                    <option value="1">Top</option>
                    <option value="2">Jungler</option>
                    <option value="3">Mid</option>
                    <option value="4">Bottom</option>
                    <option value="5">Support</option>
                </select>
            </div>
            <div className="flex justify-end mt-2">
                <button
                    className="bg-cyan-500 py-1 px-4 rounded-md text-zinc-950"
                    onClick={handlePlayerSubmit}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "Confirm"}
                </button>
            </div>
        </div>
    )
}

export default AddPlayer;
