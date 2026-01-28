"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useSystemMode } from "lib/system-mode";

interface ItemType {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export default function ItemTypesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [itemTypesPage, setItemTypesPage] = useState(1);
  const ITEM_TYPES_PAGE_SIZE = 10;
  const [editingItemType, setEditingItemType] = useState<ItemType | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mode } = useSystemMode();
  
  const canManage = true;

  const { data: itemTypes = [], isLoading } = useQuery<ItemType[]>({
    queryKey: ["item-types", mode],
    queryFn: async () => {
      const response = await apiRequest<{ itemTypes: ItemType[] }>(
        "/api/item-types?includeInactive=true",
      );
      return response.itemTypes;
    },
  });

  const { totalCount, activeCount, inactiveCount, activeRatio } =
    useMemo(() => {
      const active = itemTypes.filter((itemType) => itemType.isActive).length;
      return {
        totalCount: itemTypes.length,
        activeCount: active,
        inactiveCount: Math.max(itemTypes.length - active, 0),
        activeRatio:
          itemTypes.length === 0
            ? 0
            : Math.round((active / itemTypes.length) * 100),
      };
    }, [itemTypes]);

  const createMutation = useMutation({
    mutationFn: (data: Partial<ItemType>) =>
      apiRequest("/api/item-types", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-types"] });
      setIsCreateOpen(false);
      toast({
        title: "Item type created",
        description: "The item type is now available for use.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Unable to create item type",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ItemType> }) =>
      apiRequest(`/api/item-types/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-types"] });
      setIsEditOpen(false);
      setEditingItemType(null);
      toast({
        title: "Item type updated",
        description: "Changes saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Unable to update item type",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      apiRequest(`/api/item-types/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-types"] });
      toast({
        title: "Status changed",
        description: "Item type availability updated.",
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

  const filteredItemTypes = useMemo(() => {
    if (!searchTerm) return itemTypes;
    const term = searchTerm.toLowerCase();
    return itemTypes.filter((type) =>
      [type.code, type.name, type.description || ""].some((field) =>
        field.toLowerCase().includes(term),
      ),
    );
  }, [itemTypes, searchTerm]);

  useEffect(() => {
    setItemTypesPage(1);
  }, [searchTerm, mode]);

  const totalItemTypes = filteredItemTypes.length;
  const totalItemTypePages = Math.max(
    Math.ceil(totalItemTypes / ITEM_TYPES_PAGE_SIZE),
    1,
  );
  const clampedItemTypesPage = Math.min(itemTypesPage, totalItemTypePages);
  const pagedItemTypes = filteredItemTypes.slice(
    (clampedItemTypesPage - 1) * ITEM_TYPES_PAGE_SIZE,
    clampedItemTypesPage * ITEM_TYPES_PAGE_SIZE,
  );

  useEffect(() => {
    if (itemTypesPage > totalItemTypePages) {
      setItemTypesPage(totalItemTypePages);
    }
  }, [itemTypesPage, totalItemTypePages]);

  const handleEdit = (itemType: ItemType) => {
    if (!canManage) return;
    setEditingItemType(itemType);
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
    if (!editingItemType) return;
    if (!canManage) return;
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: editingItemType.id,
      data: {
        name: String(formData.get("name") || ""),
        code: String(formData.get("code") || ""),
        description: formData.get("description")
          ? String(formData.get("description"))
          : undefined,
      },
    });
  };

  const exportItemTypes = () => {
    if (filteredItemTypes.length === 0) {
      toast({
        title: "Nothing to export",
        description: "Adjust your filters or add item types before exporting.",
      });
      return;
    }
    // Basic CSV serialization to support ad-hoc reporting downloads.
    const payload = filteredItemTypes.map((type) => ({
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
    link.download = `item-types-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Item Type Catalogue"
        description={
          canManage
            ? "Configure inventory items and control their availability for issuance."
            : "View the registered item types. Editing is limited to clerks and administrators."
        }
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={exportItemTypes}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            {canManage && (
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                New Item Type
              </Button>
            )}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total item types"
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
              Registered Item Types
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Track and manage the catalogue of stock-managed items.
            </p>
          </div>
          <div className="flex w-full gap-3 md:w-40">
            <Input
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-9 w-full bg-background"
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
                      Loading item types...
                    </TableCell>
                  </TableRow>
                ) : totalItemTypes === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-sm text-muted-foreground"
                    >
                      No item types matched your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedItemTypes.map((itemType) => (
                    <TableRow key={itemType.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-500/10">
                      <TableCell className="font-semibold text-foreground">
                        {itemType.code}
                      </TableCell>
                      <TableCell className="text-foreground/80">
                        {itemType.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {itemType.description ? (
                          itemType.description
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={itemType.isActive ? "default" : "secondary"}
                        >
                          {itemType.isActive ? "Active" : "Inactive"}
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
                                id: itemType.id,
                                isActive: !itemType.isActive,
                              })
                            }
                            disabled={
                              !canManage || toggleActiveMutation.isPending
                            }
                            aria-label={
                              itemType.isActive
                                ? "Deactivate item type"
                                : "Activate item type"
                            }
                          >
                            {itemType.isActive ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(itemType)}
                            disabled={!canManage}
                            aria-label="Edit item type"
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
          {totalItemTypes > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(clampedItemTypesPage - 1) * ITEM_TYPES_PAGE_SIZE + 1} to{" "}
                {Math.min(
                  clampedItemTypesPage * ITEM_TYPES_PAGE_SIZE,
                  totalItemTypes,
                )}{" "}
                of {totalItemTypes} item types
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={clampedItemTypesPage === 1}
                  onClick={() => setItemTypesPage(clampedItemTypesPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={clampedItemTypesPage >= totalItemTypePages}
                  onClick={() => setItemTypesPage(clampedItemTypesPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen && canManage} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>New Item Type</DialogTitle>
              <DialogDescription>
                Define the metadata for the new inventory item.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="code">Item Code *</Label>
                  <Input
                    id="code"
                    name="code"
                    placeholder="e.g. ITEM-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Office Chair"
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
                  placeholder="Short summary of the item."
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
                {createMutation.isPending ? "Creating…" : "Create Item Type"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen && canManage} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Edit Item Type</DialogTitle>
              <DialogDescription>
                Update item details and availability.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-code">Item Code *</Label>
                  <Input
                    id="edit-code"
                    name="code"
                    defaultValue={editingItemType?.code ?? ""}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Display Name *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editingItemType?.name ?? ""}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingItemType?.description ?? ""}
                  rows={3}
                  placeholder="Short summary of the item."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  setEditingItemType(null);
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
