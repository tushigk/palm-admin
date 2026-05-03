"use client";

import React, { useEffect, useState } from "react";
import { Phone, Lock, LogIn, Hand } from "lucide-react";
import { useRouter } from "next/navigation";
import { authApi } from "@/apis";
import { useAuth, User } from "@/components/providers/AuthProvider";

type LoginResponse = {
  token?: string;
  user?: User;
  message?: string;
};

export default function AdminLoginPage() {
  const { login: authLogin, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) router.push("/admin");
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.login({ phone, password });
      const data: LoginResponse =
        typeof res === "object" && res !== null && "data" in res
          ? (res as { data: LoginResponse }).data
          : (res as LoginResponse);

      if (data?.token) {
        if (data.user?.role === "user") {
          setError("Танд админ эрх байхгүй байна.");
          return;
        }
        authLogin(data.token, data.user);
        router.push("/admin");
        return;
      }
      setError(data?.message ?? "Нэвтрэхэд алдаа гарлаа.");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 rounded-xl bg-purple-600 animate-pulse flex items-center justify-center">
          <Hand className="text-white w-6 h-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(circle_at_50%_50%,rgba(100,50,150,0.15),rgba(0,0,0,1))] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 mb-4 shadow-xl shadow-purple-900/30">
            <Hand className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Palm Admin
          </h1>
          <p className="text-gray-400 mt-2">Системд нэвтрэх</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Утасны дугаар
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium"
                  placeholder="99999999"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Нууц үг
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Нэвтэрч байна..." : "Нэвтрэх"}
              {!isLoading && <LogIn className="w-5 h-5" />}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-sm mt-8">
          &copy; {new Date().getFullYear()} Palm. Бүх эрх хуулиар хамгаалагдсан.
        </p>
      </div>
    </div>
  );
}

function getErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null) {
    const e = err as Record<string, unknown>;
    if (typeof e.message === "string" && e.message.trim()) return e.message;
  }
  return "Нууц үг эсвэл утасны дугаар буруу байна.";
}
