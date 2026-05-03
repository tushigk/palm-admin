import { HttpRequest } from "@/utils/request";

const req = () => new HttpRequest();

export const uploadImage = (formData: FormData) =>
  req().post("/media/image", formData);

export const deleteImage = (id: string) =>
  req().del(`/admin/media/images/${id}`);
