import { HttpRequest } from "@/utils/request";

const req = () => new HttpRequest();

export const getStats = (params?: { from?: string; to?: string }) =>
  req().get("/admin/stats", params as Record<string, unknown>);
