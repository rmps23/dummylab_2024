// Pure stat helpers. Safe to import from server and client code.
export const kda = (k, d, a) => (Number(k) + Number(a)) / Math.max(Number(d), 1);
export const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0);
export const fmt = (n, digits = 2) => (Number.isFinite(n) ? n.toFixed(digits) : "-");
