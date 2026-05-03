import { HttpRequest } from "@/utils/request";

const req = () => new HttpRequest();

export const listUsers = (params?: Record<string, unknown>) =>
  req().get("/admin/users", params);

export const getUser = (id: string) => req().get(`/admin/users/${id}`);

export const createUser = (data: Record<string, unknown>) =>
  req().post("/admin/users", data);

export const updateUser = (id: string, data: Record<string, unknown>) =>
  req().put(`/admin/users/${id}`, data);

export const changePassword = (id: string, password: string) =>
  req().put(`/admin/users/${id}/password`, { password });

export const deleteUser = (id: string) => req().del(`/admin/users/${id}`);
