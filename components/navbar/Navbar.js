'use client'

import Link from "next/link";
import Logout from "../auth/Logout";
import Image from "next/image";
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';

import { supabase } from "@/supabase";
import { FaBars } from "react-icons/fa6";
import { FaGear } from "react-icons/fa6";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [session, setSession] = useState();
  const [anchorElBasic, setAnchorElBasic] = useState(null);
  const [anchorElSettings, setAnchorElSettings] = useState(null);
  const openBasicMenu = Boolean(anchorElBasic);
  const openSettingsMenu = Boolean(anchorElSettings);
  const router = useRouter();

  const handleClickBasic = (event) => {
    setAnchorElBasic(event.currentTarget);
  };

  const handleClickSettings = (event) => {
    setAnchorElSettings(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorElBasic(null);
    setAnchorElSettings(null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        router.push("/");
      }
    });
  }, []);

  return (
    <div className="bg-zinc-900">
      <div className="max-w-[1440px] mx-auto px-5 py-4 flex justify-between items-center">
        <div>
          <Link href="/dashboard">
            <Image
              src="/assets/logos/dummylab-logo.svg"
              width={100}
              height={80}
              alt="DummyLab Logo"
            />
          </Link>
        </div>
        <div>
          <Button
            id="basic-button"
            aria-controls={openBasicMenu ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openBasicMenu ? 'true' : undefined}
            onClick={handleClickBasic}
          >
            <FaBars className="text-zinc-200 text-xl flex gap-2 items-center justify-center" />
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={anchorElBasic}
            open={openBasicMenu}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            <MenuItem onClick={handleClose}>
              <Link href="/dashboard/players">Players</Link>
            </MenuItem>
          </Menu>
          <Button
            id="settings-button"
            aria-controls={openSettingsMenu ? 'settings-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={openSettingsMenu ? 'true' : undefined}
            onClick={handleClickSettings}
          >
            <FaGear className="text-zinc-200 text-xl" />
          </Button>
          <Menu
            id="settings-menu"
            anchorEl={anchorElSettings}
            open={openSettingsMenu}
            onClose={handleClose}
            MenuListProps={{
              'aria-labelledby': 'settings-button',
            }}
          >
            <MenuItem onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={handleClose}>My account</MenuItem>
            <Divider />
            <MenuItem><Logout /></MenuItem>
          </Menu>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
