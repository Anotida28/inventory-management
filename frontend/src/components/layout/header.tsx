"use client";

import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "components/theme-toggle";
import { Button } from "components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import { User, LogOut } from "lucide-react";
import { getAdminUser } from "lib/admin-context";

export function Header() {
  const navigate = useNavigate();
  const admin = getAdminUser();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card px-6 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground">
          OmaCard Stock Tracking
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-foreground">
            {admin.firstName} {admin.lastName}
          </p>
          <p className="text-xs text-muted-foreground">{admin.role}</p>
        </div>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {admin.firstName} {admin.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {admin.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  Role: {admin.role}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 dark:text-red-400"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
