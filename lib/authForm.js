// Small pure helpers for the sign-in forms (kept out of the components so they can be tested).
export const MIN_PASSWORD = 8;

export function validateCredentials({ email, password }, { requirePassword = true } = {}) {
  const mail = String(email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) return "Enter a valid email address.";
  if (requirePassword && String(password || "").length < MIN_PASSWORD) return `Use at least ${MIN_PASSWORD} characters for the password.`;
  return null;
}

// A hidden field that people never see: if it has a value, a bot filled the form.
export const honeypotTripped = (value) => typeof value === "string" && value.trim() !== "";

// Only allow redirects to a path on this site (blocks "https://evil.com" and "//evil.com").
export function safeNext(value, fallback = "/dashboard") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}
