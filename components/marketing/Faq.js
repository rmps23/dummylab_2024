const ITEMS = [
  [
    "Is DummyLab affiliated with Riot Games?",
    "No. DummyLab is an independent tool made for the community. Riot's full notice is in the footer of every page.",
  ],
  [
    "Where do the stats come from?",
    "From the Riot Games API. You add your players by Riot ID and import their match history; DummyLab calculates win rate, KDA, CS, damage, vision and champion pool from it.",
  ],
  [
    "Do my players need an account?",
    "No. On a paid plan you send each player a personal link. They open it on their phone, tap whether they can play, and you see the answer in your schedule.",
  ],
  [
    "Is the Free plan really free?",
    "Yes. One team with up to 10 players, the schedule, stats for the last 30 days and private notes are free, with no card needed.",
  ],
  [
    "Why are the paid plans so cheap?",
    "Running DummyLab costs a fixed amount every month (hosting, database, email), and the Free plan is meant to stay free. Pro and Academy only have to cover that, so they are priced to do just that. If costs go down, prices will too.",
  ],
  [
    "Can I cancel?",
    "Yes, at any time from the billing page. Your teams and data stay; you go back to the Free plan limits. Payments are not open yet.",
  ],
  [
    "How is my data handled?",
    "Your teams are private to your account, protected by row level security, and stored in the EU. Read the privacy policy for details.",
  ],
];

export default function Faq() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-2">
      {ITEMS.map(([question, answer]) => (
        <details key={question} className="group rounded-xl border border-line bg-panel px-4">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 font-semibold">
            {question}
            <span aria-hidden="true" className="text-brand transition group-open:rotate-45">+</span>
          </summary>
          <p className="pb-4 text-sm text-zinc-300">{answer}</p>
        </details>
      ))}
    </div>
  );
}
