import { useState } from "react";
import {
  Image as LucideImage, Video, Music, Download, Star, Trash2, Check, Search,
  ChevronDown, ChevronRight, X, Grid3X3, LayoutList, Pencil, ArrowDown, ArrowUp,
  Layers, User, Folder, FileText, ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { PROJECTS_DATA } from "../data/projectsData";
import { useSpace } from "../context/SpaceContext";

// ─── Types ────────────────────────────────────────────────────────────────────
type AssetTab = "generate" | "upload" | "subject" | "collect";
type AssetType = "all" | "image" | "video" | "audio" | "script";

interface AssetItem {
  id: string;
  name: string;
  type: "image" | "video" | "audio" | "script";
  src: string | null;
  size: string;
  date: string;
  dateTs: number;
  collected: boolean;
  tab: string;
  projectId?: string;
}

// ─── My Assets ────────────────────────────────────────────────────────────────
const MY_ASSETS: AssetItem[] = [
  { id: "m1", name: "白发女侠_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=400&q=80", size: "2.3 MB", date: "今天", dateTs: 4, collected: true, tab: "generate" },
  { id: "m2", name: "古城背景_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=400&q=80", size: "1.8 MB", date: "今天", dateTs: 4, collected: false, tab: "generate" },
  { id: "m3", name: "山林场景_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=400&q=80", size: "3.1 MB", date: "今天", dateTs: 4, collected: true, tab: "generate" },
  { id: "m4", name: "道具宝剑_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=400&q=80", size: "0.9 MB", date: "今天", dateTs: 4, collected: false, tab: "generate" },
  { id: "m5", name: "主角设定_v3.jpg", type: "image", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=400&q=80", size: "2.7 MB", date: "今天", dateTs: 4, collected: false, tab: "generate" },
  { id: "m6", name: "云雾山脉背景.jpg", type: "image", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=400&q=80", size: "4.2 MB", date: "今天", dateTs: 4, collected: true, tab: "generate" },
  { id: "m7", name: "人物参考_古装.jpg", type: "image", src: "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?w=400&q=80", size: "1.5 MB", date: "昨天", dateTs: 3, collected: false, tab: "upload" },
  { id: "m8", name: "角色立绘参考.jpg", type: "image", src: "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?w=400&q=80", size: "2.1 MB", date: "昨天", dateTs: 3, collected: true, tab: "upload" },
  { id: "m9", name: "战场BGM.mp3", type: "audio", src: null, size: "4.2 MB", date: "3天前", dateTs: 2, collected: false, tab: "upload" },
  { id: "m10", name: "角色出场动效.mp4", type: "video", src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?w=400&q=80", size: "12 MB", date: "3天前", dateTs: 2, collected: false, tab: "generate" },
  { id: "m11", name: "片头动画.mp4", type: "video", src: "https://images.unsplash.com/photo-1748838602679-32d82ccf188e?w=400&q=80", size: "28 MB", date: "一周前", dateTs: 1, collected: true, tab: "generate" },
  { id: "m12", name: "第一集分镜脚本.json", type: "script", src: null, size: "0.3 MB", date: "今天", dateTs: 4, collected: false, tab: "generate" },
  { id: "m13", name: "场景描述脚本.txt", type: "script", src: null, size: "0.1 MB", date: "昨天", dateTs: 3, collected: true, tab: "generate" },
];

// ── Project Assets ───────────────────────────────────────────────────────────
// Each project has folder groups, each group has sub-folders that hold assets

const PROJECT_ASSETS: Record<string, AssetItem[]> = {
  "1": [
    { id: "p1-1", name: "神话角色_灵狐.jpg", type: "image", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=400&q=80", size: "3.2 MB", date: "今天", dateTs: 4, collected: true, tab: "generate", projectId: "1" },
    { id: "p1-2", name: "仙境云海背景.jpg", type: "image", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=400&q=80", size: "4.1 MB", date: "今天", dateTs: 4, collected: false, tab: "generate", projectId: "1" },
    { id: "p1-3", name: "古城门楼.jpg", type: "image", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=400&q=80", size: "2.8 MB", date: "昨天", dateTs: 3, collected: true, tab: "generate", projectId: "1" },
    { id: "p1-4", name: "神兽图鉴_龙.jpg", type: "image", src: "https://images.unsplash.com/photo-1748838602679-32d82ccf188e?w=400&q=80", size: "3.5 MB", date: "昨天", dateTs: 3, collected: false, tab: "generate", projectId: "1" },
    { id: "p1-5", name: "主题曲_神话.mp3", type: "audio", src: null, size: "6.2 MB", date: "3天前", dateTs: 2, collected: true, tab: "upload", projectId: "1" },
    { id: "p1-6", name: "片段_01.mp4", type: "video", src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?w=400&q=80", size: "45 MB", date: "一周前", dateTs: 1, collected: false, tab: "generate", projectId: "1" },
  ],
  "2": [
    { id: "p2-1", name: "飞船概念图.jpg", type: "image", src: "https://images.unsplash.com/photo-1758930908621-550b64b0b1c1?w=400&q=80", size: "2.9 MB", date: "今天", dateTs: 4, collected: true, tab: "generate", projectId: "2" },
    { id: "p2-2", name: "星际地图.jpg", type: "image", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=400&q=80", size: "1.7 MB", date: "今天", dateTs: 4, collected: false, tab: "generate", projectId: "2" },
    { id: "p2-3", name: "外星文明参考.jpg", type: "image", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=400&q=80", size: "3.3 MB", date: "昨天", dateTs: 3, collected: false, tab: "upload", projectId: "2" },
    { id: "p2-4", name: "主角立绘.jpg", type: "image", src: "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?w=400&q=80", size: "2.1 MB", date: "3天前", dateTs: 2, collected: true, tab: "generate", projectId: "2" },
    { id: "p2-5", name: "宇宙BGM.mp3", type: "audio", src: null, size: "5.8 MB", date: "一周前", dateTs: 1, collected: false, tab: "upload", projectId: "2" },
  ],
  "3": [
    { id: "p3-1", name: "神兽貔貅_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=400&q=80", size: "2.4 MB", date: "今天", dateTs: 4, collected: true, tab: "generate", projectId: "3" },
    { id: "p3-2", name: "山海经插画.jpg", type: "image", src: "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?w=400&q=80", size: "3.8 MB", date: "今天", dateTs: 4, collected: true, tab: "generate", projectId: "3" },
    { id: "p3-3", name: "治愈风场景.jpg", type: "image", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=400&q=80", size: "2.2 MB", date: "昨天", dateTs: 3, collected: false, tab: "generate", projectId: "3" },
    { id: "p3-4", name: "片头.mp4", type: "video", src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?w=400&q=80", size: "32 MB", date: "3天前", dateTs: 2, collected: false, tab: "generate", projectId: "3" },
    { id: "p3-5", name: "背景参考集.jpg", type: "image", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=400&q=80", size: "1.9 MB", date: "一周前", dateTs: 1, collected: true, tab: "upload", projectId: "3" },
  ],
  "4": [
    { id: "p4-1", name: "短片_概念稿.jpg", type: "image", src: "https://images.unsplash.com/photo-1748838602679-32d82ccf188e?w=400&q=80", size: "1.6 MB", date: "今天", dateTs: 4, collected: false, tab: "generate", projectId: "4" },
    { id: "p4-2", name: "动画帧_001.jpg", type: "image", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=400&q=80", size: "0.8 MB", date: "昨天", dateTs: 3, collected: true, tab: "generate", projectId: "4" },
    { id: "p4-3", name: "混音_beta.mp3", type: "audio", src: null, size: "3.1 MB", date: "3天前", dateTs: 2, collected: false, tab: "upload", projectId: "4" },
  ],
  "5": [
    { id: "p5-1", name: "龙族纹章_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1758930908621-550b64b0b1c1?w=400&q=80", size: "2.6 MB", date: "今天", dateTs: 4, collected: true, tab: "generate", projectId: "5" },
    { id: "p5-2", name: "史诗场景.jpg", type: "image", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=400&q=80", size: "4.5 MB", date: "今天", dateTs: 4, collected: false, tab: "generate", projectId: "5" },
    { id: "p5-3", name: "龙族圣地背景.jpg", type: "image", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=400&q=80", size: "3.7 MB", date: "昨天", dateTs: 3, collected: true, tab: "upload", projectId: "5" },
    { id: "p5-4", name: "战斗音效.mp3", type: "audio", src: null, size: "2.4 MB", date: "3天前", dateTs: 2, collected: false, tab: "upload", projectId: "5" },
  ],
};

// ─── Project Folder Structure ────────────────────────────────────────────────
interface FolderNode {
  id: string;
  name: string;
  assetIds: string[];
}

interface FolderGroup {
  id: string;
  name: string;
  folders: FolderNode[];
}

/** Flat folder: a single-level folder with assets directly (no sub-folders) */
interface FlatFolder {
  id: string;
  name: string;
  assetIds: string[];
}

const PROJECT_FOLDERS: Record<string, FolderGroup[]> = {
  "1": [
    { id: "g-art", name: "美术设定", folders: [
      { id: "f-char", name: "人物设定", assetIds: ["p1-1", "p1-4"] },
      { id: "f-scene", name: "场景设定", assetIds: ["p1-2", "p1-3"] },
      { id: "f-prop", name: "道具设定", assetIds: [] },
    ]},
    { id: "g-ep1", name: "第一集", folders: [
      { id: "f-ep1a", name: "分镜1-5", assetIds: ["p1-6"] },
      { id: "f-ep1b", name: "分镜6-10", assetIds: [] },
    ]},
    { id: "g-audio", name: "音频素材", folders: [
      { id: "f-bgm", name: "背景音乐", assetIds: ["p1-5"] },
      { id: "f-sfx", name: "音效", assetIds: [] },
    ]},
  ],
  "2": [
    { id: "g-concept", name: "概念设计", folders: [
      { id: "f-ship", name: "飞船概念", assetIds: ["p2-1"] },
      { id: "f-map", name: "星际地图", assetIds: ["p2-2", "p2-3"] },
      { id: "f-char2", name: "角色设定", assetIds: ["p2-4"] },
    ]},
    { id: "g-audio2", name: "音频素材", folders: [
      { id: "f-bgm2", name: "背景音乐", assetIds: ["p2-5"] },
    ]},
    // Flat folders: single-level folders with assets directly
    { id: "g-chat", name: "未命名对话", folders: [
      { id: "f-chat-all", name: "对话生成", assetIds: ["p2-1", "p2-3", "p2-4", "p2-5"] },
    ]},
  ],
  "3": [
    { id: "g-illust", name: "插画素材", folders: [
      { id: "f-beast", name: "神兽图鉴", assetIds: ["p3-1", "p3-2"] },
      { id: "f-scene2", name: "场景参考", assetIds: ["p3-3", "p3-5"] },
    ]},
    { id: "g-video", name: "视频素材", folders: [
      { id: "f-intro", name: "片头片尾", assetIds: ["p3-4"] },
    ]},
  ],
  "4": [
    { id: "g-concept4", name: "概念稿", folders: [
      { id: "f-draft", name: "草稿", assetIds: ["p4-1", "p4-2"] },
    ]},
    { id: "g-audio4", name: "音频素材", folders: [
      { id: "f-mix", name: "混音", assetIds: ["p4-3"] },
    ]},
    // Flat folder
    { id: "g-quick", name: "快速生成", folders: [
      { id: "f-quick-all", name: "快速对话资产", assetIds: ["p4-1", "p4-2", "p4-3"] },
    ]},
  ],
  "5": [
    { id: "g-design5", name: "视觉设计", folders: [
      { id: "f-emblem", name: "纹章设计", assetIds: ["p5-1"] },
      { id: "f-scene5", name: "场景设定", assetIds: ["p5-2", "p5-3"] },
    ]},
    { id: "g-audio5", name: "音频素材", folders: [
      { id: "f-bgm5", name: "战斗音效", assetIds: ["p5-4"] },
    ]},
  ],
};

/** Flat folders per project: single-level folders containing assets directly */
const PROJECT_FLAT_FOLDERS: Record<string, FlatFolder[]> = {
  "2": [
    { id: "ff-chat", name: "未命名对话", assetIds: ["p2-1", "p2-2", "p2-3", "p2-4"] },
  ],
  "4": [
    { id: "ff-quick", name: "快速生成", assetIds: ["p4-1", "p4-2", "p4-3"] },
  ],
  "5": [
    { id: "ff-misc", name: "其他资产", assetIds: ["p5-1", "p5-2"] },
  ],
};

// Lookup helpers
const ALL_PROJECT_ASSETS: AssetItem[] = Object.entries(PROJECT_ASSETS).flatMap(([projectId, assets]) =>
  assets.map((a) => ({ ...a, projectId }))
);
const getProjectAsset = (id: string) => ALL_PROJECT_ASSETS.find((a) => a.id === id);
const getFolderAssets = (projectId: string, folderId: string): AssetItem[] => {
  const groups = PROJECT_FOLDERS[projectId] ?? [];
  for (const g of groups) {
    const f = g.folders.find((x) => x.id === folderId);
    if (f) return f.assetIds.map((id) => getProjectAsset(id)).filter(Boolean) as AssetItem[];
  }
  return [];
};

// ─── Member Assets ────────────────────────────────────────────────────────────
const MEMBER_DATA = [
  { id: "2", name: "Alice", letter: "A", avatarColor: "#7B3FC4", assetCount: 8 },
  { id: "3", name: "Charlie", letter: "C", avatarColor: "#2A6FC4", assetCount: 5 },
  { id: "4", name: "Diana", letter: "D", avatarColor: "#C42A6F", assetCount: 3 },
  { id: "5", name: "Eve", letter: "E", avatarColor: "#2AC4A2", assetCount: 6 },
];

const MEMBER_ASSETS: Record<string, AssetItem[]> = {
  "2": MY_ASSETS.slice(0, 8).map((a) => ({ ...a, projectId: undefined })),
  "3": MY_ASSETS.slice(0, 5).map((a) => ({ ...a, projectId: undefined })),
  "4": MY_ASSETS.slice(0, 3).map((a) => ({ ...a, projectId: undefined })),
  "5": MY_ASSETS.slice(0, 6).map((a) => ({ ...a, projectId: undefined })),
};

const TYPE_ICONS = { image: LucideImage, video: Video, audio: Music, script: FileText };
const TYPE_LABELS: Record<AssetType, string> = { all: "全部类型", image: "图片", video: "视频", audio: "音频", script: "脚本" };

// ─── Asset Detail Modal ───────────────────────────────────────────────────────
function AssetDetailModal({ asset, onClose }: { asset: AssetItem; onClose: () => void }) {
  const TypeIcon = TYPE_ICONS[asset.type];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.82)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative flex flex-col rounded-2xl overflow-hidden"
        style={{ background: "#1A1510", border: "1px solid rgba(255,255,255,0.1)", width: "680px", maxHeight: "85vh" }}>
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-sm text-white">{asset.name}</span>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10">
            <X size={15} style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6 flex gap-6">
          <div className="flex-1 rounded-xl overflow-hidden flex items-center justify-center"
            style={{ background: "#140F09", minHeight: "300px" }}>
            {asset.src ? (
              <img src={asset.src} alt={asset.name} className="max-w-full max-h-full object-contain" style={{ maxHeight: "360px" }} />
            ) : (
              <div className="flex flex-col items-center gap-3" style={{ color: "rgba(255,255,255,0.2)" }}>
                <TypeIcon size={40} /><span className="text-sm">{asset.type === "video" ? "视频文件" : "音频文件"}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3" style={{ width: "160px", flexShrink: 0 }}>
            {[["类型", asset.type === "image" ? "图片" : asset.type === "video" ? "视频" : asset.type === "audio" ? "音频" : "脚本"], ["大小", asset.size], ["日期", asset.date]].map(([k, v]) => (
              <div key={k}>
                <div className="text-xs mb-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{k}</div>
                <div className="text-sm text-white">{v}</div>
              </div>
            ))}
            <div className="flex flex-col gap-2 mt-auto">
              <button onClick={() => toast.success("下载已开始")}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs hover:opacity-80"
                style={{ background: "#E87322", color: "white" }}>
                <Download size={12} />下载
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Project Folder View (right panel, shows folder groups & folders) ────────
function ProjectFolderView({ projectId, groupId, setSel }: {
  projectId: string;
  groupId?: string;
  setSel: (s: SidebarSel) => void;
}) {
  const groups = PROJECT_FOLDERS[projectId] ?? [];
  const flatFolders = PROJECT_FLAT_FOLDERS[projectId] ?? [];
  const allAssets = PROJECT_ASSETS[projectId] ?? [];
  const [assetTab, setAssetTab] = useState<"全部生成" | "历史上传" | "主体资产" | "全部收藏">("全部生成");
  const [searchText, setSearchText] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // If a groupId is set, only show that group's sub-folders
  const currentGroup = groupId ? groups.find(g => g.id === groupId) : null;
  const displayGroupsForGroup = currentGroup ? [currentGroup] : [];

  // Filter groups by search
  const filteredGroups = displayGroupsForGroup.length > 0
    ? displayGroupsForGroup.map((group) => ({
        ...group,
        folders: group.folders.filter((f) => {
          if (searchText && !f.name.toLowerCase().includes(searchText.toLowerCase())) return false;
          return true;
        }),
      })).filter((g) => g.folders.length > 0)
    : groups
    .map((group) => ({
      ...group,
      folders: group.folders.filter((f) => {
        if (searchText && !f.name.toLowerCase().includes(searchText.toLowerCase())) return false;
        return true;
      }),
    }))
    .filter((g) => g.folders.length > 0);

  // Filter flat folders by search (hide when viewing a specific group)
  const filteredFlatFolders = currentGroup
    ? []
    : flatFolders.filter((f) => {
        if (searchText && !f.name.toLowerCase().includes(searchText.toLowerCase())) return false;
        return true;
      });

  // dateTs helper
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tsToDate = (ts: number) => {
    const d = new Date(today);
    if (ts === 4) d.setDate(d.getDate());
    else if (ts === 3) d.setDate(d.getDate() - 1);
    else if (ts === 2) d.setDate(d.getDate() - 3);
    else d.setDate(d.getDate() - 7);
    return d;
  };

  // Filter groups by date range (filter folders whose assets fall in range)
  const dateFilteredGroups = filteredGroups
    .map((group) => ({
      ...group,
      folders: group.folders.filter((f) => {
        if (!startDate && !endDate) return true;
        return f.assetIds.some((aid) => {
          const asset = getProjectAsset(aid);
          if (!asset) return false;
          if (startDate && tsToDate(asset.dateTs) < new Date(startDate)) return false;
          if (endDate) {
            const e = new Date(endDate);
            e.setHours(23, 59, 59, 999);
            if (tsToDate(asset.dateTs) > e) return false;
          }
          return true;
        });
      }),
    }))
    .filter((g) => g.folders.length > 0);

  // Filter by tab
  const tabFilteredGroups = dateFilteredGroups
    .map((group) => ({
      ...group,
      folders: group.folders.filter((f) => {
        if (assetTab === "全部收藏") {
          return f.assetIds.some((aid) => {
            const asset = getProjectAsset(aid);
            return asset?.collected ?? false;
          });
        }
        if (assetTab === "历史上传") {
          return f.assetIds.some((aid) => {
            const asset = getProjectAsset(aid);
            return asset?.tab === "upload";
          });
        }
        if (assetTab === "主体资产") {
          return f.assetIds.some((aid) => {
            const asset = getProjectAsset(aid);
            return asset?.tab === "subject";
          });
        }
        return true;
      }),
    }))
    .filter((g) => g.folders.length > 0);

  const displayGroups = tabFilteredGroups;

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "#140F09" }}>
      {/* Group header with back arrow when inside a group */}
      {currentGroup && (
        <div className="flex items-center gap-3 px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={() => setSel({ section: "project", projectId })}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-white/10 flex-shrink-0"
            style={{ background: "rgba(232,115,34,0.12)", border: "1px solid rgba(232,115,34,0.25)" }}
            title="返回上一级"
          >
            <ArrowLeft size={14} style={{ color: "#E87322" }} />
          </button>
          <Folder size={15} style={{ color: "#E87322" }} />
          <span className="text-base font-semibold text-white">{currentGroup.name}</span>
          <span className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>
            {currentGroup.folders.length} 个子文件夹
          </span>
        </div>
      )}

      {/* Tabs — only show at project level (no groupId) */}
      {!currentGroup && (
      <div className="flex items-end gap-0 px-6 pt-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {(["全部生成", "历史上传", "主体资产", "全部收藏"] as const).map((tab) => (
          <button key={tab} onClick={() => setAssetTab(tab)}
            className="px-4 py-2 text-xs font-medium relative"
            style={{
              color: assetTab === tab ? "#E87322" : "rgba(255,255,255,0.35)",
              borderBottom: assetTab === tab ? "2px solid #E87322" : "2px solid transparent",
              marginBottom: "-1px",
            }}>
            {tab}
          </button>
        ))}
      </div>
      )}

      {/* Filter bar — only at project level */}
      {!currentGroup && (
      <div className="flex items-center gap-2 px-6 py-3 flex-shrink-0 flex-wrap"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", minWidth: "180px" }}>
          <Search size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
          <input className="bg-transparent text-xs flex-1 outline-none" style={{ color: "rgba(255,255,255,0.6)" }}
            placeholder="搜索文件夹..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          {searchText && <button onClick={() => setSearchText("")}><X size={11} style={{ color: "rgba(255,255,255,0.3)" }} /></button>}
        </div>

        {/* Date filter: start/end */}
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>日期</span>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="px-2 py-1.5 rounded-xl text-xs outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", colorScheme: "dark", width: "120px" }} />
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>至</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="px-2 py-1.5 rounded-xl text-xs outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", colorScheme: "dark", width: "120px" }} />
          {(startDate || endDate) && (
            <button onClick={() => { setStartDate(""); setEndDate(""); }}
              className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10">
              <X size={9} style={{ color: "rgba(255,255,255,0.3)" }} />
            </button>
          )}
        </div>

        {/* Sort */}
        <button onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
          {sortOrder === "desc" ? <ArrowDown size={11} /> : <ArrowUp size={11} />}
          时间{sortOrder === "desc" ? "降序" : "升序"}
        </button>
      </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 pt-6 pb-4">
        {/* ── Group-level view: sub-folders shown directly as cards ── */}
        {currentGroup && (
          <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
            {currentGroup.folders.map((folder) => {
              const coverAsset = folder.assetIds.length > 0 ? getProjectAsset(folder.assetIds[0]) : null;
              return (
                <button key={folder.id}
                  onClick={() => setSel({ section: "project", projectId, groupId: currentGroup.id, folderId: folder.id })}
                  className="rounded-xl overflow-hidden cursor-pointer group text-left transition-transform hover:scale-[1.02]"
                  style={{ background: "#1A1510", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="relative overflow-hidden" style={{ aspectRatio: "1.4" }}>
                    {coverAsset?.src ? (
                      <img src={coverAsset.src} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #231E17, #2A2420)" }}>
                        <Folder size={28} style={{ color: "rgba(255,255,255,0.08)" }} />
                      </div>
                    )}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)" }} />
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                      <Folder size={11} style={{ color: "#E87322" }} />
                      <span className="text-xs text-white font-medium">{folder.name}</span>
                    </div>
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-center"
                      style={{ background: "rgba(0,0,0,0.6)", fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>
                      {folder.assetIds.length}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Project-level view: grouped folder cards ── */}
        {!currentGroup && (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {/* Flat folders */}
          {filteredFlatFolders.map((ff) => {
            const coverAsset = ff.assetIds.length > 0 ? getProjectAsset(ff.assetIds[0]) : null;
            return (
              <div key={ff.id} className="rounded-xl p-4"
                style={{ background: "#1A1510", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Folder size={14} style={{ color: "#E87322" }} />
                  <span className="text-sm font-semibold text-white">{ff.name}</span>
                  <span className="text-xs ml-auto px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>
                    {ff.assetIds.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ff.assetIds.slice(0, 4).map((aid) => {
                    const a = getProjectAsset(aid);
                    if (!a) return null;
                    const TypeIcon = TYPE_ICONS[a.type];
                    return (
                      <button key={aid}
                        onClick={() => setSel({ section: "project", projectId, flatFolderId: ff.id })}
                        className="rounded-lg overflow-hidden cursor-pointer group text-left"
                        style={{ background: "#231E17", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="relative overflow-hidden" style={{ aspectRatio: "1.3" }}>
                          {a.src ? (
                            <img src={a.src} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"
                              style={{ background: "linear-gradient(135deg, #231E17, #2A2420)" }}>
                              <TypeIcon size={20} style={{ color: "rgba(255,255,255,0.1)" }} />
                            </div>
                          )}
                          {a.type !== "image" && (
                            <div className="absolute top-1 left-1 px-1 py-0.5 rounded flex items-center gap-0.5"
                              style={{ background: "rgba(0,0,0,0.6)", fontSize: "8px", color: "rgba(255,255,255,0.7)" }}>
                              <TypeIcon size={7} />{a.type === "video" ? "视频" : a.type === "audio" ? "音频" : "脚本"}
                            </div>
                          )}
                        </div>
                        <div className="px-2 py-1.5">
                          <span className="text-xs text-white truncate block">{a.name}</span>
                        </div>
                      </button>
                    );
                  })}
                  {ff.assetIds.length > 4 && (
                    <button
                      onClick={() => setSel({ section: "project", projectId, flatFolderId: ff.id })}
                      className="rounded-lg overflow-hidden cursor-pointer flex flex-col items-center justify-center text-left"
                      style={{ background: "#231E17", border: "1px solid rgba(255,255,255,0.06)", aspectRatio: "1.3" }}>
                      <span style={{ fontSize: "16px", fontWeight: 600, color: "rgba(255,255,255,0.3)" }}>+{ff.assetIds.length - 4}</span>
                      <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)" }}>更多</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Grouped folders */}
          {displayGroups.map((group) => (
            <div key={group.id} className="rounded-xl p-4"
              style={{ background: "#1A1510", border: "1px solid rgba(255,255,255,0.06)" }}>
              {/* Group header — clickable to enter group view */}
              <button className="flex items-center gap-2 mb-3 w-full group/header"
                onClick={() => setSel({ section: "project", projectId, groupId: group.id })}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.85"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
              >
                <Folder size={14} style={{ color: "#E87322" }} />
                <span className="text-sm font-semibold text-white">{group.name}</span>
                <ChevronRight size={12} className="opacity-0 group-hover/header:opacity-60 transition-opacity flex-shrink-0"
                  style={{ color: "rgba(255,255,255,0.4)" }} />
                <span className="text-xs ml-auto px-1.5 py-0.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>
                  {group.folders.reduce((s, f) => s + f.assetIds.length, 0)}
                </span>
              </button>
              {/* Folder cards */}
              <div className="grid grid-cols-2 gap-2">
                {group.folders.map((folder) => {
                  const coverAsset = folder.assetIds.length > 0 ? getProjectAsset(folder.assetIds[0]) : null;
                  return (
                    <button key={folder.id}
                      onClick={() => setSel({ section: "project", projectId, groupId: group.id })}
                      className="rounded-lg overflow-hidden cursor-pointer group text-left"
                      style={{ background: "#231E17", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="relative overflow-hidden" style={{ aspectRatio: "1.3" }}>
                        {coverAsset?.src ? (
                          <img src={coverAsset.src} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #231E17, #2A2420)" }}>
                            <Folder size={20} style={{ color: "rgba(255,255,255,0.1)" }} />
                          </div>
                        )}
                        <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1"
                          style={{ background: "rgba(0,0,0,0.6)", borderRadius: "4px", padding: "2px 5px" }}>
                          <Folder size={9} style={{ color: "rgba(255,255,255,0.7)" }} />
                        </div>
                        <div className="absolute top-1.5 right-1.5 px-1 py-0.5 rounded text-center"
                          style={{ background: "rgba(0,0,0,0.65)", fontSize: "9px", color: "rgba(255,255,255,0.6)", minWidth: "18px" }}>
                          {folder.assetIds.length}
                        </div>
                      </div>
                      <div className="px-2 py-1.5">
                        <span className="text-xs text-white truncate block">{folder.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            ))}
        </div>
        )}

        {/* Empty state */}
        {currentGroup && currentGroup.folders.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 rounded-2xl mt-4"
            style={{ border: "1px dashed rgba(255,255,255,0.08)" }}>
            <Folder size={32} style={{ color: "rgba(255,255,255,0.1)" }} />
            <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>暂无文件夹</p>
          </div>
        )}
        {!currentGroup && displayGroups.length === 0 && filteredFlatFolders.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 rounded-2xl mt-4"
            style={{ border: "1px dashed rgba(255,255,255,0.08)" }}>
            <Folder size={32} style={{ color: "rgba(255,255,255,0.1)" }} />
            <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>暂无文件夹</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Assets Content (grid/list) ──────────────────────────────────────────────
function AssetsContent({ assets }: { assets: AssetItem[] }) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [typeFilter, setTypeFilter] = useState<AssetType>("all");
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [detailAsset, setDetailAsset] = useState<AssetItem | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [collectedIds, setCollectedIds] = useState<Set<string>>(
    new Set(assets.filter((a) => a.collected).map((a) => a.id))
  );
  // Tabs
  const [assetTab, setAssetTab] = useState<"全部生成" | "历史上传" | "主体资产" | "全部收藏">("全部生成");
  // Date range filter
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // Sort
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Map dateTs to actual dates for range filtering
  // dateTs: 4=today, 3=yesterday, 2=3 days ago, 1=1 week ago
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tsToDate = (ts: number) => {
    const d = new Date(today);
    if (ts === 4) d.setDate(d.getDate());       // today
    else if (ts === 3) d.setDate(d.getDate() - 1); // yesterday
    else if (ts === 2) d.setDate(d.getDate() - 3); // 3 days ago
    else if (ts === 1) d.setDate(d.getDate() - 7); // 1 week ago
    return d;
  };

  const filtered = assets
    .filter((a) => {
      // Tab filter
      if (assetTab === "全部收藏" && !collectedIds.has(a.id)) return false;
      if (assetTab === "历史上传" && a.tab !== "upload") return false;
      if (assetTab === "主体资产" && a.tab !== "subject") return false;
      // Type filter
      if (typeFilter !== "all" && a.type !== typeFilter) return false;
      // Search
      if (searchText && !a.name.toLowerCase().includes(searchText.toLowerCase())) return false;
      // Date range
      if (startDate) {
        const s = new Date(startDate);
        if (tsToDate(a.dateTs) < s) return false;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        if (tsToDate(a.dateTs) > e) return false;
      }
      return true;
    })
    .sort((a, b) => sortOrder === "desc" ? b.dateTs - a.dateTs : a.dateTs - b.dateTs);

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleCollect = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const was = collectedIds.has(id);
    setCollectedIds((prev) => { const n = new Set(prev); was ? n.delete(id) : n.add(id); return n; });
    toast.success(was ? "已取消收藏" : "收藏成功");
  };

  const handleDelete = (id: string) => {
    setCollectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    toast.success("已删除");
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((a) => a.id)));
  };

  // Grid card
  const renderGridCard = (asset: AssetItem) => {
    const TypeIcon = TYPE_ICONS[asset.type];
    const isCollected = collectedIds.has(asset.id);
    const isSelected = selectedIds.has(asset.id);
    return (
      <div key={asset.id}
        className="rounded-xl overflow-hidden cursor-pointer group relative"
        style={{ background: "#1A1510", border: isSelected ? "2px solid #E87322" : "2px solid rgba(255,255,255,0.06)" }}
        onClick={() => { if (batchMode) { toggleSelect(asset.id); return; } setDetailAsset(asset); }}>
        <div className="relative overflow-hidden" style={{ aspectRatio: "1" }}>
          {asset.src ? (
            <img src={asset.src} alt={asset.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center" style={{ background: "#231E17" }}>
              <TypeIcon size={24} style={{ color: "rgba(255,255,255,0.15)" }} />
            </div>
          )}
          {asset.type !== "image" && (
            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded flex items-center gap-1"
              style={{ background: "rgba(0,0,0,0.6)", fontSize: "9px", color: "rgba(255,255,255,0.7)" }}>
              <TypeIcon size={8} />{asset.type === "video" ? "视频" : asset.type === "audio" ? "音频" : "脚本"}
            </div>
          )}
          {batchMode && (
            <div className="absolute top-2 left-2" onClick={(e) => { e.stopPropagation(); toggleSelect(asset.id); }}>
              <div className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{ background: isSelected ? "#E87322" : "rgba(0,0,0,0.5)", border: isSelected ? "none" : "1.5px solid rgba(255,255,255,0.4)" }}>
                {isSelected && <Check size={10} className="text-white" />}
              </div>
            </div>
          )}
          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
            <button className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
              onClick={(e) => { e.stopPropagation(); toggleCollect(asset.id, e); }}>
              <Star size={12} style={{ color: isCollected ? "#E87322" : "white", fill: isCollected ? "#E87322" : "transparent" }} />
            </button>
            <button className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
              onClick={(e) => { e.stopPropagation(); handleDelete(asset.id); }}>
              <Trash2 size={12} style={{ color: "rgba(255,255,255,0.8)" }} />
            </button>
          </div>
        </div>
        <div className="px-2.5 py-2">
          <div className="text-xs text-white truncate">{asset.name}</div>
          <div className="flex items-center justify-between mt-0.5" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>
            <span>{asset.size}</span><span>{asset.date}</span>
          </div>
        </div>
      </div>
    );
  };

  // List row
  const renderListRow = (asset: AssetItem) => {
    const TypeIcon = TYPE_ICONS[asset.type];
    const isSelected = selectedIds.has(asset.id);
    const isCollected = collectedIds.has(asset.id);
    return (
      <div key={asset.id}
        className="grid items-center px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer group"
        style={{ gridTemplateColumns: batchMode ? "28px 28px 1fr 64px 64px 64px" : "28px 1fr 64px 64px 64px", gap: "10px", background: isSelected ? "rgba(232,115,34,0.06)" : "transparent" }}
        onClick={() => { if (batchMode) { toggleSelect(asset.id); return; } setDetailAsset(asset); }}>
        {batchMode && (
          <button onClick={(e) => { e.stopPropagation(); toggleSelect(asset.id); }}>
            <div className="w-4 h-4 rounded flex items-center justify-center"
              style={{ background: isSelected ? "#E87322" : "transparent", border: isSelected ? "none" : "1.5px solid rgba(255,255,255,0.2)" }}>
              {isSelected && <Check size={9} className="text-white" />}
            </div>
          </button>
        )}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "#231E17" }}>
            {asset.src ? <img src={asset.src} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><TypeIcon size={12} style={{ color: "rgba(255,255,255,0.3)" }} /></div>}
          </div>
          <span className="text-xs text-white truncate">{asset.name}</span>
        </div>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{asset.size}</span>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{asset.date}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          <button onClick={(e) => { e.stopPropagation(); toggleCollect(asset.id, e); }} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10">
            <Star size={11} style={{ color: isCollected ? "#E87322" : "rgba(255,255,255,0.35)", fill: isCollected ? "#E87322" : "transparent" }} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleDelete(asset.id); }} className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-900/20">
            <Trash2 size={11} style={{ color: "rgba(255,120,120,0.5)" }} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); toast.success("下载已开始"); }} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10">
            <Download size={11} style={{ color: "rgba(255,255,255,0.35)" }} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "#140F09" }}
      onClick={() => setShowTypeMenu(false)}>

      {/* Tabs */}
      <div className="flex items-end gap-0 px-6 pt-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {(["全部生成", "历史上传", "主体资产", "全部收藏"] as const).map((tab) => (
          <button key={tab} onClick={() => setAssetTab(tab)}
            className="px-4 py-2 text-xs font-medium relative"
            style={{
              color: assetTab === tab ? "#E87322" : "rgba(255,255,255,0.35)",
              borderBottom: assetTab === tab ? "2px solid #E87322" : "2px solid transparent",
              marginBottom: "-1px",
            }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 px-6 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {/* Search */}
        <div className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", minWidth: "180px" }}>
          <Search size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
          <input className="bg-transparent text-xs flex-1 outline-none" style={{ color: "rgba(255,255,255,0.6)" }}
            placeholder="搜索资产..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          {searchText && <button onClick={() => setSearchText("")}><X size={11} style={{ color: "rgba(255,255,255,0.3)" }} /></button>}
        </div>

        {/* Type filter */}
        <div className="relative">
          <button onClick={() => setShowTypeMenu(!showTypeMenu)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
            {TYPE_LABELS[typeFilter]}<ChevronDown size={9} />
          </button>
          {showTypeMenu && (
            <div className="absolute top-full mt-1 left-0 z-20 rounded-xl overflow-hidden shadow-2xl"
              style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)", minWidth: "110px" }}
              onClick={(e) => e.stopPropagation()}>
              {(["all", "image", "video", "audio", "script"] as AssetType[]).map((t) => (
                <button key={t} onClick={() => { setTypeFilter(t); setShowTypeMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left hover:bg-white/5"
                  style={{ color: typeFilter === t ? "#E87322" : "rgba(255,255,255,0.5)" }}>
                  {TYPE_LABELS[t]}{typeFilter === t && <Check size={9} className="ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date filter: start/end */}
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>日期</span>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
            className="px-2 py-1.5 rounded-xl text-xs outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", colorScheme: "dark", width: "120px" }} />
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>至</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
            className="px-2 py-1.5 rounded-xl text-xs outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", colorScheme: "dark", width: "120px" }} />
          {(startDate || endDate) && (
            <button onClick={() => { setStartDate(""); setEndDate(""); }}
              className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10">
              <X size={9} style={{ color: "rgba(255,255,255,0.3)" }} />
            </button>
          )}
        </div>

        {/* Sort */}
        <button onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
          {sortOrder === "desc" ? <ArrowDown size={11} /> : <ArrowUp size={11} />}
          时间{sortOrder === "desc" ? "降序" : "升序"}
        </button>

        {/* Batch */}
        <button onClick={() => setBatchMode(!batchMode)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs"
          style={{
            background: batchMode ? "rgba(232,115,34,0.15)" : "rgba(255,255,255,0.05)",
            border: batchMode ? "1px solid rgba(232,115,34,0.3)" : "1px solid rgba(255,255,255,0.08)",
            color: batchMode ? "#E87322" : "rgba(255,255,255,0.5)",
          }}>
          <Check size={11} />批量
        </button>

        {/* View mode */}
        <div className="flex items-center gap-0 ml-2 rounded-lg overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={() => setViewMode("grid")}
            className="w-8 h-8 flex items-center justify-center"
            style={{ background: viewMode === "grid" ? "rgba(232,115,34,0.15)" : "transparent", color: viewMode === "grid" ? "#E87322" : "rgba(255,255,255,0.4)" }}>
            <Grid3X3 size={13} />
          </button>
          <button onClick={() => setViewMode("list")}
            className="w-8 h-8 flex items-center justify-center"
            style={{ background: viewMode === "list" ? "rgba(232,115,34,0.15)" : "transparent", color: viewMode === "list" ? "#E87322" : "rgba(255,255,255,0.4)" }}>
            <LayoutList size={13} />
          </button>
        </div>
      </div>

      {/* Batch bar */}
      {batchMode && selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-6 py-2.5 flex-shrink-0"
          style={{ background: "rgba(232,115,34,0.08)", borderBottom: "1px solid rgba(232,115,34,0.2)" }}>
          <button onClick={selectAll} className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
            <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: "#E87322" }}><Check size={10} className="text-white" /></div>
            已选 {selectedIds.size} 个
          </button>
          <div className="h-4 w-px" style={{ background: "rgba(255,255,255,0.1)" }} />
          {[
            { label: "收藏", icon: <Star size={11} />, action: () => { setCollectedIds((p) => { const n = new Set(p); selectedIds.forEach((id) => n.add(id)); return n; }); toast.success(`已收藏 ${selectedIds.size} 项`); } },
            { label: "下载", icon: <Download size={11} />, action: () => toast.success("下载已开始") },
          ].map(({ label, icon, action }) => (
            <button key={label} onClick={action} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:bg-white/10"
              style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)" }}>
              {icon}{label}
            </button>
          ))}
          <button onClick={() => { setSelectedIds(new Set()); toast.success("已删除"); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:bg-red-900/20"
            style={{ background: "rgba(255,80,80,0.1)", color: "#ff6b6b" }}>
            <Trash2 size={11} />删除
          </button>
          <button onClick={() => { setSelectedIds(new Set()); setBatchMode(false); }} className="ml-auto" style={{ color: "rgba(255,255,255,0.35)" }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {viewMode === "grid" ? (
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
            {filtered.map((a) => renderGridCard(a))}
            {filtered.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center h-48 rounded-2xl"
                style={{ border: "1px dashed rgba(255,255,255,0.08)" }}>
                <LucideImage size={32} style={{ color: "rgba(255,255,255,0.1)" }} />
                <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>暂无资产</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <div className="grid text-xs px-3 py-2 mb-1"
              style={{ color: "rgba(255,255,255,0.3)", gridTemplateColumns: batchMode ? "28px 28px 1fr 64px 64px 64px" : "28px 1fr 64px 64px 64px", gap: "10px" }}>
              {batchMode && (
                <button onClick={selectAll}>
                  <div className="w-4 h-4 rounded flex items-center justify-center"
                    style={{ border: "1.5px solid rgba(255,255,255,0.2)", background: selectedIds.size === filtered.length && filtered.length > 0 ? "#E87322" : "transparent" }}>
                    {selectedIds.size === filtered.length && filtered.length > 0 && <Check size={9} className="text-white" />}
                  </div>
                </button>
              )}
              <span>文件名</span><span>大小</span><span>日期</span><span>操作</span>
            </div>
            {filtered.map((a) => renderListRow(a))}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48" style={{ color: "rgba(255,255,255,0.25)" }}>
                <LucideImage size={32} style={{ color: "rgba(255,255,255,0.1)" }} />
                <p className="mt-3 text-sm">暂无资产</p>
              </div>
            )}
          </div>
        )}
      </div>

      {detailAsset && <AssetDetailModal asset={detailAsset} onClose={() => setDetailAsset(null)} />}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type SidebarSel =
  | { section: "my" }
  | { section: "project"; projectId: string | "all"; groupId?: string; folderId?: string; flatFolderId?: string }
  | { section: "member"; memberId: string };

const STATUS_COLORS: Record<string, string> = { "进行中": "#E87322", "已完成": "#22c55e", "暂停": "#94a3b8" };

export function GlobalAssetsPage() {
  const { spaceId } = useSpace();
  const [sel, setSel] = useState<SidebarSel>({ section: "my" });

  // Section collapse
  const [sectionOpen, setSectionOpen] = useState<Record<string, boolean>>({
    my: true, project: true, member: false,
  });

  const toggleSection = (key: string) => setSectionOpen((p) => ({ ...p, [key]: !p[key] }));

  // Panel content
  const panelAssets = sel.section === "my"
    ? MY_ASSETS
    : sel.section === "project" && sel.projectId === "all"
      ? Object.values(PROJECT_ASSETS).flat()
      : sel.section === "project" && sel.flatFolderId
        ? (() => {
            const ff = (PROJECT_FLAT_FOLDERS[sel.projectId] ?? []).find(f => f.id === sel.flatFolderId);
            return ff ? ff.assetIds.map(id => getProjectAsset(id)).filter(Boolean) as AssetItem[] : [];
          })()
        : sel.section === "project" && sel.folderId
          ? getFolderAssets(sel.projectId, sel.folderId)
          : sel.section === "project"
            ? PROJECT_ASSETS[sel.projectId] ?? []
            : MEMBER_ASSETS[sel.memberId] ?? [];

  const breadcrumbLabel = sel.section === "my"
    ? "个人资产"
    : sel.section === "member"
      ? MEMBER_DATA.find((m) => m.id === sel.memberId)?.name ?? ""
      : sel.projectId === "all"
        ? "全部项目"
        : sel.flatFolderId
          ? (() => {
              const proj = PROJECTS_DATA.find((p) => p.id === sel.projectId);
              const ff = (PROJECT_FLAT_FOLDERS[sel.projectId] ?? []).find(f => f.id === sel.flatFolderId);
              return ff ? `${proj?.name ?? ""} / ${ff.name}` : proj?.name ?? "";
            })()
          : sel.folderId
            ? (() => {
                const proj = PROJECTS_DATA.find((p) => p.id === sel.projectId);
                const groups = PROJECT_FOLDERS[sel.projectId] ?? [];
                for (const g of groups) {
                  const f = g.folders.find((x) => x.id === sel.folderId);
                  if (f) return `${proj?.name ?? ""} / ${g.name} / ${f.name}`;
                }
                return proj?.name ?? "";
              })()
            : PROJECTS_DATA.find((p) => p.id === sel.projectId)?.name ?? "";

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "#140F09" }}>
      {/* ── Sidebar (hidden in personal space) ── */}
      {spaceId !== "personal" && (
      <div className="flex-shrink-0 flex flex-col overflow-hidden"
        style={{ width: "220px", background: "rgba(16,12,7,0.95)", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex-1 overflow-auto px-3 py-4">

          {/* 个人资产 */}
          <div className="mb-2">
            <button onClick={() => toggleSection("my")}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors"
              style={{ marginBottom: "2px" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(139,92,246,0.15)" }}>
                <LucideImage size={14} style={{ color: "#8B5CF6" }} />
              </div>
              <span className="text-sm font-semibold flex-1 text-left" style={{ color: "rgba(255,255,255,0.85)" }}>个人资产</span>
              <ChevronDown size={13} style={{ transform: sectionOpen.my ? "none" : "rotate(-90deg)", transition: "transform 0.2s", color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
            </button>
            {sectionOpen.my && (
              <div className="ml-2" style={{ borderLeft: "2px solid rgba(139,92,246,0.15)", paddingLeft: "8px" }}>
                <button onClick={() => setSel({ section: "my" })}
                  className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg text-left"
                  style={{ background: sel.section === "my" ? "rgba(139,92,246,0.12)" : "transparent" }}>
                  <span className="text-xs" style={{ color: sel.section === "my" ? "#8B5CF6" : "rgba(255,255,255,0.55)" }}>我的全部</span>
                  <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>{MY_ASSETS.length}</span>
                </button>
              </div>
            )}
          </div>

          <div className="h-px mx-2 my-2" style={{ background: "rgba(255,255,255,0.06)" }} />

          {/* 共享资产 */}
          <div className="mb-2">
            <button onClick={() => toggleSection("project")}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors"
              style={{ marginBottom: "2px" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(232,115,34,0.15)" }}>
                <Layers size={14} style={{ color: "#E87322" }} />
              </div>
              <span className="text-sm font-semibold flex-1 text-left" style={{ color: "rgba(255,255,255,0.85)" }}>共享资产</span>
              <ChevronDown size={13} style={{ transform: sectionOpen.project ? "none" : "rotate(-90deg)", transition: "transform 0.2s", color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
            </button>
            {sectionOpen.project && (
              <div className="ml-2" style={{ borderLeft: "2px solid rgba(232,115,34,0.15)", paddingLeft: "8px" }}>
                <button onClick={() => setSel({ section: "project", projectId: "all" })}
                  className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg text-left"
                  style={{ background: sel.section === "project" && sel.projectId === "all" ? "rgba(232,115,34,0.12)" : "transparent" }}>
                  <span className="text-xs" style={{ color: sel.section === "project" && sel.projectId === "all" ? "#E87322" : "rgba(255,255,255,0.55)" }}>全部项目</span>
                  <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>{Object.values(PROJECT_ASSETS).flat().length}</span>
                </button>
                {PROJECTS_DATA.map((project) => {
                  const count = (PROJECT_ASSETS[project.id] ?? []).length;
                  const isActive = sel.section === "project" && sel.projectId === project.id;
                  return (
                    <button key={project.id} onClick={() => setSel({ section: "project", projectId: project.id })}
                      className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-left"
                      style={{ background: isActive ? "rgba(232,115,34,0.10)" : "transparent" }}>
                      <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0">
                        <img src={project.cover} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs truncate flex-1" style={{ color: isActive ? "#E87322" : "rgba(255,255,255,0.5)" }}>{project.name}</span>
                      <span className="text-xs flex-shrink-0 px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.25)" }}>{count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="h-px mx-2 my-2" style={{ background: "rgba(255,255,255,0.06)" }} />

          {/* 成员资产 — hidden in 未来创意 (ent2) */}
          {spaceId !== "ent2" && (
          <div className="mb-2">
            <button onClick={() => toggleSection("member")}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors"
              style={{ marginBottom: "2px" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(34,197,94,0.15)" }}>
                <User size={14} style={{ color: "#22C55E" }} />
              </div>
              <span className="text-sm font-semibold flex-1 text-left" style={{ color: "rgba(255,255,255,0.85)" }}>成员资产</span>
              <ChevronDown size={13} style={{ transform: sectionOpen.member ? "none" : "rotate(-90deg)", transition: "transform 0.2s", color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
            </button>
            {sectionOpen.member && (
              <div className="ml-2" style={{ borderLeft: "2px solid rgba(34,197,94,0.15)", paddingLeft: "8px" }}>
                {MEMBER_DATA.map((member) => {
                  const isActive = sel.section === "member" && sel.memberId === member.id;
                  const count = (MEMBER_ASSETS[member.id] ?? []).length;
                  return (
                    <button key={member.id} onClick={() => setSel({ section: "member", memberId: member.id })}
                      className="flex items-center gap-2.5 w-full px-2 py-1.5 rounded-lg text-left"
                      style={{ background: isActive ? "rgba(34,197,94,0.10)" : "transparent" }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: member.avatarColor, fontSize: "8px", fontWeight: 600, color: "white" }}>
                        {member.letter}
                      </div>
                      <span className="text-xs truncate flex-1" style={{ color: isActive ? "#22C55E" : "rgba(255,255,255,0.5)" }}>{member.name}</span>
                      <span className="text-xs flex-shrink-0 px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.25)" }}>{count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          )}

        </div>
      </div>
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 px-6 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          {sel.section === "project" && sel.projectId !== "all" ? (
            (() => {
              const proj = PROJECTS_DATA.find((p) => p.id === sel.projectId);
              const groups = PROJECT_FOLDERS[sel.projectId] ?? [];
              const group = groups.find(g => g.id === sel.groupId);
              const folder = group?.folders.find(f => f.id === sel.folderId);
              const ff = (PROJECT_FLAT_FOLDERS[sel.projectId] ?? []).find(f => f.id === sel.flatFolderId);

              // Back arrow: when inside a group or folder
              const hasBack = !!(group || ff);

              return (
                <div className="flex items-center gap-2">
                  {hasBack && (
                    <button
                      onClick={() => setSel({ section: "project", projectId: sel.projectId })}
                      className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors hover:bg-white/10"
                      title="返回上一级"
                    >
                      <ArrowLeft size={14} style={{ color: "rgba(255,255,255,0.5)" }} />
                    </button>
                  )}
                  {/* Project name */}
                  <button
                    onClick={() => setSel({ section: "project", projectId: sel.projectId })}
                    className="text-xs transition-colors"
                    style={{
                      color: "rgba(255,255,255,0.55)",
                      background: "none",
                      border: "none",
                      padding: 0,
                      paddingBottom: "2px",
                      borderBottom: "1px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = "#E87322";
                      (e.currentTarget as HTMLButtonElement).style.borderBottomColor = "rgba(232,115,34,0.4)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.55)";
                      (e.currentTarget as HTMLButtonElement).style.borderBottomColor = "transparent";
                    }}
                  >
                    {proj?.name ?? ""}
                  </button>
                  {/* Group level */}
                  {group && !sel.flatFolderId && (
                    <>
                      <ChevronRight size={12} style={{ color: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                      {folder ? (
                        <button
                          onClick={() => setSel({ section: "project", projectId: sel.projectId })}
                          className="text-xs transition-colors"
                          style={{
                            color: "rgba(255,255,255,0.55)",
                            background: "none",
                            border: "none",
                            padding: 0,
                            paddingBottom: "2px",
                            borderBottom: "1px solid transparent",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = "#E87322";
                            (e.currentTarget as HTMLButtonElement).style.borderBottomColor = "rgba(232,115,34,0.4)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.55)";
                            (e.currentTarget as HTMLButtonElement).style.borderBottomColor = "transparent";
                          }}
                        >
                          {group.name}
                        </button>
                      ) : (
                        <span className="text-xs font-medium" style={{ color: "#E87322" }}>{group.name}</span>
                      )}
                    </>
                  )}
                  {/* Current folder */}
                  {folder && (
                    <>
                      <ChevronRight size={12} style={{ color: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                      <span className="text-xs font-medium" style={{ color: "#E87322" }}>{folder.name}</span>
                    </>
                  )}
                  {/* Flat folder */}
                  {ff && (
                    <>
                      <ChevronRight size={12} style={{ color: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                      <span className="text-xs font-medium" style={{ color: "#E87322" }}>{ff.name}</span>
                    </>
                  )}
                </div>
              );
            })()
          ) : sel.projectId === "all"
            ? <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>全部项目</span>
            : sel.section === "member"
              ? <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>{MEMBER_DATA.find((m) => m.id === sel.memberId)?.name ?? ""}</span>
              : <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>个人资产</span>}
        </div>
        <div className="flex-1 overflow-hidden">
          {sel.section === "project" && sel.projectId !== "all" && !sel.folderId && !sel.flatFolderId ? (
            <ProjectFolderView key={sel.projectId + (sel.groupId ?? "")} projectId={sel.projectId} groupId={sel.groupId} setSel={setSel} />
          ) : (
            <AssetsContent key={JSON.stringify(sel)} assets={panelAssets} />
          )}
        </div>
      </div>
    </div>
  );
}
