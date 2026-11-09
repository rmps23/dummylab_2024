import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { Chakra_Petch, Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import { SITE } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const chakra = Chakra_Petch({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-chakra",
  display: "swap",
});

const DESCRIPTION = "League of Legends coaching dashboard: teams, schedule, availability and stats.";

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "DummyLab", template: "%s · DummyLab" },
  description: DESCRIPTION,
  applicationName: SITE.name,
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  openGraph: { type: "website", siteName: SITE.name, title: "DummyLab", description: DESCRIPTION, url: SITE.url },
  twitter: { card: "summary_large_image", title: "DummyLab", description: DESCRIPTION },
};

export const viewport = { themeColor: "#0A1118" };

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
