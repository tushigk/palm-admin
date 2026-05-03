import { HttpRequest } from "@/utils/request";

const req = () => new HttpRequest();

export const listContacts = (params?: Record<string, unknown>) =>
  req().get("/admin/contacts", params);

export const updateContactStatus = (id: string, status: string) =>
  req().patch(`/admin/contacts/${id}`, { status });
