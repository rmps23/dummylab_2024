import { json, requireProUser } from "@/lib/auth";
import { buildWeeklyReport, reportToCsv } from "@/lib/report";
import { loadReportData } from "@/lib/reportData";

// The weekly report of a team as JSON (default) or as a CSV download (?format=csv).
export async function GET(request, { params }) {
  const { supabase, error } = await requireProUser("The weekly report");
  if (error) return error;

  const data = await loadReportData(supabase, params.id);
  if (!data) return json({ error: "Team not found" }, 404);
  const report = buildWeeklyReport(data);

  if (request.nextUrl.searchParams.get("format") === "csv") {
    return new Response(reportToCsv(report), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="weekly-report.csv"`,
      },
    });
  }
  return json({ report });
}
