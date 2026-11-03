import { EVENT_TYPES } from "@/lib/constants";
import { pendingCount, availableCount, statusFor } from "@/lib/availability";

// Only genuine Discord webhook URLs are ever called, so a stored URL cannot be used to reach other hosts.
const WEBHOOK = /^https:\/\/(discord|discordapp)\.com\/api\/webhooks\/\d{15,25}\/[\w-]{20,100}$/;
export const isDiscordWebhook = (url) => typeof url === "string" && WEBHOOK.test(url);

const COLORS = { training: 0x38bdf8, scrim: 0xfbbf24, match: 0x34d399, other: 0xa1a1aa };
const unix = (iso) => Math.floor(new Date(iso).getTime() / 1000);

// Discord renders <t:...> in every reader's own time zone, so nobody has to convert.
export function buildReminder({ team, event, players, link }) {
  const type = EVENT_TYPES[event.type] ?? EVENT_TYPES.other;
  const names = (status) => players.filter((p) => statusFor(event, p.id) === status).map((p) => p.name);
  const field = (name, list) => (list.length ? [{ name, value: list.join(", "), inline: false }] : []);

  const yes = availableCount(event, players);
  const waiting = pendingCount(event, players);

  return {
    allowed_mentions: { parse: [] },
    embeds: [
      {
        title: `${type.label}: ${event.title}`,
        description: [
          `<t:${unix(event.starts_at)}:F> (<t:${unix(event.starts_at)}:R>)`,
          event.opponent ? `Opponent: **${event.opponent}**` : null,
          `**${yes}/${players.length}** confirmed${waiting ? `, ${waiting} still to answer` : ""}`,
          link ? `[Open the schedule](${link})` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        color: COLORS[event.type] ?? COLORS.other,
        fields: [
          ...field("Available", names("available")),
          ...field("Maybe", names("maybe")),
          ...field("Can't make it", names("unavailable")),
          ...field("Waiting for an answer", names("pending")),
        ],
        footer: { text: team.name },
      },
    ],
  };
}

export const testMessage = (team) => ({
  allowed_mentions: { parse: [] },
  embeds: [{ title: "DummyLab is connected", description: `Reminders for **${team.name}** will appear here.`, color: 0x22d3ee }],
});

export async function sendDiscord(url, payload, fetchImpl = fetch) {
  if (!isDiscordWebhook(url)) throw new Error("This is not a valid Discord webhook URL");
  const response = await fetchImpl(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Discord answered ${response.status}`);
}
