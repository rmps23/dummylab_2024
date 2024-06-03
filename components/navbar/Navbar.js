"use client";

import { supabase } from "@/supabase";
import { GrGroup, GrShield } from "react-icons/gr";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavbarLink from "./NavbarLink";
import Logout from "../auth/Logout";
import { usePathname } from "next/navigation";
import Image from "next/image";

const Navbar = () => {
  const [session, setSession] = useState();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        router.push("/");
      }
    });
  }, []);

  return (
    <>
      <div className="flex flex-col w-72 bg-neutral-950 justify-between shadow-md shadow-neutral-950 gap-4 pt-4 pl-4 pb-4">
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-center p-2 bg-cyan-400/70 shadow-lg shadow-cyan-500/20 rounded-l-md mb-4">
            <Image
              src={`/assets/logos/dummylogo.png`}
              height={40}
              width={40}
              alt=""
              className="bg-neutral-900 p-2 rounded-md"
            ></Image>
            <p className="pt-1 text-neutral-900 font-bold">DUMMYLAB</p>
          </div>
          <div className="flex flex-col gap-2 pr-4">
            <NavbarLink
              link="/teams"
              icon={<GrShield></GrShield>}
              text="Teams"
            ></NavbarLink>
            <NavbarLink
              link="/dashboard/players"
              icon={<GrGroup></GrGroup>}
              text="Players"
            ></NavbarLink>
          </div>
        </div>
        <div>
          <Logout />
        </div>
      </div>
    </>
  );
};

export default Navbar;
