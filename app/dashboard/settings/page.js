'use client';

import React from "react";
import { FaGear, FaUser } from "react-icons/fa6";
import { userStore } from "@/store/userStore";

const Settings = () => {
  const user = userStore((state) => state.user);

  console.log(user);
  if (!user) {
    return <div>Loading...</div>;
  }

  return <>
    <div className="flex items-center gap-6 w-full pb-4 mb-20 border-b border-zinc-900">
      <div className="flex items-center gap-4">
        <FaGear className="bg-zinc-900 p-2 text-4xl rounded-md" />
        <span className="text-lg">Settings</span>
      </div>
    </div>

    <div className="flex flex-col max-w-[800px] mx-auto justify-center w-full">
      <h3 className="pb-2 font-bold flex items-baseline gap-2"><FaUser /> My Account</h3>
      <div className="flex flex-col gap-2 p-4 border border-zinc-900 rounded-md">
        <p>Username</p>
        <input type="text" value={user.identities[0].identity_data.custom_claims.global_name} className="bg-zinc-800 p-2 rounded-md outline-none" disabled></input>
        <p>Email</p>
        <input type="text" value={user.identities[0].email} className="bg-zinc-800 p-2 rounded-md outline-none"></input>
      </div>
    </div>

  </>
};

export default Settings;
