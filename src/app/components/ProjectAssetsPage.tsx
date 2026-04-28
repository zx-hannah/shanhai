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
  ChevronRight,
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
  Share2,
} from "lucide-react";
import { toast } from "sonner";

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
}

interface FolderItem {
  id: string;
  name: string;
  tab: AssetTab;
}

interface SharedAssetItem extends AssetItem {
  projectName: string;
}

interface MemberAssetGroup {
  memberId: string;
  memberName: string;
  avatar: string;
  role: string;
  assets: AssetItem[];
}

/* ─── Mock Data ─────────────────────────────────────────────────────────────── */

const ALL_ASSETS: AssetItem[] = [
  { id: "1", name: "白发女侠_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", size: "2.3 MB", date: "今天", dateTs: 4, collected: true, tab: "generate", folderId: "f1" },
  { id: "2", name: "古城背景_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", size: "1.8 MB", date: "今天", dateTs: 4, collected: false, tab: "generate", folderId: "f2" },
  { id: "3", name: "山林场景_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", size: "3.1 MB", date: "今天", dateTs: 4, collected: true, tab: "generate" },
  { id: "4", name: "道具宝剑_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", size: "0.9 MB", date: "今天", dateTs: 4, collected: false, tab: "generate" },
  { id: "5", name: "主角设定_v3.jpg", type: "image", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", size: "2.7 MB", date: "今天", dateTs: 4, collected: false, tab: "generate", folderId: "f1" },
  { id: "6", name: "云雾山脉背景.jpg", type: "image", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", size: "4.2 MB", date: "今天", dateTs: 4, collected: true, tab: "generate" },
  { id: "7", name: "人物参考_古装.jpg", type: "image", src: "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", size: "1.5 MB", date: "昨天", dateTs: 3, collected: false, tab: "upload" },
  { id: "8", name: "角色立绘参考.jpg", type: "image", src: "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", size: "2.1 MB", date: "昨天", dateTs: 3, collected: true, tab: "upload" },
  { id: "9", name: "战场BGM.mp3", type: "audio", src: null, size: "4.2 MB", date: "3天前", dateTs: 2, collected: false, tab: "upload" },
  { id: "10", name: "角色出场动效.mp4", type: "video", src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", size: "12 MB", date: "3天前", dateTs: 2, collected: false, tab: "generate" },
  { id: "11", name: "片头动画.mp4", type: "video", src: "https://images.unsplash.com/photo-1748838602679-32d82ccf188e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", size: "28 MB", date: "一周前", dateTs: 1, collected: true, tab: "generate", folderId: "f2" },
];

const SHARED_PROJECT_ASSETS: SharedAssetItem[] = [
  { id: "s1", name: "江湖共享背景_01.jpg", type: "image", src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80", size: "3.4 MB", date: "2天前", dateTs: 3, collected: false, tab: "generate", projectName: "东方玄幻·龙渊" },
  { id: "s2", name: "通用特效_火焰.mp4", type: "video", src: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=80", size: "18 MB", date: "3天前", dateTs: 2, collected: true, tab: "generate", projectName: "东方玄幻·龙渊" },
  { id: "s3", name: "水墨风格人物.jpg", type: "image", src: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=400&q=80", size: "2.1 MB", date: "一周前", dateTs: 1, collected: false, tab: "generate", projectName: "星际迷途·序章" },
  { id: "s4", name: "远山图层背景.jpg", type: "image", src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80", size: "4.8 MB", date: "一周前", dateTs: 1, collected: true, tab: "generate", projectName: "星际迷途·序章" },
];

const MEMBER_ASSET_GROUPS: MemberAssetGroup[] = [
  {
    memberId: "m1", memberName: "林晓薇", avatar: "林", role: "主创导演",
    assets: [
      { id: "ma1", name: "导演分镜_v4.jpg", type: "image", src: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&q=80", size: "1.9 MB", date: "今天", dateTs: 4, collected: false, tab: "generate" },
      { id: "ma2", name: "场景气氛图.jpg", type: "image", src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80", size: "2.6 MB", date: "昨天", dateTs: 3, collected: true, tab: "generate" },
      { id: "ma3", name: "角色情绪参考.jpg", type: "image", src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80", size: "1.2 MB", date: "昨天", dateTs: 3, collected: false, tab: "generate" },
    ],
  },
  {
    memberId: "m2", memberName: "陈建国", avatar: "陈", role: "原画师",
    assets: [
      { id: "mb1", name: "原画概念_草稿.jpg", type: "image", src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80", size: "3.2 MB", date: "今天", dateTs: 4, collected: false, tab: "generate" },
      { id: "mb2", name: "色彩方案_终稿.jpg", type: "image", src: "https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=400&q=80", size: "2.8 MB", date: "2天前", dateTs: 2, collected: true, tab: "generate" },
    ],
  },
  {
    memberId: "m3", memberName: "王芳芳", avatar: "王", role: "剪辑师",
    assets: [
      { id: "mc1", name: "片段剪辑_01.mp4", type: "video", src: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80", size: "45 MB", date: "3天前", dateTs: 2, collected: false, tab: "generate" },
      { id: "mc2", name: "转场特效参考.mp4", type: "video", src: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&q=80", size: "12 MB", date: "一周前", dateTs: 1, collected: false, tab: "generate" },
      { id: "mc3", name: "背景音乐_主题.mp3", type: "audio", src: null, size: "6.4 MB", date: "一周前", dateTs: 1, collected: true, tab: "generate" },
    ],
  },
];

const TAB_LABELS: { key: AssetTab; label: string }[] = [
  { key: "generate", label: "全部生成" },
  { key: "upload", label: "历史上传" },
  { key: "subject", label: "主体资产" },
  { key: "collect", label: "全部收藏" },
];

const TYPE_ICONS = { image: Image, video: Video, audio: Music };

/* ─── Asset Detail Modal ─────────────────────────────────────────────────────── */
function AssetDetailModal({ asset, onClose }: { asset: AssetItem; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.82)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative flex flex-col rounded-2xl overflow-hidden"
        style={{ background: "#1A1510", border: "1px solid rgba(255,255,255,0.1)", width: "720px", maxHeight: "85vh" }}>
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-sm text-white">{asset.name}</span>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10">
            <X size={15} style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6 flex gap-6">
          <div className="flex-1 rounded-xl overflow-hidden flex items-center justify-center"
            style={{ background: "#140F09", minHeight: "340px" }}>
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

/* ─── Date Range Picker ──────────────────────────────────────────────────────── */
interface DateRange { start: string; end: string; }
function DateRangePicker({ value, onChange, onClose }: {
  value: { preset: string; custom: DateRange };
  onChange: (v: { preset: string; custom: DateRange }) => void;
  onClose: () => void;
}) {
  const presets = [
    { key: "all", label: "全部时间" }, { key: "today", label: "今天" },
    { key: "week", label: "最近7天" }, { key: "month", label: "最近30天" },
    { key: "custom", label: "自定义范围" },
  ];
  return (
    <div className="absolute top-full mt-1 left-0 z-20 rounded-xl overflow-hidden"
      style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.6)", width: "260px" }}>
      {presets.map((p) => (
        <button key={p.key} onClick={() => { onChange({ ...value, preset: p.key }); if (p.key !== "custom") onClose(); }}
          className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-left hover:bg-white/5"
          style={{ color: value.preset === p.key ? "#E87322" : "rgba(255,255,255,0.6)" }}>
          {p.label}{value.preset === p.key && <Check size={10} />}
        </button>
      ))}
      {value.preset === "custom" && (
        <div className="px-4 pb-3 pt-1 flex flex-col gap-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {[["开始日期", "start"], ["结束日期", "end"]].map(([label, field]) => (
            <div key={field} className="flex flex-col gap-1">
              <label style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>{label}</label>
              <input type="date" className="bg-transparent text-xs rounded-md px-2 py-1.5 outline-none"
                style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)", colorScheme: "dark" }}
                value={value.custom[field as "start" | "end"]}
                onChange={(e) => onChange({ ...value, custom: { ...value.custom, [field]: e.target.value } })} />
            </div>
          ))}
          <button onClick={onClose} className="w-full py-1.5 rounded-lg text-xs" style={{ background: "#E87322", color: "white" }}>确认</button>
        </div>
      )}
    </div>
  );
}

/* ─── Section Header ─────────────────────────────────────────────────────────── */
function SectionDivider({
  icon, title, badge, count, collapsed, onToggle, accentColor = "rgba(255,255,255,0.35)",
}: {
  icon: React.ReactNode; title: string; badge?: string; count: number;
  collapsed: boolean; onToggle: () => void; accentColor?: string;
}) {
  return (
    <div
      className="col-span-full flex items-center gap-2.5 py-2.5 px-1 cursor-pointer select-none group rounded-lg"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 12 }}
      onClick={onToggle}
    >
      <div className="flex items-center justify-center w-5 h-5 flex-shrink-0" style={{ color: accentColor }}>
        {icon}
      </div>
      <span className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>{title}</span>
      {badge && (
        <span className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}30`, fontSize: 11 }}>
          {badge}
        </span>
      )}
      <span className="text-xs" style={{ color: "rgba(255,255,255,0.22)" }}>{count} 项</span>
      <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors group-hover:bg-white/5"
        style={{ color: "rgba(255,255,255,0.3)" }}>
        <span className="text-xs" style={{ fontSize: 11 }}>{collapsed ? "展开" : "收起"}</span>
        {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
      </div>
    </div>
  );
}

/* ─── Member Section Header ──────────────────────────────────────────────────── */
function MemberSectionHeader({
  group, collapsed, onToggle,
}: {
  group: MemberAssetGroup; collapsed: boolean; onToggle: () => void;
}) {
  return (
    <div
      className="col-span-full flex items-center gap-2.5 py-2.5 px-1 cursor-pointer select-none group rounded-lg"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: 12 }}
      onClick={onToggle}
    >
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
        style={{ background: "rgba(139,92,246,0.2)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.25)" }}>
        {group.avatar}
      </div>
      <span className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>{group.memberName}</span>
      <span className="text-xs px-2 py-0.5 rounded-full"
        style={{ background: "rgba(139,92,246,0.12)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.2)", fontSize: 11 }}>
        {group.role}
      </span>
      <span className="text-xs" style={{ color: "rgba(255,255,255,0.22)" }}>{group.assets.length} 项</span>
      <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors group-hover:bg-white/5"
        style={{ color: "rgba(255,255,255,0.3)" }}>
        <span className="text-xs" style={{ fontSize: 11 }}>{collapsed ? "展开" : "收起"}</span>
        {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export function ProjectAssetsPage() {
  const [activeTab, setActiveTab] = useState<AssetTab>("generate");
  const [typeFilter, setTypeFilter] = useState<AssetType>("all");
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [collectedIds, setCollectedIds] = useState<Set<string>>(
    new Set(ALL_ASSETS.filter((a) => a.collected).map((a) => a.id)),
  );
  const [assets, setAssets] = useState<AssetItem[]>(ALL_ASSETS);
  const [searchText, setSearchText] = useState("");
  const [showDateMenu, setShowDateMenu] = useState(false);
  const [dateFilter, setDateFilter] = useState({ preset: "all", custom: { start: "", end: "" } });
  const [detailAsset, setDetailAsset] = useState<AssetItem | null>(null);
  const [moreMenuId, setMoreMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [folders, setFolders] = useState<FolderItem[]>([
    { id: "f1", name: "角色设定", tab: "generate" },
    { id: "f2", name: "场景背景", tab: "generate" },
  ]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [showAddToFolder, setShowAddToFolder] = useState(false);
  const [showCollectedOnly, setShowCollectedOnly] = useState(false);

  // Collapsible section states
  const [collapsedSharedProjects, setCollapsedSharedProjects] = useState<Set<string>>(new Set());
  const [collapsedMembers, setCollapsedMembers] = useState<Set<string>>(new Set());

  const toggleSharedProject = (name: string) =>
    setCollapsedSharedProjects((prev) => { const n = new Set(prev); n.has(name) ? n.delete(name) : n.add(name); return n; });

  const toggleMember = (id: string) =>
    setCollapsedMembers((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  // Group shared assets by project name
  const sharedByProject = SHARED_PROJECT_ASSETS.reduce<Record<string, SharedAssetItem[]>>((acc, a) => {
    if (!acc[a.projectName]) acc[a.projectName] = [];
    acc[a.projectName].push(a);
    return acc;
  }, {});

  const TYPE_LABELS: Record<AssetType, string> = { all: "全部类型", image: "图片", video: "视频", audio: "音频" };

  const getDateLabel = () => ({ today: "今天", week: "最近7天", month: "最近30天", custom: "自定义范围" }[dateFilter.preset] ?? "日期筛选");

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

  const toggleSelect = (id: string) =>
    setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

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
    setFolders((prev) => [...prev, { id: `f${Date.now()}`, name: folderName, tab: activeTab }]);
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

  // ── Grid card renderer ──────────────────────────────────────────────────────
  const renderGridCard = (asset: AssetItem, readOnly = false) => {
    const isSelected = selectedIds.has(asset.id);
    const isCollected = collectedIds.has(asset.id);
    const TypeIcon = TYPE_ICONS[asset.type];
    const isRenaming = renamingId === asset.id;
    const showMore = moreMenuId === asset.id;

    return (
      <div key={asset.id}
        className="rounded-xl overflow-hidden cursor-pointer group relative"
        style={{ background: "#1A1510", border: isSelected ? "2px solid #E87322" : "2px solid rgba(255,255,255,0.06)", transition: "border-color 0.15s", opacity: readOnly ? 0.88 : 1 }}
        draggable={!batchMode && !readOnly}
        onDragStart={() => setDragId(asset.id)}
        onDragEnd={() => setDragId(null)}
        onClick={() => { if (batchMode && !readOnly) { toggleSelect(asset.id); return; } if (!isRenaming && !showMore) setDetailAsset(asset); }}
      >
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
          {batchMode && !readOnly && (
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
            {!readOnly && (
              <div className="relative">
                <button className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
                  onClick={(e) => { e.stopPropagation(); setMoreMenuId(showMore ? null : asset.id); }}>
                  <MoreHorizontal size={12} className="text-white" />
                </button>
                {showMore && (
                  <div className="absolute right-0 top-full mt-1 z-30 rounded-xl overflow-hidden"
                    style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.7)", minWidth: "130px" }}
                    onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { toast.success("下载已开始"); setMoreMenuId(null); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left hover:bg-white/5" style={{ color: "rgba(255,255,255,0.7)" }}><Download size={11} />下载</button>
                    <button onClick={() => handleRename(asset.id)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left hover:bg-white/5" style={{ color: "rgba(255,255,255,0.7)" }}><Pencil size={11} />重命名</button>
                    <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
                    <button onClick={() => handleDelete(asset.id)} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left hover:bg-red-900/20" style={{ color: "#ff6b6b" }}><Trash2 size={11} />删除</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="px-2.5 py-2">
          {isRenaming && !readOnly ? (
            <input autoFocus className="w-full bg-transparent text-xs outline-none px-1 py-0.5 rounded"
              style={{ border: "1px solid rgba(232,115,34,0.5)", color: "rgba(255,255,255,0.8)", caretColor: "#E87322" }}
              value={renameValue} onChange={(e) => setRenameValue(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onBlur={() => confirmRename(asset.id)}
              onKeyDown={(e) => { if (e.key === "Enter") confirmRename(asset.id); if (e.key === "Escape") setRenamingId(null); }} />
          ) : (
            <div className="text-xs text-white truncate">{asset.name}</div>
          )}
          <div className="flex items-center justify-between mt-1" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>
            <span>{asset.size}</span><span>{asset.date}</span>
          </div>
        </div>
      </div>
    );
  };

  // ── List row renderer ───────────────────────────────────────────────────────
  const renderListRow = (asset: AssetItem, readOnly = false) => {
    const isSelected = selectedIds.has(asset.id);
    const isCollected = collectedIds.has(asset.id);
    const TypeIcon = TYPE_ICONS[asset.type];
    return (
      <div key={asset.id}
        className="grid items-center px-3 py-2 rounded-lg hover:bg-white/5 group cursor-pointer"
        style={{ gridTemplateColumns: "32px 1fr 80px 80px 80px 80px", gap: "12px", background: isSelected ? "rgba(232,115,34,0.06)" : "transparent", border: isSelected ? "1px solid rgba(232,115,34,0.2)" : "1px solid transparent", opacity: readOnly ? 0.85 : 1 }}
        onClick={() => setDetailAsset(asset)}>
        <button onClick={(e) => { e.stopPropagation(); if (!readOnly) toggleSelect(asset.id); }}>
          <div className="w-4 h-4 rounded flex items-center justify-center"
            style={{ background: isSelected ? "#E87322" : "transparent", border: isSelected ? "none" : "1.5px solid rgba(255,255,255,0.2)" }}>
            {isSelected && <Check size={9} className="text-white" />}
          </div>
        </button>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0" style={{ background: "#231E17" }}>
            {asset.src ? <img src={asset.src} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><TypeIcon size={14} style={{ color: "rgba(255,255,255,0.3)" }} /></div>}
          </div>
          <span className="text-xs text-white truncate">{asset.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <TypeIcon size={10} style={{ color: "rgba(255,255,255,0.35)" }} />
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{asset.type === "image" ? "图片" : asset.type === "video" ? "视频" : "音频"}</span>
        </div>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{asset.size}</span>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{asset.date}</span>
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); toggleCollect(asset.id, e); }} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10">
            <Star size={11} style={{ color: isCollected ? "#E87322" : "rgba(255,255,255,0.4)", fill: isCollected ? "#E87322" : "transparent" }} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); toast.success("下载已开始"); }} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10">
            <Download size={11} style={{ color: "rgba(255,255,255,0.4)" }} />
          </button>
          {!readOnly && <>
            <button onClick={(e) => { e.stopPropagation(); handleRename(asset.id); }} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10">
              <Pencil size={11} style={{ color: "rgba(255,255,255,0.4)" }} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleDelete(asset.id); }} className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-900/20">
              <Trash2 size={11} style={{ color: "rgba(255,120,120,0.5)" }} />
            </button>
          </>}
        </div>
      </div>
    );
  };

  // ── List section separator ───────────────────────────────────────────────────
  const renderListSectionHeader = (icon: React.ReactNode, title: string, badge: string | undefined, count: number, collapsed: boolean, onToggle: () => void, accentColor: string) => (
    <div className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer select-none rounded-lg hover:bg-white/5 mt-3"
      style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      onClick={onToggle}>
      <div style={{ color: accentColor }}>{icon}</div>
      <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{title}</span>
      {badge && <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${accentColor}18`, color: accentColor, fontSize: 10 }}>{badge}</span>}
      <span className="text-xs ml-1" style={{ color: "rgba(255,255,255,0.25)" }}>{count} 项</span>
      <div className="ml-auto flex items-center gap-1" style={{ color: "rgba(255,255,255,0.3)" }}>
        <span style={{ fontSize: 11 }}>{collapsed ? "展开" : "收起"}</span>
        {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
      </div>
    </div>
  );

  const showExtendedSections = activeTab === "generate" && !activeFolderId;

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "#140F09" }}
      onClick={() => { setMoreMenuId(null); setShowTypeMenu(false); setShowDateMenu(false); }}>

      {/* ── Tab Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-6 pt-5 pb-0 flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        {TAB_LABELS.map((tab) => (
          <button key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSelectedIds(new Set()); setBatchMode(false); setActiveFolderId(null); }}
            className="px-4 py-2.5 text-sm transition-colors relative"
            style={{ color: activeTab === tab.key ? "#E87322" : "rgba(255,255,255,0.45)", borderBottom: activeTab === tab.key ? "2px solid #E87322" : "2px solid transparent", marginBottom: "-1px" }}>
            {tab.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 pb-2">
          {[{ mode: "grid" as const, Icon: Grid3X3 }, { mode: "list" as const, Icon: LayoutList }].map(({ mode, Icon }) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className="w-7 h-7 rounded flex items-center justify-center"
              style={{ background: viewMode === mode ? "rgba(255,255,255,0.1)" : "transparent", color: viewMode === mode ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)" }}>
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-6 py-3 flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2 rounded-lg px-3 py-1.5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", minWidth: "150px" }}>
          <Search size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
          <input className="bg-transparent text-xs flex-1 outline-none" style={{ color: "rgba(255,255,255,0.7)", caretColor: "#E87322" }}
            placeholder="搜索资产..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          {searchText && <button onClick={(e) => { e.stopPropagation(); setSearchText(""); }}><X size={11} style={{ color: "rgba(255,255,255,0.3)" }} /></button>}
        </div>

        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); setShowTypeMenu(!showTypeMenu); setShowDateMenu(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: typeFilter !== "all" ? "rgba(232,115,34,0.15)" : "rgba(255,255,255,0.05)", color: typeFilter !== "all" ? "#E87322" : "rgba(255,255,255,0.45)", border: typeFilter !== "all" ? "1px solid rgba(232,115,34,0.3)" : "1px solid rgba(255,255,255,0.07)" }}>
            {typeFilter === "image" && <Image size={10} />}{typeFilter === "video" && <Video size={10} />}{typeFilter === "audio" && <Music size={10} />}
            {TYPE_LABELS[typeFilter]}<ChevronDown size={9} />
          </button>
          {showTypeMenu && (
            <div className="absolute top-full mt-1 left-0 z-20 rounded-xl overflow-hidden"
              style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.6)", minWidth: "130px" }}
              onClick={(e) => e.stopPropagation()}>
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

        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); setShowDateMenu(!showDateMenu); setShowTypeMenu(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: dateFilter.preset !== "all" ? "rgba(232,115,34,0.15)" : "rgba(255,255,255,0.05)", color: dateFilter.preset !== "all" ? "#E87322" : "rgba(255,255,255,0.45)", border: dateFilter.preset !== "all" ? "1px solid rgba(232,115,34,0.3)" : "1px solid rgba(255,255,255,0.07)" }}>
            {getDateLabel()}<ChevronDown size={9} />
          </button>
          {showDateMenu && (<><div className="fixed inset-0 z-10" onClick={() => setShowDateMenu(false)} /><div className="z-20" onClick={(e) => e.stopPropagation()}><DateRangePicker value={dateFilter} onChange={setDateFilter} onClose={() => setShowDateMenu(false)} /></div></>)}
        </div>

        <button onClick={() => setSortOrder((o) => (o === "desc" ? "asc" : "desc"))}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {sortOrder === "desc" ? <ArrowDown size={10} /> : <ArrowUp size={10} />}
          {sortOrder === "desc" ? "时间降序" : "时间升序"}
        </button>

        {(activeTab === "generate" || activeTab === "upload") && (
          <button onClick={() => setShowCollectedOnly(!showCollectedOnly)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: showCollectedOnly ? "rgba(232,115,34,0.15)" : "rgba(255,255,255,0.05)", color: showCollectedOnly ? "#E87322" : "rgba(255,255,255,0.45)", border: showCollectedOnly ? "1px solid rgba(232,115,34,0.3)" : "1px solid rgba(255,255,255,0.07)" }}>
            <Star size={10} style={{ fill: showCollectedOnly ? "#E87322" : "transparent" }} />已收藏
          </button>
        )}

        <button onClick={() => createFolder()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:opacity-80 transition-opacity"
          style={{ background: "rgba(232,115,34,0.1)", color: "#E87322", border: "1px solid rgba(232,115,34,0.2)" }}>
          <FolderPlus size={11} />新建文件夹
        </button>

        <button onClick={() => { setBatchMode(!batchMode); if (batchMode) setSelectedIds(new Set()); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
          style={{ background: batchMode ? "rgba(232,115,34,0.15)" : "rgba(255,255,255,0.05)", color: batchMode ? "#E87322" : "rgba(255,255,255,0.45)", border: batchMode ? "1px solid rgba(232,115,34,0.3)" : "1px solid transparent" }}>
          <Check size={11} />批量
        </button>

        <span className="ml-auto text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
          {filteredAssets.length + (activeFolderId ? 0 : tabFolders.length)} 项
        </span>
      </div>

      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      {activeFolderId && (
        <div className="flex items-center gap-2 px-6 py-2 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <button onClick={() => setActiveFolderId(null)} className="text-xs hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
            {TAB_LABELS.find((t) => t.key === activeTab)?.label}
          </button>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>{folders.find((f) => f.id === activeFolderId)?.name}</span>
        </div>
      )}

      {/* ── Batch Bar ───────────────────────────────────────────────────────── */}
      {batchMode && selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-6 py-2.5 flex-shrink-0"
          style={{ background: "rgba(232,115,34,0.08)", borderBottom: "1px solid rgba(232,115,34,0.2)" }}>
          <button onClick={selectAll} className="flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
            <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: "#E87322" }}><Check size={10} className="text-white" /></div>
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:bg-red-900/20"
            style={{ background: "rgba(255,80,80,0.1)", color: "#ff6b6b" }}>
            <Trash2 size={11} />删除
          </button>
          <button onClick={() => { setSelectedIds(new Set()); setBatchMode(false); }} className="ml-auto" style={{ color: "rgba(255,255,255,0.35)" }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Move-to-folder modal ─────────────────────────────────────────────── */}
      {showAddToFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => e.target === e.currentTarget && setShowAddToFolder(false)}>
          <div className="rounded-2xl overflow-hidden flex flex-col"
            style={{ background: "#1A1510", border: "1px solid rgba(255,255,255,0.1)", width: "320px", maxHeight: "400px", boxShadow: "0 16px 60px rgba(0,0,0,0.7)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <span className="text-sm text-white">移入文件夹</span>
              <button onClick={() => setShowAddToFolder(false)}><X size={14} style={{ color: "rgba(255,255,255,0.4)" }} /></button>
            </div>
            <div className="flex-1 overflow-auto p-3">
              {tabFolders.map((f) => (
                <button key={f.id} onClick={() => moveToFolder(f.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-white/5">
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

      {/* ── Asset Content ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto px-6 py-4">

        {viewMode === "grid" ? (
          /* ── GRID VIEW ──────────────────────────────────────────────────── */
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>

            {/* Folder cards */}
            {!activeFolderId && tabFolders.map((folder) => {
              const cnt = assets.filter((a) => a.folderId === folder.id && a.tab === activeTab).length;
              return (
                <div key={folder.id}
                  className="rounded-xl overflow-hidden cursor-pointer group"
                  style={{ background: "#1A1510", border: dragOverFolder === folder.id ? "2px solid #E87322" : "2px solid rgba(255,255,255,0.06)" }}
                  onClick={() => setActiveFolderId(folder.id)}
                  onDragOver={(e) => { e.preventDefault(); setDragOverFolder(folder.id); }}
                  onDragLeave={() => setDragOverFolder(null)}
                  onDrop={() => { if (dragId) { setAssets((p) => p.map((a) => a.id === dragId ? { ...a, folderId: folder.id } : a)); toast.success(`已移入「${folder.name}」`); setDragId(null); } setDragOverFolder(null); }}>
                  <div className="flex flex-col items-center justify-center gap-2 py-7" style={{ aspectRatio: "1", background: "rgba(232,115,34,0.04)" }}>
                    {dragOverFolder === folder.id ? <FolderOpen size={36} style={{ color: "#E87322" }} /> : <Folder size={36} style={{ color: "#E87322", opacity: 0.7 }} />}
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{cnt} 个文件</span>
                  </div>
                  <div className="px-2.5 py-2">
                    <div className="text-xs text-white truncate">{folder.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>文件夹</div>
                  </div>
                </div>
              );
            })}

            {/* Current project assets */}
            {filteredAssets.map((asset) => renderGridCard(asset, false))}

            {/* Empty state */}
            {filteredAssets.length === 0 && tabFolders.length === 0 && !showExtendedSections && (
              <div className="col-span-full flex flex-col items-center justify-center h-48 rounded-2xl"
                style={{ border: "1px dashed rgba(255,255,255,0.08)" }}>
                <Image size={32} style={{ color: "rgba(255,255,255,0.1)" }} />
                <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {activeTab === "subject" ? "暂无主体资产" : "暂无内容"}
                </p>
              </div>
            )}

            {/* ── 项目共享资产 (per-project, collapsible) ── */}
            {showExtendedSections && Object.entries(sharedByProject).map(([projectName, sharedAssets]) => (
              <div key={projectName} className="contents">
                <SectionDivider
                  icon={<Share2 size={13} />}
                  title="共享资产"
                  badge={projectName}
                  count={sharedAssets.length}
                  collapsed={collapsedSharedProjects.has(projectName)}
                  onToggle={() => toggleSharedProject(projectName)}
                  accentColor="#60a5fa"
                />
                {!collapsedSharedProjects.has(projectName) && sharedAssets.map((a) => renderGridCard(a, true))}
              </div>
            ))}

            {/* ── 成员资产 (multiple members, each collapsible, placed LAST) ── */}
            {showExtendedSections && MEMBER_ASSET_GROUPS.map((group) => (
              <div key={group.memberId} className="contents">
                <MemberSectionHeader group={group} collapsed={collapsedMembers.has(group.memberId)} onToggle={() => toggleMember(group.memberId)} />
                {!collapsedMembers.has(group.memberId) && group.assets.map((a) => renderGridCard(a, true))}
              </div>
            ))}
          </div>
        ) : (
          /* ── LIST VIEW ──────────────────────────────────────────────────── */
          <div className="flex flex-col gap-1">
            <div className="grid text-xs px-3 py-2 mb-1"
              style={{ color: "rgba(255,255,255,0.3)", gridTemplateColumns: "32px 1fr 80px 80px 80px 80px", gap: "12px" }}>
              <button onClick={selectAll}>
                <div className="w-4 h-4 rounded flex items-center justify-center"
                  style={{ border: "1.5px solid rgba(255,255,255,0.2)", background: selectedIds.size === filteredAssets.length && filteredAssets.length > 0 ? "#E87322" : "transparent" }}>
                  {selectedIds.size === filteredAssets.length && filteredAssets.length > 0 && <Check size={9} className="text-white" />}
                </div>
              </button>
              <span>文件名</span><span>类型</span><span>大小</span><span>日期</span><span>操作</span>
            </div>

            {/* Current project assets */}
            {filteredAssets.map((a) => renderListRow(a, false))}

            {/* Shared assets sections */}
            {showExtendedSections && Object.entries(sharedByProject).map(([projectName, sharedAssets]) => (
              <div key={projectName}>
                {renderListSectionHeader(<Share2 size={13} />, "共享资产", projectName, sharedAssets.length, collapsedSharedProjects.has(projectName), () => toggleSharedProject(projectName), "#60a5fa")}
                {!collapsedSharedProjects.has(projectName) && sharedAssets.map((a) => renderListRow(a, true))}
              </div>
            ))}

            {/* Member assets sections (last) */}
            {showExtendedSections && MEMBER_ASSET_GROUPS.map((group) => (
              <div key={group.memberId}>
                <div className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer select-none rounded-lg hover:bg-white/5 mt-3"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                  onClick={() => toggleMember(group.memberId)}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                    style={{ background: "rgba(139,92,246,0.2)", color: "#a78bfa" }}>{group.avatar}</div>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{group.memberName}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(139,92,246,0.1)", color: "#a78bfa", fontSize: 10 }}>{group.role}</span>
                  <span className="text-xs ml-1" style={{ color: "rgba(255,255,255,0.25)" }}>{group.assets.length} 项</span>
                  <div className="ml-auto flex items-center gap-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                    <span style={{ fontSize: 11 }}>{collapsedMembers.has(group.memberId) ? "展开" : "收起"}</span>
                    {collapsedMembers.has(group.memberId) ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                  </div>
                </div>
                {!collapsedMembers.has(group.memberId) && group.assets.map((a) => renderListRow(a, true))}
              </div>
            ))}
          </div>
        )}
      </div>

      {detailAsset && <AssetDetailModal asset={detailAsset} onClose={() => setDetailAsset(null)} />}
    </div>
  );
}
