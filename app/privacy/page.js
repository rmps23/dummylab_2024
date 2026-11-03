import LegalPage from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata = { title: "Privacy policy" };

export default function Privacy() {
  return (
    <LegalPage title="Privacy policy">
      <p>
        This page explains what {SITE.name} stores, why, and how you can control it. We keep it short and collect as
        little as possible.
      </p>
      <section>
        <h2>What we store</h2>
        <ul>
          <li>Your account: email address and a hashed password (or the identity of the login provider you use).</li>
          <li>What you create: teams, players (name, role, region), schedule events, availability and notes.</li>
          <li>
            Riot data about the players you add: Riot ID, the player identifier (PUUID) and match statistics
            (champions, kills, deaths, assists, CS, damage, vision, timeline values, rank).
          </li>
        </ul>
      </section>
      <section>
        <h2>Why we store it</h2>
        <p>
          To run the service for you: showing your teams, planning your schedule and calculating statistics. We do not
          sell data, do not show ads and do not build profiles for marketing.
        </p>
      </section>
      <section>
        <h2>Who processes it</h2>
        <ul>
          <li>Supabase: database and authentication (data is stored in the EU region).</li>
          <li>Vercel: hosting of the website.</li>
          <li>Riot Games: source of game data. Champion images are loaded from Riot&apos;s Data Dragon CDN.</li>
        </ul>
      </section>
      <section>
        <h2>Cookies</h2>
        <p>
          We use one essential cookie to keep you signed in. We do not use analytics or advertising cookies, and the
          fonts are served from this website.
        </p>
      </section>
      <section>
        <h2>Players you add</h2>
        <p>
          If you add other people, you are responsible for having a reason to track them. Anyone listed can ask for their
          data to be removed: contact us and we will delete it. Riot may also forward deletion requests, which we honour.
        </p>
      </section>
      <section>
        <h2>How long we keep it</h2>
        <p>
          Until you delete it. Deleting a player removes their match history; deleting your account removes everything
          you created. The demo account is reset every day.
        </p>
      </section>
      <section>
        <h2>Your rights</h2>
        <p>
          Under the GDPR you can access, correct, export or delete your data and object to its processing. You can
          delete most of it yourself in the app; for anything else <a href={SITE.contactUrl}>open an issue on GitHub</a>
          . You may also complain to your data protection authority.
        </p>
      </section>
    </LegalPage>
  );
}
