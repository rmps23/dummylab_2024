"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabase";
import CircularProgress from "@mui/material/CircularProgress";
import { FaRightFromBracket } from "react-icons/fa6";

const Logout = () => {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);

  const signOut = async () => {
    setLoading(true);
    setTimeout(async () => {
      try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          throw error;
        }
        router.push("/");
      } catch (error) {
        console.error("Logout error:", error.message);
        router.push("/");
      }
    }, 1000);
  };

  return (
    <>
      {loading ? (
        <div className="bg-zinc-900 flex items-center w-2/3 rounded-md h-8 justify-center"
        >
          <span className="text-sm flex">
            <CircularProgress size={12} color="inherit" />
          </span>
        </div>
      ) : (
        <button
          onClick={() => signOut()}
          className="bg-zinc-950 flex items-center w-2/3 rounded-md h-8 justify-center hover:bg-zinc-900"
        >
          <FaRightFromBracket></FaRightFromBracket>
        </button>
      )}
    </>
  );
};

export default Logout;
