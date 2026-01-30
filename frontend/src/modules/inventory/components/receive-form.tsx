"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Textarea } from "components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import {
  FileUploadArea,
  FileWithMetadata,
} from "components/ui/file-upload-area";
import { useToast } from "components/ui/toast-provider";
import { apiRequest, apiFormData } from "services/api";
import { useSystemCopy, useSystemMode } from "lib/system-mode";
import { qk } from "lib/query-keys";
import { syncUnitTotal } from "lib/money-sync";


type ItemType = {
  id: number;
  name: string;
  code: string;
};

export default function ReceiveForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const copy = useSystemCopy();
  const { mode } = useSystemMode();
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [formData, setFormData] = useState({
    itemTypeId: "",
    itemTypeName: "",
    batchCode: "",
    qtyReceived: "",
    receivedAt: new Date().toISOString().split("T")[0],
    notes: "",
    unitCost: "",
    totalCost: "",
  });

    useEffect(() => {
    console.log(`ReceiveForm - Current mode: ${mode}`);
  }, [mode]);

  const { data: itemTypes = [], isLoading: isLoadingItemTypes } = useQuery<ItemType[]>({
    queryKey: qk.itemTypes(mode),
    queryFn: async () => {
      const response = await apiRequest<{ itemTypes: ItemType[] }>(
        "/api/item-types",
      );
      return response.itemTypes;
    },
  });

  const receiveMutation = useMutation({
    mutationFn: async ({
      formData: payload,
    }: {
      formData: FormData;
      itemTypeId: string;
    }) => {
      return apiFormData("/api/inventory/receive", payload);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reports", mode] });
      queryClient.invalidateQueries({ queryKey: ["transactions", mode] });
      queryClient.invalidateQueries({
        queryKey: qk.batches(mode, variables.itemTypeId),
      });
      toast({ title: "Success", description: "Receipt recorded successfully" });
      navigate("/transactions");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const normalizeName = (value: string) => value.trim().toLowerCase();
  const toItemTypeCode = (value: string) =>
    value
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 20) || "NEW";
  const parseNumber = (value: string) => {
    if (!value) return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  };
  const formatMoneyInput = (value: number | null) =>
    value == null ? "" : value.toFixed(2);
  const syncMoneyInputs = ({
    qty,
    unitValue,
    totalValue,
    changedField,
  }: {
    qty: number;
    unitValue: string;
    totalValue: string;
    changedField: "unit" | "total" | "qty";
  }) => {
    const { unit, total } = syncUnitTotal({
      qty,
      unit: parseNumber(unitValue),
      total: parseNumber(totalValue),
      changedField,
    });
    const nextUnit = formatMoneyInput(unit);
    const nextTotal = formatMoneyInput(total);
    if (changedField === "unit") {
      return { unitCost: unitValue, totalCost: nextTotal };
    }
    if (changedField === "total") {
      return { unitCost: nextUnit, totalCost: totalValue };
    }
    return { unitCost: nextUnit, totalCost: nextTotal };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let itemTypeId = formData.itemTypeId;
    if (mode === "INVENTORY") {
      const typedName = formData.itemTypeName.trim();
      if (!typedName) {
        toast({
          title: "Item type required",
          description: "Enter the item type you are receiving.",
          variant: "destructive",
        });
        return;
      }
      if (!itemTypeId) {
        try {
          const created = await apiRequest<ItemType>("/api/item-types", {
            method: "POST",
            body: JSON.stringify({
              name: typedName,
              code: toItemTypeCode(typedName),
            }),
          });
          itemTypeId = String(created.id);
          queryClient.invalidateQueries({ queryKey: qk.itemTypes(mode) });
        } catch (error: any) {
          toast({
            title: "Unable to create item type",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
      }
    }

    if (!itemTypeId) {
      toast({
        title: "Item type required",
        description: "Select the item type you are receiving.",
        variant: "destructive",
      });
      return;
    }

    // Create receive transaction with files
    const submitFormData = new FormData();
    submitFormData.append("itemTypeId", itemTypeId);
    submitFormData.append("batchCode", formData.batchCode);
    submitFormData.append("qtyReceived", formData.qtyReceived);
    if (formData.receivedAt) {
      const isoReceivedAt = new Date(formData.receivedAt).toISOString();
      submitFormData.append("receivedAt", isoReceivedAt);
    }
    if (formData.notes) {
      submitFormData.append("notes", formData.notes);
    }
    if (formData.unitCost) {
      submitFormData.append("unitCost", formData.unitCost);
    }
    if (formData.totalCost) {
      submitFormData.append("totalCost", formData.totalCost);
    }
    // Append files directly - the backend will handle upload
    files.forEach((fileWithMeta) => {
      submitFormData.append("files", fileWithMeta.file);
    });

      submitFormData.append("itemtype", mode);

    receiveMutation.mutate({
      formData: submitFormData,
      itemTypeId,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={copy.receiveTitle}
        description={copy.receiveDescription}
      />

      <Card>
        <CardHeader>
          <CardTitle>{copy.receivePanelTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {mode === "INVENTORY" ? (
                <div className="space-y-2">
                  <Label htmlFor="itemTypeName">{copy.itemTypeLabel} *</Label>
                  <Input
                    id="itemTypeName"
                    value={formData.itemTypeName}
                    onChange={(e) => {
                      const nextValue = e.target.value;
                      const match = itemTypes.find(
                        (type) => normalizeName(type.name) === normalizeName(nextValue),
                      );
                      setFormData({
                        ...formData,
                        itemTypeName: nextValue,
                        itemTypeId: match ? String(match.id) : "",
                      });
                    }}
                    placeholder={`Type ${copy.itemTypeLabel.toLowerCase()}`}
                    list="inventory-item-types"
                    required
                  />
                  <datalist id="inventory-item-types">
                    {itemTypes.map((type) => (
                      <option key={type.id} value={type.name} />
                    ))}
                  </datalist>
                  <p className="text-xs text-muted-foreground">
                    Start typing to add a new item type or match an existing one.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="itemTypeId">{copy.itemTypeLabel} *</Label>
                  <Select
                    value={formData.itemTypeId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, itemTypeId: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={copy.itemTypePlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingItemTypes ? (
                        <SelectItem value="loading" disabled>
                          Loading item types...
                        </SelectItem>
                      ) : itemTypes.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          No item types available
                        </SelectItem>
                      ) : (
                        itemTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name} ({type.code})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="batchCode">
                  {mode === "INVENTORY" ? "Batch / Serial Number" : "Batch Code"} *
                </Label>
                <Input
                  id="batchCode"
                  value={formData.batchCode}
                  onChange={(e) =>
                    setFormData({ ...formData, batchCode: e.target.value })
                  }
                  placeholder={
                    mode === "INVENTORY"
                      ? "e.g., SERIAL-001 or BATCH-001"
                      : "e.g., BATCH-001"
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qtyReceived">Quantity Received *</Label>
                <Input
                  id="qtyReceived"
                  type="number"
                  min="1"
                  value={formData.qtyReceived}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      qtyReceived: e.target.value,
                      ...syncMoneyInputs({
                        qty: parseNumber(e.target.value) || 0,
                        unitValue: prev.unitCost,
                        totalValue: prev.totalCost,
                        changedField: "qty",
                      }),
                    }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="receivedAt">Date Received *</Label>
                <Input
                  id="receivedAt"
                  type="date"
                  value={formData.receivedAt}
                  onChange={(e) =>
                    setFormData({ ...formData, receivedAt: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="unitCost">Unit Cost</Label>
                <Input
                  id="unitCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unitCost}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ...syncMoneyInputs({
                        qty: parseNumber(prev.qtyReceived) || 0,
                        unitValue: e.target.value,
                        totalValue: prev.totalCost,
                        changedField: "unit",
                      }),
                    }))
                  }
                  placeholder="Optional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalCost">Total Cost</Label>
                <Input
                  id="totalCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.totalCost}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ...syncMoneyInputs({
                        qty: parseNumber(prev.qtyReceived) || 0,
                        unitValue: prev.unitCost,
                        totalValue: e.target.value,
                        changedField: "total",
                      }),
                    }))
                  }
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Optional notes about this batch"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Attachments (Optional)</Label>
              <FileUploadArea
                files={files}
                onFilesChange={setFiles}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={receiveMutation.isPending}
              >
                {receiveMutation.isPending
                  ? "Receiving..."
                  : copy.receiveTitle}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
