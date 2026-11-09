import LegalPage from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata = { title: "Terms of use" };

export default function Terms() {
  return (
    <LegalPage title="Terms of use">
      <p>
        {SITE.name} is a coaching dashboard for League of Legends teams. It is currently a free preview. By creating an
        account or using the demo you agree to these terms.
      </p>
      <section>
        <h2>Your account</h2>
        <p>
          You are responsible for what happens under your account and for keeping your login safe. You must provide a
          real email address and use the service lawfully.
        </p>
      </section>
      <section>
        <h2>What you can enter</h2>
        <p>
          You can store teams, players, schedules, notes and Riot IDs. Only add players who know they are being tracked
          by you, and do not use {SITE.name} to harass, stalk or identify people who have chosen to stay anonymous.
        </p>
      </section>
      <section>
        <h2>Riot Games data</h2>
        <p>
          Game data comes from the Riot Games API and {SITE.name} is not endorsed by Riot Games (see the notice in the footer). Data availability depends on Riot and may change or stop at any time.
        </p>
      </section>
      <section>
        <h2>Acceptable use</h2>
        <ul>
          <li>Do not attempt to break, overload or scrape the service.</li>
          <li>Do not try to access other people&apos;s data.</li>
          <li>Do not use the service to gain an unfair in-game advantage or to break Riot&apos;s rules.</li>
        </ul>
      </section>
      <section>
        <h2>The demo account</h2>
        <p>
          The demo account is shared, contains sample data, and is reset every day. Do not enter personal information
          in it.
        </p>
      </section>
      <section>
        <h2>Availability and liability</h2>
        <p>
          The service is provided as is, without guarantees. It may change, be interrupted or be discontinued. To the
          extent the law allows, we are not liable for losses caused by using it.
        </p>
      </section>
      <section>
        <h2>Ending your account</h2>
        <p>
          You can delete your account at any time in Settings, which deletes your teams, players and stats. We may
          suspend accounts that break these terms.
        </p>
      </section>
      <section>
        <h2>Changes and contact</h2>
        <p>
          We may update these terms; the date above shows the latest version. Questions:{" "}
          <a href={SITE.contactUrl}>open an issue on GitHub</a>.
        </p>
      </section>
    </LegalPage>
  );
}
