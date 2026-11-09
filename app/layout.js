import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { Chakra_Petch, Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const chakra = Chakra_Petch({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-chakra",
  display: "swap",
});

export const metadata = {
  title: { default: "DummyLab", template: "%s · DummyLab" },
  description: "League of Legends coaching dashboard: teams, schedule and stats.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${chakra.variable} ${inter.variable} h-full`}>
      <body className="font-sans text-zinc-100">
        {children}
        <ToastContainer theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
