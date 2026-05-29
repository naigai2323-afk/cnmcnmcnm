import { AppShell } from "@/components/AppShell";
import { modules } from "@/lib/modules";

export default function Page() {
  const items = Object.values(modules).filter((item) => item.key !== "dailyCosts");
  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">数据导入导出中心</h1>
          <p className="mt-1 text-sm text-slate-500">集中下载模板和导出全量数据；导入请进入各业务模块完成预览确认。</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <div key={item.key} className="rounded border border-slate-200 bg-white p-4">
              <div className="font-medium text-slate-900">{item.title}</div>
              <div className="mt-4 flex gap-2">
                <a href={`/api/excel/${item.key}/template`} className="rounded border border-slate-200 px-3 py-2 text-sm">下载模板</a>
                <a href={`/api/excel/${item.key}/export?current=0`} className="rounded bg-brand-600 px-3 py-2 text-sm text-white">导出全部</a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
