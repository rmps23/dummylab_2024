"use client";

import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/supabase";
import { FaUserGroup, FaGamepad } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NavbarLink from "./NavbarLink";
import Logout from "../auth/Logout";

const Navbar = () => {
  const [session, setSession] = useState();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        router.push("/");
      }
    });
  }, []);

  return (
    <div className="bg-neutral-800 fixed w-64 h-screen justify-between">
      <div className="flex flex-col justify-between h-full pb-10">
        <div>
          <div className="flex justify-center py-10">
            <Link href="/dashboard">
              <Image
                src="/assets/logos/dummylab-logo.svg"
                width={140}
                height={80}
                alt="DummyLab Logo"
              />
            </Link>
          </div>
          <div className="flex">
            <div className="flex flex-col w-full gap-4 px-5">
              <NavbarLink
                link="/dashboard"
                icon={<FaGamepad></FaGamepad>}
                text="Dashboard"
              ></NavbarLink>
              <NavbarLink
                link="/dashboard/players"
                icon={<FaUserGroup></FaUserGroup>}
                text="Players"
              ></NavbarLink>
            </div>
          </div>
        </div>
        <div className="flex flex-col w-full gap-4 px-5">
          <Logout></Logout>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
