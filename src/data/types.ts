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

export type SourceStatus = "connected" | "pending" | "degraded";

export interface SourceClass {
  id: SourceClassId;
  name: string;
  code: string;
  description: string;
  feedCount: number;
  status: SourceStatus;
  latency: string;
  todayCount: number;
}

export type EntryStatus = "pending" | "reviewed" | "escalated" | "dismissed";

export interface FeedEntry {
  id: string;
  title: string;
  summary: string;
  sourceClass: SourceClassId;
  sourceName: string;
  url: string;
  publishedAt: string;
  region: string;
  riskType: RiskTypeId;
  level: RiskLevel;
  /** 信息可信度：A 高 / B 中 / C 待核验 */
  confidence: "A" | "B" | "C";
  status: EntryStatus;
  topicSlug?: string;
  aiSummary: string;
  aiEntities: string[];
  analystNote?: string;
}

export interface Channel {
  id: RiskTypeId;
  name: string;
  code: string;
  summary: string;
  level: RiskLevel;
  activeAlerts: number;
  entries24h: number;
  boundSources: SourceClassId[];
  regions: { region: string; level: RiskLevel; note: string; updated: string }[];
  timeline: { date: string; text: string }[];
}

export interface Topic {
  slug: string;
  name: string;
  code: string;
  riskType: RiskTypeId;
  level: RiskLevel;
  owner: string;
  updated: string;
  overview: string;
  judgements: string[];
  actors: { name: string; role: string; posture: string }[];
  scenarios: { name: string; probability: string; note: string }[];
  timeline: { date: string; text: string }[];
}

export type DispatchChannelId = "email" | "wecom" | "dingtalk" | "webhook" | "sms";

export interface DispatchChannel {
  id: DispatchChannelId;
  name: string;
  target: string;
  /** pending = 渠道待接入 */
  status: "pending" | "connected";
}

export interface DispatchRecord {
  channel: DispatchChannelId;
  at: string;
  state: "simulated" | "queued" | "sent" | "failed";
  note?: string;
}

export type AlertState = "draft" | "active" | "closed";

export interface RiskAlert {
  id: string;
  code: string;
  title: string;
  level: RiskLevel;
  region: string;
  riskType: RiskTypeId;
  state: AlertState;
  publishedAt: string;
  publisher: string;
  body: string;
  impact: string[];
  advice: string[];
  sourceEntryIds: string[];
  dispatches: DispatchRecord[];
}