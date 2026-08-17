import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/platform/PageShell";
import { Tag } from "@/components/platform/Primitives";
import { RiskBadge } from "@/components/platform/RiskBadge";
import { riskTypeLabel, topics } from "@/data/platform";

export const Route = createFileRoute("/topics/")({
  head: () => ({
    meta: [
      { title: "专题研究 · 全球安全风险监测平台" },
      {
        name: "description",
        content: "针对具体冲突、国别与事件的持续跟踪研究：俄乌冲突、美伊冲突、利比亚国别与美国对古巴行动风险。",
      },
      { property: "og:title", content: "专题研究 · 全球安全风险监测平台" },
      {
        property: "og:description",
        content: "以专题为单位组织信源与研判，输出关键判断、行为体与情景推演。",
      },
    ],
  }),
  component: TopicsIndex,
});

function TopicsIndex() {
  return (
    <PageShell
      eyebrow="Topic Research"
      title="专题研究"
      description="围绕具体冲突、国别或事件建立的持续跟踪专题，跨风险频道调用信源，输出关键判断与情景推演。"
    >
      <div className="grid gap-3 md:grid-cols-2">
        {topics.map((topic) => (
          <Link
            key={topic.slug}
            to="/topics/$topicSlug"
            params={{ topicSlug: topic.slug }}
            className="rounded-md border border-border bg-card p-5 transition-colors hover:bg-secondary"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
                  {topic.code}
                </p>
                <h2 className="mt-1 text-sm font-semibold">{topic.name}</h2>
              </div>
              <RiskBadge level={topic.level} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{topic.overview}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Tag>{riskTypeLabel[topic.riskType]}</Tag>
              <Tag>{topic.owner}</Tag>
              <span className="font-mono text-xs text-muted-foreground">更新 {topic.updated}</span>
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}