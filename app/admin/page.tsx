"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { statsApi } from "@/apis";
import {
  Users,
  ShoppingBag,
  TrendingUp,
  DollarSign,
  CheckCircle,
  FileText,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface StatsSummary {
  totalUsers: number;
  newUsers: number;
  totalOrders: number;
  invoicesCreated: number;
  paymentsMade: number;
  totalRevenue: number;
  completedOrders: number;
}

interface DailyStat {
  date: string;
  newUsers: number;
  invoices: number;
  payments: number;
  revenue: number;
}

interface TopProduct {
  productId: string;
  title: string;
  sales: number;
  revenue: number;
}

interface StatsData {
  summary: StatsSummary;
  dailyStats: DailyStat[];
  topProducts: TopProduct[];
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  sub,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-[#0f0f12] border border-white/5 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400 mt-1">{title}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));

  const { data, isLoading, error } = useSWR<{ data: StatsData }>(
    `stats-${from}-${to}`,
    () => statsApi.getStats({ from, to })
  );

  const stats = data?.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Платформын ерөнхий мэдээлэл</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="bg-[#0f0f12] border border-white/10 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
          />
          <span className="text-gray-500">—</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="bg-[#0f0f12] border border-white/10 text-white text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          Мэдээлэл татахад алдаа гарлаа.
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-[#0f0f12] border border-white/5 rounded-2xl p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Нийт хэрэглэгч"
              value={stats.summary.totalUsers.toLocaleString()}
              icon={Users}
              color="bg-blue-600"
            />
            <StatCard
              title="Шинэ хэрэглэгч"
              value={stats.summary.newUsers.toLocaleString()}
              icon={TrendingUp}
              color="bg-purple-600"
              sub="Сонгосон хугацаанд"
            />
            <StatCard
              title="Нийт захиалга"
              value={stats.summary.totalOrders.toLocaleString()}
              icon={FileText}
              color="bg-pink-600"
            />
            <StatCard
              title="Төлбөр хийсэн"
              value={stats.summary.paymentsMade.toLocaleString()}
              icon={ShoppingBag}
              color="bg-green-600"
            />
            <StatCard
              title="Дууссан захиалга"
              value={stats.summary.completedOrders.toLocaleString()}
              icon={CheckCircle}
              color="bg-teal-600"
            />
            <StatCard
              title="Нийт орлого"
              value={`₮${stats.summary.totalRevenue.toLocaleString()}`}
              icon={DollarSign}
              color="bg-amber-600"
            />
          </div>

          {/* Daily Stats Chart */}
          <div className="bg-[#0f0f12] border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Өдрийн захиалга</h2>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#666", fontSize: 11 }}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis tick={{ fill: "#666", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }}
                  labelStyle={{ color: "#aaa" }}
                />
                <Line type="monotone" dataKey="payments" stroke="#a855f7" strokeWidth={2} dot={false} name="Төлбөр" />
                <Line type="monotone" dataKey="invoices" stroke="#6366f1" strokeWidth={2} dot={false} name="Нэхэмжлэл" />
                <Line type="monotone" dataKey="newUsers" stroke="#22d3ee" strokeWidth={2} dot={false} name="Хэрэглэгч" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products */}
          {stats.topProducts.length > 0 && (
            <div className="bg-[#0f0f12] border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Шилдэг бүтээгдэхүүн</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#666", fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="title"
                    tick={{ fill: "#aaa", fontSize: 11 }}
                    width={120}
                  />
                  <Tooltip
                    contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }}
                  />
                  <Bar dataKey="sales" fill="#a855f7" radius={[0, 4, 4, 0]} name="Борлуулалт" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
