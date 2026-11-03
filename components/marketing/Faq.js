const ITEMS = [
  [
    "Is DummyLab affiliated with Riot Games?",
    "No. DummyLab isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties.",
  ],
  [
    "Where do the stats come from?",
    "From the Riot Games API. You add your players by Riot ID and import their match history; DummyLab calculates win rate, KDA, CS, damage, vision and champion pool from it.",
  ],
  [
    "Do my players need an account?",
    "No. With Pro you send each player a personal link. They open it on their phone, tap whether they can play, and you see the answer in your schedule.",
  ],
  [
    "Is the Free plan really free?",
    "Yes. One team with up to 10 players, the schedule, stats for the last 30 days and private notes are free, with no card needed.",
  ],
  [
    "Can I cancel Pro?",
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
        <details key={question} className="group rounded-xl border border-white/[0.07] bg-panel/70 px-4">
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
