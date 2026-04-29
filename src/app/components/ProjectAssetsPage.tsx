import { useState } from "react";
import {
  Image as LucideImage, Video, Music, Download, Star, Trash2, Check, Search,
  ChevronDown, X, Grid3X3, LayoutList, Pencil, ArrowDown, ArrowUp,
} from "lucide-react";
import { toast } from "sonner";

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
}

/* ─── Mock Data ─────────────────────────────────────────────────────────────── */

const ALL_ASSETS: AssetItem[] = [
  { id: "1", name: "白发女侠_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", size: "2.3 MB", date: "今天", dateTs: 4, collected: true, tab: "generate" },
  { id: "2", name: "古城背景_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", size: "1.8 MB", date: "今天", dateTs: 4, collected: false, tab: "generate" },
  { id: "3", name: "山林场景_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", size: "3.1 MB", date: "今天", dateTs: 4, collected: true, tab: "generate" },
  { id: "4", name: "道具宝剑_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", size: "0.9 MB", date: "今天", dateTs: 4, collected: false, tab: "generate" },
  { id: "5", name: "主角设定_v3.jpg", type: "image", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", size: "2.7 MB", date: "今天", dateTs: 4, collected: false, tab: "generate" },
  { id: "6", name: "云雾山脉背景.jpg", type: "image", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", size: "4.2 MB", date: "今天", dateTs: 4, collected: true, tab: "generate" },
  { id: "7", name: "人物参考_古装.jpg", type: "image", src: "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", size: "1.5 MB", date: "昨天", dateTs: 3, collected: false, tab: "upload" },
  { id: "8", name: "角色立绘参考.jpg", type: "image", src: "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", size: "2.1 MB", date: "昨天", dateTs: 3, collected: true, tab: "upload" },
  { id: "9", name: "战场BGM.mp3", type: "audio", src: null, size: "4.2 MB", date: "3天前", dateTs: 2, collected: false, tab: "upload" },
  { id: "10", name: "角色出场动效.mp4", type: "video", src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", size: "12 MB", date: "3天前", dateTs: 2, collected: false, tab: "generate" },
  { id: "11", name: "片头动画.mp4", type: "video", src: "https://images.unsplash.com/photo-1748838602679-32d82ccf188e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", size: "28 MB", date: "一周前", dateTs: 1, collected: true, tab: "generate" },
];

const TAB_LABELS: { key: AssetTab; label: string }[] = [
  { key: "generate", label: "全部生成" },
  { key: "upload", label: "历史上传" },
  { key: "subject", label: "主体资产" },
  { key: "collect", label: "全部收藏" },
];

const TYPE_ICONS = { image: LucideImage, video: Video, audio: Music };
const TYPE_LABELS: Record<AssetType, string> = { all: "全部类型", image: "图片", video: "视频", audio: "音频" };
const TYPE_CLR: Record<AssetType, string> = { all: "rgba(255,255,255,0.45)", image: "#3b82f6", video: "#a78bfa", audio: "#22c55e" };

/* ─── Asset Detail Modal ─────────────────────────────────────────────────────── */
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

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export function ProjectAssetsPage() {
  const [activeTab, setActiveTab] = useState<AssetTab>("generate");
  const [typeFilter, setTypeFilter] = useState<AssetType>("all");
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [collectedIds, setCollectedIds] = useState<Set<string>>(
    new Set(ALL_ASSETS.filter((a) => a.collected).map((a) => a.id)),
  );
  const [assets, setAssets] = useState<AssetItem[]>(ALL_ASSETS);
  const [searchText, setSearchText] = useState("");
  const [detailAsset, setDetailAsset] = useState<AssetItem | null>(null);

  // Batch mode
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredAssets = assets
    .filter((a) => {
      if (activeTab === "collect") return collectedIds.has(a.id);
      if (activeTab !== "subject" && a.tab !== activeTab) return false;
      if (typeFilter !== "all" && a.type !== typeFilter) return false;
      if (searchText && !a.name.toLowerCase().includes(searchText.toLowerCase())) return false;
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
    setAssets((prev) => prev.filter((a) => a.id !== id));
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    toast.success("已删除");
  };

  const selectAll = () => {
    if (selectedIds.size === filteredAssets.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredAssets.map((a) => a.id)));
  };

  // ── Grid card ──
  const renderGridCard = (asset: AssetItem, readOnly = false) => {
    const isCollected = collectedIds.has(asset.id);
    const TypeIcon = TYPE_ICONS[asset.type];
    const isSelected = selectedIds.has(asset.id);

    return (
      <div key={asset.id}
        className="rounded-xl overflow-hidden cursor-pointer group relative"
        style={{ background: "#1A1510", border: isSelected ? "2px solid #E87322" : "2px solid rgba(255,255,255,0.06)" }}
        onClick={() => { if (batchMode && !readOnly) { toggleSelect(asset.id); return; } setDetailAsset(asset); }}>
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
          {batchMode && !readOnly && (
            <div className="absolute top-2 left-2" onClick={(e) => { e.stopPropagation(); toggleSelect(asset.id); }}>
              <div className="w-5 h-5 rounded-md flex items-center justify-center"
                style={{ background: isSelected ? "#E87322" : "rgba(0,0,0,0.5)", border: isSelected ? "none" : "1.5px solid rgba(255,255,255,0.4)" }}>
                {isSelected && <Check size={10} className="text-white" />}
              </div>
            </div>
          )}
          {!readOnly && (
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
          )}
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

  // ── List row ──
  const renderListRow = (asset: AssetItem, readOnly = false) => {
    const isCollected = collectedIds.has(asset.id);
    const TypeIcon = TYPE_ICONS[asset.type];
    const isSelected = selectedIds.has(asset.id);
    return (
      <div key={asset.id}
        className="grid items-center px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer group"
        style={{ gridTemplateColumns: batchMode ? "28px 28px 1fr 64px 64px 64px" : "28px 1fr 64px 64px 64px", gap: "10px", background: isSelected ? "rgba(232,115,34,0.06)" : "transparent" }}
        onClick={() => { if (batchMode && !readOnly) { toggleSelect(asset.id); return; } setDetailAsset(asset); }}>
        {batchMode && !readOnly && (
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
          {!readOnly && (
            <>
              <button onClick={(e) => { e.stopPropagation(); toggleCollect(asset.id, e); }} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10">
                <Star size={11} style={{ color: isCollected ? "#E87322" : "rgba(255,255,255,0.35)", fill: isCollected ? "#E87322" : "transparent" }} />
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(asset.id); }} className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-900/20">
                <Trash2 size={11} style={{ color: "rgba(255,120,120,0.5)" }} />
              </button>
            </>
          )}
          <button onClick={(e) => { e.stopPropagation(); toast.success("下载已开始"); }} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10">
            <Download size={11} style={{ color: "rgba(255,255,255,0.35)" }} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "#140F09" }}
      onClick={() => { setShowTypeMenu(false); }}>

      {/* ── Tab Bar ── */}
      <div className="flex items-center gap-1 px-6 pt-5 pb-0 flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        {TAB_LABELS.map((tab) => (
          <button key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSelectedIds(new Set()); setBatchMode(false); }}
            className="px-4 py-2.5 text-sm transition-colors relative"
            style={{ color: activeTab === tab.key ? "#E87322" : "rgba(255,255,255,0.45)", borderBottom: activeTab === tab.key ? "2px solid #E87322" : "2px solid transparent", marginBottom: "-1px" }}>
            {tab.label}
            {tab.key === "collect" && collectedIds.size > 0 && (
              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(232,115,34,0.15)", color: "#E87322" }}>{collectedIds.size}</span>
            )}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 pb-2">
          <button onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="w-7 h-7 rounded flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {viewMode === "grid" ? <LayoutList size={14} /> : <Grid3X3 size={14} />}
          </button>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex items-center gap-2 px-6 py-2.5 flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        {/* Search */}
        <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 flex-1 max-w-xs"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <Search size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
          <input className="bg-transparent text-xs flex-1 outline-none" style={{ color: "rgba(255,255,255,0.7)" }}
            placeholder="搜索文件名..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          {searchText && <button onClick={() => setSearchText("")}><X size={11} style={{ color: "rgba(255,255,255,0.3)" }} /></button>}
        </div>

        {/* Type filter */}
        <div className="relative">
          <button onClick={() => setShowTypeMenu(!showTypeMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: typeFilter !== "all" ? "rgba(232,115,34,0.15)" : "rgba(255,255,255,0.05)", color: typeFilter !== "all" ? TYPE_CLR[typeFilter] : "rgba(255,255,255,0.45)", border: typeFilter !== "all" ? "1px solid rgba(232,115,34,0.3)" : "1px solid rgba(255,255,255,0.07)" }}>
            {typeFilter === "image" && <LucideImage size={10} />}{typeFilter === "video" && <Video size={10} />}{typeFilter === "audio" && <Music size={10} />}
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
                  {t === "image" && <LucideImage size={10} />}{t === "video" && <Video size={10} />}{t === "audio" && <Music size={10} />}
                  {TYPE_LABELS[t]}{typeFilter === t && <Check size={9} className="ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort toggle */}
        <button onClick={() => setSortOrder((o) => (o === "desc" ? "asc" : "desc"))}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {sortOrder === "desc" ? <ArrowDown size={10} /> : <ArrowUp size={10} />}
        </button>

        {/* Batch mode toggle */}
        <button onClick={() => { setBatchMode(!batchMode); if (batchMode) setSelectedIds(new Set()); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
          style={{ background: batchMode ? "rgba(232,115,34,0.15)" : "rgba(255,255,255,0.05)", color: batchMode ? "#E87322" : "rgba(255,255,255,0.45)", border: batchMode ? "1px solid rgba(232,115,34,0.3)" : "1px solid transparent" }}>
          <Check size={11} />批量
        </button>

        <span className="ml-auto text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
          共 {filteredAssets.length} 项
        </span>
      </div>

      {/* ── Batch Bar ── */}
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

      {/* ── Asset Content ── */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {viewMode === "grid" ? (
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))" }}>
            {filteredAssets.map((asset) => renderGridCard(asset))}
            {filteredAssets.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center h-48 rounded-2xl"
                style={{ border: "1px dashed rgba(255,255,255,0.08)" }}>
                <LucideImage size={32} style={{ color: "rgba(255,255,255,0.1)" }} />
                <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {activeTab === "collect" ? "暂无收藏内容" : "暂无资产"}
                </p>
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
                    style={{ border: "1.5px solid rgba(255,255,255,0.2)", background: selectedIds.size === filteredAssets.length && filteredAssets.length > 0 ? "#E87322" : "transparent" }}>
                    {selectedIds.size === filteredAssets.length && filteredAssets.length > 0 && <Check size={9} className="text-white" />}
                  </div>
                </button>
              )}
              <span>文件名</span><span>大小</span><span>日期</span><span>操作</span>
            </div>
            {filteredAssets.map((a) => renderListRow(a))}
            {filteredAssets.length === 0 && (
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
