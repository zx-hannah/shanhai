export type ProjectStatus = "进行中" | "已完成" | "暂停";

export interface EpisodeStat {
  name: string;
  progress: number;
  assets: number;
  tokenUsed: number;
}

export interface MemberStat {
  name: string;
  avatar: string; // initials
  role: string;
  generated: number;
  tokenUsed: number;
  contribution: number; // 0-100
}

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  lastEdit: string;
  cover: string;
  status: ProjectStatus;
  progress: number;
  episodes: number;
  completedEpisodes: number;
  totalAssets: number;
  tokenUsed: number;
  tokenTotal: number;
  startDate: string;
  episodeStats: EpisodeStat[];
  members: MemberStat[];
}

export const PROJECTS_DATA: ProjectData[] = [
  {
    id: "1",
    name: "东方神话·第一季",
    description: "以山海经为世界观基础，聚焦神怪与人间的交融，打造东方奇幻题材动画系列",
    lastEdit: "2分钟前",
    cover: "https://images.unsplash.com/photo-1743951896798-2936f661f939?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
    status: "进行中",
    progress: 62,
    episodes: 8,
    completedEpisodes: 5,
    totalAssets: 234,
    tokenUsed: 12500,
    tokenTotal: 50000,
    startDate: "2024-01-15",
    episodeStats: [
      { name: "第一集", progress: 100, assets: 48, tokenUsed: 2100 },
      { name: "第二集", progress: 100, assets: 42, tokenUsed: 1800 },
      { name: "第三集", progress: 95, assets: 38, tokenUsed: 1650 },
      { name: "第四集", progress: 80, assets: 31, tokenUsed: 1400 },
      { name: "第五集", progress: 60, assets: 26, tokenUsed: 1200 },
      { name: "第六集", progress: 35, assets: 18, tokenUsed: 890 },
      { name: "第七集", progress: 10, assets: 8, tokenUsed: 350 },
      { name: "第八集", progress: 0, assets: 0, tokenUsed: 0 },
    ],
    members: [
      { name: "Alice", avatar: "Al", role: "主创", generated: 98, tokenUsed: 4800, contribution: 38 },
      { name: "Bob", avatar: "Bo", role: "背景", generated: 72, tokenUsed: 3500, contribution: 28 },
      { name: "Carol", avatar: "Ca", role: "角色", generated: 64, tokenUsed: 2900, contribution: 24 },
      { name: "Dave", avatar: "Da", role: "道具", generated: 28, tokenUsed: 1300, contribution: 10 },
    ],
  },
  {
    id: "2",
    name: "星际征途",
    description: "近未来科幻题材，星际探索与文明碰撞",
    lastEdit: "1小时前",
    cover: "https://images.unsplash.com/photo-1758930908621-550b64b0b1c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
    status: "进行中",
    progress: 38,
    episodes: 6,
    completedEpisodes: 2,
    totalAssets: 156,
    tokenUsed: 7800,
    tokenTotal: 40000,
    startDate: "2024-03-01",
    episodeStats: [
      { name: "第一集", progress: 100, assets: 40, tokenUsed: 2200 },
      { name: "第二集", progress: 90, assets: 36, tokenUsed: 1950 },
      { name: "第三集", progress: 50, assets: 22, tokenUsed: 1100 },
      { name: "第四集", progress: 20, assets: 10, tokenUsed: 480 },
      { name: "第五集", progress: 5, assets: 4, tokenUsed: 150 },
      { name: "第六集", progress: 0, assets: 0, tokenUsed: 0 },
    ],
    members: [
      { name: "Eve", avatar: "Ev", role: "主创", generated: 65, tokenUsed: 3200, contribution: 41 },
      { name: "Frank", avatar: "Fr", role: "场景", generated: 54, tokenUsed: 2600, contribution: 34 },
      { name: "Grace", avatar: "Gr", role: "角色", generated: 37, tokenUsed: 2000, contribution: 25 },
    ],
  },
  {
    id: "3",
    name: "山海奇谭",
    description: "山海经神兽图鉴拟人化动画，轻松治愈风格",
    lastEdit: "昨天",
    cover: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
    status: "已完成",
    progress: 100,
    episodes: 4,
    completedEpisodes: 4,
    totalAssets: 312,
    tokenUsed: 18000,
    tokenTotal: 20000,
    startDate: "2023-10-01",
    episodeStats: [
      { name: "第一集", progress: 100, assets: 80, tokenUsed: 4500 },
      { name: "第二集", progress: 100, assets: 78, tokenUsed: 4200 },
      { name: "第三集", progress: 100, assets: 82, tokenUsed: 4800 },
      { name: "第四集", progress: 100, assets: 72, tokenUsed: 4500 },
    ],
    members: [
      { name: "Henry", avatar: "He", role: "主创", generated: 120, tokenUsed: 7200, contribution: 40 },
      { name: "Iris", avatar: "Ir", role: "角色", generated: 105, tokenUsed: 6300, contribution: 35 },
      { name: "Jack", avatar: "Ja", role: "背景", generated: 87, tokenUsed: 4500, contribution: 25 },
    ],
  },
  {
    id: "4",
    name: "动画短片集",
    description: "独立动画短片合集，多元风格尝试",
    lastEdit: "3天前",
    cover: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
    status: "暂停",
    progress: 24,
    episodes: 5,
    completedEpisodes: 1,
    totalAssets: 89,
    tokenUsed: 4200,
    tokenTotal: 30000,
    startDate: "2024-02-10",
    episodeStats: [
      { name: "短片01", progress: 100, assets: 32, tokenUsed: 1800 },
      { name: "短片02", progress: 40, assets: 18, tokenUsed: 900 },
      { name: "短片03", progress: 15, assets: 12, tokenUsed: 580 },
      { name: "短片04", progress: 5, assets: 5, tokenUsed: 280 },
      { name: "短片05", progress: 0, assets: 2, tokenUsed: 0 },
    ],
    members: [
      { name: "Kate", avatar: "Ka", role: "主创", generated: 55, tokenUsed: 2800, contribution: 67 },
      { name: "Leo", avatar: "Le", role: "助理", generated: 34, tokenUsed: 1400, contribution: 33 },
    ],
  },
  {
    id: "5",
    name: "龙族传说",
    description: "东方龙族世界观，史诗奇幻风格",
    lastEdit: "一周前",
    cover: "https://images.unsplash.com/photo-1748838602679-32d82ccf188e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600&q=80",
    status: "进行中",
    progress: 18,
    episodes: 10,
    completedEpisodes: 2,
    totalAssets: 98,
    tokenUsed: 5600,
    tokenTotal: 60000,
    startDate: "2024-04-01",
    episodeStats: [
      { name: "第一集", progress: 100, assets: 38, tokenUsed: 2100 },
      { name: "第二集", progress: 80, assets: 30, tokenUsed: 1600 },
      { name: "第三集", progress: 20, assets: 12, tokenUsed: 680 },
      { name: "第四集", progress: 5, assets: 5, tokenUsed: 280 },
      { name: "第五集", progress: 0, assets: 0, tokenUsed: 0 },
      { name: "第六集", progress: 0, assets: 0, tokenUsed: 0 },
      { name: "第七集", progress: 0, assets: 0, tokenUsed: 0 },
      { name: "第八集", progress: 0, assets: 0, tokenUsed: 0 },
      { name: "第九集", progress: 0, assets: 0, tokenUsed: 0 },
      { name: "第十集", progress: 0, assets: 0, tokenUsed: 0 },
    ],
    members: [
      { name: "Mia", avatar: "Mi", role: "主创", generated: 45, tokenUsed: 2800, contribution: 50 },
      { name: "Nick", avatar: "Ni", role: "场景", generated: 32, tokenUsed: 1800, contribution: 32 },
      { name: "Olivia", avatar: "Ol", role: "角色", generated: 21, tokenUsed: 1000, contribution: 18 },
    ],
  },
];

// Pre-computed Map for O(1) project lookup
const PROJECT_MAP = new Map(PROJECTS_DATA.map(p => [p.id, p]));

export function getProjectById(id: string): ProjectData | undefined {
  return PROJECT_MAP.get(id);
}
