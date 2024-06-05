'use client'

import { useEffect, useState, useRef } from "react";
import { TeamRegions, InsertTeam } from "@/functions/regions/Regions";
import { CircularProgress } from "@mui/material";
import { Slide, ToastContainer, Zoom, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateTeam = () => {
    const [regions, setRegions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadInsert, setLoadInsert] = useState(false);
    const [regCheck, setRegCheck] = useState(1);
    const teamNameRef = useRef();

    const get_team_regions = async () => {
        setIsLoading(true);
        try {
            const team_regions = await TeamRegions();
            setRegions(team_regions);
        } catch (error) {
            toast.error("Failed to fetch team regions");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        get_team_regions();
    }, []);

    const handleCheck = (index) => {
        setRegCheck(index);
    }

    const handleTeamInsert = async () => {
        setLoadInsert(true);
        const teamName = teamNameRef.current.value;
        if (!teamName) {
            toast.error("Team name cannot be empty");
            setLoadInsert(false);
            return;
        }
        if (regCheck === null) {
            toast.error("Please select a region");
            setLoadInsert(false);
            return;
        }

        await InsertTeam(teamName, regCheck);
        setLoadInsert(false);
    }

    return (
        <div className='flex flex-col items-center justify-center gap-10 p-40'>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                transition={Zoom}
            />
            <p className='text-5xl'>DUMMY<span className='text-cyan-400'>LAB</span></p>
            <p>Lets create a new team to manage!</p>
            <input
                ref={teamNameRef}
                className='w-1/3 p-2 rounded-md bg-zinc-950 text-center'
                placeholder='Insert your team name...'
            ></input>
            <p>Region</p>
            <div className="flex gap-10">
                {isLoading ? <CircularProgress color="inherit" /> : (
                    regions && regions.length > 0 ? (
                        regions.map((reg, index) => (
                            <div
                                key={index}
                                className={`p-2 rounded-md cursor-pointer hover:opacity-80 transition-all ease-in-out duration-100 outline-1 outline-zinc-700 outline outline-offset-4 text-center ${regCheck === index ? 'bg-cyan-400 text-zinc-950' : 'bg-zinc-950 text-zinc-300'}`}
                                onClick={() => handleCheck(index)}
                            >
                                <input
                                    type="radio"
                                    id={reg.slug}
                                    value={reg.id}
                                    checked={regCheck === index}
                                    onChange={() => handleCheck(index)}
                                    name="region"
                                    className="hidden"
                                />
                                {reg.name}
                            </div>
                        ))
                    ) : (
                        <CircularProgress color="inherit" />
                    )
                )}
            </div>
            <button className="bg-cyan-400 text-zinc-950 py-2 px-6 mt-14 rounded-md text-md transition-all ease-in-out hover:opacity-80" onClick={handleTeamInsert}>
                {loadInsert === true ? <CircularProgress color="inherit" size={12} /> : "Confirm"}
            </button>
        </div>
    )
}

export default CreateTeam
