'use client'

import { useEffect, useState } from "react";
import { TeamRegions } from "@/functions/regions/Regions";
import { CircularProgress } from "@mui/material";

const CreateTeam = () => {
    const [regions, setRegions] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [regCheck, setRegCheck] = useState(0);

    const get_team_regions = async () => {
        setIsLoading(true);
        const team_regions = await TeamRegions();
        setRegions(team_regions);
        setIsLoading(false);
    };

    useEffect(() => {
        get_team_regions();
    }, []);

    function handleCheck() {
        setRegCheck(1);
    }

    return (
        <div className='h-screen w-screen flex flex-col items-center justify-center gap-10'>
            <p className='text-5xl'>DUMMY<span className='text-cyan-400'>LAB</span></p>
            <p>Lets create a new team to manage!</p>
            <input className='w-1/3 p-2 rounded-md bg-zinc-950 outline-1 outline-zinc-700 outline outline-offset-4 text-center' placeholder='Insert your team name...'></input>
            <p>Region</p>
            <div className="flex gap-10">
                {isLoading ? <CircularProgress color="inherit" /> : (
                    regions && regions.length > 0 ? (
                        regions.map((reg, index) => (
                            <div key={index} className={`p-2 rounded-md bg-zinc-950 outline-1 outline-zinc-700 outline outline-offset-4 text-center ${regCheck == index ?? ' bg-zinc-800'}`} onClick={handleCheck()}>
                                <input type="radio" id={reg.slug} value={reg.id} defaultChecked={index === 0}
                                ></input>
                                {reg.name}
                            </div>

                        ))
                    ) : (
                        <CircularProgress color="inherit" />
                    )
                )}
            </div >
        </div>
    )
}

export default CreateTeam