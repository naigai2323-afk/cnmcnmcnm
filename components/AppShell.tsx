"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  Database,
  Factory,
  FileSpreadsheet,
  LogOut,
  Menu,
  PackageCheck,
  Settings,
  Truck,
  UserRoundCog,
  Users,
  WalletCards,
  Warehouse,
  X
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-slate-200 bg-white lg:block">
        <SidebarContent pathname={pathname} onLogout={logout} />
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="关闭菜单遮罩"
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r border-slate-200 bg-white shadow-xl">
            <SidebarContent pathname={pathname} onLogout={logout} mobile onClose={() => setMobileMenuOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <button
              aria-label={mobileMenuOpen ? "关闭菜单" : "打开菜单"}
              className="inline-flex h-10 w-10 items-center justify-center rounded border border-slate-200 bg-white text-slate-700 lg:hidden"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <div>
              <div className="text-sm text-slate-500">内部经营系统</div>
              <div className="text-lg font-semibold text-slate-900">工厂经营数据驾驶舱</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="inline-flex h-9 items-center gap-2 rounded border border-slate-200 bg-white px-3 text-sm text-slate-600 hover:bg-slate-50"
          >
            <LogOut size={16} />
            退出
          </button>
        </header>
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  pathname,
  onLogout,
  mobile = false,
  onClose
}: {
  pathname: string;
  onLogout: () => Promise<void>;
  mobile?: boolean;
  onClose?: () => void;
}) {
  return (
    <>
      <div className="flex h-16 items-center justify-between gap-3 border-b border-slate-200 px-5">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded bg-brand-600 text-white">
            <Factory size={20} />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">factory-dashboard</div>
            <div className="text-xs text-slate-500">工厂经营数据驾驶舱</div>
          </div>
        </div>
        {mobile && onClose && (
          <button
            aria-label="关闭菜单"
            className="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-200 text-slate-600"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        )}
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
      {mobile && (
        <div className="border-t border-slate-200 px-3 py-4">
          <button
            onClick={onLogout}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded border border-slate-200 bg-white text-sm text-slate-700"
          >
            <LogOut size={16} />
            退出登录
          </button>
        </div>
      )}
    </>
  );
}
