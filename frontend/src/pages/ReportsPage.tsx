"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
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
import { Download } from "lucide-react";
import { apiRequest } from "services/api";
import { format } from "date-fns";
import { useSystemCopy, useSystemMode } from "lib/system-mode";
import { qk } from "lib/query-keys";
import { getUserDisplayName } from "lib/user-display";

type ItemType = {
  id: number;
  name: string;
  code: string;
};

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [itemTypeFilter, setItemTypeFilter] = useState("");
  const [stockSearch, setStockSearch] = useState("");
  const [issuesSearch, setIssuesSearch] = useState("");
  const [receiptsSearch, setReceiptsSearch] = useState("");
  const [activitySearch, setActivitySearch] = useState("");
  const [stockPage, setStockPage] = useState(1);
  const [issuesPage, setIssuesPage] = useState(1);
  const [receiptsPage, setReceiptsPage] = useState(1);
  const [activityPage, setActivityPage] = useState(1);
  const PAGE_SIZE = 10;
  const ALL_ITEM_OPTION = "ALL_ITEM_TYPES";
  const copy = useSystemCopy();
  const { mode } = useSystemMode();
  const reportFilters = useMemo(
    () => ({
      startDate: dateRange.startDate || "",
      endDate: dateRange.endDate || "",
      itemTypeId: itemTypeFilter || "",
    }),
    [dateRange.startDate, dateRange.endDate, itemTypeFilter],
  );
  const stockBalanceFilters = reportFilters;
  const activityFilters = useMemo(
    () => ({
      startDate: dateRange.startDate || "",
      endDate: dateRange.endDate || "",
    }),
    [dateRange.startDate, dateRange.endDate],
  );

  const { data: itemTypes = [] } = useQuery<ItemType[]>({
    queryKey: qk.itemTypes(mode),
    queryFn: async () => {
      const response = await apiRequest<{ itemTypes: ItemType[] }>(
        "/api/item-types",
      );
      return response.itemTypes;
    },
  });

  useEffect(() => {
    setItemTypeFilter("");
  }, [mode]);

  useEffect(() => {
    setStockPage(1);
  }, [stockSearch, mode]);

  useEffect(() => {
    setIssuesPage(1);
  }, [
    issuesSearch,
    dateRange.startDate,
    dateRange.endDate,
    itemTypeFilter,
    mode,
  ]);

  useEffect(() => {
    setReceiptsPage(1);
  }, [
    receiptsSearch,
    dateRange.startDate,
    dateRange.endDate,
    itemTypeFilter,
    mode,
  ]);

  useEffect(() => {
    setActivityPage(1);
  }, [activitySearch, dateRange.startDate, dateRange.endDate, mode]);

  const { data: stockBalance } = useQuery({
    queryKey: qk.stockBalance(mode, stockBalanceFilters),
    queryFn: () => apiRequest<any>("/api/reports/stock-balance"),
  });

  const { data: issuesReport } = useQuery({
    queryKey: qk.issues(mode, reportFilters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append("startDate", dateRange.startDate);
      if (dateRange.endDate) params.append("endDate", dateRange.endDate);
      if (itemTypeFilter) params.append("itemTypeId", itemTypeFilter);
      return apiRequest<any>(`/api/reports/issues?${params.toString()}`);
    },
    enabled: true,
  });

  const { data: receiptsReport } = useQuery({
    queryKey: qk.receipts(mode, reportFilters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append("startDate", dateRange.startDate);
      if (dateRange.endDate) params.append("endDate", dateRange.endDate);
      if (itemTypeFilter) params.append("itemTypeId", itemTypeFilter);
      return apiRequest<any>(`/api/reports/receipts?${params.toString()}`);
    },
  });

  // Adjustments report removed

  const { data: userActivityReport } = useQuery({
    queryKey: qk.userActivity(mode, activityFilters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append("startDate", dateRange.startDate);
      if (dateRange.endDate) params.append("endDate", dateRange.endDate);
      return apiRequest<any>(`/api/reports/user-activity?${params.toString()}`);
    },
  });

  const stockBalanceItems = Array.isArray(stockBalance)
    ? stockBalance
    : stockBalance?.byItemType ?? [];
  const normalizedStockSearch = stockSearch.trim().toLowerCase();
  const filteredStockBalance = normalizedStockSearch
    ? stockBalanceItems.filter((item: any) => {
        const haystack = [
          item.itemType?.name,
          item.itemType?.code,
          item.balance,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedStockSearch);
      })
    : stockBalanceItems;

  const normalizedIssuesSearch = issuesSearch.trim().toLowerCase();
  const filteredIssues = normalizedIssuesSearch
    ? (issuesReport?.issues ?? []).filter((item: any) => {
        const recipient = item.issuedToBranch?.name || item.issuedToName || "";
        const user = getUserDisplayName(item.createdBy, "");
        const haystack = [
          item.itemType?.name,
          recipient,
          item.qty,
          user,
          item.notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedIssuesSearch);
      })
    : issuesReport?.issues ?? [];
  const issuesByItemType =
    issuesReport?.byItemType ?? issuesReport?.summary?.byItemType ?? [];

  const normalizedReceiptsSearch = receiptsSearch.trim().toLowerCase();
  const filteredReceipts = normalizedReceiptsSearch
    ? (receiptsReport?.receipts ?? []).filter((item: any) => {
        const user = getUserDisplayName(item.createdBy, "");
        const haystack = [
          item.itemType?.name,
          item.batch?.batchCode,
          item.qty,
          user,
          item.notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedReceiptsSearch);
      })
    : receiptsReport?.receipts ?? [];
  const receiptsByItemType =
    receiptsReport?.byItemType ?? receiptsReport?.summary?.byItemType ?? [];

  const normalizedActivitySearch = activitySearch.trim().toLowerCase();
  const filteredUserGroups = normalizedActivitySearch
    ? (userActivityReport?.byUser ?? []).filter((group: any) => {
        const user = group.user || {};
        const haystack = [
          getUserDisplayName(user, ""),
          user.email,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedActivitySearch);
      })
    : userActivityReport?.byUser ?? [];

  const stockTotal = filteredStockBalance.length;
  const stockTotalPages = Math.max(Math.ceil(stockTotal / PAGE_SIZE), 1);
  const stockPageSafe = Math.min(stockPage, stockTotalPages);
  const pagedStockBalance = filteredStockBalance.slice(
    (stockPageSafe - 1) * PAGE_SIZE,
    stockPageSafe * PAGE_SIZE,
  );

  const issuesTotal = filteredIssues.length;
  const issuesTotalPages = Math.max(Math.ceil(issuesTotal / PAGE_SIZE), 1);
  const issuesPageSafe = Math.min(issuesPage, issuesTotalPages);
  const pagedIssues = filteredIssues.slice(
    (issuesPageSafe - 1) * PAGE_SIZE,
    issuesPageSafe * PAGE_SIZE,
  );

  const receiptsTotal = filteredReceipts.length;
  const receiptsTotalPages = Math.max(Math.ceil(receiptsTotal / PAGE_SIZE), 1);
  const receiptsPageSafe = Math.min(receiptsPage, receiptsTotalPages);
  const pagedReceipts = filteredReceipts.slice(
    (receiptsPageSafe - 1) * PAGE_SIZE,
    receiptsPageSafe * PAGE_SIZE,
  );

  const activityTotal = filteredUserGroups.length;
  const activityTotalPages = Math.max(Math.ceil(activityTotal / PAGE_SIZE), 1);
  const activityPageSafe = Math.min(activityPage, activityTotalPages);
  const pagedUserGroups = filteredUserGroups.slice(
    (activityPageSafe - 1) * PAGE_SIZE,
    activityPageSafe * PAGE_SIZE,
  );

  useEffect(() => {
    if (stockPage > stockTotalPages) {
      setStockPage(stockTotalPages);
    }
  }, [stockPage, stockTotalPages]);

  useEffect(() => {
    if (issuesPage > issuesTotalPages) {
      setIssuesPage(issuesTotalPages);
    }
  }, [issuesPage, issuesTotalPages]);

  useEffect(() => {
    if (receiptsPage > receiptsTotalPages) {
      setReceiptsPage(receiptsTotalPages);
    }
  }, [receiptsPage, receiptsTotalPages]);

  useEffect(() => {
    if (activityPage > activityTotalPages) {
      setActivityPage(activityTotalPages);
    }
  }, [activityPage, activityTotalPages]);

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            return typeof value === "string" && value.includes(",")
              ? `"${value}"`
              : value;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="View and export inventory reports"
      />

      <Tabs defaultValue="stock-balance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stock-balance">Stock Balance</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
          {/* Adjustments tab removed */}
          <TabsTrigger value="user-activity">User Activity</TabsTrigger>
        </TabsList>

        {/* Stock Balance */}
        <TabsContent value="stock-balance">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Stock Balance Report</CardTitle>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                  <Input
                    value={stockSearch}
                    onChange={(e) => setStockSearch(e.target.value)}
                    placeholder="Search stock..."
                    className="h-9 w-full sm:w-32"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const exportData =
                        filteredStockBalance.map((item: any) => ({
                          [copy.itemTypeLabel]: item.itemType.name,
                          Code: item.itemType.code,
                          Balance: item.balance,
                          "Last Updated": format(
                            new Date(item.lastUpdatedAt),
                            "PP",
                          ),
                        })) || [];
                      exportToCSV(exportData, "stock-balance");
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{copy.itemTypeLabel}</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockTotal === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {normalizedStockSearch
                          ? "No matching stock items"
                          : "No stock data available"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedStockBalance.map((item: any) => (
                      <TableRow key={item.itemType?.id ?? item.id}>
                        <TableCell className="font-medium">
                          {item.itemType.name}
                        </TableCell>
                        <TableCell>{item.itemType.code}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              item.balance < 100 ? "destructive" : "default"
                            }
                          >
                            {item.balance.toLocaleString()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(item.lastUpdatedAt), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {stockTotal > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(stockPageSafe - 1) * PAGE_SIZE + 1} to{" "}
                    {Math.min(stockPageSafe * PAGE_SIZE, stockTotal)} of {stockTotal} items
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={stockPageSafe === 1}
                      onClick={() => setStockPage(stockPageSafe - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={stockPageSafe >= stockTotalPages}
                      onClick={() => setStockPage(stockPageSafe + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues Report */}
        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Issues Report</CardTitle>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:items-center">
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, startDate: e.target.value })
                    }
                    className="w-40"
                  />
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, endDate: e.target.value })
                    }
                    className="w-40"
                  />
                  <Select
                    value={itemTypeFilter || ALL_ITEM_OPTION}
                    onValueChange={(value) =>
                      setItemTypeFilter(value === ALL_ITEM_OPTION ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={copy.itemTypeAllLabel} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_ITEM_OPTION}>
                        {copy.itemTypeAllLabel}
                      </SelectItem>
                      {itemTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={issuesSearch}
                    onChange={(e) => setIssuesSearch(e.target.value)}
                    placeholder="Search issues..."
                    className="h-9 w-full sm:w-32"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const exportData =
                        filteredIssues.map((item: any) => ({
                          Date: format(new Date(item.createdAt), "PP"),
                          [copy.itemTypeLabel]: item.itemType.name,
                          Quantity: item.qty,
                          Recipient: item.issuedToBranch?.name || item.issuedToName || "-",
                          Type: item.issuedToBranch ? "BRANCH" : item.issuedToType || "-",
                          User: getUserDisplayName(item.createdBy),
                          Notes: item.notes || "-",
                        })) || [];
                      exportToCSV(exportData, "issues-report");
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {issuesReport?.summary && (
                <div className="mb-4 rounded-lg bg-blue-50/80 p-4 dark:bg-blue-500/10">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Quantity</p>
                      <p className="text-2xl font-bold">
                        {issuesReport.summary.totalQty.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Transactions
                      </p>
                      <p className="text-2xl font-bold">
                        {issuesReport.summary.totalCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {copy.itemTypePlural}
                      </p>
                      <p className="text-2xl font-bold">
                        {issuesByItemType.length}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>{copy.itemTypeLabel}</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issuesTotal === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {normalizedIssuesSearch
                          ? "No matching issues"
                          : "No issues available"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedIssues.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {format(new Date(item.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>{item.itemType.name}</TableCell>
                        <TableCell>{item.qty.toLocaleString()}</TableCell>
                        <TableCell>
                          {item.issuedToBranch?.name || item.issuedToName || "-"}
                        </TableCell>
                        <TableCell>
                          {getUserDisplayName(item.createdBy)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {issuesTotal > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(issuesPageSafe - 1) * PAGE_SIZE + 1} to{" "}
                    {Math.min(issuesPageSafe * PAGE_SIZE, issuesTotal)} of {issuesTotal} issues
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={issuesPageSafe === 1}
                      onClick={() => setIssuesPage(issuesPageSafe - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={issuesPageSafe >= issuesTotalPages}
                      onClick={() => setIssuesPage(issuesPageSafe + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receipts Report */}
        <TabsContent value="receipts">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>Receipts Report</CardTitle>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:items-center">
                  <Input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, startDate: e.target.value })
                    }
                    className="w-40"
                  />
                  <Input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, endDate: e.target.value })
                    }
                    className="w-40"
                  />
                  <Input
                    value={receiptsSearch}
                    onChange={(e) => setReceiptsSearch(e.target.value)}
                    placeholder="Search receipts..."
                    className="h-9 w-full sm:w-32"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const exportData =
                        filteredReceipts.map((item: any) => ({
                          Date: format(new Date(item.createdAt), "PP"),
                          [copy.itemTypeLabel]: item.itemType.name,
                          Quantity: item.qty,
                          [mode === "INVENTORY"
                            ? "Batch / Serial Number"
                            : "Batch Code"]: item.batch?.batchCode || "-",
                          User: getUserDisplayName(item.createdBy),
                          Notes: item.notes || "-",
                        })) || [];
                      exportToCSV(exportData, "receipts-report");
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {receiptsReport?.summary && (
                <div className="mb-4 rounded-lg bg-emerald-50/60 p-4 dark:bg-emerald-500/10">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Quantity</p>
                      <p className="text-2xl font-bold">
                        {receiptsReport.summary.totalQty.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Transactions
                      </p>
                      <p className="text-2xl font-bold">
                        {receiptsReport.summary.totalCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {copy.itemTypePlural}
                      </p>
                      <p className="text-2xl font-bold">
                        {receiptsByItemType.length}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>{copy.itemTypeLabel}</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>
                      {mode === "INVENTORY" ? "Batch / Serial Number" : "Batch Code"}
                    </TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receiptsTotal === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {normalizedReceiptsSearch
                          ? "No matching receipts"
                          : "No receipts available"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedReceipts.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {format(new Date(item.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>{item.itemType.name}</TableCell>
                        <TableCell>{item.qty.toLocaleString()}</TableCell>
                        <TableCell>{item.batch?.batchCode || "-"}</TableCell>
                        <TableCell>
                          {getUserDisplayName(item.createdBy)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {receiptsTotal > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(receiptsPageSafe - 1) * PAGE_SIZE + 1} to{" "}
                    {Math.min(receiptsPageSafe * PAGE_SIZE, receiptsTotal)} of {receiptsTotal} receipts
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={receiptsPageSafe === 1}
                      onClick={() => setReceiptsPage(receiptsPageSafe - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={receiptsPageSafe >= receiptsTotalPages}
                      onClick={() => setReceiptsPage(receiptsPageSafe + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Adjustments report tab removed */}

        {/* User Activity Report */}
        <TabsContent value="user-activity">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>User Activity Report</CardTitle>
                <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:items-center">
                  <Input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, startDate: e.target.value })
                    }
                    className="w-40"
                  />
                  <Input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, endDate: e.target.value })
                    }
                    className="w-40"
                  />
                  <Input
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    placeholder="Search users..."
                    className="h-9 w-full sm:w-32"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const exportData =
                        userActivityReport?.transactions?.map((item: any) => ({
                          Date: format(new Date(item.createdAt), "PP"),
                          User: getUserDisplayName(item.createdBy),
                          Type: item.type,
                          [copy.itemTypeLabel]: item.itemType.name,
                          Quantity: item.qty,
                        })) || [];
                      exportToCSV(exportData, "user-activity-report");
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {userActivityReport?.summary && (
                <div className="mb-4 rounded-lg bg-muted/40 p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Transactions
                      </p>
                      <p className="text-2xl font-bold">
                        {userActivityReport.summary.totalTransactions}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold">
                        {userActivityReport.summary.totalUsers ??
                          userActivityReport.summary.uniqueUsers}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {activityTotal === 0 ? (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    {normalizedActivitySearch
                      ? "No matching users"
                      : "No user activity available"}
                  </div>
                ) : (
                  pagedUserGroups.map((userGroup: any, index: number) => {
                    const receiveCount =
                      userGroup.receipts ?? userGroup.counts?.RECEIVE ?? 0;
                    const issueCount =
                      userGroup.issues ?? userGroup.counts?.ISSUE ?? 0;
                    const adjustmentCount =
                      userGroup.adjustments ?? userGroup.counts?.ADJUSTMENT ?? 0;
                    const reversalCount =
                      userGroup.reversals ?? userGroup.counts?.REVERSAL ?? 0;
                    const totalTransactions =
                      userGroup.totalTransactions ??
                      userGroup.transactions?.length ??
                      receiveCount + issueCount + adjustmentCount + reversalCount;

                    return (
                      <div
                        key={
                          userGroup.user?.id ??
                          userGroup.user?.email ??
                          userGroup.user?.name ??
                          index
                        }
                        className="rounded-lg border border-border p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <p className="font-semibold">
                              {getUserDisplayName(userGroup.user)}
                            </p>
                            {userGroup.user?.email && (
                              <p className="text-sm text-muted-foreground">
                                {userGroup.user.email}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              Total Transactions
                            </p>
                            <p className="text-xl font-bold">
                              {totalTransactions}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Receives</p>
                            <p className="font-semibold">{receiveCount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Issues</p>
                            <p className="font-semibold">{issueCount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Adjustments</p>
                            <p className="font-semibold">{adjustmentCount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Reversals</p>
                            <p className="font-semibold">{reversalCount}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {activityTotal > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {(activityPageSafe - 1) * PAGE_SIZE + 1} to{" "}
                    {Math.min(activityPageSafe * PAGE_SIZE, activityTotal)} of {activityTotal} users
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={activityPageSafe === 1}
                      onClick={() => setActivityPage(activityPageSafe - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={activityPageSafe >= activityTotalPages}
                      onClick={() => setActivityPage(activityPageSafe + 1)}
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
