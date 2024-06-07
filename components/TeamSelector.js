import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import Link from 'next/link';
import { teamStore } from '@/store/teamStore';
import Modal from './ui/Modal';

const TeamSelector = ({ user }) => {
    const teams = teamStore((state) => state.teams);
    const loading = teamStore((state) => state.loading);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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
            {teams.length > 0 && ( // Only render if there are teams
                <div className='gap-2 flex flex-col'>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search teams..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="text-sm px-2 py-2 bg-zinc-950 rounded-md focus:outline-none text-zinc-400 pr-8 mb-2"
                        />
                        <div className="absolute right-4 top-3 text-gray-400 text-xs">
                            <FaSearch />
                        </div>
                    </div>
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <>
                            {filteredTeams.length > 0 ? (
                                filteredTeams.map((team) => (
                                    <Link key={team.id} href={`/dashboard/${team.id}`} className='text-sm px-2 py-1 bg-zinc-800 rounded-md hover:bg-zinc-700'>
                                        {team.name}
                                    </Link>
                                ))
                            ) : (
                                <p>No teams found.</p>
                            )}
                        </>
                    )}
                </div>
            )}
            {teams.length === 0 && ( // Only show "Create Team" if there are no teams
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
        </div>
    );
};

export default TeamSelector;
