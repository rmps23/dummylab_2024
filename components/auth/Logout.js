"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/supabase";
import { userStore } from "@/store/userStore";
import { featureStore } from "@/store/featureStore";
import { FaRightFromBracket } from "react-icons/fa6";

const Logout = ({ className = "h-9 px-3" }) => {
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
      className={`flex shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-900 disabled:opacity-50 ${className}`}
    >
      <FaRightFromBracket />
    </button>
  );
};

export default Logout;
