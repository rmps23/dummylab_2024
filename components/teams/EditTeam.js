'use client'

import { editTeam } from '@/hooks/editTeam';
import { useState } from 'react';

const EditTeam = ({ team_name, team_id }) => {
    const [teamName, setTeamName] = useState(team_name);

    async function handleEditTeam() {
        try {
            const response = await editTeam(teamName, team_id);
            // Assuming addTeam and setAddTeamModal are functions defined elsewhere
            // addTeam(response);
            // setAddTeamModal(false);
        } catch (error) {
            console.error('Error editing team:', error);
        }
    }

    const handleKeyDown = async (e) => {
        if (e.key === 'Enter') {
            await handleEditTeam();
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
                onKeyDown={handleKeyDown}
            />
            <button className="bg-cyan-500 p-1 rounded-md" onClick={handleEditTeam}>Confirm</button>
        </div>
    );
};

export default EditTeam;
