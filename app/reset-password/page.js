import Image from "next/image";
import Link from "next/link";
import ResetPassword from "@/components/auth/ResetPassword";

export const metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return (
    <main id="main" className="flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-6xl items-center px-6 py-4">
        <Link href="/" aria-label="DummyLab home">
          <Image src="/assets/logos/dummylab_logo.png" width={140} height={33} alt="DummyLab" priority className="h-auto w-[140px]" />
        </Link>
      </div>
      <div className="flex flex-1 items-center px-6 py-8">
        <ResetPassword />
      </div>
    </main>
  );
}
