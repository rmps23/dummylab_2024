import Image from "next/image";
import AvailabilityForm from "@/components/invite/AvailabilityForm";
import Footer from "@/components/Footer";
import { getInviteContext } from "@/lib/invites";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Your availability",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function InvitePage({ params }) {
  const context = await getInviteContext(createAdminClient(), params.token);

  return (
    <div className="min-h-dvh">
      <header className="border-b border-white/[0.06] px-4 py-3">
        <Image src="/assets/logos/dummylab_logo.png" width={120} height={28} alt="DummyLab" className="h-auto w-[120px]" />
      </header>
      <main id="main" className="mx-auto max-w-xl px-4 py-8">
        {context ? (
          <AvailabilityForm
            token={params.token}
            playerName={context.player.name}
            teamName={context.teamName}
            initialEvents={context.events}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
            <h1 className="text-xl font-bold">This link is no longer valid</h1>
            <p className="mt-2 text-sm text-zinc-400">Ask your coach for a new availability link.</p>
          </div>
        )}
      </main>
      <Footer className="px-4 pb-8" />
    </div>
  );
}
