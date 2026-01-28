"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "components/ui/page-header";
import { StatCard } from "components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";
import { Badge } from "components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  Wallet,
  BarChart3,
  Edit,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import { apiRequest } from "services/api";
import { format } from "date-fns";
import { useSystemCopy, useSystemMode } from "lib/system-mode";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { TooltipProps } from "recharts";

const ALL_ITEM_OPTION = "ALL_ITEM_TYPES";

type FinanceData = {
  totals: {
    totalReceivedQty: number;
    totalReceivedCost: number;
    avgReceiveCost: number;
    totalIssuedQty: number;
    totalIssuedRevenue: number;
    avgIssuePrice: number;
    estimatedProfit: number;
    profitMargin: number;
    outstandingInventoryQty: number;
    estimatedInventoryValue: number;
  };
  byItemType: Array<{
    itemType: { id: number; name: string; code: string };
    receivedQty: number;
    receivedCost: number;
    issuedQty: number;
    issuedRevenue: number;
    balance: number;
    avgUnitCost: number;
    avgUnitPrice: number;
    profit: number;
    inventoryValue: number;
  }>;
  chartData: Array<{
    month: string;
    cost: number;
    revenue: number;
    profit: number;
  }>;
  recent: {
    receipts: Array<{
      id: number;
      type: "RECEIVE";
      itemType: { id: number; name: string; code: string };
      status: "COMPLETED" | "REVERSED";
      qty: number;
      unitCost: number | null;
      totalCost: number | null;
      calculatedTotalCost: number;
      createdAt: string;
    }>;
    issues: Array<{
      id: number;
      type: "ISSUE";
      itemType: { id: number; name: string; code: string };
      status: "COMPLETED" | "REVERSED";
      qty: number;
      unitPrice: number | null;
      totalPrice: number | null;
      calculatedTotalPrice: number;
      createdAt: string;
    }>;
  };
};

type ItemType = {
  id: number;
  name: string;
  code: string;
};

export default function DashboardPage() {
  
  const queryClient = useQueryClient();
  const hasAccess = true;
  const copy = useSystemCopy();
  const { mode } = useSystemMode();

  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [itemTypeFilter, setItemTypeFilter] = useState("");
  const [byItemTypeSearch, setByItemTypeSearch] = useState("");
  const [transactionsSearch, setTransactionsSearch] = useState("");
  const [transactionsPage, setTransactionsPage] = useState(1);
  const TRANSACTIONS_PAGE_SIZE = 10;
  const [byItemTypePage, setByItemTypePage] = useState(1);
  const BY_ITEM_PAGE_SIZE = 10;

  // Editing state
  const [editingTransaction, setEditingTransaction] = useState<{
    id: number;
    type: "RECEIVE" | "ISSUE";
    qty: string;
    unitValue: string;
    totalValue: string;
  } | null>(null);

  // Fetch item types for filter
  const { data: itemTypes = [] } = useQuery<ItemType[]>({
    queryKey: ["item-types", mode],
    queryFn: async () => {
      const response = await apiRequest<{ itemTypes: ItemType[] }>(
        "/api/item-types",
      );
      return response.itemTypes;
    },
    enabled: hasAccess,
  });

  // Build query params
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (dateRange.startDate) params.append("startDate", dateRange.startDate);
    if (dateRange.endDate) params.append("endDate", dateRange.endDate);
    if (itemTypeFilter && itemTypeFilter !== ALL_ITEM_OPTION) {
      params.append("itemTypeId", itemTypeFilter);
    }
    return params.toString();
  }, [dateRange, itemTypeFilter]);

  // Fetch finance data
  const { data: financeData, isLoading } = useQuery({
    queryKey: ["finance-data", queryParams, mode],
    queryFn: () =>
      apiRequest<FinanceData>(`/api/reports/finance?${queryParams}`),
    enabled: hasAccess,
    refetchInterval: 30000, // Refresh every 30 seconds for real-time view
  });

  useEffect(() => {
    setItemTypeFilter("");
  }, [mode]);

  useEffect(() => {
    setTransactionsPage(1);
  }, [transactionsSearch, mode, dateRange.startDate, dateRange.endDate, itemTypeFilter]);

  useEffect(() => {
    setByItemTypePage(1);
  }, [byItemTypeSearch, mode, dateRange.startDate, dateRange.endDate, itemTypeFilter]);

  // Update transaction mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      type,
      qty,
      unitValue,
      totalValue,
    }: {
      id: number;
      type: "RECEIVE" | "ISSUE";
      qty: string;
      unitValue: string;
      totalValue: string;
    }) => {
      const payload: Record<string, number | null> = {};
      if (qty) {
        payload.qty = parseFloat(qty);
      }
      if (type === "RECEIVE") {
        payload.unitCost = unitValue ? parseFloat(unitValue) : null;
        payload.totalCost = totalValue ? parseFloat(totalValue) : null;
      } else {
        payload.unitPrice = unitValue ? parseFloat(unitValue) : null;
        payload.totalPrice = totalValue ? parseFloat(totalValue) : null;
      }
      return apiRequest(`/api/transactions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-data"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["stock-balance"] });
      queryClient.invalidateQueries({ queryKey: ["issues-report"] });
      queryClient.invalidateQueries({ queryKey: ["receipts-report"] });
      queryClient.invalidateQueries({ queryKey: ["user-activity-report"] });
      setEditingTransaction(null);
    },
  });

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const parseNumber = (value: string | number) => {
    if (!value) return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  };

  const formatMoneyInput = (value: number | null) =>
    value == null ? "" : value.toFixed(2);

  const syncTotalFromUnit = (unitValue: string, qty: number) => {
    const unit = parseNumber(unitValue);
    if (unit == null || qty <= 0) return "";
    return formatMoneyInput(unit * qty);
  };

  const syncUnitFromTotal = (totalValue: string, qty: number) => {
    const total = parseNumber(totalValue);
    if (total == null || qty <= 0) return "";
    return formatMoneyInput(total / qty);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatMonthValue = (value: string | number | null | undefined) => {
    if (value == null) return "Unknown";
    const monthStr = String(value);
    const [year, month] = monthStr.split("-");
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);
    if (
      isNaN(yearNum) ||
      isNaN(monthNum) ||
      monthNum < 1 ||
      monthNum > 12
    ) {
      return "Unknown";
    }
    const date = new Date(yearNum, monthNum - 1);
    if (isNaN(date.getTime())) {
      return "Unknown";
    }
    return format(date, "MMM yyyy");
  };

  const formatMonth: TooltipProps<number, string>["labelFormatter"] = (
    label,
  ) => formatMonthValue(label);

  const tooltipFormatter: TooltipProps<number, string>["formatter"] = (
    value,
  ) => {
    const numericValue =
      typeof value === "number"
        ? value
        : Number.parseFloat(value != null ? String(value) : "0");

    if (!Number.isFinite(numericValue)) {
      return formatCurrency(0);
    }

    return formatCurrency(numericValue);
  };

  const totals = financeData?.totals;
  const byItemType = financeData?.byItemType || [];
  const chartData = financeData?.chartData || [];
  const recentReceipts = financeData?.recent?.receipts || [];
  const recentIssues = financeData?.recent?.issues || [];

  // Combine and sort recent transactions
  const recentTransactions = [
    ...recentReceipts.map((r) => ({ ...r, type: "RECEIVE" as const })),
    ...recentIssues.map((i) => ({ ...i, type: "ISSUE" as const })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const normalizedByItemTypeSearch = byItemTypeSearch.trim().toLowerCase();
  const filteredByItemType = normalizedByItemTypeSearch
    ? byItemType.filter((item) => {
        const haystack = [
          item.itemType?.name,
          item.itemType?.code,
          item.receivedQty,
          item.issuedQty,
          item.balance,
          item.receivedCost,
          item.issuedRevenue,
          item.profit,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedByItemTypeSearch);
      })
    : byItemType;

  const normalizedTransactionsSearch = transactionsSearch.trim().toLowerCase();
  const filteredRecentTransactions = normalizedTransactionsSearch
    ? recentTransactions.filter((txn) => {
        const unitValue =
          txn.type === "RECEIVE"
            ? (txn as any).unitCost
            : (txn as any).unitPrice;
        const totalValue =
          txn.type === "RECEIVE"
            ? (txn as any).totalCost ?? (txn as any).calculatedTotalCost
            : (txn as any).totalPrice ?? (txn as any).calculatedTotalPrice;
        const haystack = [
          txn.id,
          txn.type,
          txn.itemType?.name,
          txn.itemType?.code,
          txn.qty,
          unitValue,
          totalValue,
          txn.createdAt,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedTransactionsSearch);
      })
    : recentTransactions;

  const totalTransactions = filteredRecentTransactions.length;
  const totalTransactionPages = Math.max(
    Math.ceil(totalTransactions / TRANSACTIONS_PAGE_SIZE),
    1,
  );
  const clampedTransactionsPage = Math.min(
    transactionsPage,
    totalTransactionPages,
  );
  const pagedTransactions = filteredRecentTransactions.slice(
    (clampedTransactionsPage - 1) * TRANSACTIONS_PAGE_SIZE,
    clampedTransactionsPage * TRANSACTIONS_PAGE_SIZE,
  );

  useEffect(() => {
    if (transactionsPage > totalTransactionPages) {
      setTransactionsPage(totalTransactionPages);
    }
  }, [transactionsPage, totalTransactionPages]);

  const totalByItemTypes = filteredByItemType.length;
  const totalByItemTypePages = Math.max(
    Math.ceil(totalByItemTypes / BY_ITEM_PAGE_SIZE),
    1,
  );
  const clampedByItemTypePage = Math.min(byItemTypePage, totalByItemTypePages);
  const pagedByItemType = filteredByItemType.slice(
    (clampedByItemTypePage - 1) * BY_ITEM_PAGE_SIZE,
    clampedByItemTypePage * BY_ITEM_PAGE_SIZE,
  );

  useEffect(() => {
    if (byItemTypePage > totalByItemTypePages) {
      setByItemTypePage(totalByItemTypePages);
    }
  }, [byItemTypePage, totalByItemTypePages]);

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertTriangle className="h-16 w-16 text-amber-500 dark:text-amber-400" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground text-center max-w-md">
          This page is only accessible to Finance and Admin users. Please
          contact your administrator if you need access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={copy.dashboardDescription}
      />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                }
              />
            </div>
            <div>
              <Label htmlFor="itemType">{copy.itemTypeLabel}</Label>
              <Select value={itemTypeFilter} onValueChange={setItemTypeFilter}>
                <SelectTrigger id="itemType">
                  <SelectValue placeholder={copy.itemTypeAllLabel} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_ITEM_OPTION}>
                    {copy.itemTypeAllLabel}
                  </SelectItem>
                  {itemTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDateRange({ startDate: "", endDate: "" });
                  setItemTypeFilter("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-4 bg-muted/60 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted/60 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Cost (Purchases)"
            value={formatCurrency(totals?.totalReceivedCost)}
            description={`${formatNumber(totals?.totalReceivedQty || 0)} ${copy.unitNounPlural} received`}
            icon={DollarSign}
          />
          <StatCard
            title="Total Revenue (Sales)"
            value={formatCurrency(totals?.totalIssuedRevenue)}
            description={`${formatNumber(totals?.totalIssuedQty || 0)} ${copy.unitNounPlural} issued`}
            icon={Wallet}
          />
          <StatCard
            title="Estimated Profit"
            value={formatCurrency(totals?.estimatedProfit)}
            description={`${formatPercent(totals?.profitMargin || 0)} margin`}
            icon={totals?.estimatedProfit && totals.estimatedProfit >= 0 ? TrendingUp : TrendingDown}
            trend={
              totals?.profitMargin !== undefined
                ? {
                    value: `${totals.profitMargin.toFixed(1)}% margin`,
                    isPositive: totals.profitMargin >= 0,
                  }
                : undefined
            }
          />
          <StatCard
            title="Inventory Value"
            value={formatCurrency(totals?.estimatedInventoryValue)}
            description={`${formatNumber(totals?.outstandingInventoryQty || 0)} ${copy.unitNounPlural} in stock`}
            icon={Package}
          />
        </div>
      )}

      {/* Tabs for different views */}
      <Tabs defaultValue="chart" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chart">
            <BarChart3 className="h-4 w-4 mr-2" />
            Profit Chart
          </TabsTrigger>
          <TabsTrigger value="by-card-type">
            By {copy.itemTypeLabel}
          </TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
        </TabsList>

        {/* Profit Chart Tab */}
        <TabsContent value="chart">
          <Card>
            <CardHeader>
              <CardTitle>Cost vs Revenue vs Profit (All Time)</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  No transaction data available for chart
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={formatMonthValue}
                      fontSize={12}
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        `$${(value / 1000).toFixed(0)}k`
                      }
                      fontSize={12}
                    />
                    <Tooltip
                      formatter={tooltipFormatter}
                      labelFormatter={formatMonth}
                    />
                    <Legend />
                    <Bar dataKey="cost" name="Cost" fill="#ef4444" />
                    <Bar dataKey="revenue" name="Revenue" fill="#22c55e" />
                    <Bar dataKey="profit" name="Profit" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Item Type Tab */}
        <TabsContent value="by-card-type">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>
                Financial Summary by {copy.itemTypeLabel}
              </CardTitle>
              <Input
                value={byItemTypeSearch}
                onChange={(e) => setByItemTypeSearch(e.target.value)}
                placeholder={`Search ${copy.itemTypeLabel.toLowerCase()}...`}
                className="h-9 w-full sm:w-32"
              />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{copy.itemTypeLabel}</TableHead>
                    <TableHead className="text-right">Received Qty</TableHead>
                    <TableHead className="text-right">Total Cost</TableHead>
                    <TableHead className="text-right">Avg Unit Cost</TableHead>
                    <TableHead className="text-right">Issued Qty</TableHead>
                    <TableHead className="text-right">Total Revenue</TableHead>
                    <TableHead className="text-right">Avg Unit Price</TableHead>
                    <TableHead className="text-right">Profit</TableHead>
                    <TableHead className="text-right">In Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {totalByItemTypes === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        {normalizedByItemTypeSearch
                          ? "No matching results"
                          : "No data available"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedByItemType.map((item) => (
                      <TableRow key={item.itemType.id}>
                        <TableCell className="font-medium">
                          {item.itemType.name}
                          <span className="text-muted-foreground text-xs ml-1">
                            ({item.itemType.code})
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(item.receivedQty)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.receivedCost)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.avgUnitCost)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(item.issuedQty)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.issuedRevenue)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.avgUnitPrice)}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            item.profit >= 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {formatCurrency(item.profit)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatNumber(item.balance)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {totalByItemTypes > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(clampedByItemTypePage - 1) * BY_ITEM_PAGE_SIZE + 1} to{" "}
                    {Math.min(
                      clampedByItemTypePage * BY_ITEM_PAGE_SIZE,
                      totalByItemTypes,
                    )}{" "}
                    of {totalByItemTypes} {copy.itemTypePlural.toLowerCase()}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={clampedByItemTypePage === 1}
                      onClick={() => setByItemTypePage(clampedByItemTypePage - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={clampedByItemTypePage >= totalByItemTypePages}
                      onClick={() => setByItemTypePage(clampedByItemTypePage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Transactions</CardTitle>
              <Input
                value={transactionsSearch}
                onChange={(e) => setTransactionsSearch(e.target.value)}
                placeholder="Search transactions..."
                className="h-9 w-full sm:w-32"
              />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>{copy.itemTypeLabel}</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Value</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {totalTransactions === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        {normalizedTransactionsSearch
                          ? "No matching transactions"
                          : "No recent transactions"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedTransactions.map((txn) => {
                      const isEditing = editingTransaction?.id === txn.id;
                      const isReversed = txn.status === "REVERSED";
                      const unitValue =
                        txn.type === "RECEIVE"
                          ? (txn as any).unitCost
                          : (txn as any).unitPrice;
                      const totalValue =
                        txn.type === "RECEIVE"
                          ? (txn as any).calculatedTotalCost
                          : (txn as any).calculatedTotalPrice;
                      const currentQty = isEditing
                        ? parseNumber(editingTransaction.qty) || 0
                        : txn.qty;

                      return (
                        <TableRow key={`${txn.type}-${txn.id}`}>
                          <TableCell>#{txn.id}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                txn.type === "RECEIVE" ? "outline" : "default"
                              }
                            >
                              {txn.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{txn.itemType.name}</TableCell>
                          <TableCell className="text-right">
                            {isEditing ? (
                              <Input
                                type="number"
                                min="1"
                                value={editingTransaction.qty}
                                onChange={(e) =>
                                  setEditingTransaction((prev) => {
                                    if (!prev) return null;
                                    const nextQtyValue = e.target.value;
                                    const nextQty = parseNumber(nextQtyValue) || 0;
                                    let nextUnit = prev.unitValue;
                                    let nextTotal = prev.totalValue;
                                    if (prev.unitValue) {
                                      nextTotal = syncTotalFromUnit(
                                        prev.unitValue,
                                        nextQty,
                                      );
                                    } else if (prev.totalValue) {
                                      nextUnit = syncUnitFromTotal(
                                        prev.totalValue,
                                        nextQty,
                                      );
                                    }
                                    return {
                                      ...prev,
                                      qty: nextQtyValue,
                                      unitValue: nextUnit,
                                      totalValue: nextTotal,
                                    };
                                  })
                                }
                                className="w-20 text-right"
                              />
                            ) : (
                              formatNumber(txn.qty)
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {isEditing ? (
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editingTransaction.unitValue}
                                onChange={(e) =>
                                  setEditingTransaction((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          unitValue: e.target.value,
                                          totalValue: syncTotalFromUnit(
                                            e.target.value,
                                            currentQty,
                                          ),
                                        }
                                      : null
                                  )
                                }
                                className="w-24 text-right"
                              />
                            ) : (
                              formatCurrency(unitValue)
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {isEditing ? (
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editingTransaction.totalValue}
                                onChange={(e) =>
                                  setEditingTransaction((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          totalValue: e.target.value,
                                          unitValue: syncUnitFromTotal(
                                            e.target.value,
                                            currentQty,
                                          ),
                                        }
                                      : null
                                  )
                                }
                                className="w-28 text-right"
                                placeholder="Optional"
                              />
                            ) : (
                              formatCurrency(totalValue)
                            )}
                          </TableCell>
                          <TableCell>
                            {format(new Date(txn.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="text-center">
                            {isEditing ? (
                              <div className="flex justify-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    updateMutation.mutate({
                                      id: editingTransaction.id,
                                      type: editingTransaction.type,
                                      qty: editingTransaction.qty,
                                      unitValue: editingTransaction.unitValue,
                                      totalValue: editingTransaction.totalValue,
                                    })
                                  }
                                  disabled={updateMutation.isPending}
                                >
                                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingTransaction(null)}
                                >
                                  <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={isReversed}
                                onClick={() => {
                                  if (isReversed) return;
                                  const rawUnit =
                                    txn.type === "RECEIVE"
                                      ? (txn as any).unitCost
                                      : (txn as any).unitPrice;
                                  const rawTotal =
                                    txn.type === "RECEIVE"
                                      ? (txn as any).totalCost
                                      : (txn as any).totalPrice;
                                  const initialQty = String(txn.qty);
                                  const initialTotal =
                                    rawTotal !== null
                                      ? String(rawTotal)
                                      : rawUnit !== null
                                        ? syncTotalFromUnit(
                                            String(rawUnit),
                                            txn.qty,
                                          )
                                        : "";
                                  setEditingTransaction({
                                    id: txn.id,
                                    type: txn.type,
                                    qty: initialQty,
                                    unitValue:
                                      rawUnit !== null ? String(rawUnit) : "",
                                    totalValue: initialTotal,
                                  });
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
              {totalTransactions > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(clampedTransactionsPage - 1) * TRANSACTIONS_PAGE_SIZE + 1} to{" "}
                    {Math.min(
                      clampedTransactionsPage * TRANSACTIONS_PAGE_SIZE,
                      totalTransactions,
                    )}{" "}
                    of {totalTransactions} transactions
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={clampedTransactionsPage === 1}
                      onClick={() =>
                        setTransactionsPage(clampedTransactionsPage - 1)
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={clampedTransactionsPage >= totalTransactionPages}
                      onClick={() =>
                        setTransactionsPage(clampedTransactionsPage + 1)
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
