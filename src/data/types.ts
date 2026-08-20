export type RiskLevel = "low" | "medium" | "high";

export type SourceClassId = "social" | "media" | "expert" | "osint";

export type RiskTypeId =
  | "war"
  | "terror"
  | "political"
  | "unrest"
  | "crime"
  | "disaster"
  | "epidemic";

export type RawStatus = "new" | "extracted" | "ignored";

/** AI 自动处理状态，与人工状态相互独立 */
export type AiStatus = "new" | "extracted" | "ignored";

export interface SourceClass {
  id: SourceClassId;
  name: string;
  code: string;
  description: string;
}

export interface RawItem {
  id: string;
  sourceClass: SourceClassId;
  /** 账号 / 媒体 / 机构名 */
  author: string;
  handle: string;
  text: string;
  publishedAt: string;
  lang: string;
  url: string;
  riskType?: RiskTypeId;
  topic?: string;
  region?: string;
  status: RawStatus;
  aiStatus?: AiStatus;
  eventId?: string;
}

export interface RiskEvent {
  id: string;
  title: string;
  summary: string;
  occurredAt: string;
  occurredEnd?: string;
  country: string;
  /** ISO3 国家码，用于地图与国别页聚合 */
  countryCode?: string;
  /** 同时受影响的其他国家码（不含主国家） */
  alsoCountryCodes?: string[];
  area?: string;
  city?: string;
  /** 国家行为体 */
  stateActors: string[];
  /** 组织机构 */
  organizations: string[];
  /** 当事个人 / 主体 */
  people: string[];
  riskType: RiskTypeId;
  level: RiskLevel;
  confidence: "A" | "B" | "C";
  topic?: string;
  /** 同时从属的其他主题（不含主主题） */
  alsoTopics?: string[];
  sourceItemIds: string[];
  createdAt: string;
  createdBy: string;
}
