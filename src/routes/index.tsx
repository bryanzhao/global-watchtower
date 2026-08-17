import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/platform/PageShell";
import { KpiCard, Panel, PendingTag, SectionTitle, SourceBadge, Tag } from "@/components/platform/Primitives";
import { RiskBadge } from "@/components/platform/RiskBadge";
import {
  channels,
  feedEntries,
  regionOverview,
  riskAlerts,
  sourceClasses,
} from "@/data/platform";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "全球风险总览 · 全球安全风险监测平台" },
      {
        name: "description",
        content: "全球安全风险态势总览：预警数量、地区风险分布、风险频道与四类信源接入状态。",
      },
      { property: "og:title", content: "全球风险总览 · 全球安全风险监测平台" },
      {
        property: "og:description",
        content: "实时汇总全球战争、恐袭、动荡、骚乱、治安、灾害与传染病风险态势。",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  const activeAlerts = riskAlerts.filter((a) => a.state === "active");
  const pending = feedEntries.filter((e) => e.status === "pending");
  const highRegions = regionOverview.filter((r) => r.level === "high");
  const todayEntries = sourceClasses.reduce((sum, s) => sum + s.todayCount, 0);

  return (
    <PageShell
      eyebrow="Global Risk Overview"
      title="全球风险总览"
      description="汇总四类信源接入状态、各风险频道态势与生效中的正式预警，作为每日值班与研判的起点。"
    >
      <section className="grid gap-4 md:grid-cols-4">
        <KpiCard label="生效中预警" value={activeAlerts.length} unit="条" delta="较昨日 +1" deltaTone="up-bad" source="预警频道" />
        <KpiCard label="高风险地区" value={highRegions.length} unit="个" delta="较上周 +1" deltaTone="up-bad" source="地区研判" />
        <KpiCard label="24 小时新增信息" value={todayEntries} unit="条" delta="较昨日 +8.4%" deltaTone="neutral" source="四类信源" />
        <KpiCard label="待研判条目" value={pending.length} unit="条" delta="需今日清零" deltaTone="neutral" source="信息流工作台" />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div>
          <SectionTitle aside="按地区研判 · 08-17 08:00 UTC">全球风险等级分布</SectionTitle>
          <Panel className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface">
                  <tr className="text-xs tracking-wider text-muted-foreground uppercase">
                    <th className="px-5 py-3 text-left font-medium">地区</th>
                    <th className="px-5 py-3 text-left font-medium">风险等级</th>
                    <th className="px-5 py-3 text-left font-medium">主要驱动因素</th>
                    <th className="px-5 py-3 text-right font-medium">生效预警</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {regionOverview.map((row) => (
                    <tr key={row.region}>
                      <td className="px-5 py-3 text-sm whitespace-nowrap">{row.region}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <RiskBadge level={row.level} />
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{row.drivers}</td>
                      <td className="px-5 py-3 text-right text-sm tabular-nums">{row.alerts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div>
          <SectionTitle aside={<Link to="/alerts" className="text-primary transition-colors hover:underline">查看全部</Link>}>
            生效中的正式预警
          </SectionTitle>
          <Panel className="divide-y divide-border">
            {activeAlerts.map((alert) => (
              <Link
                key={alert.id}
                to="/alerts"
                className="block px-5 py-3 transition-colors hover:bg-secondary"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <RiskBadge level={alert.level} />
                </div>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {alert.code} · {alert.region} · {alert.publishedAt}
                </p>
              </Link>
            ))}
          </Panel>
        </div>
      </section>

      <section className="mt-6">
        <SectionTitle aside="按风险类型组织的常规监测">风险频道</SectionTitle>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {channels.map((channel) => (
            <Link
              key={channel.id}
              to="/channels/$channelId"
              params={{ channelId: channel.id }}
              className="rounded-md border border-border bg-card p-4 transition-colors hover:bg-secondary"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold">{channel.name}</p>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
              </div>
              <p className="mt-1 text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
                {channel.code}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <RiskBadge level={channel.level} />
                <span className="text-xs text-muted-foreground tabular-nums">
                  24h {channel.entries24h} 条 · 预警 {channel.activeAlerts}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <SectionTitle aside="信息流由外部 API 接入，本站负责研判与发布">四类信源接入状态</SectionTitle>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {sourceClasses.map((source) => (
            <div key={source.id} className="rounded-md border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold">{source.name}</p>
                {source.status === "connected" ? (
                  <Tag>已接入</Tag>
                ) : source.status === "degraded" ? (
                  <span className="inline-block rounded-sm border border-destructive/30 bg-destructive/15 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-destructive">
                    延迟
                  </span>
                ) : (
                  <PendingTag />
                )}
              </div>
              <p className="mt-1 text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
                {source.code}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{source.description}</p>
              <p className="mt-3 font-mono text-xs text-muted-foreground">
                信源 {source.feedCount} 个 · 今日 {source.todayCount} 条 · 时效 {source.latency}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <SectionTitle aside={<Link to="/feed" className="text-primary transition-colors hover:underline">进入信息流工作台</Link>}>
          今日重点信息
        </SectionTitle>
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface">
                <tr className="text-xs tracking-wider text-muted-foreground uppercase">
                  <th className="px-5 py-3 text-left font-medium">时间</th>
                  <th className="px-5 py-3 text-left font-medium">标题</th>
                  <th className="px-5 py-3 text-left font-medium">信源类别</th>
                  <th className="px-5 py-3 text-left font-medium">地区</th>
                  <th className="px-5 py-3 text-left font-medium">等级</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {feedEntries.slice(0, 6).map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-5 py-3 font-mono text-xs whitespace-nowrap text-muted-foreground">
                      {entry.publishedAt}
                    </td>
                    <td className="px-5 py-3 text-sm">{entry.title}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <SourceBadge id={entry.sourceClass} />
                    </td>
                    <td className="px-5 py-3 text-sm whitespace-nowrap">{entry.region}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <RiskBadge level={entry.level} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>
    </PageShell>
  );
}