"use client";

import { Link, useLocation } from "react-router-dom";
import type { ComponentType } from "react";
import {
  LayoutDashboard,
  Package,
  PackageCheck,
  CreditCard,
  FileText,
  BarChart3,
  Users,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { cn } from "lib/utils";
import { getAdminUser } from "lib/admin-context";

type UserRole = "ADMIN" | "CLERK" | "AUDITOR" | "FINANCE";

type NavItem = {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  roles?: UserRole[];
};

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Receive Cards", href: "/inventory/receive", icon: Package, roles: ["ADMIN", "CLERK", "AUDITOR", "FINANCE"] },
  { name: "Issue Cards", href: "/inventory/issue", icon: PackageCheck, roles: ["ADMIN", "CLERK", "AUDITOR", "FINANCE"] },
  { name: "Transactions", href: "/transactions", icon: FileText, roles: ["ADMIN", "CLERK", "AUDITOR", "FINANCE"] },
  { name: "Reports", href: "/reports", icon: BarChart3, roles: ["ADMIN", "CLERK", "AUDITOR", "FINANCE"] },
  { name: "Finance Desk", href: "/finance", icon: Wallet, roles: ["FINANCE", "ADMIN"] },
  // Adjustments nav item fully removed
];

export function Sidebar() {
  const { pathname } = useLocation();
  const userRole = getAdminUser().role as UserRole;
  
  // All users can access all navigation items
  const filteredNavigation = navigation;

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 items-center border-b border-border px-6">
        <img
          src="/images/20251022_100241_OMARI_LOGO_WITH_AFFILLIATE_STATEMENT_GRADIENT_GREEN_HORIZONTAL_VECTOR_05_page-0001.jpg.png"
          alt="OmaCard Logo"
          width={120}
          height={40}
          className="object-contain"
        />
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
