import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/platform/PageShell";
import { Panel, SectionTitle } from "@/components/platform/Primitives";
import { RiskBadge } from "@/components/platform/RiskBadge";
import { countryList, countryRegions } from "@/data/countries";
import { aggregateByCountry, timeWindowLabel } from "@/data/analytics";
import { useWorkbench } from "@/state/workbench";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/countries/")({
  head: () => ({
    meta: [
      { title: "国别列表 · 全球安全风险监测平台" },
      {
        name: "description",
        content: "按地区浏览全部受监测国家，查看近 7 天已确认风险事件数量与最高风险等级，进入国别详情页。",
      },
      { property: "og:title", content: "国别列表 · 全球安全风险监测平台" },
      { property: "og:description", content: "按地区检索国别风险页入口。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CountryIndex,
});

function CountryIndex() {
  const { events } = useWorkbench();
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("all");

  const aggregates = useMemo(() => aggregateByCountry(events, 168), [events]);

  const grouped = useMemo(() => {
    const filtered = countryList.filter(
      (c) =>
        (region === "all" || c.region === region) &&
        (q.trim() === "" || c.name.includes(q.trim()) || c.code.includes(q.trim().toUpperCase())),
    );
    return countryRegions
      .map((r) => ({ region: r, items: filtered.filter((c) => c.region === r) }))
      .filter((g) => g.items.length > 0);
  }, [q, region]);

  return (
    <PageShell
      eyebrow="Countries"
      title="国别列表"
      description={`共 ${countryList.length} 个受监测国家 / 地区。数量为${timeWindowLabel[168]}已确认风险事件数。`}
      actions={
        <div className="flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索国家或代码"
            className="w-44 rounded-sm border border-border bg-background px-2 py-1.5 text-sm"
          />
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="rounded-sm border border-border bg-background px-2 py-1.5 text-sm"
          >
            <option value="all">全部地区</option>
            {countryRegions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      }
    >
      <div className="space-y-5">
        {grouped.map((g) => (
          <Panel key={g.region} className="p-5">
            <SectionTitle aside={`${g.items.length} 个`}>{g.region}</SectionTitle>
            <ul className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((c) => {
                const agg = aggregates.get(c.code);
                return (
                  <li key={c.code}>
                    <Link
                      to="/countries/$code"
                      params={{ code: c.code }}
                      className={cn(
                        "flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-sm transition-colors hover:border-primary/50 hover:bg-secondary",
                      )}
                    >
                      <span className="font-mono text-xs text-muted-foreground">{c.code}</span>
                      <span className="truncate">{c.name}</span>
                      {c.hasProfile ? (
                        <span className="rounded-sm border border-border px-1 text-[10px] text-muted-foreground">
                          档案
                        </span>
                      ) : null}
                      {agg ? <RiskBadge level={agg.level} className="ml-auto" /> : null}
                      <span className={cn("w-5 text-right text-xs tabular-nums", !agg && "ml-auto text-muted-foreground")}>
                        {agg?.count ?? 0}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Panel>
        ))}
        {grouped.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">没有匹配的国家。</p>
        ) : null}
      </div>
    </PageShell>
  );
}
