import type { ApiError, ApiSuccess, PaginationMeta } from "@/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://localhost:4000";

export class ApiRequestError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ data: T; meta?: PaginationMeta }> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
    cache: options.cache ?? "no-store",
  });

  let payload: ApiSuccess<T> | ApiError | null = null;
  try {
    payload = (await response.json()) as ApiSuccess<T> | ApiError;
  } catch {
    throw new ApiRequestError(
      response.status,
      "INVALID_RESPONSE",
      `Request failed with status ${response.status}`,
    );
  }

  if (!response.ok || !payload || !payload.success) {
    const err = payload && !payload.success ? payload.error : null;
    throw new ApiRequestError(
      response.status,
      err?.code ?? "REQUEST_FAILED",
      err?.message ?? `Request failed with status ${response.status}`,
      err?.details,
    );
  }

  return { data: payload.data, meta: payload.meta };
}
