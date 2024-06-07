import React from 'react';
import { userStore } from "@/store/userStore";
import TeamSelector from "./TeamSelector";
import Link from 'next/link';
import Logout from './auth/Logout';

const Navbar = () => {
  const user = userStore((state) => state.user);

  return (
    <div className="w-60 bg-neutral-900 px-4 py-6 h-screen flex flex-col justify-between">
      <div className='flex flex-col gap-8'>
        <div className="flex items-center justify-center gap-8 flex-col">
          <Link href="/dashboard">
            DUMMY
            <span className="bg-cyan-400 text-neutral-950 px-1 rounded-sm font-bold">
              LAB
            </span>
          </Link>
        </div>
        <div>
          <TeamSelector user={user} />
        </div>
      </div>
      <div>
        <Logout></Logout>
      </div>
    </div>
  );
};

export default Navbar;
