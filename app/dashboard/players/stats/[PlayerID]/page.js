'use client';

import React, { useState } from 'react';
import Navbar from '@/components/navbar/Navbar';
import { useParams } from 'next/navigation';
import { updateStats } from '@/functions/UpdateStats';

const Stats = () => {
    const params = useParams();
    const player_id = params.PlayerID;

    const handleUpdate = async () => {
        const stats = await updateStats(player_id);
        console.log(stats);
    };

    return (
        <div>
            <Navbar />
            <div className="pl-72 pr-8 py-8">
                <button onClick={handleUpdate}>Update</button> {/* Removed extra parentheses */}
            </div>
        </div>
    );
};

export default Stats;
