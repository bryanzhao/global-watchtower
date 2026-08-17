import { Link } from "@tanstack/react-router";
import {
  BellRing,
  FileText,
  Globe2,
  Layers,
  ListFilter,
  Microscope,
} from "lucide-react";
import { globalRiskLevel, riskLevelLabel } from "@/data/platform";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "总览", icon: Globe2, exact: true },
  { to: "/feed", label: "信息流", icon: ListFilter, exact: false },
  { to: "/alerts", label: "风险预警", icon: BellRing, exact: false },
  { to: "/channels", label: "风险频道", icon: Layers, exact: false },
  { to: "/topics", label: "专题研究", icon: Microscope, exact: false },
  { to: "/brief", label: "每日简报", icon: FileText, exact: false },
] as const;

const barTone =
  globalRiskLevel === "high"
    ? "bg-destructive"
    : globalRiskLevel === "medium"
      ? "bg-warning"
      : "bg-success";

export function SiteHeader() {
  return (
    <header className="no-print sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-6 px-6">
        <Link to="/" className="flex items-center gap-2.5 transition-colors">
          <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary">
            <Globe2 className="h-4 w-4 text-primary-foreground" aria-hidden />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight">全球安全风险监测平台</span>
            <span className="block text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Global Risk Intelligence
            </span>
          </span>
        </Link>

        <nav className="hidden flex-1 items-center gap-0.5 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.exact }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                "[&.active]:bg-primary/10 [&.active]:text-primary",
              )}
            >
              <item.icon className="h-3.5 w-3.5" aria-hidden />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:ml-0">
          <span className="hidden text-xs text-muted-foreground md:inline">
            数据截止 08-17 08:00 UTC
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-destructive/30 bg-destructive/15 px-2 py-0.5 text-xs font-semibold tracking-wide whitespace-nowrap text-destructive">
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
            全球 {riskLevelLabel[globalRiskLevel]}风险
          </span>
        </div>
      </div>

      <nav className="flex items-center gap-0.5 overflow-x-auto border-t border-border px-4 py-1 lg:hidden">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.exact }}
            className="inline-flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-sm whitespace-nowrap text-muted-foreground transition-colors [&.active]:bg-primary/10 [&.active]:text-primary"
          >
            <item.icon className="h-3.5 w-3.5" aria-hidden />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className={cn("h-[2px] w-full", barTone)} aria-hidden />
    </header>
  );
}