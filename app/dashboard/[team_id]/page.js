"use client";

import { useParams } from "next/navigation";

const Dashboard = () => {
  const params = useParams();
  const teamID = params.team_id;
  return (
    <>
      <div className="">Equipa {teamID}</div>
    </>
  );
};

export default Dashboard;
