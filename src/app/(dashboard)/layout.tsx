import CommandCenterShell from "@/components/command-center/CommandCenterShell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CommandCenterShell>{children}</CommandCenterShell>;
}
