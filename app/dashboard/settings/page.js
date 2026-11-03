"use client";

import { useEffect, useState } from "react";
import { FaGear, FaUser, FaBan } from "react-icons/fa6";
import { toast } from "react-toastify";
import { isDemo, userStore } from "@/store/userStore";
import { updateUserEmail } from "@/hooks/users";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import RemoveAcc from "@/components/auth/RemoveAcc";

const Settings = () => {
  const user = userStore((s) => s.user);
  const [newEmail, setNewEmail] = useState("");
  const [removeAccModal, setRemoveAccModal] = useState(false);

  useEffect(() => {
    if (user?.email) setNewEmail(user.email);
  }, [user]);

  if (!user) return <p className="p-6 text-zinc-400">Loading...</p>;

  const demo = isDemo(user);
  const changed = newEmail.trim() !== user.email;
  const displayName = user.user_metadata?.custom_claims?.global_name || user.user_metadata?.name;

  async function handleEditEmail() {
    try {
      await updateUserEmail(newEmail.trim());
      toast.success("Check your inbox to confirm the new email.");
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <>
      <PageHeader icon={FaGear} title="Settings" />

      {demo && (
        <p className="max-w-[800px] mx-auto mt-6 px-4 text-sm text-amber-400">
          This is the demo account: email and account deletion are disabled.
        </p>
      )}

      <div className="flex flex-col max-w-[800px] mx-auto justify-center w-full my-10 px-4">
        <h2 className="pb-2 font-bold flex items-center gap-2">
          <FaUser /> My Account
        </h2>
        <div className="flex flex-col gap-2 p-4 border border-zinc-800 rounded-md">
          {displayName && (
            <>
              <p>Username</p>
              <input type="text" value={displayName} className="bg-zinc-800 p-2 rounded-md outline-none" disabled />
            </>
          )}
          <p>Email</p>
          <div className="relative">
            <input
              type="email"
              onChange={(e) => setNewEmail(e.target.value)}
              value={newEmail}
              disabled={demo}
              className="bg-zinc-800 p-2 pr-24 rounded-md outline-none w-full disabled:opacity-50"
            />
            {changed && !demo && (
              <button
                onClick={handleEditEmail}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-cyan-500 text-zinc-950 py-1 px-2 rounded-md"
              >
                Confirm
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col max-w-[800px] mx-auto justify-center w-full px-4">
        <h2 className="pb-2 font-bold flex items-center gap-2">
          <FaBan /> Delete Account
        </h2>
        <div className="p-4 border border-zinc-800 rounded-md">
          <button
            onClick={() => setRemoveAccModal(true)}
            disabled={demo}
            className="text-sm bg-red-700 text-zinc-100 px-4 py-1 rounded-md disabled:opacity-30"
          >
            Delete
          </button>
          <Modal title="Delete account" show={removeAccModal} onClose={() => setRemoveAccModal(false)} content={<RemoveAcc setRemoveAccModal={setRemoveAccModal} />} />
        </div>
      </div>
    </>
  );
};

export default Settings;
