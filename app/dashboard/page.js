'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import { UserTeams } from "@/functions/teams/Teams";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const get_user_teams = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser()
    const user_teams = await UserTeams(user.id);
    if (user_teams.length === 0) {
      router.push("/dashboard/create_team");
      setLoading(false);
    }
    setLoading(false);
  };

  useEffect(() => {
    get_user_teams();
  }, []);

  if (loading) {
    <div>
      Loading
    </div>
  } else {
    return (
      <div>
        dashboard
      </div>
    );
  }
};

export default Dashboard;
