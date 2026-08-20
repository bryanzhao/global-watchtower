import type { RiskEvent, RiskLevel, RiskTypeId } from "./types";
import { countryCodeByName, countryNameByCode, countryRegionByCode } from "./hexmap";

/** 模拟数据的“当前时刻”，用于计算 24 小时 / 7 天窗口。 */
export const DATA_NOW = new Date(2026, 7, 17, 8, 0);

/** 解析 "MM-DD HH:mm" 形式的时间戳。 */
export function parseStamp(stamp: string): Date {
  const m = /^(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/.exec(stamp.trim());
  if (!m) return DATA_NOW;
  return new Date(2026, Number(m[1]) - 1, Number(m[2]), Number(m[3]), Number(m[4]));
}

export type TimeWindow = 24 | 168;

export const timeWindowLabel: Record<TimeWindow, string> = {
  24: "过去 24 小时",
  168: "过去 7 天",
};

export function withinWindow(event: RiskEvent, hours: TimeWindow): boolean {
  const t = parseStamp(event.occurredAt).getTime();
  return t >= DATA_NOW.getTime() - hours * 3600_000 && t <= DATA_NOW.getTime() + 3600_000;
}

export function eventCountryCode(event: RiskEvent): string | undefined {
  return event.countryCode ?? countryCodeByName[event.country];
}

export function eventCountryName(event: RiskEvent): string {
  const code = eventCountryCode(event);
  return code ? (countryNameByCode[code] ?? event.country) : event.country;
}

/** 一条风险信息可同时从属多个主题（主主题在前）。 */
export function eventTopics(event: RiskEvent): string[] {
  return Array.from(new Set([event.topic, ...(event.alsoTopics ?? [])].filter(Boolean) as string[]));
}

/** 一条风险信息可同时影响多个国家（主国家在前）。 */
export function eventCountryCodes(event: RiskEvent): string[] {
  return Array.from(
    new Set([eventCountryCode(event), ...(event.alsoCountryCodes ?? [])].filter(Boolean) as string[]),
  );
}

const levelRank: Record<RiskLevel, number> = { low: 1, medium: 2, high: 3 };

export interface CountryAggregate {
  code: string;
  name: string;
  region: string;
  count: number;
  level: RiskLevel;
  byType: Partial<Record<RiskTypeId, number>>;
}

export function aggregateByCountry(events: RiskEvent[], hours: TimeWindow): Map<string, CountryAggregate> {
  const map = new Map<string, CountryAggregate>();
  for (const event of events) {
    if (!withinWindow(event, hours)) continue;
    for (const code of eventCountryCodes(event)) {
      const existing =
      map.get(code) ??
      {
        code,
        name: countryNameByCode[code] ?? event.country,
        region: countryRegionByCode[code] ?? "其他",
        count: 0,
        level: "low" as RiskLevel,
        byType: {},
      };
      existing.count += 1;
      if (levelRank[event.level] > levelRank[existing.level]) existing.level = event.level;
      existing.byType[event.riskType] = (existing.byType[event.riskType] ?? 0) + 1;
      map.set(code, existing);
    }
  }
  return map;
}

export function countByType(events: RiskEvent[]): Partial<Record<RiskTypeId, number>> {
  const out: Partial<Record<RiskTypeId, number>> = {};
  for (const e of events) out[e.riskType] = (out[e.riskType] ?? 0) + 1;
  return out;
}

export function sortByTimeDesc<T extends { occurredAt: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => parseStamp(b.occurredAt).getTime() - parseStamp(a.occurredAt).getTime(),
  );
}
