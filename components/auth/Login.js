"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/supabase";

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

  const input = "bg-zinc-900 border border-zinc-800 p-2 rounded-md outline-none focus:border-cyan-500";

  return (
    <div className="flex flex-col gap-4 max-w-sm w-full mx-auto">
      <button
        onClick={handleDemo}
        disabled={loading}
        className="bg-cyan-500 text-zinc-950 font-semibold py-2 rounded-md hover:bg-cyan-400 disabled:opacity-50"
      >
        Try the demo account
      </button>
      <div className="flex items-center gap-3 text-zinc-500 text-sm">
        <span className="h-px bg-zinc-800 flex-1" /> or <span className="h-px bg-zinc-800 flex-1" />
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="Email address"
          autoComplete="email"
          className={input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password"
          autoComplete={mode === "signin" ? "current-password" : "new-password"}
          className={input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {message && (
          <p className={`text-sm ${message.error ? "text-red-400" : "text-cyan-400"}`}>{message.text}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-zinc-100 text-zinc-950 py-2 rounded-md hover:bg-white disabled:opacity-50"
        >
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
      <button
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="text-sm text-zinc-400 hover:text-zinc-200"
      >
        {mode === "signin" ? "No account? Sign up" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
