"use client";

import { useCallback, useEffect, useState } from "react";
import { money } from "@/lib/utils";

const fields = [
  ["orderAmount", "订单金额"],
  ["shipmentAmount", "出库金额"],
  ["materialCost", "材料成本"],
  ["laborCost", "人工成本"],
  ["electricityCost", "水电成本"],
  ["depreciationCost", "设备折旧成本"],
  ["socialSecurityCost", "社保成本"],
  ["rentCost", "房租成本"],
  ["logisticsCost", "物流成本"],
  ["packagingCost", "包装成本"],
  ["managementCost", "管理费用"],
  ["otherCost", "其他成本"],
  ["totalCost", "总成本"],
  ["estimatedProfit", "预估利润"],
  ["estimatedProfitRate", "预估利润率%"]
];

export function CostDailyPage() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<Record<string, any>>({});
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/costs/daily?date=${date}`);
    setData(await res.json());
  }, [date]);
  useEffect(() => { load(); }, [load]);

  async function generate() {
    const res = await fetch("/api/costs/daily", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, date }) });
    setData(await res.json());
    setMessage("当日成本核算已生成");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">每日成本核算</h1>
        <p className="mt-1 text-sm text-slate-500">自动读取材料、人工、订单和出库数据，支持手动修正物流、包装和其他成本。</p>
      </div>
      <div className="flex flex-wrap items-end gap-3 rounded border border-slate-200 bg-white p-4">
        <label><span className="mb-1 block text-sm text-slate-600">核算日期</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 rounded border border-slate-200 px-3 text-sm" /></label>
        <button onClick={load} className="h-10 rounded bg-slate-900 px-4 text-sm text-white">读取当天数据</button>
        <button onClick={generate} className="h-10 rounded bg-brand-600 px-4 text-sm font-medium text-white">生成当日成本核算</button>
        <a href="/api/excel/dailyCosts/export?current=0" className="h-10 rounded border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">导出Excel</a>
      </div>
      {message && <div className="rounded border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">{message}</div>}
      <div className="grid gap-4 md:grid-cols-3">
        {fields.map(([key, label]) => (
          <label key={key} className="rounded border border-slate-200 bg-white p-4">
            <span className="text-sm text-slate-500">{label}</span>
            {["logisticsCost", "packagingCost", "otherCost"].includes(key) ? (
              <input type="number" value={data[key] ?? 0} onChange={(e) => setData({ ...data, [key]: Number(e.target.value) })} className="mt-2 h-10 w-full rounded border border-slate-200 px-3 text-lg font-semibold" />
            ) : (
              <div className="mt-2 text-2xl font-semibold text-slate-900">{key.includes("Rate") ? `${Number(data[key] ?? 0).toFixed(2)}%` : `¥${money(data[key])}`}</div>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
