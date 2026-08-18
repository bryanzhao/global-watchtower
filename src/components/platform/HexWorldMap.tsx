import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { hexTiles } from "@/data/hexmap";
import { riskTypeLabel } from "@/data/platform";
import type { CountryAggregate } from "@/data/analytics";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/data/types";

const HEX_R = 10; // 六边形外接圆半径
const SQRT3 = Math.sqrt(3);
const MIN_ZOOM = 0.6;
const MAX_ZOOM = 4;

function tileCenter(col: number, row: number) {
  const odd = ((row % 2) + 2) % 2;
  return {
    x: SQRT3 * HEX_R * (col + 0.5 * odd),
    y: 1.5 * HEX_R * row,
  };
}

function hexPoints(cx: number, cy: number, r: number) {
  const pts: string[] = [];
  for (let i = 0; i < 6; i += 1) {
    const a = (Math.PI / 180) * (60 * i - 90);
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

const levelFill: Record<RiskLevel, string> = {
  high: "fill-destructive/80 stroke-destructive",
  medium: "fill-warning/70 stroke-warning",
  low: "fill-success/50 stroke-success",
};

export function HexWorldMap({
  aggregates,
  onSelect,
  windowLabel,
}: {
  aggregates: Map<string, CountryAggregate>;
  onSelect: (code: string) => void;
  windowLabel: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState<string | null>(null);
  const stateRef = useRef({ zoom, offset });
  stateRef.current = { zoom, offset };

  const { positions, viewBox } = useMemo(() => {
    const positions = hexTiles.map((t) => ({ ...t, ...tileCenter(t.col, t.row) }));
    const xs = positions.map((p) => p.x);
    const ys = positions.map((p) => p.y);
    const pad = HEX_R * 2;
    const minX = Math.min(...xs) - pad;
    const minY = Math.min(...ys) - pad;
    const w = Math.max(...xs) - minX + pad;
    const h = Math.max(...ys) - minY + pad;
    return { positions, viewBox: `${minX} ${minY} ${w} ${h}` };
  }, []);

  const applyZoom = useCallback((next: number, px: number, py: number) => {
    const { zoom: z, offset: o } = stateRef.current;
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
    const k = clamped / z;
    setZoom(clamped);
    setOffset({ x: px - (px - o.x) * k, y: py - (py - o.y) * k });
  }, []);

  const wheelRef = useRef<(e: WheelEvent) => void>(() => {});
  wheelRef.current = (e: WheelEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    applyZoom(
      stateRef.current.zoom * Math.exp(-dy * 0.0015),
      e.clientX - rect.left,
      e.clientY - rect.top,
    );
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      wheelRef.current(e);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
    d.x = e.clientX;
    d.y = e.clientY;
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (drag.current?.id === e.pointerId) drag.current = null;
  };

  const reset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  const zoomAtCenter = (factor: number) => {
    const el = containerRef.current;
    const rect = el?.getBoundingClientRect();
    applyZoom(stateRef.current.zoom * factor, (rect?.width ?? 0) / 2, (rect?.height ?? 0) / 2);
  };

  const hovered = hover ? aggregates.get(hover) : null;
  const hoveredTile = hover ? hexTiles.find((t) => t.code === hover) : null;

  return (
    <div className="relative">
      <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="tracking-wider uppercase">{windowLabel}风险事件分布</span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-destructive/80" aria-hidden />高
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-warning/70" aria-hidden />中
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-success/50" aria-hidden />低
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-muted" aria-hidden />无事件
        </span>
        <span className="ml-auto">滚轮缩放 · 拖拽平移 · 点击进入国别页</span>
      </div>

      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative h-[420px] cursor-grab touch-none overflow-hidden rounded-md border border-border bg-surface active:cursor-grabbing"
      >
        <div
          className="h-full w-full origin-top-left"
          style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
        >
          <svg viewBox={viewBox} className="h-full w-full" role="img" aria-label="全球风险事件蜂窝地图">
            {positions.map((p) => {
              const agg = aggregates.get(p.code);
              return (
                <g
                  key={p.code}
                  onMouseEnter={() => setHover(p.code)}
                  onMouseLeave={() => setHover((h) => (h === p.code ? null : h))}
                  onClick={() => {
                    if (!drag.current?.moved) onSelect(p.code);
                  }}
                  className="cursor-pointer"
                >
                  <polygon
                    points={hexPoints(p.x, p.y, HEX_R - 0.8)}
                    className={cn(
                      "stroke-[0.6] transition-opacity",
                      agg ? levelFill[agg.level] : "fill-muted stroke-border",
                      hover === p.code && "opacity-80",
                    )}
                  />
                  {agg ? (
                    <text
                      x={p.x}
                      y={p.y + 3.4}
                      textAnchor="middle"
                      className="pointer-events-none fill-foreground text-[8px] font-semibold"
                    >
                      {agg.count}
                    </text>
                  ) : null}
                  <text
                    x={p.x}
                    y={p.y + HEX_R + 4}
                    textAnchor="middle"
                    className="pointer-events-none fill-muted-foreground text-[3.6px]"
                  >
                    {p.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="absolute right-3 bottom-3 flex flex-col gap-1">
          <MapBtn label="放大" onClick={() => zoomAtCenter(1.3)}>
            <Plus className="h-3.5 w-3.5" aria-hidden />
          </MapBtn>
          <MapBtn label="缩小" onClick={() => zoomAtCenter(1 / 1.3)}>
            <Minus className="h-3.5 w-3.5" aria-hidden />
          </MapBtn>
          <MapBtn label="复位" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          </MapBtn>
        </div>

        {hoveredTile ? (
          <div className="pointer-events-none absolute top-3 left-3 max-w-[240px] rounded-md border border-border bg-background/95 p-3 text-xs">
            <p className="text-sm font-semibold">{hoveredTile.name}</p>
            <p className="mt-0.5 text-muted-foreground">{hoveredTile.region}</p>
            {hovered ? (
              <>
                <p className="mt-1.5 tabular-nums">
                  {windowLabel}事件 <span className="font-semibold">{hovered.count}</span> 起
                </p>
                <ul className="mt-1 space-y-0.5 text-muted-foreground">
                  {Object.entries(hovered.byType).map(([type, n]) => (
                    <li key={type}>
                      {riskTypeLabel[type as keyof typeof riskTypeLabel]} · {n}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-1.5 text-muted-foreground">{windowLabel}无已确认风险事件</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MapBtn({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="rounded-sm border border-border bg-background p-1.5 transition-colors hover:bg-secondary"
    >
      {children}
    </button>
  );
}
