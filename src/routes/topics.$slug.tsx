import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/platform/PageShell";
import { Panel, SectionTitle, SourceLink, Tag } from "@/components/platform/Primitives";
import { RiskBadge } from "@/components/platform/RiskBadge";
import { riskTypeLabel } from "@/data/platform";
import { topicBySlug, topicStatusLabel, type TopicModule, type TopicProfile } from "@/data/topics";
import { countryNameByCode } from "@/data/hexmap";
import { sortByTimeDesc, eventTopics } from "@/data/analytics";
import { useWorkbench } from "@/state/workbench";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/data/types";

export const Route = createFileRoute("/topics/$slug")({
  loader: ({ params }) => {
    const topic = topicBySlug[params.slug];
    if (!topic) throw notFound();
    return { topic };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "议题未找到 · 全球安全风险监测平台" }, { name: "robots", content: "noindex" }] };
    }
    const t = loaderData.topic;
    const title = `${t.name} 主题研究 · 全球安全风险监测平台`;
    return {
      meta: [
        { title },
        { name: "description", content: t.headline },
        { property: "og:title", content: title },
        { property: "og:description", content: t.headline },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  notFoundComponent: TopicNotFound,
  component: TopicPage,
});

function TopicNotFound() {
  return (
    <PageShell eyebrow="Topic" title="议题不存在" description="该主题研究页尚未建立。">
      <Link to="/" className="text-sm text-primary underline-offset-4 hover:underline">
        返回全局概览
      </Link>
    </PageShell>
  );
}

function TopicPage() {
  const { topic } = Route.useLoaderData() as { topic: TopicProfile };
  const { events, items } = useWorkbench();

  const related = sortByTimeDesc(events.filter((e) => eventTopics(e).includes(topic.topic)));

  return (
    <PageShell
      eyebrow="Topic Research"
      title={topic.name}
      description={topic.overview}
      actions={
        <div className="flex items-center gap-2">
          <Tag>{topicStatusLabel[topic.status]}</Tag>
          <RiskBadge level={topic.level} />
          <span className="text-xs text-muted-foreground">更新于 {topic.updatedAt}</span>
        </div>
      }
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Panel className="p-5">
            <SectionTitle aside="分析师研判">关键判断</SectionTitle>
            <ul className="space-y-2.5">
              {topic.judgments.map((j) => (
                <li key={j.text} className="flex gap-3 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-border font-mono text-[10px]">
                    {j.confidence}
                  </span>
                  <span className="leading-relaxed">{j.text}</span>
                </li>
              ))}
            </ul>
          </Panel>

          {topic.modules.map((m) => (
            <ModuleBlock key={m.title} module={m} />
          ))}

          <Panel className="p-5">
            <SectionTitle aside={`${related.length} 起`}>本议题风险事件流</SectionTitle>
            {related.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">暂无关联的已确认事件。</p>
            ) : (
              <ol className="relative border-l border-border pl-6">
                {related.map((e) => {
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
                        <Tag>{e.country}</Tag>
                        {e.city ? <Tag>{e.city}</Tag> : null}
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
            <SectionTitle>情景推演</SectionTitle>
            <ul className="space-y-3">
              {topic.scenarios.map((s) => (
                <li key={s.name} className="rounded-sm border border-border p-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold">{s.name}</span>
                    <span className="font-mono text-xs text-primary">{s.probability}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.summary}</p>
                  <ul className="mt-2 space-y-1">
                    {s.indicators.map((ind) => (
                      <li key={ind} className="flex gap-1.5 text-xs">
                        <span className="text-muted-foreground">·</span>
                        {ind}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="p-5">
            <SectionTitle>行为体</SectionTitle>
            <ActorGroup label="国家行为体" items={topic.actors.states} />
            <ActorGroup label="组织机构" items={topic.actors.organizations} />
            <ActorGroup label="关键个人" items={topic.actors.people} />
          </Panel>

          <Panel className="p-5">
            <SectionTitle>涉及国家</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {topic.countries.map((code) => (
                <Link
                  key={code}
                  to="/countries/$code"
                  params={{ code }}
                  className="rounded-sm border border-border px-2 py-1 text-xs transition-colors hover:bg-secondary"
                >
                  {countryNameByCode[code] ?? code}
                </Link>
              ))}
            </div>
            <SectionTitle>主要风险类型</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {topic.primaryTypes.map((t) => (
                <Tag key={t}>{riskTypeLabel[t]}</Tag>
              ))}
            </div>
          </Panel>

          <Panel className="p-5">
            <SectionTitle>议题里程碑</SectionTitle>
            <ol className="space-y-2">
              {topic.milestones.map((m) => (
                <li key={m.date} className="flex gap-3 text-xs">
                  <span className="font-mono text-muted-foreground tabular-nums">{m.date}</span>
                  <span>{m.label}</span>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>
    </PageShell>
  );
}

function ActorGroup({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-3 last:mb-0">
      <p className="mb-1 text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((i) => (
          <Tag key={i}>{i}</Tag>
        ))}
      </div>
    </div>
  );
}

const levelBar: Record<RiskLevel, string> = {
  high: "bg-destructive",
  medium: "bg-warning",
  low: "bg-success",
};

function ModuleBlock({ module: m }: { module: TopicModule }) {
  return (
    <Panel className="p-5">
      <SectionTitle aside={m.note}>{m.title}</SectionTitle>
      {m.kind === "matrix" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs tracking-wider text-muted-foreground uppercase">
                {m.columns.map((c) => (
                  <th key={c} className="py-2 pr-4 font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {m.rows.map((r) => (
                <tr key={r.cells.join("|")} className="border-b border-border/60 last:border-0">
                  {r.cells.map((cell, idx) => (
                    <td key={idx} className="py-2 pr-4 align-top">
                      {idx === 0 && r.level ? (
                        <span className="flex items-center gap-2">
                          <span className={cn("h-2 w-2 rounded-full", levelBar[r.level])} aria-hidden />
                          {cell}
                        </span>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {m.kind === "gauge" ? (
        (() => {
          const max = m.items.some((i) => i.value > 5) ? 100 : 5;
          return (
            <ul className="space-y-3">
              {m.items.map((it) => {
                const pct = Math.max(0, Math.min(100, (it.value / max) * 100));
                const tone: RiskLevel = pct >= 70 ? "high" : pct >= 40 ? "medium" : "low";
                return (
                  <li key={it.label}>
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span>{it.label}</span>
                      <span className="font-mono text-xs tabular-nums">
                        {it.value}/{max}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-sm bg-muted">
                      <div className={cn("h-1.5 rounded-sm", levelBar[tone])} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{it.note}</p>
                  </li>
                );
              })}
            </ul>
          );
        })()
      ) : null}

      {m.kind === "timeline" ? (
        <ol className="relative border-l border-border pl-5">
          {m.items.map((it) => (
            <li key={`${it.date}-${it.label}`} className="relative pb-4 last:pb-0">
              <span className="absolute top-1.5 -left-[22px] h-2 w-2 rounded-full border-2 border-background bg-primary" aria-hidden />
              <div className="flex gap-2 text-sm">
                <span className="font-mono text-xs text-muted-foreground tabular-nums">{it.date}</span>
                <span className="font-medium">{it.label}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{it.note}</p>
            </li>
          ))}
        </ol>
      ) : null}

      {m.kind === "notes" ? (
        <ul className="space-y-2">
          {m.items.map((it) => (
            <li key={it} className="flex gap-2 text-sm leading-relaxed">
              <span className="text-muted-foreground">·</span>
              {it}
            </li>
          ))}
        </ul>
      ) : null}
    </Panel>
  );
}
