"use client";

import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { privacyApi } from "@/apis";
import { Shield, Save } from "lucide-react";
import toast from "react-hot-toast";

function getMsg(err: unknown): string {
  if (typeof err === "object" && err !== null) {
    const e = err as Record<string, unknown>;
    if (typeof e.message === "string") return e.message;
  }
  return "Алдаа гарлаа";
}

export default function PrivacyPage() {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useSWR("privacy", () => privacyApi.getPrivacy());

  useEffect(() => {
    if (data?.data?.content) setContent(data.data.content);
    else if (data?.content) setContent(data.content);
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await privacyApi.upsertPrivacy(content);
      toast.success("Нууцлалын бодлого хадгалагдлаа");
    } catch (e) {
      toast.error(getMsg(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <Shield className="w-7 h-7 text-purple-400" /> Нууцлалын бодлого
        </h1>
        <button
          onClick={handleSave}
          disabled={saving || isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Хадгалж байна..." : "Хадгалах"}
        </button>
      </div>

      <div className="bg-[#0f0f12] border border-white/5 rounded-2xl p-6">
        {isLoading ? (
          <div className="h-96 animate-pulse bg-white/5 rounded-xl" />
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={30}
            className="w-full bg-black/30 border border-white/10 rounded-xl text-white text-sm p-4 focus:outline-none focus:border-purple-500 resize-y font-mono"
            placeholder="Нууцлалын бодлогын агуулга..."
          />
        )}
      </div>
    </div>
  );
}
