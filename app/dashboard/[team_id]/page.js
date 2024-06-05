"use client";

import Navbar from "@/components/navbar/Navbar";
import TopBar from "@/components/navbar/TopBar";
import { useParams } from "next/navigation";

const Dashboard = () => {
  const params = useParams();
  const teamID = params.team_id;
  return (
    <>
      <TopBar />
      <Navbar />
      <div className="pl-64 py-3">{teamID}</div>
    </>
  );
};

export default Dashboard;
