"use client";

import { useEffect, useRef } from "react";

export const turnstileEnabled = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

let scriptPromise;
function loadScript() {
  scriptPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return scriptPromise;
}

// Cloudflare Turnstile (free CAPTCHA). Renders nothing when NEXT_PUBLIC_TURNSTILE_SITE_KEY is empty.
// Change `resetKey` to get a fresh token after a failed attempt.
export default function Turnstile({ onToken, resetKey = 0 }) {
  const box = useRef(null);

  useEffect(() => {
    if (!turnstileEnabled) return;
    let id;
    let gone = false;
    onToken(null);
    loadScript()
      .then(() => {
        if (gone || !box.current) return;
        id = window.turnstile.render(box.current, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
          theme: "dark",
          callback: (token) => onToken(token),
          "expired-callback": () => onToken(null),
          "error-callback": () => onToken(null),
        });
      })
      .catch(() => onToken(null));
    return () => {
      gone = true;
      if (id !== undefined && window.turnstile) window.turnstile.remove(id);
    };
  }, [onToken, resetKey]);

  if (!turnstileEnabled) return null;
  return <div ref={box} className="min-h-[65px]" />;
}
