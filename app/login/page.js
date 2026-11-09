import Image from "next/image";
import Link from "next/link";
import Login from "@/components/auth/Login";
import Footer from "@/components/Footer";

export const metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }) {
  const mode = searchParams?.mode === "signup" ? "signup" : "signin";
  return (
    <main id="main" className="flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-6xl items-center px-6 py-4">
        <Link href="/" aria-label="DummyLab home">
          <Image src="/assets/logos/dummylab_logo.png" width={140} height={33} alt="DummyLab" priority className="h-auto w-[140px]" />
        </Link>
      </div>
      <div className="flex flex-1 items-center px-6 py-8">
        <Login initialMode={mode} />
      </div>
      <Footer className="px-6 pb-8" />
    </main>
  );
}
