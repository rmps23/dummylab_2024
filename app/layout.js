import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/src/theme";

export default function RootLayout({ children }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <html lang="en">
          <body className="bg-zinc-950">
            <div>{children}</div>
          </body>
        </html>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
