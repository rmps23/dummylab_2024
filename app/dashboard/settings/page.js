'use client';

import React, { useState, useEffect } from "react";
import { FaGear, FaUser, FaBan } from "react-icons/fa6";
import { userStore } from "@/store/userStore";
import { updateUserEmail } from "@/hooks/users/updateUserEmail";
import Modal from "@/components/ui/Modal";
import RemoveAcc from "@/components/auth/RemoveAcc";

const Settings = () => {
  const user = userStore((state) => state.user);
  const [newEmail, setNewEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [removeAccModal, setRemoveAccModal] = useState(false);

  const handleOpenModal = () => {
    setRemoveAccModal(true);
  };

  const handleCloseModal = () => {
    setRemoveAccModal(false);
  };

  useEffect(() => {
    if (user && user.identities && user.identities[0]) {
      setNewEmail(user.identities[0].email);
    }
  }, [user]);

  const handleEmailChange = (e) => {
    setNewEmail(e.target.value);
    setIsEditing(true);
  };

  async function handleEditEmail() {
    setIsEditing(false);
    await updateUserEmail(newEmail);
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="flex items-center gap-6 w-full pb-4 mb-20 border-b border-zinc-900">
        <div className="flex items-center gap-4">
          <FaGear className="bg-zinc-900 p-2 text-4xl rounded-md" />
          <span className="text-lg">Settings</span>
        </div>
      </div>

      <div className="flex flex-col max-w-[800px] mx-auto justify-center w-full mb-10">
        <h3 className="pb-2 font-bold flex items-center gap-2"><FaUser /> My Account</h3>
        <div className="flex flex-col gap-2 p-4 border border-zinc-900 rounded-md">
          <p>Username</p>
          <input type="text" value={user.identities[0].identity_data.custom_claims.global_name} className="bg-zinc-800 p-2 rounded-md outline-none" disabled />
          <p>Email</p>
          <div className="relative">
            <input
              type="text"
              onChange={handleEmailChange}
              value={newEmail}
              className="bg-zinc-800 p-2 pr-24 rounded-md outline-none w-full"
            />
            {isEditing && (
              <button
                onClick={handleEditEmail}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-cyan-500 text-white py-1 px-2 rounded-md"
              >
                Confirm
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col max-w-[800px] mx-auto justify-center w-full">
        <h3 className="pb-2 font-bold flex items-center gap-2"><FaBan /> Delete Account</h3>
        <div className="p-4 border border-zinc-900 rounded-md">
          <button
            onClick={handleOpenModal}
            className="text-sm bg-red-700 text-zinc-100 px-4 py-1 rounded-md"
          >
            Delete
          </button>
          <Modal
            show={removeAccModal}
            onClose={handleCloseModal}
            content={
              <RemoveAcc setRemoveAccModal={setRemoveAccModal}
              />
            }
          />
        </div>
      </div>

    </>
  );
};

export default Settings;
