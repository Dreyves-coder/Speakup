import { API_BASE_URL } from "@/constants/api";

const REQUEST_TIMEOUT_MS = 6000;

type ApiRequestOptions = {
  body?: unknown;
  method?: "DELETE" | "GET" | "POST" | "PUT";
  token?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      headers: {
        ...(options.body === undefined
          ? {}
          : { "Content-Type": "application/json" }),
        ...(options.token
          ? { Authorization: `Bearer ${options.token}` }
          : {}),
      },
      method: options.method ?? "GET",
      signal: controller.signal,
    });

    const responseText = await response.text();
    const payload = (responseText ? JSON.parse(responseText) : undefined) as {
      message?: string | string[];
    } | undefined;

    if (!response.ok) {
      const message = Array.isArray(payload?.message)
        ? payload.message[0]
        : payload?.message;
      throw new ApiError(message ?? "The request could not be completed.", response.status);
    }

    return payload as T;
  } finally {
    clearTimeout(timeout);
  }
}
