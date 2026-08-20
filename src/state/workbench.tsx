import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { incomingItems, rawItems, riskEvents } from "@/data/platform";
import type { AiStatus, RawItem, RiskEvent } from "@/data/types";

export type NewEventDraft = Omit<RiskEvent, "id" | "createdAt" | "createdBy">;

interface WorkbenchValue {
  items: RawItem[];
  events: RiskEvent[];
  lastRefresh: string;
  pendingIncoming: number;
  refresh: () => number;
  ignoreItems: (ids: string[]) => void;
  restoreItems: (ids: string[]) => void;
  createEvent: (draft: NewEventDraft) => RiskEvent;
  attachItems: (eventId: string, ids: string[]) => void;
}

const WorkbenchContext = createContext<WorkbenchValue | null>(null);

/** 模拟 AI 处理结果：按条目 ID 稳定派生，接入真实 AI 后由后端返回 */
function deriveAiStatus(item: RawItem): AiStatus {
  if (item.aiStatus) return item.aiStatus;
  let h = 0;
  for (const ch of item.id) h = (h * 31 + ch.charCodeAt(0)) % 997;
  const bucket = h % 3;
  return bucket === 0 ? "extracted" : bucket === 1 ? "ignored" : "new";
}

function withAi(list: RawItem[]): RawItem[] {
  return list.map((i) => ({ ...i, aiStatus: deriveAiStatus(i) }));
}

function stamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function WorkbenchProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<RawItem[]>(() => withAi(rawItems));
  const [events, setEvents] = useState<RiskEvent[]>(riskEvents);
  const [queue, setQueue] = useState<RawItem[]>(() => withAi(incomingItems));
  const [lastRefresh, setLastRefresh] = useState("08-17 07:00");
  const [seq, setSeq] = useState(32);

  const refresh = useCallback(() => {
    let added = 0;
    setQueue((q) => {
      const batch = q.slice(0, 2);
      added = batch.length;
      if (batch.length) setItems((prev) => [...batch, ...prev]);
      return q.slice(batch.length);
    });
    setLastRefresh(stamp());
    return added;
  }, []);

  const ignoreItems = useCallback((ids: string[]) => {
    setItems((prev) =>
      prev.map((i) => (ids.includes(i.id) ? { ...i, status: "ignored" as const } : i)),
    );
  }, []);

  const restoreItems = useCallback((ids: string[]) => {
    setItems((prev) =>
      prev.map((i) =>
        ids.includes(i.id) && i.status === "ignored" ? { ...i, status: "new" as const } : i,
      ),
    );
  }, []);

  const createEvent = useCallback(
    (draft: NewEventDraft) => {
      const id = `EVT-${String(seq).padStart(4, "0")}`;
      setSeq((n) => n + 1);
      const event: RiskEvent = {
        ...draft,
        id,
        createdAt: stamp(),
        createdBy: "分析师 · 当前用户",
      };
      setEvents((prev) => [event, ...prev]);
      setItems((prev) =>
        prev.map((i) =>
          draft.sourceItemIds.includes(i.id)
            ? { ...i, status: "extracted" as const, eventId: id }
            : i,
        ),
      );
      return event;
    },
    [seq],
  );

  const attachItems = useCallback((eventId: string, ids: string[]) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, sourceItemIds: Array.from(new Set([...e.sourceItemIds, ...ids])) }
          : e,
      ),
    );
    setItems((prev) =>
      prev.map((i) =>
        ids.includes(i.id) ? { ...i, status: "extracted" as const, eventId } : i,
      ),
    );
  }, []);

  const value = useMemo<WorkbenchValue>(
    () => ({
      items,
      events,
      lastRefresh,
      pendingIncoming: queue.length,
      refresh,
      ignoreItems,
      restoreItems,
      createEvent,
      attachItems,
    }),
    [items, events, lastRefresh, queue.length, refresh, ignoreItems, restoreItems, createEvent, attachItems],
  );

  return <WorkbenchContext.Provider value={value}>{children}</WorkbenchContext.Provider>;
}

export function useWorkbench() {
  const ctx = useContext(WorkbenchContext);
  if (!ctx) throw new Error("useWorkbench 必须在 WorkbenchProvider 内使用");
  return ctx;
}
