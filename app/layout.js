import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { Chakra_Petch, Figtree } from "next/font/google";
import { ToastContainer } from "react-toastify";

const chakra = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-chakra",
  display: "swap",
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata = {
  title: { default: "DummyLab", template: "%s · DummyLab" },
  description: "League of Legends coaching dashboard: teams, schedule and stats.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${chakra.variable} ${figtree.variable} h-full`}>
      <body className="font-sans text-zinc-100">
        {children}
        <ToastContainer theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
