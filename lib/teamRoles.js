// Client-safe constants for team roles (no server-only imports here).
export const STAFF_ROLES = ["staff", "viewer"];
export const ROLE_LABELS = { owner: "Owner", staff: "Staff", viewer: "Viewer" };
export const ROLE_HELP = {
  staff: "Sees everything, edits the schedule and availability, keeps private notes.",
  viewer: "Sees everything, changes nothing.",
};
