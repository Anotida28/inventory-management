

// Defaults to a backend running at http://localhost:3400/api.
export const API_BASE =
  process.env.REACT_APP_API_URL || "http://172.16.3.21:3400/api";
const USE_MOCK = false;
const USER_STORAGE_KEY = "omari.user";
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

const getStoredUsername = (): string | undefined => {
  if (typeof window === "undefined") return undefined;
  const raw = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as { username?: string };
    if (parsed?.username) return parsed.username;
  } catch {
    return undefined;
  }
  return undefined;
};

const buildAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {};
  const mode = getSystemMode();
  if (mode) {
    headers["x-system-mode"] = mode;
  }
  const username = getStoredUsername();
  if (username) {
    headers["x-username"] = username;
  }
  return headers;
};

const normalizeEndpoint = (endpoint: string) => {
  if (endpoint.startsWith("/api/")) {
    return endpoint.replace("/api", "");
  }
  return endpoint;
};

export const buildApiUrl = (endpoint: string) =>
  `${API_BASE}${normalizeEndpoint(endpoint)}`;

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {


  const authHeaders = buildAuthHeaders();
  const response = await fetch(buildApiUrl(endpoint), {
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
  const authHeaders = buildAuthHeaders();
  const response = await fetch(buildApiUrl(endpoint), {
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
