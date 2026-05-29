import { AppShell } from "@/components/AppShell";

export default function Page() {
  return (
    <AppShell>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">系统设置</h1>
          <p className="mt-1 text-sm text-slate-500">第一版通过 system_settings 表和 .env 保存 DeepSeek、飞书、钉钉参数。</p>
        </div>
        <div className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-600">
          已预留 DEEPSEEK_API_KEY、DEEPSEEK_BASE_URL、DEEPSEEK_MODEL、FEISHU_APP_ID、FEISHU_APP_SECRET、DINGTALK_APP_KEY、DINGTALK_APP_SECRET。
        </div>
      </div>
    </AppShell>
  );
}
