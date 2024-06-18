"use client";

import { useState, useEffect } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter } from "next/navigation";
import { supabase } from "@/supabase";

export default function Login() {
  const [session, setSession] = useState(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        router.push("/");
      } else {
        router.push("/dashboard/teams");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        router.push("/");
      } else {
        router.push("/dashboard/teams");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="">
      < Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }
        }
        theme="dark"
        providers={["twitch", "discord"]}
      />
    </div >
  );

}
