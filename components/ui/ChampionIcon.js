"use client";

import { useDdragonVersion } from "@/lib/useDdragonVersion";

export default function ChampionIcon({ name, size = 32 }) {
  const version = useDdragonVersion();
  const box = { width: size, height: size };
  if (!version) return <span className="inline-block rounded-md bg-zinc-700" style={box} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${name}.png`}
      alt={name}
      title={name}
      className="rounded-md bg-zinc-700"
      style={box}
    />
  );
}
