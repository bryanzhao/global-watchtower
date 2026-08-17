import { riskLevelClass, riskLevelLabel } from "@/data/platform";
import type { RiskLevel } from "@/data/types";
import { cn } from "@/lib/utils";

export function RiskBadge({
  level,
  className,
  suffix = "风险",
}: {
  level: RiskLevel;
  className?: string;
  suffix?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 text-xs font-semibold tracking-wide whitespace-nowrap",
        riskLevelClass[level],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {riskLevelLabel[level]}
      {suffix}
    </span>
  );
}