"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import useSWR from "swr";
import { privacyApi } from "@/apis";
import { Shield, Save } from "lucide-react";
import toast from "react-hot-toast";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["link"],
    ["clean"],
  ],
};

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
      <style>{`
        .ql-dark .ql-toolbar {
          background: #0f0f12;
          border-color: rgba(255,255,255,0.08) !important;
          border-radius: 12px 12px 0 0;
        }
        .ql-dark .ql-container {
          background: rgba(0,0,0,0.3);
          border-color: rgba(255,255,255,0.08) !important;
          border-radius: 0 0 12px 12px;
          min-height: 480px;
          font-size: 14px;
        }
        .ql-dark .ql-editor {
          color: #e5e7eb;
          min-height: 480px;
        }
        .ql-dark .ql-editor.ql-blank::before {
          color: #6b7280;
          font-style: normal;
        }
        .ql-dark .ql-toolbar .ql-stroke { stroke: #9ca3af; }
        .ql-dark .ql-toolbar .ql-fill { fill: #9ca3af; }
        .ql-dark .ql-toolbar .ql-picker { color: #9ca3af; }
        .ql-dark .ql-toolbar button:hover .ql-stroke,
        .ql-dark .ql-toolbar button.ql-active .ql-stroke { stroke: #a78bfa; }
        .ql-dark .ql-toolbar button:hover .ql-fill,
        .ql-dark .ql-toolbar button.ql-active .ql-fill { fill: #a78bfa; }
        .ql-dark .ql-toolbar button:hover,
        .ql-dark .ql-toolbar button.ql-active { color: #a78bfa; }
        .ql-dark .ql-toolbar .ql-picker-label:hover,
        .ql-dark .ql-toolbar .ql-picker-item:hover { color: #a78bfa; }
        .ql-dark .ql-toolbar .ql-picker-options {
          background: #1a1a1f;
          border-color: rgba(255,255,255,0.1) !important;
        }
        .ql-dark .ql-editor a { color: #a78bfa; }
      `}</style>

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
          <div className="ql-dark">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              placeholder="Нууцлалын бодлогын агуулга..."
            />
          </div>
        )}
      </div>
    </div>
  );
}
