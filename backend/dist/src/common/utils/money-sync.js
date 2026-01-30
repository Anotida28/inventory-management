"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncUnitTotal = void 0;
const round = (value) => {
    if (value == null)
        return null;
    return Math.round(value * 100) / 100;
};
const syncUnitTotal = ({ qty, unit, total, changedField }) => {
    if (!Number.isFinite(qty) || qty <= 0) {
        return { unit: round(unit ?? null), total: round(total ?? null) };
    }
    let nextUnit = unit ?? null;
    let nextTotal = total ?? null;
    if (changedField === "unit") {
        nextTotal = unit != null ? unit * qty : null;
    }
    else if (changedField === "total") {
        nextUnit = total != null ? total / qty : null;
    }
    else if (changedField === "qty") {
        if (unit != null) {
            nextTotal = unit * qty;
        }
        else if (total != null) {
            nextUnit = total / qty;
        }
    }
    return { unit: round(nextUnit), total: round(nextTotal) };
};
exports.syncUnitTotal = syncUnitTotal;
