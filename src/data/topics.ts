import type { RiskLevel, RiskTypeId } from "./types";

export type TopicStatus = "escalating" | "stalemate" | "deescalating";

export const topicStatusLabel: Record<TopicStatus, string> = {
  escalating: "升级中",
  stalemate: "僵持",
  deescalating: "降温",
};

/** 主题定制模块：声明式配置，只渲染声明过的模块。 */
export type TopicModule =
  | {
      kind: "matrix";
      title: string;
      note?: string;
      columns: string[];
      rows: { cells: string[]; level?: RiskLevel }[];
    }
  | {
      kind: "gauge";
      title: string;
      note?: string;
      items: { label: string; value: number; note: string }[];
    }
  | {
      kind: "timeline";
      title: string;
      note?: string;
      items: { date: string; label: string; note: string }[];
    }
  | {
      kind: "notes";
      title: string;
      note?: string;
      items: string[];
    };

export interface TopicScenario {
  name: string;
  probability: string;
  summary: string;
  indicators: string[];
}

export interface TopicProfile {
  slug: string;
  /** 与风险事件 event.topic 对应 */
  topic: string;
  name: string;
  level: RiskLevel;
  status: TopicStatus;
  headline: string;
  overview: string;
  updatedAt: string;
  countries: string[];
  primaryTypes: RiskTypeId[];
  judgments: { text: string; confidence: "A" | "B" | "C" }[];
  actors: { states: string[]; organizations: string[]; people: string[] };
  scenarios: TopicScenario[];
  milestones: { date: string; label: string }[];
  modules: TopicModule[];
}

export const topicProfiles: TopicProfile[] = [
  {
    slug: "ru-ua",
    topic: "俄乌冲突",
    name: "俄乌冲突",
    level: "high",
    status: "escalating",
    headline: "东部方向打击强度回升，防空拦截消耗成为未来三个月关键变量。",
    overview:
      "过去 24 小时哈尔科夫方向出现连续导弹与无人机打击，市政通报住宅区受损；东部补给节点同时遭袭。战线整体维持胶着，但远程打击频次上升，能源与粮食走廊的间接风险同步抬升。",
    updatedAt: "08-17 06:00",
    countries: ["UKR", "RUS", "POL", "MDA"],
    primaryTypes: ["war", "political"],
    judgments: [
      { text: "俄方近期打击重心从前线转向后方补给与能源节点，意在压缩乌方持续作战能力。", confidence: "B" },
      { text: "乌方防空拦截率仍高，但拦截弹补给周期是未来 90 天最敏感的单一变量。", confidence: "B" },
      { text: "短期内出现全线突破的概率低，冬季前的谈判窗口尚未打开。", confidence: "C" },
      { text: "邻国（波兰、摩尔多瓦）的溢出风险以无人机残骸与电网干扰为主，非直接军事冲突。", confidence: "A" },
    ],
    actors: {
      states: ["俄罗斯", "乌克兰", "美国", "波兰", "白俄罗斯"],
      organizations: ["北约", "欧盟", "俄国防部", "乌武装部队总参谋部"],
      people: [],
    },
    scenarios: [
      {
        name: "升级：远程打击常态化",
        probability: "约 45%",
        summary: "对能源与后勤节点的打击进入每周多次的节奏，乌方民用电网出现区域性中断。",
        indicators: ["单周导弹/无人机批次 > 5", "变电站类目标被点名通报", "邻国空域临时关闭次数上升"],
      },
      {
        name: "维持：战线胶着",
        probability: "约 40%",
        summary: "地面交换线变化小于 5 公里，双方以消耗与深远打击为主。",
        indicators: ["每周控制区变化 < 5km", "双方通报伤亡口径稳定", "军援交付节奏无明显变化"],
      },
      {
        name: "缓和：局部停火试探",
        probability: "约 15%",
        summary: "围绕能源设施或黑海航运出现有限度的互不打击安排。",
        indicators: ["第三方斡旋公开化", "黑海保险费率回落", "换俘规模扩大"],
      },
    ],
    milestones: [
      { date: "2026-05", label: "东部方向春季攻势结束，战线趋于胶着" },
      { date: "2026-06", label: "新一轮防空系统军援落地" },
      { date: "2026-08", label: "哈尔科夫方向打击频次回升" },
    ],
    modules: [
      {
        kind: "matrix",
        title: "战线与州级态势",
        note: "按方向汇总近 7 天活动强度与主要风险形态",
        columns: ["方向 / 州", "活动强度", "主要形态", "对民用影响"],
        rows: [
          { cells: ["哈尔科夫州", "高", "导弹与无人机打击", "住宅与电力受损"], level: "high" },
          { cells: ["顿涅茨克方向", "高", "地面接触 + 远程打击", "后勤与疏散压力"], level: "high" },
          { cells: ["扎波罗热方向", "中", "炮击与侦察", "农业作业受限"], level: "medium" },
          { cells: ["敖德萨 / 黑海", "中", "对港口与航运设施打击", "出口窗口不稳定"], level: "medium" },
          { cells: ["西部各州", "低", "偶发远程袭击警报", "空袭警报导致停工"], level: "low" },
        ],
      },
      {
        kind: "notes",
        title: "军援与制裁动态",
        items: [
          "防空拦截弹交付节奏为观察重点，公开信息滞后 2–4 周。",
          "新一轮出口管制聚焦无人机零部件与机床类设备。",
          "第三国转口渠道是制裁执行的主要缺口。",
        ],
      },
      {
        kind: "gauge",
        title: "能源与粮食走廊影响",
        items: [
          { label: "黑海粮食出口通畅度", value: 62, note: "较上月下降，保险费率上行" },
          { label: "乌境内电网稳定度", value: 48, note: "东部区域性限电风险高" },
          { label: "欧洲天然气供应压力", value: 35, note: "库存充足，短期可控" },
        ],
      },
    ],
  },
  {
    slug: "us-iran",
    topic: "美伊对抗",
    name: "美伊对抗",
    level: "high",
    status: "escalating",
    headline: "德黑兰强化防空、伊拉克民兵放话，代理人方向先于直接冲突升温。",
    overview:
      "伊朗在德黑兰与核设施周边加强防空与限行；伊拉克亲伊民兵发布针对驻伊美军的威胁声明，基地提升戒备。谈判渠道未正式关闭，但双方均以军事信号先行，误判风险上升。",
    updatedAt: "08-17 06:00",
    countries: ["IRN", "IRQ", "ISR", "YEM", "LBN", "USA"],
    primaryTypes: ["war", "terror", "political"],
    judgments: [
      { text: "当前升级路径以代理人袭击为主，直接对伊本土打击的门槛仍高。", confidence: "B" },
      { text: "核计划相关的监督缺口扩大，是外交崩盘的主要触发点。", confidence: "B" },
      { text: "霍尔木兹海峡完全封锁概率低，但骚扰式行动与保险费率上行概率高。", confidence: "A" },
      { text: "美方兵力调动更接近威慑姿态，尚未出现大规模攻势部署特征。", confidence: "C" },
    ],
    actors: {
      states: ["伊朗", "美国", "以色列", "伊拉克", "也门", "沙特阿拉伯"],
      organizations: ["伊斯兰革命卫队", "真主党", "胡塞武装", "伊拉克伊斯兰抵抗组织", "国际原子能机构", "美国中央司令部"],
      people: [],
    },
    scenarios: [
      {
        name: "升级：代理人袭击造成美方人员伤亡",
        probability: "约 35%",
        summary: "驻伊或驻叙美军遭袭并出现伤亡，美方实施报复性打击，冲突进入互相报复循环。",
        indicators: ["基地遇袭频次周环比翻倍", "美方撤离非必要人员", "地区航空公司调整航线"],
      },
      {
        name: "维持：高压对峙",
        probability: "约 50%",
        summary: "双方以军事信号与制裁互动为主，间接谈判断续进行。",
        indicators: ["谈判代表往返第三国", "袭击停留在无伤亡级别", "海峡通行量保持稳定"],
      },
      {
        name: "缓和：临时安排达成",
        probability: "约 15%",
        summary: "就监督或释放人员达成有限安排，紧张度阶段性回落。",
        indicators: ["原子能机构恢复现场准入", "制裁豁免公告", "民兵组织公开降调"],
      },
    ],
    milestones: [
      { date: "2026-04", label: "间接谈判中断" },
      { date: "2026-06", label: "红海—亚丁湾袭击外溢至波斯湾方向" },
      { date: "2026-08", label: "德黑兰周边防空部署强化" },
    ],
    modules: [
      {
        kind: "gauge",
        title: "代理人网络活动强度",
        note: "0–100，基于近 30 天已确认事件频次与烈度加权",
        items: [
          { label: "伊拉克民兵（伊斯兰抵抗组织）", value: 78, note: "威胁声明频出，基地戒备提升" },
          { label: "胡塞武装（也门）", value: 71, note: "红海—亚丁湾骚扰持续" },
          { label: "真主党（黎巴嫩）", value: 44, note: "边境交火维持低烈度" },
          { label: "叙利亚境内亲伊武装", value: 38, note: "活动分散，情报置信度低" },
        ],
      },
      {
        kind: "timeline",
        title: "核计划与谈判节点",
        items: [
          { date: "08-12", label: "监督准入受限", note: "部分设施摄像数据未恢复传输" },
          { date: "08-15", label: "第三方斡旋接触", note: "间接沟通渠道未中断" },
          { date: "08-17", label: "设施周边限行", note: "纳坦兹周边道路管控升级" },
        ],
      },
      {
        kind: "matrix",
        title: "海峡与航运风险",
        columns: ["水道", "威胁形态", "当前等级", "对航运的实际影响"],
        rows: [
          { cells: ["霍尔木兹海峡", "扣船、GPS 干扰", "中", "保险费率上行，通行未中断"], level: "medium" },
          { cells: ["曼德海峡", "无人艇 / 无人机袭击", "高", "多家航商绕行好望角"], level: "high" },
          { cells: ["波斯湾北部", "水雷与骚扰风险", "中", "夜航减少"], level: "medium" },
        ],
      },
      {
        kind: "notes",
        title: "美方兵力调动信号",
        items: [
          "航母打击群部署周期是否延长，为最直接的姿态指标。",
          "空中加油机与侦察机进出频次上升，属常规威慑范畴。",
          "尚未观察到大规模弹药前置与医疗力量部署等攻势准备特征。",
        ],
      },
    ],
  },
  {
    slug: "sahel",
    topic: "萨赫勒安全",
    name: "萨赫勒与非洲政变观察",
    level: "high",
    status: "escalating",
    headline: "武装团体活动南移，沿海国家北部边境风险抬升，政变风险仍居高位。",
    overview:
      "马里、布基纳法索、尼日尔三角地带袭击持续，几内亚湾沿海国家北部边境成为新的扩散前沿。军政府过渡进程反复，政变与政变未遂风险在区域内保持高位。",
    updatedAt: "08-17 06:00",
    countries: ["MLI", "NER", "BFA", "TCD", "NGA", "BEN"],
    primaryTypes: ["terror", "political"],
    judgments: [
      { text: "袭击重心持续南移，未来 6 个月沿海国家北部边境袭击频次预计上升。", confidence: "B" },
      { text: "区域安全合作机制弱化，跨境联合行动能力下降。", confidence: "B" },
      { text: "政变风险与军队薪资、燃料补贴等民生事件高度相关。", confidence: "C" },
    ],
    actors: {
      states: ["马里", "尼日尔", "布基纳法索", "乍得", "贝宁"],
      organizations: ["JNIM", "ISWAP", "萨赫勒国家联盟", "联合国人道协调办公室"],
      people: [],
    },
    scenarios: [
      {
        name: "升级：沿海国家出现大规模袭击",
        probability: "约 40%",
        summary: "贝宁、多哥北部出现造成两位数伤亡的袭击，旅游与矿业作业受直接影响。",
        indicators: ["沿海国北部宵禁扩大", "外派人员撤离通告", "边境口岸关闭"],
      },
      {
        name: "维持：高烈度但地域稳定",
        probability: "约 45%",
        summary: "袭击集中在三角地带，外溢有限。",
        indicators: ["每月袭击数量波动 < 20%", "无新增国家宵禁"],
      },
      {
        name: "缓和：过渡进程推进",
        probability: "约 15%",
        summary: "选举日程明确，区域组织恢复对话。",
        indicators: ["选举委员会成立", "制裁部分解除"],
      },
    ],
    milestones: [
      { date: "2026-02", label: "区域组织制裁调整" },
      { date: "2026-06", label: "沿海国家北部首次出现连续袭击" },
      { date: "2026-08", label: "尼日尔西部宵禁延长" },
    ],
    modules: [
      {
        kind: "matrix",
        title: "国别政变与武装冲突风险",
        columns: ["国家", "政变风险", "武装袭击强度", "备注"],
        rows: [
          { cells: ["马里", "中", "高", "中部与北部持续遇袭"], level: "high" },
          { cells: ["布基纳法索", "高", "高", "政府控制区收缩"], level: "high" },
          { cells: ["尼日尔", "中", "高", "西部边境袭击频发"], level: "high" },
          { cells: ["贝宁", "低", "中", "北部边境为新前沿"], level: "medium" },
          { cells: ["乍得", "中", "中", "湖区跨境袭击"], level: "medium" },
        ],
      },
    ],
  },
  {
    slug: "red-sea",
    topic: "红海航运",
    name: "红海航运安全",
    level: "high",
    status: "stalemate",
    headline: "商船遇袭风险持续，战争险费率上调，绕行好望角成为常态。",
    overview:
      "亚丁湾以西的无人艇与无人机骚扰持续，AIS 关闭船舶比例上升，保险成本抬高，多家航商维持绕行安排，运价与交付周期受影响。",
    updatedAt: "08-17 06:00",
    countries: ["YEM", "EGY", "SAU", "OMN"],
    primaryTypes: ["terror", "war"],
    judgments: [
      { text: "袭击方式以低成本无人平台为主，短期难以通过护航彻底消除。", confidence: "A" },
      { text: "绕行安排在未来一个季度仍将维持，运价存在上行压力。", confidence: "B" },
    ],
    actors: {
      states: ["也门", "美国", "英国", "埃及"],
      organizations: ["胡塞武装", "国际海运保险协会", "多家航运公司"],
      people: [],
    },
    scenarios: [
      {
        name: "升级：出现船员伤亡或沉船",
        probability: "约 25%",
        summary: "重大伤亡事件触发保险与航线的进一步收缩。",
        indicators: ["战争险费率再上调", "更多船东公告绕行"],
      },
      {
        name: "维持：骚扰常态化",
        probability: "约 60%",
        summary: "袭击维持当前频次，护航体系保持运转。",
        indicators: ["每周袭击 1–3 起", "通行量小幅波动"],
      },
      {
        name: "缓和：区域停火外溢",
        probability: "约 15%",
        summary: "地区局势缓和带动袭击停止。",
        indicators: ["公开声明停止袭击", "保险费率回落"],
      },
    ],
    milestones: [
      { date: "2026-03", label: "主要航商启动绕行" },
      { date: "2026-08", label: "战争险费率再度上调" },
    ],
    modules: [
      {
        kind: "gauge",
        title: "通道运行指标",
        items: [
          { label: "曼德海峡日均通行量（同比）", value: 41, note: "较冲突前显著下降" },
          { label: "AIS 关闭船舶比例", value: 63, note: "过去 6 小时上升" },
          { label: "绕行好望角运力占比", value: 58, note: "维持高位" },
        ],
      },
    ],
  },
  {
    slug: "us-cuba",
    topic: "美国-古巴",
    name: "美国对古巴军事行动风险",
    level: "medium",
    status: "escalating",
    headline: "侦察活动与政治表态同步升温，尚无实际军事行动迹象。",
    overview:
      "OSINT 追踪显示美军侦察机在古巴以北空域活动频次上升，华盛顿方面表态趋硬。目前未观察到两栖或大规模空中打击所需的兵力前置。",
    updatedAt: "08-17 06:00",
    countries: ["CUB", "USA"],
    primaryTypes: ["political", "war"],
    judgments: [
      { text: "现阶段属政治施压与情报准备，动武概率低。", confidence: "B" },
      { text: "岛内经济与能源困境是政治不稳定的主要来源，非外部军事因素。", confidence: "B" },
    ],
    actors: {
      states: ["美国", "古巴"],
      organizations: ["美国南方司令部", "古巴革命武装力量"],
      people: [],
    },
    scenarios: [
      {
        name: "升级：封锁或定点打击",
        probability: "约 10%",
        summary: "出现海上封锁或针对特定目标的打击。",
        indicators: ["两栖编队进入加勒比", "使领馆撤离通告", "航空管制区发布"],
      },
      {
        name: "维持：高压姿态",
        probability: "约 70%",
        summary: "侦察与制裁并行，政治口水战延续。",
        indicators: ["侦察机航迹频次稳定", "新增个体制裁"],
      },
      {
        name: "缓和：接触恢复",
        probability: "约 20%",
        summary: "在移民或人道议题上恢复对话。",
        indicators: ["双边会谈公告", "签证服务恢复"],
      },
    ],
    milestones: [
      { date: "2026-07", label: "美方强化表态" },
      { date: "2026-08", label: "侦察活动频次上升" },
    ],
    modules: [
      {
        kind: "notes",
        title: "军事行动前置信号清单",
        items: [
          "两栖攻击舰或航母打击群进入加勒比海并延长停留。",
          "关塔那摩方向后勤与医疗力量增强。",
          "民用航空临时禁飞区（NOTAM）发布。",
          "使领馆非必要人员撤离通告。",
        ],
      },
    ],
  },
  {
    slug: "africa-epidemic",
    topic: "非洲传染病",
    name: "非洲传染病观察",
    level: "medium",
    status: "escalating",
    headline: "刚果（金）东部报告聚集性疑似病例，跨境流动构成扩散风险。",
    overview:
      "东部省份出现聚集性疑似病例，样本仍在送检；区域医疗资源紧张、边境人口流动频繁，是扩散的主要放大因素。",
    updatedAt: "08-17 06:00",
    countries: ["COD", "UGA", "KEN", "SDN"],
    primaryTypes: ["epidemic"],
    judgments: [
      { text: "在实验室确认前，事件等级维持“中”，不宜提前定性。", confidence: "C" },
      { text: "若确认为埃博拉类病原，跨境扩散窗口约为 2–3 周。", confidence: "B" },
    ],
    actors: {
      states: ["刚果（金）", "乌干达", "肯尼亚"],
      organizations: ["世界卫生组织", "无国界医生", "非洲疾控中心"],
      people: [],
    },
    scenarios: [
      {
        name: "升级：确认并出现跨境病例",
        probability: "约 30%",
        summary: "邻国出现输入病例，区域旅行建议调整。",
        indicators: ["邻国通报输入病例", "机场入境筛查升级"],
      },
      {
        name: "维持：局部可控",
        probability: "约 55%",
        summary: "病例集中在初始省份，接触者追踪有效。",
        indicators: ["新增病例曲线走平", "隔离设施未超载"],
      },
      {
        name: "缓和：排除高危病原",
        probability: "约 15%",
        summary: "实验室结果排除高致死病原。",
        indicators: ["官方通报检测结果", "撤销临时管控"],
      },
    ],
    milestones: [
      { date: "2026-08", label: "东部省份通报聚集性疑似病例" },
    ],
    modules: [
      {
        kind: "matrix",
        title: "重点国家卫生系统承压",
        columns: ["国家", "监测能力", "医疗承载", "跨境流动强度"],
        rows: [
          { cells: ["刚果（金）", "弱", "紧张", "高"], level: "high" },
          { cells: ["乌干达", "中", "一般", "高"], level: "medium" },
          { cells: ["肯尼亚", "较强", "一般", "中"], level: "medium" },
        ],
      },
    ],
  },
];

export const topicBySlug = Object.fromEntries(topicProfiles.map((t) => [t.slug, t]));
export const topicByName = Object.fromEntries(topicProfiles.map((t) => [t.topic, t]));
