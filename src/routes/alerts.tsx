import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/platform/PageShell";
import {
  KpiCard,
  Panel,
  PendingTag,
  SectionTitle,
  SourceLink,
  Tag,
} from "@/components/platform/Primitives";
import { RiskBadge } from "@/components/platform/RiskBadge";
import {
  dispatchChannels,
  feedEntryMap,
  riskAlerts,
  riskTypeLabel,
} from "@/data/platform";
import type { AlertState } from "@/data/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "风险预警频道 · 全球安全风险监测平台" },
      {
        name: "description",
        content: "正式风险预警的发布、生效状态与推送流水，支持邮件、企业微信、钉钉、Webhook 与短信通道。",
      },
      { property: "og:title", content: "风险预警频道 · 全球安全风险监测平台" },
      {
        property: "og:description",
        content: "从信息流研判到正式预警发布与对外推送的完整记录。",
      },
    ],
  }),
  component: AlertsPage,
});

const stateLabel: Record<AlertState, string> = {
  draft: "待发布",
  active: "生效中",
  closed: "已解除",
};

const stateTone: Record<AlertState, string> = {
  draft: "text-warning-foreground",
  active: "text-destructive",
  closed: "text-muted-foreground",
};

function AlertsPage() {
  const [selectedId, setSelectedId] = useState(riskAlerts[0]!.id);
  const selected = riskAlerts.find((a) => a.id === selectedId)!;

  const active = riskAlerts.filter((a) => a.state === "active");
  const drafts = riskAlerts.filter((a) => a.state === "draft");
  const today = riskAlerts.filter((a) => a.publishedAt.startsWith("2026-08-17"));

  return (
    <PageShell
      eyebrow="Alert Channel"
      title="风险预警频道"
      description="信息流研判确认的风险在此升级为正式预警并对外发布。渠道外发接口接入前，推送动作以模拟流水记录，便于校验流程与文案。"
    >
      <section className="grid gap-4 md:grid-cols-4">
        <KpiCard label="生效中预警" value={active.length} unit="条" delta="较昨日 +1" deltaTone="up-bad" source="预警台账" />
        <KpiCard label="今日新增" value={today.length} unit="条" delta="值班组发布" source="08-17" />
        <KpiCard label="待发布草稿" value={drafts.length} unit="条" delta="需复核后发布" source="起草中" />
        <KpiCard label="已接入推送渠道" value={0} unit={`/ ${dispatchChannels.length}`} delta="全部渠道待接入" source="推送配置" />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <section>
          <SectionTitle aside={`${riskAlerts.length} 条预警记录`}>预警台账</SectionTitle>
          <Panel className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface">
                  <tr className="text-xs tracking-wider text-muted-foreground uppercase">
                    <th className="px-5 py-3 text-left font-medium">编号</th>
                    <th className="px-5 py-3 text-left font-medium">等级</th>
                    <th className="px-5 py-3 text-left font-medium">标题</th>
                    <th className="px-5 py-3 text-left font-medium">地区</th>
                    <th className="px-5 py-3 text-left font-medium">发布时间</th>
                    <th className="px-5 py-3 text-left font-medium">状态</th>
                    <th className="px-5 py-3 text-left font-medium">推送</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {riskAlerts.map((alert) => (
                    <tr
                      key={alert.id}
                      onClick={() => setSelectedId(alert.id)}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-secondary",
                        alert.id === selectedId && "bg-primary/5",
                      )}
                    >
                      <td className="px-5 py-3 font-mono text-xs whitespace-nowrap">{alert.code}</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <RiskBadge level={alert.level} />
                      </td>
                      <td className="px-5 py-3 text-sm">{alert.title}</td>
                      <td className="px-5 py-3 text-sm whitespace-nowrap">{alert.region}</td>
                      <td className="px-5 py-3 font-mono text-xs whitespace-nowrap text-muted-foreground">
                        {alert.publishedAt}
                      </td>
                      <td className={cn("px-5 py-3 text-sm whitespace-nowrap", stateTone[alert.state])}>
                        {stateLabel[alert.state]}
                      </td>
                      <td className="px-5 py-3 text-sm whitespace-nowrap text-muted-foreground tabular-nums">
                        {alert.dispatches.length} 次
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <SectionTitle aside="接入后由服务端触发投递并回写回执">推送渠道配置</SectionTitle>
          <Panel className="divide-y divide-border">
            {dispatchChannels.map((channel) => (
              <div key={channel.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div>
                  <p className="text-sm font-medium">{channel.name}</p>
                  <p className="text-xs text-muted-foreground">{channel.target}</p>
                </div>
                <PendingTag />
              </div>
            ))}
          </Panel>
        </section>

        <aside>
          <SectionTitle aside={<span className="font-mono">{selected.code}</span>}>预警详情</SectionTitle>
          <Panel className="p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold">{selected.title}</h3>
              <RiskBadge level={selected.level} />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Tag>{riskTypeLabel[selected.riskType]}</Tag>
              <Tag>{selected.region}</Tag>
              <span className={cn("text-xs", stateTone[selected.state])}>{stateLabel[selected.state]}</span>
              <span className="font-mono text-xs text-muted-foreground">{selected.publishedAt}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{selected.body}</p>

            <Block title="影响范围">
              <ul className="space-y-1 text-sm text-muted-foreground">
                {selected.impact.map((item) => (
                  <li key={item}>· {item}</li>
                ))}
              </ul>
            </Block>

            <Block title="处置建议">
              <ol className="space-y-1 text-sm text-muted-foreground">
                {selected.advice.map((item, i) => (
                  <li key={item}>
                    {i + 1}. {item}
                  </li>
                ))}
              </ol>
            </Block>

            <Block title="依据来源">
              {selected.sourceEntryIds.length === 0 ? (
                <p className="text-sm text-muted-foreground">无关联条目。</p>
              ) : (
                <ul className="space-y-2">
                  {selected.sourceEntryIds.map((id) => {
                    const entry = feedEntryMap[id];
                    if (!entry) return null;
                    return (
                      <li key={id} className="text-sm">
                        <SourceLink href={entry.url}>{entry.title}</SourceLink>
                        <p className="font-mono text-xs text-muted-foreground">
                          {entry.id} · {entry.sourceName} · {entry.publishedAt}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Block>

            <Block title="推送记录">
              {selected.dispatches.length === 0 ? (
                <p className="text-sm text-muted-foreground">尚未推送。</p>
              ) : (
                <ul className="space-y-2 border-l border-border pl-4">
                  {selected.dispatches.map((record) => (
                    <li key={`${record.channel}-${record.at}`} className="text-sm">
                      <span className="font-medium">
                        {dispatchChannels.find((c) => c.id === record.channel)?.name}
                      </span>
                      <span className="ml-2 font-mono text-xs text-muted-foreground">{record.at}</span>
                      <p className="text-xs text-muted-foreground">
                        {record.state === "simulated"
                          ? "模拟推送"
                          : record.state === "queued"
                            ? "排队中"
                            : record.state === "sent"
                              ? "已送达"
                              : "失败"}
                        {record.note ? ` · ${record.note}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Block>

            <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
              发布人：{selected.publisher}
            </p>
          </Panel>
        </aside>
      </div>
    </PageShell>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 border-t border-border pt-4">
      <p className="mb-2 text-xs font-semibold tracking-wider uppercase">{title}</p>
      {children}
    </div>
  );
}