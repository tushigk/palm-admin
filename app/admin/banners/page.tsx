"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { bannersApi, mediaApi } from "@/apis";
import { ImageIcon, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import toast from "react-hot-toast";

interface Banner {
  _id: string;
  title?: string;
  imageUrl: string;
  link?: string;
  sortOrder: number;
  isActive: boolean;
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

const emptyForm = () => ({ title: "", imageUrl: "", link: "", sortOrder: "0", isActive: true });

export default function BannersPage() {
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Banner | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading, mutate } = useSWR("banners", () => bannersApi.listBanners());
  const banners: Banner[] = data?.data || [];

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await mediaApi.uploadImage(fd) as { data?: { url?: string }; url?: string };
      const url = res?.data?.url || res?.url;
      if (url) setForm((f) => ({ ...f, imageUrl: url }));
      else toast.error("URL олдсонгүй");
    } catch (e) { toast.error(getMsg(e)); }
    finally { setUploading(false); }
  };

  const buildPayload = () => ({
    title: form.title || undefined,
    imageUrl: form.imageUrl,
    link: form.link || undefined,
    sortOrder: Number(form.sortOrder),
    isActive: form.isActive,
  });

  const handleCreate = async () => {
    setSaving(true);
    try {
      await bannersApi.createBanner(buildPayload());
      toast.success("Баннер нэмэгдлээ");
      setModal(null);
      mutate();
    } catch (e) { toast.error(getMsg(e)); }
    finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await bannersApi.updateBanner(selected._id, buildPayload());
      toast.success("Хадгалагдлаа");
      setModal(null);
      mutate();
    } catch (e) { toast.error(getMsg(e)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (b: Banner) => {
    if (!confirm("Баннер устгах уу?")) return;
    try {
      await bannersApi.deleteBanner(b._id);
      toast.success("Устлаа");
      mutate();
    } catch (e) { toast.error(getMsg(e)); }
  };

  const FormContent = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Гарчиг (заавал биш)</label>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} placeholder="Баннерын гарчиг" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Зураг</label>
        {form.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={form.imageUrl} alt="" className="w-full h-32 object-cover rounded-xl mb-2 border border-white/10" />
        )}
        <label className="flex items-center gap-2 cursor-pointer px-3 py-2.5 bg-white/5 border border-white/10 border-dashed rounded-xl text-sm text-gray-400 hover:text-white w-full justify-center">
          <ImageIcon className="w-4 h-4" />
          {uploading ? "Хуулж байна..." : "Зураг сонгох"}
          <input type="file" accept="image/*" className="hidden" disabled={uploading}
            onChange={(e) => { if (e.target.files?.[0]) handleUpload(e.target.files[0]); }} />
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Холбоос</label>
        <input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className={inputCls} placeholder="https://..." />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Эрэмбэ</label>
        <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className={inputCls} />
      </div>
      <div className="flex items-center gap-3">
        <input type="checkbox" id="ba" checked={form.isActive as unknown as boolean} onChange={(e) => setForm({ ...form, isActive: e.target.checked as unknown as boolean })} className="w-4 h-4 rounded accent-purple-500" />
        <label htmlFor="ba" className="text-sm text-gray-300 cursor-pointer">Идэвхтэй</label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <ImageIcon className="w-7 h-7 text-purple-400" /> Баннер
        </h1>
        <button onClick={() => { setForm(emptyForm()); setModal("create"); }} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Нэмэх
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Уншиж байна...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center py-8">Баннер олдсонгүй</p>
          ) : banners.map((b) => (
            <div key={b._id} className="bg-[#0f0f12] border border-white/5 rounded-2xl overflow-hidden">
              {b.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.imageUrl} alt="" className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-36 bg-white/5 flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-gray-700" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-white truncate">{b.title || "Гарчиггүй"}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${b.isActive ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20"}`}>
                    {b.isActive ? "Идэвхтэй" : "Идэвхгүй"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setSelected(b); setForm({ title: b.title || "", imageUrl: b.imageUrl, link: b.link || "", sortOrder: String(b.sortOrder), isActive: b.isActive as unknown as boolean }); setModal("edit"); }}
                    className="flex-1 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 hover:text-white flex items-center justify-center gap-1">
                    <Pencil className="w-3.5 h-3.5" /> Засах
                  </button>
                  <button onClick={() => handleDelete(b)} className="py-1.5 px-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 hover:bg-red-500/20">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal === "create" && (
        <Modal title="Баннер нэмэх" onClose={() => setModal(null)}>
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
        <Modal title="Баннер засах" onClose={() => setModal(null)}>
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
