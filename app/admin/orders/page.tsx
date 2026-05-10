"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { ordersApi, productsApi } from "@/apis";
import { ClipboardList, Plus, CheckCircle, X, Check, Eye } from "lucide-react";
import toast from "react-hot-toast";

interface PalmFormData {
  firstName?: string;
  name?: string;
  birthDate?: string;
  gender?: string;
  phone?: string;
  email?: string;
  dominantHand?: string;
  topics?: string[];
  question?: string;
}

interface Order {
  _id: string;
  user?: { _id: string; phone: number };
  product?: { _id: string; title: string; price: number };
  status: string;
  qpayAmount: number;
  qpayInvoiceId?: string;
  palmFormData?: PalmFormData;
  answer?: string;
  openaiResponseId?: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Төлбөр хүлээж байна",
  paid: "Төлсөн",
  processing: "Боловсруулж байна",
  completed: "Дууссан",
  failed: "Амжилтгүй",
};

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  paid: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  processing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
};

const TOPIC_LABELS: Record<string, string> = {
  love: "❤️ Хайр & Харилцаа",
  money: "💰 Мөнгө & Элбэг",
  career: "💼 Карьер & Уриалга",
  health: "🌿 Эрүүл Мэнд",
  destiny: "⭐ Хувь Тавилан",
  family: "🏡 Гэр Бүл",
  travel: "✈️ Аялал & Шилжилт",
  full: "✨ Бүрэн Уншилт",
};

const GENDER_LABELS: Record<string, string> = { male: "Эрэгтэй", female: "Эмэгтэй" };
const HAND_LABELS: Record<string, string> = { left: "Зүүн", right: "Баруун" };

const inputCls = "w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500";

function getMsg(err: unknown): string {
  if (typeof err === "object" && err !== null) {
    const e = err as Record<string, unknown>;
    if (typeof e.message === "string") return e.message;
  }
  return "Алдаа гарлаа";
}

function GrantModal({ products, onClose }: { products: { _id: string; title: string }[]; onClose: () => void }) {
  const [form, setForm] = useState({ userId: "", productId: "" });
  const [saving, setSaving] = useState(false);

  const handleGrant = async () => {
    setSaving(true);
    try {
      await ordersApi.grantAccess(form.userId, form.productId);
      toast.success("Эрх олгогдлоо");
      onClose();
    } catch (e) {
      toast.error(getMsg(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#151518] border border-white/10 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">Бүтээгдэхүүн ашиглах эрх олгох</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Хэрэглэгч ID</label>
            <input value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} className={inputCls} placeholder="MongoDB ObjectId" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Бүтээгдэхүүн</label>
            <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className={inputCls}>
              <option value="">— Сонгох —</option>
              {products.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300">Болих</button>
            <button onClick={handleGrant} disabled={saving} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? "Олгож байна..." : <><Check className="w-4 h-4" /> Эрх олгох</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderDetailModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const f = order.palmFormData;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#151518] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-white">Захиалгын дэлгэрэнгүй</h3>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">{order._id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Order info */}
          <div className="grid grid-cols-2 gap-3">
            <InfoRow label="Хэрэглэгч утас" value={order.user?.phone?.toString() || "—"} mono />
            <InfoRow label="Бүтээгдэхүүн" value={order.product?.title || "—"} />
            <InfoRow label="Дүн" value={`₮${order.qpayAmount.toLocaleString()}`} />
            <div>
              <p className="text-xs text-gray-500 mb-1">Статус</p>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[order.status] || ""}`}>
                {STATUS_LABELS[order.status] || order.status}
              </span>
            </div>
            <InfoRow label="Үүсгэсэн" value={new Date(order.createdAt).toLocaleString("mn-MN")} />
            <InfoRow label="Шинэчлэгдсэн" value={new Date(order.updatedAt).toLocaleString("mn-MN")} />
            {order.qpayInvoiceId && <InfoRow label="QPay invoice" value={order.qpayInvoiceId} mono />}
          </div>

          {/* Palm form data */}
          {f && (
            <div>
              <h4 className="text-sm font-semibold text-purple-400 mb-3">Хэрэглэгчийн мэдээлэл</h4>
              <div className="bg-black/30 border border-white/5 rounded-xl p-4 grid grid-cols-2 gap-3">
                <InfoRow label="Нэр" value={[f.firstName, f.name].filter(Boolean).join(" ") || "—"} />
                <InfoRow label="Төрсөн огноо" value={f.birthDate || "—"} />
                <InfoRow label="Хүйс" value={GENDER_LABELS[f.gender || ""] || f.gender || "—"} />
                <InfoRow label="Давамгай гар" value={HAND_LABELS[f.dominantHand || ""] || f.dominantHand || "—"} />
                <InfoRow label="Утас" value={f.phone || "—"} mono />
                <InfoRow label="И-мэйл" value={f.email || "—"} />
                {f.topics && f.topics.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Сэдвүүд</p>
                    <div className="flex flex-wrap gap-1.5">
                      {f.topics.map((t) => (
                        <span key={t} className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full">
                          {TOPIC_LABELS[t] || t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {f.question && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Асуулт</p>
                    <p className="text-sm text-gray-300">{f.question}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Answer */}
          {order.answer ? (
            <div>
              <h4 className="text-sm font-semibold text-purple-400 mb-3">Гарын уншлагын хариулт</h4>
              <div className="bg-black/30 border border-white/5 rounded-xl p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">{order.answer}</pre>
              </div>
            </div>
          ) : (
            <div className="bg-black/20 border border-white/5 rounded-xl p-4 text-center text-gray-500 text-sm">
              {order.status === "completed" ? "Хариулт байхгүй" : "Хэрэглэгч гарынхаа зургийг илгээгээгүй байна"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-sm text-gray-200 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [grantModal, setGrantModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data, isLoading, mutate } = useSWR(
    `orders-${page}-${statusFilter}`,
    () => ordersApi.listOrders({ page, limit: 20, status: statusFilter || undefined })
  );
  const { data: productsData } = useSWR("products-grant", () =>
    productsApi.listProducts({ limit: 100 })
  );

  const orders: Order[] = data?.data || [];
  const pagination = data?.pagination || { total: 0, pages: 1, page: 1 };
  const products = productsData?.data || [];

  const handleMarkPaid = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await ordersApi.markOrderPaid(id);
      toast.success("Төлбөр баталгаажлаа");
      mutate();
    } catch (err) {
      toast.error(getMsg(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <ClipboardList className="w-7 h-7 text-purple-400" /> Захиалга
          </h1>
          <p className="text-gray-400 text-sm mt-1">Нийт {pagination.total} захиалга</p>
        </div>
        <button
          onClick={() => setGrantModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Эрх олгох
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {["", ...Object.keys(STATUS_LABELS)].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${statusFilter === s ? "bg-purple-600/20 text-purple-400 border-purple-500/30" : "bg-[#0f0f12] text-gray-400 border-white/10 hover:text-white"}`}
          >
            {s ? STATUS_LABELS[s] : "Бүгд"}
          </button>
        ))}
      </div>

      <div className="bg-[#0f0f12] border border-white/5 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Уншиж байна...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Захиалга олдсонгүй</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Хэрэглэгч</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Бүтээгдэхүүн</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Дүн</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Статус</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Огноо</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr
                    key={o._id}
                    onClick={() => setSelectedOrder(o)}
                    className="border-b border-white/5 hover:bg-white/3 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3 text-sm font-mono text-gray-300">{o.user?.phone || "—"}</td>
                    <td className="px-5 py-3 text-sm text-white">{o.product?.title || "—"}</td>
                    <td className="px-5 py-3 text-sm text-white">₮{o.qpayAmount.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[o.status] || ""}`}>
                        {STATUS_LABELS[o.status] || o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {new Date(o.createdAt).toLocaleDateString("mn-MN")}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {o.status === "pending_payment" && (
                          <button
                            onClick={(e) => handleMarkPaid(e, o._id)}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-xs hover:bg-green-500/20 transition-colors"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Баталгаажуулах
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); }}
                          className="p-1.5 text-gray-500 hover:text-white transition-colors"
                        >
                          <Eye className="w-4 h-4" />
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

      {grantModal && (
        <GrantModal products={products} onClose={() => setGrantModal(false)} />
      )}

      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
