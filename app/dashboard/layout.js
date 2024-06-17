"use client";

import "react-tooltip/dist/react-tooltip.css";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <Navbar />
      <div className="w-full h-screen overflow-y-scroll p-6">{children}</div>
    </div>
  );
}
