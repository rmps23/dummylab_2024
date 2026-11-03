"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { userStore } from "@/store/userStore";
import { deleteAcc } from "@/hooks/users";

const RemoveAcc = ({ setRemoveAccModal }) => {
  const router = useRouter();
  const user = userStore((s) => s.user);
  const clearUser = userStore((s) => s.clearUser);
  const [accName, setAccName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRemoveAcc() {
    setLoading(true);
    try {
      await deleteAcc();
      clearUser();
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
      setRemoveAccModal(false);
    }
  }

  const confirmed = user && accName === user.email;

  return (
    <div className="flex flex-col gap-8">
      <p>
        Type <span className="font-bold text-brand bg-white/10 px-1.5 py-0.5 rounded-md">{user?.email}</span> to confirm. This
        deletes your account, teams, players and stats.
      </p>
      <input
        type="text"
        className="min-h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 text-sm outline-none transition placeholder:text-zinc-500 focus:border-brand/60 focus:ring-2 focus:ring-brand/20"
        value={accName}
        onChange={(e) => setAccName(e.target.value)}
      />
      <div className="flex gap-4 justify-center">
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-rose-600/90 px-4 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-30 flex-1"
          disabled={!confirmed || loading}
          onClick={handleRemoveAcc}
        >
          Delete account
        </button>
        <button className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] px-4 text-sm font-semibold text-zinc-100 hover:bg-white/10" onClick={() => setRemoveAccModal(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RemoveAcc;
