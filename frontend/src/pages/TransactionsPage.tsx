"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "components/ui/page-header";
import TransactionDetailDialog from "modules/transactions/components/transaction-detail-dialog";
import TransactionFiltersPanel from "modules/transactions/components/transaction-filters";
import TransactionHistoryTable from "modules/transactions/components/transaction-history-table";
import {
  buildTransactionQueryParams,
  DEFAULT_TRANSACTION_FILTERS,
  type TransactionFilters as TransactionFiltersState,
} from "modules/transactions/lib/filters";
import { apiRequest } from "services/api";
import { useToast } from "components/ui/toast-provider";

const numberFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatAmount = (value: number | null | undefined) =>
  value != null ? numberFormatter.format(value) : "--";

const createEmptyFinancialForm = () => ({
  unitCost: "",
  totalCost: "",
  unitPrice: "",
  totalPrice: "",
});

export default function TransactionsPage() {
  const ALL_TYPE_OPTION = "ALL_TYPES";
  const ALL_CARD_OPTION = "ALL_CARD_TYPES";
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [valueForm, setValueForm] = useState(createEmptyFinancialForm);
  const [filters, setFilters] = useState<TransactionFiltersState>(
    DEFAULT_TRANSACTION_FILTERS,
  );

  const canEditFinancials = true;

  const toInputValue = (value: number | null | undefined) =>
    value != null ? value.toString() : "";

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => {
      const params = buildTransactionQueryParams(filters);
      return apiRequest<any>(`/api/transactions?${params.toString()}`);
    },
  });

  // Hardcoded card types
  const cardTypes = [
    { id: 1, name: "Zim-Switch", code: "ZIM-SWITCH" },
    { id: 2, name: "Visa", code: "VISA" },
  ];

  const saveFinancialsMutation = useMutation({
    mutationFn: async ({
      transactionId,
      payload,
    }: {
      transactionId: number;
      payload: Record<string, string>;
    }) => {
      return apiRequest<any>(`/api/transactions/${transactionId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (updated) => {
      setSelectedTransaction(updated);
      setValueForm({
        unitCost: toInputValue(updated.unitCost),
        totalCost: toInputValue(updated.totalCost),
        unitPrice: toInputValue(updated.unitPrice),
        totalPrice: toInputValue(updated.totalPrice),
      });
      toast({
        title: "Financial values saved",
        description: "Transaction costs were updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["recent-transactions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = async (transactionId: number) => {
    const transaction = await apiRequest<any>(
      `/api/transactions/${transactionId}`,
    );
    setSelectedTransaction(transaction);
    setValueForm({
      unitCost: toInputValue(transaction.unitCost),
      totalCost: toInputValue(transaction.totalCost),
      unitPrice: toInputValue(transaction.unitPrice),
      totalPrice: toInputValue(transaction.totalPrice),
    });
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "RECEIVE":
        return "default";
      case "ISSUE":
        return "secondary";
      case "ADJUSTMENT":
        return "outline";
      case "REVERSAL":
        return "destructive";
      default:
        return "default";
    }
  };

  const getTransactionValueDisplay = (txn: any) => {
    if (txn.type === "RECEIVE") {
      if (txn.totalCost != null) {
        return formatAmount(txn.totalCost);
      }
      if (txn.unitCost != null) {
        return formatAmount(txn.unitCost * txn.qty);
      }
    }

    if (txn.type === "ISSUE") {
      if (txn.totalPrice != null) {
        return formatAmount(txn.totalPrice);
      }
      if (txn.unitPrice != null) {
        return formatAmount(txn.unitPrice * txn.qty);
      }
    }

    return "--";
  };

  const handleSaveFinancials = () => {
    if (!selectedTransaction) return;

    if (
      selectedTransaction.type !== "RECEIVE" &&
      selectedTransaction.type !== "ISSUE"
    ) {
      return;
    }

    const payload: Record<string, string> = {};

    if (selectedTransaction.type === "RECEIVE") {
      payload.unitCost = valueForm.unitCost;
      payload.totalCost = valueForm.totalCost;
    }

    if (selectedTransaction.type === "ISSUE") {
      payload.unitPrice = valueForm.unitPrice;
      payload.totalPrice = valueForm.totalPrice;
    }

    saveFinancialsMutation.mutate({
      transactionId: selectedTransaction.id,
      payload,
    });
  };

  const isFinancialDirty = (() => {
    if (!selectedTransaction) return false;

    if (selectedTransaction.type === "RECEIVE") {
      return (
        valueForm.unitCost !== toInputValue(selectedTransaction.unitCost) ||
        valueForm.totalCost !== toInputValue(selectedTransaction.totalCost)
      );
    }

    if (selectedTransaction.type === "ISSUE") {
      return (
        valueForm.unitPrice !== toInputValue(selectedTransaction.unitPrice) ||
        valueForm.totalPrice !== toInputValue(selectedTransaction.totalPrice)
      );
    }

    return false;
  })();

  const typeOptions = [
    { value: ALL_TYPE_OPTION, label: "All Types" },
    { value: "RECEIVE", label: "Receive" },
    { value: "ISSUE", label: "Issue" },
    { value: "ADJUSTMENT", label: "Adjustment" },
    { value: "REVERSAL", label: "Reversal" },
  ];

  const cardTypeOptions = [
    { value: ALL_CARD_OPTION, label: "All Card Types" },
    ...(cardTypes ?? []).map((type) => ({
      value: type.id.toString(),
      label: type.name,
    })),
  ];

  const handleDialogClose = () => {
    setSelectedTransaction(null);
    setValueForm(createEmptyFinancialForm());
    saveFinancialsMutation.reset();
  };

  const handleFiltersChange = (nextFilters: TransactionFiltersState) => {
    setFilters(nextFilters);
  };

  const handlePageChange = (nextPage: number) => {
    setFilters({ ...filters, page: nextPage });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="View and manage all inventory transactions"
      />

      <TransactionFiltersPanel
        filters={filters}
        onChange={handleFiltersChange}
        defaultFilters={DEFAULT_TRANSACTION_FILTERS}
        typeOptions={typeOptions}
        cardTypeOptions={cardTypeOptions}
        allTypeValue={ALL_TYPE_OPTION}
        allCardTypeValue={ALL_CARD_OPTION}
      />

      <TransactionHistoryTable
        transactionsData={transactionsData}
        isLoading={isLoading}
        filters={filters}
        onPageChange={handlePageChange}
        onViewDetails={handleViewDetails}
        getTypeBadgeVariant={getTypeBadgeVariant}
        getTransactionValueDisplay={getTransactionValueDisplay}
      />

      <TransactionDetailDialog
        selectedTransaction={selectedTransaction}
        onClose={handleDialogClose}
        valueForm={valueForm}
        setValueForm={setValueForm}
        canEditFinancials={canEditFinancials}
        isSaving={saveFinancialsMutation.isPending}
        handleSaveFinancials={handleSaveFinancials}
        isFinancialDirty={isFinancialDirty}
        formatAmount={formatAmount}
        getTypeBadgeVariant={getTypeBadgeVariant}
      />
    </div>
  );
}
