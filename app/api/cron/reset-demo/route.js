import { json } from "@/lib/auth";
import { seedDemo } from "@/lib/demo";

export const maxDuration = 60;

// Vercel Cron calls this daily with `Authorization: Bearer $CRON_SECRET`.
export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return json({ error: "Unauthorized" }, 401);
  }
  try {
    return json(await seedDemo());
  } catch (error) {
    return json({ error: error.message }, 500);
  }
}
