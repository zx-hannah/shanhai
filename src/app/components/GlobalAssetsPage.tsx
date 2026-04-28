import { useState } from "react";
import {
  Image, Video, Music, Download, Star, Trash2, Check, Search,
  ChevronDown, X, Grid3X3, LayoutList, Pencil, ArrowDown, ArrowUp,
  Layers, User, Folder,
} from "lucide-react";
import { toast } from "sonner";
import { PROJECTS_DATA } from "../data/projectsData";

// ─── Types ────────────────────────────────────────────────────────────────────
type AssetTab = "generate" | "upload" | "subject" | "collect";
type AssetType = "all" | "image" | "video" | "audio";

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
];

// ─── Project Assets ───────────────────────────────────────────────────────────
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

const TYPE_ICONS = { image: Image, video: Video, audio: Music };
const TYPE_LABELS: Record<AssetType, string> = { all: "全部类型", image: "图片", video: "视频", audio: "音频" };

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
            {[["类型", asset.type === "image" ? "图片" : asset.type === "video" ? "视频" : "音频"], ["大小", asset.size], ["日期", asset.date]].map(([k, v]) => (
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

  const filtered = assets
    .filter((a) => {
      if (typeFilter !== "all" && a.type !== typeFilter) return false;
      if (searchText && !a.name.toLowerCase().includes(searchText.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => b.dateTs - a.dateTs);

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

      {/* Filter bar */}
      <div className="flex items-center gap-2 px-6 py-2.5 flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 flex-1 max-w-xs"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <Search size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
          <input className="bg-transparent text-xs flex-1 outline-none" style={{ color: "rgba(255,255,255,0.7)" }}
            placeholder="搜索文件名..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          {searchText && <button onClick={() => setSearchText("")}><X size={11} style={{ color: "rgba(255,255,255,0.3)" }} /></button>}
        </div>
        <div className="relative">
          <button onClick={() => setShowTypeMenu(!showTypeMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: typeFilter !== "all" ? "rgba(232,115,34,0.15)" : "rgba(255,255,255,0.05)", color: typeFilter !== "all" ? "#E87322" : "rgba(255,255,255,0.45)", border: typeFilter !== "all" ? "1px solid rgba(232,115,34,0.3)" : "1px solid rgba(255,255,255,0.07)" }}>
            {typeFilter === "image" && <Image size={10} />}{typeFilter === "video" && <Video size={10} />}{typeFilter === "audio" && <Music size={10} />}
            {TYPE_LABELS[typeFilter]}<ChevronDown size={9} />
          </button>
          {showTypeMenu && (
            <div className="absolute top-full mt-1 left-0 z-20 rounded-xl overflow-hidden shadow-2xl"
              style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)", minWidth: "120px" }}
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
        <button onClick={() => setBatchMode(!batchMode)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
          style={{ background: batchMode ? "rgba(232,115,34,0.15)" : "rgba(255,255,255,0.05)", color: batchMode ? "#E87322" : "rgba(255,255,255,0.45)", border: batchMode ? "1px solid rgba(232,115,34,0.3)" : "1px solid transparent" }}>
          <Check size={11} />批量
        </button>
        <button onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          className="w-7 h-7 rounded flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {viewMode === "grid" ? <LayoutList size={14} /> : <Grid3X3 size={14} />}
        </button>
        <span className="ml-auto text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>共 {filtered.length} 项</span>
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
                <Image size={32} style={{ color: "rgba(255,255,255,0.1)" }} />
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
                <Image size={32} style={{ color: "rgba(255,255,255,0.1)" }} />
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
  | { section: "project"; projectId: string | "all" }
  | { section: "member"; memberId: string };

const STATUS_COLORS: Record<string, string> = { "进行中": "#E87322", "已完成": "#22c55e", "暂停": "#94a3b8" };

export function GlobalAssetsPage() {
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
      : sel.section === "project"
        ? PROJECT_ASSETS[(sel as any).projectId] ?? []
        : MEMBER_ASSETS[sel.memberId] ?? [];

  const breadcrumbLabel = sel.section === "my"
    ? "个人资产"
    : sel.section === "member"
      ? MEMBER_DATA.find((m) => m.id === sel.memberId)?.name ?? ""
      : sel.projectId === "all"
        ? "全部项目"
        : PROJECTS_DATA.find((p) => p.id === (sel as any).projectId)?.name ?? "";

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "#140F09" }}>
      {/* ── Sidebar ── */}
      <div className="flex-shrink-0 flex flex-col overflow-hidden"
        style={{ width: "220px", background: "rgba(16,12,7,0.95)", borderRight: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="flex-1 overflow-auto px-3 py-4">

          {/* 个人资产 */}
          <div className="mb-1">
            <button onClick={() => toggleSection("my")}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <ChevronDown size={12} style={{ transform: sectionOpen.my ? "none" : "rotate(-90deg)", transition: "transform 0.2s", color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
              <Image size={13} style={{ color: "rgba(255,255,255,0.35)" }} />
              <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>个人资产</span>
            </button>
            {sectionOpen.my && (
              <button onClick={() => setSel({ section: "my" })}
                className="flex items-center gap-2.5 w-full px-8 py-2 rounded-lg text-left"
                style={{ background: sel.section === "my" ? "rgba(232,115,34,0.12)" : "transparent", color: sel.section === "my" ? "#E87322" : "rgba(255,255,255,0.55)" }}>
                <span className="text-xs">我的全部</span>
                <span className="ml-auto text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>{MY_ASSETS.length}</span>
              </button>
            )}
          </div>

          {/* 共享资产 */}
          <div className="mb-1 mt-3">
            <button onClick={() => toggleSection("project")}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <ChevronDown size={12} style={{ transform: sectionOpen.project ? "none" : "rotate(-90deg)", transition: "transform 0.2s", color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
              <Layers size={13} style={{ color: "rgba(255,255,255,0.35)" }} />
              <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>共享资产</span>
            </button>
            {sectionOpen.project && (
              <>
                <button onClick={() => setSel({ section: "project", projectId: "all" })}
                  className="flex items-center gap-2.5 w-full px-8 py-2 rounded-lg text-left"
                  style={{ background: sel.section === "project" && sel.projectId === "all" ? "rgba(232,115,34,0.12)" : "transparent", color: sel.section === "project" && sel.projectId === "all" ? "#E87322" : "rgba(255,255,255,0.55)" }}>
                  <span className="text-xs">全部项目</span>
                  <span className="ml-auto text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>{Object.values(PROJECT_ASSETS).flat().length}</span>
                </button>
                {PROJECTS_DATA.map((project) => {
                  const count = (PROJECT_ASSETS[project.id] ?? []).length;
                  const isActive = sel.section === "project" && (sel as any).projectId === project.id;
                  return (
                    <button key={project.id} onClick={() => setSel({ section: "project", projectId: project.id })}
                      className="flex items-center gap-2 w-full px-8 py-1.5 rounded-lg text-left"
                      style={{ background: isActive ? "rgba(232,115,34,0.10)" : "transparent", color: isActive ? "#E87322" : "rgba(255,255,255,0.5)" }}>
                      <div className="w-5 h-5 rounded overflow-hidden flex-shrink-0">
                        <img src={project.cover} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs truncate flex-1">{project.name}</span>
                      <span className="text-xs flex-shrink-0" style={{ color: "rgba(255,255,255,0.25)" }}>{count}</span>
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* 成员资产 */}
          <div className="mb-1 mt-3">
            <button onClick={() => toggleSection("member")}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <ChevronDown size={12} style={{ transform: sectionOpen.member ? "none" : "rotate(-90deg)", transition: "transform 0.2s", color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
              <User size={13} style={{ color: "rgba(255,255,255,0.35)" }} />
              <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>成员资产</span>
            </button>
            {sectionOpen.member && (
              MEMBER_DATA.map((member) => {
                const isActive = sel.section === "member" && sel.memberId === member.id;
                const count = (MEMBER_ASSETS[member.id] ?? []).length;
                return (
                  <button key={member.id} onClick={() => setSel({ section: "member", memberId: member.id })}
                    className="flex items-center gap-2.5 w-full px-8 py-1.5 rounded-lg text-left"
                    style={{ background: isActive ? "rgba(232,115,34,0.10)" : "transparent", color: isActive ? "#E87322" : "rgba(255,255,255,0.5)" }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: member.avatarColor, fontSize: "8px", fontWeight: 600, color: "white" }}>
                      {member.letter}
                    </div>
                    <span className="text-xs truncate flex-1">{member.name}</span>
                    <span className="text-xs flex-shrink-0" style={{ color: "rgba(255,255,255,0.25)" }}>{count}</span>
                  </button>
                );
              })
            )}
          </div>

        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 px-6 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>{breadcrumbLabel}</span>
          {sel.section === "project" && sel.projectId !== "all" && (() => {
            const proj = PROJECTS_DATA.find((p) => p.id === (sel as any).projectId);
            return proj ? (
              <span className="px-1.5 py-0.5 rounded text-xs"
                style={{ background: `${STATUS_COLORS[proj.status]}22`, color: STATUS_COLORS[proj.status] }}>
                {proj.status}
              </span>
            ) : null;
          })()}
        </div>
        <div className="flex-1 overflow-hidden">
          <AssetsContent key={JSON.stringify(sel)} assets={panelAssets} />
        </div>
      </div>
    </div>
  );
}
