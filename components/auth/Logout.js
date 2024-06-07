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
    <div>
      {loading ? (
        <div className="bg-neutral-900 flex py-2 px-4 rounded-md gap-3 items-center w-full justify-center">
          <span className="text-sm flex">
            <CircularProgress size={20} color="inherit" />
          </span>
        </div>
      ) : (
        <button
          onClick={() => signOut()}
          className="bg-neutral-800 flex py-2 px-4 rounded-md gap-3 items-center w-full"
        >
          <span className="text-sm flex items-center gap-4">
            <FaRightFromBracket></FaRightFromBracket> Logout
          </span>
        </button>
      )}
    </div>
  );
};

export default Logout;
