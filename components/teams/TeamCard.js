import React from 'react'
import { FaPen, FaTrash } from 'react-icons/fa6'
import Modal from '../ui/Modal'
import EditTeam from './EditTeam'
import RemoveTeam from './RemoveTeam'
import { useState } from 'react'

const TeamCard = ({ team }) => {
    const [removeTeamModal, setRemoveTeamModal] = useState(false);
    const [editTeamModal, setEditTeamModal] = useState(false);
    const [editTeamId, setEditTeamId] = useState(null);

    const handleOpenEditModal = (teamId) => {
        // Receive teamId as parameter
        setEditTeamId(teamId); // Set the team ID for the edit modal
        setEditTeamModal(true);
    };

    const handleCloseEditModal = () => {
        setEditTeamModal(false);
        setEditTeamId(null); // Reset the team ID when closing the modal
    };

    const handleOpenRemoveModal = (teamId) => {
        // Receive teamId as parameter
        setEditTeamId(teamId); // Set the team ID for the edit modal
        setRemoveTeamModal(true);
    };

    const handleCloseRemoveModal = () => {
        setEditTeamId(null); // Reset the team ID when closing the modal
        setRemoveTeamModal(false);
    };

    return (
        <div
            key={team.id}
            className="border border-zinc-900 bg-zinc-800 p-4 rounded-md flex justify-between"
        >
            <div className="flex items-center">{team.name}</div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => handleOpenEditModal(team.id)}
                    className="text-sm text-zinc-200 p-2 rounded-md bg-zinc-900"
                >
                    <FaPen />
                </button>
                <button
                    onClick={() => handleOpenRemoveModal(team.id)}
                    className="text-sm text-zinc-200 p-2 rounded-md bg-zinc-900"
                >
                    <FaTrash />
                </button>
                <Modal
                    show={editTeamModal && editTeamId === team.id}
                    onClose={handleCloseEditModal}
                    content={
                        <EditTeam
                            team_name={team.name}
                            team_id={team.id}
                            setEditTeamModal={setEditTeamModal}
                        />
                    }
                />
                <Modal
                    show={removeTeamModal && editTeamId === team.id}
                    onClose={handleCloseRemoveModal}
                    content={
                        <RemoveTeam
                            team_name={team.name}
                            team_id={team.id}
                            setRemoveTeamModal={setRemoveTeamModal}
                        />
                    }
                />
            </div>
        </div>
    )
}

export default TeamCard