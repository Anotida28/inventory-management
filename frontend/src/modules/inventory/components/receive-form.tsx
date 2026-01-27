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

export default function ReceiveForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [formData, setFormData] = useState({
    cardTypeId: "",
    batchCode: "",
    qtyReceived: "",
    receivedAt: new Date().toISOString().split("T")[0],
    notes: "",
  });

  // Hardcoded card types
  const cardTypes = [
    { id: 1, name: "Zim-Switch", code: "ZIM-SWITCH" },
    { id: 2, name: "Visa", code: "VISA" },
  ];

  const receiveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      return apiFormData("/api/inventory/receive", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-balance"] });
      queryClient.invalidateQueries({ queryKey: ["recent-transactions"] });
      toast({ title: "Success", description: "Cards received successfully" });
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

    // Create receive transaction with files
    const submitFormData = new FormData();
    submitFormData.append("cardTypeId", formData.cardTypeId);
    submitFormData.append("batchCode", formData.batchCode);
    submitFormData.append("qtyReceived", formData.qtyReceived);
    if (formData.receivedAt) {
      const isoReceivedAt = new Date(formData.receivedAt).toISOString();
      submitFormData.append("receivedAt", isoReceivedAt);
    }
    if (formData.notes) {
      submitFormData.append("notes", formData.notes);
    }
    // Removed unitCost and totalCost from submission
    // Append files directly - the backend will handle upload
    files.forEach((fileWithMeta) => {
      submitFormData.append("files", fileWithMeta.file);
    });

    receiveMutation.mutate(submitFormData);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Receive Cards"
        description="Record a new batch of cards received"
      />

      <Card>
        <CardHeader>
          <CardTitle>Receive Card Batch</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cardTypeId">Card Type *</Label>
                <Select
                  value={formData.cardTypeId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, cardTypeId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select card type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(cardTypes) && cardTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name} ({type.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchCode">Batch Code *</Label>
                <Input
                  id="batchCode"
                  value={formData.batchCode}
                  onChange={(e) =>
                    setFormData({ ...formData, batchCode: e.target.value })
                  }
                  placeholder="e.g., BATCH-001"
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
                    setFormData({ ...formData, qtyReceived: e.target.value })
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

              {/* Unit Cost and Total Cost fields removed */}
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
                {receiveMutation.isPending ? "Receiving..." : "Receive Cards"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
