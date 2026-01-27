"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Download,
  Edit,
  Layers,
  PauseCircle,
  Plus,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { PageHeader } from "components/ui/page-header";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import { Textarea } from "components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { useToast } from "components/ui/toast-provider";
import { apiRequest } from "services/api";
import { StatCard } from "components/ui/stat-card";

interface CardType {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export default function CardTypesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCardType, setEditingCardType] = useState<CardType | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const canManage = true;

  const { data: cardTypes = [], isLoading } = useQuery<CardType[]>({
    queryKey: ["card-types"],
    queryFn: async () => {
      const response = await apiRequest<{ cardTypes: CardType[] }>("/api/card-types?includeInactive=true");
      return response.cardTypes;
    },
  });

  const { totalCount, activeCount, inactiveCount, activeRatio } =
    useMemo(() => {
      const active = cardTypes.filter((cardType) => cardType.isActive).length;
      return {
        totalCount: cardTypes.length,
        activeCount: active,
        inactiveCount: Math.max(cardTypes.length - active, 0),
        activeRatio:
          cardTypes.length === 0
            ? 0
            : Math.round((active / cardTypes.length) * 100),
      };
    }, [cardTypes]);

  const createMutation = useMutation({
    mutationFn: (data: Partial<CardType>) =>
      apiRequest("/api/card-types", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["card-types"] });
      setIsCreateOpen(false);
      toast({
        title: "Card type created",
        description: "The card type is now available for use.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Unable to create card type",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CardType> }) =>
      apiRequest(`/api/card-types/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["card-types"] });
      setIsEditOpen(false);
      setEditingCardType(null);
      toast({
        title: "Card type updated",
        description: "Changes saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Unable to update card type",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      apiRequest(`/api/card-types/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["card-types"] });
      toast({
        title: "Status changed",
        description: "Card type availability updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Unable to update status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredCardTypes = useMemo(() => {
    if (!searchTerm) return cardTypes;
    const term = searchTerm.toLowerCase();
    return cardTypes.filter((type) =>
      [type.code, type.name, type.description || ""].some((field) =>
        field.toLowerCase().includes(term),
      ),
    );
  }, [cardTypes, searchTerm]);

  const handleEdit = (cardType: CardType) => {
    if (!canManage) return;
    setEditingCardType(cardType);
    setIsEditOpen(true);
  };

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canManage) return;
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      name: String(formData.get("name") || ""),
      code: String(formData.get("code") || ""),
      description: formData.get("description")
        ? String(formData.get("description"))
        : undefined,
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCardType) return;
    if (!canManage) return;
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: editingCardType.id,
      data: {
        name: String(formData.get("name") || ""),
        code: String(formData.get("code") || ""),
        description: formData.get("description")
          ? String(formData.get("description"))
          : undefined,
      },
    });
  };

  const exportCardTypes = () => {
    if (filteredCardTypes.length === 0) {
      toast({
        title: "Nothing to export",
        description: "Adjust your filters or add card types before exporting.",
      });
      return;
    }
    // Basic CSV serialization to support ad-hoc reporting downloads.
    const payload = filteredCardTypes.map((type) => ({
      Code: type.code,
      Name: type.name,
      Description: type.description || "",
      Status: type.isActive ? "Active" : "Inactive",
    }));
    const csv = [
      Object.keys(payload[0] || {}).join(","),
      ...payload.map((row) =>
        Object.values(row)
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `card-types-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Card Type Catalogue"
        description={
          canManage
            ? "Configure card products and control their availability for issuance."
            : "View the registered card types. Editing is limited to clerks and administrators."
        }
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={exportCardTypes}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            {canManage && (
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                New Card Type
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total card types"
          value={totalCount}
          description="Overall catalogue footprint."
          icon={Layers}
        />
        <StatCard
          title="Active for issuance"
          value={activeCount}
          description="Currently selectable by operations."
          icon={CheckCircle2}
          trend={{
            value: `${activeRatio}% catalog`,
            isPositive: activeCount >= inactiveCount,
          }}
        />
        <StatCard
          title="Inactive"
          value={inactiveCount}
          description="Temporarily withheld from fulfilment."
          icon={PauseCircle}
        />
      </div>

      <Card className="shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.06)]">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              Registered Card Types
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Track and manage the catalogue of stock-managed card products.
            </p>
          </div>
          <div className="flex w-full gap-3 md:w-80">
            <Input
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="bg-background"
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <div className="rounded-xl border border-border/70">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <TableHead className="w-[140px]">Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[120px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      Loading card types...
                    </TableCell>
                  </TableRow>
                ) : filteredCardTypes.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No card types matched your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCardTypes.map((cardType) => (
                    <TableRow key={cardType.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-500/10">
                      <TableCell className="font-semibold text-foreground">
                        {cardType.code}
                      </TableCell>
                      <TableCell className="text-foreground/80">
                        {cardType.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {cardType.description ? (
                          cardType.description
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={cardType.isActive ? "default" : "secondary"}
                        >
                          {cardType.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              toggleActiveMutation.mutate({
                                id: cardType.id,
                                isActive: !cardType.isActive,
                              })
                            }
                            disabled={
                              !canManage || toggleActiveMutation.isPending
                            }
                            aria-label={
                              cardType.isActive
                                ? "Deactivate card type"
                                : "Activate card type"
                            }
                          >
                            {cardType.isActive ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(cardType)}
                            disabled={!canManage}
                            aria-label="Edit card type"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen && canManage} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>New Card Type</DialogTitle>
              <DialogDescription>
                Define the metadata for the new card product.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="code">Product Code *</Label>
                  <Input
                    id="code"
                    name="code"
                    placeholder="e.g. VISA-PREMIUM"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Premium Visa"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Short summary of the product."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating…" : "Create Card Type"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen && canManage} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Edit Card Type</DialogTitle>
              <DialogDescription>
                Update product details and availability.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-code">Product Code *</Label>
                  <Input
                    id="edit-code"
                    name="code"
                    defaultValue={editingCardType?.code ?? ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Display Name *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editingCardType?.name ?? ""}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingCardType?.description ?? ""}
                  rows={3}
                  placeholder="Short summary of the product."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingCardType(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
