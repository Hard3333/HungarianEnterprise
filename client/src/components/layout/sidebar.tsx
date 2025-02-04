import { Link, useLocation } from "wouter";
import { t } from "@/lib/i18n";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const navigation = [
  { icon: LayoutDashboard, label: "dashboard", href: "/" },
  { icon: Package, label: "inventory", href: "/inventory" },
  { icon: ShoppingCart, label: "orders", href: "/orders" },
  { icon: Users, label: "contacts", href: "/contacts" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();

  return (
    <div className="min-h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-sidebar-foreground">ERP</h1>
        </div>
        
        <nav className="flex-1">
          {navigation.map(({ icon: Icon, label, href }) => (
            <Link key={href} href={href}>
              <a
                className={cn(
                  "flex items-center gap-3 px-6 py-3 text-sidebar-foreground hover:bg-sidebar-accent",
                  location === href && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{t(label)}</span>
              </a>
            </Link>
          ))}
        </nav>

        <div className="p-6">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="h-5 w-5" />
            {t("logout")}
          </Button>
        </div>
      </div>
    </div>
  );
}
