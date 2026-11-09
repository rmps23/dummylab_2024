import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import JoinTeam from "@/components/teams/JoinTeam";
import { INVITE_MESSAGES, inviteProblem, ROLE_HELP, ROLE_LABELS } from "@/lib/teamInvites";
import { isToken } from "@/lib/invites";
import { btnPrimary, btnSecondary } from "@/components/ui/buttons";

export const metadata = { title: "Team invitation", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function JoinPage({ params }) {
  const token = params.token;
  let invite = null;
  let teamName = "";
  if (isToken(token)) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("team_invite")
      .select("email, role, expires_at, accepted_at, revoked_at, team:team_id(name)")
      .eq("token", token)
      .maybeSingle();
    invite = data;
    teamName = data?.team?.name ?? "";
  }

  const supabase = createClient();
  const { data: { user } = {} } = await supabase.auth.getUser();
  // Without an account the page can still say who invited you, but never shows another person's email address.
  const problem = invite ? inviteProblem(invite, user) : "invalid";
  const next = `/join/${token}`;

  return (
    <main id="main" className="flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-6xl items-center px-6 py-4">
        <Link href="/" aria-label="DummyLab home">
          <Image src="/assets/logos/dummylab_logo.png" width={140} height={33} alt="DummyLab" priority className="h-auto w-[140px]" />
        </Link>
      </div>
      <div className="flex flex-1 items-center px-6 py-8">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-xl border border-line bg-panel p-6">
          {problem && problem !== "wrong_email" ? (
            <>
              <h1 className="text-xl font-bold">Invitation unavailable</h1>
              <p className="text-sm text-zinc-300">{INVITE_MESSAGES[problem]}</p>
              <Link href="/" className={btnSecondary}>Go to DummyLab</Link>
            </>
          ) : !user ? (
            <>
              <h1 className="text-xl font-bold">Join {teamName}</h1>
              <p className="text-sm text-zinc-300">
                You were invited as <b>{ROLE_LABELS[invite.role]}</b>. {ROLE_HELP[invite.role]}
              </p>
              <p className="text-xs text-zinc-400">Sign in or create an account with the email address that received the invitation.</p>
              <Link href={`/login?next=${encodeURIComponent(next)}`} className={btnPrimary}>Sign in</Link>
              <Link href={`/login?mode=signup&next=${encodeURIComponent(next)}`} className={btnSecondary}>Create an account</Link>
            </>
          ) : problem === "wrong_email" ? (
            <>
              <h1 className="text-xl font-bold">Wrong account</h1>
              <p className="text-sm text-zinc-300">{INVITE_MESSAGES.wrong_email}</p>
              <p className="text-xs text-zinc-400">You are signed in as {user.email}.</p>
            </>
          ) : (
            <JoinTeam token={token} teamName={teamName} role={invite.role} help={ROLE_HELP[invite.role]} roleLabel={ROLE_LABELS[invite.role]} />
          )}
        </div>
      </div>
    </main>
  );
}
