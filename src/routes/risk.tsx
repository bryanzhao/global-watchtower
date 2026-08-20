import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/platform/PageShell";
import { Panel, SourceLink, Tag } from "@/components/platform/Primitives";
import { RiskBadge } from "@/components/platform/RiskBadge";
import { topics } from "@/data/platform";
import type { RiskLevel } from "@/data/types";
import { eventTopics, eventCountryCodes } from "@/data/analytics";
import { countryNameByCode } from "@/data/hexmap";
import { useWorkbench } from "@/state/workbench";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/risk")({
  head: () => ({
    meta: [
      { title: "风险信息流 · 全球安全风险监测平台" },
      {
        name: "description",
        content:
          "经 AI 与分析师筛选、去重与结构化后的风险事件时间线，含时间、地点、涉事主体、风险类型、主题与溯源原始条目。",
      },
      { property: "og:title", content: "风险信息流 · 全球安全风险监测平台" },
      {
        property: "og:description",
        content: "结构化风险事件时间线，每条事件均可回溯到原始信息条目。",
      },
    ],
  }),
  component: RiskFeed,
});

function RiskFeed() {
  const { events, items, attachItems } = useWorkbench();
  const [levelFilter, setLevelFilter] = useState<RiskLevel | "all">("all");
  const [topicFilter, setTopicFilter] = useState("all");
  const [country, setCountry] = useState("");
  const [openId, setOpenId] = useState<string | null>(events[0]?.id ?? null);
  const [attachFor, setAttachFor] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      events.filter(
        (e) =>
          (levelFilter === "all" || e.level === levelFilter) &&
          (topicFilter === "all" ||
            (topicFilter === "none"
              ? eventTopics(e).length === 0
              : eventTopics(e).includes(topicFilter))) &&
          (country.trim() === "" ||
            e.country.includes(country.trim()) ||
            eventCountryCodes(e).some((c) =>
              (countryNameByCode[c] ?? "").includes(country.trim()),
            )),
      ),
    [events, levelFilter, topicFilter, country],
  );

  const attachable = items.filter((i) => i.status === "new");

  return (
    <PageShell
      eyebrow="Risk Feed"
      title="风险信息流"
      description="来自原始信息流的提取结果。颗粒度是「一则重要新闻 / 一个关键进展」：每一次袭击、每一次关键表态或部署变化各自成条，按所属主题串联，并保留时间、地点、涉事主体与溯源条目。"
      actions={<span className="text-xs text-muted-foreground">共 {events.length} 个事件</span>}
    >
      <div className="mb-5 flex flex-wrap items-center gap-4">
        <Select
          label="等级"
          value={levelFilter}
          onChange={(v) => setLevelFilter(v as RiskLevel | "all")}
          options={[
            { value: "all", label: "全部" },
            { value: "high", label: "高" },
            { value: "medium", label: "中" },
            { value: "low", label: "低" },
          ]}
        />
        <Select
          label="主题"
          value={topicFilter}
          onChange={setTopicFilter}
          options={[
            { value: "all", label: "全部" },
            { value: "none", label: "无主题" },
            ...topics.map((t) => ({ value: t, label: t })),
          ]}
        />
        <label className="flex items-center gap-2 text-xs">
          <span className="tracking-wider text-muted-foreground uppercase">国家</span>
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="输入国家名"
            className="rounded-sm border border-border bg-background px-2 py-1 text-sm"
          />
        </label>
      </div>

      <Panel className="p-5">
        {visible.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">暂无符合条件的风险事件。</p>
        ) : (
          <ol className="relative border-l border-border pl-6">
            {visible.map((event) => {
              const open = openId === event.id;
              const sources = event.sourceItemIds
                .map((id) => items.find((i) => i.id === id))
                .filter(Boolean);
              return (
                <li key={event.id} className="relative pb-6 last:pb-0">
                  <span
                    className={cn(
                      "absolute top-1.5 -left-[26px] h-2.5 w-2.5 rounded-full border-2 border-background",
                      event.level === "high"
                        ? "bg-destructive"
                        : event.level === "medium"
                          ? "bg-warning"
                          : "bg-success",
                    )}
                    aria-hidden
                  />
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                      {event.occurredAt}
                      {event.occurredEnd ? ` → ${event.occurredEnd}` : ""}
                    </span>
                    <span className="font-mono text-xs text-primary">{event.id}</span>
                  </div>
                  <div className="rounded-md border border-border">
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : event.id)}
                      className="block w-full p-4 text-left transition-colors hover:bg-secondary"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-semibold">{event.title}</h3>
                        <RiskBadge level={event.level} />
                      </div>
                      <p className="mt-1.5 text-sm text-muted-foreground">{event.summary}</p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <Tag>{riskTypeLabel[event.riskType]}</Tag>
                        <Tag>
                          {[event.country, event.area, event.city].filter(Boolean).join(" · ")}
                        </Tag>
                        {(event.alsoCountryCodes ?? []).map((c) => (
                          <Tag key={c}>波及 {countryNameByCode[c] ?? c}</Tag>
                        ))}
                        {eventTopics(event).length ? (
                          eventTopics(event).map((t) => <Tag key={t}>{t}</Tag>)
                        ) : (
                          <Tag>无主题</Tag>
                        )}
                        <Tag>可信度 {event.confidence}</Tag>
                        <span className="text-xs text-muted-foreground">
                          来源 {event.sourceItemIds.length} 条 · {event.createdBy}
                        </span>
                      </div>
                    </button>

                    {open ? (
                      <div className="border-t border-border p-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                          <Detail label="国家行为体" values={event.stateActors} />
                          <Detail label="组织机构" values={event.organizations} />
                          <Detail label="当事个人" values={event.people} />
                        </div>

                        <p className="mt-4 mb-2 text-xs tracking-wider text-muted-foreground uppercase">
                          溯源原始条目
                        </p>
                        <ul className="space-y-2">
                          {sources.map((s) => (
                            <li key={s!.id} className="rounded-sm border border-border p-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs text-muted-foreground">
                                  {s!.id}
                                </span>
                                <span className="text-xs font-medium">{s!.author}</span>
                                <span className="font-mono text-xs text-muted-foreground">
                                  {s!.publishedAt}
                                </span>
                                <span className="ml-auto text-xs">
                                  <SourceLink href={s!.url}>原文</SourceLink>
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">{s!.text}</p>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setAttachFor(attachFor === event.id ? null : event.id)
                            }
                            className="rounded-sm border border-border px-3 py-1.5 text-sm transition-colors hover:bg-secondary"
                          >
                            补挂原始条目
                          </button>
                          <span className="text-xs text-muted-foreground">
                            创建于 {event.createdAt}
                          </span>
                        </div>

                        {attachFor === event.id ? (
                          <div className="mt-3 rounded-sm border border-border p-3">
                            <p className="mb-2 text-xs text-muted-foreground">
                              从未处理条目中选择挂载到本事件：
                            </p>
                            <ul className="max-h-56 space-y-1 overflow-y-auto">
                              {attachable.length === 0 ? (
                                <li className="text-xs text-muted-foreground">暂无未处理条目。</li>
                              ) : (
                                attachable.map((i) => (
                                  <li key={i.id} className="flex items-start gap-2 text-xs">
                                    <button
                                      type="button"
                                      onClick={() => attachItems(event.id, [i.id])}
                                      className="rounded-sm border border-border px-2 py-0.5 transition-colors hover:bg-secondary"
                                    >
                                      挂载
                                    </button>
                                    <span className="font-mono text-muted-foreground">{i.id}</span>
                                    <span className="min-w-0 flex-1 truncate">{i.text}</span>
                                  </li>
                                ))
                              )}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </Panel>
    </PageShell>
  );
}

function Detail({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <p className="mb-1 text-xs tracking-wider text-muted-foreground uppercase">{label}</p>
      {values.length === 0 ? (
        <p className="text-xs text-muted-foreground">—</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {values.map((v) => (
            <Tag key={v}>{v}</Tag>
          ))}
        </div>
      )}
    </div>
  );
}

function Select({
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
