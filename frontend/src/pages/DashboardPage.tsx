"use client";

import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "components/ui/page-header";
import { StatCard } from "components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Button } from "components/ui/button";
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
  Package,
  TrendingUp,
  PackageCheck,
  AlertTriangle,
  Plus,
  ArrowRight,
  Activity,
} from "lucide-react";
import { apiRequest } from "services/api";
import { format } from "date-fns";

export default function DashboardPage() {
  const startOfWeekIso = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay() || 7;
    if (currentDay !== 1) {
      now.setDate(now.getDate() - (currentDay - 1));
    }
    now.setHours(0, 0, 0, 0);
    return now.toISOString();
  }, []);

  const startOfMonthIso = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    return start.toISOString();
  }, []);

  const { data: stockBalance } = useQuery({
    queryKey: ["stock-balance"],
    queryFn: () => apiRequest<any[]>("/api/reports/stock-balance"),
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: () => apiRequest<any>("/api/transactions?limit=10&page=1"),
  });

  const totalStock =
    stockBalance?.reduce((sum, item) => sum + item.balance, 0) || 0;
  const totalIssued = recentTransactions?.summary?.totalQty || 0;
  const activeCardTypes =
    stockBalance?.filter((item) => item.balance > 0).length || 0;

  const lowStockItems =
    stockBalance?.filter((item) => item.balance < 100) || [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Executive Overview"
        description="Monitor card inventory health, recent activity, and operational signals across the network."
        action={
          <div className="flex flex-wrap gap-2">
            <Link to="/inventory/receive">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Receive Cards
              </Button>
            </Link>
            <Link to="/inventory/issue">
              <Button variant="outline" className="gap-2">
                <ArrowRight className="h-4 w-4" />
                Issue Cards
              </Button>
            </Link>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Cards in Stock"
          value={totalStock.toLocaleString()}
          description="Across all active card types"
          icon={Package}
        />
        <StatCard
          title="Issued This Week"
          value={totalIssued.toLocaleString()}
          description="Transactions captured since Monday"
          icon={PackageCheck}
        />
        <StatCard
          title="Active Card Types"
          value={activeCardTypes.toLocaleString()}
          description="Carrying a positive balance"
          icon={TrendingUp}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
          <CardHeader className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-foreground">
                Stock Exposure by Card Type
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Balances by product with low-stock indicators
              </p>
            </div>
            <Link
              to="/reports"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              View detailed reports →
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="text-xs uppercase tracking-wide text-muted-foreground">
                  <TableHead>Card Type</TableHead>
                  <TableHead className="hidden sm:table-cell">Code</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stockBalance?.slice(0, 8).map((item) => (
                  <TableRow key={item.cardType.id}>
                    <TableCell className="font-medium text-foreground">
                      {item.cardType.name}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {item.cardType.code}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant={
                          item.cardType.isActive ? "outline" : "secondary"
                        }
                      >
                        {item.cardType.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={item.balance < 100 ? "destructive" : "default"}
                      >
                        {item.balance.toLocaleString()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No stock data available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">
              Real-time Activity
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Latest three transactions posted to the ledger
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTransactions?.transactions?.slice(0, 3).map((txn: any) => {
              let dateDisplay = "Unknown date";
              if (txn.createdAt) {
                const d = new Date(txn.createdAt);
                if (!isNaN(d.getTime())) {
                  dateDisplay = format(d, "MMM d, yyyy HH:mm");
                }
              }
              return (
                <div
                  key={txn.id}
                  className="flex items-start justify-between rounded-lg border border-border/70 bg-card/80 p-3 shadow-xs dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {txn.type} · {txn.cardType.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dateDisplay}
                      {txn.createdBy && (
                        <>
                          {" "}
                          · {txn.createdBy.firstName} {txn.createdBy.lastName}
                        </>
                      )}
                    </p>
                  </div>
                  <Badge variant="outline" className="whitespace-nowrap text-xs">
                    Qty {txn.qty}
                  </Badge>
                </div>
              );
            }) || (
              <p className="text-sm text-muted-foreground">
                No transactions logged yet.
              </p>
            )}
            <Link to="/transactions">
              <Button variant="outline" className="w-full">
                Manage transactions
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {lowStockItems.length > 0 && (
        <section>
          <Card className="border-l-4 border-orange-400 bg-orange-50/70 shadow-sm dark:border-orange-400/70 dark:bg-orange-500/10 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-orange-800 dark:text-orange-200">
                <AlertTriangle className="h-5 w-5" />
                Low Stock Alerts
              </CardTitle>
              <p className="text-sm text-orange-700/80 dark:text-orange-200/80">
                Prioritize replenishment to avoid issuance delays.
              </p>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.cardType.id}
                  className="flex items-center justify-between rounded-xl border border-orange-200 bg-card/90 p-3 shadow-xs dark:border-orange-400/30 dark:bg-orange-500/10 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {item.cardType.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Remaining balance: {item.balance.toLocaleString()} cards
                    </p>
                  </div>
                  <Link to="/inventory/receive">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-400/50 dark:text-orange-200 dark:hover:bg-orange-500/20"
                    >
                      Restock
                    </Button>
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}

      <div className="pointer-events-none fixed bottom-6 right-6 hidden opacity-20 dark:opacity-10 lg:block">
        <img
          src="/images/20251022_100241_OMARI_LOGO_WITH_AFFILLIATE_STATEMENT_GRADIENT_GREEN_HORIZONTAL_VECTOR_05_page-0001.jpg.png"
          alt="OmaCard watermark"
          width={160}
          height={60}
          className="object-contain"
        />
      </div>
    </div>
  );
}
