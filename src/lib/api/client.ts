import { useAuthStore } from "../../stores/auth-store";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL !== undefined
    ? process.env.NEXT_PUBLIC_API_URL
    : "http://localhost:8080";

export interface RequestOptions extends RequestInit {
  timeout?: number;
}

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'><rect width='24' height='24' fill='%23f1f5f9'/><path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/></svg>";

export const DEFAULT_PLAYLIST_COVER = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='1.5'><rect width='24' height='24' fill='%23f1f5f9'/><circle cx='12' cy='12' r='9' stroke='%23cbd5e1' stroke-width='1'/><circle cx='12' cy='12' r='7' fill='none' stroke='%2394a3b8' stroke-width='0.5' stroke-dasharray='1 1'/><circle cx='12' cy='12' r='3' fill='%23e2e8f0' stroke='%23cbd5e1' stroke-width='1'/><circle cx='12' cy='12' r='0.75' fill='%2364748b'/></svg>";

/**
 * Centrally constructs asset / API URLs from relative paths.
 */
export function buildMediaUrl(path: string | undefined | null): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${cleanPath}`;
}

/**
 * Fetch with custom timeout support.
 */
async function fetchWithTimeout(resource: string, options: RequestOptions = {}): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options; // Default 30s timeout

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(resource, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === "AbortError") {
      throw new Error(`Request timed out after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Central HTTP client.
 */
export async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

  // Build headers
  const headers = new Headers(options.headers || {});
  
  // Inject Authorization header if token exists in localStorage
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("xitlar_token");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  // Set default JSON Content-Type if body is not FormData
  const isMultipart = options.body instanceof FormData;
  if (!headers.has("Content-Type") && !isMultipart && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetchWithTimeout(url, {
    ...options,
    headers,
  });

  // Handle status codes
  if (!response.ok) {
    let errorData: any = null;
    let errorMessage = `HTTP error! Status: ${response.status}`;

    try {
      errorData = await response.json();
      if (errorData && typeof errorData.message === "string") {
        errorMessage = errorData.message;
      }
    } catch {
      // Not a JSON error or unreadable body
    }

    // Specially handle session expired / unauthorized
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("xitlar_token");
        // Reset Zustand auth state dynamically
        useAuthStore.getState().logout();
      }
    }

    throw new ApiError(errorMessage, response.status, errorData);
  }

  // Parse success response
  try {
    const result = await response.json();
    // Support the custom ResponseApi structure
    if (result && typeof result.success === "boolean") {
      if (!result.success) {
        throw new ApiError(result.message || "Operation failed", 400, result);
      }
      return result.data as T;
    }
    return result as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    // For non-JSON responses or empty responses
    return {} as T;
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    apiFetch<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: any, options?: RequestOptions) => {
    const isMultipart = body instanceof FormData;
    return apiFetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: isMultipart ? body : JSON.stringify(body),
    });
  },

  put: <T>(endpoint: string, body?: any, options?: RequestOptions) => {
    const isMultipart = body instanceof FormData;
    return apiFetch<T>(endpoint, {
      ...options,
      method: "PUT",
      body: isMultipart ? body : JSON.stringify(body),
    });
  },

  delete: <T>(endpoint: string, options?: RequestOptions) => 
    apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
};
