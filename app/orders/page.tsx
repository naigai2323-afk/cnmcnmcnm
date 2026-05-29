import { AppShell } from "@/components/AppShell";
import { CrudPage } from "@/components/CrudPage";
import { modules } from "@/lib/modules";

export default function Page() {
  return <AppShell><CrudPage config={modules.orders} /></AppShell>;
}
