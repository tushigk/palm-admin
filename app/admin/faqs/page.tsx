"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { faqsApi } from "@/apis";
import { HelpCircle, Plus, Pencil, Trash2, X, Check, ChevronDown, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

interface Faq {
  _id: string;
  question: string;
  answer: string;
  sortOrder?: number;
  isActive?: boolean;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#151518] border border-white/10 rounded-2xl w-full max-w-lg">
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

export default function FaqsPage() {
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Faq | null>(null);
  const [form, setForm] = useState({ question: "", answer: "", sortOrder: "0" });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading, mutate } = useSWR("faqs", () => faqsApi.listFaqs());
  const faqs: Faq[] = data?.data || data?.faqs || [];

  const handleCreate = async () => {
    setSaving(true);
    try {
      await faqsApi.createFaq({ question: form.question, answer: form.answer, sortOrder: Number(form.sortOrder) });
      toast.success("FAQ нэмэгдлээ");
      setModal(null);
      mutate();
    } catch (e) { toast.error(getMsg(e)); }
    finally { setSaving(false); }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await faqsApi.updateFaq(selected._id, { question: form.question, answer: form.answer, sortOrder: Number(form.sortOrder) });
      toast.success("Хадгалагдлаа");
      setModal(null);
      mutate();
    } catch (e) { toast.error(getMsg(e)); }
    finally { setSaving(false); }
  };

  const handleDelete = async (f: Faq) => {
    if (!confirm("FAQ устгах уу?")) return;
    try {
      await faqsApi.deleteFaq(f._id);
      toast.success("Устлаа");
      mutate();
    } catch (e) { toast.error(getMsg(e)); }
  };

  const FormContent = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Асуулт</label>
        <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className={inputCls} placeholder="Асуулт..." />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Хариулт</label>
        <textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} rows={5} className={inputCls} placeholder="Хариулт..." />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Эрэмбэ</label>
        <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className={inputCls} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <HelpCircle className="w-7 h-7 text-purple-400" /> Түгээмэл асуулт
        </h1>
        <button
          onClick={() => { setForm({ question: "", answer: "", sortOrder: "0" }); setModal("create"); }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Нэмэх
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Уншиж байна...</div>
      ) : faqs.length === 0 ? (
        <div className="p-8 text-center text-gray-500">FAQ олдсонгүй</div>
      ) : (
        <div className="space-y-2">
          {faqs.map((f) => (
            <div key={f._id} className="bg-[#0f0f12] border border-white/5 rounded-xl overflow-hidden">
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/[0.02]"
                onClick={() => setExpanded(expanded === f._id ? null : f._id)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {expanded === f._id ? <ChevronDown className="w-4 h-4 text-purple-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />}
                  <span className="text-sm font-medium text-white truncate">{f.question}</span>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); setSelected(f); setForm({ question: f.question, answer: f.answer, sortOrder: String(f.sortOrder || 0) }); setModal("edit"); }}
                    className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(f); }}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {expanded === f._id && (
                <div className="px-5 pb-4 text-sm text-gray-400 whitespace-pre-wrap border-t border-white/5 pt-3">
                  {f.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal === "create" && (
        <Modal title="FAQ нэмэх" onClose={() => setModal(null)}>
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
        <Modal title="FAQ засах" onClose={() => setModal(null)}>
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
