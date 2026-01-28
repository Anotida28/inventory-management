import { handleMockApiRequest, handleMockFormData } from "services/mock-api";

// Defaults to a backend running at http://localhost:5000/api.
const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const USE_MOCK = process.env.REACT_APP_USE_MOCK === "true";

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

  const response = await fetch(`${API_BASE}${normalizeEndpoint(endpoint)}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
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

  const response = await fetch(`${API_BASE}${normalizeEndpoint(endpoint)}`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}
