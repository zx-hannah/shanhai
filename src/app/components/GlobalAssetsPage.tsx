import { useState } from "react";
import {
  Image,
  Video,
  Music,
  Download,
  Star,
  Trash2,
  Check,
  Search,
  ChevronDown,
  X,
  Grid3X3,
  LayoutList,
  MoreHorizontal,
  FolderPlus,
  Folder,
  FolderOpen,
  ArrowUp,
  ArrowDown,
  Pencil,
  Move,
  ChevronRight,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { PROJECTS_DATA } from "../data/projectsData";

// ─── Types ────────────────────────────────────────────────────────────────────
type AssetTab = "generate" | "upload" | "subject" | "collect";
type AssetType = "all" | "image" | "video" | "audio";
type SortOrder = "desc" | "asc";

interface AssetItem {
  id: string;
  name: string;
  type: "image" | "video" | "audio";
  src: string | null;
  size: string;
  date: string;
  dateTs: number;
  collected: boolean;
  tab: string;
  folderId?: string;
  projectId?: string;
}

interface FolderItem {
  id: string;
  name: string;
  tab: AssetTab;
}

// ─── My Assets Data ───────────────────────────────────────────────────────────
const MY_ASSETS: AssetItem[] = [
  { id: "m1", name: "白发女侠_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=400&q=80", size: "2.3 MB", date: "今天", dateTs: 4, collected: true, tab: "generate", folderId: "mf1" },
  { id: "m2", name: "古城背景_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=400&q=80", size: "1.8 MB", date: "今天", dateTs: 4, collected: false, tab: "generate", folderId: "mf2" },
  { id: "m3", name: "山林场景_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=400&q=80", size: "3.1 MB", date: "今天", dateTs: 4, collected: true, tab: "generate" },
  { id: "m4", name: "道具宝剑_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=400&q=80", size: "0.9 MB", date: "今天", dateTs: 4, collected: false, tab: "generate" },
  { id: "m5", name: "主角设定_v3.jpg", type: "image", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=400&q=80", size: "2.7 MB", date: "今天", dateTs: 4, collected: false, tab: "generate", folderId: "mf1" },
  { id: "m6", name: "云雾山脉背景.jpg", type: "image", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=400&q=80", size: "4.2 MB", date: "今天", dateTs: 4, collected: true, tab: "generate" },
  { id: "m7", name: "人物参考_古装.jpg", type: "image", src: "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?w=400&q=80", size: "1.5 MB", date: "昨天", dateTs: 3, collected: false, tab: "upload" },
  { id: "m8", name: "角色立绘参考.jpg", type: "image", src: "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?w=400&q=80", size: "2.1 MB", date: "昨天", dateTs: 3, collected: true, tab: "upload" },
  { id: "m9", name: "战场BGM.mp3", type: "audio", src: null, size: "4.2 MB", date: "3天前", dateTs: 2, collected: false, tab: "upload" },
  { id: "m10", name: "角色出场动效.mp4", type: "video", src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?w=400&q=80", size: "12 MB", date: "3天前", dateTs: 2, collected: false, tab: "generate" },
  { id: "m11", name: "片头动画.mp4", type: "video", src: "https://images.unsplash.com/photo-1748838602679-32d82ccf188e?w=400&q=80", size: "28 MB", date: "一周前", dateTs: 1, collected: true, tab: "generate", folderId: "mf2" },
];

const MY_FOLDERS: FolderItem[] = [
  { id: "mf1", name: "角色设定", tab: "generate" },
  { id: "mf2", name: "场景背景", tab: "generate" },
];

// ─── Project Assets Data ──────────────────────────────────────────────────────
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
    { id: "p5-2", name: "史���场景.jpg", type: "image", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=400&q=80", size: "4.5 MB", date: "今天", dateTs: 4, collected: false, tab: "generate", projectId: "5" },
    { id: "p5-3", name: "龙族圣地背景.jpg", type: "image", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=400&q=80", size: "3.7 MB", date: "昨天", dateTs: 3, collected: true, tab: "upload", projectId: "5" },
    { id: "p5-4", name: "战斗音效.mp3", type: "audio", src: null, size: "2.4 MB", date: "3天前", dateTs: 2, collected: false, tab: "upload", projectId: "5" },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TAB_LABELS: { key: AssetTab; label: string }[] = [
  { key: "generate", label: "全部生成" },
  { key: "upload", label: "历史上传" },
  { key: "subject", label: "主体资产" },
  { key: "collect", label: "全部收藏" },
];

const TYPE_ICONS = { image: Image, video: Video, audio: Music };

interface DateRange { start: string; end: string; }

// ─── Date Range Picker ────────────────────────────────────────────────────────
function DateRangePicker({ value, onChange, onClose }: {
  value: { preset: string; custom: DateRange };
  onChange: (v: { preset: string; custom: DateRange }) => void;
  onClose: () => void;
}) {
  const presets = [
    { key: "all", label: "日期筛选" },
    { key: "today", label: "今天" },
    { key: "week", label: "最近7天" },
    { key: "month", label: "最近30天" },
    { key: "custom", label: "自定义范围" },
  ];
  return (
    <div className="absolute top-full mt-1 left-0 z-20 rounded-xl overflow-hidden"
      style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.6)", width: "260px" }}>
      {presets.map((p) => (
        <button key={p.key} onClick={() => { onChange({ ...value, preset: p.key }); if (p.key !== "custom") onClose(); }}
          className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-left hover:bg-white/5"
          style={{ color: value.preset === p.key ? "#E87322" : "rgba(255,255,255,0.6)" }}>
          {p.label}
          {value.preset === p.key && <Check size={10} />}
        </button>
      ))}
      {value.preset === "custom" && (
        <div className="px-4 pb-3 pt-1 flex flex-col gap-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {["start", "end"].map((k) => (
            <div key={k} className="flex flex-col gap-1">
              <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>{k === "start" ? "开始日期" : "结束日期"}</label>
              <input type="date" className="bg-transparent text-xs rounded-md px-2 py-1.5 outline-none"
                style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", colorScheme: "dark" }}
                value={value.custom[k as keyof DateRange]}
                onChange={(e) => onChange({ ...value, custom: { ...value.custom, [k]: e.target.value } })} />
            </div>
          ))}
          <button onClick={onClose} className="w-full py-1.5 rounded-lg text-xs" style={{ background: "#E87322", color: "white" }}>确认</button>
        </div>
      )}
    </div>
  );
}

// ─── Asset Detail Modal ───────────────────────────────────────────────────────
function AssetDetailModal({ asset, onClose }: { asset: AssetItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.82)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative flex flex-col rounded-2xl overflow-hidden"
        style={{ background: "#1A1510", border: "1px solid rgba(255,255,255,0.1)", width: "720px", maxHeight: "85vh" }}>
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-sm text-white">{asset.name}</span>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10">
            <X size={15} style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6 flex gap-6">
          <div className="flex-1 rounded-xl overflow-hidden flex items-center justify-center" style={{ background: "#140F09", minHeight: "340px" }}>
            {asset.src ? (
              <img src={asset.src} alt={asset.name} className="max-w-full max-h-full object-contain" style={{ maxHeight: "380px" }} />
            ) : (
              <div className="flex flex-col items-center gap-3" style={{ color: "rgba(255,255,255,0.2)" }}>
                <Music size={48} /><span className="text-sm">音频文件</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4" style={{ width: "180px", flexShrink: 0 }}>
            {[["类型", asset.type === "image" ? "图片" : asset.type === "video" ? "视频" : "音频"], ["大小", asset.size], ["日期", asset.date]].map(([k, v]) => (
              <div key={k}>
                <div className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>{k}</div>
                <div className="text-sm text-white">{v}</div>
              </div>
            ))}
            <div className="flex flex-col gap-2 mt-auto">
              <button className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs hover:opacity-80"
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

// ─── Assets Panel (core panel, reused for both tabs) ─────────────────────────
function AssetsPanel({
  initialAssets,
  initialFolders,
  hideTabBar = false,
  initialTab = "generate",
  hideFolderCreate = false,
}: {
  initialAssets: AssetItem[];
  initialFolders: FolderItem[];
  hideTabBar?: boolean;
  initialTab?: AssetTab;
  hideFolderCreate?: boolean;
}) {
  const [activeTab, setActiveTab] = useState<AssetTab>(initialTab);
  const [typeFilter, setTypeFilter] = useState<AssetType>("all");
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [collectedIds, setCollectedIds] = useState<Set<string>>(
    new Set(initialAssets.filter((a) => a.collected).map((a) => a.id))
  );
  const [assets, setAssets] = useState<AssetItem[]>(initialAssets);
  const [searchText, setSearchText] = useState("");
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [dateFilter, setDateFilter] = useState({ preset: "all", custom: { start: "", end: "" } });
  const [detailAsset, setDetailAsset] = useState<AssetItem | null>(null);
  const [moreMenuId, setMoreMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [folders, setFolders] = useState<FolderItem[]>(initialFolders);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [showAddToFolder, setShowAddToFolder] = useState(false);
  const [showCollectedOnly, setShowCollectedOnly] = useState(false);

  const TYPE_LABELS: Record<AssetType, string> = { all: "全部类型", image: "图片", video: "视频", audio: "音频" };

  const getDateLabel = () => {
    const labels: Record<string, string> = { today: "今天", week: "最近7天", month: "最近30天", custom: "自定义范围" };
    return labels[dateFilter.preset] ?? "日期筛选";
  };

  const filteredAssets = assets
    .filter((a) => {
      if (activeTab === "collect") return collectedIds.has(a.id);
      if (activeTab !== "subject" && a.tab !== activeTab) return false;
      if (activeFolderId && a.folderId !== activeFolderId) return false;
      if (typeFilter !== "all" && a.type !== typeFilter) return false;
      if (showCollectedOnly && !collectedIds.has(a.id)) return false;
      if (dateFilter.preset === "today" && a.dateTs < 4) return false;
      if (dateFilter.preset === "week" && a.dateTs < 2) return false;
      if (searchText && !a.name.toLowerCase().includes(searchText.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => sortOrder === "desc" ? b.dateTs - a.dateTs : a.dateTs - b.dateTs);

  const tabFolders = folders.filter((f) => f.tab === activeTab);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const toggleCollect = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const was = collectedIds.has(id);
    setCollectedIds((prev) => { const n = new Set(prev); was ? n.delete(id) : n.add(id); return n; });
    toast.success(was ? "已取消收藏" : "收藏成功 ⭐");
  };

  const handleDelete = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    setMoreMenuId(null);
    toast.success("已删除");
  };

  const handleRename = (id: string) => {
    const asset = assets.find((a) => a.id === id);
    if (asset) { setRenamingId(id); setRenameValue(asset.name); setMoreMenuId(null); }
  };

  const confirmRename = (id: string) => {
    if (renameValue.trim()) setAssets((prev) => prev.map((a) => a.id === id ? { ...a, name: renameValue.trim() } : a));
    setRenamingId(null);
  };

  const createFolder = (name?: string) => {
    const folderName = name ?? `新文件夹 ${tabFolders.length + 1}`;
    const f: FolderItem = { id: `f${Date.now()}`, name: folderName, tab: activeTab };
    setFolders((prev) => [...prev, f]);
    toast.success(`文件夹「${folderName}」已创建`);
  };

  const moveToFolder = (folderId: string) => {
    setAssets((prev) => prev.map((a) => selectedIds.has(a.id) ? { ...a, folderId } : a));
    const f = folders.find((f) => f.id === folderId);
    toast.success(`已移入「${f?.name}」`);
    setSelectedIds(new Set());
    setShowAddToFolder(false);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredAssets.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredAssets.map((a) => a.id)));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "#140F09" }}
      onClick={() => { setMoreMenuId(null); setShowTypeMenu(false); setShowDateMenu(false); }}>

      {/* Tab Bar */}
      {!hideTabBar && (
        <div className="flex items-center gap-1 px-6 pt-5 pb-0 flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {TAB_LABELS.map((tab) => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSelectedIds(new Set()); setBatchMode(false); setActiveFolderId(null); }}
              className="px-4 py-2.5 text-sm transition-colors relative"
              style={{ color: activeTab === tab.key ? "#E87322" : "rgba(255,255,255,0.45)", borderBottom: activeTab === tab.key ? "2px solid #E87322" : "2px solid transparent", marginBottom: "-1px" }}>
              {tab.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1 pb-2">
            {[{ mode: "grid" as const, Icon: Grid3X3 }, { mode: "list" as const, Icon: LayoutList }].map(({ mode, Icon }) => (
              <button key={mode} onClick={() => setViewMode(mode)} className="w-7 h-7 rounded flex items-center justify-center"
                style={{ background: viewMode === mode ? "rgba(255,255,255,0.1)" : "transparent", color: viewMode === mode ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)" }}>
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center gap-2 px-6 py-3 flex-shrink-0 border-b flex-wrap" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        {/* Search */}
        <div className="flex items-center gap-2 rounded-lg px-3 py-1.5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", minWidth: "150px" }}>
          <Search size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
          <input className="bg-transparent text-xs flex-1 outline-none" style={{ color: "rgba(255,255,255,0.7)", caretColor: "#E87322" }}
            placeholder="搜索资产..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          {searchText && <button onClick={(e) => { e.stopPropagation(); setSearchText(""); }}><X size={11} style={{ color: "rgba(255,255,255,0.3)" }} /></button>}
        </div>

        {/* Type Filter */}
        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); setShowTypeMenu(!showTypeMenu); setShowDateMenu(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: typeFilter !== "all" ? "rgba(232,115,34,0.15)" : "rgba(255,255,255,0.05)", color: typeFilter !== "all" ? "#E87322" : "rgba(255,255,255,0.45)", border: typeFilter !== "all" ? "1px solid rgba(232,115,34,0.3)" : "1px solid rgba(255,255,255,0.07)" }}>
            {typeFilter === "image" && <Image size={10} />}{typeFilter === "video" && <Video size={10} />}{typeFilter === "audio" && <Music size={10} />}
            {TYPE_LABELS[typeFilter]}<ChevronDown size={9} />
          </button>
          {showTypeMenu && (
            <div className="absolute top-full mt-1 left-0 z-20 rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}
              style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.6)", minWidth: "130px" }}>
              {(["all", "image", "video", "audio"] as AssetType[]).map((t) => (
                <button key={t} onClick={() => { setTypeFilter(t); setShowTypeMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left hover:bg-white/5"
                  style={{ color: typeFilter === t ? "#E87322" : "rgba(255,255,255,0.6)" }}>
                  {t === "image" && <Image size={10} />}{t === "video" && <Video size={10} />}{t === "audio" && <Music size={10} />}
                  {TYPE_LABELS[t]}{typeFilter === t && <Check size={9} className="ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date Filter */}
        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); setShowDateMenu(!showDateMenu); setShowTypeMenu(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: dateFilter.preset !== "all" ? "rgba(232,115,34,0.15)" : "rgba(255,255,255,0.05)", color: dateFilter.preset !== "all" ? "#E87322" : "rgba(255,255,255,0.45)", border: dateFilter.preset !== "all" ? "1px solid rgba(232,115,34,0.3)" : "1px solid rgba(255,255,255,0.07)" }}>
            {getDateLabel()}<ChevronDown size={9} />
          </button>
          {showDateMenu && (
            <><div className="fixed inset-0 z-10" onClick={() => setShowDateMenu(false)} />
              <div className="z-20" onClick={(e) => e.stopPropagation()}>
                <DateRangePicker value={dateFilter} onChange={setDateFilter} onClose={() => setShowDateMenu(false)} />
              </div></>
          )}
        </div>

        {/* Sort */}
        <button onClick={() => setSortOrder((o) => o === "desc" ? "asc" : "desc")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {sortOrder === "desc" ? <ArrowDown size={10} /> : <ArrowUp size={10} />}
          {sortOrder === "desc" ? "时间降序" : "时间升序"}
        </button>

        {/* Collected filter */}
        {(activeTab === "generate" || activeTab === "upload") && (
          <button onClick={() => setShowCollectedOnly(!showCollectedOnly)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: showCollectedOnly ? "rgba(232,115,34,0.15)" : "rgba(255,255,255,0.05)", color: showCollectedOnly ? "#E87322" : "rgba(255,255,255,0.45)", border: showCollectedOnly ? "1px solid rgba(232,115,34,0.3)" : "1px solid rgba(255,255,255,0.07)" }}>
            <Star size={10} style={{ fill: showCollectedOnly ? "#E87322" : "transparent" }} />已收藏
          </button>
        )}

        {/* New Folder */}
        {!hideFolderCreate && (
          <button onClick={() => createFolder()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:opacity-80 transition-opacity"
            style={{ background: "rgba(232,115,34,0.1)", color: "#E87322", border: "1px solid rgba(232,115,34,0.2)" }}>
            <FolderPlus size={11} />新建文件夹
          </button>
        )}

        {/* Batch mode */}
        <button onClick={() => { setBatchMode(!batchMode); if (batchMode) setSelectedIds(new Set()); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
          style={{ background: batchMode ? "rgba(232,115,34,0.15)" : "rgba(255,255,255,0.05)", color: batchMode ? "#E87322" : "rgba(255,255,255,0.45)", border: batchMode ? "1px solid rgba(232,115,34,0.3)" : "1px solid transparent" }}>
          <Check size={11} />批量
        </button>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
            {filteredAssets.length + (activeFolderId ? 0 : tabFolders.length)} 项
          </span>
          {hideTabBar && (
            <div className="flex items-center gap-0.5">
              {[{ mode: "grid" as const, Icon: Grid3X3 }, { mode: "list" as const, Icon: LayoutList }].map(({ mode, Icon }) => (
                <button key={mode} onClick={() => setViewMode(mode)} className="w-7 h-7 rounded flex items-center justify-center"
                  style={{ background: viewMode === mode ? "rgba(255,255,255,0.1)" : "transparent", color: viewMode === mode ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)" }}>
                  <Icon size={14} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      {activeFolderId && (
        <div className="flex items-center gap-2 px-6 py-2 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <button onClick={() => setActiveFolderId(null)} className="text-xs hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
            {TAB_LABELS.find((t) => t.key === activeTab)?.label}
          </button>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>{folders.find((f) => f.id === activeFolderId)?.name}</span>
        </div>
      )}

      {/* Batch Bar */}
      {batchMode && selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-6 py-2.5 flex-shrink-0"
          style={{ background: "rgba(232,115,34,0.08)", borderBottom: "1px solid rgba(232,115,34,0.2)" }}>
          <button onClick={selectAll} className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
            <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: "#E87322" }}>
              <Check size={10} className="text-white" />
            </div>
            已选 {selectedIds.size} 个
          </button>
          <div className="h-4 w-px" style={{ background: "rgba(255,255,255,0.1)" }} />
          {[
            { label: "收藏", icon: <Star size={11} />, action: () => { setCollectedIds((p) => { const n = new Set(p); selectedIds.forEach((id) => n.add(id)); return n; }); toast.success(`已收藏 ${selectedIds.size} 项`); setSelectedIds(new Set()); } },
            { label: "下载", icon: <Download size={11} />, action: () => toast.success("下载已开始") },
            { label: "移入文件夹", icon: <Move size={11} />, action: () => setShowAddToFolder(true) },
          ].map(({ label, icon, action }) => (
            <button key={label} onClick={action} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:bg-white/10"
              style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)" }}>
              {icon}{label}
            </button>
          ))}
          <button onClick={() => { setAssets((p) => p.filter((a) => !selectedIds.has(a.id))); setSelectedIds(new Set()); toast.success("已删除"); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: "rgba(255,80,80,0.1)", color: "#ff6b6b" }}>
            <Trash2 size={11} />删除
          </button>
          <button onClick={() => { setSelectedIds(new Set()); setBatchMode(false); }} className="ml-auto" style={{ color: "rgba(255,255,255,0.35)" }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Move-to-folder modal */}
      {showAddToFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => e.target === e.currentTarget && setShowAddToFolder(false)}>
          <div className="rounded-2xl overflow-hidden flex flex-col" style={{ background: "#1A1510", border: "1px solid rgba(255,255,255,0.1)", width: "320px", maxHeight: "400px", boxShadow: "0 16px 60px rgba(0,0,0,0.7)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <span className="text-sm text-white">移入文件夹</span>
              <button onClick={() => setShowAddToFolder(false)}><X size={14} style={{ color: "rgba(255,255,255,0.4)" }} /></button>
            </div>
            <div className="flex-1 overflow-auto p-3">
              {tabFolders.map((f) => (
                <button key={f.id} onClick={() => moveToFolder(f.id)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-white/5">
                  <Folder size={16} style={{ color: "#E87322" }} />
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>{f.name}</span>
                </button>
              ))}
              <button onClick={() => createFolder()} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-white/5 border-t mt-2 pt-3"
                style={{ borderColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>
                <FolderPlus size={16} /><span className="text-sm">新建文件夹</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Grid / List */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {viewMode === "grid" ? (
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
            {/* Folders */}
            {!activeFolderId && tabFolders.map((folder) => {
              const count = assets.filter((a) => a.folderId === folder.id && a.tab === activeTab).length;
              return (
                <div key={folder.id} className="rounded-xl overflow-hidden cursor-pointer group"
                  style={{ background: "#1A1510", border: dragOverFolder === folder.id ? "2px solid #E87322" : "2px solid rgba(255,255,255,0.06)" }}
                  onClick={() => setActiveFolderId(folder.id)}
                  onDragOver={(e) => { e.preventDefault(); setDragOverFolder(folder.id); }}
                  onDragLeave={() => setDragOverFolder(null)}
                  onDrop={() => { if (dragId) { setAssets((p) => p.map((a) => a.id === dragId ? { ...a, folderId: folder.id } : a)); toast.success(`已移入「${folder.name}」`); setDragId(null); } setDragOverFolder(null); }}>
                  <div className="flex flex-col items-center justify-center gap-2 py-7" style={{ aspectRatio: "1", background: "rgba(232,115,34,0.04)" }}>
                    {dragOverFolder === folder.id ? <FolderOpen size={36} style={{ color: "#E87322" }} /> : <Folder size={36} style={{ color: "#E87322", opacity: 0.7 }} />}
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{count} 个文件</span>
                  </div>
                  <div className="px-2.5 py-2">
                    <div className="text-xs text-white truncate">{folder.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>文件夹</div>
                  </div>
                </div>
              );
            })}

            {/* Asset Cards */}
            {filteredAssets.map((asset) => {
              const isSelected = selectedIds.has(asset.id);
              const isCollected = collectedIds.has(asset.id);
              const TypeIcon = TYPE_ICONS[asset.type];
              const isRenaming = renamingId === asset.id;
              const showMore = moreMenuId === asset.id;
              return (
                <div key={asset.id} className="rounded-xl overflow-hidden cursor-pointer group relative"
                  style={{ background: "#1A1510", border: isSelected ? "2px solid #E87322" : "2px solid rgba(255,255,255,0.06)", transition: "border-color 0.15s" }}
                  draggable={!batchMode} onDragStart={() => setDragId(asset.id)} onDragEnd={() => setDragId(null)}
                  onClick={(e) => { if (batchMode) { toggleSelect(asset.id); return; } if (!isRenaming && !showMore) setDetailAsset(asset); }}>
                  <div className="relative overflow-hidden" style={{ aspectRatio: "1" }}>
                    {asset.src ? (
                      <img src={asset.src} alt={asset.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center" style={{ background: "#231E17" }}>
                        <TypeIcon size={28} style={{ color: "rgba(255,255,255,0.2)" }} />
                      </div>
                    )}
                    {asset.type !== "image" && (
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded flex items-center gap-1"
                        style={{ background: "rgba(0,0,0,0.6)", fontSize: "9px", color: "rgba(255,255,255,0.7)" }}>
                        <TypeIcon size={8} />{asset.type === "video" ? "视频" : "音频"}
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
                      <button className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
                        onClick={(e) => { e.stopPropagation(); toggleCollect(asset.id, e); }}>
                        <Star size={12} style={{ color: isCollected ? "#E87322" : "white", fill: isCollected ? "#E87322" : "transparent" }} />
                      </button>
                      <div className="relative">
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
                          onClick={(e) => { e.stopPropagation(); setMoreMenuId(showMore ? null : asset.id); }}>
                          <MoreHorizontal size={12} className="text-white" />
                        </button>
                        {showMore && (
                          <div className="absolute right-0 top-full mt-1 z-30 rounded-xl overflow-hidden" onClick={(e) => e.stopPropagation()}
                            style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.7)", minWidth: "130px" }}>
                            <button onClick={() => { toast.success("下载已开始"); setMoreMenuId(null); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left hover:bg-white/5" style={{ color: "rgba(255,255,255,0.7)" }}>
                              <Download size={11} />下载
                            </button>
                            <button onClick={() => handleRename(asset.id)}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left hover:bg-white/5" style={{ color: "rgba(255,255,255,0.7)" }}>
                              <Pencil size={11} />重命名
                            </button>
                            <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
                            <button onClick={() => handleDelete(asset.id)}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left hover:bg-red-900/20" style={{ color: "#ff6b6b" }}>
                              <Trash2 size={11} />删除
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="px-2.5 py-2">
                    {isRenaming ? (
                      <input autoFocus className="w-full bg-transparent text-xs outline-none px-1 py-0.5 rounded"
                        style={{ border: "1px solid rgba(232,115,34,0.5)", color: "rgba(255,255,255,0.8)", caretColor: "#E87322" }}
                        value={renameValue} onChange={(e) => setRenameValue(e.target.value)} onClick={(e) => e.stopPropagation()}
                        onBlur={() => confirmRename(asset.id)} onKeyDown={(e) => { if (e.key === "Enter") confirmRename(asset.id); if (e.key === "Escape") setRenamingId(null); }} />
                    ) : (
                      <div className="text-xs text-white truncate">{asset.name}</div>
                    )}
                    <div className="flex items-center justify-between mt-1" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>
                      <span>{asset.size}</span><span>{asset.date}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty state */}
            {filteredAssets.length === 0 && tabFolders.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center h-48 rounded-2xl" style={{ border: "1px dashed rgba(255,255,255,0.08)" }}>
                <Image size={32} style={{ color: "rgba(255,255,255,0.1)" }} />
                <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {activeTab === "subject" ? "暂无主体资产" : "暂无内容"}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* List View */
          <div className="flex flex-col gap-1">
            <div className="grid text-xs px-3 py-2 mb-1" style={{ color: "rgba(255,255,255,0.3)", gridTemplateColumns: "32px 1fr 80px 80px 80px 80px", gap: "12px" }}>
              <button onClick={selectAll}>
                <div className="w-4 h-4 rounded flex items-center justify-center"
                  style={{ border: "1.5px solid rgba(255,255,255,0.2)", background: selectedIds.size === filteredAssets.length && filteredAssets.length > 0 ? "#E87322" : "transparent" }}>
                  {selectedIds.size === filteredAssets.length && filteredAssets.length > 0 && <Check size={9} className="text-white" />}
                </div>
              </button>
              <span>文件名</span><span>类型</span><span>大小</span><span>日期</span><span>操作</span>
            </div>
            {filteredAssets.map((asset) => {
              const isSelected = selectedIds.has(asset.id);
              const isCollected = collectedIds.has(asset.id);
              const TypeIcon = TYPE_ICONS[asset.type];
              return (
                <div key={asset.id} className="grid items-center px-3 py-2 rounded-lg hover:bg-white/5 group cursor-pointer"
                  style={{ gridTemplateColumns: "32px 1fr 80px 80px 80px 80px", gap: "12px", background: isSelected ? "rgba(232,115,34,0.06)" : "transparent", border: isSelected ? "1px solid rgba(232,115,34,0.2)" : "1px solid transparent" }}
                  onClick={() => setDetailAsset(asset)}>
                  <button onClick={(e) => { e.stopPropagation(); toggleSelect(asset.id); }}>
                    <div className="w-4 h-4 rounded flex items-center justify-center"
                      style={{ background: isSelected ? "#E87322" : "transparent", border: isSelected ? "none" : "1.5px solid rgba(255,255,255,0.2)" }}>
                      {isSelected && <Check size={9} className="text-white" />}
                    </div>
                  </button>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 flex items-center justify-center"
                      style={{ background: "#231E17" }}>
                      {asset.src ? <img src={asset.src} alt="" className="w-full h-full object-cover" /> : <TypeIcon size={14} style={{ color: "rgba(255,255,255,0.3)" }} />}
                    </div>
                    <span className="text-xs text-white truncate">{asset.name}</span>
                  </div>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {asset.type === "image" ? "图片" : asset.type === "video" ? "视频" : "音频"}
                  </span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{asset.size}</span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{asset.date}</span>
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button onClick={(e) => { e.stopPropagation(); toggleCollect(asset.id, e); }}
                      className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10">
                      <Star size={11} style={{ color: isCollected ? "#E87322" : "rgba(255,255,255,0.4)", fill: isCollected ? "#E87322" : "transparent" }} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); toast.success("下载已开始"); }}
                      className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10">
                      <Download size={11} style={{ color: "rgba(255,255,255,0.4)" }} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(asset.id); }}
                      className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-900/20">
                      <Trash2 size={11} style={{ color: "#ff6b6b" }} />
                    </button>
                  </div>
                </div>
              );
            })}
            {filteredAssets.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 rounded-2xl" style={{ border: "1px dashed rgba(255,255,255,0.08)" }}>
                <Image size={32} style={{ color: "rgba(255,255,255,0.1)" }} />
                <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>暂无��容</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detailAsset && <AssetDetailModal asset={detailAsset} onClose={() => setDetailAsset(null)} />}
    </div>
  );
}

type SidebarSel =
  | { section: "my" }
  | { section: "project"; projectId: string | "all" }
  | { section: "member"; memberId: string };

// ─── Sidebar member data ──────────────────────────────────────────────────────
const SIDEBAR_MEMBERS = [
  { id: "2", name: "Alice", letter: "A", avatarColor: "#7B3FC4", role: "管理员", assetCount: 8 },
  { id: "3", name: "Charlie", letter: "C", avatarColor: "#2A6FC4", role: "普通成员", assetCount: 5 },
  { id: "4", name: "Diana", letter: "D", avatarColor: "#C42A6F", role: "普通成员", assetCount: 3 },
  { id: "5", name: "Eve", letter: "E", avatarColor: "#2AC4A2", role: "普通成员", assetCount: 6 },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export function GlobalAssetsPage() {
  const [sel, setSel] = useState<SidebarSel>({ section: "my" });

  // Sidebar collapse states
  const [projectSectionOpen, setProjectSectionOpen] = useState(true);
  const [memberSectionOpen, setMemberSectionOpen] = useState(true);
  const [collapsedProjectIds, setCollapsedProjectIds] = useState<Set<string>>(new Set());
  const [collapsedMemberIds, setCollapsedMemberIds] = useState<Set<string>>(new Set());

  const toggleProjectCollapse = (projectId: string) => {
    setCollapsedProjectIds((prev) => {
      const next = new Set(prev);
      next.has(projectId) ? next.delete(projectId) : next.add(projectId);
      return next;
    });
  };

  const toggleMemberCollapse = (memberId: string) => {
    setCollapsedMemberIds((prev) => {
      const next = new Set(prev);
      next.has(memberId) ? next.delete(memberId) : next.add(memberId);
      return next;
    });
  };

  const statusColors: Record<string, string> = { "进行中": "#E87322", "已完成": "#22c55e", "暂停": "#94a3b8" };
  const allProjectAssets: AssetItem[] = Object.values(PROJECT_ASSETS).flat();
  const allProjectFolders: FolderItem[] = PROJECTS_DATA.flatMap((p) => [
    { id: `pf-${p.id}-1`, name: "角色资产", tab: "generate" as AssetTab },
    { id: `pf-${p.id}-2`, name: "场景背景", tab: "generate" as AssetTab },
  ]);

  const isProjAll = sel.section === "project" && sel.projectId === "all";

  const panelAssets = sel.section === "my"
    ? MY_ASSETS
    : sel.section === "member"
      ? MY_ASSETS.slice(0, SIDEBAR_MEMBERS.find((m) => m.id === sel.memberId)?.assetCount ?? 5)
      : sel.projectId === "all"
        ? allProjectAssets
        : (PROJECT_ASSETS[(sel as { section: "project"; projectId: string }).projectId] ?? []);

  const panelFolders = sel.section === "my"
    ? MY_FOLDERS
    : sel.section === "member"
      ? []
      : sel.projectId === "all"
        ? allProjectFolders
        : [
            { id: `pf-${(sel as any).projectId}-1`, name: "角色资产", tab: "generate" as AssetTab },
            { id: `pf-${(sel as any).projectId}-2`, name: "场景背景", tab: "generate" as AssetTab },
          ];

  const panelKey = sel.section === "my"
    ? "my"
    : sel.section === "member"
      ? `member-${sel.memberId}`
      : `proj-${(sel as any).projectId}`;

  const breadcrumbLabel = sel.section === "my"
    ? "我的资产"
    : sel.section === "member"
      ? (SIDEBAR_MEMBERS.find((m) => m.id === sel.memberId)?.name ?? "成员资产")
      : sel.projectId === "all"
        ? "全部项目"
        : PROJECTS_DATA.find((p) => p.id === (sel as any).projectId)?.name ?? "";

  const allProjectsCollapsed = collapsedProjectIds.size === PROJECTS_DATA.length;
  const allMembersCollapsed = collapsedMemberIds.size === SIDEBAR_MEMBERS.length;

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "#140F09" }}>
      {/* ── Unified Sidebar ── */}
      <div className="flex-shrink-0 flex flex-col overflow-hidden"
        style={{ width: "210px", background: "rgba(16,12,7,0.95)", borderRight: "1px solid rgba(255,255,255,0.05)" }}>

        <div className="flex-1 overflow-auto">
          {/* ── My Assets ── */}
          <div className="px-4 pt-5 pb-2">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.05em" }}>我的资产</span>
          </div>
          <button
            onClick={() => setSel({ section: "my" })}
            className="flex items-center gap-2.5 px-3 py-2 mx-2 rounded-lg text-left transition-colors"
            style={{
              width: "calc(100% - 16px)",
              background: sel.section === "my" ? "rgba(232,115,34,0.12)" : "transparent",
              color: sel.section === "my" ? "#E87322" : "rgba(255,255,255,0.6)",
            }}
          >
            <Image size={13} style={{ flexShrink: 0 }} />
            <div className="flex-1 min-w-0">
              <div className="text-xs">个人资产</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{MY_ASSETS.length} 个资产</div>
            </div>
            {sel.section === "my" && <ChevronRight size={11} style={{ flexShrink: 0 }} />}
          </button>

          <div className="h-px mx-4 my-3" style={{ background: "rgba(255,255,255,0.05)" }} />

          {/* ── Project Shared Assets ── */}
          <div className="px-3 pb-1.5 flex items-center justify-between">
            <button
              className="flex items-center gap-1 transition-opacity hover:opacity-80"
              style={{ color: "rgba(255,255,255,0.3)" }}
              onClick={() => setProjectSectionOpen((v) => !v)}
            >
              <ChevronDown size={11} style={{ transform: projectSectionOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s", flexShrink: 0 }} />
              <span className="text-xs" style={{ letterSpacing: "0.05em" }}>共享资产</span>
            </button>
            {projectSectionOpen && (
              null
            )}
          </div>

          {projectSectionOpen && (
            <>
              <button
                onClick={() => setSel({ section: "project", projectId: "all" })}
                className="flex items-center gap-2.5 px-3 py-2 mx-2 rounded-lg text-left transition-colors"
                style={{
                  width: "calc(100% - 16px)",
                  background: isProjAll ? "rgba(232,115,34,0.12)" : "transparent",
                  color: isProjAll ? "#E87322" : "rgba(255,255,255,0.6)",
                }}
              >
                <Layers size={13} style={{ flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs">全部项目</div>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{allProjectAssets.length} 个资产</div>
                </div>
                {isProjAll && <ChevronRight size={11} style={{ flexShrink: 0 }} />}
              </button>

              <div className="px-2 mt-0.5">
                {PROJECTS_DATA.map((project) => {
                  const count = (PROJECT_ASSETS[project.id] ?? []).length;
                  const isActive = sel.section === "project" && (sel as any).projectId === project.id;
                  const isCollapsed = collapsedProjectIds.has(project.id);
                  return (
                    <div key={project.id} className="mb-0.5">
                      <div
                        className="flex items-center rounded-lg transition-colors"
                        style={{ background: isActive ? "rgba(232,115,34,0.10)" : "transparent" }}
                      >
                        <button
                          onClick={() => toggleProjectCollapse(project.id)}
                          className="flex-shrink-0 w-5 h-6 flex items-center justify-center rounded ml-1 transition-colors hover:bg-white/10"
                          style={{ color: "rgba(255,255,255,0.2)" }}
                        >
                          <ChevronDown size={9} style={{ transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.15s" }} />
                        </button>
                        <button
                          onClick={() => setSel({ section: "project", projectId: project.id })}
                          className="flex-1 flex items-center gap-2 py-1.5 pr-2 text-left min-w-0"
                        >
                          <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0">
                            <img src={project.cover} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs truncate" style={{ color: isActive ? "#E87322" : "rgba(255,255,255,0.7)" }}>
                              {project.name}
                            </div>
                          </div>
                          {isActive && <ChevronRight size={9} style={{ color: "#E87322", flexShrink: 0 }} />}
                        </button>
                      </div>
                      {!isCollapsed && (
                        <div className="flex items-center gap-1.5 pl-8 pr-2 pb-1">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusColors[project.status] ?? "#94a3b8" }} />
                          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>{count} 个资产 · {project.status}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className="h-px mx-4 my-3" style={{ background: "rgba(255,255,255,0.05)" }} />

          {/* ── Member Assets (at the bottom) ── */}
          <div className="px-3 pb-1.5 flex items-center justify-between">
            <button
              className="flex items-center gap-1 transition-opacity hover:opacity-80"
              style={{ color: "rgba(255,255,255,0.3)" }}
              onClick={() => setMemberSectionOpen((v) => !v)}
            >
              <ChevronDown size={11} style={{ transform: memberSectionOpen ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s", flexShrink: 0 }} />
              <span className="text-xs" style={{ letterSpacing: "0.05em" }}>成员资产</span>
            </button>
            {memberSectionOpen && (
              null
            )}
          </div>

          {memberSectionOpen && (
            <div className="px-2 pb-4">
              {SIDEBAR_MEMBERS.map((member) => {
                const isActive = sel.section === "member" && sel.memberId === member.id;
                const isCollapsed = collapsedMemberIds.has(member.id);
                return (
                  <div key={member.id} className="mb-0.5">
                    <div
                      className="flex items-center rounded-lg transition-colors"
                      style={{ background: isActive ? "rgba(232,115,34,0.10)" : "transparent" }}
                    >
                      <button
                        onClick={() => toggleMemberCollapse(member.id)}
                        className="flex-shrink-0 w-5 h-6 flex items-center justify-center rounded ml-1 transition-colors hover:bg-white/10"
                        style={{ color: "rgba(255,255,255,0.2)" }}
                      >
                        <ChevronDown size={9} style={{ transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.15s" }} />
                      </button>
                      <button
                        onClick={() => setSel({ section: "member", memberId: member.id })}
                        className="flex-1 flex items-center gap-2 py-1.5 pr-2 text-left min-w-0"
                      >
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
                          style={{ background: member.avatarColor, fontSize: "9px", fontWeight: 600 }}
                        >
                          {member.letter}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs truncate" style={{ color: isActive ? "#E87322" : "rgba(255,255,255,0.7)" }}>
                            {member.name}
                          </div>
                        </div>
                        {isActive && <ChevronRight size={9} style={{ color: "#E87322", flexShrink: 0 }} />}
                      </button>
                    </div>
                    {!isCollapsed && (
                      <div className="flex items-center gap-1.5 pl-8 pr-2 pb-1">
                        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>{member.role} · {member.assetCount} 个资产</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Main Panel ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 px-6 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            {sel.section === "my" ? "我的资产" : sel.section === "member" ? "成员资产" : "项目资产"}
          </span>
          {(sel.section === "project" || sel.section === "member") && (
            <>
              <ChevronRight size={10} style={{ color: "rgba(255,255,255,0.2)" }} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>{breadcrumbLabel}</span>
            </>
          )}
          {sel.section === "project" && (sel as any).projectId !== "all" && (() => {
            const proj = PROJECTS_DATA.find((p) => p.id === (sel as any).projectId);
            return proj ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full ml-1" style={{ background: statusColors[proj.status] ?? "#94a3b8" }} />
                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{proj.status}</span>
              </>
            ) : null;
          })()}
          {sel.section === "member" && (() => {
            const m = SIDEBAR_MEMBERS.find((m) => m.id === sel.memberId);
            return m ? (
              <span className="px-1.5 py-0.5 rounded" style={{ background: `${m.avatarColor}22`, color: m.avatarColor, fontSize: "10px" }}>
                {m.role}
              </span>
            ) : null;
          })()}
        </div>

        <div className="flex-1 overflow-hidden">
          <AssetsPanel
            key={panelKey}
            initialAssets={panelAssets}
            initialFolders={panelFolders}
            hideTabBar={false}
            initialTab="generate"
            hideFolderCreate={isProjAll || sel.section === "member"}
          />
        </div>
      </div>
    </div>
  );
}
