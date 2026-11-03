import Link from "next/link";

export default function Footer({ className = "" }) {
  return (
    <footer className={`mx-auto max-w-2xl text-center text-xs text-zinc-400 ${className}`}>
      <p>
        DummyLab isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views or opinions of Riot Games or
        anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated
        properties are trademarks or registered trademarks of Riot Games, Inc.
      </p>
      <p className="mt-1 flex justify-center gap-2">
        <Link href="/terms" className="inline-flex min-h-11 items-center px-2 underline underline-offset-2 hover:text-zinc-200">
          Terms
        </Link>
        <Link href="/privacy" className="inline-flex min-h-11 items-center px-2 underline underline-offset-2 hover:text-zinc-200">
          Privacy
        </Link>
      </p>
    </footer>
  );
}
