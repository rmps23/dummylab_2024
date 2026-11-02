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
        Type <span className="font-bold text-cyan-400 bg-zinc-800 p-1 rounded-md">{user?.email}</span> to confirm. This
        deletes your account, teams, players and stats.
      </p>
      <input
        type="text"
        className="bg-zinc-900 p-2 rounded-md outline-none"
        value={accName}
        onChange={(e) => setAccName(e.target.value)}
      />
      <div className="flex gap-4 justify-center">
        <button
          className="bg-red-700 py-1 px-2 rounded-md flex-1 disabled:opacity-20"
          disabled={!confirmed || loading}
          onClick={handleRemoveAcc}
        >
          Delete account
        </button>
        <button className="bg-zinc-100 text-zinc-950 py-1 px-2 rounded-md" onClick={() => setRemoveAccModal(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RemoveAcc;
