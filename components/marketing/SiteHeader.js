import Image from "next/image";
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
      <Link href="/" aria-label="DummyLab home">
        <Image src="/assets/logos/dummylab_logo.png" width={140} height={33} alt="DummyLab" priority className="h-auto w-[140px]" />
      </Link>
      <nav aria-label="Site" className="flex items-center gap-1 whitespace-nowrap text-sm font-semibold">
        <Link href="/pricing" className="hidden min-h-11 items-center rounded-lg px-3 text-zinc-300 hover:bg-white/[0.06] hover:text-white sm:inline-flex">
          Pricing
        </Link>
        <Link href="/#signin" className="inline-flex min-h-11 items-center rounded-lg px-3 text-zinc-300 hover:bg-white/[0.06] hover:text-white">
          Sign in
        </Link>
        <Link href="/#start" className="inline-flex min-h-11 items-center rounded-lg bg-brand px-4 text-zinc-950 hover:bg-brand-soft">
          Get started
        </Link>
      </nav>
    </header>
  );
}
