import { toWritableStream } from "../deps.ts";
import { normalize } from "./path.ts";

export const native = globalThis.fetch;

// You should be using `request` not `fetch` for everything
// this makes that a bit harder to accidentally use `fetch
// deno-lint-ignore no-unused-vars -- intentional
const fetch = undefined;

export type RequestOptions = RequestInit & {
  saveTo?: string;
  asStream?: boolean;
};

export type Response<D = unknown> = {
  data: D | null;
  headers: Record<string, string>;
  error: Error | undefined;
};

export async function request<T = unknown>(
  url: string,
  init: RequestOptions,
): Promise<Response<T>> {
  const response = await native(url, init);
  const headers = headersToObject(response.headers);

  if (!response.ok) {
    return {
      data: null,
      headers,
      error: new Error(response.statusText),
    };
  }

  if (!response.body) {
    return {
      data: null,
      headers,
      error: new Error("No body in response"),
    };
  }

  let data: T | null = null;

  if (init.asStream) {
    return {
      data: response.body as T,
      headers,
      error: undefined,
    };
  }

  if (init.saveTo) {
    const file = await Deno.open(await normalize(init.saveTo), {
      write: true,
      create: true,
    });
    const writableStream = toWritableStream(file);
    await response.body.pipeTo(writableStream);

    data = {
      path: init.saveTo,
    } as T;
  } else if (
    response.headers.get("Content-Type")?.includes("application/json")
  ) {
    data = await response.json() as T;
  } else {
    data = await response.text() as T;
  }

  return {
    data,
    headers,
    error: undefined,
  };
}

function _methodProxy(
  method: RequestInit["method"],
): (
  url: string,
  options: Omit<RequestOptions, "method">,
) => ReturnType<typeof request> {
  return (url: string, options: Omit<RequestOptions, "method">) =>
    request(url, { ...options, method });
}

export const get = _methodProxy("GET");
export const post = _methodProxy("POST");
export const put = _methodProxy("PUT");
export const patch = _methodProxy("PATCH");
export const del = _methodProxy("DELETE");

function headersToObject(headers: Headers): Record<string, string> {
  const obj: Record<string, string> = {};

  for (const [key, value] of headers.entries()) {
    obj[key] = value;
  }

  return Array.from(headers.entries()).reduce((acc, [key, value]) => {
    return {
      ...acc,
      [key]: value,
    };
  }, {});
}
