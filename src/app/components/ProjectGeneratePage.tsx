import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router";
import type { ReactNode } from "react";
import {
  Folder, FolderOpen, MessageSquare, ChevronRight, Plus, Image as LucideImage, Video, Music,
  Star, Upload, Package, Send, Sparkles, MoreHorizontal, Download, RefreshCw,
  Search, Pencil, Trash2, X, Check, ChevronDown, Film, AlignLeft, Copy, Play,
  ChevronLeft, Users, Filter, Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useParams } from "react-router";
import { ProjectAssetsSidebarPanel } from "./ProjectAssetsSidebarPanel";
import { StoryboardSidebarPanel } from "./StoryboardSidebarPanel";
import { getProjectById } from "../data/projectsData";

// ─── Types ────────────────────────────────────────────────────────────────────
type SidebarTab = "files" | "assets" | "storyboard";
type AssetSubTab = "generate" | "upload" | "subject" | "collect";
type AssetTypeFilter = "all" | "image" | "video" | "audio";
type GenerateTypeFilter = "all" | "image" | "video";
type TimeFilter = "all" | "today" | "week" | "month" | "custom";

interface Session {
  id: string;
  name: string;
}

interface FileFolder {
  id: string;
  name: string;
  sessions: Session[];
}

// ─── File tree data ───────────────────────────────────────────────────────────
const INITIAL_FILE_TREE: FileFolder[] = [
  { id: "art", name: "美术设定", sessions: [{ id: "chars", name: "人物设定" }, { id: "scenes", name: "场景设定" }, { id: "props", name: "道具设定" }] },
  { id: "ep1", name: "第一集", sessions: [{ id: "sb1", name: "分镜1-5" }, { id: "sb2", name: "分镜6-10" }] },
  { id: "ep2", name: "第二集", sessions: [{ id: "still", name: "静帧" }, { id: "motion", name: "动态" }] },
];

// ─── Mock Members ─────────────────────────────────────────────────────────────
const MEMBER_COLORS = ["#E87322", "#7B3FC4", "#2A6FC4", "#C42A6F", "#2AC4A2"];
const PROJECT_MEMBERS = [
  { id: "1", name: "Alice", avatar: "Al", color: "#E87322", role: "主创" },
  { id: "2", name: "Bob", avatar: "Bo", color: "#7B3FC4", role: "背景" },
  { id: "3", name: "Carol", avatar: "Ca", color: "#2A6FC4", role: "角色" },
  { id: "4", name: "Dave", avatar: "Da", color: "#C42A6F", role: "道具" },
];

// Current logged-in user (mock)
const CURRENT_USER = PROJECT_MEMBERS[0]; // Alice

// ─── Chat Messages ────────────────────────────────────────────────────────────
// Added timestamp and type for filtering
const CHAT_MESSAGES = [
  { id: "m1", type: "user" as const, content: "帮我设计主角：古风女侠，白发飞扬，身着月白色长袍，腰悬宝剑，气质冷峻仙气，画面风格参考敦煌壁画，高清质感", time: "14:28", timestamp: "2026-05-01T14:28:00", sender: PROJECT_MEMBERS[0] },
  { id: "m2", type: "ai" as const, generateType: "image" as const, images: ["https://images.unsplash.com/photo-1743951896798-2936f661f939?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80"], model: "Seedream 3.0", time: "14:32", timestamp: "2026-05-01T14:32:00", seed: "1024×1024 · 4张" },
  { id: "m3", type: "user" as const, content: "调整第3张，让她的服装更华丽，增加金色刺绣纹样和宽袖披帛，保持仙气飘逸的整体风格", time: "14:35", timestamp: "2026-05-01T14:35:00", sender: PROJECT_MEMBERS[1] },
  { id: "m4", type: "ai" as const, generateType: "image" as const, images: ["https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80"], model: "Seedream 3.0", time: "14:37", timestamp: "2026-05-01T14:37:00", seed: "1024×1024 · 2张" },
  { id: "m5", type: "user" as const, content: "生成山林背景，云雾缭绕，仙气飘渺", time: "14:40", timestamp: "2026-05-01T14:40:00", sender: PROJECT_MEMBERS[2] },
  { id: "m6", type: "ai" as const, generateType: "video" as const, videoUrl: "sample.mp4", videoThumbnail: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", model: "Seedream 3.0 Video", time: "14:45", timestamp: "2026-05-01T14:45:00", seed: "5秒 · 720p" },
  { id: "m7", type: "user" as const, content: "生成女侠战斗动画，剑气飞舞", time: "15:00", timestamp: "2026-04-30T15:00:00", sender: PROJECT_MEMBERS[0] },
  { id: "m8", type: "ai" as const, generateType: "video" as const, videoUrl: "sample2.mp4", videoThumbnail: "https://images.unsplash.com/photo-1636075219672-a422660ce589?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", model: "Seedream 3.0 Video", time: "15:05", timestamp: "2026-04-30T15:05:00", seed: "8秒 · 1080p" },
  { id: "m9", type: "user" as const, content: "生成古城楼全景图", time: "10:20", timestamp: "2026-04-28T10:20:00", sender: PROJECT_MEMBERS[3] },
  { id: "m10", type: "ai" as const, generateType: "image" as const, images: ["https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80"], model: "Seedream 3.0", time: "10:25", timestamp: "2026-04-28T10:25:00", seed: "1920×1080 · 1张" },
];

// ─── Storyboard panels ────────────────────────────────────────────────────────
const INITIAL_STORYBOARD_PANELS = [
  { id: "p1", no: "01", desc: "女主角出场，云雾缭绕", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200&q=70", script: "（旁白）传闻山海之间...", hasVideo: true },
  { id: "p2", no: "02", desc: "近景，持剑回眸", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200&q=70", script: "...白发如霜，剑出惊鸿", hasVideo: false },
  { id: "p3", no: "03", desc: "全景，古城楼背景", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200&q=70", script: "（无台词）", hasVideo: false },
  { id: "p4", no: "04", desc: "战斗特效，剑气飞舞", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200&q=70", script: "女：「你来了。」", hasVideo: true },
];

// ─── Storyboard field key type ────────────────────────────────────────────────
type StoryboardField = "script" | "image" | "video";

// ─── Storyboard Detail Modal ─────────────────────────────────────────────────
function StoryboardDetailModal({ panel, onClose }: {
  panel: typeof INITIAL_STORYBOARD_PANELS[0];
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyScript = () => {
    navigator.clipboard.writeText(panel.script).catch(() => {});
    setCopied(true);
    toast.success("文字脚本已复制");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.82)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="flex flex-col rounded-2xl overflow-hidden" style={{ background: "#1A1510", border: "1px solid rgba(255,255,255,0.1)", width: "560px", maxHeight: "80vh", boxShadow: "0 24px 80px rgba(0,0,0,0.8)" }}>
        <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-xs" style={{ background: "rgba(232,115,34,0.15)", color: "#E87322" }}>#{panel.no}</span>
            <span className="text-sm text-white">{panel.desc}</span>
          </div>
          <button onClick={onClose} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/10">
            <X size={13} style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>

        {/* Image/Video */}
        {panel.src && (
          <div className="relative" style={{ background: "#0D0A06" }}>
            <img src={panel.src} alt="" className="w-full object-cover" style={{ maxHeight: "280px" }} />
            {panel.hasVideo && (
              <button className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", border: "2px solid rgba(255,255,255,0.3)" }}>
                  <Play size={18} className="text-white" style={{ marginLeft: "2px" }} />
                </div>
              </button>
            )}
          </div>
        )}

        {/* Script */}
        <div className="p-5 flex-1 overflow-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>文字脚本</span>
            <button onClick={copyScript} className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-colors"
              style={{ background: copied ? "rgba(74,198,120,0.15)" : "rgba(255,255,255,0.07)", color: copied ? "#4AC678" : "rgba(255,255,255,0.6)", border: `1px solid ${copied ? "rgba(74,198,120,0.3)" : "rgba(255,255,255,0.1)"}` }}>
              <Copy size={10} />{copied ? "已复制" : "复制脚本"}
            </button>
          </div>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{panel.script}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ProjectGeneratePage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const epParam = searchParams.get("ep");
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("files");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fileTree, setFileTree] = useState<FileFolder[]>(INITIAL_FILE_TREE);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(() => {
    if (epParam) {
      return { [epParam]: true };
    }
    return { art: true };
  });
  const [activeSession, setActiveSession] = useState(() => {
    if (epParam) {
      const epFolder = INITIAL_FILE_TREE.find(f => f.id === epParam);
      if (epFolder && epFolder.sessions.length > 0) {
        return epFolder.sessions[0].id;
      }
    }
    return "chars";
  });
  const [assetSubTab, setAssetSubTab] = useState<AssetSubTab>("generate");
  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetTypeFilter>("all");
  const [showAssetTypeMenu, setShowAssetTypeMenu] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [hoveredImg, setHoveredImg] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [collectedAssets, setCollectedAssets] = useState<Set<string>>(new Set());

  // File/session editing
  const [sessionMenuId, setSessionMenuId] = useState<string | null>(null);
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [creatingSessionInFolder, setCreatingSessionInFolder] = useState<string | null>(null);
  const [newSessionName, setNewSessionName] = useState("");

  // Storyboard state
  const [storyboardPanels, setStoryboardPanels] = useState(INITIAL_STORYBOARD_PANELS);
  const [selectedStoryboardPanel, setSelectedStoryboardPanel] = useState<string | null>(null);
  const [storyboardDetailPanel, setStoryboardDetailPanel] = useState<typeof INITIAL_STORYBOARD_PANELS[0] | null>(null);
  const [storyboardFields, setStoryboardFields] = useState<Record<StoryboardField, boolean>>({ script: true, image: true, video: true });
  const [showFieldMenu, setShowFieldMenu] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState("ep1");
  const [showEpisodeMenu, setShowEpisodeMenu] = useState(false);

  // Member filter state
  const [memberFilter, setMemberFilter] = useState<string[]>([]);

  // Generate filter states
  const [generateTypeFilter, setGenerateTypeFilter] = useState<GenerateTypeFilter>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Root sessions (not inside any folder)
  const [rootSessions, setRootSessions] = useState<Session[]>([
    { id: "root1", name: "主线剧情讨论" },
  ]);
  const [creatingRootSession, setCreatingRootSession] = useState(false);
  const [newRootSessionName, setNewRootSessionName] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, []);

  const toggleFolder = (id: string) =>
    setExpandedFolders((prev) => ({ ...prev, [id]: !prev[id] }));

  const getActiveSessionName = () => {
    for (const folder of fileTree) {
      const s = folder.sessions.find((s) => s.id === activeSession);
      if (s) return { folder: folder.name, session: s.name };
    }
    return { folder: "", session: "" };
  };

  const { folder: activeFolder, session: activeSessionName } = getActiveSessionName();

  // Toggle member filter
  const toggleMemberFilter = (memberId: string) => {
    setMemberFilter((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  // Time filter helper
  const getTimeRange = (filter: TimeFilter): { from: Date; to: Date } | null => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    switch (filter) {
      case "today":
        return { from: today, to: now };
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return { from: weekAgo, to: now };
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 30);
        return { from: monthAgo, to: now };
      case "custom":
        if (customDateFrom && customDateTo) {
          return { from: new Date(customDateFrom), to: new Date(customDateTo + "T23:59:59") };
        }
        return null;
      default:
        return null;
    }
  };

  // Filter messages by all criteria
  const filteredMessages = CHAT_MESSAGES.filter((msg) => {
    // Member filter - only applies to user messages
    if (memberFilter.length > 0 && msg.type === "user") {
      if (!("sender" in msg) || !memberFilter.includes(msg.sender.id)) return false;
    }

    // Type filter - only applies to AI messages
    if (generateTypeFilter !== "all" && msg.type === "ai") {
      if ("generateType" in msg && msg.generateType !== generateTypeFilter) return false;
    }

    // Time filter
    const timeRange = getTimeRange(timeFilter);
    if (timeRange && "timestamp" in msg) {
      const msgTime = new Date(msg.timestamp);
      if (msgTime < timeRange.from || msgTime > timeRange.to) return false;
    }

    // Keyword search - search in content, sender name, model name
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      if (msg.type === "user") {
        if (!msg.content.toLowerCase().includes(keyword)) {
          if ("sender" in msg && !msg.sender.name.toLowerCase().includes(keyword)) return false;
          return false;
        }
      } else if (msg.type === "ai") {
        if (!("model" in msg && msg.model.toLowerCase().includes(keyword))) {
          if (!("seed" in msg && msg.seed.toLowerCase().includes(keyword))) return false;
        }
      }
    }

    return true;
  });

  // Count active filters
  const activeFilterCount =
    (memberFilter.length > 0 ? 1 : 0) +
    (generateTypeFilter !== "all" ? 1 : 0) +
    (timeFilter !== "all" ? 1 : 0) +
    (searchKeyword ? 1 : 0);

  // Clear all filters
  const clearAllFilters = () => {
    setMemberFilter([]);
    setGenerateTypeFilter("all");
    setTimeFilter("all");
    setCustomDateFrom("");
    setCustomDateTo("");
    setSearchKeyword("");
  };

  // ── File tree CRUD ───────────────────────────────────────────────────────────

  const startRenameSession = (folderId: string, sessionId: string) => {
    const folder = fileTree.find((f) => f.id === folderId);
    const session = folder?.sessions.find((s) => s.id === sessionId);
    if (session) { setRenamingSessionId(sessionId); setRenameValue(session.name); setSessionMenuId(null); }
  };

  const confirmRenameSession = (folderId: string, sessionId: string) => {
    if (renameValue.trim())
      setFileTree((prev) => prev.map((f) => f.id === folderId ? { ...f, sessions: f.sessions.map((s) => s.id === sessionId ? { ...s, name: renameValue.trim() } : s) } : f));
    setRenamingSessionId(null);
  };

  const deleteSession = (folderId: string, sessionId: string) => {
    setFileTree((prev) => prev.map((f) => f.id === folderId ? { ...f, sessions: f.sessions.filter((s) => s.id !== sessionId) } : f));
    setSessionMenuId(null);
    if (activeSession === sessionId) setActiveSession("");
    toast.success("已删除 Session");
  };

  const createSession = (folderId: string) => {
    if (!newSessionName.trim()) return;
    const newSession: Session = { id: `s${Date.now()}`, name: newSessionName.trim() };
    setFileTree((prev) => prev.map((f) => f.id === folderId ? { ...f, sessions: [...f.sessions, newSession] } : f));
    setActiveSession(newSession.id);
    setCreatingSessionInFolder(null);
    setNewSessionName("");
  };

  // ── Storyboard CRUD ──────────────────────────────────────────────────────────
  const addPanel = () => {
    const newPanel = { id: `p${Date.now()}`, no: String(storyboardPanels.length + 1).padStart(2, "0"), desc: "新分镜", src: "", script: "请填写脚本文字", hasVideo: false };
    setStoryboardPanels((prev) => [...prev, newPanel]);
    toast.success("已新增分镜");
  };

  const deletePanel = (id: string) => {
    setStoryboardPanels((prev) => prev.filter((p) => p.id !== id));
    toast.success("已删除分镜");
  };

  // ── AI message renderer ──────────────────────────────────────────────────────
  const renderAIMessage = (msg: typeof CHAT_MESSAGES[number]) => {
    if (msg.type !== "ai") return null;

    // Video message
    if ("generateType" in msg && msg.generateType === "video") {
      return (
        <div key={msg.id} className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(155,89,182,0.2)", border: "1px solid rgba(155,89,182,0.3)" }}>
              <Video size={11} style={{ color: "#9B59B6" }} />
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(155,89,182,0.12)", color: "#9B59B6" }}>{msg.model}</span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>{msg.seed}</span>
            <span className="ml-auto text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>{msg.time}</span>
          </div>
          <div className="relative rounded-xl overflow-hidden group cursor-pointer" style={{ aspectRatio: "16/9", background: "#1A1510", maxWidth: "400px" }}>
            <img src={msg.videoThumbnail} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", border: "2px solid rgba(255,255,255,0.3)" }}>
                <Play size={20} className="text-white" style={{ marginLeft: "3px" }} />
              </div>
            </div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }}>
              <div className="flex justify-end gap-1">
                <button className="w-6 h-6 rounded-lg flex items-center justify-center hover:opacity-80" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
                  <Download size={11} className="text-white" />
                </button>
              </div>
              <div className="flex justify-end">
                <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs hover:opacity-80" style={{ background: "#9B59B6", color: "white" }}>
                  <RefreshCw size={9} />变体
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Image message
    const images = msg.images || [];
    const cols = images.length <= 2 ? images.length : 2;
    return (
      <div key={msg.id} className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(232,115,34,0.2)", border: "1px solid rgba(232,115,34,0.3)" }}>
            <Sparkles size={11} style={{ color: "#E87322" }} />
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(232,115,34,0.12)", color: "#E87322" }}>{msg.model}</span>
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>{msg.seed}</span>
          <span className="ml-auto text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>{msg.time}</span>
        </div>
        <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {images.map((src, i) => (
            <div key={i} className="relative rounded-xl overflow-hidden group cursor-pointer" style={{ aspectRatio: "1", background: "#1A1510" }}>
              <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2"
                style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }}>
                <div className="flex justify-end gap-1">
                  <button
                    className="w-6 h-6 rounded-lg flex items-center justify-center hover:opacity-80"
                    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
                    onClick={() => {
                      setCollectedAssets((prev) => {
                        const n = new Set(prev);
                        n.has(src) ? n.delete(src) : n.add(src);
                        return n;
                      });
                      toast.success(collectedAssets.has(src) ? "已取消收藏" : "收藏成功");
                    }}
                  >
                    <Star size={11} style={{ color: collectedAssets.has(src) ? "#E87322" : "white", fill: collectedAssets.has(src) ? "#E87322" : "transparent" }} />
                  </button>
                  <button
                    className="w-6 h-6 rounded-lg flex items-center justify-center hover:opacity-80"
                    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
                    onClick={() => toast.success("已下载")}
                  >
                    <Download size={11} className="text-white" />
                  </button>
                </div>
                <div className="flex justify-end">
                  <button
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs hover:opacity-80"
                    style={{ background: "#E87322", color: "white" }}
                    onClick={() => toast.success("已在此基础上重新生成")}
                  >
                    <RefreshCw size={9} />变体
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ── Sidebar: Files Tab ───────────────────────────────────────────────────────
  const renderFilesTab = () => (
    <div className="flex flex-col h-full" onClick={() => { setSessionMenuId(null); }}>
      {/* Action buttons */}
      <div className="flex items-center gap-1.5 px-2 py-2 flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <button
          onClick={() => { setCreatingRootSession(true); setNewRootSessionName(""); }}
          className="flex items-center gap-1 flex-1 justify-center py-1.5 rounded-md text-xs transition-colors hover:opacity-80"
          style={{ background: "rgba(232,115,34,0.15)", color: "#E87322", border: "1px solid rgba(232,115,34,0.25)" }}
        >
          <MessageSquare size={10} />新建对话
        </button>
      </div>

      <div className="flex-1 overflow-auto px-1.5 pb-4">
        {/* Root sessions */}
        {rootSessions.map((session) => {
          const isActive = session.id === activeSession;
          return (
            null
          );
        })}

        {/* New root session input */}
        {creatingRootSession && (
          <div className="flex items-center gap-1 px-2 py-1.5 mb-1">
            <MessageSquare size={11} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
            <input autoFocus className="flex-1 bg-transparent text-xs outline-none px-1 py-0.5 rounded"
              style={{ border: "1px solid rgba(232,115,34,0.5)", color: "rgba(255,255,255,0.8)", caretColor: "#E87322" }}
              value={newRootSessionName}
              onChange={(e) => setNewRootSessionName(e.target.value)}
              placeholder="对话名称..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && newRootSessionName.trim()) {
                  const s: Session = { id: `root${Date.now()}`, name: newRootSessionName.trim() };
                  setRootSessions((prev) => [...prev, s]);
                  setActiveSession(s.id);
                  setNewRootSessionName("");
                  setCreatingRootSession(false);
                }
                if (e.key === "Escape") { setCreatingRootSession(false); setNewRootSessionName(""); }
              }}
              onBlur={() => {
                if (newRootSessionName.trim()) {
                  const s: Session = { id: `root${Date.now()}`, name: newRootSessionName.trim() };
                  setRootSessions((prev) => [...prev, s]);
                  setActiveSession(s.id);
                }
                setNewRootSessionName(""); setCreatingRootSession(false);
              }}
            />
          </div>
        )}

        {(rootSessions.length > 0 || creatingRootSession) && (
          <div className="my-1.5 mx-2" style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
        )}

        {/* Folder tree */}
        {/* Fixed category sections */}
        {fileTree.map((folder, folderIdx) => {
          const isExpanded = expandedFolders[folder.id];
          return (
            <div key={folder.id}>
              {folderIdx > 0 && (
                <div className="mx-2 my-2" style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
              )}
              {/* Section header */}
              <button
                onClick={() => toggleFolder(folder.id)}
                className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-colors"
                style={{ color: "rgba(255,255,255,0.4)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <ChevronRight size={12} style={{ color: "rgba(255,255,255,0.3)", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s", flexShrink: 0 }} />
                {isExpanded ? <FolderOpen size={13} style={{ color: "rgba(255,255,255,0.5)", flexShrink: 0 }} /> : <Folder size={13} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />}
                <span className="flex-1 text-left font-medium" style={{ fontSize: "11px", letterSpacing: "0.02em" }}>{folder.name}</span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>{folder.sessions.length}</span>
              </button>

              {/* Session items */}
              {isExpanded && (
                <div className="mt-0.5">
                  {folder.sessions.map((session) => {
                    const isActive = session.id === activeSession;
                    const isRenamingSession = renamingSessionId === session.id;
                    const showSessionMenu = sessionMenuId === session.id;
                    return (
                      <div key={session.id} className="flex items-center group relative mx-1.5">
                        <button
                          className="flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-md text-left transition-colors min-w-0"
                          style={{
                            background: isActive ? "rgba(232,115,34,0.12)" : "transparent",
                            color: isActive ? "#E87322" : "rgba(255,255,255,0.55)",
                          }}
                          onClick={() => setActiveSession(session.id)}
                        >
                          <MessageSquare size={11} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.5 }} />
                          {isRenamingSession ? (
                            <input autoFocus className="flex-1 bg-transparent text-xs outline-none px-1 py-0.5 rounded min-w-0"
                              style={{ border: "1px solid rgba(232,115,34,0.5)", color: "rgba(255,255,255,0.8)", caretColor: "#E87322" }}
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onBlur={() => confirmRenameSession(folder.id, session.id)}
                              onKeyDown={(e) => { if (e.key === "Enter") confirmRenameSession(folder.id, session.id); if (e.key === "Escape") setRenamingSessionId(null); }}
                            />
                          ) : (
                            <span className="text-xs truncate flex-1" style={{ fontSize: "12px" }}>{session.name}</span>
                          )}
                        </button>
                        <button
                          className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-5 h-5 flex items-center justify-center"
                          onClick={(e) => { e.stopPropagation(); setSessionMenuId(showSessionMenu ? null : session.id); }}
                        >
                          <MoreHorizontal size={10} style={{ color: "rgba(255,255,255,0.35)" }} />
                        </button>
                        {showSessionMenu && (
                          <div className="absolute right-0 top-full z-20 rounded-xl overflow-hidden" style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.6)", minWidth: "130px" }} onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => startRenameSession(folder.id, session.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-white/5" style={{ color: "rgba(255,255,255,0.7)" }}>
                              <Pencil size={10} />重命名
                            </button>
                            <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
                            <button onClick={() => deleteSession(folder.id, session.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-red-900/20" style={{ color: "#ff6b6b" }}>
                              <Trash2 size={10} />删除
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* New session button / input */}
                  {creatingSessionInFolder === folder.id ? (
                    <div className="flex items-center gap-1 px-2 py-1.5 mx-1.5">
                      <MessageSquare size={11} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                      <input autoFocus
                        className="flex-1 bg-transparent text-xs outline-none px-1 py-0.5 rounded"
                        style={{ border: "1px solid rgba(232,115,34,0.5)", color: "rgba(255,255,255,0.8)", caretColor: "#E87322" }}
                        value={newSessionName}
                        onChange={(e) => setNewSessionName(e.target.value)}
                        placeholder="Session 名称..."
                        onKeyDown={(e) => { if (e.key === "Enter") createSession(folder.id); if (e.key === "Escape") { setCreatingSessionInFolder(null); setNewSessionName(""); } }}
                        onBlur={() => { if (newSessionName.trim()) createSession(folder.id); else { setCreatingSessionInFolder(null); setNewSessionName(""); } }}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setCreatingSessionInFolder(folder.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors mx-1.5 w-[calc(100%-12px)]"
                      style={{ color: "rgba(255,255,255,0.25)", background: "transparent" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.6)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.25)"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                    >
                      <Plus size={10} />新建 Session
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-3 py-2 border-t flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        
      </div>
    </div>
  );

  // ── Sidebar: Assets Tab ──────────────────────────────────────────────────────
  const renderAssetsTab = () => {
    return <ProjectAssetsSidebarPanel projectId={id ?? "1"} />;
  };

  // ── Sidebar: Storyboard Tab ──────────────────────────────────────────────────
  const renderStoryboardTab = () => {
    return <StoryboardSidebarPanel />;
  };

  const SIDEBAR_TABS: { key: SidebarTab; label: string }[] = [
    { key: "files", label: "文件" },
    { key: "assets", label: "资产" },
    { key: "storyboard", label: "故事板" },
  ];

  return (
    <>
      <div className="flex h-full overflow-hidden relative" onClick={() => { setSessionMenuId(null); setShowAssetTypeMenu(false); setShowFieldMenu(false); setShowEpisodeMenu(false); }}>
        {/* ── Secondary Sidebar (absolute, full height to top) ─────────────────────────────────────────────── */}
        <div
          className="flex flex-col flex-shrink-0 relative"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: sidebarCollapsed ? "0px" : "240px",
            background: "#110E0A",
            borderRight: sidebarCollapsed ? "none" : "1px solid rgba(255,255,255,0.05)",
            transition: "width 0.2s ease",
            overflow: "visible",
            zIndex: 20,
          }}
        >
          {/* Collapse toggle */}
          <button
            onClick={(e) => { e.stopPropagation(); setSidebarCollapsed(!sidebarCollapsed); }}
            className="absolute top-2.5 -right-5 z-10 w-5 h-5 rounded flex items-center justify-center hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.35)" }}
            title={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
          >
            <ChevronLeft size={11} style={{ transform: sidebarCollapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
          </button>

          {!sidebarCollapsed && (
            <>
              <div className="flex flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                {SIDEBAR_TABS.map((tab) => (
                  <button key={tab.key} onClick={() => setSidebarTab(tab.key)} className="flex-1 py-3 text-xs transition-colors relative"
                    style={{ color: sidebarTab === tab.key ? "#E87322" : "rgba(255,255,255,0.4)", borderBottom: sidebarTab === tab.key ? "2px solid #E87322" : "2px solid transparent" }}>
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-hidden">
                {sidebarTab === "files" && renderFilesTab()}
                {sidebarTab === "assets" && renderAssetsTab()}
                {sidebarTab === "storyboard" && renderStoryboardTab()}
              </div>
            </>
          )}
        </div>

        {/* ── Main Chat Area ─────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden relative" style={{ background: "#140F09", marginLeft: sidebarCollapsed ? "0px" : "240px", transition: "margin-left 0.2s ease" }}>
          {/* Header with Visible Filter Tags */}
          <div className="px-6 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            {/* Top row: Filter tags and toggle button */}
            <div className="flex items-center justify-between">
              {/* Left: Filter tags always visible */}
              <div className="flex items-center gap-2 flex-wrap">
                <Users size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                  生成记录
                </span>
                <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
                  {filteredMessages.length} 条
                </span>

                {/* Active filter tags - always visible */}
                {activeFilterCount > 0 && (
                  <>
                    <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px" }}>|</span>
                    {/* Member filter tags */}
                    {memberFilter.length > 0 && memberFilter.map((memberId) => {
                      const member = PROJECT_MEMBERS.find(m => m.id === memberId);
                      if (!member) return null;
                      return (
                        <span
                          key={memberId}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs cursor-pointer hover:opacity-80"
                          style={{ background: `${member.color}20`, color: member.color, border: `1px solid ${member.color}30` }}
                        >
                          <div className="w-3 h-3 rounded-full flex items-center justify-center" style={{ background: member.color, fontSize: "7px", color: "#fff" }}>
                            {member.avatar}
                          </div>
                          {member.name}
                          <button onClick={() => toggleMemberFilter(memberId)} className="ml-0.5 hover:opacity-70">
                            <X size={10} />
                          </button>
                        </span>
                      );
                    })}
                    {/* Type filter tag */}
                    {generateTypeFilter !== "all" && (
                      <span
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs cursor-pointer hover:opacity-80"
                        style={{
                          background: generateTypeFilter === "image" ? "rgba(74,158,224,0.15)" : "rgba(155,89,182,0.15)",
                          color: generateTypeFilter === "image" ? "#4A9EE0" : "#9B59B6",
                          border: generateTypeFilter === "image" ? "1px solid rgba(74,158,224,0.3)" : "1px solid rgba(155,89,182,0.3)"
                        }}
                      >
                        {generateTypeFilter === "image" ? <LucideImage size={12} /> : <Video size={12} />}
                        {generateTypeFilter === "image" ? "图片" : "视频"}
                        <button onClick={() => setGenerateTypeFilter("all")} className="ml-0.5 hover:opacity-70">
                          <X size={10} />
                        </button>
                      </span>
                    )}
                    {/* Time filter tag */}
                    {timeFilter !== "all" && (
                      <span
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs cursor-pointer hover:opacity-80"
                        style={{ background: "rgba(74,198,120,0.15)", color: "#4AC678", border: "1px solid rgba(74,198,120,0.3)" }}
                      >
                        <Clock size={12} />
                        {timeFilter === "today" ? "今天" : timeFilter === "week" ? "近7天" : timeFilter === "month" ? "近30天" : `${customDateFrom} ~ ${customDateTo}`}
                        <button onClick={() => { setTimeFilter("all"); setCustomDateFrom(""); setCustomDateTo(""); }} className="ml-0.5 hover:opacity-70">
                          <X size={10} />
                        </button>
                      </span>
                    )}
                    {/* Search keyword tag */}
                    {searchKeyword && (
                      <span
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs cursor-pointer hover:opacity-80"
                        style={{ background: "rgba(232,115,34,0.15)", color: "#E87322", border: "1px solid rgba(232,115,34,0.3)" }}
                      >
                        <Search size={12} />
                        "{searchKeyword}"
                        <button onClick={() => setSearchKeyword("")} className="ml-0.5 hover:opacity-70">
                          <X size={10} />
                        </button>
                      </span>
                    )}
                    {/* Clear all button */}
                    <button
                      onClick={clearAllFilters}
                      className="px-2 py-0.5 rounded-lg text-xs hover:opacity-80"
                      style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
                    >
                      清除全部
                    </button>
                  </>
                )}
              </div>

              {/* Right: Add filter button */}
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
                style={{
                  background: showFilterPanel ? "rgba(232,115,34,0.15)" : "rgba(255,255,255,0.06)",
                  color: showFilterPanel ? "#E87322" : "rgba(255,255,255,0.6)",
                  border: showFilterPanel ? "1px solid rgba(232,115,34,0.3)" : "1px solid rgba(255,255,255,0.08)"
                }}
              >
                <Plus size={11} />
                添加筛选
                <ChevronDown size={10} style={{ transform: showFilterPanel ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }} />
              </button>
            </div>

            {/* Expanded Filter Panel (for adding filters) */}
            {showFilterPanel && (
              <div className="flex flex-col gap-3 pt-3 pb-2 mt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} onClick={(e) => e.stopPropagation()}>
                {/* Row 1: Member Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs flex-shrink-0" style={{ color: "rgba(255,255,255,0.4)", width: "60px" }}>成员</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setMemberFilter([])}
                      className="px-2.5 py-1 rounded-lg text-xs transition-colors"
                      style={{
                        background: memberFilter.length === 0 ? "rgba(232,115,34,0.15)" : "rgba(255,255,255,0.06)",
                        color: memberFilter.length === 0 ? "#E87322" : "rgba(255,255,255,0.5)",
                        border: memberFilter.length === 0 ? "1px solid rgba(232,115,34,0.3)" : "1px solid transparent"
                      }}
                    >
                      全部
                    </button>
                    {/* Only Me Button */}
                    <button
                      onClick={() => setMemberFilter([CURRENT_USER.id])}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-colors"
                      style={{
                        background: memberFilter.length === 1 && memberFilter[0] === CURRENT_USER.id ? `${CURRENT_USER.color}20` : "rgba(255,255,255,0.06)",
                        color: memberFilter.length === 1 && memberFilter[0] === CURRENT_USER.id ? CURRENT_USER.color : "rgba(255,255,255,0.5)",
                        border: memberFilter.length === 1 && memberFilter[0] === CURRENT_USER.id ? `1px solid ${CURRENT_USER.color}40` : "1px solid transparent"
                      }}
                    >
                      <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: CURRENT_USER.color, fontSize: "8px", color: "#fff" }}>
                        {CURRENT_USER.avatar}
                      </div>
                      只看我的
                    </button>
                    {PROJECT_MEMBERS.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => toggleMemberFilter(member.id)}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-colors"
                        style={{
                          background: memberFilter.includes(member.id) ? `${member.color}20` : "rgba(255,255,255,0.06)",
                          color: memberFilter.includes(member.id) ? member.color : "rgba(255,255,255,0.5)",
                          border: memberFilter.includes(member.id) ? `1px solid ${member.color}40` : "1px solid transparent"
                        }}
                      >
                        <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: member.color, fontSize: "8px", color: "#fff" }}>
                          {member.avatar}
                        </div>
                        {member.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Row 2: Type Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs flex-shrink-0" style={{ color: "rgba(255,255,255,0.4)", width: "60px" }}>类型</span>
                  <div className="flex items-center gap-1">
                    {[
                      { key: "all", label: "全部", Icon: null, color: "#E87322" },
                      { key: "image", label: "图片", Icon: LucideImage, color: "#4A9EE0" },
                      { key: "video", label: "视频", Icon: Video, color: "#9B59B6" },
                    ].map(({ key, label, Icon, color }) => (
                      <button
                        key={key}
                        onClick={() => setGenerateTypeFilter(key as GenerateTypeFilter)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors"
                        style={{
                          background: generateTypeFilter === key ? `${color}15` : "rgba(255,255,255,0.06)",
                          color: generateTypeFilter === key ? color : "rgba(255,255,255,0.5)",
                          border: generateTypeFilter === key ? `1px solid ${color}30` : "1px solid transparent"
                        }}
                      >
                        {Icon && <Icon size={12} />}
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Row 3: Time Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-xs flex-shrink-0" style={{ color: "rgba(255,255,255,0.4)", width: "60px" }}>时间</span>
                  <div className="flex items-center gap-1">
                    {[
                      { key: "all", label: "全部" },
                      { key: "today", label: "今天" },
                      { key: "week", label: "近7天" },
                      { key: "month", label: "近30天" },
                      { key: "custom", label: "自定义" },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => setTimeFilter(key as TimeFilter)}
                        className="px-2.5 py-1 rounded-lg text-xs transition-colors"
                        style={{
                          background: timeFilter === key ? "rgba(232,115,34,0.15)" : "rgba(255,255,255,0.06)",
                          color: timeFilter === key ? "#E87322" : "rgba(255,255,255,0.5)",
                          border: timeFilter === key ? "1px solid rgba(232,115,34,0.3)" : "1px solid transparent"
                        }}
                      >
                        {label}
                      </button>
                    ))}
                    {timeFilter === "custom" && (
                      <div className="flex items-center gap-1.5 ml-2">
                        <input
                          type="date"
                          value={customDateFrom}
                          onChange={(e) => setCustomDateFrom(e.target.value)}
                          className="px-2 py-1 rounded-lg text-xs outline-none"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", colorScheme: "dark" }}
                        />
                        <span style={{ color: "rgba(255,255,255,0.3)" }}>至</span>
                        <input
                          type="date"
                          value={customDateTo}
                          onChange={(e) => setCustomDateTo(e.target.value)}
                          className="px-2 py-1 rounded-lg text-xs outline-none"
                          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", colorScheme: "dark" }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 4: Keyword Search */}
                <div className="flex items-center gap-2">
                  <span className="text-xs flex-shrink-0" style={{ color: "rgba(255,255,255,0.4)", width: "60px" }}>搜索</span>
                  <div className="flex items-center gap-2 flex-1">
                    <div className="relative flex-1 max-w-[280px]">
                      <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.3)" }} />
                      <input
                        type="text"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        placeholder="搜索内容、成员、模型..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
                      />
                      {searchKeyword && (
                        <button
                          onClick={() => setSearchKeyword("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center rounded hover:bg-white/10"
                          style={{ color: "rgba(255,255,255,0.5)" }}
                        >
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto px-6 py-6">
            <div className="max-w-2xl mx-auto">
              {filteredMessages.map((msg) => {
                if (msg.type === "user") {
                  const sender = "sender" in msg ? msg.sender : null;
                  return (
                    <div key={msg.id} className="mb-5 flex items-start gap-2.5">
                      {/* Avatar */}
                      {sender && (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0 mt-1"
                          style={{ background: sender.color, fontSize: "11px", fontWeight: 600 }}
                        >
                          {sender.avatar}
                        </div>
                      )}
                      <div className="flex-1 max-w-[80%]">
                        {/* Sender Info */}
                        {sender && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{sender.name}</span>
                            <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>·</span>
                            <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>{sender.role}</span>
                          </div>
                        )}
                        <div className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm" style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.08)", lineHeight: 1.6 }}>{msg.content}</div>
                        <div className="mt-1" style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>{msg.time}</div>
                      </div>
                    </div>
                  );
                }
                return renderAIMessage(msg);
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Prompt Input */}
          <div className="flex-shrink-0 px-6 pb-5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="rounded-2xl p-3 mt-4" style={{ background: "rgba(30,26,20,0.9)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}>
              <div className="flex items-start gap-3 mb-3">
                <button className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Plus size={13} style={{ color: "rgba(255,255,255,0.45)" }} />
                </button>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder={`在 "${activeSessionName}" 中继续创作...`}
                  className="flex-1 bg-transparent text-sm resize-none outline-none"
                  style={{ color: "rgba(255,255,255,0.75)", caretColor: "#E87322", lineHeight: 1.6, minHeight: "60px", maxHeight: "120px" }}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(232,115,34,0.12)", color: "#E87322" }}>1024×1024</span>
                  <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)" }}>4张</span>
                </div>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm transition-opacity hover:opacity-80"
                  style={{ background: promptText.trim() ? "#E87322" : "rgba(232,115,34,0.3)" }}
                  disabled={!promptText.trim()}
                >
                  <Send size={13} />生成
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {storyboardDetailPanel && (
        <StoryboardDetailModal panel={storyboardDetailPanel} onClose={() => setStoryboardDetailPanel(null)} />
      )}
    </>
  );
}