"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { money } from "@/lib/utils";
import { enumLabels } from "@/lib/modules";

const cardLabels: Record<string, string> = {
  orderAmount: "今日订单金额",
  shipmentAmount: "今日出库金额",
  purchaseAmount: "今日采购金额",
  receiptAmount: "今日收货数量",
  materialCost: "今日领料成本",
  finishedQuantity: "今日成品入库数量",
  semiFinishedQuantity: "今日半成品入库数量",
  formalCount: "今日正式工人数",
  formalHours: "今日正式工工时",
  directTempCount: "今日直招临时工人数",
  directTempHours: "今日直招临时工工时",
  laborDispatchCount: "今日劳务派遣人数",
  laborDispatchHours: "今日劳务派遣工时",
  laborCost: "今日人工成本",
  achievementRate: "今日订单达成率",
  estimatedProfit: "今日预估利润",
  estimatedProfitRate: "今日预估利润率"
};

const moneyKeys = new Set(["orderAmount", "shipmentAmount", "purchaseAmount", "materialCost", "laborCost", "estimatedProfit"]);

export function DashboardPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/dashboard/summary").then((res) => res.json()).then(setData);
  }, []);
  if (!data) return <div className="text-sm text-slate-500">加载经营数据...</div>;

  const hourPie = (data.attendance ?? []).map((item: any) => ({ name: enumLabels.employeeType[item.employeeType], value: Number(item._sum.totalHours ?? 0) }));
  const costPie = [
    ["材料", data.costBreakdown.materialCost],
    ["人工", data.costBreakdown.laborCost],
    ["水电", data.costBreakdown.electricityCost],
    ["折旧", data.costBreakdown.depreciationCost],
    ["社保", data.costBreakdown.socialSecurityCost],
    ["房租", data.costBreakdown.rentCost],
    ["其他", data.costBreakdown.otherCost]
  ].map(([name, value]) => ({ name, value: Number(value ?? 0) })).filter((item) => item.value > 0);
  const colors = ["#2375d6", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6", "#0f766e", "#64748b"];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">首页经营驾驶舱</h1>
        <p className="mt-1 text-sm text-slate-500">汇总采购、收货、订单、生产、人员和成本，异常规则实时提醒。</p>
      </div>

      {data.alerts.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.alerts.map((alert: any, index: number) => (
            <div key={index} className={`rounded border px-4 py-3 text-sm ${alert.level === "red" ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
              {alert.text}
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
        {Object.entries(cardLabels).map(([key, label]) => (
          <div key={key} className="rounded border border-slate-200 bg-white p-4">
            <div className="text-xs text-slate-500">{label}</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{formatCard(key, data.cards[key])}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartPanel title="最近7天订单金额趋势"><LineGraph data={data.trend} dataKey="orderAmount" /></ChartPanel>
        <ChartPanel title="最近7天出库金额趋势"><AreaGraph data={data.trend} dataKey="shipmentAmount" /></ChartPanel>
        <ChartPanel title="最近7天人工成本趋势"><BarGraph data={data.trend} dataKey="laborCost" /></ChartPanel>
        <ChartPanel title="最近7天材料成本趋势"><BarGraph data={data.trend} dataKey="materialCost" /></ChartPanel>
        <ChartPanel title="人员类型工时占比"><PieGraph data={hourPie} colors={colors} /></ChartPanel>
        <ChartPanel title="成本构成"><PieGraph data={costPie} colors={colors} /></ChartPanel>
        <ChartPanel title="订单达成率趋势"><LineGraph data={data.trend} dataKey="achievementRate" /></ChartPanel>
      </div>
    </div>
  );
}

function formatCard(key: string, value: unknown) {
  const n = Number(value ?? 0);
  if (key.includes("Rate")) return `${n.toFixed(1)}%`;
  if (moneyKeys.has(key)) return `¥${money(n)}`;
  return n.toLocaleString("zh-CN", { maximumFractionDigits: 2 });
}

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="h-80 rounded border border-slate-200 bg-white p-4"><div className="mb-3 font-medium text-slate-900">{title}</div>{children}</div>;
}

function LineGraph({ data, dataKey }: { data: any[]; dataKey: string }) {
  return <ResponsiveContainer width="100%" height="85%"><LineChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Line type="monotone" dataKey={dataKey} stroke="#2375d6" strokeWidth={2} /></LineChart></ResponsiveContainer>;
}

function AreaGraph({ data, dataKey }: { data: any[]; dataKey: string }) {
  return <ResponsiveContainer width="100%" height="85%"><AreaChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Area type="monotone" dataKey={dataKey} stroke="#16a34a" fill="#dcfce7" /></AreaChart></ResponsiveContainer>;
}

function BarGraph({ data, dataKey }: { data: any[]; dataKey: string }) {
  return <ResponsiveContainer width="100%" height="85%"><BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Bar dataKey={dataKey} fill="#2375d6" /></BarChart></ResponsiveContainer>;
}

function PieGraph({ data, colors }: { data: any[]; colors: string[] }) {
  return <ResponsiveContainer width="100%" height="85%"><PieChart><Pie data={data} dataKey="value" nameKey="name" outerRadius={92} label>{data.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>;
}
