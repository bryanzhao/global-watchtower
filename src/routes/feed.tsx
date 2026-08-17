import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { PageShell } from "@/components/platform/PageShell";
import {
  Panel,
  PendingTag,
  SectionTitle,
  SourceBadge,
  SourceLink,
  Tag,
} from "@/components/platform/Primitives";
import { RiskBadge } from "@/components/platform/RiskBadge";
import { AlertComposer } from "@/components/platform/AlertComposer";
import { channels, feedEntries, riskTypeLabel, sourceClasses } from "@/data/platform";
import type { EntryStatus, FeedEntry, RiskLevel, RiskTypeId, SourceClassId } from "@/data/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/feed")({
  head: () => ({
    meta: [
      { title: "信息流工作台 · 全球安全风险监测平台" },
      {
        name: "description",
        content: "分析师工作台：按信源类别、风险类型、地区与等级筛选信息条目，完成人工研判与预警升级。",
      },
      { property: "og:title", content: "信息流工作台 · 全球安全风险监测平台" },
      {
        property: "og:description",
        content: "四类信源汇聚的信息条目研判界面，支持 AI 分析结果与人工标注协同。",
      },
    ],
  }),
  component: FeedWorkbench,
});

const statusLabel: Record<EntryStatus, string> = {
  pending: "待研判",
  reviewed: "已研判",
  escalated: "已升级预警",
  dismissed: "已排除",
};

function FeedWorkbench() {
  const [sourceFilter, setSourceFilter] = useState<SourceClassId | "all">("all");
  const [typeFilter, setTypeFilter] = useState<RiskTypeId | "all">("all");
  const [levelFilter, setLevelFilter] = useState<RiskLevel | "all">("all");
  const [statusFilter, setStatusFilter] = useState<EntryStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string>(feedEntries[0]!.id);
  const [composerEntry, setComposerEntry] = useState<FeedEntry | null>(null);

  const filtered = useMemo(
    () =>
      feedEntries.filter(
        (e) =>
          (sourceFilter === "all" || e.sourceClass === sourceFilter) &&
          (typeFilter === "all" || e.riskType === typeFilter) &&
          (levelFilter === "all" || e.level === levelFilter) &&
          (statusFilter === "all" || e.status === statusFilter),
      ),
    [sourceFilter, typeFilter, levelFilter, statusFilter],
  );

  const selected = feedEntries.find((e) => e.id === selectedId) ?? filtered[0] ?? feedEntries[0]!;

  return (
    <PageShell
      eyebrow="Feed Workbench"
      title="信息流工作台"
      description="四类信源统一汇聚。左侧按议题组合筛选，中间浏览条目，右侧完成 AI 结果核对与人工研判，并可一键升级为正式预警。"
    >
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_380px]">
        <aside className="space-y-6">
          <FilterGroup
            title="信源类别"
            value={sourceFilter}
            onChange={(v) => setSourceFilter(v as SourceClassId | "all")}
            options={[
              { value: "all", label: "全部" },
              ...sourceClasses.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
          <FilterGroup
            title="风险类型"
            value={typeFilter}
            onChange={(v) => setTypeFilter(v as RiskTypeId | "all")}
            options={[
              { value: "all", label: "全部" },
              ...channels.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <FilterGroup
            title="风险等级"
            value={levelFilter}
            onChange={(v) => setLevelFilter(v as RiskLevel | "all")}
            options={[
              { value: "all", label: "全部" },
              { value: "high", label: "高" },
              { value: "medium", label: "中" },
              { value: "low", label: "低" },
            ]}
          />
          <FilterGroup
            title="研判状态"
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as EntryStatus | "all")}
            options={[
              { value: "all", label: "全部" },
              { value: "pending", label: "待研判" },
              { value: "reviewed", label: "已研判" },
              { value: "escalated", label: "已升级预警" },
              { value: "dismissed", label: "已排除" },
            ]}
          />
        </aside>

        <section>
          <SectionTitle aside={`${filtered.length} 条 / 共 ${feedEntries.length} 条`}>
            信息条目
          </SectionTitle>
          <Panel className="divide-y divide-border">
            {filtered.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">
                当前筛选条件下没有信息条目。
              </p>
            ) : (
              filtered.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setSelectedId(entry.id)}
                  className={cn(
                    "block w-full px-5 py-3 text-left transition-colors hover:bg-secondary",
                    entry.id === selected.id && "bg-primary/5",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium">{entry.title}</p>
                    <RiskBadge level={entry.level} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{entry.summary}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <SourceBadge id={entry.sourceClass} />
                    <Tag>{riskTypeLabel[entry.riskType]}</Tag>
                    <Tag>{entry.region}</Tag>
                    <Tag>可信度 {entry.confidence}</Tag>
                    <span className="font-mono text-xs text-muted-foreground">{entry.publishedAt}</span>
                    <span className="text-xs text-muted-foreground">{statusLabel[entry.status]}</span>
                  </div>
                </button>
              ))
            )}
          </Panel>
        </section>

        <aside>
          <SectionTitle aside={<span className="font-mono">{selected.id}</span>}>条目详情</SectionTitle>
          <Panel className="p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold">{selected.title}</h3>
              <RiskBadge level={selected.level} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{selected.summary}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <Meta label="信源" value={selected.sourceName} />
              <Meta label="信源类别" value={riskTypeLabel[selected.riskType]} />
              <Meta label="地区" value={selected.region} />
              <Meta label="发布时间" value={selected.publishedAt} mono />
            </dl>
            <p className="mt-3 text-xs">
              <SourceLink href={selected.url}>查看原文</SourceLink>
            </p>

            <div className="mt-5 rounded-md border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
                  <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
                  AI 自动分析
                </p>
                <PendingTag />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{selected.aiSummary}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selected.aiEntities.map((entity) => (
                  <Tag key={entity}>{entity}</Tag>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                自动摘要、风险评级与实体识别接入后将替换此处示例结果。
              </p>
            </div>

            <div className="mt-4 rounded-md border border-border p-4">
              <p className="text-xs font-semibold tracking-wider uppercase">人工研判</p>
              <dl className="mt-3 space-y-2 text-xs">
                <Meta label="研判状态" value={statusLabel[selected.status]} />
                <Meta label="可信度" value={`${selected.confidence} 级`} />
                <Meta label="关联专题" value={selected.topicSlug ? selected.topicSlug : "未关联"} />
              </dl>
              <p className="mt-3 text-sm text-muted-foreground">
                {selected.analystNote ?? "尚无分析师批注。"}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setComposerEntry(selected)}
                  className="inline-flex items-center rounded-sm bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  升级为正式预警
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded-sm border border-border px-3 py-1.5 text-sm transition-colors hover:bg-secondary"
                >
                  纳入今日简报
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded-sm border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary"
                >
                  标记为排除
                </button>
              </div>
            </div>
          </Panel>
        </aside>
      </div>

      {composerEntry ? (
        <AlertComposer entry={composerEntry} onClose={() => setComposerEntry(null)} />
      ) : null}
    </PageShell>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("mt-0.5", mono && "font-mono")}>{value}</dd>
    </div>
  );
}

function FilterGroup({
  title,
  value,
  onChange,
  options,
}: {
  title: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <p className="mb-2 text-xs tracking-wider text-muted-foreground uppercase">{title}</p>
      <div className="flex flex-col gap-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-sm px-2 py-1 text-left text-sm transition-colors hover:bg-secondary",
              option.value === value ? "bg-primary/10 text-primary" : "text-muted-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}