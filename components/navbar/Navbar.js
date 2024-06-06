"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/supabase";
import { UserTeams } from "@/functions/teams/Teams";

const Navbar = ({ navteams }) => {
  const [session, setSession] = useState(null);
  const router = useRouter();
  const path = usePathname();

  console.log(navteams);

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
    <div className="w-60 bg-zinc-900 p-6 gap-4">
      <div>
        tes
      </div>
    </div>
  );
};

export default Navbar;
