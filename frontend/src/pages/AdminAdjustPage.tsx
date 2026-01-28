"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";
import { Badge } from "components/ui/badge";
import {
  FileUploadArea,
  FileWithMetadata,
} from "components/ui/file-upload-area";
import { useToast } from "components/ui/toast-provider";
import { apiRequest, apiFormData } from "services/api";
import { format } from "date-fns";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "components/ui/alert";
import { useSystemMode } from "lib/system-mode";

type ItemType = {
  id: number;
  name: string;
  code: string;
};

export default function AdjustPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mode } = useSystemMode();
  
  const isAdmin = true;
  const isAuditor = false;
  const isFinance = false;
  const hasAccess = true;
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [formData, setFormData] = useState({
    itemTypeId: "",
    qty: "",
    notes: "",
  });
  const [adjustmentSearch, setAdjustmentSearch] = useState("");

  const { data: itemTypes = [] } = useQuery<ItemType[]>({
    queryKey: ["item-types", mode],
    queryFn: async () => {
      const response = await apiRequest<{ itemTypes: ItemType[] }>(
        "/api/item-types",
      );
      return response.itemTypes;
    },
  });

  const { data: adjustments } = useQuery({
    queryKey: ["adjustments", mode],
    queryFn: () => apiRequest<any>("/api/reports/adjustments"),
    enabled: hasAccess,
  });

  const normalizedAdjustmentSearch = adjustmentSearch.trim().toLowerCase();
  const filteredAdjustments = normalizedAdjustmentSearch
    ? (adjustments?.adjustments ?? []).filter((adj: any) => {
        const user = adj.createdBy
          ? `${adj.createdBy.firstName} ${adj.createdBy.lastName}`
          : "";
        const haystack = [
          adj.itemType?.name,
          adj.qty,
          user,
          adj.notes,
          adj.createdAt,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedAdjustmentSearch);
      })
    : adjustments?.adjustments ?? [];

  const adjustMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiFormData("/api/inventory/adjust", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-balance"] });
      queryClient.invalidateQueries({ queryKey: ["adjustments"] });
      queryClient.invalidateQueries({ queryKey: ["recent-transactions"] });
      toast({
        title: "Success",
        description: "Inventory adjusted successfully",
      });
      setFormData({ itemTypeId: "", qty: "", notes: "" });
      setFiles([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create adjustment transaction with files
    const submitFormData = new FormData();
    submitFormData.append("itemTypeId", formData.itemTypeId);
    submitFormData.append("qty", formData.qty);
    if (formData.notes) {
      submitFormData.append("notes", formData.notes);
    }
    // Append files directly - the backend will handle upload
    files.forEach((fileWithMeta) => {
      submitFormData.append("files", fileWithMeta.file);
    });

    if (!isAdmin) {
      toast({
        title: "Read-only access",
        description: "Only administrators can post adjustments.",
        variant: "destructive",
      });
      return;
    }

    adjustMutation.mutate(submitFormData);
  };

  // Check if user has access at all
  if (!hasAccess) {
    return (
      <div className="flex h-full items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertTriangle className="h-12 w-12 text-orange-500 dark:text-orange-400" />
              <div>
                <h3 className="text-lg font-semibold">Access Denied</h3>
                <p className="text-sm text-muted-foreground">
                  This page is only accessible to administrators, finance, or
                  auditor users.
                </p>
              </div>
              <Button onClick={() => navigate("/transactions")}> 
                Go to Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Adjustments"
        description={
          isAdmin
            ? "Adjust inventory levels (Admin)."
            : "View-only access to adjustment activity."
        }
      />

      {(isAuditor || isFinance) && (
        <Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>
            {isFinance ? "Finance access" : "Auditor access"}
          </AlertTitle>
          <AlertDescription>
            {isFinance
              ? "Finance users can view adjustment records for reconciliation. Only administrators can submit new adjustments."
              : "You can monitor adjustment history. Only administrators can submit new adjustments."}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Adjustment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Make Adjustment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="itemTypeId">Item Type *</Label>
                <Select
                  value={formData.itemTypeId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, itemTypeId: value })
                  }
                  required
                  disabled={!isAdmin}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select item type" />
                  </SelectTrigger>
                  <SelectContent>
                    {itemTypes?.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name} ({type.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="qty">Adjustment Quantity *</Label>
                <Input
                  id="qty"
                  type="number"
                  value={formData.qty}
                  onChange={(e) =>
                    setFormData({ ...formData, qty: e.target.value })
                  }
                  placeholder="Positive to add, negative to subtract"
                  required
                  disabled={!isAdmin}
                />
                <p className="text-xs text-muted-foreground">
                  Enter positive number to increase, negative to decrease
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Reason/Notes *</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Explain the reason for this adjustment"
                  rows={3}
                  required
                  disabled={!isAdmin}
                />
              </div>

              <div className="space-y-2">
                <Label>Attachments (Optional)</Label>
                <FileUploadArea
                  files={files}
                  onFilesChange={setFiles}
                  disabled={!isAdmin}
                />
              </div>

              <Button
                type="submit"
                disabled={!isAdmin || adjustMutation.isPending}
                className="w-full"
              >
                {adjustMutation.isPending
                  ? "Adjusting..."
                  : "Submit Adjustment"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Adjustment History */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Adjustments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {adjustments?.adjustments?.slice(0, 10).map((adj: any) => (
                <div
                  key={adj.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="font-medium">{adj.itemType?.name ?? "-"}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(adj.createdAt), "MMM d, yyyy HH:mm")}
                    </p>
                    {adj.notes && (
                      <p className="mt-1 text-xs text-muted-foreground/70">
                        {adj.notes}
                      </p>
                    )}
                  </div>
                  <Badge variant={adj.qty > 0 ? "default" : "destructive"}>
                    {adj.qty > 0 ? "+" : ""}
                    {adj.qty}
                  </Badge>
                </div>
              ))}
              {(!adjustments?.adjustments ||
                adjustments.adjustments.length === 0) && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No adjustments yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Adjustment History Table */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>All Adjustments</CardTitle>
          <Input
            value={adjustmentSearch}
            onChange={(e) => setAdjustmentSearch(e.target.value)}
            placeholder="Search adjustments..."
            className="h-9 w-full sm:w-56"
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Item Type</TableHead>
                <TableHead>Adjustment</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdjustments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {normalizedAdjustmentSearch
                      ? "No matching adjustments"
                      : "No adjustments available"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdjustments.map((adj: any) => (
                  <TableRow key={adj.id}>
                    <TableCell>
                      {format(new Date(adj.createdAt), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {adj.itemType?.name ?? "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={adj.qty > 0 ? "default" : "destructive"}>
                        {adj.qty > 0 ? "+" : ""}
                        {adj.qty.toLocaleString()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {adj.createdBy
                        ? `${adj.createdBy.firstName} ${adj.createdBy.lastName}`
                        : "System"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {adj.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
