import { useMemo } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/platform/PageShell";
import { Panel, Tag } from "@/components/platform/Primitives";
import { RiskBadge } from "@/components/platform/RiskBadge";
import { riskTypeLabel } from "@/data/platform";
import { countryNameByCode } from "@/data/hexmap";
import { eventTopics, sortByTimeDesc, withinWindow } from "@/data/analytics";
import { topicProfiles, topicStatusLabel } from "@/data/topics";
import { useWorkbench } from "@/state/workbench";

export const Route = createFileRoute("/topics/")({
  head: () => ({
    meta: [
      { title: "专题 · 全球安全风险监测平台" },
      {
        name: "description",
        content: "俄乌冲突、美伊对抗、红海航运等重大风险专题清单，含当前等级、态势判断与近期关键进展数量。",
      },
      { property: "og:title", content: "专题 · 全球安全风险监测平台" },
      {
        property: "og:description",
        content: "按专题组织的风险研判入口，一条风险信息可同时归入多个专题。",
      },
    ],
  }),
  component: TopicsIndex,
});

function TopicsIndex() {
  const { events } = useWorkbench();

  const rows = useMemo(
    () =>
      topicProfiles.map((t) => {
        const related = sortByTimeDesc(events.filter((e) => eventTopics(e).includes(t.topic)));
        return {
          profile: t,
          total: related.length,
          recent: related.filter((e) => withinWindow(e, 24)).length,
          latest: related[0],
        };
      }),
    [events],
  );

  return (
    <PageShell
      eyebrow="Topics"
      title="重大风险专题"
      description="每个专题聚合来自风险信息流的关键进展。同一条风险信息可同时从属多个专题（例如马里袭击既属「萨赫勒安全」也属「马里局势」）。"
      actions={<span className="text-xs text-muted-foreground">共 {topicProfiles.length} 个专题</span>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(({ profile, total, recent, latest }) => (
          <Link
            key={profile.slug}
            to="/topics/$slug"
            params={{ slug: profile.slug }}
            className="block"
          >
            <Panel className="h-full p-4 transition-colors hover:bg-secondary">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-sm font-semibold">{profile.name}</h2>
                <RiskBadge level={profile.level} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Tag>{topicStatusLabel[profile.status]}</Tag>
                {profile.primaryTypes.map((t) => (
                  <Tag key={t}>{riskTypeLabel[t]}</Tag>
                ))}
              </div>
              <p className="mt-2.5 text-sm text-muted-foreground">{profile.headline}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                涉及国家：
                {profile.countries.map((c) => countryNameByCode[c] ?? c).join(" · ")}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
                <span>
                  24h 新增 <span className="font-mono text-foreground tabular-nums">{recent}</span>
                </span>
                <span>
                  累计 <span className="font-mono text-foreground tabular-nums">{total}</span>
                </span>
                <span className="ml-auto">更新于 {profile.updatedAt}</span>
              </div>
              {latest ? (
                <p className="mt-2 truncate text-xs text-muted-foreground">
                  最新：{latest.occurredAt} {latest.title}
                </p>
              ) : null}
            </Panel>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
