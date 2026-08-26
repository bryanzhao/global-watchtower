import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";
import { countryNameByCode, countryRegionByCode } from "@/data/hexmap";
import { gridHexes } from "@/data/hexgrid";
import { riskTypeLabel } from "@/data/platform";
import type { CountryAggregate } from "@/data/analytics";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/data/types";

const HEX_R = 5; // 六边形像素外接圆半径
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

function hexPath(cx: number, cy: number, r: number) {
  let d = "";
  for (let i = 0; i < 6; i += 1) {
    const a = (Math.PI / 180) * (60 * i - 90);
    const x = (cx + r * Math.cos(a)).toFixed(2);
    const y = (cy + r * Math.sin(a)).toFixed(2);
    d += `${i === 0 ? "M" : "L"}${x} ${y}`;
  }
  return `${d}Z`;
}

const levelFill: Record<RiskLevel, string> = {
  high: "fill-destructive/85",
  medium: "fill-warning/80",
  low: "fill-success/70",
};

interface CountryShape {
  code: string;
  d: string;
  cx: number;
  cy: number;
}

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

  const { shapes, viewBox } = useMemo(() => {
    const byCode = new Map<string, { d: string; sx: number; sy: number; n: number }>();
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const h of gridHexes) {
      const { x, y } = tileCenter(h.col, h.row);
      const entry = byCode.get(h.code) ?? { d: "", sx: 0, sy: 0, n: 0 };
      entry.d += hexPath(x, y, HEX_R - 0.45);
      entry.sx += x;
      entry.sy += y;
      entry.n += 1;
      byCode.set(h.code, entry);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    const shapes: CountryShape[] = [...byCode.entries()].map(([code, e]) => ({
      code,
      d: e.d,
      cx: e.sx / e.n,
      cy: e.sy / e.n,
    }));
    const pad = HEX_R * 2;
    return {
      shapes,
      viewBox: `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`,
    };
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

  const onClickContainer = (e: React.MouseEvent) => {
    // Ignore clicks that were part of a pan drag.
    if (drag.current?.moved) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const path = el?.closest("svg path") as SVGPathElement | null;
    const code = path?.getAttribute("data-code");
    if (code) onSelect(code);
  };

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
  const hoveredName = hover ? (countryNameByCode[hover] ?? hover) : null;
  const hoveredRegion = hover ? (countryRegionByCode[hover] ?? "") : "";

  return (
    <div className="relative">
      <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="tracking-wider uppercase">{windowLabel}风险事件分布</span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-destructive/85" aria-hidden />高
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-warning/80" aria-hidden />中
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-success/70" aria-hidden />低
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-muted-foreground/25" aria-hidden />无事件
        </span>
        <span className="ml-auto">滚轮缩放 · 拖拽平移 · 点击进入国别页</span>
      </div>

      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onClickContainer}
        className="relative h-[460px] cursor-grab touch-none overflow-hidden rounded-md border border-border bg-surface active:cursor-grabbing"
      >
        <div
          className="h-full w-full origin-top-left"
          style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
        >
          <svg viewBox={viewBox} className="h-full w-full" role="img" aria-label="全球风险事件蜂窝地图">
            {shapes.map((p) => {
              const agg = aggregates.get(p.code);
              return (
                <path
                  key={p.code}
                  data-code={p.code}
                  d={p.d}
                  onMouseEnter={() => setHover(p.code)}
                  onMouseLeave={() => setHover((h) => (h === p.code ? null : h))}
                  className={cn(
                    "cursor-pointer transition-opacity",
                    agg ? levelFill[agg.level] : "fill-muted-foreground/25",
                    hover === p.code && "opacity-70",
                  )}
                />
              );
            })}
            {shapes.map((p) => {
              const agg = aggregates.get(p.code);
              if (!agg) return null;
              return (
                <g key={`n-${p.code}`} className="pointer-events-none">
                  <circle cx={p.cx} cy={p.cy} r={6.5} className="fill-background/85 stroke-border stroke-[0.5]" />
                  <text
                    x={p.cx}
                    y={p.cy + 2.6}
                    textAnchor="middle"
                    className="fill-foreground text-[7px] font-semibold tabular-nums"
                  >
                    {agg.count}
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

        {hoveredName ? (
          <div className="pointer-events-none absolute top-3 left-3 max-w-[240px] rounded-md border border-border bg-background/95 p-3 text-xs">
            <p className="text-sm font-semibold">{hoveredName}</p>
            {hoveredRegion ? <p className="mt-0.5 text-muted-foreground">{hoveredRegion}</p> : null}
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
