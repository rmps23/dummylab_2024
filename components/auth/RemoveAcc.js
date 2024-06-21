'use client';

import { userStore } from "@/store/userStore";
import { useState } from "react";
import { deleteAcc } from "@/hooks/users/deleteAcc";

const RemoveAcc = ({ setRemoveAccModal }) => {
    const { user } = userStore(); // invoking the custom hook correctly
    const [accName, setAccName] = useState('');

    async function handleRemoveAcc() {
        try {
            await deleteAcc(user.id);
        } catch (error) {
            console.error('Error removing acc:', error);
        } finally {
            setRemoveAccModal(false);
        }
    }

    function handleClose() {
        setRemoveAccModal(false);
    }

    return (
        <div className="flex flex-col gap-8">
            {user && <>
                <p>Please enter <span className="font-bold text-cyan-400 bg-zinc-800 p-1 rounded-md">{user.email}</span> below to confirm.</p>
                <input
                    type="text"
                    className="bg-zinc-900 p-2 rounded-md outline-none"
                    value={accName}
                    onChange={(e) => setAccName(e.target.value)}
                />
            </>
            }
            <div className='flex gap-4 justify-center'>
                <button
                    className={`bg-zinc-900 py-1 px-2 rounded-md flex-1 ${accName !== user.email && 'opacity-20'}`}
                    disabled={accName !== user.email}
                    onClick={handleRemoveAcc}
                >
                    Confirm
                </button>
                <button className="bg-zinc-100 text-zinc-950 py-1 px-2 rounded-md" onClick={handleClose}>Cancel</button>
            </div>
        </div>
    );
};

export default RemoveAcc;
