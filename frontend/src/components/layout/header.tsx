"use client";

import { useNavigate } from "react-router-dom";
import { useUser } from "lib/user-context";
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
import { useSystemCopy } from "lib/system-mode";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const copy = useSystemCopy();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card px-6 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-foreground">
          Omari - {copy.systemName}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-foreground">
            {user?.fullname || user?.username || ""}
          </p>
          {user?.title && (
            <p className="text-xs text-muted-foreground">{user.title}</p>
          )}
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
                  {user?.fullname || user?.username || ""}
                </p>
                {user?.email && (
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                )}
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