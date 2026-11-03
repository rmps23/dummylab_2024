"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/supabase";
import { userStore } from "@/store/userStore";
import { featureStore } from "@/store/featureStore";
import { FaRightFromBracket } from "react-icons/fa6";

const Logout = ({ className = "h-10 w-10" }) => {
  const router = useRouter();
  const clearUser = userStore((s) => s.clearUser);
  const [loading, setLoading] = useState(false);

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    clearUser();
    featureStore.getState().reset();
    router.push("/");
    router.refresh();
  };

  return (
    <button
      onClick={signOut}
      disabled={loading}
      aria-label="Log out"
      className={`flex shrink-0 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-white/[0.07] hover:text-zinc-100 disabled:opacity-50 ${className}`}
    >
      <FaRightFromBracket />
    </button>
  );
};

export default Logout;
