"use client";

import { Link, useLocation } from "react-router-dom";
import type { ComponentType } from "react";
import {
  LayoutDashboard,
  Package,
  PackageCheck,
  FileText,
  BarChart3,
} from "lucide-react";
import { cn } from "lib/utils";
import { Tabs, TabsList, TabsTrigger } from "components/ui/tabs";
import { useSystemCopy, useSystemMode, type SystemMode } from "lib/system-mode";

type UserRole = "ADMIN" | "CLERK" | "AUDITOR" | "DASHBOARD";

type NavItem = {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  roles?: UserRole[];
};

export function Sidebar() {
  const { pathname } = useLocation();
  const { mode, setMode } = useSystemMode();
  const copy = useSystemCopy();

  const navigation: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    {
      name: copy.receiveNavLabel,
      href: "/inventory/receive",
      icon: Package,
      roles: ["ADMIN", "CLERK", "AUDITOR", "DASHBOARD"],
    },
    {
      name: copy.issueNavLabel,
      href: "/inventory/issue",
      icon: PackageCheck,
      roles: ["ADMIN", "CLERK", "AUDITOR", "DASHBOARD"],
    },
    {
      name: "Transactions",
      href: "/transactions",
      icon: FileText,
      roles: ["ADMIN", "CLERK", "AUDITOR", "DASHBOARD"],
    },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart3,
      roles: ["ADMIN", "CLERK", "AUDITOR", "DASHBOARD"],
    },
    // Adjustments nav item fully removed
  ];
  
  // All users can access all navigation items
  const filteredNavigation = navigation;

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center border-b border-border px-6">
        <img
          src="/images/20251022_100241_OMARI_LOGO_WITH_AFFILLIATE_STATEMENT_GRADIENT_GREEN_HORIZONTAL_VECTOR_05_page-0001.jpg.png"
          alt="Omari Logo"
          width={120}
          height={40}
          className="object-contain"
        />
      </div>
      <div className="border-b border-border px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Mode
        </p>
        <Tabs
          value={mode}
          onValueChange={(value) => setMode(value as SystemMode)}
          className="mt-3"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="CARDS">Cards</TabsTrigger>
            <TabsTrigger value="INVENTORY">Inventory</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-emerald-600 text-white shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
                  : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
