'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { teamStore } from '@/store/teamStore';
import Modal from './ui/Modal';

const TeamSelector = ({ user }) => {
    const teams = teamStore((state) => state.teams);
    const loading = teamStore((state) => state.loading);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div className='flex flex-col'>
            <p className='pb-1 mb-4 border-b border-zinc-700 text-xs uppercase text-zinc-300'>Teams</p>
            <div className='gap-2 flex flex-col'>
                {loading ? (
                    <p>Loading...</p>
                ) : teams.length > 0 ? (
                    teams.map((team) => (
                        <Link key={team.id} href={`/dashboard/${team.id}`} className='text-sm px-2 py-1 bg-zinc-800 rounded-md'>
                            {team.name}
                        </Link>
                    ))
                ) : (
                    <>
                        <button onClick={handleOpenModal} className='text-sm px-2 py-1 bg-zinc-800 rounded-md'>Create Team</button>
                        <Modal show={isModalOpen} onClose={handleCloseModal}>
                            <div>
                                <p>Create a new team</p>
                                <button onClick={handleCloseModal}>Close</button>
                            </div>
                        </Modal>
                    </>
                )}
            </div>

        </div>
    );
};

export default TeamSelector;
