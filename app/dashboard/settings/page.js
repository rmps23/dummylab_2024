"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaBan, FaCrown, FaGear, FaUser } from "react-icons/fa6";
import { toast } from "react-toastify";
import { isDemo, userStore } from "@/store/userStore";
import { updateUserEmail } from "@/hooks/users";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import { btnDanger, btnPrimary, btnSecondary, inputClass } from "@/components/ui/buttons";
import RemoveAcc from "@/components/auth/RemoveAcc";
import TeamNotifications from "@/components/settings/TeamNotifications";
import TeamStaff from "@/components/settings/TeamStaff";

const Settings = () => {
  const user = userStore((s) => s.user);
  const [newEmail, setNewEmail] = useState("");
  const [removeAccModal, setRemoveAccModal] = useState(false);

  useEffect(() => {
    if (user?.email) setNewEmail(user.email);
  }, [user]);

  if (!user) return <Skeleton className="m-6 h-48 max-w-2xl" />;

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
      <PageHeader icon={FaGear} title="Settings" subtitle={user.email} />

      <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 sm:p-6">
        {demo && (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
            This is the demo account: email and account deletion are disabled.
          </p>
        )}

        <Card title="My account">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <FaUser aria-hidden="true" className="text-brand" />
              {displayName || "Signed in with email"}
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="settings-email" className="text-sm font-semibold">
                Email
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  id="settings-email"
                  type="email"
                  onChange={(e) => setNewEmail(e.target.value)}
                  value={newEmail}
                  disabled={demo}
                  className={`${inputClass} disabled:opacity-50`}
                />
                {changed && !demo && (
                  <button onClick={handleEditEmail} className={btnPrimary}>
                    Confirm
                  </button>
                )}
              </div>
            </div>
          </div>
        </Card>

        <TeamNotifications />
        <TeamStaff />

        <Card title="Plan">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-sm text-sm text-zinc-300">See your plan, usage and limits, or upgrade to Pro.</p>
            <Link href="/dashboard/billing" className={btnSecondary}>
              <FaCrown aria-hidden="true" /> Plan and billing
            </Link>
          </div>
        </Card>

        <Card title="Danger zone" className="border-rose-500/25">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-sm text-sm text-zinc-300">
              Deleting your account removes your teams, players, schedule and stats. This cannot be undone.
            </p>
            <button onClick={() => setRemoveAccModal(true)} disabled={demo} className={btnDanger}>
              <FaBan aria-hidden="true" /> Delete account
            </button>
          </div>
          <Modal
            title="Delete account"
            show={removeAccModal}
            onClose={() => setRemoveAccModal(false)}
            content={<RemoveAcc setRemoveAccModal={setRemoveAccModal} />}
          />
        </Card>
      </div>
    </>
  );
};

export default Settings;
