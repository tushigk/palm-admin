"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  ClipboardList,
  Tag,
  Image,
  HelpCircle,
  MessageSquare,
  Shield,
  FileText,
  ChevronRight,
  Hand,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/admin" },
  { name: "Хэрэглэгчид", icon: Users, href: "/admin/users" },
  { name: "Бүтээгдэхүүн", icon: ShoppingBag, href: "/admin/products" },
  { name: "Захиалга", icon: ClipboardList, href: "/admin/orders" },
  { name: "Категори", icon: Tag, href: "/admin/categories" },
  { name: "Баннер", icon: Image, href: "/admin/banners" },
  { name: "FAQ", icon: HelpCircle, href: "/admin/faqs" },
  { name: "Холбоо барих", icon: MessageSquare, href: "/admin/contacts" },
  { name: "Нууцлал", icon: Shield, href: "/admin/privacy" },
  { name: "Үйлчилгээний нөхцөл", icon: FileText, href: "/admin/terms" },
];

export default function Sidebar({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    logout();
    toast.success("Гарлаа");
    router.push("/");
  };

  return (
    <aside
      className={cn(
        "w-64 min-h-screen bg-[#0f0f12] border-r border-white/5 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Logo */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-600/20">
            <Hand className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Palm Admin
          </span>
        </div>
        <button
          className="lg:hidden text-gray-400 hover:text-white"
          onClick={() => setIsOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-purple-600/10 text-purple-400 border border-purple-600/20"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={cn(
                    "w-5 h-5",
                    isActive
                      ? "text-purple-400"
                      : "text-gray-400 group-hover:text-white"
                  )}
                />
                <span className="font-medium text-sm">{item.name}</span>
              </div>
              <ChevronRight
                className={cn(
                  "w-4 h-4 transition-transform duration-200",
                  isActive
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1"
                )}
              />
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-4 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center">
            <span className="text-purple-400 text-sm font-bold">
              {user?.name?.[0] || user?.phone?.toString()[0] || "A"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.name || `+976 ${user?.phone}`}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Гарах</span>
        </button>
      </div>
    </aside>
  );
}
