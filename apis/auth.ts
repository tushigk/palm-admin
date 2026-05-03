import { HttpRequest } from "@/utils/request";
import { siteUrl } from "@/config/site";

const req = () => new HttpRequest(null, siteUrl);

export const login = (data: { phone: string; password: string }) =>
  req().post("/auth/login", data);

export const logout = () => req().post("/auth/logout", {});

export const me = () => req().get("/auth/me");
