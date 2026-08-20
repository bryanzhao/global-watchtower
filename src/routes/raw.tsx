import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { PageShell } from "@/components/platform/PageShell";
import { Panel, SourceLink, Tag } from "@/components/platform/Primitives";
import { ExtractDrawer } from "@/components/platform/ExtractDrawer";
import { riskTypeLabel, riskTypes, sourceClasses, topics } from "@/data/platform";
import type { RawItem, RawStatus, RiskTypeId, SourceClassId } from "@/data/types";
import { useWorkbench } from "@/state/workbench";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/raw")({
  head: () => ({
    meta: [
      { title: "原始信息流工作台 · 全球安全风险监测平台" },
      {
        name: "description",
        content:
          "四类原始信息流（社交媒体、主流媒体、权威机构、自建 OSINT）按标签分流的时间线工作台，支持勾选多条合并提取为结构化风险事件。",
      },
      { property: "og:title", content: "原始信息流工作台 · 全球安全风险监测平台" },
      {
        property: "og:description",
        content: "分析师与 AI 共同浏览原始信息流，从中提取并合并出结构化风险事件。",
      },
    ],
  }),
  component: RawFeedWorkbench,
});

const statusLabel: Record<RawStatus, string> = {
  new: "未处理",
  extracted: "已提取",
  ignored: "已忽略",
};

function RawFeedWorkbench() {
  const { items, lastRefresh, pendingIncoming, refresh, ignoreItems, restoreItems, createEvent } =
    useWorkbench();
  const [tab, setTab] = useState<SourceClassId>("social");
  const [typeFilter, setTypeFilter] = useState<RiskTypeId | "all">("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<RawStatus | "all">("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [drawerIds, setDrawerIds] = useState<string[] | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const tabItems = useMemo(() => items.filter((i) => i.sourceClass === tab), [items, tab]);

  const visible = useMemo(
    () =>
      tabItems
        .filter(
          (i) =>
            (typeFilter === "all" || i.riskType === typeFilter) &&
            (topicFilter === "all" ||
              (topicFilter === "none" ? !i.topic : i.topic === topicFilter)) &&
            (statusFilter === "all" || i.status === statusFilter),
        )
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
    [tabItems, typeFilter, topicFilter, statusFilter],
  );

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const drawerItems = drawerIds
    ? (drawerIds.map((id) => items.find((i) => i.id === id)!).filter(Boolean) as typeof items)
    : [];

  return (
    <PageShell
      eyebrow="Raw Feeds"
      title="原始信息流工作台"
      description="四类信源各自成流，互不混合。AI 与分析师持续刷新浏览，从中识别风险，勾选一条或多条合并提取为结构化风险事件。"
      actions={
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">最近刷新 {lastRefresh}</span>
          <button
            type="button"
            onClick={() => {
              const added = refresh();
              setToast(added ? `已拉取 ${added} 条新信息` : "暂无更多新信息");
            }}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border px-3 py-1.5 text-sm transition-colors hover:bg-secondary"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            刷新
            {pendingIncoming > 0 ? (
              <span className="ml-1 rounded-sm bg-primary/10 px-1.5 text-xs text-primary tabular-nums">
                {pendingIncoming}
              </span>
            ) : null}
          </button>
        </div>
      }
    >
      {toast ? (
        <p className="mb-4 rounded-sm border border-border bg-surface px-3 py-2 text-xs text-muted-foreground">
          {toast}
        </p>
      ) : null}

      <div className="mb-5 flex flex-wrap gap-1 border-b border-border">
        {sourceClasses.map((s) => {
          const count = items.filter((i) => i.sourceClass === s.id).length;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setTab(s.id);
                setSelected([]);
              }}
              className={cn(
                "-mb-px border-b-2 px-4 py-2 text-sm transition-colors",
                s.id === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {s.name}
              <span className="ml-1.5 text-xs tabular-nums">{count}</span>
            </button>
          );
        })}
      </div>

      <p className="mb-4 text-xs text-muted-foreground">
        {sourceClasses.find((s) => s.id === tab)!.description}
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <FilterRow
          label="风险类型"
          value={typeFilter}
          onChange={(v) => setTypeFilter(v as RiskTypeId | "all")}
          options={[
            { value: "all", label: "全部" },
            ...riskTypes.map((t) => ({ value: t, label: riskTypeLabel[t] })),
          ]}
        />
        <FilterRow
          label="状态"
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as RawStatus | "all")}
          options={[
            { value: "all", label: "全部" },
            { value: "new", label: "未处理" },
            { value: "extracted", label: "已提取" },
            { value: "ignored", label: "已忽略" },
          ]}
        />
      </div>

      <TopicTagFilter value={topicFilter} onChange={setTopicFilter} />

      <Panel className="mt-4 p-5 pb-24">
        {visible.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            当前筛选条件下没有条目。
          </p>
        ) : (
          <ol className={cn("relative", tab === "social" ? "pl-0" : "border-l border-border pl-6")}>
            {visible.map((item) => (
              <li key={item.id} className="relative pb-6 last:pb-0">
                {tab !== "social" ? (
                  <>
                    <span
                      className={cn(
                        "absolute top-1.5 -left-[26px] h-2.5 w-2.5 rounded-full border-2 border-background",
                        item.status === "extracted"
                          ? "bg-primary"
                          : item.status === "ignored"
                            ? "bg-muted-foreground/40"
                            : "bg-destructive",
                      )}
                      aria-hidden
                    />
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {item.publishedAt}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {statusLabel[item.status]}
                      </span>
                      {item.eventId ? (
                        <span className="font-mono text-xs text-primary">{item.eventId}</span>
                      ) : null}
                    </div>
                  </>
                ) : null}
                {tab === "social" ? (
                  <SocialCompactRow
                    item={item}
                    selected={selected.includes(item.id)}
                    onToggle={() => toggle(item.id)}
                    onExtract={() => setDrawerIds([item.id])}
                    onIgnore={() => ignoreItems([item.id])}
                    onRestore={() => restoreItems([item.id])}
                  />
                ) : (
                  <DetailedCard
                    item={item}
                    selected={selected.includes(item.id)}
                    onToggle={() => toggle(item.id)}
                    onExtract={() => setDrawerIds([item.id])}
                    onIgnore={() => ignoreItems([item.id])}
                    onRestore={() => restoreItems([item.id])}
                  />
                )}
              </li>
            ))}
          </ol>
        )}
      </Panel>

      {selected.length > 0 ? (
        <div className="sticky bottom-4 z-30 mt-4 flex flex-wrap items-center gap-3 rounded-md border border-primary/40 bg-background px-4 py-3">
          <span className="text-sm font-medium">已选 {selected.length} 条</span>
          <button
            type="button"
            onClick={() => setDrawerIds(selected)}
            className="rounded-sm bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {selected.length > 1 ? "合并提取为风险事件" : "提取为风险事件"}
          </button>
          <button
            type="button"
            onClick={() => {
              ignoreItems(selected);
              setSelected([]);
            }}
            className="rounded-sm border border-border px-3 py-1.5 text-sm transition-colors hover:bg-secondary"
          >
            忽略
          </button>
          <button
            type="button"
            onClick={() => setSelected([])}
            className="rounded-sm px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary"
          >
            取消选择
          </button>
        </div>
      ) : null}

      {drawerIds && drawerItems.length > 0 ? (
        <ExtractDrawer
          items={drawerItems}
          onRemoveItem={(id) => setDrawerIds((prev) => (prev ?? []).filter((x) => x !== id))}
          onCancel={() => setDrawerIds(null)}
          onSubmit={(draft) => {
            const event = createEvent(draft);
            setDrawerIds(null);
            setSelected([]);
            setToast(`已生成风险事件 ${event.id}，可在风险信息流查看`);
          }}
        />
      ) : null}
    </PageShell>
  );
}

function TopicTagFilter({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const tags = [
    { value: "all", label: "全部主题" },
    { value: "none", label: "无主题" },
    ...topics.map((t) => ({ value: t, label: t })),
  ];
  return (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      <span className="text-xs tracking-wider text-muted-foreground uppercase">主题</span>
      {tags.map((t) => {
        const active = value === t.value;
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={cn(
              "rounded-sm border px-2.5 py-1 text-xs transition-colors",
              active
                ? "border-primary bg-primary/10 font-medium text-primary"
                : "border-border bg-surface text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function SocialCompactRow({
  item,
  selected,
  onToggle,
  onExtract,
  onIgnore,
  onRestore,
}: {
  item: RawItem;
  selected: boolean;
  onToggle: () => void;
  onExtract: () => void;
  onIgnore: () => void;
  onRestore: () => void;
}) {
  const [date, time] = item.publishedAt.split(" ");
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md border border-border px-3 py-2.5 transition-colors",
        selected && "border-primary bg-primary/5",
        item.status === "ignored" && "opacity-60",
      )}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        aria-label={`选择 ${item.id}`}
        className="h-4 w-4 accent-[oklch(0.34_0.07_240)]"
      />
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="min-w-[140px] max-w-[200px]">
          <p className="truncate text-sm font-semibold">{item.author}</p>
          <p className="truncate font-mono text-xs text-muted-foreground">{item.handle}</p>
        </div>
        <div className="w-px self-stretch bg-border" aria-hidden />
        <div className="min-w-[100px] font-mono text-xs tabular-nums text-muted-foreground">
          <span>{date}</span>
          <span className="mx-1">·</span>
          <span>{time}</span>
        </div>
        <span
          className={cn(
            "rounded-sm px-2 py-0.5 text-xs",
            item.status === "extracted"
              ? "bg-primary/10 text-primary"
              : item.status === "ignored"
                ? "bg-muted/50 text-muted-foreground"
                : "bg-destructive/10 text-destructive",
          )}
        >
          {statusLabel[item.status]}
        </span>
        <span className="text-xs">
          <SourceLink href={item.url}>原文</SourceLink>
        </span>
      </div>
      <div className="flex items-center gap-2">
        {item.status === "ignored" ? (
          <MiniButton onClick={onRestore}>恢复</MiniButton>
        ) : (
          <>
            <MiniButton onClick={onExtract}>提取</MiniButton>
            <MiniButton onClick={onIgnore}>忽略</MiniButton>
          </>
        )}
      </div>
    </div>
  );
}

function DetailedCard({
  item,
  selected,
  onToggle,
  onExtract,
  onIgnore,
  onRestore,
}: {
  item: RawItem;
  selected: boolean;
  onToggle: () => void;
  onExtract: () => void;
  onIgnore: () => void;
  onRestore: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-border p-4 transition-colors",
        selected && "border-primary bg-primary/5",
        item.status === "ignored" && "opacity-60",
      )}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          aria-label={`选择 ${item.id}`}
          className="mt-1 h-4 w-4 accent-[oklch(0.34_0.07_240)]"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-sm font-semibold">{item.author}</span>
            <span className="font-mono text-xs text-muted-foreground">{item.handle}</span>
            <span className="font-mono text-xs text-muted-foreground">{item.id}</span>
          </div>
          <p className="mt-1.5 text-sm">{item.text}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {item.riskType ? <Tag>{riskTypeLabel[item.riskType]}</Tag> : null}
            {item.topic ? <Tag>{item.topic}</Tag> : null}
            {item.region ? <Tag>{item.region}</Tag> : null}
            <Tag>{item.lang}</Tag>
            <span className="text-xs">
              <SourceLink href={item.url}>原文</SourceLink>
            </span>
            <span className="ml-auto flex gap-2">
              {item.status === "ignored" ? (
                <MiniButton onClick={onRestore}>恢复</MiniButton>
              ) : (
                <>
                  <MiniButton onClick={onExtract}>提取</MiniButton>
                  <MiniButton onClick={onIgnore}>忽略</MiniButton>
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-sm border border-border px-2 py-1 text-xs transition-colors hover:bg-secondary"
    >
      {children}
    </button>
  );
}

function FilterRow({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="tracking-wider text-muted-foreground uppercase">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-sm border border-border bg-background px-2 py-1 text-sm"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
