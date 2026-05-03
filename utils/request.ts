import { siteUrl } from "@/config/site";

export class HttpRequest {
  private baseUrl: string;
  private token: string | null;

  constructor(token: string | null = null, baseUrl: string = siteUrl) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private async request(path: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${path}`;
    const headers = new Headers(options.headers);

    const currentToken =
      this.token ||
      (typeof window !== "undefined" ? localStorage.getItem("token") : null);

    if (currentToken) {
      headers.set("Authorization", `Bearer ${currentToken}`);
    }

    if (!(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, { ...options, headers, credentials: "include" });
    const data = await response.json();

    if (!response.ok) {
      const error = (data || new Error("Something went wrong")) as Record<string, unknown>;
      if (typeof error === "object" && error !== null) {
        error.status = response.status;
      }
      throw error;
    }

    return data;
  }

  async get(path: string, params?: Record<string, unknown>) {
    let queryString = "";
    if (params) {
      const filtered = Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
      );
      if (Object.keys(filtered).length > 0) {
        queryString = "?" + new URLSearchParams(filtered as Record<string, string>).toString();
      }
    }
    return this.request(`${path}${queryString}`, { method: "GET" });
  }

  async post(path: string, body: unknown) {
    return this.request(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  async put(path: string, body: unknown) {
    return this.request(path, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  async patch(path: string, body: unknown) {
    return this.request(path, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  async del(path: string) {
    return this.request(path, { method: "DELETE" });
  }
}
