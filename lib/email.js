// Sends email through Resend's REST API (free plan). Configure RESEND_API_KEY and RESEND_FROM.
export const emailConfigured = (env = process.env) => !!env.RESEND_API_KEY;

export async function sendEmail({ to, subject, html, text }, env = process.env, fetchImpl = fetch) {
  if (!env.RESEND_API_KEY) throw new Error("Email is not configured");
  const response = await fetchImpl("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.RESEND_FROM || "DummyLab <onboarding@resend.dev>", to: [to], subject, html, text }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Email provider answered ${response.status}`);
}
