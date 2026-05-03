import { HttpRequest } from "@/utils/request";

const req = () => new HttpRequest();

export const upsertPrivacy = (content: string) =>
  req().post("/admin/privacy", { content });

export const getPrivacy = () => req().get("/privacy");
