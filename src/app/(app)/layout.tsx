import { AppShell } from "@/components/layout/app-shell";
import { getRealData } from "@/app/actions/stock-actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialData = await getRealData();
  
  return (
    <AppShell initialData={initialData}>{children}</AppShell>
  );
}
