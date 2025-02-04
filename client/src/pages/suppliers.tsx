import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { t } from "@/lib/i18n";

export default function Suppliers() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">{t("suppliers")}</h1>
            <p className="text-muted-foreground">
              Beszállítók kezelése
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
