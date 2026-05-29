"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  Database,
  Factory,
  FileSpreadsheet,
  LogOut,
  PackageCheck,
  Settings,
  Truck,
  UserRoundCog,
  Users,
  WalletCards,
  Warehouse
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "经营驾驶舱", icon: BarChart3 },
  { href: "/purchases", label: "采购管理", icon: ClipboardList },
  { href: "/warehouse/receipts", label: "仓库收货", icon: Warehouse },
  { href: "/orders", label: "订单管理", icon: PackageCheck },
  { href: "/production/materials", label: "生产领料", icon: Factory },
  { href: "/production/stock-ins", label: "生产入库", icon: Boxes },
  { href: "/shipments", label: "订单出库", icon: Truck },
  { href: "/employees", label: "员工档案", icon: Users },
  { href: "/attendance", label: "考勤工时", icon: UserRoundCog },
  { href: "/costs/settings", label: "成本参数", icon: Settings },
  { href: "/costs/daily", label: "每日成本", icon: WalletCards },
  { href: "/import-export", label: "导入导出", icon: FileSpreadsheet },
  { href: "/ai/review", label: "AI待审核", icon: Database },
  { href: "/settings", label: "系统设置", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }
  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
          <div className="grid h-9 w-9 place-items-center rounded bg-brand-600 text-white">
            <Factory size={20} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">factory-dashboard</div>
            <div className="text-xs text-slate-500">工厂经营数据驾驶舱</div>
          </div>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 items-center gap-3 rounded px-3 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  active && "bg-brand-50 font-medium text-brand-700"
                )}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-8">
          <div>
            <div className="text-sm text-slate-500">内部经营系统</div>
            <div className="text-lg font-semibold text-slate-900">工厂经营数据驾驶舱</div>
          </div>
          <button onClick={logout} className="inline-flex h-9 items-center gap-2 rounded border border-slate-200 bg-white px-3 text-sm text-slate-600 hover:bg-slate-50">
            <LogOut size={16} />
            退出
          </button>
        </header>
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
