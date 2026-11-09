import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Public status check for uptime monitors. It reveals only whether the app and its database answer.
export async function GET() {
  const started = Date.now();
  let database = false;
  try {
    const { error } = await Promise.race([
      createAdminClient().from("team").select("id", { head: true, count: "exact" }).limit(1),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 4000)),
    ]);
    database = !error;
  } catch {
    database = false;
  }
  return Response.json(
    { ok: database, database, ms: Date.now() - started },
    { status: database ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
