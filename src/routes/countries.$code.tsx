import { useMemo, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/platform/PageShell";
import { Panel, SectionTitle, SourceLink, Tag } from "@/components/platform/Primitives";
import { RiskBadge } from "@/components/platform/RiskBadge";
import { riskTypeLabel, riskTypes } from "@/data/platform";
import { getCountryProfile, scoreLevel, type CountryProfile } from "@/data/countries";
import { topicByName } from "@/data/topics";
import {
  eventCountryCode,
  sortByTimeDesc,
  timeWindowLabel,
  withinWindow,
  type TimeWindow,
  eventCountryCodes, eventTopics } from "@/data/analytics";
import { useWorkbench } from "@/state/workbench";
import { cn } from "@/lib/utils";
import type { RiskLevel, RiskTypeId } from "@/data/types";

export const Route = createFileRoute("/countries/$code")({
  loader: ({ params }) => {
    const profile = getCountryProfile(params.code.toUpperCase());
    if (!profile) throw notFound();
    return { profile };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "国别未找到 · 全球安全风险监测平台" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.profile;
    const title = `${p.name} 国别风险页 · 全球安全风险监测平台`;
    const description = p.overview.slice(0, 150);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  notFoundComponent: CountryNotFound,
  component: CountryPage,
});

function CountryNotFound() {
  return (
    <PageShell eyebrow="Country" title="国家不存在" description="该国家代码尚未纳入监测范围。">
      <Link to="/countries" className="text-sm text-primary underline-offset-4 hover:underline">
        返回国别列表
      </Link>
    </PageShell>
  );
}

const barClass: Record<RiskLevel, string> = {
  high: "bg-destructive",
  medium: "bg-warning",
  low: "bg-success",
};

function CountryPage() {
  const { profile } = Route.useLoaderData() as { profile: CountryProfile };
  const { events, items } = useWorkbench();
  const [typeFilter, setTypeFilter] = useState<RiskTypeId | "all">("all");
  const [win, setWin] = useState<TimeWindow | "all">("all");

  const countryEvents = useMemo(
    () => sortByTimeDesc(events.filter((e) => eventCountryCodes(e).includes(profile.code))),
    [events, profile.code],
  );

  const visible = countryEvents.filter(
    (e) =>
      (typeFilter === "all" || e.riskType === typeFilter) && (win === "all" || withinWindow(e, win)),
  );

  const relatedTopics = Array.from(
    new Set(countryEvents.flatMap((e) => eventTopics(e))),
  );

  return (
    <PageShell
      eyebrow={`Country · ${profile.region}`}
      title={profile.name}
      description={profile.overview}
      actions={
        <div className="flex items-center gap-2">
          <RiskBadge level={profile.level} />
          <span className="text-xs text-muted-foreground">档案更新 {profile.revisedAt}</span>
        </div>
      }
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel className="p-5">
            <SectionTitle
              aside={
                <div className="flex items-center gap-2">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as RiskTypeId | "all")}
                    className="rounded-sm border border-border bg-background px-2 py-1 text-xs"
                  >
                    <option value="all">全部类型</option>
                    {riskTypes.map((t) => (
                      <option key={t} value={t}>
                        {riskTypeLabel[t]}
                      </option>
                    ))}
                  </select>
                  <select
                    value={String(win)}
                    onChange={(e) => setWin(e.target.value === "all" ? "all" : (Number(e.target.value) as TimeWindow))}
                    className="rounded-sm border border-border bg-background px-2 py-1 text-xs"
                  >
                    <option value="all">全部时间</option>
                    <option value="24">{timeWindowLabel[24]}</option>
                    <option value="168">{timeWindowLabel[168]}</option>
                  </select>
                </div>
              }
            >
              动态风险信息流
            </SectionTitle>
            {visible.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">
                该筛选条件下暂无已确认风险事件。
              </p>
            ) : (
              <ol className="relative border-l border-border pl-6">
                {visible.map((e) => {
                  const sources = e.sourceItemIds
                    .map((id) => items.find((i) => i.id === id))
                    .filter(Boolean);
                  return (
                    <li key={e.id} className="relative pb-5 last:pb-0">
                      <span className="absolute top-1.5 -left-[26px] h-2.5 w-2.5 rounded-full border-2 border-background bg-primary" aria-hidden />
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground tabular-nums">
                          {e.occurredAt}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">{e.id}</span>
                        <RiskBadge level={e.level} />
                      </div>
                      <p className="mt-1 text-sm font-semibold">{e.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{e.summary}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Tag>{riskTypeLabel[e.riskType]}</Tag>
                        {e.city ? <Tag>{e.city}</Tag> : e.area ? <Tag>{e.area}</Tag> : null}
                        {e.topic && topicByName[e.topic] ? (
                          <Link
                            to="/topics/$slug"
                            params={{ slug: topicByName[e.topic]!.slug }}
                            className="rounded-sm border border-primary/40 px-1.5 py-0.5 text-xs text-primary transition-colors hover:bg-primary/10"
                          >
                            {e.topic}
                          </Link>
                        ) : e.topic ? (
                          <Tag>{e.topic}</Tag>
                        ) : null}
                        <span className="text-xs text-muted-foreground">
                          溯源 {sources.length} 条
                          {sources[0] ? (
                            <>
                              {" · "}
                              <SourceLink href={sources[0]!.url}>原文</SourceLink>
                            </>
                          ) : null}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </Panel>
        </div>

        <div className="space-y-5">
          <Panel className="p-5">
            <SectionTitle aside="慢变 · 人工维护">风险类型赋值</SectionTitle>
            <ul className="space-y-2.5">
              {riskTypes.map((t) => {
                const s = profile.scores[t];
                return (
                  <li key={t}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span>{riskTypeLabel[t]}</span>
                      <span className="font-mono text-xs tabular-nums">{s.score}/5</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-sm bg-muted">
                      <div
                        className={cn("h-1.5 rounded-sm", barClass[scoreLevel(s.score)])}
                        style={{ width: `${(s.score / 5) * 100}%` }}
                      />
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{s.note}</p>
                  </li>
                );
              })}
            </ul>
          </Panel>

          {profile.entities.length > 0 ? (
            <Panel className="p-5">
              <SectionTitle>重点关注实体</SectionTitle>
              {profile.entities.map((g) => (
                <div key={g.label} className="mb-3 last:mb-0">
                  <p className="mb-1 text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                    {g.label}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {g.items.map((i) => (
                      <Tag key={i}>{i}</Tag>
                    ))}
                  </div>
                </div>
              ))}
            </Panel>
          ) : null}

          {relatedTopics.length > 0 ? (
            <Panel className="p-5">
              <SectionTitle>关联议题</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {relatedTopics.map((name) =>
                  topicByName[name] ? (
                    <Link
                      key={name}
                      to="/topics/$slug"
                      params={{ slug: topicByName[name]!.slug }}
                      className="rounded-sm border border-border px-2 py-1 text-xs transition-colors hover:bg-secondary"
                    >
                      {name}
                    </Link>
                  ) : (
                    <Tag key={name}>{name}</Tag>
                  ),
                )}
              </div>
            </Panel>
          ) : null}

          {profile.fundamentals.length > 0 ? (
            <Panel className="p-5">
              <SectionTitle aside={`更新 ${profile.revisedAt}`}>国别基本盘</SectionTitle>
              <div className="space-y-3">
                {profile.fundamentals.map((f) => (
                  <div key={f.title}>
                    <p className="text-sm font-semibold">{f.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{f.body}</p>
                  </div>
                ))}
              </div>
            </Panel>
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}
