"use client";

import { Badge, type BadgeProps } from "components/ui/badge";
import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
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
            ) : transactionsData?.transactions?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-8 text-muted-foreground"
                >
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactionsData?.transactions?.map((txn: any) => (
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
                  <TableCell>{txn.cardType.name}</TableCell>
                  <TableCell>{
                    typeof txn.qty === "number" && !isNaN(txn.qty)
                      ? txn.qty.toLocaleString()
                      : "-"
                  }</TableCell>
                  <TableCell>
                    {txn.issuedToName ? (
                      <span>
                        {txn.issuedToType === "BRANCH" ? "🏢" : "👤"}{" "}
                        {txn.issuedToName}
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
                    {txn.createdBy
                      ? `${txn.createdBy.firstName} ${txn.createdBy.lastName}`
                      : "System"}
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
