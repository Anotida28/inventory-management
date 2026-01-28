"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type SystemMode = "CARDS" | "INVENTORY";

type SystemModeContextValue = {
  mode: SystemMode;
  setMode: (mode: SystemMode) => void;
  toggleMode: () => void;
};

type SystemCopy = {
  systemName: string;
  receiveNavLabel: string;
  issueNavLabel: string;
  receiveTitle: string;
  receiveDescription: string;
  receivePanelTitle: string;
  issueTitle: string;
  issueDescription: string;
  transactionsDescription: string;
  dashboardDescription: string;
  itemTypeLabel: string;
  itemTypePlural: string;
  itemTypeAllLabel: string;
  itemTypePlaceholder: string;
  unitNoun: string;
  unitNounPlural: string;
};

const STORAGE_KEY = "omari.systemMode";
const GLOBAL_MODE_KEY = "__OMARI_SYSTEM_MODE";

const persistMode = (nextMode: SystemMode) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, nextMode);
  (window as unknown as Record<string, SystemMode>)[GLOBAL_MODE_KEY] = nextMode;
};

const SystemModeContext = createContext<SystemModeContextValue | undefined>(
  undefined,
);

const SYSTEM_MODE_COPY: Record<SystemMode, SystemCopy> = {
  CARDS: {
    systemName: "Cards System",
    receiveNavLabel: "Receive Cards",
    issueNavLabel: "Issue Cards",
    receiveTitle: "Receive Cards",
    receiveDescription: "Record a new batch of cards received",
    receivePanelTitle: "Receive Card Batch",
    issueTitle: "Issue Cards",
    issueDescription: "Issue cards to branches or individuals",
    transactionsDescription: "View and manage all card transactions",
    dashboardDescription:
      "Track card costs, revenue, and profit margins across your inventory operations.",
    itemTypeLabel: "Card Type",
    itemTypePlural: "Card Types",
    itemTypeAllLabel: "All Card Types",
    itemTypePlaceholder: "Select card type",
    unitNoun: "card",
    unitNounPlural: "cards",
  },
  INVENTORY: {
    systemName: "Inventory System",
    receiveNavLabel: "Receive Inventory",
    issueNavLabel: "Issue Inventory",
    receiveTitle: "Receive Inventory",
    receiveDescription: "Record inventory received at the main branch",
    receivePanelTitle: "Receive Inventory Batch",
    issueTitle: "Issue Inventory",
    issueDescription: "Issue inventory to branches or individuals",
    transactionsDescription: "View and manage all inventory transactions",
    dashboardDescription:
      "Track item costs, revenue, and profit margins across your inventory operations.",
    itemTypeLabel: "Item Type",
    itemTypePlural: "Item Types",
    itemTypeAllLabel: "All Item Types",
    itemTypePlaceholder: "Select item type",
    unitNoun: "item",
    unitNounPlural: "items",
  },
};

const getStoredMode = (): SystemMode => {
  if (typeof window === "undefined") return "CARDS";
  const globalMode = (window as unknown as Record<string, SystemMode>)[
    GLOBAL_MODE_KEY
  ];
  if (globalMode === "CARDS" || globalMode === "INVENTORY") {
    return globalMode;
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "INVENTORY" ? "INVENTORY" : "CARDS";
};

export function SystemModeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mode, setModeState] = useState<SystemMode>(getStoredMode);

  useEffect(() => {
    persistMode(mode);
  }, [mode]);

  const setMode = (nextMode: SystemMode) => {
    persistMode(nextMode);
    setModeState(nextMode);
  };

  const toggleMode = () => {
    setModeState((prev) => {
      const nextMode = prev === "CARDS" ? "INVENTORY" : "CARDS";
      persistMode(nextMode);
      return nextMode;
    });
  };

  const value = useMemo(
    () => ({ mode, setMode, toggleMode }),
    [mode],
  );

  return (
    <SystemModeContext.Provider value={value}>
      {children}
    </SystemModeContext.Provider>
  );
}

export function useSystemMode() {
  const context = useContext(SystemModeContext);
  if (!context) {
    throw new Error("useSystemMode must be used within SystemModeProvider");
  }
  return context;
}

export function useSystemCopy() {
  const { mode } = useSystemMode();
  return SYSTEM_MODE_COPY[mode];
}
