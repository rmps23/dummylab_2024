// Champion art from Data Dragon (Riot static data), faded out towards the left so text stays readable.
export default function ChampionSplash({ name, className = "" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://ddragon.leagueoflegends.com/cdn/img/champion/centered/${name}_0.jpg`}
      alt=""
      aria-hidden="true"
      loading="lazy"
      className={`pointer-events-none absolute inset-y-0 right-0 h-full w-2/3 object-cover opacity-60 [mask-image:linear-gradient(to_left,black_25%,transparent)] ${className}`}
    />
  );
}
