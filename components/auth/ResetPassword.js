"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/supabase";
import { btnSecondary, inputClass } from "@/components/ui/buttons";
import { MIN_PASSWORD } from "@/lib/authForm";

// Shown after the link in the reset email: the callback route has already signed the person in.
export default function ResetPassword() {
  const router = useRouter();
  const [ready, setReady] = useState(null); // null = checking
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setReady(!!data.user));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) return setMessage({ error: true, text: `Use at least ${MIN_PASSWORD} characters.` });
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage({ error: true, text: error.message });
      return setLoading(false);
    }
    router.push("/dashboard");
    router.refresh();
  }

  const box = "mx-auto flex w-full max-w-sm flex-col gap-4 rounded-xl border border-line bg-panel p-6";

  if (ready === false) {
    return (
      <div className={box}>
        <h1 className="text-xl font-bold">This link has expired</h1>
        <p className="text-sm text-zinc-300">Reset links work once and for a short time. Request a new one from the sign-in page.</p>
        <Link href="/login" className={btnSecondary}>Back to sign in</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={box}>
      <h1 className="text-xl font-bold">Choose a new password</h1>
      <input
        type="password"
        required
        minLength={MIN_PASSWORD}
        aria-label="New password"
        placeholder={`New password (${MIN_PASSWORD}+ characters)`}
        autoComplete="new-password"
        className={inputClass}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {message && <p role="alert" className={`text-sm ${message.error ? "text-loss" : "text-brand"}`}>{message.text}</p>}
      <button type="submit" disabled={loading || ready === null} className={`${btnSecondary} w-full`}>Save password</button>
    </form>
  );
}
