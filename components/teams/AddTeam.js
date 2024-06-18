'use client'

import { useState } from 'react';
import { insertTeam } from "@/hooks/teams/insertTeam";
import { teamStore } from '@/store/teamStore';

const AddTeam = ({ user_id, setAddTeamModal }) => {
    const { addTeam } = teamStore();
    const [teamName, setTeamName] = useState('');

    async function handleAddTeam() {
        try {
            const response = await insertTeam(teamName, user_id);
            addTeam(response);
        } catch (error) {
            console.error('Error adding team:', error);
        } finally {
            setAddTeamModal(false);
            setTeamName("");
        }
    }

    const handleKeyDown = async (e) => {
        if (e.key === 'Enter') {
            await handleAddTeam();
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <p>Team Name</p>
            <input
                type="text"
                className="bg-zinc-950 p-2 rounded-md outline-none"
                placeholder="Insert team name..."
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                onKeyDown={handleKeyDown} // Handle Enter key press
            />
            <button className="bg-cyan-500 p-1 rounded-md" onClick={handleAddTeam}>Confirm</button>
        </div>
    );
};

export default AddTeam;
