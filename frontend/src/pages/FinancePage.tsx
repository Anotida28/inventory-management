"use client";

import { useState, useMemo } from "react";
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

const ALL_CARD_OPTION = "ALL_CARD_TYPES";

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
  byCardType: Array<{
    cardType: { id: number; name: string; code: string };
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
      cardType: { id: number; name: string; code: string };
      qty: number;
      unitCost: number | null;
      totalCost: number | null;
      calculatedTotalCost: number;
      createdAt: string;
    }>;
    issues: Array<{
      id: number;
      type: "ISSUE";
      cardType: { id: number; name: string; code: string };
      qty: number;
      unitPrice: number | null;
      totalPrice: number | null;
      calculatedTotalPrice: number;
      createdAt: string;
    }>;
  };
};

type CardType = {
  id: number;
  name: string;
  code: string;
};

export default function DashboardPage() {
  
  const queryClient = useQueryClient();
  const hasAccess = true;

  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [cardTypeFilter, setCardTypeFilter] = useState("");

  // Editing state
  const [editingTransaction, setEditingTransaction] = useState<{
    id: number;
    type: "RECEIVE" | "ISSUE";
    unitValue: string;
    totalValue: string;
  } | null>(null);

  // Fetch card types for filter
  const { data: cardTypes = [] } = useQuery<CardType[]>({
    queryKey: ["card-types"],
    queryFn: async () => {
      const response = await apiRequest<{ cardTypes: CardType[] }>(
        "/api/card-types",
      );
      return response.cardTypes;
    },
    enabled: hasAccess,
  });

  // Build query params
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (dateRange.startDate) params.append("startDate", dateRange.startDate);
    if (dateRange.endDate) params.append("endDate", dateRange.endDate);
    if (cardTypeFilter && cardTypeFilter !== ALL_CARD_OPTION) {
      params.append("cardTypeId", cardTypeFilter);
    }
    return params.toString();
  }, [dateRange, cardTypeFilter]);

  // Fetch finance data
  const { data: financeData, isLoading } = useQuery({
    queryKey: ["finance-data", queryParams],
    queryFn: () =>
      apiRequest<FinanceData>(`/api/reports/finance?${queryParams}`),
    enabled: hasAccess,
    refetchInterval: 30000, // Refresh every 30 seconds for real-time view
  });

  // Update transaction mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      type,
      unitValue,
      totalValue,
    }: {
      id: number;
      type: "RECEIVE" | "ISSUE";
      unitValue: string;
      totalValue: string;
    }) => {
      const payload: Record<string, number | null> = {};
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

  const totals = financeData?.totals;
  const byCardType = financeData?.byCardType || [];
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Track card costs, revenue, and profit margins across your inventory operations."
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
              <Label htmlFor="cardType">Card Type</Label>
              <Select value={cardTypeFilter} onValueChange={setCardTypeFilter}>
                <SelectTrigger id="cardType">
                  <SelectValue placeholder="All Card Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CARD_OPTION}>All Card Types</SelectItem>
                  {cardTypes.map((type) => (
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
                  setCardTypeFilter("");
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
            description={`${formatNumber(totals?.totalReceivedQty || 0)} cards received`}
            icon={DollarSign}
          />
          <StatCard
            title="Total Revenue (Sales)"
            value={formatCurrency(totals?.totalIssuedRevenue)}
            description={`${formatNumber(totals?.totalIssuedQty || 0)} cards issued`}
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
            description={`${formatNumber(totals?.outstandingInventoryQty || 0)} cards in stock`}
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
          <TabsTrigger value="by-card-type">By Card Type</TabsTrigger>
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

        {/* By Card Type Tab */}
        <TabsContent value="by-card-type">
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary by Card Type</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Card Type</TableHead>
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
                  {byCardType.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        No data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    byCardType.map((item) => (
                      <TableRow key={item.cardType.id}>
                        <TableCell className="font-medium">
                          {item.cardType.name}
                          <span className="text-muted-foreground text-xs ml-1">
                            ({item.cardType.code})
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Transactions Tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions (Edit Financial Values)</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Card Type</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Value</TableHead>
                    <TableHead className="text-right">Total Value</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No recent transactions
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentTransactions.map((txn) => {
                      const isEditing = editingTransaction?.id === txn.id;
                      const unitValue =
                        txn.type === "RECEIVE"
                          ? (txn as any).unitCost
                          : (txn as any).unitPrice;
                      const totalValue =
                        txn.type === "RECEIVE"
                          ? (txn as any).calculatedTotalCost
                          : (txn as any).calculatedTotalPrice;

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
                          <TableCell>{txn.cardType.name}</TableCell>
                          <TableCell className="text-right">
                            {formatNumber(txn.qty)}
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
                                      ? { ...prev, unitValue: e.target.value }
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
                                      ? { ...prev, totalValue: e.target.value }
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
                                onClick={() => {
                                  const rawUnit =
                                    txn.type === "RECEIVE"
                                      ? (txn as any).unitCost
                                      : (txn as any).unitPrice;
                                  const rawTotal =
                                    txn.type === "RECEIVE"
                                      ? (txn as any).totalCost
                                      : (txn as any).totalPrice;
                                  setEditingTransaction({
                                    id: txn.id,
                                    type: txn.type,
                                    unitValue:
                                      rawUnit !== null ? String(rawUnit) : "",
                                    totalValue:
                                      rawTotal !== null ? String(rawTotal) : "",
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
