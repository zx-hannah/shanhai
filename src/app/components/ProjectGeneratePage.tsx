import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import {
  Folder, FolderOpen, MessageSquare, ChevronRight, Plus, Image as LucideImage, Video, Music,
  Star, Upload, Package, Send, Sparkles, MoreHorizontal, Download, RefreshCw,
  Search, Pencil, Trash2, X, Check, ChevronDown, Film, AlignLeft, Copy, Play,
  ChevronLeft, Users, Filter,
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

// ─── Chat Messages ────────────────────────────────────────────────────────────
const CHAT_MESSAGES = [
  { id: "m1", type: "user" as const, content: "帮我设计主角：古风女侠，白发飞扬，身着月白色长袍，腰悬宝剑，气质冷峻仙气，画面风格参考敦煌壁画，高清质感", time: "14:28", sender: PROJECT_MEMBERS[0] },
  { id: "m2", type: "ai" as const, images: ["https://images.unsplash.com/photo-1743951896798-2936f661f939?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80"], model: "Seedream 3.0", time: "14:32", seed: "1024×1024 · 4张" },
  { id: "m3", type: "user" as const, content: "调整第3张，让她的服装更华丽，增加金色刺绣纹样和宽袖披帛，保持仙气飘逸的整体风格", time: "14:35", sender: PROJECT_MEMBERS[1] },
  { id: "m4", type: "ai" as const, images: ["https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80"], model: "Seedream 3.0", time: "14:37", seed: "1024×1024 · 2张" },
  { id: "m5", type: "user" as const, content: "生成山林背景，云雾缭绕，仙气飘渺", time: "14:40", sender: PROJECT_MEMBERS[2] },
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
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("files");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [fileTree, setFileTree] = useState<FileFolder[]>(INITIAL_FILE_TREE);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ art: true });
  const [activeSession, setActiveSession] = useState("chars");
  const [assetSubTab, setAssetSubTab] = useState<AssetSubTab>("generate");
  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetTypeFilter>("all");
  const [showAssetTypeMenu, setShowAssetTypeMenu] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [hoveredImg, setHoveredImg] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [collectedAssets, setCollectedAssets] = useState<Set<string>>(new Set());

  // File/session editing
  const [folderMenuId, setFolderMenuId] = useState<string | null>(null);
  const [sessionMenuId, setSessionMenuId] = useState<string | null>(null);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
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
  const [showMemberFilter, setShowMemberFilter] = useState(false);

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

  // Filter messages by selected members
  const filteredMessages = memberFilter.length === 0
    ? CHAT_MESSAGES
    : CHAT_MESSAGES.filter((msg) => {
        if (msg.type === "ai") return true;
        return "sender" in msg && memberFilter.includes(msg.sender.id);
      });

  // ── File tree CRUD ───────────────────────────────────────────────────────────
  const startRenameFolder = (id: string) => {
    const folder = fileTree.find((f) => f.id === id);
    if (folder) { setRenamingFolderId(id); setRenameValue(folder.name); setFolderMenuId(null); }
  };

  const confirmRenameFolder = (id: string) => {
    if (renameValue.trim())
      setFileTree((prev) => prev.map((f) => f.id === id ? { ...f, name: renameValue.trim() } : f));
    setRenamingFolderId(null);
  };

  const deleteFolder = (id: string) => {
    setFileTree((prev) => prev.filter((f) => f.id !== id));
    setFolderMenuId(null);
    toast.success("已删除文件夹");
  };

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

  const createFolder = () => {
    const newFolder: FileFolder = { id: `folder${Date.now()}`, name: "新文件夹", sessions: [] };
    setFileTree((prev) => [...prev, newFolder]);
    setExpandedFolders((prev) => ({ ...prev, [newFolder.id]: true }));
    setRenamingFolderId(newFolder.id);
    setRenameValue("新文件夹");
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
  const renderAIMessage = (msg: { id: string; type: "ai"; images: string[]; model: string; time: string; seed: string }) => {
    const cols = msg.images.length <= 2 ? msg.images.length : 2;
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
          {msg.images.map((src, i) => (
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
    <div className="flex flex-col h-full" onClick={() => { setFolderMenuId(null); setSessionMenuId(null); }}>
      {/* Action buttons */}
      <div className="flex items-center gap-1.5 px-2 py-2 flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <button
          onClick={() => { setCreatingRootSession(true); setNewRootSessionName(""); }}
          className="flex items-center gap-1 flex-1 justify-center py-1.5 rounded-md text-xs transition-colors hover:opacity-80"
          style={{ background: "rgba(232,115,34,0.15)", color: "#E87322", border: "1px solid rgba(232,115,34,0.25)" }}
        >
          <MessageSquare size={10} />新建对话
        </button>
        <button
          onClick={createFolder}
          className="flex items-center gap-1 flex-1 justify-center py-1.5 rounded-md text-xs transition-colors hover:opacity-80"
          style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <Plus size={10} />新建文件夹
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
        {fileTree.map((folder) => {
          const isExpanded = expandedFolders[folder.id];
          const isRenamingFolder = renamingFolderId === folder.id;
          const showFolderMenu = folderMenuId === folder.id;
          return (
            <div key={folder.id} className="mb-0.5">
              <div className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors hover:bg-white/5 group relative">
                <button onClick={() => toggleFolder(folder.id)} className="flex-1 flex items-center gap-1.5 text-left min-w-0">
                  <ChevronRight size={11} style={{ color: "rgba(255,255,255,0.35)", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s", flexShrink: 0 }} />
                  {isExpanded ? <FolderOpen size={13} style={{ color: "#E87322", flexShrink: 0 }} /> : <Folder size={13} style={{ color: "rgba(255,255,255,0.45)", flexShrink: 0 }} />}
                  {isRenamingFolder ? (
                    <input autoFocus className="flex-1 bg-transparent text-xs outline-none px-1 py-0.5 rounded min-w-0"
                      style={{ border: "1px solid rgba(232,115,34,0.5)", color: "rgba(255,255,255,0.8)", caretColor: "#E87322" }}
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onBlur={() => confirmRenameFolder(folder.id)}
                      onKeyDown={(e) => { if (e.key === "Enter") confirmRenameFolder(folder.id); if (e.key === "Escape") setRenamingFolderId(null); }}
                    />
                  ) : (
                    <span className="text-xs truncate flex-1" style={{ color: isExpanded ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.6)" }}>{folder.name}</span>
                  )}
                </button>
                <button
                  className="opacity-0 group-hover:opacity-100 flex-shrink-0"
                  onClick={(e) => { e.stopPropagation(); setFolderMenuId(showFolderMenu ? null : folder.id); }}
                >
                  <MoreHorizontal size={11} style={{ color: "rgba(255,255,255,0.35)" }} />
                </button>
                {showFolderMenu && (
                  <div className="absolute right-0 top-full z-20 rounded-xl overflow-hidden" style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.6)", minWidth: "130px" }} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { setCreatingSessionInFolder(folder.id); setFolderMenuId(null); if (!isExpanded) toggleFolder(folder.id); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-white/5" style={{ color: "rgba(255,255,255,0.7)" }}>
                      <Plus size={10} />新建 Session
                    </button>
                    <button onClick={() => startRenameFolder(folder.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-white/5" style={{ color: "rgba(255,255,255,0.7)" }}>
                      <Pencil size={10} />重命名
                    </button>
                    <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
                    <button onClick={() => deleteFolder(folder.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-red-900/20" style={{ color: "#ff6b6b" }}>
                      <Trash2 size={10} />删除
                    </button>
                  </div>
                )}
              </div>

              {isExpanded && (
                <div className="ml-4 mt-0.5">
                  {folder.sessions.map((session) => {
                    const isActive = session.id === activeSession;
                    const isRenamingSession = renamingSessionId === session.id;
                    const showSessionMenu = sessionMenuId === session.id;
                    return (
                      <div key={session.id} className="flex items-center group relative">
                        <button
                          className="flex-1 flex items-center gap-1.5 px-2 py-1.5 rounded-md text-left transition-colors min-w-0"
                          style={{ background: isActive ? "rgba(232,115,34,0.12)" : "transparent", color: isActive ? "#E87322" : "rgba(255,255,255,0.5)" }}
                          onClick={() => setActiveSession(session.id)}
                        >
                          <MessageSquare size={11} style={{ flexShrink: 0 }} />
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
                            <span className="text-xs truncate flex-1">{session.name}</span>
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

                  {/* New session input */}
                  {creatingSessionInFolder === folder.id ? (
                    <div className="flex items-center gap-1 px-2 py-1.5">
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
                    null
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
      <div className="flex h-full" onClick={() => { setFolderMenuId(null); setSessionMenuId(null); setShowAssetTypeMenu(false); setShowFieldMenu(false); setShowEpisodeMenu(false); }}>
        {/* ── Secondary Sidebar ─────────────────────────────────────────────── */}
        <div
          className="flex flex-col flex-shrink-0 relative"
          style={{
            width: sidebarCollapsed ? "28px" : "240px",
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
            style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }}
            title={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
          >
            {sidebarCollapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
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
        <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#140F09" }}>
          {/* Header with Member Filter */}
          <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-2">
              <Users size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                {memberFilter.length === 0 ? "所有成员" : `${memberFilter.length} 位成员`}
              </span>
            </div>

            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowMemberFilter(!showMemberFilter)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <Filter size={11} />
                筛选成员
                <ChevronDown size={10} />
              </button>

              {showMemberFilter && (
                <div
                  className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-30 shadow-2xl"
                  style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)", minWidth: "180px" }}
                >
                  <button
                    onClick={() => setMemberFilter([])}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-xs text-left hover:bg-white/5"
                    style={{ color: memberFilter.length === 0 ? "#E87322" : "rgba(255,255,255,0.7)" }}
                  >
                    <span>所有成员</span>
                    {memberFilter.length === 0 && <Check size={11} style={{ color: "#E87322" }} />}
                  </button>
                  <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
                  {PROJECT_MEMBERS.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => toggleMemberFilter(member.id)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left hover:bg-white/5"
                    >
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
                        style={{ background: member.color, fontSize: "9px" }}>
                        {member.avatar}
                      </div>
                      <span className="flex-1" style={{ color: "rgba(255,255,255,0.7)" }}>{member.name}</span>
                      {memberFilter.includes(member.id) && <Check size={11} style={{ color: "#E87322" }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
                return renderAIMessage(msg as typeof CHAT_MESSAGES[1]);
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