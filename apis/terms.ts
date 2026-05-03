import { HttpRequest } from "@/utils/request";

const req = () => new HttpRequest();

export const upsertTerms = (content: string) =>
  req().put("/admin/terms", { content });

export const getTerms = () => req().get("/terms");
