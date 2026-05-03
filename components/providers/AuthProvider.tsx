"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import { siteUrl } from "@/config/site";
import { HttpRequest } from "@/utils/request";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export interface User {
  _id: string;
  phone: number;
  name?: string;
  email?: string;
  role?: string;
  provider?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: Error | null;
  login: (token: string, userData?: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (saved) {
      const loginTime = localStorage.getItem("login_time");
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      const expired = !loginTime || Date.now() - parseInt(loginTime) > sevenDays;
      if (expired) {
        localStorage.removeItem("token");
        localStorage.removeItem("login_time");
      } else {
        React.startTransition(() => setTokenState(saved));
      }
    }
  }, []);

  const { data: user, error, isLoading } = useSWR<User>(
    token ? `${siteUrl}/auth/me` : null,
    async () => new HttpRequest(token).get("/auth/me"),
    { revalidateOnFocus: true, shouldRetryOnError: false }
  );

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("login_time");
    React.startTransition(() => setTokenState(null));
    mutate(`${siteUrl}/auth/me`, null, false);
  };

  useEffect(() => {
    if (error && token) {
      const err = error as Record<string, unknown>;
      if (err.status === 401 || err.status === 500) {
        toast.error("Сессий дууссан. Дахин нэвтэрнэ үү.", { id: "session-expired" });
        logout();
        router.push("/");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, token]);

  const login = (newToken: string, userData?: User) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("login_time", Date.now().toString());
    React.startTransition(() => setTokenState(newToken));
    if (userData) {
      mutate(`${siteUrl}/auth/me`, userData, false);
    } else {
      mutate(`${siteUrl}/auth/me`);
    }
  };

  useEffect(() => {
    if (user && user.role === "user") {
      logout();
      router.push("/");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        token,
        isLoading,
        error: error || null,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
