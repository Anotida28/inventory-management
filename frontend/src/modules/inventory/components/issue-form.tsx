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
  FileUploadArea,
  FileWithMetadata,
} from "components/ui/file-upload-area";
import { useToast } from "components/ui/toast-provider";
import { apiRequest, apiFormData } from "services/api";
import { useSystemCopy, useSystemMode } from "lib/system-mode";

type AvailableBatch = {
  id: number;
  itemTypeId: number;
  batchCode: string;
  qtyReceived: number;
  qtyIssued: number;
  availableQty: number;
  receivedAt: string;
  notes: string | null;
};

type ItemType = {
  id: number;
  name: string;
  code: string;
};

export default function IssueForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const copy = useSystemCopy();
  const { mode } = useSystemMode();
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [formData, setFormData] = useState({
    itemTypeId: "",
    qty: "",
    branchName: "",
    issuedToType: "BRANCH" as "BRANCH" | "PERSON",
    issuedToName: "",
    batchId: "",
    notes: "",
  });

  const { data: itemTypes = [], isLoading: isLoadingItemTypes } = useQuery<ItemType[]>({
    queryKey: ["item-types", mode],
    queryFn: async () => {
      const response = await apiRequest<{ itemTypes: ItemType[] }>(
        "/api/item-types",
      );
      return response.itemTypes;
    },
  });

  const { data: batches = [] } = useQuery({
    queryKey: ["available-batches", formData.itemTypeId, mode],
    queryFn: async () => {
      if (!formData.itemTypeId) return [] as AvailableBatch[];
      const response = await apiRequest<{ batches: AvailableBatch[] }>(
        `/api/inventory/batches?itemTypeId=${formData.itemTypeId}`,
      );
      return response.batches;
    },
    enabled: !!formData.itemTypeId,
  });

  const issueMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiFormData("/api/inventory/issue", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-balance"] });
      queryClient.invalidateQueries({ queryKey: ["recent-transactions"] });
      toast({ title: "Success", description: "Issue recorded successfully" });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "INVENTORY" && !formData.branchName.trim()) {
      toast({
        title: "Branch required",
        description: "Enter a branch name before issuing.",
        variant: "destructive",
      });
      return;
    }

    if (mode === "CARDS") {
      if (formData.issuedToType === "BRANCH" && !formData.branchName.trim()) {
        toast({
          title: "Branch required",
          description: "Enter a branch name before issuing.",
          variant: "destructive",
        });
        return;
      }
      if (formData.issuedToType === "PERSON" && !formData.issuedToName.trim()) {
        toast({
          title: "Recipient required",
          description: "Enter the recipient name.",
          variant: "destructive",
        });
        return;
      }
    }

    if (!formData.batchId) {
      toast({
        title: "Batch required",
        description: "Select a batch before issuing.",
        variant: "destructive",
      });
      return;
    }

    // Create issue transaction with files
    const submitFormData = new FormData();
    submitFormData.append("itemTypeId", formData.itemTypeId);
    submitFormData.append("qty", formData.qty);
    submitFormData.append("issuedToType", formData.issuedToType);
    if (formData.issuedToType === "BRANCH") {
      submitFormData.append("issuedToName", formData.branchName);
    } else if (formData.issuedToName) {
      submitFormData.append("issuedToName", formData.issuedToName);
    }
    submitFormData.append("batchId", formData.batchId);
    if (formData.notes) {
      submitFormData.append("notes", formData.notes);
    }
    // Append files directly - the backend will handle upload
    files.forEach((fileWithMeta) => {
      submitFormData.append("files", fileWithMeta.file);
    });

    issueMutation.mutate(submitFormData);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={copy.issueTitle}
        description={copy.issueDescription}
      />

      <Card>
        <CardHeader>
          <CardTitle>{copy.issueTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="itemTypeId">{copy.itemTypeLabel} *</Label>
                  <Select
                    value={formData.itemTypeId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, itemTypeId: value, batchId: "" })
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

                <div className="space-y-2">
                  <Label htmlFor="qty">Quantity *</Label>
                  <Input
                    id="qty"
                    type="number"
                    min="1"
                    value={formData.qty}
                    onChange={(e) =>
                      setFormData({ ...formData, qty: e.target.value })
                    }
                    required
                  />
                </div>

                {mode === "CARDS" ? (
                  <div className="space-y-2">
                    <Label htmlFor="issuedToType">Issue To *</Label>
                    <Select
                      value={formData.issuedToType}
                      onValueChange={(value: "BRANCH" | "PERSON") =>
                        setFormData({
                          ...formData,
                          issuedToType: value,
                          branchName: value === "BRANCH" ? formData.branchName : "",
                          issuedToName:
                            value === "PERSON" ? formData.issuedToName : "",
                        })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipient type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRANCH">Branch</SelectItem>
                        <SelectItem value="PERSON">Person</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="branchName">Branch *</Label>
                    <Input
                      id="branchName"
                      value={formData.branchName}
                      onChange={(e) =>
                        setFormData({ ...formData, branchName: e.target.value })
                      }
                      placeholder="Enter branch name"
                      required
                    />
                  </div>
                )}

                {mode === "CARDS" && formData.issuedToType === "BRANCH" && (
                  <div className="space-y-2">
                    <Label htmlFor="branchName">Branch *</Label>
                    <Input
                      id="branchName"
                      value={formData.branchName}
                      onChange={(e) =>
                        setFormData({ ...formData, branchName: e.target.value })
                      }
                      placeholder="Enter branch name"
                      required
                    />
                  </div>
                )}

                {mode === "CARDS" && formData.issuedToType === "PERSON" && (
                  <div className="space-y-2">
                    <Label htmlFor="issuedToName">Recipient Name *</Label>
                    <Input
                      id="issuedToName"
                      value={formData.issuedToName}
                      onChange={(e) =>
                        setFormData({ ...formData, issuedToName: e.target.value })
                      }
                      placeholder="Enter recipient name"
                      required
                    />
                  </div>
                )}

              </div>

            <div className="space-y-2">
              <Label htmlFor="batchId">Batch *</Label>
              <Select
                value={formData.batchId}
                onValueChange={(value) =>
                  setFormData({ ...formData, batchId: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      No available batches
                    </SelectItem>
                  ) : (
                    batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id.toString()}>
                        {batch.batchCode} • {batch.availableQty} available
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Optional notes"
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
                disabled={issueMutation.isPending}
              >
                {issueMutation.isPending ? "Issuing..." : copy.issueTitle}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
