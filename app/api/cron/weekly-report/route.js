import { json } from "@/lib/auth";
import { emailConfigured, sendEmail } from "@/lib/email";
import { buildWeeklyReport, reportToHtml, reportToText } from "@/lib/report";
import { loadReportData } from "@/lib/reportData";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPaid } from "@/lib/plans";

export const maxDuration = 60;

// Vercel Cron calls this every Monday with `Authorization: Bearer $CRON_SECRET`. It emails the weekly
// report of every team whose owner is on Pro and has the report switched on.
export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return json({ error: "Unauthorized" }, 401);
  if (!emailConfigured()) return json({ error: "Email is not configured" }, 503);

  const admin = createAdminClient();
  const { data: teams } = await admin.from("team").select("id, owner_id, report_email").eq("weekly_report", true);

  let sent = 0;
  const failures = [];
  for (const team of teams || []) {
    try {
      const { data: plan } = await admin.rpc("user_plan", { uid: team.owner_id });
      if (!isPaid(plan)) continue;

      let to = team.report_email;
      if (!to) {
        const { data } = await admin.auth.admin.getUserById(team.owner_id);
        to = data?.user?.email;
      }
      if (!to) continue;

      const data = await loadReportData(admin, team.id);
      if (!data) continue;
      const report = buildWeeklyReport(data);
      await sendEmail({ to, subject: `${report.team}: weekly report`, html: reportToHtml(report), text: reportToText(report) });
      sent++;
    } catch (e) {
      failures.push({ team: team.id, error: e.message });
    }
  }
  return json({ sent, failures });
}
