"use client";

import { useEffect, useState } from "react";

let versionPromise;
function latestVersion() {
  versionPromise ??= fetch("https://ddragon.leagueoflegends.com/api/versions.json")
    .then((r) => r.json())
    .then((v) => v[0])
    .catch(() => "14.24.1");
  return versionPromise;
}

// Latest Data Dragon version, for champion icon URLs. Client only.
export function useDdragonVersion() {
  const [version, setVersion] = useState(null);
  useEffect(() => {
    latestVersion().then(setVersion);
  }, []);
  return version;
}
