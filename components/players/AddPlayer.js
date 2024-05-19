"use client";

import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { supabase } from "@/supabase";
import { useState } from "react";

const AddPlayer = ({ onClose, onPlayerAdded }) => {
  const [playerName, setPlayerName] = useState("");
  const [riotId, setRiotId] = useState("");
  const [role, setRole] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("player")
      .insert([{ name: playerName, riot_id: riotId, role }]);
    setLoading(false);

    if (error) {
      console.error("Error inserting player:", error);
    } else {
      setPlayerName("");
      setRiotId("");
      setRole(1);
      if (onPlayerAdded) {
        onPlayerAdded();
      }
      if (onClose) {
        onClose();
      }
    }
  };

  return (
    <div className="flex flex-col">
      <p className="text-sm mb-1 uppercase">Player Name</p>
      <TextField
        id="name"
        color="primary"
        size="small"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        style={{ forcedColorAdjust: "#008080" }}
      />

      <p className="text-sm mb-1 mt-4 uppercase">RIOT ID</p>
      <TextField
        id="riot"
        color="primary"
        size="small"
        style={{ forcedColorAdjust: "#008080" }}
        value={riotId}
        onChange={(e) => setRiotId(e.target.value)}
      />

      <p className="text-sm mb-1 mt-4 uppercase">Role</p>
      <Select
        id="role"
        color="primary"
        size="small"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={{ forcedColorAdjust: "#008080" }}
      >
        <MenuItem value={1}>Top</MenuItem>
        <MenuItem value={2}>Jungler</MenuItem>
        <MenuItem value={3}>Mid</MenuItem>
        <MenuItem value={4}>Bottom</MenuItem>
        <MenuItem value={5}>Support</MenuItem>
      </Select>

      <Button
        variant="contained"
        size="medium"
        sx={{ fontSize: "0.7rem", fontWeight: "600", marginTop: "30px" }}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : "Submit"}
      </Button>
    </div>
  );
};

export default AddPlayer;
