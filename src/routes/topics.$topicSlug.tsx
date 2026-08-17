import { createFileRoute, notFound } from "@tanstack/react-router";
import { PageShell } from "@/components/platform/PageShell";
import { Panel, SectionTitle, SourceBadge, Tag } from "@/components/platform/Primitives";
import { RiskBadge } from "@/components/platform/RiskBadge";
import { feedEntries, riskTypeLabel, topics } from "@/data/platform";

export const Route = createFileRoute("/topics/$topicSlug")({
  loader: ({ params }) => {
    const topic = topics.find((t) => t.slug === params.topicSlug);
    if (!topic) throw notFound();
    return { topic };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "专题不存在 · 全球安全风险监测平台" }, { name: "robots", content: "noindex" }],
      };
    }
    const { topic } = loaderData;
    return {
      meta: [
        { title: `${topic.name} · 专题研究 · 全球安全风险监测平台` },
        { name: "description", content: topic.overview },
        { property: "og:title", content: `${topic.name} · 专题研究` },
        { property: "og:description", content: topic.overview },
      ],
    };
  },
  component: TopicDetail,
  notFoundComponent: TopicNotFound,
});

function TopicNotFound() {
  return (
    <PageShell eyebrow="Topic Research" title="专题不存在" description="请从专题列表重新选择。">
      <Panel className="px-5 py-8 text-center text-sm text-muted-foreground">未找到对应专题。</Panel>
    </PageShell>
  );
}

function TopicDetail() {
  const { topic } = Route.useLoaderData();
  const related = feedEntries.filter((e) => e.riskType === topic.riskType).slice(0, 6);

  return (
    <PageShell
      eyebrow={topic.code}
      title={topic.name}
      description={topic.overview}
      actions={<RiskBadge level={topic.level} />}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Tag>{riskTypeLabel[topic.riskType]}</Tag>
        <Tag>负责人 {topic.owner}</Tag>
        <span className="font-mono text-xs text-muted-foreground">更新 {topic.updated}</span>
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-[3fr_2fr]">
        <div>
          <SectionTitle>关键判断</SectionTitle>
          <Panel className="p-5">
            <ol className="space-y-2 text-sm">
              {topic.judgements.map((j, i) => (
                <li key={j} className="flex gap-3">
                  <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
                  <span>{j}</span>
                </li>
              ))}
            </ol>
          </Panel>

          <SectionTitle>情景推演</SectionTitle>
          <Panel className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface">
                  <tr className="text-xs tracking-wider text-muted-foreground uppercase">
                    <th className="px-5 py-3 text-left font-medium">情景</th>
                    <th className="px-5 py-3 text-left font-medium">可能性</th>
                    <th className="px-5 py-3 text-left font-medium">说明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topic.scenarios.map((s) => (
                    <tr key={s.name}>
                      <td className="px-5 py-3 text-sm whitespace-nowrap">{s.name}</td>
                      <td className="px-5 py-3 text-sm whitespace-nowrap">{s.probability}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{s.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <SectionTitle aside={`${related.length} 条`}>相关信息条目</SectionTitle>
          <Panel className="divide-y divide-border">
            {related.map((entry) => (
              <div key={entry.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium">{entry.title}</p>
                  <RiskBadge level={entry.level} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <SourceBadge id={entry.sourceClass} />
                  <Tag>{entry.region}</Tag>
                  <span className="font-mono text-xs text-muted-foreground">{entry.publishedAt}</span>
                </div>
              </div>
            ))}
          </Panel>
        </div>

        <div>
          <SectionTitle>关键行为体</SectionTitle>
          <Panel className="divide-y divide-border">
            {topic.actors.map((a) => (
              <div key={a.name} className="px-5 py-3">
                <p className="text-sm font-medium">{a.name}</p>
                <p className="text-xs text-muted-foreground">
                  {a.role} · {a.posture}
                </p>
              </div>
            ))}
          </Panel>

          <SectionTitle>专题时间线</SectionTitle>
          <Panel className="p-5">
            <ul className="space-y-3 border-l border-border pl-4">
              {topic.timeline.map((item) => (
                <li key={item.date}>
                  <p className="font-mono text-xs text-muted-foreground">{item.date}</p>
                  <p className="text-sm">{item.text}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </section>
    </PageShell>
  );
}