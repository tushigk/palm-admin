import { HttpRequest } from "@/utils/request";

const req = () => new HttpRequest();

export const listOrders = (params?: Record<string, unknown>) =>
  req().get("/admin/orders", params);

export const markOrderPaid = (id: string) =>
  req().put(`/admin/orders/${id}/mark-paid`, {});

export const grantAccess = (userId: string, productId: string) =>
  req().post("/admin/orders/grant", { userId, productId });
