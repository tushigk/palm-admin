"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { usersApi } from "@/apis";
import { Users, Search, Plus, Pencil, Trash2, Key, X, Check } from "lucide-react";
import toast from "react-hot-toast";

interface User {
  _id: string;
  phone: number;
  name?: string;
  email?: string;
  role: string;
  createdAt: string;
}

interface Pagination {
  total: number;
  totalPages: number;
  currentPage: number;
}

function RoleBadge({ role }: { role: string }) {
  const colors: Record<string, string> = {
    admin: "bg-red-500/20 text-red-400 border-red-500/30",
    operator: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    user: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${colors[role] || colors.user}`}>
      {role}
    </span>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#151518] border border-white/10 rounded-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [modal, setModal] = useState<"create" | "edit" | "password" | null>(null);
  const [selected, setSelected] = useState<User | null>(null);

  // Form state
  const [form, setForm] = useState({ phone: "", password: "", role: "admin", name: "" });
  const [pwForm, setPwForm] = useState({ password: "" });
  const [saving, setSaving] = useState(false);

  const { data, isLoading, mutate } = useSWR(
    `users-${page}-${search}`,
    () => usersApi.listUsers({ page, limit: 20, search: search || undefined })
  );

  const users: User[] = data?.users || [];
  const pagination: Pagination = {
    total: data?.total || 0,
    totalPages: data?.totalPages || 1,
    currentPage: data?.currentPage || 1,
  };

  const openCreate = () => {
    setForm({ phone: "", password: "", role: "admin", name: "" });
    setModal("create");
  };

  const openEdit = (u: User) => {
    setSelected(u);
    setForm({ phone: String(u.phone), password: "", role: u.role, name: u.name || "" });
    setModal("edit");
  };

  const openPassword = (u: User) => {
    setSelected(u);
    setPwForm({ password: "" });
    setModal("password");
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      await usersApi.createUser({ phone: Number(form.phone), password: form.password, role: form.role, name: form.name });
      toast.success("Хэрэглэгч үүслээ");
      closeModal();
      mutate();
    } catch (e: unknown) {
      toast.error(getMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { role: form.role, name: form.name };
      if (form.password) payload.password = form.password;
      await usersApi.updateUser(selected._id, payload);
      toast.success("Хадгалагдлаа");
      closeModal();
      mutate();
    } catch (e: unknown) {
      toast.error(getMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await usersApi.changePassword(selected._id, pwForm.password);
      toast.success("Нууц үг солигдлоо");
      closeModal();
    } catch (e: unknown) {
      toast.error(getMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: User) => {
    if (!confirm(`"${u.phone}" хэрэглэгчийг устгах уу?`)) return;
    try {
      await usersApi.deleteUser(u._id);
      toast.success("Устлаа");
      mutate();
    } catch (e: unknown) {
      toast.error(getMsg(e));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-purple-400" /> Хэрэглэгчид
          </h1>
          <p className="text-gray-400 text-sm mt-1">Нийт {pagination.total} хэрэглэгч</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Нэмэх
        </button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setSearch(searchInput), setPage(1))}
            placeholder="Хайх (утас, нэр)..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#0f0f12] border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>
        <button
          onClick={() => { setSearch(searchInput); setPage(1); }}
          className="px-4 py-2.5 bg-[#0f0f12] border border-white/10 rounded-xl text-white text-sm hover:border-purple-500 transition-colors"
        >
          Хайх
        </button>
        {search && (
          <button
            onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
            className="px-4 py-2.5 bg-[#0f0f12] border border-white/10 rounded-xl text-gray-400 text-sm hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#0f0f12] border border-white/5 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Уншиж байна...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Хэрэглэгч олдсонгүй</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Утас</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Нэр</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Эрх</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase">Огноо</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-5 py-3 text-sm text-white font-mono">{u.phone}</td>
                    <td className="px-5 py-3 text-sm text-gray-300">{u.name || "—"}</td>
                    <td className="px-5 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString("mn-MN")}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openPassword(u)} className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors" title="Нууц үг солих">
                          <Key className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(u)} className="p-1.5 text-gray-400 hover:text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(u)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 bg-[#0f0f12] border border-white/10 rounded-lg text-sm text-gray-400 disabled:opacity-40 hover:text-white">
            Өмнөх
          </button>
          <span className="text-sm text-gray-400">{page} / {pagination.totalPages}</span>
          <button disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 bg-[#0f0f12] border border-white/10 rounded-lg text-sm text-gray-400 disabled:opacity-40 hover:text-white">
            Дараах
          </button>
        </div>
      )}

      {/* Create Modal */}
      {modal === "create" && (
        <Modal title="Хэрэглэгч нэмэх" onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Утасны дугаар">
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="99999999" />
            </Field>
            <Field label="Нэр">
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="Нэр" />
            </Field>
            <Field label="Нууц үг">
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} placeholder="••••••••" />
            </Field>
            <Field label="Эрх">
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls}>
                <option value="admin">admin</option>
                <option value="operator">operator</option>
                <option value="user">user</option>
              </select>
            </Field>
            <div className="flex gap-3 pt-2">
              <button onClick={closeModal} className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white">Болих</button>
              <button onClick={handleCreate} disabled={saving} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? "Хадгалж байна..." : <><Check className="w-4 h-4" /> Хадгалах</>}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {modal === "edit" && selected && (
        <Modal title="Хэрэглэгч засах" onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Утасны дугаар">
              <input type="text" value={form.phone} disabled className={`${inputCls} opacity-50`} />
            </Field>
            <Field label="Нэр">
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Эрх">
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={inputCls}>
                <option value="admin">admin</option>
                <option value="operator">operator</option>
                <option value="user">user</option>
              </select>
            </Field>
            <div className="flex gap-3 pt-2">
              <button onClick={closeModal} className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white">Болих</button>
              <button onClick={handleUpdate} disabled={saving} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-sm text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? "Хадгалж байна..." : <><Check className="w-4 h-4" /> Хадгалах</>}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Password Modal */}
      {modal === "password" && selected && (
        <Modal title={`Нууц үг солих — ${selected.phone}`} onClose={closeModal}>
          <div className="space-y-4">
            <Field label="Шинэ нууц үг">
              <input type="password" value={pwForm.password} onChange={(e) => setPwForm({ password: e.target.value })} className={inputCls} placeholder="••••••••" />
            </Field>
            <div className="flex gap-3 pt-2">
              <button onClick={closeModal} className="flex-1 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:text-white">Болих</button>
              <button onClick={handleChangePassword} disabled={saving} className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-xl text-sm text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? "Солиж байна..." : <><Key className="w-4 h-4" /> Солих</>}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30";

function getMsg(err: unknown): string {
  if (typeof err === "object" && err !== null) {
    const e = err as Record<string, unknown>;
    if (typeof e.message === "string") return e.message;
  }
  return "Алдаа гарлаа";
}
