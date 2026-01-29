export type SyncField = "qty" | "unit" | "total";

type SyncArgs = {
  qty: number;
  unit: number | null | undefined;
  total: number | null | undefined;
  changedField: SyncField;
};

const round = (value: number | null | undefined) => {
  if (value == null) return null;
  return Math.round(value * 100) / 100;
};

export const syncUnitTotal = ({ qty, unit, total, changedField }: SyncArgs) => {
  if (!Number.isFinite(qty) || qty <= 0) {
    return { unit: round(unit ?? null), total: round(total ?? null) };
  }

  let nextUnit = unit ?? null;
  let nextTotal = total ?? null;

  if (changedField === "unit") {
    nextTotal = unit != null ? unit * qty : null;
  } else if (changedField === "total") {
    nextUnit = total != null ? total / qty : null;
  } else if (changedField === "qty") {
    if (unit != null) {
      nextTotal = unit * qty;
    } else if (total != null) {
      nextUnit = total / qty;
    }
  }

  return { unit: round(nextUnit), total: round(nextTotal) };
};
