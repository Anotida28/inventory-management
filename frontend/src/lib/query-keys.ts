import type { SystemMode } from "lib/system-mode";

export type DateRange = { startDate?: string; endDate?: string };
export type ItemFilter = { itemTypeId?: string };
export type TxnFilter = DateRange &
  ItemFilter & {
    type?: "RECEIVE" | "ISSUE" | "REVERSAL" | "ADJUSTMENT";
  };

export const qk = {
  itemTypes: (mode: SystemMode) => ["item-types", mode] as const,

  dashboard: (mode: SystemMode, filters: DateRange & ItemFilter) =>
    ["reports", "dashboard", mode, filters] as const,

  stockBalance: (mode: SystemMode, filters: DateRange & ItemFilter) =>
    ["reports", "stock-balance", mode, filters] as const,

  issues: (mode: SystemMode, filters: DateRange & ItemFilter) =>
    ["reports", "issues", mode, filters] as const,

  receipts: (mode: SystemMode, filters: DateRange & ItemFilter) =>
    ["reports", "receipts", mode, filters] as const,

  userActivity: (mode: SystemMode, filters: DateRange) =>
    ["reports", "user-activity", mode, filters] as const,

  transactions: (
    mode: SystemMode,
    filters: TxnFilter,
    page: number,
    limit: number,
  ) => ["transactions", mode, filters, page, limit] as const,

  transaction: (mode: SystemMode, id: string | number) =>
    ["transaction", mode, id] as const,

  batches: (mode: SystemMode, itemTypeId?: string | number) =>
    ["inventory", "batches", mode, itemTypeId ?? "none"] as const,
} as const;
