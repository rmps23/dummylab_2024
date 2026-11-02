import { useEffect, useState } from "react";

export const kda = (k, d, a) => (Number(k) + Number(a)) / Math.max(Number(d), 1);
export const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0);
export const fmt = (n, digits = 2) => (Number.isFinite(n) ? n.toFixed(digits) : "-");

let versionPromise;
function latestVersion() {
  versionPromise ??= fetch("https://ddragon.leagueoflegends.com/api/versions.json")
    .then((r) => r.json())
    .then((v) => v[0])
    .catch(() => "14.24.1");
  return versionPromise;
}

export function useDdragonVersion() {
  const [version, setVersion] = useState(null);
  useEffect(() => {
    latestVersion().then(setVersion);
  }, []);
  return version;
}
