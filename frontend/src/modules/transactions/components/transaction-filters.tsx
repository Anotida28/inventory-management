"use client";

import { Button } from "components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import type { TransactionFilters } from "modules/transactions/lib/filters";

type FilterOption = {
  value: string;
  label: string;
};

type TransactionFiltersProps = {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
  defaultFilters: TransactionFilters;
  typeOptions: FilterOption[];
  cardTypeOptions: FilterOption[];
  allTypeValue: string;
  allCardTypeValue: string;
};

export default function TransactionFiltersPanel({
  filters,
  onChange,
  defaultFilters,
  typeOptions,
  cardTypeOptions,
  allTypeValue,
  allCardTypeValue,
}: TransactionFiltersProps) {
  const updateFilters = (patch: Partial<TransactionFilters>) => {
    onChange({ ...filters, ...patch, page: 1 });
  };

  const handleTypeChange = (value: string) => {
    updateFilters({ type: value === allTypeValue ? "" : value });
  };

  const handleCardTypeChange = (value: string) => {
    updateFilters({ cardTypeId: value === allCardTypeValue ? "" : value });
  };

  const handleClear = () => {
    onChange({ ...defaultFilters });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <Select
              value={filters.type || allTypeValue}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Card Type</Label>
            <Select
              value={filters.cardTypeId || allCardTypeValue}
              onValueChange={handleCardTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All card types" />
              </SelectTrigger>
              <SelectContent>
                {cardTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilters({ startDate: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => updateFilters({ endDate: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={handleClear}>
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
