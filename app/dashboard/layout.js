import DashboardShell from "@/components/DashboardShell";

export const metadata = { title: "Home" };

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
