import "./globals.css";
import "react-tooltip/dist/react-tooltip.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

export const metadata = {
  title: "DummyLab",
  description: "League of Legends coaching dashboard: teams, schedule and stats.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="bg-zinc-950 text-zinc-100">
        <div className="w-full">{children}</div>
        <ToastContainer theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
