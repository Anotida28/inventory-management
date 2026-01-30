import { handleMockApiRequest, handleMockFormData } from "services/mock-api";

// Defaults to a backend running at http://localhost:3400/api.
const API_BASE =
  process.env.REACT_APP_API_URL || "http://172.16.3.21:3400/api";
const API_KEY = process.env.REACT_APP_API_KEY || "";
const USE_MOCK = process.env.REACT_APP_USE_MOCK === "true";
const MODE_STORAGE_KEY = "omari.systemMode";
const GLOBAL_MODE_KEY = "__OMARI_SYSTEM_MODE";

const getSystemMode = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  const globalMode = (window as unknown as Record<string, string>)[
    GLOBAL_MODE_KEY
  ];
  if (globalMode === "CARDS" || globalMode === "INVENTORY") {
    return globalMode;
  }
  const stored = window.localStorage.getItem(MODE_STORAGE_KEY);
  if (stored === "CARDS" || stored === "INVENTORY") {
    return stored;
  }
  return undefined;
};

const buildAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {};
  if (API_KEY) {
    headers["x-api-key"] = API_KEY;
  }
  const mode = getSystemMode();
  if (mode) {
    headers["x-system-mode"] = mode;
  }
  return headers;
};

const normalizeEndpoint = (endpoint: string) => {
  if (endpoint.startsWith("/api/")) {
    return endpoint.replace("/api", "");
  }
  return endpoint;
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  if (USE_MOCK) {
    return handleMockApiRequest(endpoint, options) as Promise<T>;
  }

  const authHeaders = buildAuthHeaders();
  const response = await fetch(`${API_BASE}${normalizeEndpoint(endpoint)}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function apiFormData<T>(
  endpoint: string,
  formData: FormData,
): Promise<T> {
  if (USE_MOCK) {
    return handleMockFormData(endpoint, formData) as Promise<T>;
  }

  const authHeaders = buildAuthHeaders();
  const response = await fetch(`${API_BASE}${normalizeEndpoint(endpoint)}`, {
    method: "POST",
    body: formData,
    headers: {
      ...authHeaders,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}
