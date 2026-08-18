import type { RiskLevel, RiskTypeId } from "./types";
import { countryNameByCode, countryRegionByCode, hexCountries } from "./hexmap";
import { riskTypes } from "./platform";

export interface RiskScore {
  score: number; // 1–5
  note: string;
}

export interface CountryProfile {
  code: string;
  name: string;
  region: string;
  level: RiskLevel;
  /** 慢变：国别风险总览 */
  overview: string;
  revisedAt: string;
  scores: Record<RiskTypeId, RiskScore>;
  entities: { label: string; items: string[] }[];
  fundamentals: { title: string; body: string }[];
}

export function scoreLevel(score: number): RiskLevel {
  return score >= 4 ? "high" : score >= 3 ? "medium" : "low";
}

function scores(input: Partial<Record<RiskTypeId, [number, string]>>): Record<RiskTypeId, RiskScore> {
  const out = {} as Record<RiskTypeId, RiskScore>;
  for (const type of riskTypes) {
    const v = input[type];
    out[type] = v ? { score: v[0], note: v[1] } : { score: 1, note: "无显著信号" };
  }
  return out;
}

const profiles: CountryProfile[] = [
  {
    code: "UKR",
    name: "乌克兰",
    region: "中东欧",
    level: "high",
    overview:
      "全境处于战时状态，东部与南部为直接交战区，全国范围内存在远程打击与空袭警报风险。基础设施（电力、供水、铁路枢纽）为高价值目标，冬季承压更明显。西部相对安全，但仍需按空袭警报组织疏散。任何人员进入均需战地保险与撤离预案。",
    revisedAt: "2026-06",
    scores: scores({
      war: [5, "东部与南部持续交战，全境有远程打击风险"],
      terror: [2, "破坏活动零星，主要针对基础设施与铁路"],
      political: [3, "战时体制下政治博弈围绕动员与资源分配"],
      unrest: [2, "大规模抗议受战时法限制"],
      crime: [3, "武器扩散抬高暴力犯罪与诈骗风险"],
      disaster: [2, "洪涝与工业事故风险，含核设施安全关切"],
      epidemic: [2, "医疗体系承压，流离失所人群传染病风险上升"],
    }),
    entities: [
      { label: "政府与军方", items: ["总统办公室", "武装部队总参谋部", "国家紧急服务局"] },
      { label: "关键设施", items: ["扎波罗热核电站", "敖德萨港区", "西部铁路枢纽"] },
      { label: "外部力量", items: ["北约成员国军援机制", "欧盟资金与制裁体系"] },
    ],
    fundamentals: [
      {
        title: "政治体制与稳定性",
        body: "战时体制下行政权高度集中，选举暂停，政治竞争主要体现在动员政策与资源分配上。地方军政管理局在冲突区拥有较大权限。",
      },
      {
        title: "安全部门",
        body: "武装部队与国土防卫部队为主体，安全局（SBU）承担反渗透与破坏活动侦查。西部地区治安由警察系统维持。",
      },
      {
        title: "经济与社会",
        body: "财政高度依赖外部援助，出口以农产品与部分金属为主，黑海通道稳定性直接决定出口能力。人口流出与劳动力短缺是长期问题。",
      },
      {
        title: "外部关系",
        body: "与欧盟、北约国家关系为生存性支撑，援助节奏受外部政治周期影响；与俄罗斯无外交渠道。",
      },
    ],
  },
  {
    code: "IRN",
    name: "伊朗",
    region: "中东",
    level: "high",
    overview:
      "对外面临与美、以的高强度对抗，对内经济压力与社会不满并存。外国人员面临任意拘押与出入境风险，通信监控严格。核设施与军事目标周边存在被打击风险，商业活动受制裁合规约束极强。",
    revisedAt: "2026-05",
    scores: scores({
      war: [4, "与美以对抗，存在被打击与报复循环风险"],
      terror: [3, "边境省份存在分离主义与跨境武装袭击"],
      political: [4, "制裁压力下政策不确定性高"],
      unrest: [3, "民生议题触发的抗议周期性出现"],
      crime: [2, "街头犯罪风险中等，主要为盗窃与诈骗"],
      disaster: [3, "地震带国家，城市抗震能力不均"],
      epidemic: [2, "公共卫生体系相对完整"],
    }),
    entities: [
      { label: "权力核心", items: ["最高领袖办公室", "伊斯兰革命卫队", "最高国家安全委员会"] },
      { label: "关键设施", items: ["纳坦兹核设施", "阿萨鲁耶油气园区", "霍尔木兹沿岸海军基地"] },
      { label: "外部对手与伙伴", items: ["美国中央司令部", "以色列", "地区代理人网络"] },
    ],
    fundamentals: [
      { title: "政治体制与稳定性", body: "神权与共和双轨体制，最高领袖体系主导安全与外交决策，行政部门在经济议题上空间有限。" },
      { title: "安全部门", body: "革命卫队与其下属巴斯基民兵是内外安全的核心力量，情报机构对外国人员监控密集。" },
      { title: "经济与社会", body: "石油出口受制裁约束，通胀与货币贬值长期化，青年失业率高，形成周期性社会压力。" },
      { title: "外部关系", body: "与地区代理人网络绑定紧密；与俄、中保持能源与技术合作，与海湾国家关系间歇性缓和。" },
    ],
  },
  {
    code: "IRQ",
    name: "伊拉克",
    region: "中东",
    level: "high",
    overview:
      "安全形势区域差异显著：库尔德地区相对稳定，中部与西部存在武装组织袭击与火箭弹风险。亲伊民兵与驻伊美军的互动是主要升级源。石油设施与外资项目为重点保护对象。",
    revisedAt: "2026-04",
    scores: scores({
      war: [3, "外部冲突外溢导致的打击与报复风险"],
      terror: [4, "民兵与极端组织残余的袭击威胁"],
      political: [4, "政府组阁与派系分配长期不稳"],
      unrest: [3, "电力与就业议题引发南部抗议"],
      crime: [3, "绑架与武装抢劫风险，针对外籍人员"],
      disaster: [2, "沙尘暴与高温、水资源紧张"],
      epidemic: [2, "医疗资源分布不均"],
    }),
    entities: [
      { label: "政府与武装", items: ["联邦政府", "人民动员力量（PMF）", "库尔德自治政府"] },
      { label: "武装组织", items: ["伊拉克伊斯兰抵抗组织", "ISIS 残余单元"] },
      { label: "关键设施", items: ["巴士拉油田", "巴格达国际机场", "驻伊美军基地"] },
    ],
    fundamentals: [
      { title: "政治体制与稳定性", body: "议会制下族群教派配额政治，组阁周期长，地方与联邦在油气收益分配上长期博弈。" },
      { title: "安全部门", body: "正规军与人民动员力量并存，后者部分派系受外部影响，指挥链条不统一。" },
      { title: "经济与社会", body: "财政高度依赖石油，公共部门就业占比大，电力供应不足是社会不满的稳定来源。" },
      { title: "外部关系", body: "在美伊之间维持平衡，任何一方升级都会将伊拉克变为对抗场。" },
    ],
  },
  {
    code: "MLI",
    name: "马里",
    region: "萨赫勒",
    level: "high",
    overview:
      "中部与北部大片区域政府控制力弱，武装团体活动频繁，绑架外籍人员风险高。陆路出行需武装护卫，非必要不前往首都以外地区。政治过渡进程反复。",
    revisedAt: "2026-03",
    scores: scores({
      war: [3, "政府军与武装团体的持续武装冲突"],
      terror: [5, "JNIM 等组织袭击密集，绑架风险高"],
      political: [4, "军政府过渡进程不确定"],
      unrest: [3, "首都周期性抗议"],
      crime: [4, "武装抢劫与公路劫持"],
      disaster: [3, "干旱与洪涝交替，粮食不安全"],
      epidemic: [3, "霍乱与麻疹等疫情周期性暴发"],
    }),
    entities: [
      { label: "执政与安全", items: ["过渡军政府", "马里武装部队", "外部安全承包力量"] },
      { label: "武装组织", items: ["JNIM", "ISGS", "北部地方武装"] },
      { label: "人道机构", items: ["联合国人道协调办公室", "国际红十字会"] },
    ],
    fundamentals: [
      { title: "政治体制与稳定性", body: "军政府主导过渡，选举日程多次推迟，与区域组织关系紧张。" },
      { title: "安全部门", body: "正规军能力有限，依赖外部安全合作，情报与空中支援是短板。" },
      { title: "经济与社会", body: "黄金与棉花为主要出口，财政脆弱，北部与中部社会服务基本缺位。" },
      { title: "外部关系", body: "与传统西方伙伴疏远，安全合作转向新的外部力量，区域一体化机制弱化。" },
    ],
  },
  {
    code: "CUB",
    name: "古巴",
    region: "加勒比",
    level: "medium",
    overview:
      "外部军事风险总体可控，主要压力来自经济困境导致的能源短缺与社会不满。对外通信与金融渠道受限，外籍人员日常安全风险较低但医疗与补给条件有限。",
    revisedAt: "2026-06",
    scores: scores({
      war: [2, "外部军事行动概率低，侦察活动上升"],
      terror: [1, "无显著恐袭威胁"],
      political: [3, "外部施压与内部经济压力叠加"],
      unrest: [3, "停电与物资短缺可触发街头抗议"],
      crime: [2, "以侵财类犯罪为主"],
      disaster: [4, "飓风季风险高，电网抗灾能力弱"],
      epidemic: [2, "公共卫生体系较完整但药品短缺"],
    }),
    entities: [
      { label: "政府与军方", items: ["古巴共产党中央", "革命武装力量部"] },
      { label: "关键设施", items: ["全国电网主力电厂", "哈瓦那港"] },
      { label: "外部相关方", items: ["美国南方司令部", "侨汇与能源供应伙伴"] },
    ],
    fundamentals: [
      { title: "政治体制与稳定性", body: "一党体制，决策集中，社会控制能力强，抗议多为局部与短时。" },
      { title: "安全部门", body: "军队参与经济管理，内务部负责社会治安与国内安全。" },
      { title: "经济与社会", body: "外汇短缺、燃料进口受限导致周期性停电；侨汇与旅游为主要外汇来源。" },
      { title: "外部关系", body: "与美国关系是首要外部变量；与部分拉美与欧亚国家保持能源与贸易合作。" },
    ],
  },
  {
    code: "COD",
    name: "刚果（金）",
    region: "中非",
    level: "high",
    overview:
      "东部省份存在武装团体冲突与人道危机，疫病暴发风险高。矿业作业区安全依赖私人安保，跨境流动与治理薄弱是风险放大因素。",
    revisedAt: "2026-02",
    scores: scores({
      war: [4, "东部武装冲突持续"],
      terror: [3, "ADF 等组织针对平民袭击"],
      political: [3, "中央治理能力有限，地方权力碎片化"],
      unrest: [3, "城市抗议与选举争议"],
      crime: [4, "武装抢劫与绑架"],
      disaster: [3, "洪涝与火山活动"],
      epidemic: [4, "埃博拉、麻疹与霍乱反复暴发"],
    }),
    entities: [
      { label: "政府与安全", items: ["刚果武装部队", "联合国维和特派团"] },
      { label: "武装组织", items: ["M23", "ADF", "地方民兵"] },
      { label: "卫生机构", items: ["世界卫生组织", "无国界医生", "非洲疾控中心"] },
    ],
    fundamentals: [
      { title: "政治体制与稳定性", body: "总统制下中央对东部治理能力有限，地方武装与矿业利益交织。" },
      { title: "安全部门", body: "军队装备与后勤薄弱，维和力量与区域部队在东部承担部分安全职能。" },
      { title: "经济与社会", body: "铜钴等矿产为经济核心，非正规经济占比高，基础设施与医疗覆盖不足。" },
      { title: "外部关系", body: "与东部邻国关系紧张，跨境武装与矿产走私是长期摩擦点。" },
    ],
  },
  {
    code: "YEM",
    name: "也门",
    region: "中东",
    level: "high",
    overview:
      "国家分裂治理，武装冲突与人道危机并存，红海—亚丁湾航运受直接影响。除特定人道任务外不建议任何人员进入。",
    revisedAt: "2026-05",
    scores: scores({
      war: [5, "多方武装冲突与对外袭击"],
      terror: [4, "极端组织在南部与东部活动"],
      political: [4, "治理分裂，谈判进程反复"],
      unrest: [3, "物价与工资引发抗议"],
      crime: [4, "绑架与武装抢劫风险高"],
      disaster: [3, "洪涝与干旱交替"],
      epidemic: [4, "霍乱等疫情持续"],
    }),
    entities: [
      { label: "冲突方", items: ["胡塞武装", "也门政府军", "南方过渡委员会"] },
      { label: "关键通道", items: ["曼德海峡", "荷台达港", "亚丁港"] },
      { label: "外部相关方", items: ["沙特主导联军", "美英海上力量", "国际海运保险协会"] },
    ],
    fundamentals: [
      { title: "政治体制与稳定性", body: "事实上的分区治理，中央权威缺失，谈判以外部斡旋为主。" },
      { title: "安全部门", body: "各方武装并立，无统一指挥，海上力量以非对称手段为主。" },
      { title: "经济与社会", body: "依赖进口粮食与燃料，货币分裂，人道援助覆盖大量人口。" },
      { title: "外部关系", body: "与地区冲突高度联动，海上袭击是对外投射的主要手段。" },
    ],
  },
  {
    code: "PER",
    name: "秘鲁",
    region: "南美",
    level: "medium",
    overview:
      "政治不稳定与周期性抗议是主要风险，矿业走廊道路封锁频发。首都利马治安风险以侵财与暴力犯罪为主，自然灾害以地震与厄尔尼诺相关洪涝为主。",
    revisedAt: "2026-01",
    scores: scores({
      war: [1, "无对外武装冲突风险"],
      terror: [2, "残余武装与非法经济交织"],
      political: [4, "政府更替频繁，制度信任度低"],
      unrest: [4, "抗议与道路封锁常态化"],
      crime: [3, "利马与北部城市暴力犯罪上升"],
      disaster: [4, "地震带与厄尔尼诺洪涝"],
      epidemic: [2, "登革热周期性暴发"],
    }),
    entities: [
      { label: "政府与安全", items: ["总统府", "国家警察", "武装部队联合指挥部"] },
      { label: "社会力量", items: ["主要工会", "矿区社区组织"] },
      { label: "关键设施", items: ["南部矿业走廊", "利马国际机场", "卡亚俄港"] },
    ],
    fundamentals: [
      { title: "政治体制与稳定性", body: "总统与国会长期对抗，弹劾与更替频繁，政策连续性差。" },
      { title: "安全部门", body: "警察资源集中于城市，矿区冲突多以紧急状态与军警联合处置。" },
      { title: "经济与社会", body: "矿业出口为支柱，非正规就业比例高，社会冲突常围绕矿业与土地权。" },
      { title: "外部关系", body: "与主要贸易伙伴关系稳定，风险主要来自国内治理。" },
    ],
  },
];

const profileByCode = Object.fromEntries(profiles.map((p) => [p.code, p]));

const fallbackScores = scores({});

export function getCountryProfile(code: string): CountryProfile | null {
  const existing = profileByCode[code];
  if (existing) return existing;
  const name = countryNameByCode[code];
  if (!name) return null;
  return {
    code,
    name,
    region: countryRegionByCode[code] ?? "其他",
    level: "low",
    overview:
      "该国尚未建立完整的慢变国别档案，当前仅展示动态风险信息流。国别基本盘分析由分析师人工维护，可在需要时排期补充。",
    revisedAt: "待建立",
    scores: fallbackScores,
    entities: [],
    fundamentals: [],
  };
}

export const countryList = hexCountries.map((c) => ({
  code: c.code,
  name: c.name,
  region: c.region,
  level: (profileByCode[c.code]?.level ?? "low") as RiskLevel,
  hasProfile: Boolean(profileByCode[c.code]),
}));

export const countryRegions = Array.from(new Set(hexCountries.map((c) => c.region)));
