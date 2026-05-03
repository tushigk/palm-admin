"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { categoriesApi } from "@/apis";
import { Tag, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  _id: string;
  name: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#151518] border border-white/10 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500";

function getMsg(err: unknown): string {
  if (typeof err === "object" && err !== null) {
    const e = err as Record<string, unknown>;
    if (typeof e.message === "string") return e.message;
  }
  return "Алдаа гарлаа";
}

const emptyForm = () => ({ name: "", description: "", sortOrder: "0", isActive: true });

export default function CategoriesPage() {
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const { data, isLoading, mutate } = useSWR("categories", () =>
    categoriesApi.listCategories({ limit: 100 })
  );

  const categories: Category[] = data?.data || [];

  const openCreate = () => {
    setForm(emptyForm());
    setModal("create");
  };

  const openEdit = (c: Category) => {
    setSelected(c);
    setForm({ name: c.name, description: c.description || "", sortOrder: String(c.sortOrder), isActive: c.isActive as unknown as boolean });
    setModal("edit");
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      await categoriesApi.createCategory({ name: form.name, description: form.description, sortOrder: Number(form.sortOrder), isActive: form.isActive });
      toast.success("Категори нэмэгдлээ");
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
      await categoriesApi.updateCategory(selected._id, { name: form.name, description: form.description, sortOrder: Number(form.sortOrder), isActive: form.isActive });
      toast.success("Хадгалагдлаа");
      setModal(null);
      mutate();
    } catch (e) {
      toast.error(getMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Category) => {
    if (!confirm(`"${c.name}" устгах уу?`)) return;
    try {
      await categoriesApi.deleteCategory(c._id);
      toast.success("Устлаа");
      mutate();
    } catch (e) {
      toast.error(getMsg(e));
    }
  };

  const FormContent = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Нэр</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Категорийн нэр" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Тайлбар</label>
        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={inputCls} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Эрэмбэ</label>
        <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className={inputCls} />
      </div>
      <div className="flex items-center gap-3">
        <input type="checkbox" id="isActive" checked={form.isActive as unknown as boolean} onChange={(e) => setForm({ ...form, isActive: e.target.checked as unknown as boolean })} className="w-4 h-4 rounded accent-purple-500" />
        <label htmlFor="isActive" className="text-sm text-gray-300 cursor-pointer">Идэвхтэй</label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Tag className="w-7 h-7 text-purple-400" /> Категори
        </h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Нэмэх
        </button>
      </div>

      <div className="bg-[#0f0f12] border border-white/5 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Уншиж байна...</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Категори олдсонгүй</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Нэр</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Тайлбар</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Эрэмбэ</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Үйлдэл</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-sm text-white font-medium">{c.name}</td>
                  <td className="px-5 py-3 text-sm text-gray-400 max-w-xs truncate">{c.description || "—"}</td>
                  <td className="px-5 py-3 text-sm text-gray-400">{c.sortOrder}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${c.isActive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                      {c.isActive ? "Идэвхтэй" : "Идэвхгүй"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal === "create" && (
        <Modal title="Категори нэмэх" onClose={() => setModal(null)}>
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
        <Modal title="Категори засах" onClose={() => setModal(null)}>
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
