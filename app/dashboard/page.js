'use client'

import React from 'react';
import TopBar from '@/components/navbar/TopBar';
import Navbar from '@/components/navbar/Navbar';
import { useState } from 'react';

const Dashboard = () => {
    onst[navteams, setNavteams] = useState();

    return (
        <>
            <TopBar setNavteams={setNavteams} />
            <div className='flex'>
                <Navbar navteams={navteams} />
                <div className='h-screen overflow-y-scroll w-full p-4'>
                    <p className='w-full bg-red-700'>teste</p>

                </div>

            </div>
        </>
    );
};

export default Dashboard;
