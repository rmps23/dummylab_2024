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
        <div className="bg-red-500 flex items-center gap-3 py-1 px-4 rounded-md justify-center">
          <CircularProgress size={24} color="inherit" />
        </div>
      ) : (
        <button onClick={() => signOut()} className="bg-red-500 flex items-center gap-3 py-1 px-4 rounded-md"><FaRightFromBracket></FaRightFromBracket> Logout</button>
      )}
    </>
  );
};

export default Logout;
