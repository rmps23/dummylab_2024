import "./globals.css";
import "react-tooltip/dist/react-tooltip.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="bg-zinc-950">
        <div className="w-full">{children}</div>
      </body>
    </html>
  );
}
