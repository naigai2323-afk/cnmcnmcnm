"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, FileDown, FileUp, Plus, Search, Trash2 } from "lucide-react";
import { ModuleConfig, enumLabels } from "@/lib/modules";
import { formatDate, money } from "@/lib/utils";

type PreviewRow = { index: number; row: Record<string, unknown>; errors: string[] };

export function CrudPage({ config }: { config: ModuleConfig }) {
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [message, setMessage] = useState("");
  const pages = Math.max(1, Math.ceil(total / 10));

  const load = useCallback(async (targetPage = page) => {
    const params = new URLSearchParams({ page: String(targetPage), pageSize: "10", keyword, startDate, endDate });
    const res = await fetch(`/api/crud/${config.key}?${params}`);
    const data = await res.json();
    setRows(data.rows ?? []);
    setTotal(data.total ?? 0);
  }, [config.key, endDate, keyword, page, startDate]);

  useEffect(() => {
    load(page);
  }, [load, page]);

  const blank = useMemo(() => Object.fromEntries(config.fields.map((field) => [field.key, field.type === "date" ? formatDate(new Date()) : ""])), [config]);

  async function save() {
    if (!editing) return;
    const url = editing.id ? `/api/crud/${config.key}/${editing.id}` : `/api/crud/${config.key}`;
    const method = editing.id ? "PATCH" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    if (!res.ok) {
      setMessage("保存失败，请检查必填项");
      return;
    }
    setEditing(null);
    setMessage("保存成功");
    load();
  }

  async function remove(ids: number[]) {
    if (!ids.length || !confirm("确认删除选中数据？")) return;
    await fetch(`/api/crud/${config.key}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
    setSelected([]);
    load();
  }

  async function previewExcel(file?: File) {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`/api/excel/${config.key}/preview`, { method: "POST", body: form });
    const data = await res.json();
    setPreview(data.rows ?? []);
  }

  async function confirmImport() {
    const valid = preview.filter((row) => row.errors.length === 0).map((row) => row.row);
    const res = await fetch(`/api/excel/${config.key}/confirm`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rows: valid }) });
    const data = await res.json();
    setMessage(`导入成功 ${data.count ?? 0} 条`);
    setPreview([]);
    load();
  }

  const exportUrl = (current: boolean) => {
    const params = new URLSearchParams({ current: current ? "1" : "0", keyword, startDate, endDate });
    return `/api/excel/${config.key}/export?${params}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{config.title}</h1>
          <p className="mt-1 text-sm text-slate-500">支持新增、编辑、删除、筛选、导入、导出和模板下载。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setEditing(blank)} className="inline-flex h-9 items-center gap-2 rounded bg-brand-600 px-3 text-sm font-medium text-white hover:bg-brand-700">
            <Plus size={16} />
            新增
          </button>
          <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50">
            <FileUp size={16} />
            导入Excel
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => previewExcel(e.target.files?.[0])} />
          </label>
          <a href={exportUrl(true)} className="inline-flex h-9 items-center gap-2 rounded border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50">
            <Download size={16} />
            导出筛选
          </a>
          <a href={exportUrl(false)} className="inline-flex h-9 items-center gap-2 rounded border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50">
            <FileDown size={16} />
            导出全部
          </a>
          <a href={`/api/excel/${config.key}/template`} className="inline-flex h-9 items-center gap-2 rounded border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:bg-slate-50">
            下载模板
          </a>
        </div>
      </div>

      <div className="grid gap-3 rounded border border-slate-200 bg-white p-4 md:grid-cols-[1fr_150px_150px_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="关键词搜索" className="h-10 w-full rounded border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-brand-500" />
        </div>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-10 rounded border border-slate-200 px-3 text-sm" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-10 rounded border border-slate-200 px-3 text-sm" />
        <button onClick={() => { setPage(1); load(1); }} className="h-10 rounded bg-slate-900 px-4 text-sm text-white">查询</button>
      </div>

      {message && <div className="rounded border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">{message}</div>}

      {preview.length > 0 && (
        <div className="rounded border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-medium text-slate-900">导入预览</div>
            <button disabled={preview.some((row) => row.errors.length)} onClick={confirmImport} className="rounded bg-brand-600 px-3 py-2 text-sm text-white disabled:bg-slate-300">确认导入</button>
          </div>
          <div className="table-scroll overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500"><tr><th className="px-3 py-2">行号</th><th className="px-3 py-2">状态</th>{config.fields.map((f) => <th key={f.key} className="px-3 py-2">{f.label}</th>)}</tr></thead>
              <tbody>{preview.map((item) => <tr key={item.index} className={item.errors.length ? "bg-red-50" : ""}><td className="px-3 py-2">{item.index}</td><td className="px-3 py-2 text-red-600">{item.errors.join("；") || "可导入"}</td>{config.fields.map((f) => <td key={f.key} className="px-3 py-2">{String(item.row[f.key] ?? "")}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="text-sm text-slate-500">共 {total} 条</div>
          <button onClick={() => remove(selected)} className="inline-flex h-8 items-center gap-2 rounded border border-red-200 px-3 text-sm text-red-600 hover:bg-red-50">
            <Trash2 size={15} />
            批量删除
          </button>
        </div>
        <div className="table-scroll overflow-x-auto">
          <table className="min-w-full whitespace-nowrap text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-3"><input type="checkbox" checked={selected.length === rows.length && rows.length > 0} onChange={(e) => setSelected(e.target.checked ? rows.map((r) => r.id) : [])} /></th>
                {config.fields.map((field) => <th key={field.key} className="px-3 py-3 font-medium">{field.label}</th>)}
                <th className="px-3 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-3 py-3"><input type="checkbox" checked={selected.includes(row.id)} onChange={(e) => setSelected((old) => e.target.checked ? [...old, row.id] : old.filter((id) => id !== row.id))} /></td>
                  {config.fields.map((field) => <td key={field.key} className="px-3 py-3">{renderCell(field.key, row[field.key])}</td>)}
                  <td className="px-3 py-3"><button onClick={() => setEditing(row)} className="mr-3 text-brand-700">编辑</button><button onClick={() => remove([row.id])} className="text-red-600">删除</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-3 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border px-3 py-1 disabled:text-slate-300">上一页</button>
          <span>{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="rounded border px-3 py-1 disabled:text-slate-300">下一页</button>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-slate-900/30 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-lg font-semibold">{editing.id ? "编辑" : "新增"}{config.title}</div>
              <button onClick={() => setEditing(null)} className="text-slate-500">关闭</button>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {config.fields.map((field) => (
                <label key={field.key} className={field.type === "textarea" ? "md:col-span-3" : ""}>
                  <span className="mb-1 block text-sm text-slate-600">{field.label}{field.required && <b className="text-red-500">*</b>}</span>
                  {field.type === "select" ? (
                    <select value={editing[field.key] ?? ""} onChange={(e) => setEditing({ ...editing, [field.key]: e.target.value })} className="h-10 w-full rounded border border-slate-200 px-3 text-sm">
                      <option value="">请选择</option>
                      {field.options?.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea value={editing[field.key] ?? ""} onChange={(e) => setEditing({ ...editing, [field.key]: e.target.value })} className="min-h-20 w-full rounded border border-slate-200 px-3 py-2 text-sm" />
                  ) : (
                    <input type={field.type === "datetime" ? "datetime-local" : field.type} value={field.type === "date" ? formatDate(editing[field.key]) : editing[field.key] ?? ""} onChange={(e) => setEditing({ ...editing, [field.key]: e.target.value })} className="h-10 w-full rounded border border-slate-200 px-3 text-sm" />
                  )}
                </label>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="rounded border border-slate-200 px-4 py-2 text-sm">取消</button>
              <button onClick={save} className="rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderCell(key: string, value: unknown) {
  if (value === null || value === undefined) return "";
  if (enumLabels[key]?.[String(value)]) return enumLabels[key][String(value)];
  if (key.toLowerCase().includes("date") || key === "date") return formatDate(value);
  if (typeof value === "number" && (key.toLowerCase().includes("amount") || key.toLowerCase().includes("cost") || key.toLowerCase().includes("price") || key.toLowerCase().includes("salary") || key.toLowerCase().includes("wage"))) return money(value);
  return String(value);
}
