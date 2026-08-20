import { Link } from "@tanstack/react-router";
import { Flag, Globe2, LayoutDashboard, ListFilter, Layers, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "全局概览", icon: LayoutDashboard, exact: true },
  { to: "/risk", label: "风险信息流", icon: ShieldAlert, exact: false },
  { to: "/topics", label: "专题", icon: Layers, exact: false },
  { to: "/countries", label: "国别", icon: Flag, exact: false },
  { to: "/raw", label: "原始信息流", icon: ListFilter, exact: false, internal: true },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-6 px-6">
        <Link to="/" className="flex items-center gap-2.5 transition-colors">
          <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary">
            <Globe2 className="h-4 w-4 text-primary-foreground" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight">全球安全风险监测平台</span>
            <span className="block text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Production Workbench
            </span>
          </span>
        </Link>

        <nav className="flex flex-1 items-center gap-0.5">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              title={"internal" in item && item.internal ? "内部工作台：未来仅登录且有权限的员工可见" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                "[&.active]:bg-primary/10 [&.active]:text-primary",
                "internal" in item && item.internal ? "ml-auto border border-dashed border-border" : "",
              )}
            >
              <item.icon className="h-3.5 w-3.5" aria-hidden />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="h-[2px] w-full bg-destructive" aria-hidden />
    </header>
  );
}
