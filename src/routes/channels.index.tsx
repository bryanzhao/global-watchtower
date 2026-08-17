import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/platform/PageShell";
import { SourceBadge } from "@/components/platform/Primitives";
import { RiskBadge } from "@/components/platform/RiskBadge";
import { channels } from "@/data/platform";

export const Route = createFileRoute("/channels/")({
  head: () => ({
    meta: [
      { title: "风险频道 · 全球安全风险监测平台" },
      {
        name: "description",
        content: "按风险类型组织的常规监测频道：战争冲突、恐怖袭击、政治动荡、骚乱示威、治安犯罪、自然灾害与传染病。",
      },
      { property: "og:title", content: "风险频道 · 全球安全风险监测平台" },
      {
        property: "og:description",
        content: "每个频道绑定一组信源，输出该风险类型的地区态势与时间线。",
      },
    ],
  }),
  component: ChannelsIndex,
});

function ChannelsIndex() {
  return (
    <PageShell
      eyebrow="Risk Channels"
      title="风险频道"
      description="按风险类型开展的常规监测。每个频道绑定一组信源组合，持续输出地区态势、时间线与预警线索。"
    >
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {channels.map((channel) => (
          <Link
            key={channel.id}
            to="/channels/$channelId"
            params={{ channelId: channel.id }}
            className="rounded-md border border-border bg-card p-5 transition-colors hover:bg-secondary"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
                  {channel.code}
                </p>
                <h2 className="mt-1 text-sm font-semibold">{channel.name}</h2>
              </div>
              <RiskBadge level={channel.level} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{channel.summary}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {channel.boundSources.map((s) => (
                <SourceBadge key={s} id={s} />
              ))}
            </div>
            <p className="mt-3 font-mono text-xs text-muted-foreground">
              24h {channel.entries24h} 条 · 生效预警 {channel.activeAlerts} 条
            </p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}