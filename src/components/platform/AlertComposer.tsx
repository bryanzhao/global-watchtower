import { useState } from "react";
import { X } from "lucide-react";
import { dispatchChannels, riskLevelLabel, riskTypeLabel } from "@/data/platform";
import type { DispatchChannelId, FeedEntry, RiskLevel } from "@/data/types";
import { cn } from "@/lib/utils";
import { PendingTag } from "./Primitives";

const levels: RiskLevel[] = ["low", "medium", "high"];

export function AlertComposer({ entry, onClose }: { entry: FeedEntry; onClose: () => void }) {
  const [level, setLevel] = useState<RiskLevel>(entry.level);
  const [title, setTitle] = useState(entry.title);
  const [body, setBody] = useState(entry.summary);
  const [selectedChannels, setSelectedChannels] = useState<DispatchChannelId[]>(["email"]);
  const [submitted, setSubmitted] = useState(false);

  const toggleChannel = (id: DispatchChannelId) =>
    setSelectedChannels((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-foreground/20">
      <div className="h-full w-full max-w-xl overflow-y-auto border-l border-border bg-card">
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-primary uppercase">
              Alert Composer
            </p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight">起草正式风险预警</h2>
            <p className="mt-1 font-mono text-xs text-muted-foreground">来源条目 {entry.id}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="rounded-sm border border-border p-1.5 transition-colors hover:bg-secondary"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <Field label="预警等级">
            <div className="flex gap-2">
              {levels.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={cn(
                    "rounded-sm border px-3 py-1.5 text-sm transition-colors",
                    l === level
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-secondary",
                  )}
                >
                  {riskLevelLabel[l]}风险
                </button>
              ))}
            </div>
          </Field>

          <Field label="预警标题">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            />
          </Field>

          <Field label="预警正文">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className="w-full rounded-sm border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            />
          </Field>

          <Field label="关联频道 / 地区">
            <p className="text-sm text-muted-foreground">
              {riskTypeLabel[entry.riskType]} · {entry.region}
              {entry.topicSlug ? ` · 专题 ${entry.topicSlug}` : ""}
            </p>
          </Field>

          <Field label="来源引用">
            <p className="text-sm text-muted-foreground">
              {entry.sourceName}（{entry.publishedAt}）
            </p>
          </Field>

          <Field label="推送渠道">
            <div className="space-y-2">
              {dispatchChannels.map((channel) => (
                <label
                  key={channel.id}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-sm border border-border px-3 py-2 transition-colors hover:bg-secondary"
                >
                  <span className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes(channel.id)}
                      onChange={() => toggleChannel(channel.id)}
                      className="h-3.5 w-3.5 accent-[var(--primary)]"
                    />
                    <span className="text-sm">{channel.name}</span>
                    <span className="text-xs text-muted-foreground">{channel.target}</span>
                  </span>
                  <PendingTag />
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              渠道外发接口尚未接入，本次发布只会写入预警记录与模拟推送流水。
            </p>
          </Field>

          {submitted ? (
            <div className="rounded-md border border-success/30 bg-success/15 px-4 py-3 text-sm text-success">
              预警已生成（演示）：{title} · {riskLevelLabel[level]}风险 · 模拟推送{" "}
              {selectedChannels.length} 个渠道。
            </div>
          ) : null}

          <div className="flex gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              className="inline-flex items-center rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              发布到风险提醒频道
            </button>
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              className="inline-flex items-center rounded-sm border border-border px-4 py-2 text-sm transition-colors hover:bg-secondary"
            >
              仅保存草稿
            </button>
            <button
              type="button"
              onClick={onClose}
              className="ml-auto inline-flex items-center rounded-sm border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs tracking-wider text-muted-foreground uppercase">{label}</p>
      {children}
    </div>
  );
}