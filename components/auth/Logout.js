"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabase";
import CircularProgress from "@mui/material/CircularProgress";

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
        <div className="flex items-center justify-center gap-2">
          <CircularProgress size={20} color="inherit" /> Logout
        </div>
      ) : (
        <button onClick={() => signOut()}>Logout</button>
      )}
    </>
  );
};

export default Logout;
