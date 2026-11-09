"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlay } from "react-icons/fa6";
import { supabase } from "@/supabase";
import { btnPrimary, btnSecondary, inputClass } from "@/components/ui/buttons";
import Turnstile, { turnstileEnabled } from "@/components/auth/Turnstile";
import { honeypotTripped, MIN_PASSWORD, safeNext, validateCredentials } from "@/lib/authForm";

const TITLES = { signin: "Welcome back", signup: "Create your account", forgot: "Reset your password" };

export default function Login({ initialMode = "signin", linkError = false, next = "/dashboard" }) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [trap, setTrap] = useState("");
  const [token, setToken] = useState(null);
  const [tokenKey, setTokenKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(null); // "signup" | "forgot" once an email is on its way
  const [message, setMessage] = useState(
    linkError ? { error: true, text: "That link has expired or was already used. Request a new one." } : null
  );

  const onToken = useCallback((t) => setToken(t), []);
  const captcha = turnstileEnabled ? { captchaToken: token } : {};
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  const target = safeNext(next);
  const enter = () => {
    router.push(target);
    router.refresh();
  };

  const fail = (text) => {
    setMessage({ error: true, text });
    setLoading(false);
    setTokenKey((k) => k + 1);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);

    const problem = validateCredentials({ email, password }, { requirePassword: mode !== "forgot" });
    if (problem) return setMessage({ error: true, text: problem });
    if (turnstileEnabled && !token) return setMessage({ error: true, text: "Complete the check below first." });

    // Bots fill hidden fields. Pretend it worked so they learn nothing.
    if (honeypotTripped(trap)) return setSent(mode === "forgot" ? "forgot" : "signup");

    setLoading(true);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password, options: { ...captcha } });
      if (error) return fail(error.message);
      return enter();
    }

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(target)}`, ...captcha },
      });
      if (error) return fail(error.message);
      if (data.session) return enter();
      setSent("signup");
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/reset-password`,
        ...captcha,
      });
      if (error) return fail(error.message);
      setSent("forgot");
    }
    setLoading(false);
  }

  async function handleResend() {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(target)}`, ...captcha },
    });
    setLoading(false);
    setTokenKey((k) => k + 1);
    setMessage(error ? { error: true, text: error.message } : { text: "Sent again. It can take a minute to arrive." });
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

  const switchMode = (next) => {
    setMode(next);
    setSent(null);
    setMessage(null);
  };

  const box = "mx-auto flex w-full max-w-sm flex-col gap-4 rounded-xl border border-line bg-panel p-6";

  if (sent) {
    return (
      <div className={box}>
        <h2 className="text-xl font-bold">Check your email</h2>
        <p className="text-sm text-zinc-300">
          {sent === "signup"
            ? `We sent a confirmation link to ${email}. Open it to finish creating your account.`
            : `If ${email} has an account, a link to reset the password is on its way.`}
        </p>
        <p className="text-xs text-zinc-400">Nothing there? Look in spam, or wait a minute.</p>
        {message && <p role="status" className={`text-sm ${message.error ? "text-loss" : "text-brand"}`}>{message.text}</p>}
        {sent === "signup" && (
          <>
            <Turnstile onToken={onToken} resetKey={tokenKey} />
            <button onClick={handleResend} disabled={loading || (turnstileEnabled && !token)} className={`${btnSecondary} w-full`}>
              Send the email again
            </button>
          </>
        )}
        <button onClick={() => switchMode("signin")} className="min-h-11 text-sm text-zinc-300 underline-offset-2 hover:text-white hover:underline">
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className={box}>
      <div>
        <h2 className="text-xl font-bold">{TITLES[mode]}</h2>
        <p className="text-sm text-zinc-400">
          {mode === "forgot" ? "We will email you a link to choose a new one." : "Plan the week, track the stats."}
        </p>
      </div>

      {mode !== "forgot" && (
        <>
          <button onClick={handleDemo} disabled={loading} className={`${btnPrimary} w-full`}>
            <FaPlay aria-hidden="true" className="text-xs" /> Try the demo account
          </button>
          <p className="-mt-2 text-center text-xs text-zinc-400">One click, no sign-up. Sample team and players.</p>
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
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
        {mode !== "forgot" && (
          <input
            type="password"
            required
            minLength={mode === "signup" ? MIN_PASSWORD : undefined}
            aria-label="Password"
            placeholder={mode === "signup" ? `Password (${MIN_PASSWORD}+ characters)` : "Password"}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
        {/* Honeypot: invisible to people and to screen readers. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
          </label>
        </div>
        <Turnstile onToken={onToken} resetKey={tokenKey} />
        {message && <p role="alert" className={`text-sm ${message.error ? "text-loss" : "text-brand"}`}>{message.text}</p>}
        <button type="submit" disabled={loading} className={`${btnSecondary} w-full`}>
          {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
        </button>
      </form>

      {mode === "signin" && (
        <button onClick={() => switchMode("forgot")} className="-mt-1 min-h-9 text-sm text-zinc-300 underline-offset-2 hover:text-white hover:underline">
          Forgot your password?
        </button>
      )}
      <button
        onClick={() => switchMode(mode === "signup" ? "signin" : mode === "forgot" ? "signin" : "signup")}
        className="min-h-11 text-sm text-zinc-300 underline-offset-2 hover:text-white hover:underline"
      >
        {mode === "signin" ? "No account? Sign up" : "Back to sign in"}
      </button>
    </div>
  );
}
