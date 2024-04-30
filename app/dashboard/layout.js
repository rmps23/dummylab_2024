import { Chakra_Petch } from "next/font/google";
import SideBar from '@/components/navbar/SideBar'

export default function RootLayout({ children }) {
  return (
    <div className="flex">
      <SideBar></SideBar>
      {children}
    </div>
  );
}
