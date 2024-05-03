'use client'

import Image from 'next/image'
import SideBarLink from './SideBarLink'
import { FaUsers } from "react-icons/fa6";
import { FaGauge } from "react-icons/fa6";

const SideBar = () => {
    return (
        <div className='bg-stone-900 h-screen w-72 py-10'>
            <div className='flex justify-center border-b border-stone-700 pb-10'>
                <Image src="/assets/logos/dummylab-logo.svg" width={140} height={200} alt="Logo"></Image>
            </div>
            <div className='flex flex-col text-right py-10 gap-4'>
                <SideBarLink link="/dashboard" text="Dashboard" icon={<FaGauge></FaGauge>}></SideBarLink>
                <SideBarLink link="/dashboard/players" text="Players" icon={<FaUsers></FaUsers>}></SideBarLink>
            </div>
        </div>
    )
}

export default SideBar