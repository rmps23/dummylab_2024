import Link from "next/link";
import Footer from "@/components/Footer";
import { SITE } from "@/lib/site";

export default function LegalPage({ title, children }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-zinc-800 px-4 py-3">
        <Link href="/" className="inline-flex min-h-11 items-center text-lg">
          DUMMY<span className="text-cyan-400">LAB</span>
        </Link>
      </header>
      <main id="main" className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-zinc-400">Last updated: {SITE.legalUpdated}</p>
        <div className="mt-6 flex flex-col gap-5 text-zinc-300 [&_h2]:mb-1 [&_h2]:text-lg [&_h2]:text-zinc-100 [&_ul]:ml-5 [&_ul]:list-disc [&_a]:text-cyan-400 [&_a]:underline">
          {children}
        </div>
      </main>
      <Footer className="px-4 pb-8" />
    </div>
  );
}
