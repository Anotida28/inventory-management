"use client";

import { Sidebar } from "./sidebar";
import Header from "./header";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background to-muted/40"
        aria-hidden="true"
      />
      <div className="relative z-10 flex min-h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col lg:pl-0">
          <Header />
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background/95 to-muted/30 px-4 pb-10 pt-6 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-6xl space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
