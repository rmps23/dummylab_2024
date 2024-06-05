"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/supabase";
import ModalAddTeam from "../lib/ModalAddTeam";
import CreateTeam from "../teams/CreateTeam";

const Navbar = () => {
  const [session, setSession] = useState(null);
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      if (!session) {
        router.push("/");
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className="flex flex-col w-60 fixed h-screen bg-zinc-950 p-6 gap-4">
      <div>
        <ModalAddTeam btn={"Create Team"} content={<CreateTeam />} />
      </div>
    </div>
  );
};

export default Navbar;
