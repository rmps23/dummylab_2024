"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { supabase } from "@/supabase";
import { teamStore } from "@/store/teamStore";
import { featureStore } from "@/store/featureStore";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import { btnPrimary, btnSecondary, inputClass } from "@/components/ui/buttons";
import { ROLE_HELP, ROLE_LABELS } from "@/lib/teamRoles";

// Owner-only panel: invite analysts and assistants to the active team, see who has access, remove people.
export default function TeamStaff() {
  const { teams, activeTeamId } = teamStore();
  const { plan, demo, billing } = featureStore();
  const team = teams.find((t) => t.id === activeTeamId);

  const [rows, setRows] = useState({ pending: [], members: [] });
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState(null);

  const load = useCallback(async () => {
    if (!team) return;
    const { data } = await supabase
      .from("team_invite")
      .select("id, email, role, expires_at, accepted_at, accepted_by, revoked_at")
      .eq("team_id", team.id)
      .order("created_at", { ascending: false });
    const now = Date.now();
    const list = data || [];
    setRows({
      pending: list.filter((i) => !i.accepted_at && !i.revoked_at && new Date(i.expires_at) > now),
      members: list.filter((i) => i.accepted_at && i.accepted_by),
    });
  }, [team]);

  useEffect(() => {
    setLink(null);
    load();
  }, [load]);

  if (!team || team.my_role !== "owner") return null;

  async function invite(e) {
    e.preventDefault();
    setBusy(true);
    setLink(null);
    try {
      const response = await fetch(`/api/teams/${team.id}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Could not create the invitation");
      setEmail("");
      setLink({ url: body.url, emailed: body.emailed, to: body.invite.email });
      toast.success(body.emailed ? "Invitation sent" : "Invitation created: copy the link and send it");
      load();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function revoke(id) {
    const { error } = await supabase.from("team_invite").update({ revoked_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  }

  async function removeMember(row) {
    const { error } = await supabase.from("team_member").delete().eq("team_id", team.id).eq("user_id", row.accepted_by);
    if (error) return toast.error(error.message);
    toast.success(`${row.email} no longer has access`);
    load();
  }

  async function copy(url) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Copy failed: select the link and copy it by hand");
    }
  }

  const proOnly = plan !== "pro" && !demo;

  return (
    <Card title={`Staff of ${team.name}`}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-zinc-400">
          Give an analyst or assistant coach access to this team. They sign in with their own account. Players, billing and
          Riot settings stay with you.
        </p>

        {proOnly ? (
          <p className="rounded-lg border border-line bg-raised p-3 text-sm text-zinc-300">
            Inviting staff is a Pro feature (up to 3 people).{" "}
            {billing ? (
              <Link href="/dashboard/billing" className="font-semibold text-brand underline">Upgrade to Pro</Link>
            ) : (
              "Pro opens soon."
            )}
          </p>
        ) : demo ? (
          <p className="rounded-lg border border-line bg-raised p-3 text-sm text-zinc-300">Invitations are switched off in the demo account.</p>
        ) : (
          <form onSubmit={invite} className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <input
              type="email"
              required
              aria-label="Email of the person to invite"
              placeholder="analyst@example.com"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="sm:w-40">
              <Select
                label="Role"
                value={role}
                onChange={setRole}
                options={Object.keys(ROLE_HELP).map((r) => ({ value: r, label: ROLE_LABELS[r], hint: ROLE_HELP[r] }))}
              />
            </div>
            <button disabled={busy} className={`${btnPrimary} shrink-0`}>Invite</button>
          </form>
        )}
        <p className="-mt-2 text-xs text-zinc-500">{ROLE_HELP[role]}</p>

        {link && (
          <div className="rounded-lg border border-brand/40 bg-brand/10 p-3 text-sm">
            <p className="font-semibold">
              {link.emailed ? `Email sent to ${link.to}.` : `Email is not set up, so send this link to ${link.to}:`}
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input readOnly value={link.url} aria-label="Invitation link" className={inputClass} onFocus={(e) => e.target.select()} />
              <button onClick={() => copy(link.url)} className={btnSecondary}>Copy link</button>
            </div>
          </div>
        )}

        {rows.members.length + rows.pending.length > 0 && (
          <ul className="flex flex-col divide-y divide-line rounded-lg border border-line">
            {rows.members.map((m) => (
              <li key={m.id} className="flex items-center gap-3 p-3 text-sm">
                <span className="min-w-0 flex-1 truncate">{m.email}</span>
                <span className="rounded-full bg-well px-2.5 py-1 text-[11px] font-bold uppercase text-zinc-300">{m.role}</span>
                <button onClick={() => removeMember(m)} className="min-h-9 rounded-md px-2 text-xs font-semibold text-loss hover:bg-white/5">Remove</button>
              </li>
            ))}
            {rows.pending.map((p) => (
              <li key={p.id} className="flex items-center gap-3 p-3 text-sm">
                <span className="min-w-0 flex-1 truncate text-zinc-400">{p.email}</span>
                <span className="rounded-full bg-pop/15 px-2.5 py-1 text-[11px] font-bold uppercase text-pop">Invited · {p.role}</span>
                <button onClick={() => revoke(p.id)} className="min-h-9 rounded-md px-2 text-xs font-semibold text-loss hover:bg-white/5">Cancel</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
