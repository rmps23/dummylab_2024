// Custom games (queue 0, the scrims) are only stored and shown for players who opted in.
export const CUSTOM_QUEUE = 0;

export const isCustomGame = (queueId) => Number(queueId) === CUSTOM_QUEUE;

// Whether a match of this queue may be stored for a player.
export const canStoreMatch = (queueId, consent) => !isCustomGame(queueId) || consent === true;

export const CONSENT_COPY = {
  title: "Share my scrim games with my coach",
  body: "Games you play in custom lobbies (scrims) are only used for your team's stats if you say yes. It is off until you turn it on, only your coach and staff in this team can see them, and nothing is public.",
  off: "You can turn it off at any time. Turning it off deletes the custom games already stored for you.",
};
