import { useMemo, useState } from "react";
import { Sparkles, X } from "lucide-react";
import { riskTypeLabel, riskTypes, topics } from "@/data/platform";
import { countryCodeByName } from "@/data/hexmap";
import type { RawItem, RiskLevel, RiskTypeId } from "@/data/types";
import type { NewEventDraft } from "@/state/workbench";
import { PendingTag } from "./Primitives";

function splitTags(value: string) {
  return value
    .split(/[,，、;；]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function ExtractDrawer({
  items,
  onRemoveItem,
  onCancel,
  onSubmit,
}: {
  items: RawItem[];
  onRemoveItem: (id: string) => void;
  onCancel: () => void;
  onSubmit: (draft: NewEventDraft) => void;
}) {
  const first = items[0];
  const prefill = useMemo(() => {
    const region = items.find((i) => i.region)?.region ?? "";
    const [country = "", city = ""] = region.split(" · ");
    return {
      title: first ? first.text.slice(0, 28) : "",
      summary: items.map((i) => i.text).join(" "),
      occurredAt: items[items.length - 1]?.publishedAt ?? "",
      country,
      city,
      riskType: (first?.riskType ?? "war") as RiskTypeId,
      topic: items.find((i) => i.topic)?.topic ?? "",
    };
  }, [items, first]);

  const [title, setTitle] = useState(prefill.title);
  const [summary, setSummary] = useState(prefill.summary);
  const [occurredAt, setOccurredAt] = useState(prefill.occurredAt);
  const [occurredEnd, setOccurredEnd] = useState("");
  const [country, setCountry] = useState(prefill.country);
  const [area, setArea] = useState("");
  const [city, setCity] = useState(prefill.city);
  const [stateActors, setStateActors] = useState("");
  const [organizations, setOrganizations] = useState("");
  const [people, setPeople] = useState("");
  const [riskType, setRiskType] = useState<RiskTypeId>(prefill.riskType);
  const [level, setLevel] = useState<RiskLevel>("medium");
  const [confidence, setConfidence] = useState<"A" | "B" | "C">("B");
  const [topic, setTopic] = useState(prefill.topic);
  const [alsoTopics, setAlsoTopics] = useState<string[]>([]);
  const [alsoCountries, setAlsoCountries] = useState("");

  const canSubmit = title.trim().length > 0 && items.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/30">
      <div className="flex h-full w-full max-w-5xl flex-col border-l border-border bg-background">
        <div className="flex items-center justify-between border-b border-border px-6 py-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
              Extract
            </p>
            <h2 className="text-base font-semibold">提取为风险事件</h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="关闭"
            className="rounded-sm border border-border p-1.5 transition-colors hover:bg-secondary"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="grid flex-1 overflow-hidden md:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="overflow-y-auto border-b border-border p-4 md:border-r md:border-b-0">
            <p className="mb-2 text-xs tracking-wider text-muted-foreground uppercase">
              已选原始条目 {items.length} 条
            </p>
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id} className="rounded-sm border border-border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{item.id}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-xs text-muted-foreground transition-colors hover:text-destructive"
                    >
                      移除
                    </button>
                  </div>
                  <p className="mt-1 text-xs font-medium">{item.author}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.text}</p>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                    {item.publishedAt}
                  </p>
                </li>
              ))}
            </ul>
          </aside>

          <form
            className="overflow-y-auto p-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!canSubmit) return;
              onSubmit({
                title: title.trim(),
                summary: summary.trim(),
                occurredAt,
                ...(occurredEnd ? { occurredEnd } : {}),
                country,
                ...(area ? { area } : {}),
                ...(city ? { city } : {}),
                stateActors: splitTags(stateActors),
                organizations: splitTags(organizations),
                people: splitTags(people),
                riskType,
                level,
                confidence,
                ...(topic ? { topic } : {}),
                ...(alsoTopics.filter((t) => t && t !== topic).length
                  ? { alsoTopics: alsoTopics.filter((t) => t && t !== topic) }
                  : {}),
                ...(splitTags(alsoCountries).length
                  ? {
                      alsoCountryCodes: splitTags(alsoCountries)
                        .map((n) => countryCodeByName[n] ?? n.toUpperCase())
                        .filter((c) => c !== countryCodeByName[country]),
                    }
                  : {}),
                sourceItemIds: items.map((i) => i.id),
              });
            }}
          >
            <div className="mb-4 flex items-center gap-2 rounded-sm border border-border bg-surface px-3 py-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
              <span className="text-xs text-muted-foreground">
                以下字段由 AI 依据所选条目预填，分析师可逐项修改
              </span>
              <PendingTag>AI 待接入</PendingTag>
            </div>

            <Field label="事件标题">
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field>
            <Field label="事件概况">
              <textarea
                rows={4}
                className={inputCls}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="发生时间">
                <input
                  className={inputCls}
                  value={occurredAt}
                  onChange={(e) => setOccurredAt(e.target.value)}
                  placeholder="08-17 04:20"
                />
              </Field>
              <Field label="结束时间（可空）">
                <input
                  className={inputCls}
                  value={occurredEnd}
                  onChange={(e) => setOccurredEnd(e.target.value)}
                />
              </Field>
              <Field label="国家">
                <input className={inputCls} value={country} onChange={(e) => setCountry(e.target.value)} />
              </Field>
              <Field label="地区">
                <input className={inputCls} value={area} onChange={(e) => setArea(e.target.value)} />
              </Field>
              <Field label="城市">
                <input className={inputCls} value={city} onChange={(e) => setCity(e.target.value)} />
              </Field>
              <Field label="所属主题（可空）">
                <select className={inputCls} value={topic} onChange={(e) => setTopic(e.target.value)}>
                  <option value="">无</option>
                  {topics.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="同时从属的其他主题（可多选）">
              <div className="flex flex-wrap gap-3 rounded-sm border border-border p-2.5">
                {topics
                  .filter((t) => t !== topic)
                  .map((t) => (
                    <label key={t} className="flex items-center gap-1.5 text-sm">
                      <input
                        type="checkbox"
                        checked={alsoTopics.includes(t)}
                        onChange={(e) =>
                          setAlsoTopics((prev) =>
                            e.target.checked ? [...prev, t] : prev.filter((x) => x !== t),
                          )
                        }
                      />
                      {t}
                    </label>
                  ))}
              </div>
            </Field>
            <Field label="同时波及的其他国家（逗号分隔，可空）">
              <input
                className={inputCls}
                value={alsoCountries}
                onChange={(e) => setAlsoCountries(e.target.value)}
                placeholder="以色列, 布基纳法索"
              />
            </Field>

            <Field label="国家行为体（逗号分隔）">
              <input className={inputCls} value={stateActors} onChange={(e) => setStateActors(e.target.value)} />
            </Field>
            <Field label="组织机构（逗号分隔）">
              <input
                className={inputCls}
                value={organizations}
                onChange={(e) => setOrganizations(e.target.value)}
              />
            </Field>
            <Field label="当事个人（逗号分隔）">
              <input className={inputCls} value={people} onChange={(e) => setPeople(e.target.value)} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="风险类型">
                <select
                  className={inputCls}
                  value={riskType}
                  onChange={(e) => setRiskType(e.target.value as RiskTypeId)}
                >
                  {riskTypes.map((t) => (
                    <option key={t} value={t}>
                      {riskTypeLabel[t]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="风险等级">
                <select
                  className={inputCls}
                  value={level}
                  onChange={(e) => setLevel(e.target.value as RiskLevel)}
                >
                  <option value="high">高</option>
                  <option value="medium">中</option>
                  <option value="low">低</option>
                </select>
              </Field>
              <Field label="可信度">
                <select
                  className={inputCls}
                  value={confidence}
                  onChange={(e) => setConfidence(e.target.value as "A" | "B" | "C")}
                >
                  <option value="A">A 高</option>
                  <option value="B">B 中</option>
                  <option value="C">C 待核验</option>
                </select>
              </Field>
            </div>

            <div className="mt-6 flex items-center gap-2 border-t border-border pt-4">
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                提交到风险信息流
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center rounded-sm border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary"
              >
                取消
              </button>
              <span className="ml-auto text-xs text-muted-foreground">
                将溯源 {items.length} 条原始条目
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-sm border border-border bg-background px-2.5 py-1.5 text-sm transition-colors focus-visible:border-primary focus-visible:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1 block text-xs tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}
