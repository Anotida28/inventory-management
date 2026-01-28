"use client";

import { useState } from "react";
import { Badge, type BadgeProps } from "components/ui/badge";
import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Input } from "components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";
import { format } from "date-fns";
import { Eye, FileText } from "lucide-react";
import { useSystemCopy } from "lib/system-mode";
import { getUserDisplayName } from "lib/user-display";

type PaginationFilters = {
  page: number;
  limit: number;
};

type TransactionHistoryTableProps = {
  transactionsData: any;
  isLoading: boolean;
  filters: PaginationFilters;
  onPageChange: (nextPage: number) => void;
  onViewDetails: (transactionId: number) => void;
  getTypeBadgeVariant: (type: string) => BadgeProps["variant"];
  getTransactionValueDisplay: (txn: any) => string;
};

export default function TransactionHistoryTable({
  transactionsData,
  isLoading,
  filters,
  onPageChange,
  onViewDetails,
  getTypeBadgeVariant,
  getTransactionValueDisplay,
}: TransactionHistoryTableProps) {
  const copy = useSystemCopy();
  const [searchTerm, setSearchTerm] = useState("");
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const transactions = transactionsData?.transactions ?? [];
  const filteredTransactions = normalizedSearch
    ? transactions.filter((txn: any) => {
        const recipient =
          txn.issuedToBranch?.name ?? txn.issuedToName ?? "";
        const createdBy = getUserDisplayName(txn.createdBy, "");
        const haystack = [
          txn.id,
          txn.type,
          txn.itemType?.name,
          txn.itemType?.code,
          txn.qty,
          recipient,
          createdBy,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedSearch);
      })
    : transactions;
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Transaction History</CardTitle>
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
              <TableHead>Quantity</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Attachments</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-8 text-muted-foreground"
                >
                  {normalizedSearch ? "No matching transactions" : "No transactions found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((txn: any) => (
                <TableRow
                  key={txn.id}
                  className="cursor-pointer hover:bg-muted/60"
                >
                  <TableCell className="font-medium">#{txn.id}</TableCell>
                  <TableCell>
                    <Badge variant={getTypeBadgeVariant(txn.type)}>
                      {txn.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{txn.itemType?.name ?? "-"}</TableCell>
                  <TableCell>{
                    typeof txn.qty === "number" && !isNaN(txn.qty)
                      ? txn.qty.toLocaleString()
                      : "-"
                  }</TableCell>
                  <TableCell>
                    {txn.issuedToBranch || txn.issuedToName ? (
                      <span>
                        {txn.issuedToBranch ? "🏢" : txn.issuedToType === "PERSON" ? "👤" : "🏢"}{" "}
                        {txn.issuedToBranch?.name ?? txn.issuedToName}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                      {txn.createdAt && !isNaN(Date.parse(txn.createdAt))
                       ? format(new Date(txn.createdAt), "MMM d, yyyy HH:mm")
                       : "-"}
                  </TableCell>
                  <TableCell>
                    {getUserDisplayName(txn.createdBy)}
                  </TableCell>
                  <TableCell>{getTransactionValueDisplay(txn)}</TableCell>
                  <TableCell>
                    {txn.attachments &&
                    Array.isArray(txn.attachments) &&
                    txn.attachments.length > 0 ? (
                      <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <span className="text-muted-foreground/60">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(txn.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {transactionsData?.pagination && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(filters.page - 1) * filters.limit + 1} to{" "}
              {Math.min(
                filters.page * filters.limit,
                transactionsData.pagination.total,
              )}{" "}
              of {transactionsData.pagination.total} transactions
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page === 1}
                onClick={() => onPageChange(filters.page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={
                  filters.page >= transactionsData.pagination.totalPages
                }
                onClick={() => onPageChange(filters.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
