export default function Footer({ className = "" }) {
  return (
    <p className={`text-xs text-zinc-400 text-center max-w-2xl mx-auto ${className}`}>
      DummyLab isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views or opinions of Riot Games or
      anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated
      properties are trademarks or registered trademarks of Riot Games, Inc.
    </p>
  );
}
