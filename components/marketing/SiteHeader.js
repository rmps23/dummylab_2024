import Image from "next/image";
import Link from "next/link";
import { btnPrimary } from "@/components/ui/buttons";

const link = "inline-flex min-h-11 items-center rounded-lg px-3 text-zinc-300 hover:bg-white/[0.06] hover:text-white";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink/95">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-2.5">
        <Link href="/" aria-label="DummyLab home">
          <Image src="/assets/logos/dummylab_logo.png" width={140} height={33} alt="DummyLab" priority className="h-auto w-[140px]" />
        </Link>
        <nav aria-label="Site" className="flex items-center gap-1 text-sm font-semibold">
          <Link href="/pricing" className={link}>Pricing</Link>
          <Link href="/login" className={link}>Sign in</Link>
          <Link href="/login?mode=signup" className={`${btnPrimary} ml-1 hidden !min-h-10 sm:inline-flex`}>Get started</Link>
        </nav>
      </div>
    </header>
  );
}
