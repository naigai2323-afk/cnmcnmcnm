"use client";

import { useEffect, useState } from "react";
import { enumLabels } from "@/lib/modules";

export function AiReviewPage() {
  const [rows, setRows] = useState<any[]>([]);
  async function load() {
    setRows(await fetch("/api/ai/review").then((res) => res.json()));
  }
  useEffect(() => { load(); }, []);
  async function update(id: number, status: string) {
    await fetch(`/api/ai/review/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    load();
  }
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">飞书/AI 解析数据待审核</h1>
        <p className="mt-1 text-sm text-slate-500">第一版保留流程：飞书消息入库、DeepSeek解析、管理员审核，后续审核通过后写入业务表。</p>
      </div>
      <div className="rounded border border-slate-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500"><tr><th className="px-3 py-3">时间</th><th className="px-3 py-3">模块</th><th className="px-3 py-3">原文</th><th className="px-3 py-3">解析JSON</th><th className="px-3 py-3">状态</th><th className="px-3 py-3">操作</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => <tr key={row.id}><td className="px-3 py-3">{row.createdAt?.slice(0, 10)}</td><td className="px-3 py-3">{row.moduleType}</td><td className="max-w-xs px-3 py-3">{row.rawText}</td><td className="max-w-md px-3 py-3"><pre className="whitespace-pre-wrap text-xs">{JSON.stringify(row.parsedJson, null, 2)}</pre></td><td className="px-3 py-3">{enumLabels.status[row.status]}</td><td className="px-3 py-3"><button onClick={() => update(row.id, "approved")} className="mr-3 text-brand-700">通过</button><button onClick={() => update(row.id, "rejected")} className="text-red-600">驳回</button></td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
