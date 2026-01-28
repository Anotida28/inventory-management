type UserRole = "ADMIN" | "CLERK" | "AUDITOR" | "FINANCE";
type TransactionType = "RECEIVE" | "ISSUE" | "REVERSAL";
type TransactionStatus = "COMPLETED" | "REVERSED";
type IssuedToType = "BRANCH" | "PERSON";
type SystemMode = "CARDS" | "INVENTORY";

type ItemType = {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
};

type Branch = {
  id: number;
  name: string;
  code: string;
  location?: string | null;
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
  itemTypeId: number;
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
  itemTypeId: number;
  qty: number;
  createdAt: string;
  createdById: number;
  status: TransactionStatus;
  issuedToType?: IssuedToType;
  issuedToName?: string;
  issuedToBranchId?: number | null;
  batchId?: number | null;
  notes?: string | null;
  unitCost?: number | null;
  totalCost?: number | null;
  unitPrice?: number | null;
  totalPrice?: number | null;
  attachments?: Attachment[];
};

type ModeState = {
  itemTypes: ItemType[];
  batches: Batch[];
  transactions: Transaction[];
  nextIds: {
    itemType: number;
    batch: number;
    transaction: number;
  };
};

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const MODE_STORAGE_KEY = "omari.systemMode";

const getActiveMode = (): SystemMode => {
  if (typeof window === "undefined") return "CARDS";
  try {
    const globalMode = (window as unknown as Record<string, SystemMode>)[
      "__OMARI_SYSTEM_MODE"
    ];
    if (globalMode === "CARDS" || globalMode === "INVENTORY") {
      return globalMode;
    }
    const stored = window.localStorage.getItem(MODE_STORAGE_KEY);
    return stored === "INVENTORY" ? "INVENTORY" : "CARDS";
  } catch {
    return "CARDS";
  }
};

const state = {
  branches: [] as Branch[],
  users: [
    {
      id: 1,
      firstName: "System",
      lastName: "Administrator",
      email: "admin@omari.internal",
      username: "admin",
      role: "ADMIN",
      isActive: true,
      lastLoginAt: daysAgo(1),
    },
    {
      id: 2,
      firstName: "Nia",
      lastName: "Obi",
      email: "nia.obi@omari.internal",
      username: "nobi",
      role: "CLERK",
      isActive: true,
      lastLoginAt: daysAgo(3),
    },
    {
      id: 3,
      firstName: "Ibrahim",
      lastName: "Toure",
      email: "ibrahim.toure@omari.internal",
      username: "itoure",
      role: "FINANCE",
      isActive: true,
      lastLoginAt: daysAgo(2),
    },
  ] as User[],
  modes: {
    CARDS: {
      itemTypes: [
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
      ],
      batches: [
        {
          id: 1,
          itemTypeId: 1,
          batchCode: "CARD-ALPHA",
          qtyReceived: 1200,
          qtyIssued: 320,
          receivedAt: daysAgo(18),
          notes: "Initial card receipt",
        },
        {
          id: 2,
          itemTypeId: 2,
          batchCode: "CARD-BRAVO",
          qtyReceived: 800,
          qtyIssued: 150,
          receivedAt: daysAgo(25),
          notes: "Premium card inventory load",
        },
        {
          id: 3,
          itemTypeId: 3,
          batchCode: "CARD-CHARLIE",
          qtyReceived: 400,
          qtyIssued: 120,
          receivedAt: daysAgo(40),
          notes: "Business program batch",
        },
      ],
      transactions: [
        {
          id: 1,
          type: "RECEIVE",
          itemTypeId: 1,
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
          itemTypeId: 1,
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
          id: 4,
          type: "RECEIVE",
          itemTypeId: 2,
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
          itemTypeId: 2,
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
          itemTypeId: 3,
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
          itemTypeId: 3,
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
      ],
      nextIds: {
        itemType: 4,
        batch: 4,
        transaction: 8,
      },
    },
    INVENTORY: {
      itemTypes: [
        {
          id: 1,
          name: "Office Desk",
          code: "DESK-OFC",
          description: "Main office desks",
          isActive: true,
        },
        {
          id: 2,
          name: "Ergonomic Chair",
          code: "CHAIR-ERG",
          description: "Ergo seating stock",
          isActive: true,
        },
        {
          id: 3,
          name: "POS Terminal",
          code: "POS-TERM",
          description: "Point-of-sale terminals",
          isActive: true,
        },
        {
          id: 4,
          name: "LED Monitor 24in",
          code: "MON-24",
          description: "24-inch LED monitors",
          isActive: true,
        },
      ],
      batches: [
        {
          id: 1,
          itemTypeId: 1,
          batchCode: "INV-DESK-01",
          qtyReceived: 40,
          qtyIssued: 12,
          receivedAt: daysAgo(30),
          notes: "Initial desk shipment",
        },
        {
          id: 2,
          itemTypeId: 2,
          batchCode: "INV-CHAIR-01",
          qtyReceived: 100,
          qtyIssued: 60,
          receivedAt: daysAgo(45),
          notes: "Ergo chair intake",
        },
        {
          id: 3,
          itemTypeId: 3,
          batchCode: "INV-POS-01",
          qtyReceived: 25,
          qtyIssued: 10,
          receivedAt: daysAgo(20),
          notes: "POS terminals batch",
        },
        {
          id: 4,
          itemTypeId: 4,
          batchCode: "INV-MON-01",
          qtyReceived: 60,
          qtyIssued: 20,
          receivedAt: daysAgo(12),
          notes: "Monitor replenishment",
        },
      ],
      transactions: [
        {
          id: 1,
          type: "RECEIVE",
          itemTypeId: 1,
          qty: 40,
          createdAt: daysAgo(30),
          createdById: 1,
          status: "COMPLETED",
          batchId: 1,
          unitCost: 85,
          totalCost: 3400,
          notes: "Office desks intake",
        },
        {
          id: 2,
          type: "ISSUE",
          itemTypeId: 1,
          qty: 12,
          createdAt: daysAgo(14),
          createdById: 2,
          status: "COMPLETED",
          issuedToType: "BRANCH",
          issuedToName: "Bulawayo Branch",
          batchId: 1,
          unitPrice: 120,
          totalPrice: 1440,
          notes: "Front office setup",
        },
        {
          id: 3,
          type: "RECEIVE",
          itemTypeId: 2,
          qty: 100,
          createdAt: daysAgo(45),
          createdById: 1,
          status: "COMPLETED",
          batchId: 2,
          unitCost: 45,
          totalCost: 4500,
          notes: "Ergonomic chairs delivery",
        },
        {
          id: 4,
          type: "ISSUE",
          itemTypeId: 2,
          qty: 60,
          createdAt: daysAgo(20),
          createdById: 3,
          status: "COMPLETED",
          issuedToType: "BRANCH",
          issuedToName: "Harare HQ",
          batchId: 2,
          unitPrice: 65,
          totalPrice: 3900,
          notes: "Operations floor seating",
        },
        {
          id: 5,
          type: "RECEIVE",
          itemTypeId: 3,
          qty: 25,
          createdAt: daysAgo(20),
          createdById: 1,
          status: "COMPLETED",
          batchId: 3,
          unitCost: 220,
          totalCost: 5500,
          notes: "POS terminals received",
        },
        {
          id: 6,
          type: "ISSUE",
          itemTypeId: 3,
          qty: 10,
          createdAt: daysAgo(7),
          createdById: 2,
          status: "COMPLETED",
          issuedToType: "BRANCH",
          issuedToName: "Mutare Branch",
          batchId: 3,
          unitPrice: 310,
          totalPrice: 3100,
          notes: "POS rollout phase 1",
        },
        {
          id: 7,
          type: "RECEIVE",
          itemTypeId: 4,
          qty: 60,
          createdAt: daysAgo(12),
          createdById: 1,
          status: "COMPLETED",
          batchId: 4,
          unitCost: 95,
          totalCost: 5700,
          notes: "Monitor restock",
        },
        {
          id: 8,
          type: "ISSUE",
          itemTypeId: 4,
          qty: 20,
          createdAt: daysAgo(5),
          createdById: 3,
          status: "COMPLETED",
          issuedToType: "BRANCH",
          issuedToName: "Gweru Branch",
          batchId: 4,
          unitPrice: 135,
          totalPrice: 2700,
          notes: "Branch workstation upgrade",
        },
      ],
      nextIds: {
        itemType: 5,
        batch: 5,
        transaction: 9,
      },
    },
  } as Record<SystemMode, ModeState>,
  nextIds: {
    user: 4,
  },
};

const getActiveState = () => state.modes[getActiveMode()];

const getItemType = (id: number) =>
  getActiveState().itemTypes.find((itemType) => itemType.id === id) || null;

const getUser = (id: number) =>
  state.users.find((user) => user.id === id) || null;

const getBatch = (id: number) =>
  getActiveState().batches.find((batch) => batch.id === id) || null;

const getBranch = (id: number) =>
  state.branches.find((branch) => branch.id === id) || null;

const getBatchAvailableQty = (batch: Batch) =>
  Math.max(batch.qtyReceived - batch.qtyIssued, 0);

const hydrateTransaction = (transaction: Transaction) => {
  const itemType = getItemType(transaction.itemTypeId);
  const createdBy = getUser(transaction.createdById);
  const batch = transaction.batchId ? getBatch(transaction.batchId) : null;
  const branch = transaction.issuedToBranchId
    ? getBranch(transaction.issuedToBranchId)
    : null;

  return {
    ...transaction,
    itemType: itemType
      ? { id: itemType.id, name: itemType.name, code: itemType.code, isActive: itemType.isActive }
      : { id: transaction.itemTypeId, name: "Unknown", code: "UNKNOWN", isActive: false },
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
          itemTypeId: batch.itemTypeId,
          batchCode: batch.batchCode,
          qtyReceived: batch.qtyReceived,
          qtyIssued: batch.qtyIssued,
          availableQty: getBatchAvailableQty(batch),
          receivedAt: batch.receivedAt,
          notes: batch.notes ?? null,
        }
      : null,
    issuedToBranch: branch
      ? { id: branch.id, name: branch.name, code: branch.code, isActive: branch.isActive }
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
  const activeState = getActiveState();
  const typeFilter = params.get("type") || (type ?? "");
  const itemTypeId = params.get("itemTypeId");
  const startDateValue = params.get("startDate");
  const endDateValue = params.get("endDate");
  const startDate = startDateValue ? new Date(startDateValue) : null;
  const endDate = parseDateParam(endDateValue);

  return activeState.transactions.filter((transaction) => {
    if (typeFilter && transaction.type !== typeFilter) return false;
    if (itemTypeId && transaction.itemTypeId !== Number(itemTypeId)) return false;

    const createdAt = new Date(transaction.createdAt);
    if (startDate && createdAt < startDate) return false;
    if (endDate && createdAt > endDate) return false;

    return true;
  });
};

const computeBalances = () => {
  const activeState = getActiveState();
  const balances = new Map<number, { balance: number; lastUpdatedAt: string | null }>();
  activeState.itemTypes.forEach((itemType) => {
    balances.set(itemType.id, { balance: 0, lastUpdatedAt: null });
  });

  const sorted = [...activeState.transactions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  sorted.forEach((transaction) => {
    const entry = balances.get(transaction.itemTypeId);
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

const requireItemType = (itemTypeId: number) => {
  const itemType = getItemType(itemTypeId);
  if (!itemType) {
    throw new Error("Item type not found");
  }
  return itemType;
};

const requireBranch = (branchId: number) => {
  const branch = getBranch(branchId);
  if (!branch) {
    throw new Error("Branch not found");
  }
  return branch;
};

const ensureNumber = (value: FormDataEntryValue | null, field: string) => {
  const numeric = typeof value === "string" ? Number(value) : Number(value);
  if (!Number.isFinite(numeric)) {
    throw new Error(`Invalid ${field}`);
  }
  return numeric;
};

const getAvailableBatch = (itemTypeId: number, qty: number) => {
  const batches = getActiveState().batches
    .filter((batch) => batch.itemTypeId === itemTypeId)
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
  const activeState = getActiveState();

  if (path === "/api/health") {
    return { status: "ok", mode: "frontend-only" };
  }

  if (path === "/api/item-types" && method === "GET") {
    const includeInactive = params.get("includeInactive") === "true";
    const itemTypes = includeInactive
      ? activeState.itemTypes
      : activeState.itemTypes.filter((itemType) => itemType.isActive);
    return { itemTypes };
  }

  if (path === "/api/item-types" && method === "POST") {
    const newItemType: ItemType = {
      id: activeState.nextIds.itemType++,
      name: String(body.name || "New Item Type"),
      code: String(body.code || "NEW"),
      description: body.description ? String(body.description) : null,
      isActive: true,
    };
    activeState.itemTypes.push(newItemType);
    return newItemType;
  }

  const itemTypeMatch = path.match(/^\/api\/item-types\/(\d+)$/);
  if (itemTypeMatch && method === "PATCH") {
    const id = Number(itemTypeMatch[1]);
    const itemType = requireItemType(id);
    itemType.name = body.name ? String(body.name) : itemType.name;
    itemType.code = body.code ? String(body.code) : itemType.code;
    itemType.description =
      body.description !== undefined ? String(body.description || "") : itemType.description;
    if (typeof body.isActive === "boolean") {
      itemType.isActive = body.isActive;
    }
    return itemType;
  }

  if (path === "/api/branches" && method === "GET") {
    const includeInactive = params.get("includeInactive") === "true";
    const branches = includeInactive
      ? state.branches
      : state.branches.filter((branch) => branch.isActive);
    return { branches };
  }

  if (path === "/api/admin/users" && method === "GET") {
    return { users: state.users };
  }

  if (path === "/api/admin/users" && method === "POST") {
    const newUser: User = {
      id: state.nextIds.user++,
      firstName: String(body.firstName || "New"),
      lastName: String(body.lastName || "User"),
      email: String(body.email || "new.user@omari.internal"),
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
    return activeState.itemTypes.map((itemType) => {
      const entry = balances.get(itemType.id);
      return {
        id: itemType.id,
        itemType,
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
    const transaction = activeState.transactions.find((candidate) => candidate.id === id);
    if (!transaction) throw new Error("Transaction not found");
    return hydrateTransaction(transaction);
  }

  if (transactionMatch && method === "PATCH") {
    const id = Number(transactionMatch[1]);
    const transaction = activeState.transactions.find((candidate) => candidate.id === id);
    if (!transaction) throw new Error("Transaction not found");
    if (transaction.status === "REVERSED") {
      throw new Error("Reversed transactions cannot be edited");
    }

    const roundMoney = (value: number) => Math.round(value * 100) / 100;
    const normalizeValue = (value: any) =>
      value === null || value === "" || value === undefined ? null : Number(value);

    if (body.qty !== undefined) {
      const nextQty = Number(body.qty);
      if (!Number.isFinite(nextQty) || nextQty <= 0) {
        throw new Error("Invalid qty");
      }
      if (transaction.batchId) {
        const batch = getBatch(transaction.batchId);
        if (!batch) throw new Error("Batch not found");
        if (transaction.type === "RECEIVE") {
          const nextReceived = batch.qtyReceived - transaction.qty + nextQty;
          if (nextReceived < batch.qtyIssued) {
            throw new Error("Quantity lower than issued amount");
          }
          batch.qtyReceived = nextReceived;
        }
        if (transaction.type === "ISSUE") {
          const nextIssued = batch.qtyIssued - transaction.qty + nextQty;
          if (nextIssued > batch.qtyReceived) {
            throw new Error("Insufficient batch inventory");
          }
          batch.qtyIssued = nextIssued;
        }
      }
      transaction.qty = nextQty;
    }

    const qty = transaction.qty || 0;

    if (transaction.type === "RECEIVE") {
      const incomingUnit = body.unitCost !== undefined ? normalizeValue(body.unitCost) : undefined;
      const incomingTotal =
        body.totalCost !== undefined ? normalizeValue(body.totalCost) : undefined;

      if (incomingUnit !== undefined) {
        transaction.unitCost = incomingUnit;
        transaction.totalCost =
          incomingUnit != null && qty > 0 ? roundMoney(incomingUnit * qty) : null;
      } else if (incomingTotal !== undefined) {
        transaction.totalCost = incomingTotal;
        transaction.unitCost =
          incomingTotal != null && qty > 0 ? roundMoney(incomingTotal / qty) : null;
      } else if (body.qty !== undefined) {
        if (transaction.unitCost != null) {
          transaction.totalCost = roundMoney(transaction.unitCost * qty);
        } else if (transaction.totalCost != null) {
          transaction.unitCost = roundMoney(transaction.totalCost / qty);
        }
      }
    }

    if (transaction.type === "ISSUE") {
      const incomingUnit =
        body.unitPrice !== undefined ? normalizeValue(body.unitPrice) : undefined;
      const incomingTotal =
        body.totalPrice !== undefined ? normalizeValue(body.totalPrice) : undefined;

      if (incomingUnit !== undefined) {
        transaction.unitPrice = incomingUnit;
        transaction.totalPrice =
          incomingUnit != null && qty > 0 ? roundMoney(incomingUnit * qty) : null;
      } else if (incomingTotal !== undefined) {
        transaction.totalPrice = incomingTotal;
        transaction.unitPrice =
          incomingTotal != null && qty > 0 ? roundMoney(incomingTotal / qty) : null;
      } else if (body.qty !== undefined) {
        if (transaction.unitPrice != null) {
          transaction.totalPrice = roundMoney(transaction.unitPrice * qty);
        } else if (transaction.totalPrice != null) {
          transaction.unitPrice = roundMoney(transaction.totalPrice / qty);
        }
      }
    }

    return hydrateTransaction(transaction);
  }

  if (path === "/api/reports/issues" && method === "GET") {
    const issues = filterTransactions(params, "ISSUE");
    const summary = {
      totalQty: issues.reduce((sum, txn) => sum + txn.qty, 0),
      totalCount: issues.length,
      byItemType: [] as Array<{ itemType: ItemType; totalQty: number; totalCount: number }>,
    };

    const byItemType = new Map<number, { totalQty: number; totalCount: number }>();
    issues.forEach((txn) => {
      const current = byItemType.get(txn.itemTypeId) || { totalQty: 0, totalCount: 0 };
      current.totalQty += txn.qty;
      current.totalCount += 1;
      byItemType.set(txn.itemTypeId, current);
    });

    summary.byItemType = Array.from(byItemType.entries()).map(([itemTypeId, totals]) => {
      return {
        itemType: requireItemType(itemTypeId),
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
      byItemType: [] as Array<{ itemType: ItemType; totalQty: number; totalCount: number }>,
    };

    const byItemType = new Map<number, { totalQty: number; totalCount: number }>();
    receipts.forEach((txn) => {
      const current = byItemType.get(txn.itemTypeId) || { totalQty: 0, totalCount: 0 };
      current.totalQty += txn.qty;
      current.totalCount += 1;
      byItemType.set(txn.itemTypeId, current);
    });

    summary.byItemType = Array.from(byItemType.entries()).map(([itemTypeId, totals]) => ({
      itemType: requireItemType(itemTypeId),
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
    const itemTypeId = Number(params.get("itemTypeId"));
    if (!Number.isFinite(itemTypeId)) {
      return { batches: [] };
    }
    const batches = activeState.batches
      .filter((batch) => batch.itemTypeId === itemTypeId)
      .map((batch) => ({
        ...batch,
        availableQty: getBatchAvailableQty(batch),
      }))
      .filter((batch) => batch.availableQty > 0);
    return { batches };
  }

  if (path === "/api/reports/finance" && method === "GET") {
    const itemTypeId = params.get("itemTypeId");
    const scopeParams = new URLSearchParams(params.toString());
    if (itemTypeId) {
      scopeParams.set("itemTypeId", itemTypeId);
    }
    const scopedTransactions = filterTransactions(scopeParams);
    const balances = computeBalances();

    const byItemType = activeState.itemTypes
      .filter((itemType) => (!itemTypeId ? true : itemType.id === Number(itemTypeId)))
      .map((itemType) => {
        const itemTransactions = scopedTransactions.filter(
          (txn) => txn.itemTypeId === itemType.id,
        );
        const receives = itemTransactions.filter((txn) => txn.type === "RECEIVE");
        const issues = itemTransactions.filter((txn) => txn.type === "ISSUE");

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
        const balance = balances.get(itemType.id)?.balance ?? 0;
        const inventoryValue = balance * avgUnitCost;

        return {
          itemType: { id: itemType.id, name: itemType.name, code: itemType.code },
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

    const totals = byItemType.reduce(
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
          itemType: hydrated.itemType,
          status: hydrated.status,
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
          itemType: hydrated.itemType,
          status: hydrated.status,
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
      byItemType,
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
  const roundMoney = (value: number) => Math.round(value * 100) / 100;
  const activeState = getActiveState();

  if (path === "/api/inventory/receive") {
    const itemTypeId = ensureNumber(formData.get("itemTypeId"), "itemTypeId");
    const qtyReceived = ensureNumber(formData.get("qtyReceived"), "qtyReceived");
    requireItemType(itemTypeId);
    const batchCode = String(
      formData.get("batchCode") || `BATCH-${activeState.nextIds.batch}`,
    );
    const receivedAt = formData.get("receivedAt")
      ? new Date(String(formData.get("receivedAt"))).toISOString()
      : new Date().toISOString();
    const notes = formData.get("notes") ? String(formData.get("notes")) : null;
    let unitCost =
      formData.get("unitCost") && String(formData.get("unitCost")).length > 0
        ? Number(formData.get("unitCost"))
        : null;
    let totalCost =
      formData.get("totalCost") && String(formData.get("totalCost")).length > 0
        ? Number(formData.get("totalCost"))
        : null;

    if (unitCost != null && qtyReceived > 0) {
      totalCost = roundMoney(unitCost * qtyReceived);
    } else if (totalCost != null && qtyReceived > 0) {
      unitCost = roundMoney(totalCost / qtyReceived);
    }

    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File);

    const batch: Batch = {
      id: activeState.nextIds.batch++,
      itemTypeId,
      batchCode,
      qtyReceived,
      qtyIssued: 0,
      receivedAt,
      notes,
    };
    activeState.batches.push(batch);

    const transaction: Transaction = {
      id: activeState.nextIds.transaction++,
      type: "RECEIVE",
      itemTypeId,
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
    activeState.transactions.push(transaction);
    return hydrateTransaction(transaction);
  }

  if (path === "/api/inventory/issue") {
    const itemTypeId = ensureNumber(formData.get("itemTypeId"), "itemTypeId");
    const qty = ensureNumber(formData.get("qty"), "qty");
    requireItemType(itemTypeId);
    const issuedToType = String(formData.get("issuedToType") || "BRANCH") as IssuedToType;
    const issuedToBranchRaw = formData.get("issuedToBranchId");
    const issuedToBranchId =
      issuedToType === "BRANCH" && issuedToBranchRaw != null && String(issuedToBranchRaw).length > 0
        ? ensureNumber(issuedToBranchRaw, "issuedToBranchId")
        : null;
    const issuedToName = String(formData.get("issuedToName") || "");
    const notes = formData.get("notes") ? String(formData.get("notes")) : null;
    let unitPrice =
      formData.get("unitPrice") && String(formData.get("unitPrice")).length > 0
        ? Number(formData.get("unitPrice"))
        : null;
    let totalPrice =
      formData.get("totalPrice") && String(formData.get("totalPrice")).length > 0
        ? Number(formData.get("totalPrice"))
        : null;

    if (unitPrice != null && qty > 0) {
      totalPrice = roundMoney(unitPrice * qty);
    } else if (totalPrice != null && qty > 0) {
      unitPrice = roundMoney(totalPrice / qty);
    }

    const files = formData
      .getAll("files")
      .filter((entry): entry is File => entry instanceof File);

    const batchIdValue = formData.get("batchId");
    const allowFifo = formData.get("allowFifo") === "true";
    let batch: Batch | null = null;
    if (batchIdValue && String(batchIdValue).length > 0) {
      batch = getBatch(Number(batchIdValue));
    } else if (allowFifo) {
      batch = getAvailableBatch(itemTypeId, qty);
    } else {
      throw new Error("Batch selection is required for this issue.");
    }

    if (!batch) {
      throw new Error("No available batch for this item type");
    }

    if (getBatchAvailableQty(batch) < qty) {
      throw new Error("Insufficient batch inventory");
    }

    batch.qtyIssued += qty;
    if (issuedToType === "BRANCH" && !issuedToBranchId && !issuedToName.trim()) {
      throw new Error("Branch name is required.");
    }

    const branch =
      issuedToType === "BRANCH" && issuedToBranchId != null
        ? requireBranch(issuedToBranchId)
        : null;

    const transaction: Transaction = {
      id: activeState.nextIds.transaction++,
      type: "ISSUE",
      itemTypeId,
      qty,
      createdAt: new Date().toISOString(),
      createdById: userId,
      status: "COMPLETED",
      issuedToType,
      issuedToName: issuedToType === "PERSON" ? issuedToName : issuedToName || branch?.name,
      issuedToBranchId: branch?.id ?? null,
      batchId: batch.id,
      notes,
      unitPrice,
      totalPrice,
      attachments: files.length
        ? createAttachmentsFromFormData(files, userId)
        : [],
    };
    activeState.transactions.push(transaction);
    return hydrateTransaction(transaction);
  }

  // Adjustments inventory endpoint removed

  throw new Error(`Unsupported form endpoint: ${path}`);
}
