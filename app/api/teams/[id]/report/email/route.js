import { json, requireProUser } from "@/lib/auth";
import { emailConfigured, sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/ratelimit";
import { buildWeeklyReport, reportToHtml, reportToText } from "@/lib/report";
import { loadReportData } from "@/lib/reportData";

// Sends the weekly report now, to the team's report address (or to your own email).
export async function POST(request, { params }) {
  const { supabase, user, error } = await requireProUser("The weekly report", { allowDemo: false });
  if (error) return error;
  if (!emailConfigured()) return json({ error: "Email is not configured on this server yet", code: "email_disabled" }, 503);

  const limit = rateLimit(`report-email:${user.id}`, { limit: 3, windowMs: 60_000 });
  if (!limit.ok) return json({ error: "Too many emails, try again shortly" }, 429, { "Retry-After": String(limit.retryAfter) });

  const data = await loadReportData(supabase, params.id);
  if (!data) return json({ error: "Team not found" }, 404);
  const report = buildWeeklyReport(data);

  try {
    await sendEmail({
      to: data.team.report_email || user.email,
      subject: `${report.team}: weekly report`,
      html: reportToHtml(report),
      text: reportToText(report),
    });
    return json({ ok: true });
  } catch (e) {
    return json({ error: e.message }, 502);
  }
}
