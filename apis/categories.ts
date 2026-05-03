import { HttpRequest } from "@/utils/request";

const req = () => new HttpRequest();

export const listCategories = (params?: Record<string, unknown>) =>
  req().get("/admin/categories", params);

export const getCategory = (id: string) => req().get(`/admin/categories/${id}`);

export const createCategory = (data: Record<string, unknown>) =>
  req().post("/admin/categories", data);

export const updateCategory = (id: string, data: Record<string, unknown>) =>
  req().put(`/admin/categories/${id}`, data);

export const deleteCategory = (id: string) =>
  req().del(`/admin/categories/${id}`);
