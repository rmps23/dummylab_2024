import { newToken } from "@/lib/invites";
import { STAFF_ROLES, ROLE_LABELS, ROLE_HELP } from "@/lib/teamRoles";
import { SITE } from "@/lib/site";

export { STAFF_ROLES, ROLE_LABELS, ROLE_HELP };
export { newToken };
export const inviteUrl = (token, base = SITE.url) => `${base}/join/${token}`;

// Why an invitation cannot be accepted by this user, or null if it can.
export function inviteProblem(invite, user, now = new Date()) {
  if (!invite) return "invalid";
  if (invite.revoked_at) return "revoked";
  if (invite.accepted_at) return "used";
  if (new Date(invite.expires_at) <= now) return "expired";
  if (!user?.email || user.email.trim().toLowerCase() !== String(invite.email).trim().toLowerCase()) return "wrong_email";
  return null;
}

export const INVITE_MESSAGES = {
  invalid: "This invitation link is not valid.",
  revoked: "The coach cancelled this invitation.",
  used: "This invitation was already used.",
  expired: "This invitation has expired. Ask the coach to send a new one.",
  wrong_email: "This invitation was sent to a different email address. Sign in with the address that received it.",
};

export function inviteEmail({ teamName, role, url, inviter }) {
  const C = { ink: "#0E0F12", panel: "#15171B", line: "#2B3037", text: "#E8E8E8", muted: "#A6ADB5", brand: "#4AC0DE" };
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const who = inviter ? esc(inviter) : "A coach";
  const subject = `You are invited to ${teamName} on DummyLab`;
  const html = `<div style="background:${C.ink};padding:24px 12px;font-family:Arial,Helvetica,sans-serif;color:${C.text}">
<div style="max-width:480px;margin:0 auto">
<img src="${SITE.url}/assets/logos/dummylab_logo.png" width="150" alt="DummyLab" style="display:block;margin:0 0 16px">
<div style="background:${C.panel};border:1px solid ${C.line};border-radius:10px;padding:24px">
<h1 style="margin:0 0 12px;font-size:20px">Join ${esc(teamName)}</h1>
<p style="margin:0 0 8px;font-size:15px;line-height:1.5;color:${C.muted}">${who} invited you to <b style="color:${C.text}">${esc(teamName)}</b> on DummyLab as <b style="color:${C.text}">${esc(ROLE_LABELS[role] ?? role)}</b>.</p>
<p style="margin:0 0 20px;font-size:14px;line-height:1.5;color:${C.muted}">${esc(ROLE_HELP[role] ?? "")} The link works for 7 days. Sign in or create an account with this email address.</p>
<a href="${url}" style="display:inline-block;background:${C.brand};color:#04222B;font-weight:700;font-size:15px;text-decoration:none;padding:12px 20px;border-radius:8px">Open the invitation</a>
</div>
</div></div>`;
  const text = `${who} invited you to ${teamName} on DummyLab as ${ROLE_LABELS[role] ?? role}.\n\nOpen the invitation (valid for 7 days): ${url}\n\nSign in or create an account with this email address.`;
  return { subject, html, text };
}
