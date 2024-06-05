"use client";

import { useState } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: {
    xs: "90%",
    sm: 500,
    md: 600,
  },
  bgcolor: "background.paper",
  borderRadius: 2,
  p: {
    xs: 2,
    sm: 4,
  },
};

const ModalAddTeam = ({ btn, content }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <button
        onClick={handleOpen}
        className="bg-zinc-200 text-zinc-950 flex w-full px-2 py-1 justify-center rounded-md text-sm"
      >
        {btn}
      </button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>{content}</Box>
      </Modal>
    </>
  );
};

export default ModalAddTeam;
