"use client";

import { Badge, type BadgeProps } from "components/ui/badge";
import { Button } from "components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { format } from "date-fns";
import { Download, FileText } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

type ValueForm = {
  unitCost: string;
  totalCost: string;
  unitPrice: string;
  totalPrice: string;
  qty?: string;
};

type TransactionDetailDialogProps = {
  selectedTransaction: any | null;
  onClose: () => void;
  valueForm: ValueForm;
  setValueForm: Dispatch<SetStateAction<ValueForm>>;
  canEditFinancials: boolean;
  isSaving: boolean;
  handleSaveFinancials: () => void;
  isFinancialDirty: boolean;
  formatAmount: (value: number | null | undefined) => string;
  getTypeBadgeVariant: (type: string) => BadgeProps["variant"];
};

export default function TransactionDetailDialog({
  selectedTransaction,
  onClose,
  valueForm,
  setValueForm,
  canEditFinancials,
  isSaving,
  handleSaveFinancials,
  isFinancialDirty,
  formatAmount,
  getTypeBadgeVariant,
}: TransactionDetailDialogProps) {
  return (
    <Dialog
      open={!!selectedTransaction}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            Complete information about transaction #{selectedTransaction?.id}
          </DialogDescription>
        </DialogHeader>
        {selectedTransaction && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-xs text-muted-foreground">Transaction ID</Label>
                <p className="font-medium">#{selectedTransaction.id}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Type</Label>
                <div>
                  <Badge variant={getTypeBadgeVariant(selectedTransaction.type)}>
                    {selectedTransaction.type}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Card Type</Label>
                <p className="font-medium">
                  {selectedTransaction.cardType.name}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground" htmlFor="finance-qty">Quantity</Label>
                {canEditFinancials ? (
                  <Input
                    id="finance-qty"
                    type="number"
                    min="1"
                    value={valueForm.qty ?? selectedTransaction.qty}
                    onChange={(e) =>
                      setValueForm((prev) => ({
                        ...prev,
                        qty: e.target.value,
                      }))
                    }
                    placeholder="e.g. 100"
                  />
                ) : (
                  <p className="font-medium">
                    {selectedTransaction.qty.toLocaleString()}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Date</Label>
                <p className="font-medium">
                  {format(new Date(selectedTransaction.createdAt), "PPpp")}
                </p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Created By</Label>
                <p className="font-medium">
                  {selectedTransaction.createdBy
                    ? `${selectedTransaction.createdBy.firstName} ${selectedTransaction.createdBy.lastName}`
                    : "System"}
                </p>
              </div>
              {selectedTransaction.issuedToName && (
                <>
                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Issued To Type
                    </Label>
                    <p className="font-medium">
                      {selectedTransaction.issuedToType}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Recipient</Label>
                    <p className="font-medium">
                      {selectedTransaction.issuedToName}
                    </p>
                  </div>
                </>
              )}
              {selectedTransaction.batch && (
                <div>
                  <Label className="text-xs text-muted-foreground">Batch</Label>
                  <p className="font-medium">
                    {selectedTransaction.batch.batchCode}
                  </p>
                </div>
              )}
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <div>
                  <Badge
                    variant={
                      selectedTransaction.status === "COMPLETED"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {selectedTransaction.status}
                  </Badge>
                </div>
              </div>
            </div>

            {(selectedTransaction.type === "RECEIVE" ||
              selectedTransaction.type === "ISSUE") && (
              <div className="rounded-lg border border-border p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">Financials</h4>
                    <p className="text-xs text-muted-foreground">
                      {selectedTransaction.type === "RECEIVE"
                        ? "Capture the per-card cost and total receipt value."
                        : "Capture the per-card price and total issuance value."}
                    </p>
                  </div>
                  {canEditFinancials && (
                    <Button
                      size="sm"
                      onClick={handleSaveFinancials}
                      disabled={isSaving || !isFinancialDirty}
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                  )}
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {selectedTransaction.type === "RECEIVE" ? (
                    <>
                      <div>
                        <Label
                          className="text-xs text-muted-foreground"
                          htmlFor="finance-unit-cost"
                        >
                          Unit Cost
                        </Label>
                        {canEditFinancials ? (
                          <Input
                            id="finance-unit-cost"
                            type="number"
                            min="0"
                            step="0.01"
                            value={valueForm.unitCost}
                            onChange={(e) =>
                              setValueForm((prev) => ({
                                ...prev,
                                unitCost: e.target.value,
                              }))
                            }
                            placeholder="e.g. 2.50"
                          />
                        ) : (
                          <p className="font-medium">
                            {formatAmount(selectedTransaction.unitCost)}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          className="text-xs text-muted-foreground"
                          htmlFor="finance-total-cost"
                        >
                          Total Cost
                        </Label>
                        {canEditFinancials ? (
                          <Input
                            id="finance-total-cost"
                            type="number"
                            min="0"
                            step="0.01"
                            value={valueForm.totalCost}
                            onChange={(e) =>
                              setValueForm((prev) => ({
                                ...prev,
                                totalCost: e.target.value,
                              }))
                            }
                            placeholder="Optional"
                          />
                        ) : (
                          <p className="font-medium">
                            {formatAmount(selectedTransaction.totalCost)}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label
                          className="text-xs text-muted-foreground"
                          htmlFor="finance-unit-price"
                        >
                          Unit Price
                        </Label>
                        {canEditFinancials ? (
                          <Input
                            id="finance-unit-price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={valueForm.unitPrice}
                            onChange={(e) =>
                              setValueForm((prev) => ({
                                ...prev,
                                unitPrice: e.target.value,
                              }))
                            }
                            placeholder="e.g. 5.00"
                          />
                        ) : (
                          <p className="font-medium">
                            {formatAmount(selectedTransaction.unitPrice)}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          className="text-xs text-muted-foreground"
                          htmlFor="finance-total-price"
                        >
                          Total Price
                        </Label>
                        {canEditFinancials ? (
                          <Input
                            id="finance-total-price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={valueForm.totalPrice}
                            onChange={(e) =>
                              setValueForm((prev) => ({
                                ...prev,
                                totalPrice: e.target.value,
                              }))
                            }
                            placeholder="Optional"
                          />
                        ) : (
                          <p className="font-medium">
                            {formatAmount(selectedTransaction.totalPrice)}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
                {canEditFinancials && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Leave a field blank to clear it. Totals are auto-calculated
                    when only a unit value is provided.
                  </p>
                )}
              </div>
            )}

            {selectedTransaction.notes && (
              <div>
                <Label className="text-xs text-muted-foreground">Notes</Label>
                <p className="mt-1 text-sm">{selectedTransaction.notes}</p>
              </div>
            )}

            {selectedTransaction.attachments &&
              Array.isArray(selectedTransaction.attachments) &&
              selectedTransaction.attachments.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Attachments</Label>
                  <div className="mt-2 space-y-2">
                    {selectedTransaction.attachments.map(
                      (file: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded-lg border border-border p-3"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground/60" />
                            <span className="text-sm">{file.fileName}</span>
                          </div>
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline dark:text-blue-400"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
