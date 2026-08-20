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

  const topCountries = useMemo(
    () => [...aggregates.values()].sort((a, b) => b.count - a.count).slice(0, 6),
    [aggregates],
  );

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
        <div className="lg:col-span-2">
          <Panel className="p-4">
            <HexWorldMap
              aggregates={aggregates}
              windowLabel={timeWindowLabel[win]}
              onSelect={(code) => navigate({ to: "/countries/$code", params: { code } })}
            />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <SectionTitle>事件最集中国家</SectionTitle>
                <ul className="space-y-1.5">
                  {topCountries.length === 0 ? (
                    <li className="text-sm text-muted-foreground">该时间窗内无已确认事件。</li>
                  ) : (
                    topCountries.map((c) => (
                      <li key={c.code}>
                        <Link
                          to="/countries/$code"
                          params={{ code: c.code }}
                          className="flex items-center gap-2 rounded-sm px-2 py-1 text-sm transition-colors hover:bg-secondary"
                        >
                          <span className="font-mono text-xs text-muted-foreground">{c.code}</span>
                          <span>{c.name}</span>
                          <RiskBadge level={c.level} className="ml-auto" />
                          <span className="w-6 text-right font-semibold tabular-nums">{c.count}</span>
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              </div>
              <div>
                <SectionTitle aside={`${windowed.length} 起`}>最新已确认事件</SectionTitle>
                <ul className="space-y-1.5">
                  {sortByTimeDesc(windowed)
                    .slice(0, 5)
                    .map((e) => (
                      <li key={e.id} className="flex items-start gap-2 text-sm">
                        <span className="font-mono text-xs text-muted-foreground tabular-nums">
                          {e.occurredAt}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{e.title}</span>
                        <Tag>{riskTypeLabel[e.riskType]}</Tag>
                      </li>
                    ))}
                  {windowed.length === 0 ? (
                    <li className="text-sm text-muted-foreground">暂无事件。</li>
                  ) : null}
                </ul>
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-3">
          <SectionTitle aside="每小时刷新">重大议题</SectionTitle>
          {topicProfiles.map((t) => {
            const related = events.filter((e) => eventTopics(e).includes(t.topic) && withinWindow(e, win));
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
          <Link
            to="/countries"
            className="block rounded-md border border-dashed border-border p-3 text-center text-xs text-muted-foreground transition-colors hover:bg-secondary"
          >
            查看全部国别页 →
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
