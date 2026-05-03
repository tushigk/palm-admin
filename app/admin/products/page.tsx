"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { productsApi, categoriesApi, mediaApi } from "@/apis";
import { ShoppingBag, Plus, Pencil, Trash2, X, Check, Image, ToggleLeft, ToggleRight } from "lucide-react";
import toast from "react-hot-toast";

interface Category { _id: string; name: string; }
interface ProductMedia { url: string; type: string; }
interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  sortOrder: number;
  isActive: boolean;
  media: ProductMedia[];
  category?: { _id: string; name: string };
  warnings: string[];
  prompt: string;
  createdAt: string;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#151518] border border-white/10 rounded-2xl w-full max-w-lg my-4">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function getMsg(err: unknown): string {
  if (typeof err === "object" && err !== null) {
    const e = err as Record<string, unknown>;
    if (typeof e.message === "string") return e.message;
  }
  return "Алдаа гарлаа";
}

const emptyForm = () => ({
  title: "", description: "", price: "", originalPrice: "",
  sortOrder: "0", isActive: true, prompt: "",
  categoryId: "", warnings: "", mediaUrl: "",
});

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);

  const { data, isLoading, mutate } = useSWR(
    `products-${page}`,
    () => productsApi.listProducts({ page, limit: 20 })
  );
  const { data: catData } = useSWR("categories-all", () => categoriesApi.listCategories({ limit: 100 }));

  const products: Product[] = data?.data || [];
  const pagination = data?.pagination || { total: 0, pages: 1, page: 1 };
  const categories: Category[] = catData?.data || [];

  const openCreate = () => {
    setForm(emptyForm());
    setMediaUrls([]);
    setModal("create");
  };

  const openEdit = (p: Product) => {
    setSelected(p);
    setForm({
      title: p.title, description: p.description,
      price: String(p.price), originalPrice: String(p.originalPrice || ""),
      sortOrder: String(p.sortOrder), isActive: p.isActive as unknown as boolean,
      prompt: p.prompt, categoryId: p.category?._id || "",
      warnings: p.warnings.join("\n"), mediaUrl: "",
    });
    setMediaUrls(p.media.map((m) => m.url));
    setModal("edit");
  };

  const handleUploadImage = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await mediaApi.uploadImage(fd) as { data?: { url?: string }; url?: string };
      const url = res?.data?.url || res?.url;
      if (url) setMediaUrls((prev) => [...prev, url]);
      else toast.error("URL олдсонгүй");
    } catch (e) {
      toast.error(getMsg(e));
    } finally {
      setUploading(false);
    }
  };

  const buildPayload = () => ({
    title: form.title,
    description: form.description,
    price: Number(form.price),
    originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
    sortOrder: Number(form.sortOrder),
    isActive: form.isActive,
    prompt: form.prompt,
    category: form.categoryId || undefined,
    warnings: form.warnings.split("\n").map((s) => s.trim()).filter(Boolean),
    media: mediaUrls.map((url) => ({ url, type: "image" })),
  });

  const handleCreate = async () => {
    setSaving(true);
    try {
      await productsApi.createProduct(buildPayload());
      toast.success("Бүтээгдэхүүн нэмэгдлээ");
      setModal(null);
      mutate();
    } catch (e) {
      toast.error(getMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await productsApi.updateProduct(selected._id, buildPayload());
      toast.success("Хадгалагдлаа");
      setModal(null);
      mutate();
    } catch (e) {
      toast.error(getMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`"${p.title}" устгах уу?`)) return;
    try {
      await productsApi.deleteProduct(p._id);
      toast.success("Устлаа");
      mutate();
    } catch (e) {
      toast.error(getMsg(e));
    }
  };

  const FormContent = () => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <Field label="Гарчиг">
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="Бүтээгдэхүүний нэр" />
      </Field>
      <Field label="Тайлбар">
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={inputCls} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Үнэ (₮)">
          <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputCls} placeholder="9900" />
        </Field>
        <Field label="Хуучин үнэ (₮)">
          <input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} className={inputCls} placeholder="Хоосон орхиж болно" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Эрэмбэ">
          <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Категори">
          <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputCls}>
            <option value="">— Категори сонгох —</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Идэвхтэй эсэх">
        <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })} className="flex items-center gap-2 text-sm text-gray-300">
          {form.isActive ? <ToggleRight className="w-6 h-6 text-purple-400" /> : <ToggleLeft className="w-6 h-6 text-gray-500" />}
          {form.isActive ? "Идэвхтэй" : "Идэвхгүй"}
        </button>
      </Field>
      <Field label="AI Prompt">
        <textarea value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} rows={4} className={inputCls} placeholder="ChatGPT-д илгээх prompt..." />
      </Field>
      <Field label="Анхааруулга (мөр болгонд нэг)">
        <textarea value={form.warnings} onChange={(e) => setForm({ ...form, warnings: e.target.value })} rows={2} className={inputCls} placeholder="Тус бүр шинэ мөрт бичнэ..." />
      </Field>
      <Field label="Зураг">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {mediaUrls.map((url, i) => (
              <div key={i} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border border-white/10" />
                <button
                  onClick={() => setMediaUrls((prev) => prev.filter((_, idx) => idx !== i))}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full hidden group-hover:flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-400 hover:text-white w-fit">
            <Image className="w-4 h-4" />
            {uploading ? "Хуулж байна..." : "Зураг нэмэх"}
            <input type="file" accept="image/*" className="hidden" disabled={uploading}
              onChange={(e) => { if (e.target.files?.[0]) handleUploadImage(e.target.files[0]); }} />
          </label>
        </div>
      </Field>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ShoppingBag className="w-7 h-7 text-purple-400" /> Бүтээгдэхүүн
          </h1>
          <p className="text-gray-400 text-sm mt-1">Нийт {pagination.total} бүтээгдэхүүн</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Нэмэх
        </button>
      </div>

      <div className="bg-[#0f0f12] border border-white/5 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Уншиж байна...</div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Бүтээгдэхүүн олдсонгүй</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Нэр</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Үнэ</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Категори</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Статус</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {p.media[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.media[0].url} alt="" className="w-9 h-9 rounded-lg object-cover border border-white/10" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                        <span className="text-sm text-white font-medium">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-white">₮{p.price.toLocaleString()}</td>
                    <td className="px-5 py-3 text-sm text-gray-400">{p.category?.name || "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${p.isActive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                        {p.isActive ? "Идэвхтэй" : "Идэвхгүй"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(p)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 bg-[#0f0f12] border border-white/10 rounded-lg text-sm text-gray-400 disabled:opacity-40">Өмнөх</button>
          <span className="text-sm text-gray-400">{page} / {pagination.pages}</span>
          <button disabled={page >= pagination.pages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 bg-[#0f0f12] border border-white/10 rounded-lg text-sm text-gray-400 disabled:opacity-40">Дараах</button>
        </div>
      )}

      {modal === "create" && (
        <Modal title="Бүтээгдэхүүн нэмэх" onClose={() => setModal(null)}>
          <FormContent />
          <div className="flex gap-3 pt-4 mt-4 border-t border-white/5">
            <button onClick={() => setModal(null)} className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300">Болих</button>
            <button onClick={handleCreate} disabled={saving} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? "Хадгалж байна..." : <><Check className="w-4 h-4" /> Нэмэх</>}
            </button>
          </div>
        </Modal>
      )}

      {modal === "edit" && selected && (
        <Modal title="Бүтээгдэхүүн засах" onClose={() => setModal(null)}>
          <FormContent />
          <div className="flex gap-3 pt-4 mt-4 border-t border-white/5">
            <button onClick={() => setModal(null)} className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300">Болих</button>
            <button onClick={handleUpdate} disabled={saving} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? "Хадгалж байна..." : <><Check className="w-4 h-4" /> Хадгалах</>}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
