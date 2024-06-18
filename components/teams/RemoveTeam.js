'use client'

import { useState } from 'react';
import { teamStore } from '@/store/teamStore';
import { deleteTeam } from '@/hooks/teams/deleteTeam';

const RemoveTeam = ({ team_id, setRemoveTeamModal }) => {
    const { removeTeam } = teamStore();

    async function handleRemoveTeam() {
        try {
            await deleteTeam(team_id);
            removeTeam(team_id);
        } catch (error) {
            console.error('Error adding team:', error);
        } finally {
            setRemoveTeamModal(false);
        }
    }


    return (
        <div className="flex flex-col gap-4">
            <p>{team_id}</p>

            <button className="bg-cyan-500 p-1 rounded-md" onClick={handleRemoveTeam}>Confirm</button>
        </div>
    );
};

export default RemoveTeam;
