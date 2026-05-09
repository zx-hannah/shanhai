// Shared assets sidebar panel - unified style for all project pages
import { useState } from "react";
import {
  ChevronLeft, ChevronDown, Search, Star, Plus, Video, Sparkles,
  Upload, Package, X, Image as LucideImage, Music, Users, Check,
  Film, Tag, Cpu, Scan, MoveRight,
} from "lucide-react";
import { toast } from "sonner";

type SubTab = "generate" | "upload" | "subject" | "collect";
type TypeFilter = "image" | "video" | "audio";

// ─── Asset data ──────────────────────────────────────────────────────────────
interface SidebarAsset {
  id: string;
  name: string;
  type: TypeFilter;
  src: string;
  size: string;
  date: string;
  memberId?: string;
}

interface GenerateAsset extends SidebarAsset {
  prompt: string;
  model: string;
  resolution: string;
  ratio: string;
  referenceImages?: string[];
  appliedTo?: { type: "subject" | "storyboard"; label: string; id: string }[];
}

const PROJECT_MEMBERS = [
  { id: "1", name: "Alice", avatar: "Al", color: "#E87322", role: "主创" },
  { id: "2", name: "Bob", avatar: "Bo", color: "#7B3FC4", role: "背景" },
  { id: "3", name: "Carol", avatar: "Ca", color: "#2A6FC4", role: "角色" },
  { id: "4", name: "Dave", avatar: "Da", color: "#C42A6F", role: "道具" },
];
const CURRENT_USER = PROJECT_MEMBERS[0];

const GENERATE_ASSETS: GenerateAsset[] = [
  {
    id: "g1", name: "古风女侠_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=200&q=70",
    size: "2.3MB", date: "今天", memberId: "1",
    prompt: "古风女侠，白发飞扬，身着月白色长袍，腰悬宝剑，气质冷峻仙气，画面风格参考敦煌壁画，高清质感，8K细节",
    model: "Seedream 3.0", resolution: "1024×1024", ratio: "1:1",
    referenceImages: [
      "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?w=100&q=60",
      "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?w=100&q=60",
    ],
    appliedTo: [
      { type: "subject", label: "女主角·林月", id: "s1" },
      { type: "storyboard", label: "分镜 #01", id: "sp1" },
    ],
  },
  {
    id: "g2", name: "古城背景_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=200&q=70",
    size: "1.8MB", date: "今天", memberId: "1",
    prompt: "古城楼全景，夕阳余晖，城墙斑驳，飞檐翘角，远景云雾缭绕，电影级构图，广角镜头",
    model: "Seedream 3.0", resolution: "1920×1080", ratio: "16:9",
    referenceImages: [
      "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=100&q=60",
    ],
    appliedTo: [
      { type: "storyboard", label: "分镜 #03", id: "sp3" },
    ],
  },
  {
    id: "g3", name: "山林场景.mp4", type: "video", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=200&q=70",
    size: "12MB", date: "今天", memberId: "2",
    prompt: "山林云雾缭绕，仙气飘渺，镜头缓慢推进，云海翻涌，光影变化",
    model: "Seedream 3.0 Video", resolution: "1280×720", ratio: "16:9",
    referenceImages: [],
    appliedTo: [
      { type: "storyboard", label: "分镜 #01", id: "sp1" },
    ],
  },
  {
    id: "g4", name: "道具宝剑.jpg", type: "image", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=200&q=70",
    size: "0.9MB", date: "昨天", memberId: "3",
    prompt: "古风宝剑，剑身晶莹，剑柄镶嵌宝石，蓝光流转，细节精致，暗色背景，特写镜头",
    model: "Seedream 3.0", resolution: "1024×1024", ratio: "1:1",
    referenceImages: [],
    appliedTo: [
      { type: "subject", label: "道具·宝剑", id: "s4" },
    ],
  },
  {
    id: "g5", name: "云雾山脉.jpg", type: "image", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=200&q=70",
    size: "4.2MB", date: "昨天", memberId: "2",
    prompt: "远山层叠，云海翻涌，日出金光，仙境氛围，中国山水画风格，水墨渲染",
    model: "Seedream 3.0", resolution: "2048×1024", ratio: "2:1",
    referenceImages: [
      "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=100&q=60",
    ],
    appliedTo: [],
  },
  {
    id: "g6", name: "片头动画.mp4", type: "video", src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?w=200&q=70",
    size: "28MB", date: "3天前", memberId: "1",
    prompt: "片头动画，水墨风转场，山海经异兽剪影，标题浮现，粒子效果",
    model: "Seedream 3.0 Video", resolution: "1920×1080", ratio: "16:9",
    referenceImages: [],
    appliedTo: [],
  },
];

const SIDEBAR_ASSETS: Record<SubTab, SidebarAsset[]> = {
  generate: GENERATE_ASSETS,
  upload: [
    { id: "u1", name: "人物参考_古装.jpg", type: "image", src: "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?w=200&q=70", size: "1.5MB", date: "昨天", memberId: "1" },
    { id: "u2", name: "角色立绘参考.jpg", type: "image", src: "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?w=200&q=70", size: "2.1MB", date: "3天前", memberId: "2" },
  ],
  subject: [
    { id: "s1", name: "女主角·林月.jpg", type: "image", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=200&q=70", size: "1.2MB", date: "今天", memberId: "1" },
    { id: "s2", name: "古风女侠_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=200&q=70", size: "2.3MB", date: "今天", memberId: "1" },
    { id: "s3", name: "古城背景_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=200&q=70", size: "1.8MB", date: "今天", memberId: "2" },
    { id: "s4", name: "道具宝剑.jpg", type: "image", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=200&q=70", size: "0.9MB", date: "昨天", memberId: "3" },
  ],
  collect: [
    { id: "c1", name: "白发女侠_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=200&q=70", size: "2.3MB", date: "今天", memberId: "1" },
    { id: "c2", name: "山林场景.jpg", type: "image", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=200&q=70", size: "3.1MB", date: "今天", memberId: "2" },
  ],
};

const ASSET_TYPE_ICONS: Record<TypeFilter, typeof LucideImage> = { image: LucideImage, video: Video, audio: Music };

// ─── Generate Asset Detail Panel ──────────────────────────────────────────────
function GenerateAssetDetail({ asset, onBack }: { asset: GenerateAsset; onBack: () => void }) {
  const member = PROJECT_MEMBERS.find(m => m.id === asset.memberId);

  return (
    <div className="absolute inset-0 z-40 flex flex-col" style={{ background: "#110E0A" }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-2.5 py-2.5 flex-shrink-0 border-b" style={{ borderBottomColor: "rgba(255,255,255,0.06)" }}>
        <button onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors hover:bg-white/5"
          style={{ color: "rgba(255,255,255,0.5)" }}>
          <ChevronLeft size={11} />返回
        </button>
        <div style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.08)" }} />
        <span className="truncate text-xs" style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500, flex: 1 }}>{asset.name}</span>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Preview image */}
        <div className="px-2.5 pt-2.5">
          <div className="rounded-lg overflow-hidden" style={{ background: "#1A1510", aspectRatio: asset.ratio === "1:1" ? "1" : asset.ratio === "16:9" ? "16/9" : asset.ratio === "2:1" ? "2/1" : "4/3" }}>
            <img src={asset.src} alt={asset.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Info sections */}
        <div className="px-2.5 py-2 flex flex-col gap-3">
          {/* Prompt */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles size={9} style={{ color: "#E87322" }} />
              <span className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>提示词</span>
            </div>
            <div className="rounded-lg p-2 text-[10px] leading-relaxed" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)" }}>
              {asset.prompt}
            </div>
          </div>

          {/* Tags: model, resolution, ratio */}
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Tag size={9} style={{ color: "rgba(255,255,255,0.3)" }} />
              <span className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>标签</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <div className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: "rgba(232,115,34,0.1)", border: "1px solid rgba(232,115,34,0.2)" }}>
                <Cpu size={8} style={{ color: "#E87322" }} />
                <span className="text-[10px]" style={{ color: "#E87322" }}>{asset.model}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: "rgba(74,158,224,0.1)", border: "1px solid rgba(74,158,224,0.2)" }}>
                <Scan size={8} style={{ color: "#4A9EE0" }} />
                <span className="text-[10px]" style={{ color: "#4A9EE0" }}>{asset.resolution}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: "rgba(74,198,120,0.1)", border: "1px solid rgba(74,198,120,0.2)" }}>
                <MoveRight size={8} style={{ color: "#4AC678" }} />
                <span className="text-[10px]" style={{ color: "#4AC678" }}>{asset.ratio}</span>
              </div>
            </div>
          </div>

          {/* Generator */}
          {member && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Users size={9} style={{ color: "rgba(255,255,255,0.3)" }} />
                <span className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>生成人员</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: member.color, fontSize: "7px", color: "#fff", fontWeight: 600 }}>
                  {member.avatar}
                </div>
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.65)" }}>{member.name}</span>
                <span className="text-[9px] px-1 py-0.5 rounded" style={{ background: `${member.color}15`, color: member.color }}>{member.role}</span>
              </div>
            </div>
          )}

          {/* Applied scenes */}
          {asset.appliedTo && asset.appliedTo.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Film size={9} style={{ color: "rgba(255,255,255,0.3)" }} />
                <span className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>已应用于</span>
              </div>
              <div className="flex flex-col gap-1">
                {asset.appliedTo.map((applied, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    {applied.type === "subject" ? (
                      <Package size={9} style={{ color: "#4AC678", flexShrink: 0 }} />
                    ) : (
                      <Film size={9} style={{ color: "#a78bfa", flexShrink: 0 }} />
                    )}
                    <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.65)" }}>{applied.label}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded ml-auto" style={{
                      background: applied.type === "subject" ? "rgba(74,198,120,0.12)" : "rgba(167,139,250,0.12)",
                      color: applied.type === "subject" ? "#4AC678" : "#a78bfa",
                    }}>
                      {applied.type === "subject" ? "主体" : "分镜"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface Props {
  projectId?: string;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function ProjectAssetsSidebarPanel({ projectId = "1", sidebarOpen = true, onToggleSidebar }: Props) {
  const [assetSubTab, setAssetSubTab] = useState<SubTab>("subject");
  const [assetTypeFilter, setAssetTypeFilter] = useState<TypeFilter>("image");
  const [assetSearch, setAssetSearch] = useState("");

  // Member filter: default to current user only (只看我的)
  const [memberFilter, setMemberFilter] = useState<string[]>([CURRENT_USER.id]);
  const [showMemberMenu, setShowMemberMenu] = useState(false);

  // Detail panel for generate assets
  const [detailAsset, setDetailAsset] = useState<GenerateAsset | null>(null);

  // Filter assets
  const filteredAssets = SIDEBAR_ASSETS[assetSubTab].filter(a => {
    if (a.type !== assetTypeFilter) return false;
    if (assetSearch && !a.name.toLowerCase().includes(assetSearch.toLowerCase())) return false;
    if (memberFilter.length > 0 && a.memberId && !memberFilter.includes(a.memberId)) return false;
    return true;
  });

  const toggleMemberFilter = (memberId: string) => {
    setMemberFilter(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleAssetClick = (asset: SidebarAsset) => {
    if (assetSubTab === "generate") {
      const genAsset = GENERATE_ASSETS.find(g => g.id === asset.id);
      if (genAsset) setDetailAsset(genAsset);
    }
  };

  if (!sidebarOpen) {
    return (
      <button
        onClick={onToggleSidebar}
        className="absolute top-2.5 left-1 z-10 w-5 h-5 rounded flex items-center justify-center hover:bg-white/10"
        style={{ color: "rgba(255,255,255,0.35)" }}
        title="展开侧边栏"
      >
        <ChevronLeft size={11} style={{ transform: "rotate(180deg)" }} />
      </button>
    );
  }

  return (
    <div className="flex flex-col h-full relative" onClick={() => setShowMemberMenu(false)}>
      {/* Collapse toggle */}
      {onToggleSidebar && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSidebar(); }}
          className="absolute top-2.5 -right-5 z-10 w-5 h-5 rounded flex items-center justify-center hover:bg-white/10"
          style={{ color: "rgba(255,255,255,0.35)" }}
          title="收起侧边栏"
        >
          <ChevronLeft size={11} />
        </button>
      )}

      {/* Title bar: 资产 */}
      <div className="flex items-center px-3 py-2 flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>资产</span>
      </div>

      {/* Tabs: 生成/上传/主体/收藏 */}
      <div className="flex items-center gap-1 px-2 py-1.5 flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        {[
          { key: "generate" as const, label: "生成", icon: Sparkles, color: "#E87322" },
          { key: "upload" as const, label: "上传", icon: Upload, color: "#3b82f6" },
          { key: "subject" as const, label: "主体", icon: Package, color: "#4AC678" },
          { key: "collect" as const, label: "收藏", icon: Star, color: "#a78bfa" },
        ].map(({ key, label, icon: Icon, color }) => (
          <button
            key={key}
            onClick={() => { setAssetSubTab(key); setDetailAsset(null); }}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs transition-colors"
            style={{
              background: assetSubTab === key ? `${color}18` : "transparent",
              color: assetSubTab === key ? color : "rgba(255,255,255,0.35)",
            }}
          >
            <Icon size={10} />
            <span style={{ fontSize: "10px" }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Filter row: search / member / type */}
      <div className="flex items-center gap-1.5 px-2 py-1.5 flex-shrink-0">
        {/* Search mini input */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 rounded px-1.5 py-1" style={{ background: "rgba(255,255,255,0.06)" }}>
            <Search size={8} style={{ color: "rgba(255,255,255,0.25)" }} />
            <input
              className="bg-transparent flex-1 outline-none min-w-0"
              style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", caretColor: "#E87322", padding: 0 }}
              placeholder="搜索..."
              value={assetSearch}
              onChange={(e) => setAssetSearch(e.target.value)}
            />
            {assetSearch && (
              <button onClick={() => setAssetSearch("")}>
                <X size={8} style={{ color: "rgba(255,255,255,0.25)" }} />
              </button>
            )}
          </div>
        </div>

        {/* Member filter button + dropdown */}
        <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowMemberMenu(!showMemberMenu)}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors"
            style={{
              background: memberFilter.length < PROJECT_MEMBERS.length ? "rgba(232,115,34,0.12)" : "rgba(255,255,255,0.04)",
              border: memberFilter.length < PROJECT_MEMBERS.length ? "1px solid rgba(232,115,34,0.25)" : "1px solid rgba(255,255,255,0.07)",
              color: memberFilter.length < PROJECT_MEMBERS.length ? "#E87322" : "rgba(255,255,255,0.4)",
            }}
          >
            <Users size={8} />
            {memberFilter.length === PROJECT_MEMBERS.length ? "全部" : memberFilter.length === 1 && memberFilter[0] === CURRENT_USER.id ? "我" : `${memberFilter.length}人`}
            <ChevronDown size={6} style={{ marginLeft: "1px" }} />
          </button>
          {showMemberMenu && (
            <div className="absolute left-0 top-full mt-1 rounded-xl overflow-hidden z-30 shadow-2xl"
              style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)", width: "150px" }}>
              {/* All members option */}
              <button
                onClick={() => setMemberFilter(PROJECT_MEMBERS.map(m => m.id))}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors"
                style={{
                  background: memberFilter.length === PROJECT_MEMBERS.length ? "rgba(232,115,34,0.15)" : "transparent",
                  color: memberFilter.length === PROJECT_MEMBERS.length ? "#E87322" : "rgba(255,255,255,0.6)",
                }}
              >
                <span>全部成员</span>
                {memberFilter.length === PROJECT_MEMBERS.length && (
                    <Check size={10} style={{ color: "#E87322" }} />
                  )}
              </button>
              <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
              {PROJECT_MEMBERS.map(member => {
                const selected = memberFilter.includes(member.id);
                return (
                  <button
                    key={member.id}
                    onClick={() => toggleMemberFilter(member.id)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors"
                    style={{
                      background: selected ? `${member.color}15` : "transparent",
                      color: selected ? member.color : "rgba(255,255,255,0.6)",
                    }}
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: member.color, fontSize: "8px", color: "#fff" }}>{member.avatar}</div>
                    <span className="flex-1">{member.name}</span>
                    {selected && (
                    <Check size={10} style={{ color: member.color }} />
                  )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Type select */}
        <select
          className="flex-shrink-0 rounded cursor-pointer outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.6)",
            fontSize: "10px",
            padding: "2px 4px",
            maxWidth: "60px",
          }}
          value={assetTypeFilter}
          onChange={(e) => setAssetTypeFilter(e.target.value as TypeFilter)}
        >
          <option value="image" style={{ background: "#2A2018" }}>图片</option>
          <option value="video" style={{ background: "#2A2018" }}>视频</option>
          <option value="audio" style={{ background: "#2A2018" }}>音频</option>
        </select>
      </div>

      {/* Asset grid or detail */}
      <div className="flex-1 overflow-hidden relative">
        {/* Detail overlay */}
        {detailAsset && (
          <GenerateAssetDetail asset={detailAsset} onBack={() => setDetailAsset(null)} />
        )}

        {/* Grid */}
        <div className="flex-1 overflow-auto px-2 pb-2 pt-1">
          {assetSubTab === "upload" && (
            <button
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg mb-2 transition-colors"
              style={{ border: "1px dashed rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)", fontSize: "10px" }}
              onClick={() => toast.success("请选择文件上传")}
            >
              <Upload size={10} />上传资产
            </button>
          )}

          {filteredAssets.length > 0 ? (
            <div className="grid grid-cols-2 gap-1.5">
              {filteredAssets.map((asset) => {
                const Icon = ASSET_TYPE_ICONS[asset.type];
                return (
                  <div
                    key={asset.id}
                    className="relative rounded-md overflow-hidden cursor-pointer group"
                    style={{ aspectRatio: "1", background: "#1A1510" }}
                    onClick={() => handleAssetClick(asset)}
                  >
                    <img
                      src={asset.src}
                      alt={asset.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {asset.type !== "image" && (
                      <div className="absolute top-1 left-1 px-1 py-0.5 rounded flex items-center"
                        style={{ background: "rgba(0,0,0,0.6)" }}>
                        <Icon size={7} style={{ color: "rgba(255,255,255,0.7)" }} />
                      </div>
                    )}
                    {/* Show detail indicator for generate tab */}
                    {assetSubTab === "generate" && (
                      <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: "rgba(232,115,34,0.7)" }}>
                        <ChevronLeft size={8} className="text-white" style={{ transform: "rotate(180deg)" }} />
                      </div>
                    )}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1"
                      style={{ background: "rgba(0,0,0,0.55)" }}
                    >
                      <button
                        className="w-5 h-5 rounded flex items-center justify-center"
                        style={{ background: "rgba(255,255,255,0.15)" }}
                        onClick={(e) => { e.stopPropagation(); toast.success("已添加到画布"); }}
                      >
                        <Plus size={8} className="text-white" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="flex flex-col items-center justify-center rounded-lg"
              style={{ height: "80px", border: "1px dashed rgba(255,255,255,0.1)" }}
            >
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>暂无内容</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
