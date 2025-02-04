import { Link, useLocation } from "wouter";
import { t } from "@/lib/i18n";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  Settings,
  Warehouse,
  Truck,
  FileText,
  PieChart,
  DollarSign,
  Boxes,
  ClipboardList,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

type MenuItem = {
  icon: any;
  label: string;
  href?: string;
  submenu?: MenuItem[];
};

const navigation: MenuItem[] = [
  { icon: LayoutDashboard, label: "dashboard", href: "/" },
  {
    icon: Warehouse,
    label: "warehouse",
    submenu: [
      { icon: Package, label: "inventory", href: "/inventory" },
      { icon: Boxes, label: "stockLevels", href: "/stock-levels" },
      { icon: Truck, label: "incomingDeliveries", href: "/incoming" },
    ]
  },
  {
    icon: ShoppingCart,
    label: "sales",
    submenu: [
      { icon: ShoppingCart, label: "orders", href: "/orders" },
      { icon: FileText, label: "invoices", href: "/invoices" },
      { icon: Users, label: "customers", href: "/customers" },
    ]
  },
  {
    icon: DollarSign,
    label: "finances",
    submenu: [
      { icon: FileText, label: "bills", href: "/bills" },
      { icon: PieChart, label: "reports", href: "/reports" },
      { icon: ClipboardList, label: "accounting", href: "/accounting" },
    ]
  },
  {
    icon: Building2,
    label: "company",
    submenu: [
      { icon: Users, label: "employees", href: "/employees" },
      { icon: Users, label: "suppliers", href: "/suppliers" },
      { icon: Settings, label: "settings", href: "/settings" },
    ]
  },
];

function MenuItem({ item, isSubmenu = false }: { item: MenuItem; isSubmenu?: boolean }) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const Icon = item.icon;

  if (item.submenu) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center gap-3 px-6 py-3 text-sidebar-foreground hover:bg-sidebar-accent",
            isOpen && "bg-sidebar-accent"
          )}
        >
          <Icon className="h-5 w-5" />
          <span>{t(item.label)}</span>
        </button>
        {isOpen && (
          <div className="ml-4 border-l border-sidebar-border">
            {item.submenu.map((subItem) => (
              <MenuItem key={subItem.label} item={subItem} isSubmenu />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link href={item.href!}>
      <a
        className={cn(
          "flex items-center gap-3 px-6 py-3 text-sidebar-foreground hover:bg-sidebar-accent",
          location === item.href && "bg-sidebar-accent text-sidebar-accent-foreground",
          isSubmenu && "pl-8"
        )}
      >
        <Icon className="h-5 w-5" />
        <span>{t(item.label)}</span>
      </a>
    </Link>
  );
}

export function Sidebar() {
  const { logoutMutation } = useAuth();

  return (
    <div className="min-h-screen w-64 bg-sidebar border-r border-sidebar-border">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-sidebar-foreground">ERP</h1>
        </div>

        <nav className="flex-1">
          {navigation.map((item) => (
            <MenuItem key={item.label} item={item} />
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