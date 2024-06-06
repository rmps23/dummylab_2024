"use client";

import Navbar from "@/components/navbar/Navbar";
import TopBar from "@/components/navbar/TopBar";
import { useParams } from "next/navigation";

const Dashboard = () => {
  const params = useParams();
  const teamID = params.team_id;
  return (
    <>
      <div className="pl-64 py-3">Equipa {teamID}</div>
    </>
  );
};

export default Dashboard;
