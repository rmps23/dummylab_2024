import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/src/theme";
import "react-tooltip/dist/react-tooltip.css";
import Navbar from "@/components/navbar/Navbar";

export default function RootLayout({ children }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <html lang="en" className="h-full">
          <body className="bg-zinc-900 flex h-full overflow-hidden">
            <Navbar></Navbar>
            <div className="overflow-y-scroll w-full">{children}</div>
          </body>
        </html>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
