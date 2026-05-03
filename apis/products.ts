import { HttpRequest } from "@/utils/request";

const req = () => new HttpRequest();

export const listProducts = (params?: Record<string, unknown>) =>
  req().get("/admin/products", params);

export const getProduct = (id: string) => req().get(`/admin/products/${id}`);

export const createProduct = (data: Record<string, unknown>) =>
  req().post("/admin/products", data);

export const updateProduct = (id: string, data: Record<string, unknown>) =>
  req().put(`/admin/products/${id}`, data);

export const deleteProduct = (id: string) => req().del(`/admin/products/${id}`);
