"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/supabase";
import { btnPrimary, inputClass } from "@/components/ui/buttons";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // The "Sign in" link in the header points to /#signin.
  useEffect(() => {
    const sync = () => window.location.hash === "#signin" && setMode("signin");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const enter = () => {
    router.push("/dashboard");
    router.refresh();
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage({ error: true, text: error.message });
      else return enter();
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage({ error: true, text: error.message });
      else if (data.session) return enter();
      else setMessage({ text: "Check your email to confirm the account." });
    }
    setLoading(false);
  }

  return (
    <div className="flex w-full flex-col gap-5 rounded-lg border border-white/10 bg-panel p-6 shadow-card">
      <div role="tablist" aria-label="Account" className="grid grid-cols-2 gap-1 rounded-lg bg-black/30 p-1">
        {[
          ["signup", "Create account"],
          ["signin", "Sign in"],
        ].map(([key, label]) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={mode === key}
            onClick={() => {
              setMode(key);
              setMessage(null);
            }}
            className={`min-h-10 rounded-md text-sm font-semibold transition ${
              mode === key ? "bg-white/10 text-zinc-50" : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold">{mode === "signin" ? "Welcome back" : "Start for free"}</h2>
        <p className="text-sm text-zinc-400">
          {mode === "signin" ? "Sign in to see your team." : "One team, up to 10 players. No card needed."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          aria-label="Email address"
          placeholder="Email address"
          autoComplete="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          required
          minLength={6}
          aria-label="Password"
          placeholder={mode === "signin" ? "Password" : "Password (at least 6 characters)"}
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {message && <p role="alert" className={`text-sm ${message.error ? "text-loss" : "text-brand"}`}>{message.text}</p>}
        <button type="submit" disabled={loading} className={`${btnPrimary} w-full`}>
          {mode === "signin" ? "Sign in" : "Create free account"}
        </button>
      </form>
    </div>
  );
}
