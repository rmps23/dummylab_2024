"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlay } from "react-icons/fa6";
import { btnPrimary } from "@/components/ui/buttons";

// One click into the sample account. The credentials stay on the server (/api/demo-login).
export default function DemoButton({ className = "", children = "Try the demo" }) {
  const router = useRouter();
  const [state, setState] = useState("idle");

  async function go() {
    setState("loading");
    try {
      const response = await fetch("/api/demo-login", { method: "POST" });
      if (!response.ok) throw new Error();
      router.push("/dashboard");
      router.refresh();
    } catch {
      setState("error");
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button type="button" onClick={go} disabled={state === "loading"} className={`${btnPrimary} ${className}`}>
        <FaPlay aria-hidden="true" className="text-xs" /> {state === "loading" ? "Opening..." : children}
      </button>
      {state === "error" && (
        <span role="alert" className="text-xs text-loss">
          The demo account is unavailable right now.
        </span>
      )}
    </span>
  );
}
