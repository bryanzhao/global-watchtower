import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/platform/PageShell";
import { RiskBadge } from "@/components/platform/RiskBadge";
import {
  channels,
  feedEntries,
  regionOverview,
  riskAlerts,
  riskTypeLabel,
  topics,
} from "@/data/platform";

export const Route = createFileRoute("/brief")({
  head: () => ({
    meta: [
      { title: "每日风险简报 · 全球安全风险监测平台" },
      {
        name: "description",
        content: "按 A4 版式生成的每日全球安全风险简报：总体研判、生效预警、重点地区、频道要点与专题进展。",
      },
      { property: "og:title", content: "每日风险简报 · 全球安全风险监测平台" },
      {
        property: "og:description",
        content: "可直接打印的 A4 每日简报，汇总当日预警、地区态势与专题进展。",
      },
    ],
  }),
  component: BriefPage,
});

const REPORT_DATE = "2026-08-17";

function BriefPage() {
  const active = riskAlerts.filter((a) => a.state === "active");
  const highlights = feedEntries
    .filter((e) => e.level === "high")
    .slice(0, 6);

  return (
    <PageShell
      eyebrow="Daily Brief"
      title="每日风险简报"
      description="按 A4 版式排布，可直接打印或导出 PDF。内容取自当日预警台账与各频道研判。"
      actions={
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 print:hidden"
        >
          打印 / 导出 PDF
        </button>
      }
    >
      <article className="mx-auto w-full max-w-[820px] border border-border bg-card p-10 print:max-w-none print:border-0 print:p-0">
        <header className="border-b-2 border-primary pb-4">
          <p className="text-[10px] font-semibold tracking-[0.3em] text-primary uppercase">
            Global Security Risk Daily Brief
          </p>
          <h1 className="mt-2 text-2xl font-semibold">全球安全风险每日简报</h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            报告日期 {REPORT_DATE} · 数据截至 08:00 (UTC+8) · 内部资料
          </p>
        </header>

        <Section index="01" title="总体研判">
          <p className="text-sm leading-7">
            当日全球总体风险等级为
            <span className="mx-1 font-semibold text-destructive">高</span>
            。共 {active.length} 条预警处于生效状态，覆盖战争冲突、恐怖袭击与政治动荡等方向；
            {regionOverview.filter((r) => r.level === "high").length} 个重点地区维持高风险。
            建议相关业务单元维持既有出行与安保限制，并关注未来 72 小时的升级信号。
          </p>
        </Section>

        <Section index="02" title="生效预警">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="py-2 text-left font-medium">编号</th>
                <th className="py-2 text-left font-medium">等级</th>
                <th className="py-2 text-left font-medium">标题</th>
                <th className="py-2 text-left font-medium">地区</th>
              </tr>
            </thead>
            <tbody>
              {active.map((a) => (
                <tr key={a.id} className="border-b border-border align-top">
                  <td className="py-2 pr-3 font-mono text-xs whitespace-nowrap">{a.code}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">
                    <RiskBadge level={a.level} />
                  </td>
                  <td className="py-2 pr-3 text-sm">{a.title}</td>
                  <td className="py-2 text-sm whitespace-nowrap">{a.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section index="03" title="重点地区态势">
          <ul className="space-y-2">
            {regionOverview.map((r) => (
              <li key={r.region} className="flex gap-3 text-sm">
                <span className="w-20 shrink-0 font-medium">{r.region}</span>
                <span className="w-14 shrink-0">
                  <RiskBadge level={r.level} />
                </span>
                <span className="text-muted-foreground">{r.drivers}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section index="04" title="频道要点">
          <ul className="space-y-2 text-sm">
            {channels.map((c) => (
              <li key={c.id} className="flex gap-3">
                <span className="w-24 shrink-0 font-medium">{c.name}</span>
                <span className="text-muted-foreground">
                  {c.summary}（24h {c.entries24h} 条 / 生效预警 {c.activeAlerts} 条）
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section index="05" title="专题进展">
          <ul className="space-y-3 text-sm">
            {topics.map((t) => (
              <li key={t.slug}>
                <p className="font-medium">
                  {t.name}
                  <span className="ml-2 font-mono text-xs text-muted-foreground">
                    {riskTypeLabel[t.riskType]} · 更新 {t.updated}
                  </span>
                </p>
                <p className="text-muted-foreground">{t.judgements[0]}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section index="06" title="值得关注的信息条目">
          <ul className="space-y-2 text-sm">
            {highlights.map((e) => (
              <li key={e.id}>
                <p className="font-medium">{e.title}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {e.sourceName} · {e.region} · {e.publishedAt}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        <footer className="mt-8 border-t border-border pt-3 text-xs text-muted-foreground">
          本简报由分析团队基于四类信源（社交媒体、主流媒体、专家智库、自建开源情报）综合研判生成，仅供内部参考。
        </footer>
      </article>
    </PageShell>
  );
}

function Section({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 break-inside-avoid">
      <h2 className="mb-3 flex items-center gap-2 border-l-2 border-primary pl-2 text-sm font-semibold">
        <span className="font-mono text-xs text-primary">{index}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}