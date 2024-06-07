import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import Link from 'next/link';
import { teamStore } from '@/store/teamStore';
import Modal from './ui/Modal';
import { useParams } from 'next/navigation';

const TeamSelector = ({ user }) => {
    const teams = teamStore((state) => state.teams);
    const loading = teamStore((state) => state.loading);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const params = useParams();
    const paramTeamID = params.team_id;

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const filteredTeams = teams.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    return (
        <div className='flex flex-col'>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    {teams.length > 0 ? (
                        <div className='gap-2 flex flex-col'>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search teams..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="text-sm px-2 py-2 bg-zinc-950 rounded-md focus:outline-none text-zinc-400 pr-8 mb-2 w-full"
                                />
                                <div className="absolute right-4 top-3 text-gray-400 text-xs">
                                    <FaSearch />
                                </div>
                            </div>
                            {filteredTeams.length > 0 ? (
                                filteredTeams.map((team) => (
                                    <Link key={team.id} href={`/dashboard/${team.id}`} className={`text-sm px-2 py-2 bg-zinc-950 rounded-md hover:bg-zinc-800 ${paramTeamID == team.id ? 'text-cyan-500 font-bold' : 'text-zinc-400'}`}>
                                        {team.name}
                                    </Link>
                                ))
                            ) : (
                                <p>No teams found.</p>
                            )}
                        </div>
                    ) : (
                        <>
                            <button onClick={handleOpenModal} className='text-sm px-2 py-1 bg-zinc-800 rounded-md mt-2'>Create Team</button>
                            <Modal show={isModalOpen} onClose={handleCloseModal}>
                                <div>
                                    <p>Create a new team</p>
                                    <button onClick={handleCloseModal}>Close</button>
                                </div>
                            </Modal>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default TeamSelector;
