"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Factory } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123456");
  const [message, setMessage] = useState("");
  async function login(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    if (!res.ok) {
      setMessage("登录失败，请检查账号密码");
      return;
    }
    router.push("/dashboard");
  }
  return (
    <div className="grid min-h-screen place-items-center bg-[#f5f7fb] px-4">
      <form onSubmit={login} className="w-full max-w-md rounded border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded bg-brand-600 text-white"><Factory /></div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">工厂经营数据驾驶舱</h1>
            <p className="text-sm text-slate-500">内部经营系统登录</p>
          </div>
        </div>
        <label className="mb-4 block">
          <span className="mb-1 block text-sm text-slate-600">邮箱</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 w-full rounded border border-slate-200 px-3 outline-none focus:border-brand-500" />
        </label>
        <label className="mb-6 block">
          <span className="mb-1 block text-sm text-slate-600">密码</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 w-full rounded border border-slate-200 px-3 outline-none focus:border-brand-500" />
        </label>
        {message && <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{message}</div>}
        <button className="h-11 w-full rounded bg-brand-600 font-medium text-white hover:bg-brand-700">登录</button>
        <p className="mt-4 text-center text-xs text-slate-500">测试账号：admin@example.com / admin123456</p>
      </form>
    </div>
  );
}
