import { useState, useEffect, useRef } from "react";
import {
  ChevronRight, Plus, Film, MoreHorizontal, AlignLeft, LayoutGrid,
  Filter, Settings2, Upload, Download, X, Check, Pencil, Trash2,
  Users, Clock, ChevronDown, Share2, Link, Eye, Edit3,
  ChevronLeft, Sparkles, Package, Star, Search, Image as LucideImage, Video, Music,
} from "lucide-react";
import { toast } from "sonner";
import { ProjectAssetsSidebarPanel } from "./ProjectAssetsSidebarPanel";

// ─── Data types ───────────────────────────────────────────────────────────────
type ProgressStatus = "待审核" | "审核中" | "已完成" | "未开始";
type ViewMode = "card" | "table";

interface StoryPanel {
  id: string;
  rowNo: number;
  eventType: "场" | "景" | "特效";
  sceneLabel: string;
  shotNo: string;
  script: string;
  refImg?: string;
  storyboardImg?: string;
  crew: string[];
  duration: string;
  progress: ProgressStatus;
  notes: string;
}

interface StoryScene {
  id: string;
  name: string;
  panels: StoryPanel[];
}

interface StoryEpisode {
  id: string;
  name: string;
  scenes: StoryScene[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const EPISODES: StoryEpisode[] = [
  {
    id: "ep1",
    name: "第一集",
    scenes: [
      {
        id: "s1",
        name: "第一幕 · 引子",
        panels: [
          { id: "p1", rowNo: 1, eventType: "场", sceneLabel: "第1场", shotNo: "1", script: "本场在从利行办楼高昇独的没不功风，有著而理分，吞使亦不们事出的是轮止分这特别，区现在墒囧做方，不表土本术习，计特台国动时谁行。公车揭在", refImg: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&q=80", storyboardImg: "https://images.unsplash.com/photo-1636075219672-a422660ce589?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&q=80", crew: ["小明", "小红"], duration: "5s", progress: "待审核", notes: "" },
          { id: "p2", rowNo: 2, eventType: "场", sceneLabel: "第1场", shotNo: "2", script: "本场在从利行办楼高昇独的没不功风，有著而理分，吞使亦不们事出的是轮止分这特别，区现在墒囧做方，不表土本术习，计特台国动时谁行。", refImg: undefined, storyboardImg: "https://images.unsplash.com/photo-1551264397-09c6f678a930?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&q=80", crew: [], duration: "5s", progress: "待审核", notes: "" },
          { id: "p3", rowNo: 3, eventType: "景", sceneLabel: "第1场", shotNo: "3", script: "远景，云雾缭绕的仙山，配乐悠扬", refImg: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&q=80", storyboardImg: "https://images.unsplash.com/photo-1743951896798-2936f661f939?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&q=80", crew: ["小明"], duration: "3s", progress: "已完成", notes: "推镜头" },
          { id: "p4", rowNo: 4, eventType: "场", sceneLabel: "第2场", shotNo: "1", script: "中远景，女主角从云雾中缓步走出，白发飘扬", refImg: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&q=80", storyboardImg: undefined, crew: ["小红"], duration: "4.5s", progress: "审核中", notes: "跟拍" },
          { id: "p5", rowNo: 5, eventType: "特效", sceneLabel: "第2场", shotNo: "2", script: "全景，拔剑，剑光四射，特效叠加", refImg: "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&q=80", storyboardImg: "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&q=80", crew: ["小明", "小红"], duration: "2.5s", progress: "未开始", notes: "升格拍摄" },
        ],
      },
      {
        id: "s2",
        name: "第二幕 · 对决",
        panels: [
          { id: "p6", rowNo: 1, eventType: "场", sceneLabel: "第1场", shotNo: "1", script: "双方对峙，气氛剑拔弩张", refImg: "https://images.unsplash.com/photo-1551264397-09c6f678a930?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&q=80", storyboardImg: undefined, crew: ["小明"], duration: "3.0s", progress: "未开始", notes: "双人中景" },
        ],
      },
    ],
  },
  { id: "ep2", name: "第二集", scenes: [{ id: "s3", name: "第一幕 · 启程", panels: [{ id: "p7", rowNo: 1, eventType: "场", sceneLabel: "第1场", shotNo: "1", script: "晨雾中的古道，旅人启程", refImg: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&q=80", storyboardImg: undefined, crew: ["小明"], duration: "4.0s", progress: "未开始", notes: "横移镜头" }] }] },
  { id: "ep3", name: "第三集", scenes: [] },
  { id: "ep4", name: "第四集", scenes: [] },
];

// ─── Column definitions ───────────────────────────────────────────────────────
type ColumnKey = "eventType" | "sceneLabel" | "shotNo" | "script" | "refImg" | "storyboardImg" | "crew" | "duration" | "progress" | "notes";
const ALL_COLUMNS: { key: ColumnKey; label: string; width: number }[] = [
  { key: "eventType", label: "事件", width: 60 },
  { key: "sceneLabel", label: "场次", width: 80 },
  { key: "shotNo", label: "分镜号", width: 70 },
  { key: "script", label: "文字脚本", width: 260 },
  { key: "refImg", label: "画面参考", width: 140 },
  { key: "storyboardImg", label: "分镜图", width: 140 },
  { key: "crew", label: "人员", width: 100 },
  { key: "duration", label: "时长", width: 70 },
  { key: "progress", label: "画面进度", width: 100 },
  { key: "notes", label: "备注", width: 120 },
];

const PROGRESS_STYLES: Record<ProgressStatus, { bg: string; color: string }> = {
  待审核: { bg: "rgba(232,115,34,0.15)", color: "#E87322" },
  审核中: { bg: "rgba(74,158,224,0.15)", color: "#4A9EE0" },
  已完成: { bg: "rgba(74,198,120,0.15)", color: "#4AC678" },
  未开始: { bg: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.35)" },
};

const ART_SETTINGS = [
  { id: "chars", name: "人物设定", status: "有进展" as const },
  { id: "scenes", name: "场景设定", status: "有进展" as const },
  { id: "props", name: "道具设定", status: "未开始" as const },
];

type StorySidebarTab = "files" | "assets";
type StoryAssetSubTab = "generate" | "upload" | "subject" | "collect";

const STORY_ASSETS = [
  { id: "sa1", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200&q=70", name: "白发女侠_v1.jpg", type: "image" as const },
  { id: "sa2", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200&q=70", name: "古城背景.jpg", type: "image" as const },
  { id: "sa3", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200&q=70", name: "山林场景.jpg", type: "image" as const },
  { id: "sa4", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200&q=70", name: "远景背景.jpg", type: "image" as const },
  { id: "sa5", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200&q=70", name: "战斗特效.jpg", type: "image" as const },
  { id: "sa6", src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200&q=70", name: "动效_v1.mp4", type: "video" as const },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export function ProjectStoryboardPage() {
  const [episodes, setEpisodes] = useState<StoryEpisode[]>(EPISODES);
  const [activeEpisodeId, setActiveEpisodeId] = useState("ep1");
  const [activeSceneId, setActiveSceneId] = useState("s1");
  const [expandedEpisodes, setExpandedEpisodes] = useState<Record<string, boolean>>({ ep1: true });
  const [expandedArt, setExpandedArt] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [storySidebarTab, setStorySidebarTab] = useState<StorySidebarTab>("files");
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
    eventType: true, sceneLabel: true, shotNo: true, script: true,
    refImg: true, storyboardImg: true, crew: true, duration: true,
    progress: true, notes: true,
  });
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [editingPanelId, setEditingPanelId] = useState<string | null>(null);
  const [editField, setEditField] = useState<string>("");
  const [editValue, setEditValue] = useState<string>("");
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const [sortDuration, setSortDuration] = useState<"none" | "asc" | "desc">("none");
  const [showShareModal, setShowShareModal] = useState(false);
  const [progressDropdownId, setProgressDropdownId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!progressDropdownId) return;
    const handler = (e: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        setProgressDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [progressDropdownId]);

  const activeEpisode = episodes.find((e) => e.id === activeEpisodeId);
  const activeScene = activeEpisode?.scenes.find((s) => s.id === activeSceneId);

  const toggleEpisode = (id: string) => setExpandedEpisodes((prev) => ({ ...prev, [id]: !prev[id] }));

  const getPanels = (): StoryPanel[] => {
    const panels = activeScene?.panels ?? [];
    if (sortDuration === "none") return panels;
    return [...panels].sort((a, b) => {
      const av = parseFloat(a.duration);
      const bv = parseFloat(b.duration);
      return sortDuration === "asc" ? av - bv : bv - av;
    });
  };

  const totalPanels = (ep: StoryEpisode) => ep.scenes.reduce((acc, s) => acc + s.panels.length, 0);
  const completedPanels = (ep: StoryEpisode) => ep.scenes.reduce((acc, s) => acc + s.panels.filter((p) => p.progress === "已完成").length, 0);

  const addPanel = () => {
    if (!activeScene) return;
    const newPanel: StoryPanel = {
      id: `p${Date.now()}`,
      rowNo: activeScene.panels.length + 1,
      eventType: "场",
      sceneLabel: `第${activeScene.panels.length + 1}场`,
      shotNo: String(activeScene.panels.length + 1),
      script: "请填写文字脚本",
      crew: [],
      duration: "3s",
      progress: "未开始",
      notes: "",
    };
    setEpisodes((prev) => prev.map((ep) => ep.id === activeEpisodeId ? {
      ...ep, scenes: ep.scenes.map((sc) => sc.id === activeSceneId ? { ...sc, panels: [...sc.panels, newPanel] } : sc)
    } : ep));
    toast.success("已新增分镜");
  };

  const deletePanel = (panelId: string) => {
    setEpisodes((prev) => prev.map((ep) => ep.id === activeEpisodeId ? {
      ...ep, scenes: ep.scenes.map((sc) => sc.id === activeSceneId ? { ...sc, panels: sc.panels.filter((p) => p.id !== panelId) } : sc)
    } : ep));
    toast.success("已删除分镜");
  };

  const updatePanelField = (panelId: string, field: string, value: string) => {
    setEpisodes((prev) => prev.map((ep) => ep.id === activeEpisodeId ? {
      ...ep, scenes: ep.scenes.map((sc) => sc.id === activeSceneId ? {
        ...sc, panels: sc.panels.map((p) => p.id === panelId ? { ...p, [field]: value } : p)
      } : sc)
    } : ep));
    setEditingPanelId(null);
  };

  const startEdit = (panelId: string, field: string, currentValue: string) => {
    setEditingPanelId(panelId);
    setEditField(field);
    setEditValue(currentValue);
  };

  const panels = getPanels();

  return (
    <>
    <div className="flex h-full" style={{ background: "#140F09" }}>
      {/* ── Secondary Sidebar ─────────────────────────────────────────────── */}
      <div
        className="flex flex-col flex-shrink-0 relative"
        style={{
          width: sidebarCollapsed ? "28px" : "220px",
          background: "#110E0A",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          transition: "width 0.2s ease",
          overflow: "hidden",
        }}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-2 right-1 z-10 w-5 h-5 rounded flex items-center justify-center hover:bg-white/10"
          style={{ color: "rgba(255,255,255,0.35)" }}
          title={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
        >
          {sidebarCollapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
        </button>

        {!sidebarCollapsed && (
          <>
            {/* Sidebar tabs: 文件 / 资产 */}
            <div className="flex flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {([
                { key: "files" as const, label: "文件" },
                { key: "assets" as const, label: "资产" },
              ]).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStorySidebarTab(tab.key)}
                  className="flex-1 py-2.5 text-xs transition-colors"
                  style={{
                    color: storySidebarTab === tab.key ? "#E87322" : "rgba(255,255,255,0.4)",
                    borderBottom: storySidebarTab === tab.key ? "2px solid #E87322" : "2px solid transparent",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {storySidebarTab === "files" && (
              <>
                {/* Files tab header */}
                <div className="flex items-center justify-between px-3 py-2 border-b flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center gap-1.5">
                    <Film size={11} style={{ color: "#E87322" }} />
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>故事板</span>
                  </div>
                  <button title="新建集" onClick={() => toast.success("新建集功能")}>
                    <Plus size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
                  </button>
                </div>

                <div className="flex-1 overflow-auto py-1">
                  {/* Episodes */}
                  {episodes.map((episode) => {
                    const isExpanded = expandedEpisodes[episode.id];
                    const total = totalPanels(episode);
                    const completed = completedPanels(episode);
                    return (
                      <div key={episode.id} className="mb-0.5">
                        <button
                          onClick={() => { setActiveEpisodeId(episode.id); toggleEpisode(episode.id); if (episode.scenes.length > 0) setActiveSceneId(episode.scenes[0].id); }}
                          className="w-full flex items-center gap-1.5 px-2 py-2 text-left transition-colors hover:bg-white/5 group"
                        >
                          <ChevronRight size={11} style={{ color: "rgba(255,255,255,0.35)", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s" }} />
                          <Film size={12} style={{ color: "#E87322", flexShrink: 0 }} />
                          <span className="flex-1 text-xs" style={{ color: activeEpisodeId === episode.id ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)" }}>{episode.name}</span>
                          {total > 0 && <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)" }}>{completed}/{total}</span>}
                        </button>

                        {isExpanded && episode.scenes.length > 0 && (
                          <div className="ml-5">
                            {episode.scenes.map((scene) => {
                              const isActiveScene = activeSceneId === scene.id && activeEpisodeId === episode.id;
                              return (
                                <button
                                  key={scene.id}
                                  onClick={() => { setActiveEpisodeId(episode.id); setActiveSceneId(scene.id); }}
                                  className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-left transition-colors"
                                  style={{ background: isActiveScene ? "rgba(232,115,34,0.12)" : "transparent", color: isActiveScene ? "#E87322" : "rgba(255,255,255,0.45)" }}
                                  onMouseEnter={(e) => { if (!isActiveScene) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
                                  onMouseLeave={(e) => { if (!isActiveScene) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                                >
                                  <AlignLeft size={10} style={{ flexShrink: 0 }} />
                                  <span className="text-xs truncate">{scene.name}</span>
                                  <span className="ml-auto" style={{ fontSize: "9px" }}>{scene.panels.length}</span>
                                </button>
                              );
                            })}
                            <button className="w-full flex items-center gap-1.5 px-2 py-1.5 text-left hover:bg-white/5" style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px" }}>
                              <Plus size={10} />新建幕
                            </button>
                          </div>
                        )}

                        {isExpanded && episode.scenes.length === 0 && (
                          <div className="ml-5">
                            <button className="w-full flex items-center gap-1.5 px-2 py-1.5 text-left hover:bg-white/5" style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px" }}>
                              <Plus size={10} />新建幕
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {storySidebarTab === "assets" && (
              <div className="flex flex-col h-full overflow-hidden">
                <ProjectAssetsSidebarPanel />
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Main Storyboard Area ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#0D0A06" }}>
          {/* Breadcrumb + progress */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm truncate" style={{ color: "rgba(255,255,255,0.8)" }}>{activeEpisode?.name}</span>
            <ChevronRight size={11} style={{ color: "rgba(255,255,255,0.25)" }} />
            <span className="text-sm truncate" style={{ color: "rgba(255,255,255,0.55)" }}>{activeScene?.name ?? "—"}</span>
            {activeEpisode && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full ml-1 flex-shrink-0"
                style={{ background: "rgba(232,115,34,0.12)" }}>
                <span style={{ fontSize: "10px", color: "#E87322" }}>
                  进度 {completedPanels(activeEpisode)}/{totalPanels(activeEpisode)} 片
                </span>
              </div>
            )}
          </div>

          {/* View type tabs */}
          <div className="flex items-center gap-1 ml-4">
            <button onClick={() => setViewMode("table")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
              style={{ background: viewMode === "table" ? "rgba(232,115,34,0.15)" : "rgba(255,255,255,0.05)", color: viewMode === "table" ? "#E87322" : "rgba(255,255,255,0.4)" }}>
              <AlignLeft size={11} />画面表
            </button>
            <button onClick={() => setViewMode("card")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
              style={{ background: viewMode === "card" ? "rgba(232,115,34,0.15)" : "rgba(255,255,255,0.05)", color: viewMode === "card" ? "#E87322" : "rgba(255,255,255,0.4)" }}>
              <LayoutGrid size={11} />卡片视图
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/5 transition-colors" style={{ color: "rgba(255,255,255,0.3)", border: "1px dashed rgba(255,255,255,0.1)" }}>
              <Plus size={11} />新建视图
            </button>
          </div>

          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 transition-colors" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Upload size={11} />上传脚本
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 transition-colors"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <Share2 size={11} />分享
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:opacity-80 transition-opacity" style={{ background: "#E87322", color: "white" }}>
              <Download size={11} />导出
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 px-5 py-2.5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <Filter size={11} />筛选
            </button>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 transition-colors"
              style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <Settings2 size={11} />列设置
            </button>
            {showColumnMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowColumnMenu(false)} />
                <div className="absolute top-full mt-1 left-0 z-20 rounded-xl overflow-hidden" style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.6)", minWidth: "160px" }}>
                  {ALL_COLUMNS.map((col) => (
                    <button key={col.key} onClick={() => setVisibleColumns((prev) => ({ ...prev, [col.key]: !prev[col.key] }))} className="w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-white/5" style={{ color: "rgba(255,255,255,0.6)" }}>
                      {col.label}
                      <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: visibleColumns[col.key] ? "#E87322" : "rgba(255,255,255,0.1)" }}>
                        {visibleColumns[col.key] && <Check size={9} className="text-white" />}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
              {panels.length} 个分镜
            </span>
            <button
              onClick={addPanel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:opacity-80"
              style={{ background: "#E87322", color: "white" }}
            >
              <Plus size={11} />新增分镜
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {viewMode === "table" ? (
            /* TABLE VIEW */
            <div ref={tableRef} style={{ minWidth: "fit-content" }}>
              {/* Table header */}
              <div className="flex items-center sticky top-0 z-10 flex-shrink-0" style={{ background: "#110E0A", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {/* Row number */}
                <div className="flex items-center justify-center flex-shrink-0" style={{ width: "48px", height: "36px", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>#</span>
                </div>
                {/* Columns */}
                {ALL_COLUMNS.filter((c) => visibleColumns[c.key]).map((col) => (
                  <div key={col.key} className="flex items-center gap-1 px-3 flex-shrink-0"
                    style={{ width: `${col.width}px`, height: "36px", borderRight: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>{col.label}</span>
                    {col.key === "duration" && (
                      <button onClick={() => setSortDuration((s) => s === "none" ? "desc" : s === "desc" ? "asc" : "none")} className="ml-0.5 flex-shrink-0">
                        <ChevronDown size={9} style={{ color: sortDuration !== "none" ? "#E87322" : "rgba(255,255,255,0.25)", transform: sortDuration === "asc" ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                      </button>
                    )}
                  </div>
                ))}
                {/* Add column */}
                <div className="flex items-center justify-center flex-shrink-0 px-3" style={{ width: "40px", height: "36px" }}>
                  <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10" title="添加列">
                    <Plus size={11} style={{ color: "rgba(255,255,255,0.25)" }} />
                  </button>
                </div>
              </div>

              {/* Rows */}
              {panels.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16" style={{ color: "rgba(255,255,255,0.2)" }}>
                  <Film size={32} />
                  <p className="mt-3 text-sm">暂无分镜，点击「新增分镜」开始创作</p>
                </div>
              ) : (
                panels.map((panel) => {
                  const isSelected = selectedPanelId === panel.id;
                  return (
                    <div
                      key={panel.id}
                      className="flex items-stretch group transition-colors"
                      style={{
                        background: isSelected ? "rgba(232,115,34,0.04)" : "transparent",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        minHeight: "72px",
                      }}
                      onClick={() => setSelectedPanelId(isSelected ? null : panel.id)}
                    >
                      {/* Row number */}
                      <div className="flex items-center justify-center flex-shrink-0 relative" style={{ width: "48px", borderRight: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>{panel.rowNo}</span>
                        <button className="absolute right-0.5 top-1 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded hover:bg-red-900/20"
                          onClick={(e) => { e.stopPropagation(); deletePanel(panel.id); }}>
                          <X size={9} style={{ color: "rgba(255,100,100,0.5)" }} />
                        </button>
                      </div>

                      {/* Columns */}
                      {ALL_COLUMNS.filter((c) => visibleColumns[c.key]).map((col) => {
                        const isEditing = editingPanelId === panel.id && editField === col.key;
                        return (
                          <div key={col.key} className="flex items-start px-3 py-2 flex-shrink-0" style={{ width: `${col.width}px`, borderRight: "1px solid rgba(255,255,255,0.04)" }}
                            onDoubleClick={() => {
                              if (col.key !== "refImg" && col.key !== "storyboardImg" && col.key !== "crew" && col.key !== "progress") {
                                const val = String(panel[col.key as keyof StoryPanel] ?? "");
                                startEdit(panel.id, col.key, val);
                              }
                            }}
                          >
                            {col.key === "eventType" && (
                              <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: "rgba(232,115,34,0.15)", color: "#E87322", fontSize: "11px", flexShrink: 0 }}>{panel.eventType}</span>
                            )}

                            {col.key === "sceneLabel" && (
                              isEditing ? (
                                <input autoFocus className="w-full bg-transparent text-xs outline-none" style={{ border: "1px solid rgba(232,115,34,0.4)", borderRadius: "4px", padding: "2px 6px", color: "rgba(255,255,255,0.8)", caretColor: "#E87322" }}
                                  value={editValue} onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() => updatePanelField(panel.id, col.key, editValue)}
                                  onKeyDown={(e) => { if (e.key === "Enter") updatePanelField(panel.id, col.key, editValue); if (e.key === "Escape") setEditingPanelId(null); }} />
                              ) : (
                                <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{panel.sceneLabel}</span>
                              )
                            )}

                            {col.key === "shotNo" && (
                              isEditing ? (
                                <input autoFocus className="w-full bg-transparent text-xs outline-none" style={{ border: "1px solid rgba(232,115,34,0.4)", borderRadius: "4px", padding: "2px 6px", color: "rgba(255,255,255,0.8)", caretColor: "#E87322" }}
                                  value={editValue} onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() => updatePanelField(panel.id, col.key, editValue)}
                                  onKeyDown={(e) => { if (e.key === "Enter") updatePanelField(panel.id, col.key, editValue); if (e.key === "Escape") setEditingPanelId(null); }} />
                              ) : (
                                <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{panel.shotNo}</span>
                              )
                            )}

                            {col.key === "script" && (
                              isEditing ? (
                                <textarea autoFocus className="w-full bg-transparent text-xs outline-none resize-none" style={{ border: "1px solid rgba(232,115,34,0.4)", borderRadius: "4px", padding: "4px 6px", color: "rgba(255,255,255,0.8)", caretColor: "#E87322", height: "60px" }}
                                  value={editValue} onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() => updatePanelField(panel.id, col.key, editValue)}
                                  onKeyDown={(e) => { if (e.key === "Escape") setEditingPanelId(null); }} />
                              ) : (
                                <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{panel.script}</span>
                              )
                            )}

                            {col.key === "refImg" && (
                              panel.refImg ? (
                                <div className="rounded-md overflow-hidden" style={{ width: "100px", height: "64px" }}>
                                  <img src={panel.refImg} alt="" className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="flex items-center justify-center rounded-md" style={{ width: "100px", height: "64px", background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.07)" }}>
                                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.15)" }}>—</span>
                                </div>
                              )
                            )}

                            {col.key === "storyboardImg" && (
                              panel.storyboardImg ? (
                                <div className="rounded-md overflow-hidden" style={{ width: "100px", height: "64px" }}>
                                  <img src={panel.storyboardImg} alt="" className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="flex items-center justify-center rounded-md" style={{ width: "100px", height: "64px", background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.07)" }}>
                                  <Plus size={14} style={{ color: "rgba(255,255,255,0.1)" }} />
                                </div>
                              )
                            )}

                            {col.key === "crew" && (
                              <div className="flex flex-wrap gap-1">
                                {panel.crew.map((name, i) => (
                                  <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0"
                                    style={{ background: i === 0 ? "#E87322" : "#4A9EE0", fontSize: "9px", fontWeight: 600 }}>
                                    {name[0]}
                                  </div>
                                ))}
                                {panel.crew.length === 0 && (
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)", border: "1px dashed rgba(255,255,255,0.15)" }}>
                                    <Plus size={9} style={{ color: "rgba(255,255,255,0.2)" }} />
                                  </div>
                                )}
                              </div>
                            )}

                            {col.key === "duration" && (
                              isEditing ? (
                                <input autoFocus className="w-full bg-transparent text-xs outline-none" style={{ border: "1px solid rgba(232,115,34,0.4)", borderRadius: "4px", padding: "2px 6px", color: "rgba(255,255,255,0.8)", caretColor: "#E87322", width: "50px" }}
                                  value={editValue} onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() => updatePanelField(panel.id, col.key, editValue)}
                                  onKeyDown={(e) => { if (e.key === "Enter") updatePanelField(panel.id, col.key, editValue); if (e.key === "Escape") setEditingPanelId(null); }} />
                              ) : (
                                <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{panel.duration}</span>
                              )
                            )}

                            {col.key === "progress" && (
                              <div className="relative flex-shrink-0">
                                <button className="px-2 py-0.5 rounded text-xs"
                                  style={{ background: PROGRESS_STYLES[panel.progress].bg, color: PROGRESS_STYLES[panel.progress].color, fontSize: "11px" }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProgressDropdownId(progressDropdownId === panel.id ? null : panel.id);
                                  }}
                                >
                                  {panel.progress}
                                </button>
                                {progressDropdownId === panel.id && (
                                  <div className="absolute top-full left-0 mt-1 z-50 rounded-md overflow-hidden shadow-lg border border-white/10"
                                    style={{ background: "#1a1714", minWidth: "90px" }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {(["待审核", "审核中", "已完成", "未开始"] as ProgressStatus[]).map((status) => (
                                      <button key={status}
                                        className="w-full text-left px-3 py-1.5 text-xs transition-colors"
                                        style={{
                                          color: panel.progress === status ? PROGRESS_STYLES[status].color : "rgba(255,255,255,0.6)",
                                          background: panel.progress === status ? PROGRESS_STYLES[status].bg : "transparent",
                                        }}
                                        onMouseEnter={(e) => { if (panel.progress !== status) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                                        onMouseLeave={(e) => { if (panel.progress !== status) e.currentTarget.style.background = "transparent"; }}
                                        onClick={() => {
                                          updatePanelField(panel.id, "progress", status);
                                          setProgressDropdownId(null);
                                        }}
                                      >
                                        {status}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {col.key === "notes" && (
                              isEditing ? (
                                <input autoFocus className="w-full bg-transparent text-xs outline-none" style={{ border: "1px solid rgba(232,115,34,0.4)", borderRadius: "4px", padding: "2px 6px", color: "rgba(255,255,255,0.8)", caretColor: "#E87322" }}
                                  value={editValue} onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() => updatePanelField(panel.id, col.key, editValue)}
                                  onKeyDown={(e) => { if (e.key === "Enter") updatePanelField(panel.id, col.key, editValue); if (e.key === "Escape") setEditingPanelId(null); }} />
                              ) : (
                                <span className="text-xs" style={{ color: panel.notes ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.15)", fontStyle: panel.notes ? "normal" : "italic" }}>{panel.notes || "请填写..."}</span>
                              )
                            )}
                          </div>
                        );
                      })}

                      {/* Actions */}
                      <div className="flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ width: "40px" }}>
                        <button onClick={(e) => { e.stopPropagation(); toast.success("更多操作"); }} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10">
                          <MoreHorizontal size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Add row */}
              <button
                onClick={addPanel}
                className="flex items-center gap-2 px-5 py-3 w-full text-left transition-colors hover:bg-white/5"
                style={{ color: "rgba(255,255,255,0.25)", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "12px" }}
              >
                <Plus size={12} />新增分镜行
              </button>
            </div>
          ) : (
            /* CARD VIEW */
            <div className="p-5">
              {panels.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16" style={{ color: "rgba(255,255,255,0.2)" }}>
                  <Film size={32} /><p className="mt-3 text-sm">暂无分镜</p>
                </div>
              ) : (
                <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                  {panels.map((panel) => {
                    const isSelected = selectedPanelId === panel.id;
                    return (
                      <div key={panel.id} onClick={() => setSelectedPanelId(isSelected ? null : panel.id)}
                        className="rounded-xl overflow-hidden cursor-pointer transition-all group"
                        style={{ background: "#1A1510", border: isSelected ? "2px solid #E87322" : "2px solid rgba(255,255,255,0.06)" }}>
                        <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                          {panel.storyboardImg || panel.refImg ? (
                            <img src={panel.storyboardImg ?? panel.refImg} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: "#231E17" }}>
                              <Film size={24} style={{ color: "rgba(255,255,255,0.1)" }} />
                            </div>
                          )}
                          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-xs" style={{ background: isSelected ? "#E87322" : "rgba(0,0,0,0.6)", color: "white", fontSize: "10px", fontWeight: 600 }}>
                            #{panel.rowNo.toString().padStart(2, "0")}
                          </div>
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded" style={{ background: PROGRESS_STYLES[panel.progress].bg, color: PROGRESS_STYLES[panel.progress].color, fontSize: "9px" }}>
                            {panel.progress}
                          </div>
                          <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ background: "rgba(0,0,0,0.5)", fontSize: "9px", color: "rgba(232,115,34,0.9)" }}>
                            <Clock size={8} />{panel.duration}
                          </div>
                        </div>
                        <div className="p-2.5">
                          <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{panel.script}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex gap-1">
                              {panel.crew.map((name, i) => (
                                <div key={i} className="w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ background: i === 0 ? "#E87322" : "#4A9EE0", fontSize: "8px", fontWeight: 600 }}>{name[0]}</div>
                              ))}
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); deletePanel(panel.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 rounded flex items-center justify-center hover:bg-red-900/20">
                              <X size={9} style={{ color: "rgba(255,100,100,0.5)" }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add card */}
                  <div onClick={addPanel} className="rounded-xl cursor-pointer flex flex-col items-center justify-center transition-opacity hover:opacity-80" style={{ border: "2px dashed rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)", minHeight: "160px" }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ background: "rgba(232,115,34,0.1)", border: "1px dashed rgba(232,115,34,0.4)" }}>
                      <Plus size={18} style={{ color: "#E87322" }} />
                    </div>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>新增分镜</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    {showShareModal && (
      <ShareModal episodes={episodes} onClose={() => setShowShareModal(false)} />
    )}
    </>
  );
}

// ─── Share Modal ──────────────────────────────────────────────────────────────
interface ShareRecord {
  id: string;
  name: string;
  email: string;
  permission: "read" | "edit";
  expiry: string;
}

function ShareModal({ episodes, onClose }: { episodes: StoryEpisode[]; onClose: () => void }) {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set(["ep1"]));
  const [permission, setPermission] = useState<"read" | "edit">("read");
  const [expiry, setExpiry] = useState("7days");
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareRecords] = useState<ShareRecord[]>([
    { id: "sr1", name: "外部人员A", email: "a@external.com", permission: "read", expiry: "2026-04-14" },
    { id: "sr2", name: "外部人员B", email: "b@external.com", permission: "edit", expiry: "永久" },
  ]);

  const toggleFile = (id: string) => {
    setSelectedFiles((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const copyLink = () => {
    navigator.clipboard.writeText("https://shanhai.ai/share/sb/x9k2m4p").catch(() => {});
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const EXPIRY_LABELS: Record<string, string> = {
    "7days": "7天", "30days": "30天", "permanent": "永久", "custom": "自定义"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="flex flex-col rounded-2xl overflow-hidden" style={{ background: "#1A1510", border: "1px solid rgba(255,255,255,0.1)", width: "580px", maxHeight: "85vh", boxShadow: "0 24px 80px rgba(0,0,0,0.8)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <Share2 size={16} style={{ color: "#E87322" }} />
            <h2 className="text-white" style={{ fontSize: "16px", fontWeight: 600 }}>分享故事板</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10">
            <X size={14} style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {/* File selection */}
          <div className="px-6 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>选择分享内容</p>
            <div className="flex flex-col gap-1.5">
              {episodes.map((ep) => (
                <div key={ep.id}>
                  <button onClick={() => toggleFile(ep.id)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-white/5 transition-colors">
                    <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ background: selectedFiles.has(ep.id) ? "#E87322" : "transparent", border: selectedFiles.has(ep.id) ? "none" : "1.5px solid rgba(255,255,255,0.2)" }}>
                      {selectedFiles.has(ep.id) && <Check size={9} className="text-white" />}
                    </div>
                    <Film size={13} style={{ color: "#E87322", flexShrink: 0 }} />
                    <span className="text-sm flex-1" style={{ color: "rgba(255,255,255,0.75)" }}>{ep.name}</span>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                      {ep.scenes.reduce((acc, s) => acc + s.panels.length, 0)} 帧
                    </span>
                  </button>
                  {ep.scenes.map((sc) => (
                    <button key={sc.id} onClick={() => toggleFile(sc.id)} className="ml-6 w-[calc(100%-24px)] flex items-center gap-3 px-3 py-1.5 rounded-lg text-left hover:bg-white/5 transition-colors">
                      <div className="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0" style={{ background: selectedFiles.has(sc.id) ? "rgba(232,115,34,0.6)" : "transparent", border: selectedFiles.has(sc.id) ? "none" : "1.5px solid rgba(255,255,255,0.15)" }}>
                        {selectedFiles.has(sc.id) && <Check size={8} className="text-white" />}
                      </div>
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{sc.name}</span>
                      <span className="ml-auto" style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>{sc.panels.length} 帧</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Permission + Expiry */}
          <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>权限设置</p>
            <div className="flex items-center gap-3 mb-4">
              {[{ key: "read" as const, label: "阅读", icon: <Eye size={12} /> }, { key: "edit" as const, label: "编辑", icon: <Edit3 size={12} /> }].map(({ key, label, icon }) => (
                <button key={key} onClick={() => setPermission(key)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors"
                  style={{ background: permission === key ? "rgba(232,115,34,0.15)" : "rgba(255,255,255,0.05)", color: permission === key ? "#E87322" : "rgba(255,255,255,0.5)", border: permission === key ? "1px solid rgba(232,115,34,0.3)" : "1px solid rgba(255,255,255,0.08)" }}>
                  {icon}{label}
                </button>
              ))}
            </div>
            
          </div>

          {/* Share link */}
          <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>分享链接</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <Link size={11} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                <span className="text-xs truncate" style={{ color: "rgba(255,255,255,0.5)" }}>https://shanhai.ai/share/sb/x9k2m4p</span>
              </div>
              <button onClick={copyLink} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs transition-colors flex-shrink-0"
                style={{ background: linkCopied ? "rgba(74,198,120,0.15)" : "#E87322", color: linkCopied ? "#4AC678" : "white" }}>
                {linkCopied ? <Check size={11} /> : <Link size={11} />}
                {linkCopied ? "已复制" : "复制链接"}
              </button>
            </div>
          </div>

          {/* Current permission records */}
          <div className="px-6 py-4">
            <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>当前分享权限详情</p>
            {shareRecords.length === 0 ? (
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>暂无分享记录</p>
            ) : (
              <div className="flex flex-col gap-2">
                {shareRecords.map((record) => (
                  <div key={record.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white" style={{ background: "#4A9EE0", fontSize: "10px", fontWeight: 600 }}>
                      {record.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white">{record.name}</div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{record.email}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-xs flex-shrink-0"
                      style={{ background: record.permission === "edit" ? "rgba(232,115,34,0.15)" : "rgba(255,255,255,0.07)", color: record.permission === "edit" ? "#E87322" : "rgba(255,255,255,0.5)" }}>
                      {record.permission === "edit" ? "编辑" : "阅读"}
                    </span>
                    
                    <button className="text-xs px-2 py-0.5 rounded transition-colors hover:bg-red-900/20 flex-shrink-0" style={{ color: "rgba(255,100,100,0.6)" }}>
                      撤销
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}