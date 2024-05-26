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

  const handleDeletePlayer = async (uid) => {
    setDeletePlayerId(uid); // Set the ID of the player to be deleted
    setOpenConfirmationDialog(true); // Open the confirmation dialog
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
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Player Name</TableCell>
                      <TableCell align="center">Riot ID</TableCell>
                      <TableCell align="center">Role</TableCell>
                      <TableCell align="center">OP.GG</TableCell>
                      <TableCell align="center">Options</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {players.map((player) => (
                      <TableRow
                        key={player.id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          {player.name}
                        </TableCell>
                        <TableCell align="center">{player.riot_id}</TableCell>
                        <TableCell align="center">
                          <img src={player.image_link}></img>
                          {player.role.name}
                        </TableCell>
                        <TableCell align="center">
                          <Link
                            href={generateOpggLink(player.riot_id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 p-1 rounded-sm hover:"
                          >
                            OP.GG
                          </Link>
                        </TableCell>
                        <TableCell align="center">
                          <div className="flex gap-4 justify-center">
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => handleDeletePlayer(player.id)}
                              size="small"
                            >
                              Delete
                            </Button>
                            <Button
                              variant="contained"
                              color="info"
                              size="small"
                            >
                              <Link href={`/dashboard/players/${player.id}`}>
                                View
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
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
