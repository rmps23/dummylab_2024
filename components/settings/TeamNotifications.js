"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { saveNotifications } from "@/hooks/teams";
import { teamStore } from "@/store/teamStore";
import { featureStore } from "@/store/featureStore";
import Card from "@/components/ui/Card";
import { btnPrimary, btnSecondary, inputClass } from "@/components/ui/buttons";
import { isPaid } from "@/lib/plans";

async function post(path) {
  const response = await fetch(path, { method: "POST" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Something went wrong");
}

export default function TeamNotifications() {
  const { teams, activeTeamId, patchTeam } = teamStore();
  const { plan, demo, loaded } = featureStore();
  const team = teams.find((t) => t.id === activeTeamId);

  const [webhook, setWebhook] = useState("");
  const [email, setEmail] = useState("");
  const [weekly, setWeekly] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setWebhook(team?.discord_webhook_url ?? "");
    setEmail(team?.report_email ?? "");
    setWeekly(!!team?.weekly_report);
  }, [team?.id, team?.discord_webhook_url, team?.report_email, team?.weekly_report]);

  if (!team || (team.my_role && team.my_role !== "owner")) return null;

  async function run(label, action) {
    setBusy(true);
    try {
      await action();
      toast.success(label);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  const save = () =>
    run("Notification settings saved", async () => {
      const saved = await saveNotifications(team.id, { discord_webhook_url: webhook.trim(), report_email: email.trim(), weekly_report: weekly });
      patchTeam(team.id, saved);
    });

  if (loaded && !isPaid(plan)) {
    return (
      <Card title={`Notifications · ${team.name}`}>
        <p className="text-sm text-zinc-300">
          Discord reminders and the weekly email report are Pro features.
        </p>
        <Link href="/dashboard/billing" className={`${btnPrimary} mt-3`}>
          See Pro
        </Link>
      </Card>
    );
  }

  return (
    <Card title={`Notifications · ${team.name}`}>
      {demo && <p className="mb-3 text-sm text-amber-300">Sending is disabled in the demo account.</p>}
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="discord-webhook" className="text-sm font-semibold">
            Discord webhook
          </label>
          <input
            id="discord-webhook"
            type="url"
            value={webhook}
            onChange={(e) => setWebhook(e.target.value)}
            placeholder="https://discord.com/api/webhooks/..."
            className={inputClass}
          />
          <p className="text-xs text-zinc-400">
            In Discord: channel settings, Integrations, Webhooks, New webhook, Copy URL. Then use &quot;Remind on Discord&quot; on any event.
          </p>
          <div>
            <button
              onClick={() => run("Test message sent", () => post(`/api/teams/${team.id}/discord-test`))}
              disabled={busy || demo || !team.discord_webhook_url}
              className={btnSecondary}
            >
              Send a test message
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="report-email" className="text-sm font-semibold">
            Weekly report email
          </label>
          <input
            id="report-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Leave empty to use your account email"
            className={inputClass}
          />
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={weekly} onChange={(e) => setWeekly(e.target.checked)} className="h-4 w-4 accent-brand" />
            Email me the report every Monday
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => run("Report sent", () => post(`/api/teams/${team.id}/report/email`))}
              disabled={busy || demo}
              className={btnSecondary}
            >
              Send the report now
            </button>
            <Link href="/dashboard/report" className={btnSecondary}>
              View the report
            </Link>
          </div>
        </div>

        <button onClick={save} disabled={busy} className={`${btnPrimary} self-start`}>
          Save notification settings
        </button>
      </div>
    </Card>
  );
}
