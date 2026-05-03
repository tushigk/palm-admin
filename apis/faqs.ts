import { HttpRequest } from "@/utils/request";

const req = () => new HttpRequest();

export const listFaqs = () => req().get("/admin/faqs");

export const createFaq = (data: Record<string, unknown>) =>
  req().post("/admin/faqs", data);

export const updateFaq = (id: string, data: Record<string, unknown>) =>
  req().put(`/admin/faqs/${id}`, data);

export const deleteFaq = (id: string) => req().del(`/admin/faqs/${id}`);
