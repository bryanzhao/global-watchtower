import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/platform/PageShell";
import { KpiCard, Panel, SectionTitle, SourceBadge, Tag } from "@/components/platform/Primitives";
import { RiskBadge } from "@/components/platform/RiskBadge";
import { channelMap, channels, feedEntries } from "@/data/platform";
import type { RiskTypeId } from "@/data/types";

export const Route = createFileRoute("/channels/$channelId")({
  loader: ({ params }) => {
    const channel = channelMap[params.channelId as RiskTypeId];
    if (!channel) throw notFound();
    return { channel };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "频道不存在 · 全球安全风险监测平台" }, { name: "robots", content: "noindex" }],
      };
    }
    const { channel } = loaderData;
    const title = `${channel.name} · 风险频道`;
    return {
      meta: [
        { title: `${title} · 全球安全风险监测平台` },
        { name: "description", content: channel.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: channel.summary },
      ],
    };
  },
  component: ChannelDetail,
  notFoundComponent: ChannelNotFound,
});

function ChannelNotFound() {
  return (
    <PageShell eyebrow="Risk Channel" title="频道不存在" description="请从风险频道列表重新选择。">
      <Panel className="px-5 py-8 text-center text-sm text-muted-foreground">
        未找到对应的风险频道。
      </Panel>
    </PageShell>
  );
}

function ChannelDetail() {
  const { channel } = Route.useLoaderData();
  const related = feedEntries.filter((e) => e.riskType === channel.id);
  const highRegions = channel.regions.filter((r) => r.level === "high").length;

  return (
    <PageShell
      eyebrow={channel.code}
      title={channel.name}
      description={channel.summary}
      actions={<RiskBadge level={channel.level} />}
    >
      <section className="grid gap-4 md:grid-cols-4">
        <KpiCard label="24 小时信息量" value={channel.entries24h} unit="条" source="绑定信源" />
        <KpiCard label="生效预警" value={channel.activeAlerts} unit="条" deltaTone="up-bad" delta="需持续跟踪" source="预警频道" />
        <KpiCard label="高风险地区" value={highRegions} unit="个" source="地区研判" />
        <KpiCard label="绑定信源类别" value={channel.boundSources.length} unit={`/ 4`} source="信源组合" />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div>
          <SectionTitle>地区风险研判</SectionTitle>
          <Panel className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface">
                  <tr className="text-xs tracking-wider text-muted-foreground uppercase">
                    <th className="px-5 py-3 text-left font-medium">地区</th>
                    <th className="px-5 py-3 text-left font-medium">等级</th>
                    <th className="px-5 py-3 text-left font-medium">研判说明</th>
                    <th className="px-5 py-3 text-left font-medium">更新</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {channel.regions.map((r) => (
                    <tr key={r.region}>
                      <td className="px-5 py-3 text-sm whitespace-nowrap">{r.region}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <RiskBadge level={r.level} />
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{r.note}</td>
                      <td className="px-5 py-3 font-mono text-xs whitespace-nowrap text-muted-foreground">
                        {r.updated}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        <div>
          <SectionTitle>态势时间线</SectionTitle>
          <Panel className="p-5">
            <ul className="space-y-3 border-l border-border pl-4">
              {channel.timeline.map((item) => (
                <li key={item.date}>
                  <p className="font-mono text-xs text-muted-foreground">{item.date}</p>
                  <p className="text-sm">{item.text}</p>
                </li>
              ))}
            </ul>
          </Panel>

          <SectionTitle>绑定信源组合</SectionTitle>
          <Panel className="flex flex-wrap gap-2 p-5">
            {channel.boundSources.map((s) => (
              <SourceBadge key={s} id={s} />
            ))}
          </Panel>
        </div>
      </section>

      <section className="mt-6">
        <SectionTitle aside={`${related.length} 条`}>相关信息条目</SectionTitle>
        <Panel className="divide-y divide-border">
          {related.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">暂无关联条目。</p>
          ) : (
            related.map((entry) => (
              <div key={entry.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium">{entry.title}</p>
                  <RiskBadge level={entry.level} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{entry.summary}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <SourceBadge id={entry.sourceClass} />
                  <Tag>{entry.region}</Tag>
                  <span className="font-mono text-xs text-muted-foreground">{entry.publishedAt}</span>
                </div>
              </div>
            ))
          )}
        </Panel>
      </section>

      <p className="mt-6 text-xs text-muted-foreground">
        当前共 {channels.length} 个风险频道，可在频道列表切换。
      </p>
    </PageShell>
  );
}