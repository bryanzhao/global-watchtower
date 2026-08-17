import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { sourceClassMap } from "@/data/platform";
import type { SourceClassId } from "@/data/types";

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">{children}</p>
  );
}

export function SectionTitle({
  children,
  aside,
}: {
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <h2 className="text-sm font-semibold tracking-wider uppercase">{children}</h2>
      {aside ? <div className="text-xs text-muted-foreground">{aside}</div> : null}
    </div>
  );
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-md border border-border bg-card", className)}>{children}</div>
  );
}

export function KpiCard({
  label,
  value,
  unit,
  delta,
  deltaTone = "neutral",
  source,
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  deltaTone?: "up-bad" | "down-good" | "neutral";
  source?: string;
}) {
  const tone =
    deltaTone === "up-bad"
      ? "text-destructive"
      : deltaTone === "down-good"
        ? "text-success"
        : "text-muted-foreground";
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <p className="text-xs tracking-wider text-muted-foreground uppercase">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums">
        {value}
        {unit ? <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span> : null}
      </p>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className={tone}>{delta ?? "—"}</span>
        <span className="text-muted-foreground">{source ?? ""}</span>
      </div>
    </div>
  );
}

export function SourceBadge({ id }: { id: SourceClassId }) {
  const source = sourceClassMap[id];
  return (
    <span className="inline-block rounded-sm border border-border bg-surface px-2 py-0.5 text-xs font-medium whitespace-nowrap text-muted-foreground">
      {source.name}
    </span>
  );
}

export function StatusText({ children, tone }: { children: ReactNode; tone: "bad" | "warn" | "muted" | "good" }) {
  const cls =
    tone === "bad"
      ? "text-destructive"
      : tone === "warn"
        ? "text-warning-foreground"
        : tone === "good"
          ? "text-success"
          : "text-muted-foreground";
  return <span className={cn("text-sm", cls)}>{children}</span>;
}

export function SourceLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="inline-flex items-center gap-1 text-primary transition-colors hover:underline"
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
    </a>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block rounded-sm border border-border bg-surface px-2 py-0.5 text-xs font-medium whitespace-nowrap">
      {children}
    </span>
  );
}

export function PendingTag({ children = "待接入" }: { children?: ReactNode }) {
  return (
    <span className="inline-block rounded-sm border border-warning/40 bg-warning/20 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-warning-foreground">
      {children}
    </span>
  );
}