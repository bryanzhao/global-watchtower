/** 抽象六边形网格世界地图：按经纬度粗略投影到蜂窝格，不绘制任何边界线。 */
export interface HexCountry {
  code: string;
  name: string;
  region: string;
  lat: number;
  lon: number;
}

export const hexCountries: HexCountry[] = [
  // 北美
  { code: "USA", name: "美国", region: "北美", lat: 39, lon: -98 },
  { code: "CAN", name: "加拿大", region: "北美", lat: 56, lon: -106 },
  { code: "MEX", name: "墨西哥", region: "北美", lat: 23, lon: -102 },
  { code: "CUB", name: "古巴", region: "加勒比", lat: 21.5, lon: -79 },
  { code: "HTI", name: "海地", region: "加勒比", lat: 19, lon: -72.5 },
  { code: "GTM", name: "危地马拉", region: "中美", lat: 15.5, lon: -90 },
  { code: "PAN", name: "巴拿马", region: "中美", lat: 9, lon: -80 },
  // 南美
  { code: "COL", name: "哥伦比亚", region: "南美", lat: 4, lon: -74 },
  { code: "VEN", name: "委内瑞拉", region: "南美", lat: 7, lon: -66 },
  { code: "ECU", name: "厄瓜多尔", region: "南美", lat: -1.5, lon: -78 },
  { code: "PER", name: "秘鲁", region: "南美", lat: -10, lon: -76 },
  { code: "BRA", name: "巴西", region: "南美", lat: -10, lon: -52 },
  { code: "BOL", name: "玻利维亚", region: "南美", lat: -17, lon: -65 },
  { code: "CHL", name: "智利", region: "南美", lat: -33, lon: -71 },
  { code: "ARG", name: "阿根廷", region: "南美", lat: -34, lon: -64 },
  // 西欧 / 北欧
  { code: "GBR", name: "英国", region: "西欧", lat: 54, lon: -2 },
  { code: "IRL", name: "爱尔兰", region: "西欧", lat: 53, lon: -8 },
  { code: "FRA", name: "法国", region: "西欧", lat: 46.5, lon: 2.5 },
  { code: "ESP", name: "西班牙", region: "西欧", lat: 40, lon: -3.7 },
  { code: "PRT", name: "葡萄牙", region: "西欧", lat: 39.5, lon: -8 },
  { code: "DEU", name: "德国", region: "西欧", lat: 51, lon: 10 },
  { code: "ITA", name: "意大利", region: "南欧", lat: 42.5, lon: 12.5 },
  { code: "NLD", name: "荷兰", region: "西欧", lat: 52.2, lon: 5.3 },
  { code: "BEL", name: "比利时", region: "西欧", lat: 50.6, lon: 4.5 },
  { code: "CHE", name: "瑞士", region: "西欧", lat: 46.8, lon: 8.2 },
  { code: "SWE", name: "瑞典", region: "北欧", lat: 61, lon: 15 },
  { code: "NOR", name: "挪威", region: "北欧", lat: 62, lon: 9 },
  { code: "FIN", name: "芬兰", region: "北欧", lat: 63, lon: 26 },
  // 中东欧
  { code: "POL", name: "波兰", region: "中东欧", lat: 52, lon: 19.5 },
  { code: "UKR", name: "乌克兰", region: "中东欧", lat: 49, lon: 32 },
  { code: "BLR", name: "白俄罗斯", region: "中东欧", lat: 53.7, lon: 28 },
  { code: "MDA", name: "摩尔多瓦", region: "中东欧", lat: 47.2, lon: 28.5 },
  { code: "ROU", name: "罗马尼亚", region: "中东欧", lat: 45.9, lon: 25 },
  { code: "HUN", name: "匈牙利", region: "中东欧", lat: 47.2, lon: 19.5 },
  { code: "SRB", name: "塞尔维亚", region: "南欧", lat: 44, lon: 21 },
  { code: "GRC", name: "希腊", region: "南欧", lat: 39, lon: 22 },
  { code: "RUS", name: "俄罗斯", region: "欧亚", lat: 58, lon: 60 },
  // 中东
  { code: "TUR", name: "土耳其", region: "中东", lat: 39, lon: 35 },
  { code: "SYR", name: "叙利亚", region: "中东", lat: 35, lon: 38 },
  { code: "LBN", name: "黎巴嫩", region: "中东", lat: 33.9, lon: 35.8 },
  { code: "ISR", name: "以色列", region: "中东", lat: 31.5, lon: 34.8 },
  { code: "PSE", name: "巴勒斯坦", region: "中东", lat: 31.9, lon: 35.3 },
  { code: "JOR", name: "约旦", region: "中东", lat: 31.2, lon: 36.5 },
  { code: "IRQ", name: "伊拉克", region: "中东", lat: 33, lon: 43.7 },
  { code: "IRN", name: "伊朗", region: "中东", lat: 32.5, lon: 53.7 },
  { code: "SAU", name: "沙特阿拉伯", region: "中东", lat: 24, lon: 45 },
  { code: "ARE", name: "阿联酋", region: "中东", lat: 24, lon: 54 },
  { code: "QAT", name: "卡塔尔", region: "中东", lat: 25.3, lon: 51.2 },
  { code: "KWT", name: "科威特", region: "中东", lat: 29.4, lon: 47.7 },
  { code: "OMN", name: "阿曼", region: "中东", lat: 21, lon: 57 },
  { code: "YEM", name: "也门", region: "中东", lat: 15.5, lon: 47.5 },
  // 北非 / 萨赫勒 / 非洲
  { code: "EGY", name: "埃及", region: "北非", lat: 26.8, lon: 30.8 },
  { code: "LBY", name: "利比亚", region: "北非", lat: 27, lon: 17 },
  { code: "TUN", name: "突尼斯", region: "北非", lat: 34, lon: 9.5 },
  { code: "DZA", name: "阿尔及利亚", region: "北非", lat: 28, lon: 2.6 },
  { code: "MAR", name: "摩洛哥", region: "北非", lat: 32, lon: -6.8 },
  { code: "SDN", name: "苏丹", region: "东非", lat: 15.5, lon: 30 },
  { code: "ETH", name: "埃塞俄比亚", region: "东非", lat: 9, lon: 39.5 },
  { code: "SOM", name: "索马里", region: "东非", lat: 5.5, lon: 46 },
  { code: "KEN", name: "肯尼亚", region: "东非", lat: 0.5, lon: 37.9 },
  { code: "UGA", name: "乌干达", region: "东非", lat: 1.4, lon: 32.3 },
  { code: "COD", name: "刚果（金）", region: "中非", lat: -3, lon: 23.6 },
  { code: "NGA", name: "尼日利亚", region: "西非", lat: 9.1, lon: 8.7 },
  { code: "NER", name: "尼日尔", region: "萨赫勒", lat: 17.6, lon: 8.1 },
  { code: "MLI", name: "马里", region: "萨赫勒", lat: 17.6, lon: -4 },
  { code: "BFA", name: "布基纳法索", region: "萨赫勒", lat: 12.2, lon: -1.6 },
  { code: "TCD", name: "乍得", region: "萨赫勒", lat: 15.5, lon: 18.7 },
  { code: "SEN", name: "塞内加尔", region: "西非", lat: 14.5, lon: -14.5 },
  { code: "GIN", name: "几内亚", region: "西非", lat: 10.4, lon: -11 },
  { code: "GHA", name: "加纳", region: "西非", lat: 7.9, lon: -1 },
  { code: "BEN", name: "贝宁", region: "西非", lat: 9.3, lon: 2.3 },
  { code: "ZAF", name: "南非", region: "南部非洲", lat: -29, lon: 24.7 },
  { code: "MOZ", name: "莫桑比克", region: "南部非洲", lat: -18, lon: 35.5 },
  // 中亚 / 南亚
  { code: "KAZ", name: "哈萨克斯坦", region: "中亚", lat: 48, lon: 67 },
  { code: "UZB", name: "乌兹别克斯坦", region: "中亚", lat: 41.4, lon: 64.6 },
  { code: "AFG", name: "阿富汗", region: "南亚", lat: 33.9, lon: 67.7 },
  { code: "PAK", name: "巴基斯坦", region: "南亚", lat: 30.4, lon: 69.3 },
  { code: "IND", name: "印度", region: "南亚", lat: 22, lon: 79 },
  { code: "BGD", name: "孟加拉国", region: "南亚", lat: 23.7, lon: 90.4 },
  { code: "LKA", name: "斯里兰卡", region: "南亚", lat: 7.9, lon: 80.8 },
  { code: "NPL", name: "尼泊尔", region: "南亚", lat: 28.4, lon: 84 },
  // 东亚 / 东南亚
  { code: "CHN", name: "中国", region: "东亚", lat: 35, lon: 104 },
  { code: "MNG", name: "蒙古", region: "东亚", lat: 46.9, lon: 103.8 },
  { code: "PRK", name: "朝鲜", region: "东亚", lat: 40, lon: 127 },
  { code: "KOR", name: "韩国", region: "东亚", lat: 36.5, lon: 128 },
  { code: "JPN", name: "日本", region: "东亚", lat: 36.2, lon: 138.3 },
  { code: "MMR", name: "缅甸", region: "东南亚", lat: 21.9, lon: 96 },
  { code: "THA", name: "泰国", region: "东南亚", lat: 15.9, lon: 101 },
  { code: "VNM", name: "越南", region: "东南亚", lat: 16, lon: 106.5 },
  { code: "PHL", name: "菲律宾", region: "东南亚", lat: 13, lon: 122 },
  { code: "IDN", name: "印度尼西亚", region: "东南亚", lat: -2.5, lon: 118 },
  { code: "MYS", name: "马来西亚", region: "东南亚", lat: 4.2, lon: 102 },
  // 大洋洲
  { code: "AUS", name: "澳大利亚", region: "大洋洲", lat: -25, lon: 134 },
  { code: "NZL", name: "新西兰", region: "大洋洲", lat: -41, lon: 173 },
  { code: "PNG", name: "巴布亚新几内亚", region: "大洋洲", lat: -6.3, lon: 144 },
];

export interface HexTile extends HexCountry {
  col: number;
  row: number;
}

/** 经纬度 → 蜂窝格（奇数行右偏），冲突时按环形搜索最近空位。 */
function buildTiles(): HexTile[] {
  const taken = new Set<string>();
  const tiles: HexTile[] = [];
  const key = (c: number, r: number) => `${c}:${r}`;

  for (const country of hexCountries) {
    const row0 = Math.round((52 - country.lat) / 5.5);
    const col0 = Math.round(country.lon / 6.2 - (row0 % 2 === 0 ? 0 : 0.5));
    let col = col0;
    let row = row0;
    let radius = 0;
    while (taken.has(key(col, row))) {
      radius += 1;
      let placed = false;
      for (let dr = -radius; dr <= radius && !placed; dr += 1) {
        for (let dc = -radius; dc <= radius && !placed; dc += 1) {
          if (Math.abs(dr) !== radius && Math.abs(dc) !== radius) continue;
          if (!taken.has(key(col0 + dc, row0 + dr))) {
            col = col0 + dc;
            row = row0 + dr;
            placed = true;
          }
        }
      }
      if (!placed && radius > 8) break;
    }
    taken.add(key(col, row));
    tiles.push({ ...country, col, row });
  }
  return tiles;
}

export const hexTiles: HexTile[] = buildTiles();

export const countryNameByCode: Record<string, string> = Object.fromEntries(
  hexCountries.map((c) => [c.code, c.name]),
);

export const countryCodeByName: Record<string, string> = Object.fromEntries(
  hexCountries.map((c) => [c.name, c.code]),
);

export const countryRegionByCode: Record<string, string> = Object.fromEntries(
  hexCountries.map((c) => [c.code, c.region]),
);
