import React from "react";
import ModalAddTeam from "../lib/ModalAddTeam";

const TeamList = () => {
  return (
    <div className="bg-neutral-950/60 backdrop-blur-md p-2 z-10 shadow-md shadow-neutral-950/40 w-full flex">
      <ModalAddTeam btn={"+"} />
    </div>
  );
};

export default TeamList;
