"use client";

import { useState } from "react";
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
import { useSystemCopy } from "lib/system-mode";

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [cardTypeFilter, setCardTypeFilter] = useState("");
  const ALL_CARD_OPTION = "ALL_CARD_TYPES";
  const copy = useSystemCopy();

  // Hardcoded card types
  const cardTypes = [
    { id: 1, name: "Zim-Switch", code: "ZIM-SWITCH" },
    { id: 2, name: "Visa", code: "VISA" },
  ];

  const { data: stockBalance } = useQuery({
    queryKey: ["stock-balance"],
    queryFn: () => apiRequest<any[]>("/api/reports/stock-balance"),
  });

  const { data: issuesReport } = useQuery({
    queryKey: ["issues-report", dateRange, cardTypeFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append("startDate", dateRange.startDate);
      if (dateRange.endDate) params.append("endDate", dateRange.endDate);
      if (cardTypeFilter) params.append("cardTypeId", cardTypeFilter);
      return apiRequest<any>(`/api/reports/issues?${params.toString()}`);
    },
    enabled: true,
  });

  const { data: receiptsReport } = useQuery({
    queryKey: ["receipts-report", dateRange, cardTypeFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append("startDate", dateRange.startDate);
      if (dateRange.endDate) params.append("endDate", dateRange.endDate);
      if (cardTypeFilter) params.append("cardTypeId", cardTypeFilter);
      return apiRequest<any>(`/api/reports/receipts?${params.toString()}`);
    },
  });

  // Adjustments report removed

  const { data: userActivityReport } = useQuery({
    queryKey: ["user-activity-report", dateRange],
    queryFn: () => {
      const params = new URLSearchParams();
      if (dateRange.startDate) params.append("startDate", dateRange.startDate);
      if (dateRange.endDate) params.append("endDate", dateRange.endDate);
      return apiRequest<any>(`/api/reports/user-activity?${params.toString()}`);
    },
  });

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
              <div className="flex items-center justify-between">
                <CardTitle>Stock Balance Report</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const exportData =
                      stockBalance?.map((item: any) => ({
                        [copy.itemTypeLabel]: item.cardType.name,
                        Code: item.cardType.code,
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
                  {stockBalance?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.cardType.name}
                      </TableCell>
                      <TableCell>{item.cardType.code}</TableCell>
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
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues Report */}
        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Issues Report</CardTitle>
                <div className="flex gap-2">
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
                    value={cardTypeFilter || ALL_CARD_OPTION}
                    onValueChange={(value) =>
                      setCardTypeFilter(value === ALL_CARD_OPTION ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={copy.itemTypeAllLabel} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_CARD_OPTION}>
                        {copy.itemTypeAllLabel}
                      </SelectItem>
                      {cardTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const exportData =
                        issuesReport?.issues?.map((item: any) => ({
                          Date: format(new Date(item.createdAt), "PP"),
                          [copy.itemTypeLabel]: item.cardType.name,
                          Quantity: item.qty,
                          Recipient: item.issuedToName || "-",
                          Type: item.issuedToType || "-",
                          User: item.createdBy
                            ? `${item.createdBy.firstName} ${item.createdBy.lastName}`
                            : "System",
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
                        {issuesReport.summary.byCardType.length}
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
                  {issuesReport?.issues?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {format(new Date(item.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{item.cardType.name}</TableCell>
                      <TableCell>{item.qty.toLocaleString()}</TableCell>
                      <TableCell>{item.issuedToName || "-"}</TableCell>
                      <TableCell>
                        {item.createdBy
                          ? `${item.createdBy.firstName} ${item.createdBy.lastName}`
                          : "System"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receipts Report */}
        <TabsContent value="receipts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Receipts Report</CardTitle>
                <div className="flex gap-2">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const exportData =
                        receiptsReport?.receipts?.map((item: any) => ({
                          Date: format(new Date(item.createdAt), "PP"),
                          [copy.itemTypeLabel]: item.cardType.name,
                          Quantity: item.qty,
                          "Batch Code": item.batch?.batchCode || "-",
                          User: item.createdBy
                            ? `${item.createdBy.firstName} ${item.createdBy.lastName}`
                            : "System",
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
                        {receiptsReport.summary.byCardType.length}
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
                    <TableHead>Batch Code</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receiptsReport?.receipts?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {format(new Date(item.createdAt), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>{item.cardType.name}</TableCell>
                      <TableCell>{item.qty.toLocaleString()}</TableCell>
                      <TableCell>{item.batch?.batchCode || "-"}</TableCell>
                      <TableCell>
                        {item.createdBy
                          ? `${item.createdBy.firstName} ${item.createdBy.lastName}`
                          : "System"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Adjustments report tab removed */}

        {/* User Activity Report */}
        <TabsContent value="user-activity">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Activity Report</CardTitle>
                <div className="flex gap-2">
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const exportData =
                        userActivityReport?.transactions?.map((item: any) => ({
                          Date: format(new Date(item.createdAt), "PP"),
                          User: item.createdBy
                            ? `${item.createdBy.firstName} ${item.createdBy.lastName}`
                            : "System",
                          Type: item.type,
                          [copy.itemTypeLabel]: item.cardType.name,
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
                      <p className="text-sm text-muted-foreground">Unique Users</p>
                      <p className="text-2xl font-bold">
                        {userActivityReport.summary.uniqueUsers}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {userActivityReport?.byUser?.map((userGroup: any) => (
                  <div
                    key={userGroup.user.id}
                    className="rounded-lg border border-border p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold">
                          {userGroup.user.firstName} {userGroup.user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {userGroup.user.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Total Transactions
                        </p>
                        <p className="text-xl font-bold">
                          {userGroup.transactions.length}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Receives</p>
                        <p className="font-semibold">
                          {userGroup.counts.RECEIVE || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Issues</p>
                        <p className="font-semibold">
                          {userGroup.counts.ISSUE || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Adjustments</p>
                        <p className="font-semibold">
                          {userGroup.counts.ADJUSTMENT || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Reversals</p>
                        <p className="font-semibold">
                          {userGroup.counts.REVERSAL || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
