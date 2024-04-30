"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabase";
import { AiOutlinePoweroff } from "react-icons/ai";
import { useParams } from "next/navigation";


const Logout = ({ hover }) => {
  const router = useRouter();
  const params = useParams();
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
      } catch (error) {
        console.error("Logout error:", error.message);
      } finally {
        router.push("/");
      }
    }, 1000);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, []);

  return (
    <>
      <button onClick={() => signOut()}>
        {loading ? (
          <>
            <div className="bg-zinc-900 rounded-md h-10 mx-2 items-center justify-center transition-all hidden sm:flex">
              <span className="text-2xl transition-all">
              </span>
            </div>
          </>
        ) : (
          <>
            <AiOutlinePoweroff />
            Logout
          </>
        )
        }
      </button >
    </>
  );
};

export default Logout;
