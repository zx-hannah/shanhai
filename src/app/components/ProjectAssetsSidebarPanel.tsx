// Shared assets sidebar panel for Generate / Canvas / Storyboard pages
import { useState } from "react";
import {
  ChevronRight, Search, Star, Plus, Video, Sparkles,
  Upload, Package, X, Image, Music, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { PROJECTS_DATA } from "../data/projectsData";

type Section = "my" | "project";
type SubTab = "generate" | "upload" | "subject" | "collect";
type TypeFilter = "all" | "image" | "video" | "audio";

const SUB_TABS: { key: SubTab; label: string; icon: typeof Sparkles }[] = [
  { key: "generate", label: "生成", icon: Sparkles },
  { key: "upload",   label: "上传", icon: Upload   },
  { key: "subject",  label: "主体", icon: Package  },
  { key: "collect",  label: "收藏", icon: Star     },
];

const TYPE_FILTERS: { key: TypeFilter; label: string; icon?: typeof Image }[] = [
  { key: "all",   label: "全部"  },
  { key: "image", label: "图片", icon: Image },
  { key: "video", label: "视频", icon: Video },
  { key: "audio", label: "音频", icon: Music },
];

// ─── Asset data ──────────────────────────────────────────────────────────────
type AssetItem = { id: string; src: string; type: "image" | "video" | "audio" };

const MY_ASSETS: Record<SubTab, AssetItem[]> = {
  generate: [
    { id: "mg1", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=200&q=70", type: "image" },
    { id: "mg2", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=200&q=70", type: "image" },
    { id: "mg3", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=200&q=70", type: "image" },
    { id: "mg4", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=200&q=70", type: "image" },
    { id: "mg5", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=200&q=70", type: "image" },
    { id: "mg6", src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?w=200&q=70", type: "video" },
  ],
  upload: [
    { id: "mu1", src: "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?w=200&q=70", type: "image" },
    { id: "mu2", src: "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?w=200&q=70", type: "image" },
  ],
  subject: [],
  collect: [
    { id: "mc1", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=200&q=70", type: "image" },
    { id: "mc2", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=200&q=70", type: "image" },
    { id: "mc3", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=200&q=70", type: "image" },
  ],
};

const PROJECT_ASSETS: Record<string, Record<SubTab, AssetItem[]>> = {
  "1": {
    generate: [
      { id: "p1g1", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=200&q=70", type: "image" },
      { id: "p1g2", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=200&q=70", type: "image" },
      { id: "p1g3", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=200&q=70", type: "image" },
      { id: "p1g4", src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?w=200&q=70", type: "video" },
    ],
    upload: [
      { id: "p1u1", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=200&q=70", type: "image" },
    ],
    subject: [
      { id: "p1s1", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=200&q=70", type: "image" },
    ],
    collect: [
      { id: "p1c1", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=200&q=70", type: "image" },
    ],
  },
  "2": {
    generate: [
      { id: "p2g1", src: "https://images.unsplash.com/photo-1758930908621-550b64b0b1c1?w=200&q=70", type: "image" },
      { id: "p2g2", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=200&q=70", type: "image" },
    ],
    upload: [{ id: "p2u1", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=200&q=70", type: "image" }],
    subject: [],
    collect: [],
  },
};

// Fallback for projects without specific data
const getProjectAssets = (pid: string, tab: SubTab): AssetItem[] =>
  PROJECT_ASSETS[pid]?.[tab] ?? [];

// ─── Main component ───────────────────────────────────────────────────────────
interface Props {
  projectId?: string;
}

export function ProjectAssetsSidebarPanel({ projectId = "1" }: Props) {
  const [section, setSection] = useState<Section>("project");
  const [subTab, setSubTab] = useState<SubTab>("generate");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [search, setSearch] = useState("");
  const [collectedIds, setCollectedIds] = useState<Set<string>>(new Set());
  const [selectedProjectId, setSelectedProjectId] = useState(projectId);
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  // Derive asset list
  const rawAssets: AssetItem[] =
    section === "my"
      ? MY_ASSETS[subTab]
      : getProjectAssets(selectedProjectId, subTab);

  const filteredAssets = rawAssets.filter((a) => {
    if (typeFilter !== "all" && a.type !== typeFilter) return false;
    return true;
  });

  const currentProject = PROJECTS_DATA.find((p) => p.id === selectedProjectId);

  const switchSection = (s: Section) => {
    setSection(s);
    setSubTab("generate");
    setTypeFilter("all");
  };

  return (
    <div className="flex flex-col h-full" onClick={() => setShowProjectMenu(false)}>
      {/* Search */}
      <div className="px-2 pt-2 pb-1.5 flex-shrink-0">
        <div className="flex items-center gap-1.5 rounded-md px-2 py-1.5" style={{ background: "rgba(255,255,255,0.06)" }}>
          <Search size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
          <input
            className="bg-transparent flex-1 outline-none"
            style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", caretColor: "#E87322" }}
            placeholder="搜索资产..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")}>
              <X size={10} style={{ color: "rgba(255,255,255,0.3)" }} />
            </button>
          )}
        </div>
      </div>

      {/* Section toggle: 我的资产 / 项目资产 */}
      <div className="flex mx-2 mb-1 rounded-lg overflow-hidden flex-shrink-0"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {(["my", "project"] as Section[]).map((s) => (
          <button
            key={s}
            onClick={() => switchSection(s)}
            className="flex-1 py-1.5 text-xs transition-colors"
            style={{
              background: section === s ? "rgba(232,115,34,0.2)" : "transparent",
              color: section === s ? "#E87322" : "rgba(255,255,255,0.4)",
              borderBottom: section === s ? "2px solid #E87322" : "2px solid transparent",
            }}
          >
            {s === "my" ? "我的资产" : "项目资产"}
          </button>
        ))}
      </div>

      {/* Project selector (only for project section) */}
      {section === "project" && (
        <div className="px-2 mb-1 relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors hover:bg-white/5"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            onClick={() => setShowProjectMenu(!showProjectMenu)}
          >
            <ChevronRight size={9} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
            <span className="flex-1 text-left truncate" style={{ color: "rgba(255,255,255,0.65)" }}>
              {currentProject?.name ?? "选择项目"}
            </span>
            <ChevronDown size={9} style={{ color: "rgba(255,255,255,0.3)" }} />
          </button>
          {showProjectMenu && (
            <div className="absolute left-2 right-2 top-full mt-1 rounded-xl overflow-hidden z-30 shadow-2xl"
              style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)" }}>
              {PROJECTS_DATA.slice(0, 6).map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedProjectId(p.id); setShowProjectMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-white/5 transition-colors"
                  style={{ color: selectedProjectId === p.id ? "#E87322" : "rgba(255,255,255,0.6)" }}
                >
                  <span className="flex-1 truncate">{p.name}</span>
                  {selectedProjectId === p.id && (
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#E87322" }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-tabs: 生成 / 上传 / 主体 / 收藏 */}
      <div className="flex items-center gap-0.5 px-2 mb-1 flex-shrink-0">
        {SUB_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSubTab(key)}
            className="flex items-center gap-1 flex-1 justify-center py-1.5 rounded-md text-xs transition-colors"
            style={{
              background: subTab === key ? "rgba(232,115,34,0.15)" : "rgba(255,255,255,0.03)",
              color: subTab === key ? "#E87322" : "rgba(255,255,255,0.35)",
              border: subTab === key ? "1px solid rgba(232,115,34,0.2)" : "1px solid transparent",
            }}
          >
            <Icon size={9} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Type filter */}
      <div className="flex items-center gap-0.5 px-2 mb-2 flex-shrink-0">
        {TYPE_FILTERS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTypeFilter(key)}
            className="flex items-center gap-0.5 flex-1 justify-center py-1 rounded text-xs transition-colors"
            style={{
              background: typeFilter === key ? "rgba(232,115,34,0.1)" : "transparent",
              color: typeFilter === key ? "#E87322" : "rgba(255,255,255,0.3)",
              fontSize: "9px",
            }}
          >
            {Icon && <Icon size={8} />}
            {label}
          </button>
        ))}
      </div>

      {/* Asset grid */}
      <div className="flex-1 overflow-auto px-2 pb-2">
        {subTab === "upload" && (
          <button
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg mb-2 hover:bg-white/5 transition-colors"
            style={{ border: "1px dashed rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)", fontSize: "10px" }}
            onClick={() => toast.success("请选择文件上传")}
          >
            <Upload size={10} />上传资产
          </button>
        )}

        {filteredAssets.length > 0 ? (
          <div className="grid grid-cols-2 gap-1.5">
            {filteredAssets.map((asset) => {
              const isCollected = collectedIds.has(asset.id);
              return (
                <div
                  key={asset.id}
                  className="relative rounded-md overflow-hidden cursor-pointer group"
                  style={{ aspectRatio: "1", background: "#1A1510" }}
                >
                  <img
                    src={asset.src}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {asset.type === "video" && (
                    <div className="absolute top-1 left-1 px-1 py-0.5 rounded flex items-center"
                      style={{ background: "rgba(0,0,0,0.6)" }}>
                      <Video size={7} style={{ color: "rgba(255,255,255,0.7)" }} />
                    </div>
                  )}
                  {asset.type === "audio" && (
                    <div className="absolute top-1 left-1 px-1 py-0.5 rounded flex items-center"
                      style={{ background: "rgba(0,0,0,0.6)" }}>
                      <Music size={7} style={{ color: "rgba(255,255,255,0.7)" }} />
                    </div>
                  )}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1"
                    style={{ background: "rgba(0,0,0,0.55)" }}
                  >
                    <button
                      className="w-5 h-5 rounded flex items-center justify-center"
                      style={{ background: "rgba(255,255,255,0.15)" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCollectedIds((prev) => {
                          const n = new Set(prev);
                          isCollected ? n.delete(asset.id) : n.add(asset.id);
                          return n;
                        });
                        toast.success(isCollected ? "已取消收藏" : "收藏成功");
                      }}
                    >
                      <Star size={8} style={{ color: isCollected ? "#E87322" : "white", fill: isCollected ? "#E87322" : "transparent" }} />
                    </button>
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
  );
}
