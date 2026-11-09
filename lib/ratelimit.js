// Small in-memory sliding-window limiter. It is per server instance (good enough to stop a single user
// from burning the Riot quota; a shared store would be needed to enforce it globally).
const hits = new Map();

export function rateLimit(key, { limit, windowMs }, now = Date.now()) {
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return { ok: false, retryAfter: Math.ceil((windowMs - (now - recent[0])) / 1000) };
  }
  recent.push(now);
  hits.set(key, recent);

  // Keep the map from growing forever.
  if (hits.size > 5000) {
    for (const [k, times] of hits) if (times.every((t) => now - t >= windowMs)) hits.delete(k);
  }
  return { ok: true, retryAfter: 0 };
}

export function resetRateLimits() {
  hits.clear();
}

// Same limit, but counted in the database so every server instance shares it. If the database function is not
// available (or errors), it falls back to the in-memory limiter instead of blocking people.
export async function rateLimitShared(admin, key, options, memory = rateLimit) {
  try {
    const { data, error } = await admin.rpc("rate_limit_check", {
      p_key: key,
      p_limit: options.limit,
      p_window_seconds: Math.ceil(options.windowMs / 1000),
    });
    const row = Array.isArray(data) ? data[0] : data;
    if (error || !row) throw error || new Error("no result");
    return { ok: !!row.ok, retryAfter: Number(row.retry_after) || 0 };
  } catch {
    return memory(key, options);
  }
}
