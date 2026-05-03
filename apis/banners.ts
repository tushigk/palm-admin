import { HttpRequest } from "@/utils/request";

const req = () => new HttpRequest();

export const listBanners = () => req().get("/admin/banners");

export const createBanner = (data: Record<string, unknown>) =>
  req().post("/admin/banners", data);

export const updateBanner = (id: string, data: Record<string, unknown>) =>
  req().put(`/admin/banners/${id}`, data);

export const deleteBanner = (id: string) => req().del(`/admin/banners/${id}`);
