"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { contactsApi } from "@/apis";
import { MessageSquare, CheckCircle, X } from "lucide-react";
import toast from "react-hot-toast";

interface Contact {
  _id: string;
  name?: string;
  phone?: string;
  email?: string;
  message: string;
  status: "new" | "read" | "resolved";
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  new: "Шинэ",
  read: "Уншсан",
  resolved: "Шийдвэрлэсэн",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  read: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  resolved: "bg-green-500/10 text-green-400 border-green-500/20",
};

function getMsg(err: unknown): string {
  if (typeof err === "object" && err !== null) {
    const e = err as Record<string, unknown>;
    if (typeof e.message === "string") return e.message;
  }
  return "Алдаа гарлаа";
}

export default function ContactsPage() {
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<Contact | null>(null);

  const { data, isLoading, mutate } = useSWR(
    `contacts-${page}`,
    () => contactsApi.listContacts({ page, limit: 20 })
  );

  const contacts: Contact[] = data?.data || data?.contacts || [];
  const pagination = data?.pagination || { total: 0, pages: 1, page: 1 };

  const handleStatus = async (id: string, status: string) => {
    try {
      await contactsApi.updateContactStatus(id, status);
      toast.success("Статус шинэчлэгдлээ");
      mutate();
      if (detail?._id === id) setDetail((prev) => prev ? { ...prev, status: status as Contact["status"] } : null);
    } catch (e) {
      toast.error(getMsg(e));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <MessageSquare className="w-7 h-7 text-purple-400" /> Холбоо барих
        </h1>
        <p className="text-gray-400 text-sm mt-1">Хэрэглэгчийн мессежүүд</p>
      </div>

      <div className="bg-[#0f0f12] border border-white/5 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Уншиж байна...</div>
        ) : contacts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Мессеж олдсонгүй</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Нэр</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Утас / И-мэйл</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Мессеж</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Статус</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Огноо</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c._id} className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer" onClick={() => setDetail(c)}>
                    <td className="px-5 py-3 text-sm text-white">{c.name || "—"}</td>
                    <td className="px-5 py-3 text-sm text-gray-400">{c.phone || c.email || "—"}</td>
                    <td className="px-5 py-3 text-sm text-gray-400 max-w-xs truncate">{c.message}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[c.status] || ""}`}>
                        {STATUS_LABELS[c.status] || c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {new Date(c.createdAt).toLocaleDateString("mn-MN")}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {c.status !== "resolved" && (
                          <button
                            onClick={() => handleStatus(c._id, "resolved")}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg text-xs hover:bg-green-500/20"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Шийдвэрлэх
                          </button>
                        )}
                        {c.status === "new" && (
                          <button
                            onClick={() => handleStatus(c._id, "read")}
                            className="px-2.5 py-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg text-xs hover:bg-yellow-500/20"
                          >
                            Уншсан
                          </button>
                        )}
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

      {/* Detail panel */}
      {detail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#151518] border border-white/10 rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h3 className="text-lg font-semibold text-white">Мессеж дэлгэрэнгүй</h3>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Нэр:</span> <span className="text-white ml-2">{detail.name || "—"}</span></div>
                <div><span className="text-gray-500">Утас:</span> <span className="text-white ml-2">{detail.phone || "—"}</span></div>
                <div><span className="text-gray-500">И-мэйл:</span> <span className="text-white ml-2">{detail.email || "—"}</span></div>
                <div><span className="text-gray-500">Огноо:</span> <span className="text-white ml-2">{new Date(detail.createdAt).toLocaleString("mn-MN")}</span></div>
              </div>
              <div>
                <p className="text-gray-500 text-sm mb-2">Мессеж:</p>
                <p className="text-white text-sm bg-black/30 rounded-xl p-4 whitespace-pre-wrap">{detail.message}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${STATUS_COLORS[detail.status]}`}>
                  {STATUS_LABELS[detail.status]}
                </span>
                {detail.status !== "resolved" && (
                  <button onClick={() => handleStatus(detail._id, "resolved")} className="text-xs px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20">
                    Шийдвэрлэсэн болгох
                  </button>
                )}
                {detail.status === "new" && (
                  <button onClick={() => handleStatus(detail._id, "read")} className="text-xs px-3 py-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg hover:bg-yellow-500/20">
                    Уншсан болгох
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
