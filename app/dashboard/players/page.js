"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar/Navbar";
import ModalDL from "@/components/lib/ModalDL";
import AddPlayer from "@/components/players/AddPlayer";
import { getPlayers, deletePlayerByID } from "@/functions/Players";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
} from "@mui/material";
import Link from "next/link";
import { supabase } from "@/supabase";
import PlayerCard from "@/components/players/PlayerCard";

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletePlayerId, setDeletePlayerId] = useState(null); // To store the ID of the player to be deleted
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);

  const fetchPlayers = async () => {
    setLoading(true);
    const playersList = await getPlayers();
    setPlayers(playersList);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handlePlayerAdded = () => {
    fetchPlayers();
  };

  const generateOpggLink = (riotId) => {
    const formattedRiotId = riotId.replace("#", "-");
    return `https://www.op.gg/summoners/euw/${formattedRiotId}`;
  };

  const handleConfirmDelete = async () => {
    await deletePlayerByID(deletePlayerId);
    handlePlayerAdded();
    setOpenConfirmationDialog(false); // Close the confirmation dialog
  };

  const handleCloseDialog = () => {
    setOpenConfirmationDialog(false); // Close the confirmation dialog without deleting
  };

  return (
    <>
      <Navbar />
      <div className="pl-72 pr-8 py-8">
        <ModalDL
          btn="Create Player"
          content={<AddPlayer onPlayerAdded={handlePlayerAdded} />}
        />

        <div className="py-8">
          <p className="py-2 text-teal-500 mb-2 uppercase">List of players</p>
          {loading ? (
            <CircularProgress />
          ) : players.length > 0 ? (
            <>

              {players.map((player) => (
                <div key={player.id}>
                  <p component="th" scope="row">
                    {player.name}
                  </p>
                  <a target="_blank" href={generateOpggLink(player.riot_id)}>OPGG</a>
                  <p align="right">
                    <button
                      color="error"
                      onClick={() => {
                        setDeletePlayerId(player.id);
                        setOpenConfirmationDialog(true);
                      }}
                    >
                      Delete
                    </button>
                  </p>
                </div>
              ))}
              <Dialog
                open={openConfirmationDialog}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
              >
                <DialogTitle id="alert-dialog-title">
                  {"Delete Player?"}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id="alert-dialog-description">
                    Are you sure you want to delete this player?
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleCloseDialog} color="primary">
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmDelete} color="error" autoFocus>
                    Delete
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          ) : (
            <p>No players found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default Players;
