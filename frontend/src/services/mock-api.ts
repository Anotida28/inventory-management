type UserRole = "ADMIN" | "CLERK" | "AUDITOR" | "FINANCE";
type TransactionType = "RECEIVE" | "ISSUE" | "REVERSAL";
type TransactionStatus = "COMPLETED" | "REVERSED";
type IssuedToType = "BRANCH" | "PERSON";

type CardType = {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
};

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string | null;
};

type Batch = {
  id: number;
  cardTypeId: number;
  batchCode: string;
  qtyReceived: number;
  qtyIssued: number;
  receivedAt: string;
  notes?: string | null;
};

type Attachment = {
  fileName: string;
  fileUrl: string;
  mimeType?: string;
  uploadedAt: string;
  uploadedBy: number;
};

type Transaction = {
  id: number;
  type: TransactionType;
  cardTypeId: number;
  qty: number;
  createdAt: string;
  createdById: number;
  status: TransactionStatus;
  issuedToType?: IssuedToType;
  issuedToName?: string;
  batchId?: number | null;
  notes?: string | null;
  unitCost?: number | null;
  totalCost?: number | null;
  unitPrice?: number | null;
  totalPrice?: number | null;
  attachments?: Attachment[];
};

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const state = {
  cardTypes: [
    {
      id: 1,
      name: "Visa Classic",
      code: "VISA-STD",
      description: "Standard Visa issuance stock",
      isActive: true,
    },
    {
      id: 2,
      name: "Visa Premium",
      code: "VISA-PRM",
      description: "Premium Visa card program",
      isActive: true,
    },
    {
      id: 3,
      name: "Mastercard Business",
      code: "MC-BIZ",
      description: "Commercial Mastercard program",
      isActive: false,
    },
  ] as CardType[],
  users: [
    {
      id: 1,
      firstName: "System",
      lastName: "Administrator",
      email: "admin@omacard.internal",
      username: "admin",
      role: "ADMIN",
      isActive: true,
      lastLoginAt: daysAgo(1),
    },
    {
      id: 2,
      firstName: "Nia",
      lastName: "Obi",
      email: "nia.obi@omacard.internal",
      username: "nobi",
      role: "CLERK",
      isActive: true,
      lastLoginAt: daysAgo(3),
    },
    {
      id: 3,
      firstName: "Ibrahim",
      lastName: "Toure",
      email: "ibrahim.toure@omacard.internal",
      username: "itoure",
      role: "FINANCE",
      isActive: true,
      lastLoginAt: daysAgo(2),
    },
  ] as User[],
  batches: [
    {
      id: 1,
      cardTypeId: 1,
      batchCode: "BATCH-ALPHA",
      qtyReceived: 1200,
      qtyIssued: 320,
      receivedAt: daysAgo(18),
      notes: "Initial receipt",
    },
    {
      id: 2,
      cardTypeId: 2,
      batchCode: "BATCH-BRAVO",
      qtyReceived: 800,
      qtyIssued: 150,
      receivedAt: daysAgo(25),
      notes: "Premium inventory load",
    },
    {
      id: 3,
      cardTypeId: 3,
      batchCode: "BATCH-CHARLIE",
      qtyReceived: 400,
      qtyIssued: 120,
      receivedAt: daysAgo(40),
      notes: "Business program batch",
    },
  ] as Batch[],
  transactions: [
    {
      id: 1,
      type: "RECEIVE",
      cardTypeId: 1,
      qty: 1200,
      createdAt: daysAgo(18),
      createdById: 1,
      status: "COMPLETED",
      batchId: 1,
      unitCost: 2.25,
      totalCost: 2700,
      notes: "Initial Visa Classic stock",
    },
    {
      id: 2,
      type: "ISSUE",
      cardTypeId: 1,
      qty: 320,
      createdAt: daysAgo(10),
      createdById: 2,
      status: "COMPLETED",
      issuedToType: "BRANCH",
      issuedToName: "Main Branch",
      batchId: 1,
      unitPrice: 4.5,
      totalPrice: 1440,
      notes: "Quarterly branch issue",
    },
    {
      // Adjustment transaction removed
    },
    {
      id: 4,
      type: "RECEIVE",
      cardTypeId: 2,
      qty: 800,
      createdAt: daysAgo(25),
      createdById: 1,
      status: "COMPLETED",
      batchId: 2,
      unitCost: 3.1,
      totalCost: 2480,
      notes: "Premium batch replenishment",
    },
    {
      id: 5,
      type: "ISSUE",
      cardTypeId: 2,
      qty: 150,
      createdAt: daysAgo(3),
      createdById: 3,
      status: "COMPLETED",
      issuedToType: "PERSON",
      issuedToName: "Regional Manager",
      batchId: 2,
      unitPrice: 5.2,
      totalPrice: 780,
      notes: "Executive allocation",
    },
    {
      id: 6,
      type: "RECEIVE",
      cardTypeId: 3,
      qty: 400,
      createdAt: daysAgo(40),
      createdById: 1,
      status: "COMPLETED",
      batchId: 3,
      unitCost: 2.9,
      totalCost: 1160,
      notes: "Business program first shipment",
    },
    {
      id: 7,
      type: "ISSUE",
      cardTypeId: 3,
      qty: 120,
      createdAt: daysAgo(15),
      createdById: 2,
      status: "COMPLETED",
      issuedToType: "BRANCH",
      issuedToName: "Enterprise Desk",
      batchId: 3,
      unitPrice: 4.9,
      totalPrice: 588,
      notes: "Business pilot allocation",
    },
  ] as Transaction[],
  nextIds: {
    cardType: 4,
    user: 4,
    batch: 4,
    transaction: 8,
  },
};

const getCardType = (id: number) =>
  state.cardTypes.find((cardType) => cardType.id === id) || null;

const getUser = (id: number) =>
  state.users.find((user) => user.id === id) || null;

const getBatch = (id: number) =>
  state.batches.find((batch) => batch.id === id) || null;

const getBatchAvailableQty = (batch: Batch) =>
  Math.max(batch.qtyReceived - batch.qtyIssued, 0);

const hydrateTransaction = (transaction: Transaction) => {
  const cardType = getCardType(transaction.cardTypeId);
  const createdBy = getUser(transaction.createdById);
  const batch = transaction.batchId ? getBatch(transaction.batchId) : null;

  return {
    ...transaction,
    cardType: cardType
      ? { id: cardType.id, name: cardType.name, code: cardType.code, isActive: cardType.isActive }
      : { id: transaction.cardTypeId, name: "Unknown", code: "UNKNOWN", isActive: false },
    createdBy: createdBy
      ? {
          id: createdBy.id,
          firstName: createdBy.firstName,
          lastName: createdBy.lastName,
          email: createdBy.email,
          role: createdBy.role,
        }
      : null,
    batch: batch
      ? {
          id: batch.id,
          cardTypeId: batch.cardTypeId,
          batchCode: batch.batchCode,
          qtyReceived: batch.qtyReceived,
          qtyIssued: batch.qtyIssued,
          availableQty: getBatchAvailableQty(batch),
          receivedAt: batch.receivedAt,
          notes: batch.notes ?? null,
        }
      : null,
  };
};

const parseDateParam = (value: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    date.setHours(23, 59, 59, 999);
  }
  return date;
};

const filterTransactions = (params: URLSearchParams, type?: TransactionType) => {
  const typeFilter = params.get("type") || (type ?? "");
  const cardTypeId = params.get("cardTypeId");
  const startDateValue = params.get("startDate");
  const endDateValue = params.get("endDate");
  const startDate = startDateValue ? new Date(startDateValue) : null;
  const endDate = parseDateParam(endDateValue);

  return state.transactions.filter((transaction) => {
    if (typeFilter && transaction.type !== typeFilter) return false;
    if (cardTypeId && transaction.cardTypeId !== Number(cardTypeId)) return false;

    const createdAt = new Date(transaction.createdAt);
    if (startDate && createdAt < startDate) return false;
    if (endDate && createdAt > endDate) return false;

    return true;
  });
};

const computeBalances = () => {
  const balances = new Map<number, { balance: number; lastUpdatedAt: string | null }>();
  state.cardTypes.forEach((cardType) => {
    balances.set(cardType.id, { balance: 0, lastUpdatedAt: null });
  });

  const sorted = [...state.transactions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  sorted.forEach((transaction) => {
    const entry = balances.get(transaction.cardTypeId);
    if (!entry) return;
    let delta = 0;
    if (transaction.type === "RECEIVE") delta = transaction.qty;
    if (transaction.type === "ISSUE") delta = -transaction.qty;
    // Adjustment logic removed
    entry.balance += delta;
    entry.lastUpdatedAt = transaction.createdAt;
  });

  return balances;
};

const createAttachmentsFromFormData = (files: File[], uploadedBy: number) =>
  files.map((file) => ({
    fileName: file.name,
    fileUrl:
      typeof URL !== "undefined" && "createObjectURL" in URL
        ? URL.createObjectURL(file)
        : "#",
    mimeType: file.type,
    uploadedAt: new Date().toISOString(),
    uploadedBy,
  }));

const parseJsonBody = (options: RequestInit) => {
  if (!options.body || typeof options.body !== "string") return undefined;
  try {
    return JSON.parse(options.body);
  } catch {
    return undefined;
  }
};

const requireCardType = (cardTypeId: number) => {
  const cardType = getCardType(cardTypeId);
  if (!cardType) {
    throw new Error("Card type not found");
  }
  return cardType;
};

const ensureNumber = (value: FormDataEntryValue | null, field: string) => {
  const numeric = typeof value === "string" ? Number(value) : Number(value);
  if (!Number.isFinite(numeric)) {
    throw new Error(`Invalid ${field}`);
  }
  return numeric;
};

const getAvailableBatch = (cardTypeId: number, qty: number) => {
  const batches = state.batches
    .filter((batch) => batch.cardTypeId === cardTypeId)
    .sort(
      (a, b) =>
        new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime(),
    );

  return batches.find((batch) => getBatchAvailableQty(batch) >= qty) || null;
};

export async function handleMockApiRequest(
  endpoint: string,
  options: RequestInit = {},
) {
  const method = (options.method || "GET").toUpperCase();
  const [path, queryString] = endpoint.split("?");
  const params = new URLSearchParams(queryString || "");
  const body = parseJsonBody(options) || {};

  if (path === "/api/health") {
    return { status: "ok", mode: "frontend-only" };
  }

  if (path === "/api/card-types" && method === "GET") {
    const includeInactive = params.get("includeInactive") === "true";
    const cardTypes = includeInactive
      ? state.cardTypes
      : state.cardTypes.filter((cardType) => cardType.isActive);
    return { cardTypes };
  }

  if (path === "/api/card-types" && method === "POST") {
    const newCardType: CardType = {
      id: state.nextIds.cardType++,
      name: String(body.name || "New Card Type"),
      code: String(body.code || "NEW"),
      description: body.description ? String(body.description) : null,
      isActive: true,
    };
    state.cardTypes.push(newCardType);
    return newCardType;
  }

  const cardTypeMatch = path.match(/^\/api\/card-types\/(\d+)$/);
  if (cardTypeMatch && method === "PATCH") {
    const id = Number(cardTypeMatch[1]);
    const cardType = requireCardType(id);
    cardType.name = body.name ? String(body.name) : cardType.name;
    cardType.code = body.code ? String(body.code) : cardType.code;
    cardType.description =
      body.description !== undefined ? String(body.description || "") : cardType.description;
    if (typeof body.isActive === "boolean") {
      cardType.isActive = body.isActive;
    }
    return cardType;
  }

  if (path === "/api/admin/users" && method === "GET") {
    return { users: state.users };
  }

  if (path === "/api/admin/users" && method === "POST") {
    const newUser: User = {
      id: state.nextIds.user++,
      firstName: String(body.firstName || "New"),
      lastName: String(body.lastName || "User"),
      email: String(body.email || "new.user@omacard.internal"),
      username: String(body.username || `user${state.nextIds.user}`),
      role: (body.role as UserRole) || "CLERK",
      isActive: true,
      lastLoginAt: null,
    };
    state.users.push(newUser);
    return newUser;
  }

  const userMatch = path.match(/^\/api\/admin\/users\/(\d+)$/);
  if (userMatch && method === "PATCH") {
    const id = Number(userMatch[1]);
    const user = state.users.find((candidate) => candidate.id === id);
    if (!user) throw new Error("User not found");
    user.firstName = body.firstName ? String(body.firstName) : user.firstName;
    user.lastName = body.lastName ? String(body.lastName) : user.lastName;
    user.email = body.email ? String(body.email) : user.email;
    user.username = body.username ? String(body.username) : user.username;
    user.role = (body.role as UserRole) || user.role;
    return user;
  }

  const userStatusMatch = path.match(/^\/api\/admin\/users\/(\d+)\/status$/);
  if (userStatusMatch && method === "PATCH") {
    const id = Number(userStatusMatch[1]);
    const user = state.users.find((candidate) => candidate.id === id);
    if (!user) throw new Error("User not found");
    user.isActive = Boolean(body.isActive);
    return user;
  }

  const userResetMatch = path.match(
    /^\/api\/admin\/users\/(\d+)\/reset-password$/,
  );
  if (userResetMatch && method === "PATCH") {
    const id = Number(userResetMatch[1]);
    const user = state.users.find((candidate) => candidate.id === id);
    if (!user) throw new Error("User not found");
    return { success: true, id };
  }

  if (path === "/api/reports/stock-balance" && method === "GET") {
    const balances = computeBalances();
    return state.cardTypes.map((cardType) => {
      const entry = balances.get(cardType.id);
      return {
        id: cardType.id,
        cardType,
        balance: entry?.balance ?? 0,
        lastUpdatedAt: entry?.lastUpdatedAt ?? new Date().toISOString(),
      };
    });
  }

  if (path === "/api/transactions" && method === "GET") {
    const filtered = filterTransactions(params);
    const page = Number(params.get("page") || 1);
    const limit = Number(params.get("limit") || 20);
    const total = filtered.length;
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    const start = (page - 1) * limit;
    const end = start + limit;
    const transactions = filtered
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(start, end)
      .map(hydrateTransaction);

    return {
      transactions,
      pagination: { page, limit, total, totalPages },
    };
  }

  const transactionMatch = path.match(/^\/api\/transactions\/(\d+)$/);
  if (transactionMatch && method === "GET") {
    const id = Number(transactionMatch[1]);
    const transaction = state.transactions.find((candidate) => candidate.id === id);
    if (!transaction) throw new Error("Transaction not found");
    return hydrateTransaction(transaction);
  }

  if (transactionMatch && method === "PATCH") {
    const id = Number(transactionMatch[1]);
    const transaction = state.transactions.find((candidate) => candidate.id === id);
    if (!transaction) throw new Error("Transaction not found");

    if (body.unitCost !== undefined) {
      transaction.unitCost =
        body.unitCost === null || body.unitCost === "" ? null : Number(body.unitCost);
    }
    if (body.totalCost !== undefined) {
      transaction.totalCost =
        body.totalCost === null || body.totalCost === "" ? null : Number(body.totalCost);
    }
    if (body.unitPrice !== undefined) {
      transaction.unitPrice =
        body.unitPrice === null || body.unitPrice === "" ? null : Number(body.unitPrice);
    }
    if (body.totalPrice !== undefined) {
      transaction.totalPrice =
        body.totalPrice === null || body.totalPrice === "" ? null : Number(body.totalPrice);
    }

    return hydrateTransaction(transaction);
  }

  if (path === "/api/reports/issues" && method === "GET") {
    const issues = filterTransactions(params, "ISSUE");
    const summary = {
      totalQty: issues.reduce((sum, txn) => sum + txn.qty, 0),
      totalCount: issues.length,
      byCardType: [] as Array<{ cardType: CardType; totalQty: number; totalCount: number }>,
    };

    const byCardType = new Map<number, { totalQty: number; totalCount: number }>();
    issues.forEach((txn) => {
      const current = byCardType.get(txn.cardTypeId) || { totalQty: 0, totalCount: 0 };
      current.totalQty += txn.qty;
      current.totalCount += 1;
      byCardType.set(txn.cardTypeId, current);
    });

    summary.byCardType = Array.from(byCardType.entries()).map(([cardTypeId, totals]) => {
      return {
        cardType: requireCardType(cardTypeId),
        totalQty: totals.totalQty,
        totalCount: totals.totalCount,
      };
    });

    return {
      summary,
      issues: issues
        .sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .map(hydrateTransaction),
    };
  }

  if (path === "/api/reports/receipts" && method === "GET") {
    const receipts = filterTransactions(params, "RECEIVE");
    const summary = {
      totalQty: receipts.reduce((sum, txn) => sum + txn.qty, 0),
      totalCount: receipts.length,
      byCardType: [] as Array<{ cardType: CardType; totalQty: number; totalCount: number }>,
    };

    const byCardType = new Map<number, { totalQty: number; totalCount: number }>();
    receipts.forEach((txn) => {
      const current = byCardType.get(txn.cardTypeId) || { totalQty: 0, totalCount: 0 };
      current.totalQty += txn.qty;
      current.totalCount += 1;
      byCardType.set(txn.cardTypeId, current);
    });

    summary.byCardType = Array.from(byCardType.entries()).map(([cardTypeId, totals]) => ({
      cardType: requireCardType(cardTypeId),
      totalQty: totals.totalQty,
      totalCount: totals.totalCount,
    }));

    return {
      summary,
      receipts: receipts
        .sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .map(hydrateTransaction),
    };
  }

  // Adjustments report endpoint removed

  if (path === "/api/reports/user-activity" && method === "GET") {
    const transactions = filterTransactions(params);
    const byUser = new Map<
      number,
      { user: User; transactions: ReturnType<typeof hydrateTransaction>[]; counts: Record<string, number> }
    >();

    transactions.forEach((transaction) => {
      const user = getUser(transaction.createdById);
      if (!user) return;
      if (!byUser.has(user.id)) {
        byUser.set(user.id, {
          user,
          transactions: [],
          counts: {},
        });
      }
      const entry = byUser.get(user.id);
      if (!entry) return;
      entry.transactions.push(hydrateTransaction(transaction));
      entry.counts[transaction.type] = (entry.counts[transaction.type] || 0) + 1;
    });

    const hydratedTransactions = transactions
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .map(hydrateTransaction);

    return {
      summary: {
        totalTransactions: transactions.length,
        uniqueUsers: byUser.size,
      },
      byUser: Array.from(byUser.values()),
      transactions: hydratedTransactions,
    };
  }

  if (path === "/api/inventory/batches" && method === "GET") {
    const cardTypeId = Number(params.get("cardTypeId"));
    if (!Number.isFinite(cardTypeId)) {
      return { batches: [] };
    }
    const batches = state.batches
      .filter((batch) => batch.cardTypeId === cardTypeId)
      .map((batch) => ({
        ...batch,
        availableQty: getBatchAvailableQty(batch),
      }))
      .filter((batch) => batch.availableQty > 0);
    return { batches };
  }

  if (path === "/api/reports/finance" && method === "GET") {
    const cardTypeId = params.get("cardTypeId");
    const scopeParams = new URLSearchParams(params.toString());
    if (cardTypeId) {
      scopeParams.set("cardTypeId", cardTypeId);
    }
    const scopedTransactions = filterTransactions(scopeParams);
    const balances = computeBalances();

    const byCardType = state.cardTypes
      .filter((cardType) => (!cardTypeId ? true : cardType.id === Number(cardTypeId)))
      .map((cardType) => {
        const cardTransactions = scopedTransactions.filter(
          (txn) => txn.cardTypeId === cardType.id,
        );
        const receives = cardTransactions.filter((txn) => txn.type === "RECEIVE");
        const issues = cardTransactions.filter((txn) => txn.type === "ISSUE");

        const receivedQty = receives.reduce((sum, txn) => sum + txn.qty, 0);
        const receivedCost = receives.reduce((sum, txn) => {
          if (txn.totalCost != null) return sum + txn.totalCost;
          if (txn.unitCost != null) return sum + txn.unitCost * txn.qty;
          return sum;
        }, 0);
        const issuedQty = issues.reduce((sum, txn) => sum + txn.qty, 0);
        const issuedRevenue = issues.reduce((sum, txn) => {
          if (txn.totalPrice != null) return sum + txn.totalPrice;
          if (txn.unitPrice != null) return sum + txn.unitPrice * txn.qty;
          return sum;
        }, 0);

        const avgUnitCost = receivedQty ? receivedCost / receivedQty : 0;
        const avgUnitPrice = issuedQty ? issuedRevenue / issuedQty : 0;
        const balance = balances.get(cardType.id)?.balance ?? 0;
        const inventoryValue = balance * avgUnitCost;

        return {
          cardType: { id: cardType.id, name: cardType.name, code: cardType.code },
          receivedQty,
          receivedCost,
          issuedQty,
          issuedRevenue,
          balance,
          avgUnitCost,
          avgUnitPrice,
          profit: issuedRevenue - receivedCost,
          inventoryValue,
        };
      });

    const totals = byCardType.reduce(
      (acc, item) => {
        acc.totalReceivedQty += item.receivedQty;
        acc.totalReceivedCost += item.receivedCost;
        acc.totalIssuedQty += item.issuedQty;
        acc.totalIssuedRevenue += item.issuedRevenue;
        acc.outstandingInventoryQty += item.balance;
        acc.estimatedInventoryValue += item.inventoryValue;
        return acc;
      },
      {
        totalReceivedQty: 0,
        totalReceivedCost: 0,
        totalIssuedQty: 0,
        totalIssuedRevenue: 0,
        outstandingInventoryQty: 0,
        estimatedInventoryValue: 0,
      },
    );

    const avgReceiveCost = totals.totalReceivedQty
      ? totals.totalReceivedCost / totals.totalReceivedQty
      : 0;
    const avgIssuePrice = totals.totalIssuedQty
      ? totals.totalIssuedRevenue / totals.totalIssuedQty
      : 0;
    const estimatedProfit = totals.totalIssuedRevenue - totals.totalReceivedCost;
    const profitMargin = totals.totalIssuedRevenue
      ? (estimatedProfit / totals.totalIssuedRevenue) * 100
      : 0;

    const chartBuckets = new Map<string, { cost: number; revenue: number; profit: number }>();
    scopedTransactions.forEach((txn) => {
      const date = new Date(txn.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!chartBuckets.has(key)) {
        chartBuckets.set(key, { cost: 0, revenue: 0, profit: 0 });
      }
      const bucket = chartBuckets.get(key);
      if (!bucket) return;
      if (txn.type === "RECEIVE") {
        const cost = txn.totalCost ?? (txn.unitCost != null ? txn.unitCost * txn.qty : 0);
        bucket.cost += cost;
        bucket.profit -= cost;
      }
      if (txn.type === "ISSUE") {
        const revenue = txn.totalPrice ?? (txn.unitPrice != null ? txn.unitPrice * txn.qty : 0);
        bucket.revenue += revenue;
        bucket.profit += revenue;
      }
    });

    const chartData = Array.from(chartBuckets.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, values]) => ({
        month,
        cost: values.cost,
        revenue: values.revenue,
        profit: values.profit,
      }))
      .slice(-6);

    const receipts = scopedTransactions
      .filter((txn) => txn.type === "RECEIVE")
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5)
      .map((txn) => {
        const hydrated = hydrateTransaction(txn);
        return {
          id: hydrated.id,
          type: "RECEIVE" as const,
          cardType: hydrated.cardType,
          qty: hydrated.qty,
          unitCost: hydrated.unitCost ?? null,
          totalCost: hydrated.totalCost ?? null,
          calculatedTotalCost:
            hydrated.totalCost ??
            (hydrated.unitCost != null ? hydrated.unitCost * hydrated.qty : 0),
          createdAt: hydrated.createdAt,
        };
      });

    const issues = scopedTransactions
      .filter((txn) => txn.type === "ISSUE")
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5)
      .map((txn) => {
        const hydrated = hydrateTransaction(txn);
        return {
          id: hydrated.id,
          type: "ISSUE" as const,
          cardType: hydrated.cardType,
          qty: hydrated.qty,
          unitPrice: hydrated.unitPrice ?? null,
          totalPrice: hydrated.totalPrice ?? null,
          calculatedTotalPrice:
            hydrated.totalPrice ??
            (hydrated.unitPrice != null ? hydrated.unitPrice * hydrated.qty : 0),
          createdAt: hydrated.createdAt,
        };
      });

    return {
      totals: {
        ...totals,
        avgReceiveCost,
        avgIssuePrice,
        estimatedProfit,
        profitMargin,
      },
      byCardType,
      chartData,
      recent: {
        receipts,
        issues,
      },
    };
  }

  throw new Error(`Unsupported endpoint: ${method} ${path}`);
}

export async function handleMockFormData(endpoint: string, formData: FormData) {
  const [path] = endpoint.split("?");
  const userId = 1;

  if (path === "/api/inventory/receive") {
    const cardTypeId = ensureNumber(formData.get("cardTypeId"), "cardTypeId");
    const qtyReceived = ensureNumber(formData.get("qtyReceived"), "qtyReceived");
    requireCardType(cardTypeId);
    const batchCode = String(formData.get("batchCode") || `BATCH-${state.nextIds.batch}`);
    const receivedAt = formData.get("receivedAt")
      ? new Date(String(formData.get("receivedAt"))).toISOString()
      : new Date().toISOString();
    const notes = formData.get("notes") ? String(formData.get("notes")) : null;
    const unitCost =
      formData.get("unitCost") && String(formData.get("unitCost")).length > 0
        ? Number(formData.get("unitCost"))
        : null;
    const totalCost =
      formData.get("totalCost") && String(formData.get("totalCost")).length > 0
        ? Number(formData.get("totalCost"))
        : null;

    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File);

    const batch: Batch = {
      id: state.nextIds.batch++,
      cardTypeId,
      batchCode,
      qtyReceived,
      qtyIssued: 0,
      receivedAt,
      notes,
    };
    state.batches.push(batch);

    const transaction: Transaction = {
      id: state.nextIds.transaction++,
      type: "RECEIVE",
      cardTypeId,
      qty: qtyReceived,
      createdAt: receivedAt,
      createdById: userId,
      status: "COMPLETED",
      batchId: batch.id,
      notes,
      unitCost,
      totalCost,
      attachments: files.length
        ? createAttachmentsFromFormData(files, userId)
        : [],
    };
    state.transactions.push(transaction);
    return hydrateTransaction(transaction);
  }

  if (path === "/api/inventory/issue") {
    const cardTypeId = ensureNumber(formData.get("cardTypeId"), "cardTypeId");
    const qty = ensureNumber(formData.get("qty"), "qty");
    requireCardType(cardTypeId);
    const issuedToType = String(formData.get("issuedToType") || "BRANCH") as IssuedToType;
    const issuedToName = String(formData.get("issuedToName") || "Recipient");
    const notes = formData.get("notes") ? String(formData.get("notes")) : null;
    const unitPrice =
      formData.get("unitPrice") && String(formData.get("unitPrice")).length > 0
        ? Number(formData.get("unitPrice"))
        : null;
    const totalPrice =
      formData.get("totalPrice") && String(formData.get("totalPrice")).length > 0
        ? Number(formData.get("totalPrice"))
        : null;

    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File);

    const batchIdValue = formData.get("batchId");
    let batch: Batch | null = null;
    if (batchIdValue && String(batchIdValue).length > 0) {
      batch = getBatch(Number(batchIdValue));
    } else {
      batch = getAvailableBatch(cardTypeId, qty);
    }

    if (!batch) {
      throw new Error("No available batch for this card type");
    }

    if (getBatchAvailableQty(batch) < qty) {
      throw new Error("Insufficient batch inventory");
    }

    batch.qtyIssued += qty;

    const transaction: Transaction = {
      id: state.nextIds.transaction++,
      type: "ISSUE",
      cardTypeId,
      qty,
      createdAt: new Date().toISOString(),
      createdById: userId,
      status: "COMPLETED",
      issuedToType,
      issuedToName,
      batchId: batch.id,
      notes,
      unitPrice,
      totalPrice,
      attachments: files.length
        ? createAttachmentsFromFormData(files, userId)
        : [],
    };
    state.transactions.push(transaction);
    return hydrateTransaction(transaction);
  }

  // Adjustments inventory endpoint removed

  throw new Error(`Unsupported form endpoint: ${path}`);
}
