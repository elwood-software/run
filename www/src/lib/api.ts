/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";

export type ApiResponse<T = any> = {
  data: T | null;
  error: Error | null;
};

export type RequestIntiWithJsonBody = Omit<RequestInit, "body"> & {
  body?: RequestInit["body"] | Record<string, any>;
};

export async function request(
  url: string,
  init: RequestIntiWithJsonBody = {},
): Promise<ApiResponse> {
  try {
    const client = await createClient();
    const apiUrl = process.env.API_URL!;
    const body = typeof init.body === "object"
      ? JSON.stringify(init.body)
      : init.body;

    const { data: session } = await client.auth.getSession();

    const response = await fetch(`${apiUrl}${url}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.session?.access_token}`,
      },
      body,
    });

    if (!response.ok) {
      throw new Error("Response not ok");
    }

    return {
      data: await response.json(),
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error as Error,
    };
  }
}

export const api = {
  request,
  get<T>(url: string): Promise<ApiResponse<T>> {
    return request(url, { method: "GET" });
  },
  post<T>(
    url: string,
    init: RequestIntiWithJsonBody = {},
  ): Promise<ApiResponse<T>> {
    return request(url, { method: "POST", ...init });
  },
};
