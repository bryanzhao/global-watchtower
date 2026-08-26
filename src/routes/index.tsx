import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageShell } from "@/components/platform/PageShell";
import { Panel, SectionTitle, Tag } from "@/components/platform/Primitives";
import { RiskBadge } from "@/components/platform/RiskBadge";
import { HexWorldMap } from "@/components/platform/HexWorldMap";
import { riskTypeLabel } from "@/data/platform";
import { topicProfiles, topicStatusLabel } from "@/data/topics";
import {
  aggregateByCountry,
  sortByTimeDesc,
  timeWindowLabel,
  withinWindow,
  type TimeWindow,
  eventCountryName,
  eventTopics } from "@/data/analytics";
import { useWorkbench } from "@/state/workbench";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "全局概览 · 全球安全风险监测平台" },
      {
        name: "description",
        content:
          "以蜂窝世界地图展示过去 24 小时各国已确认风险事件分布，并按重大议题提供局势概览卡片，一键进入主题与国别详情。",
      },
      { property: "og:title", content: "全局概览 · 全球安全风险监测平台" },
      {
        property: "og:description",
        content: "地图 + 重大议题卡片的全局风险概览，数据来自结构化风险信息流。",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { events } = useWorkbench();
  const navigate = useNavigate();
  const [win, setWin] = useState<TimeWindow>(24);

  const aggregates = useMemo(() => aggregateByCountry(events, win), [events, win]);
  const windowed = useMemo(() => events.filter((e) => withinWindow(e, win)), [events, win]);

  const latest = useMemo(() => sortByTimeDesc(events).slice(0, 10), [events]);


  return (
    <PageShell
      eyebrow="Global Overview"
      title="全局概览"
      description="左侧地图按国家聚合已确认风险事件数量与最高风险等级，右侧为当前在跟踪的重大议题。所有数据均来自风险信息流，不含未经确认的原始信息。"
      actions={
        <div className="flex items-center gap-1 rounded-sm border border-border p-0.5">
          {([24, 168] as TimeWindow[]).map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWin(w)}
              className={cn(
                "rounded-sm px-3 py-1 text-xs transition-colors",
                w === win ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary",
              )}
            >
              {timeWindowLabel[w]}
            </button>
          ))}
        </div>
      }
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel className="p-4">
            <HexWorldMap
              aggregates={aggregates}
              windowLabel={timeWindowLabel[win]}
              onSelect={(code) => navigate({ to: "/countries/$code", params: { code } })}
            />
          </Panel>

          <div>
            <SectionTitle aside="每小时刷新">重大议题</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              {topicProfiles.map((t) => {
                const related = events.filter(
                  (e) => eventTopics(e).includes(t.topic) && withinWindow(e, win),
                );
                return (
                  <Link
                    key={t.slug}
                    to="/topics/$slug"
                    params={{ slug: t.slug }}
                    className="block rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-secondary/40"
                  >
                    <div className="flex items-start gap-2">
                      <h3 className="text-sm font-semibold">{t.name}</h3>
                      <RiskBadge level={t.level} className="ml-auto" />
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{t.headline}</p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Tag>{topicStatusLabel[t.status]}</Tag>
                      <span className="tabular-nums">
                        {timeWindowLabel[win]} {related.length} 起
                      </span>
                      <span className="ml-auto inline-flex items-center gap-1 text-primary">
                        进入议题
                        <ArrowRight className="h-3 w-3" aria-hidden />
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">概览更新于 {t.updatedAt}</p>
                  </Link>
                );
              })}
            </div>
            <Link
              to="/topics"
              className="mt-3 block rounded-md border border-dashed border-border p-3 text-center text-xs text-muted-foreground transition-colors hover:bg-secondary"
            >
              查看全部专题 →
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <SectionTitle aside={`${windowed.length} 起`}>最新风险信息</SectionTitle>
          <ul className="space-y-2">
            {latest.map((e) => (
              <li
                key={e.id}
                className="rounded-md border border-border bg-card p-3 transition-colors hover:border-primary/50"
              >
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="font-mono tabular-nums">{e.occurredAt}</span>
                  <span>{eventCountryName(e)}</span>
                  <RiskBadge level={e.level} className="ml-auto" />
                </div>
                <p className="mt-1 text-sm leading-snug">{e.title}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Tag>{riskTypeLabel[e.riskType]}</Tag>
                  {eventTopics(e).map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              </li>
            ))}
            {latest.length === 0 ? (
              <li className="text-sm text-muted-foreground">该时间窗内无已确认事件。</li>
            ) : null}
          </ul>
          <Link
            to="/risk"
            className="flex items-center justify-center gap-1 rounded-md border border-border p-2.5 text-xs text-muted-foreground transition-colors hover:bg-secondary"
          >
            全部信息流
            <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
        </div>
      </div>

    </PageShell>
  );
}
