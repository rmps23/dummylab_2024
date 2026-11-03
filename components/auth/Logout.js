"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/supabase";
import { userStore } from "@/store/userStore";
import { FaRightFromBracket } from "react-icons/fa6";

const Logout = () => {
  const router = useRouter();
  const clearUser = userStore((s) => s.clearUser);
  const [loading, setLoading] = useState(false);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    clearUser();
    router.push("/");
    router.refresh();
  };

  return (
    <button
      onClick={signOut}
      disabled={loading}
      aria-label="Log out"
      className="bg-zinc-950 flex items-center justify-center rounded-md h-8 px-3 hover:bg-zinc-900 text-zinc-400 disabled:opacity-50"
    >
      <FaRightFromBracket />
    </button>
  );
};

export default Logout;
