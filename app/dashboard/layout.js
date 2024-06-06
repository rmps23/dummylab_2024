'use client'

import "react-tooltip/dist/react-tooltip.css";
import Navbar from "@/components/navbar/Navbar";
import useFetchUser from "@/hooks/useFetchUser";


export default function DashboardLayout({ children }) {
  useFetchUser();
  return (
    <div className="flex">
      <Navbar />
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
