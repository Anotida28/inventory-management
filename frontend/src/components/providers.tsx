"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ToastProvider } from "components/ui/toast-provider";

import { SystemModeProvider } from "lib/system-mode";
import { UserProvider } from "lib/user-context";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <SystemModeProvider>
          <ToastProvider>{children}</ToastProvider>
        </SystemModeProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}
