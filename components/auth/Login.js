"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlay } from "react-icons/fa6";
import { supabase } from "@/supabase";
import { btnPrimary, btnSecondary, inputClass } from "@/components/ui/buttons";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

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

  async function handleDemo() {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/demo-login", { method: "POST" });
      if (!response.ok) throw new Error("The demo account is unavailable right now.");
      enter();
    } catch (error) {
      setMessage({ error: true, text: error.message });
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-xl border border-line bg-panel p-6 shadow-card">
      <div>
        <h2 className="text-xl font-bold">{mode === "signin" ? "Welcome back" : "Create your account"}</h2>
        <p className="text-sm text-zinc-400">Plan the week, track the stats.</p>
      </div>

      <button onClick={handleDemo} disabled={loading} className={`${btnPrimary} w-full`}>
        <FaPlay aria-hidden="true" className="text-xs" /> Try the demo account
      </button>
      <p className="-mt-2 text-center text-xs text-zinc-400">One click, no sign-up. Sample team and players.</p>

      <div className="flex items-center gap-3 text-sm text-zinc-400">
        <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
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
          placeholder="Password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          className={inputClass}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {message && <p role="alert" className={`text-sm ${message.error ? "text-rose-400" : "text-brand"}`}>{message.text}</p>}
        <button type="submit" disabled={loading} className={`${btnSecondary} w-full`}>
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="min-h-11 text-sm text-zinc-300 underline-offset-2 hover:text-white hover:underline"
      >
        {mode === "signin" ? "No account? Sign up" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
