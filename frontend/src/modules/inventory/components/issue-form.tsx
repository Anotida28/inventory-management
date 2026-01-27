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

type AvailableBatch = {
  id: number;
  cardTypeId: number;
  batchCode: string;
  qtyReceived: number;
  qtyIssued: number;
  availableQty: number;
  receivedAt: string;
  notes: string | null;
};

export default function IssueForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [formData, setFormData] = useState({
    cardTypeId: "",
    qty: "",
    issuedToType: "BRANCH" as "BRANCH" | "PERSON",
    issuedToName: "",
    batchId: "",
    useFIFO: true,
    notes: "",
  });

  // Hardcoded card types
  const cardTypes = [
    { id: 1, name: "Zim-Switch", code: "ZIM-SWITCH" },
    { id: 2, name: "Visa", code: "VISA" },
  ];

  const { data: batches = [] } = useQuery({
    queryKey: ["available-batches", formData.cardTypeId],
    queryFn: async () => {
      if (!formData.cardTypeId) return [] as AvailableBatch[];
      const response = await apiRequest<{ batches: AvailableBatch[] }>(
        `/api/inventory/batches?cardTypeId=${formData.cardTypeId}`,
      );
      return response.batches;
    },
    enabled: !!formData.cardTypeId && !formData.useFIFO,
  });

  const issueMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiFormData("/api/inventory/issue", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-balance"] });
      queryClient.invalidateQueries({ queryKey: ["recent-transactions"] });
      toast({ title: "Success", description: "Cards issued successfully" });
      navigate("/dashboard");
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

    // Create issue transaction with files
    const submitFormData = new FormData();
    submitFormData.append("cardTypeId", formData.cardTypeId);
    submitFormData.append("qty", formData.qty);
    submitFormData.append("issuedToType", formData.issuedToType);
    submitFormData.append("issuedToName", formData.issuedToName);
    if (formData.batchId && !formData.useFIFO) {
      submitFormData.append("batchId", formData.batchId);
    }
    if (formData.notes) {
      submitFormData.append("notes", formData.notes);
    }
    // Removed unitPrice and totalPrice from submission
    // Append files directly - the backend will handle upload
    files.forEach((fileWithMeta) => {
      submitFormData.append("files", fileWithMeta.file);
    });

    issueMutation.mutate(submitFormData);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Issue Cards"
        description="Issue cards to branches or individuals"
      />

      <Card>
        <CardHeader>
          <CardTitle>Issue Cards</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cardTypeId">Card Type *</Label>
                  <Select
                    value={formData.cardTypeId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, cardTypeId: value, batchId: "" })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select card type" />
                    </SelectTrigger>
                    <SelectContent>
                      {cardTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name} ({type.code})
                        </SelectItem>
                      ))}
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

                <div className="space-y-2">
                  <Label htmlFor="issuedToType">Issue To *</Label>
                  <Select
                    value={formData.issuedToType}
                    onValueChange={(value: "BRANCH" | "PERSON") =>
                      setFormData({ ...formData, issuedToType: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRANCH">Branch</SelectItem>
                      <SelectItem value="PERSON">Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
                {issueMutation.isPending ? "Issuing..." : "Issue Cards"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
