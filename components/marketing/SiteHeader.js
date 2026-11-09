import Image from "next/image";
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink/95"><div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
      <Link href="/" aria-label="DummyLab home">
        <Image src="/assets/logos/dummylab_logo.png" width={140} height={33} alt="DummyLab" priority className="h-auto w-[140px]" />
      </Link>
      <nav aria-label="Site" className="flex items-center gap-1 text-sm font-semibold">
        <Link href="/pricing" className="inline-flex min-h-11 items-center rounded-lg px-3 text-zinc-300 hover:bg-white/[0.06] hover:text-white">
          Pricing
        </Link>
        <Link href="/#start" className="inline-flex min-h-11 items-center rounded-lg px-3 text-brand hover:bg-white/[0.06]">
          Try the demo
        </Link>
      </nav>
    </div></header>
  );
}
