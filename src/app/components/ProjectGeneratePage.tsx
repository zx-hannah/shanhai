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
  { id: "art", name: "主体", sessions: [{ id: "chars", name: "人物" }, { id: "scenes", name: "场景" }, { id: "props", name: "道具" }] },
  { id: "ep1", name: "第一集", sessions: [{ id: "sb1", name: "未命名" }, { id: "sb2", name: "分镜6-10" }] },
  { id: "ep2", name: "第二集", sessions: [{ id: "still", name: "静帧镜头" }, { id: "motion", name: "动态镜头" }] },
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
type ApplyTargetType = "subject" | "storyboard";

interface ApplyAssetState {
  type: "image" | "video";
  src: string;
  anchorId: string;
}

interface DeleteSessionState {
  folderId: string;
  sessionId: string;
  sessionName: string;
}

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

function ApplyCascadeMenu({
  asset,
  fileTree,
  targetType,
  setTargetType,
  subjectCategory,
  setSubjectCategory,
  selectedEpisode,
  setSelectedEpisode,
  selectedShot,
  setSelectedShot,
  onConfirm,
}: {
  asset: ApplyAssetState;
  fileTree: FileFolder[];
  targetType: ApplyTargetType;
  setTargetType: (value: ApplyTargetType) => void;
  subjectCategory: string;
  setSubjectCategory: (value: string) => void;
  selectedEpisode: string;
  setSelectedEpisode: (value: string) => void;
  selectedShot: string;
  setSelectedShot: (value: string) => void;
  onConfirm: () => void;
}) {
  const subjectFolder = fileTree.find((folder) => folder.id === "art");
  const episodeFolders = fileTree.filter((folder) => folder.name.startsWith("第"));
  const currentEpisode = episodeFolders.find((folder) => folder.id === selectedEpisode) ?? episodeFolders[0];
  const subjectItems = (subjectFolder?.sessions ?? []).map((session) => ({
    id: `${session.id}-item-1`,
    name: `${session.name}A`,
    preview: asset.src,
  }));
  const shotItems = (currentEpisode?.sessions ?? []).map((session) => ({
    id: `${session.id}-item-1`,
    name: session.name,
    preview: asset.src,
  }));
  const menuPanelStyle = {
    background: "rgba(26, 21, 16, 0.98)",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 16px 36px rgba(0,0,0,0.34)",
  } as const;
  const selectedMenuItemStyle = {
    background: "rgba(232,115,34,0.16)",
    color: "#FFFFFF",
  } as const;
  const menuItemStyle = {
    background: "transparent",
    color: "rgba(255,255,255,0.88)",
  } as const;

  return (
    <div className="absolute left-0 bottom-11 z-30 flex items-start gap-1 overflow-x-auto pb-1">
          <div className="w-36 rounded-2xl p-1.5 flex-shrink-0" style={menuPanelStyle}>
            {[
              { key: "subject", label: "主体" },
              { key: "storyboard", label: "分镜" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setTargetType(item.key as ApplyTargetType)}
                className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm"
                style={targetType === item.key ? selectedMenuItemStyle : menuItemStyle}
              >
                <span>{item.label}</span>
                <ChevronRight size={14} style={{ opacity: 0.75 }} />
              </button>
            ))}
          </div>

          {targetType === "subject" && (
            <>
            <div className="w-36 rounded-2xl p-1.5 flex-shrink-0" style={menuPanelStyle}>
              {(subjectFolder?.sessions ?? []).map((session) => (
                <button
                  key={session.id}
                  onClick={() => setSubjectCategory(session.id)}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm"
                  style={subjectCategory === session.id ? selectedMenuItemStyle : menuItemStyle}
                >
                  <span>{session.name}</span>
                  <ChevronRight size={14} style={{ opacity: 0.65 }} />
                </button>
              ))}
            </div>
            <div className="w-44 rounded-2xl p-1.5 flex-shrink-0" style={menuPanelStyle}>
              {subjectItems.map((item) => (
                <button
                  key={item.id}
                  onClick={onConfirm}
                  className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-left"
                  style={menuItemStyle}
                >
                  <div className="w-11 h-11 rounded-lg flex-shrink-0" style={{ background: `url(${item.preview}) center / cover no-repeat` }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm truncate">{item.name}</div>
                    <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>{subjectFolder?.sessions.find((session) => session.id === subjectCategory)?.name}</div>
                  </div>
                </button>
              ))}
            </div>
            </>
          )}

          {targetType === "storyboard" && (
            <>
              <div className="w-36 rounded-2xl p-1.5 flex-shrink-0" style={menuPanelStyle}>
                {episodeFolders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => {
                      setSelectedEpisode(folder.id);
                      setSelectedShot(folder.sessions[0]?.id ?? "");
                    }}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm"
                    style={selectedEpisode === folder.id ? selectedMenuItemStyle : menuItemStyle}
                  >
                    <span>{folder.name}</span>
                    <ChevronRight size={14} style={{ opacity: 0.75 }} />
                  </button>
                ))}
              </div>

              <div className="w-40 rounded-2xl p-1.5 flex-shrink-0" style={menuPanelStyle}>
                {(currentEpisode?.sessions ?? []).map((session) => (
                  <button
                    key={session.id}
                    onClick={() => setSelectedShot(session.id)}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm"
                    style={selectedShot === session.id ? selectedMenuItemStyle : menuItemStyle}
                  >
                    <span>{session.name}</span>
                    <ChevronRight size={14} style={{ opacity: selectedShot === session.id ? 0.95 : 0.55 }} />
                  </button>
                ))}
              </div>

              <div className="w-44 rounded-2xl p-1.5 flex-shrink-0" style={menuPanelStyle}>
                {shotItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={onConfirm}
                    className="w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-left"
                    style={menuItemStyle}
                  >
                    <div className="w-11 h-11 rounded-lg flex-shrink-0" style={{ background: `url(${item.preview}) center / cover no-repeat` }} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm truncate">{item.name}</div>
                      <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>{currentEpisode?.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
    </div>
  );
}

function DeleteSessionModal({
  sessionName,
  moveTargetId,
  setMoveTargetId,
  moveMode,
  setMoveMode,
  availableTargets,
  onClose,
  onConfirm,
}: {
  sessionName: string;
  moveTargetId: string;
  setMoveTargetId: (value: string) => void;
  moveMode: "delete" | "move";
  setMoveMode: (value: "delete" | "move") => void;
  availableTargets: { id: string; sessionName: string; folderId: string; folderName: string }[];
  onClose: () => void;
  onConfirm: () => void;
}) {
  const folderGroups = Array.from(
    availableTargets.reduce((map, t) => {
      if (!map.has(t.folderId)) map.set(t.folderId, { folderName: t.folderName, sessions: [] as typeof availableTargets });
      map.get(t.folderId)!.sessions.push(t);
      return map;
    }, new Map<string, { folderName: string; sessions: typeof availableTargets }>())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.72)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-5"
        style={{ background: "#17110D", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-white">删除对话</span>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10">
            <X size={14} style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.38)" }}>即将删除</span>
          <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>「{sessionName}」</span>
        </div>

        <div className="space-y-2 mb-4">
          {([
            { key: "delete" as const, title: "直接删除", desc: "删除对话及其全部历史生成记录，不可撤销" },
            { key: "move" as const, title: "迁移记录后删除", desc: "历史生成记录迁移到其他对话后再删除" },
          ]).map(({ key, title, desc }) => (
            <button
              key={key}
              onClick={() => setMoveMode(key)}
              className="w-full rounded-xl px-4 py-3 text-left transition-colors"
              style={{
                background: moveMode === key ? "rgba(232,115,34,0.1)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${moveMode === key ? "rgba(232,115,34,0.28)" : "rgba(255,255,255,0.07)"}`,
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: moveMode === key ? "#E87322" : "rgba(255,255,255,0.25)" }}>
                  {moveMode === key && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#E87322" }} />}
                </div>
                <span className="text-xs font-medium"
                  style={{ color: moveMode === key ? "#E87322" : "rgba(255,255,255,0.78)" }}>{title}</span>
              </div>
              <p className="text-[10px] mt-1.5 pl-6" style={{ color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>{desc}</p>
            </button>
          ))}
        </div>

        {moveMode === "move" && (
          <div className="mb-4">
            <div className="text-[10px] mb-2" style={{ color: "rgba(255,255,255,0.38)" }}>选择迁移目标</div>
            <div className="rounded-xl overflow-y-auto" style={{ border: "1px solid rgba(255,255,255,0.07)", maxHeight: "200px" }}>
              {folderGroups.map(([folderId, { folderName, sessions }]) => (
                <div key={folderId}>
                  <div className="px-3 py-1.5 text-[9px] uppercase sticky top-0"
                    style={{ background: "#1E1612", color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em" }}>
                    {folderName}
                  </div>
                  {sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => setMoveTargetId(session.id)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-left hover:bg-white/5 transition-colors"
                      style={{
                        background: moveTargetId === session.id ? "rgba(232,115,34,0.08)" : "transparent",
                        color: moveTargetId === session.id ? "#E87322" : "rgba(255,255,255,0.65)",
                      }}
                    >
                      <span>{session.sessionName}</span>
                      {moveTargetId === session.id && <Check size={11} style={{ color: "#E87322" }} />}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)" }}>
            取消
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-xl text-xs font-medium"
            style={{ background: moveMode === "delete" ? "rgba(239,68,68,0.85)" : "#E87322", color: "#fff" }}>
            {moveMode === "delete" ? "确认删除" : "迁移并删除"}
          </button>
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
  const project = getProjectById(id ?? "1");
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
  const [applyAsset, setApplyAsset] = useState<ApplyAssetState | null>(null);
  const [applyTargetType, setApplyTargetType] = useState<ApplyTargetType>("subject");
  const [subjectCategory, setSubjectCategory] = useState("chars");
  const [selectedShot, setSelectedShot] = useState("sb1");

  // Member filter state
  const [memberFilter, setMemberFilter] = useState<string[]>([CURRENT_USER.id]);

  // Generate filter states
  const [generateTypeFilter, setGenerateTypeFilter] = useState<GenerateTypeFilter>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showTimeMenu, setShowTimeMenu] = useState(false);
  const [showGenerateTypeMenu, setShowGenerateTypeMenu] = useState(false);
  const [showMemberMenu, setShowMemberMenu] = useState(false);

  // Root sessions (not inside any folder)
  const [rootSessions, setRootSessions] = useState<Session[]>([]);
  const [creatingRootSession, setCreatingRootSession] = useState(false);
  const [newRootSessionName, setNewRootSessionName] = useState("");
  const [deleteSessionState, setDeleteSessionState] = useState<DeleteSessionState | null>(null);
  const [deleteMode, setDeleteMode] = useState<"delete" | "move">("delete");
  const [moveTargetSessionId, setMoveTargetSessionId] = useState("");

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

  const { folder: activeFolderName, session: activeSessionName } = getActiveSessionName();
  const currentEpisodeLabel = activeFolderName.startsWith("第")
    ? activeFolderName
    : (epParam ? fileTree.find((folder) => folder.id === epParam)?.name : undefined) ?? "第一集";

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

  const requestDeleteSession = (folderId: string, sessionId: string) => {
    const folder = fileTree.find((item) => item.id === folderId);
    const session = folder?.sessions.find((item) => item.id === sessionId);
    if (!folder || !session) return;

    const fallbackTarget = fileTree
      .filter((item) => item.id !== "art")
      .flatMap((item) => item.sessions.map((child) => ({ folderId: item.id, folderName: item.name, ...child })))
      .find((item) => item.id !== sessionId);

    setDeleteSessionState({ folderId, sessionId, sessionName: session.name });
    setDeleteMode("delete");
    setMoveTargetSessionId(fallbackTarget?.id ?? "");
    setSessionMenuId(null);
  };

  const confirmDeleteSessionAction = () => {
    if (!deleteSessionState) return;
    const { folderId, sessionId, sessionName } = deleteSessionState;
    if (deleteMode === "move" && !moveTargetSessionId) {
      toast.error("请选择要迁移到的 session");
      return;
    }

    setFileTree((prev) => prev.map((f) => f.id === folderId ? { ...f, sessions: f.sessions.filter((s) => s.id !== sessionId) } : f));
    if (activeSession === sessionId) setActiveSession("");
    if (deleteMode === "move" && moveTargetSessionId) {
      const target = fileTree
        .flatMap((folder) => folder.sessions.map((session) => ({ folderName: folder.name, ...session })))
        .find((session) => session.id === moveTargetSessionId);
      toast.success(`已删除对话，历史生成记录已移动到「${target?.name ?? "目标 session"}」`);
    } else {
      toast.success(`已删除「${sessionName}」及其全部生成记录`);
    }
    setDeleteSessionState(null);
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
              <div className="flex items-end justify-between">
                <button
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:opacity-80"
                  style={{ background: "rgba(0,0,0,0.52)", backdropFilter: "blur(10px)", color: "white", border: "1px solid rgba(255,255,255,0.08)" }}
                  onClick={() => {
                    setApplyAsset({ type: "video", src: msg.videoThumbnail, anchorId: msg.id });
                    setApplyTargetType("storyboard");
                    setSelectedEpisode("ep1");
                    setSelectedShot("sb1");
                  }}
                >
                  <Upload size={11} />
                  <span className="text-[10px]">应用</span>
                </button>
                {applyAsset?.anchorId === msg.id && (
                  <ApplyCascadeMenu
                    asset={applyAsset}
                    fileTree={fileTree}
                    targetType={applyTargetType}
                    setTargetType={setApplyTargetType}
                    subjectCategory={subjectCategory}
                    setSubjectCategory={setSubjectCategory}
                    selectedEpisode={selectedEpisode}
                    setSelectedEpisode={setSelectedEpisode}
                    selectedShot={selectedShot}
                    setSelectedShot={setSelectedShot}
                    onConfirm={() => {
                      const folder = applyTargetType === "subject"
                        ? fileTree.find((item) => item.id === "art")
                        : fileTree.find((item) => item.id === selectedEpisode);
                      const targetName = applyTargetType === "subject"
                        ? folder?.sessions.find((item) => item.id === subjectCategory)?.name
                        : folder?.sessions.find((item) => item.id === selectedShot)?.name;
                      toast.success(`已应用到${applyTargetType === "subject" ? "主体" : "分镜"} / ${targetName ?? "未命名"}`);
                      setApplyAsset(null);
                    }}
                  />
                )}
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
                <div className="flex items-end justify-between relative">
                  <button
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:opacity-80"
                    style={{ background: "rgba(0,0,0,0.52)", backdropFilter: "blur(10px)", color: "white", border: "1px solid rgba(255,255,255,0.08)" }}
                    onClick={() => {
                      setApplyAsset({ type: "image", src, anchorId: `${msg.id}-${i}` });
                      setApplyTargetType("subject");
                      setSubjectCategory("chars");
                    }}
                  >
                    <Upload size={11} />
                    <span className="text-[10px]">应用</span>
                  </button>
                  {applyAsset?.anchorId === `${msg.id}-${i}` && (
                    <ApplyCascadeMenu
                      asset={applyAsset}
                      fileTree={fileTree}
                      targetType={applyTargetType}
                      setTargetType={setApplyTargetType}
                      subjectCategory={subjectCategory}
                      setSubjectCategory={setSubjectCategory}
                      selectedEpisode={selectedEpisode}
                      setSelectedEpisode={setSelectedEpisode}
                      selectedShot={selectedShot}
                      setSelectedShot={setSelectedShot}
                      onConfirm={() => {
                        const folder = applyTargetType === "subject"
                          ? fileTree.find((item) => item.id === "art")
                          : fileTree.find((item) => item.id === selectedEpisode);
                        const targetName = applyTargetType === "subject"
                          ? folder?.sessions.find((item) => item.id === subjectCategory)?.name
                          : folder?.sessions.find((item) => item.id === selectedShot)?.name;
                        toast.success(`已应用到${applyTargetType === "subject" ? "主体" : "分镜"} / ${targetName ?? "未命名"}`);
                        setApplyAsset(null);
                      }}
                    />
                  )}
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
      <div className="px-3 pt-3 pb-2 flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div
          className="flex items-center gap-2 px-3 h-9 rounded-xl"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
          }}
        >
          <Search size={13} style={{ color: "rgba(255,255,255,0.35)" }} />
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="搜索剧集、分组、会话"
            className="flex-1 bg-transparent text-xs outline-none"
            style={{ color: "rgba(255,255,255,0.78)" }}
          />
          {searchText && (
            <button onClick={() => setSearchText("")} className="w-4 h-4 flex items-center justify-center rounded hover:bg-white/10">
              <X size={10} style={{ color: "rgba(255,255,255,0.3)" }} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-2.5 py-3 space-y-4">
        {rootSessions.length > 0 && (
          <div className="px-1">
            <div className="flex items-center justify-between px-1.5 mb-2">
              <span className="text-[11px] tracking-[0.18em] uppercase" style={{ color: "rgba(255,255,255,0.28)" }}>
                最近对话
              </span>
              <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                {rootSessions.length}
              </span>
            </div>
            <div className="space-y-1">
              {rootSessions
                .filter((session) => !searchText || session.name.toLowerCase().includes(searchText.toLowerCase()))
                .map((session) => {
                  const isActive = session.id === activeSession;
                  return (
                    <button
                      key={session.id}
                      onClick={() => setActiveSession(session.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-colors"
                      style={{
                        background: isActive ? "rgba(232,115,34,0.12)" : "rgba(255,255,255,0.025)",
                        border: `1px solid ${isActive ? "rgba(232,115,34,0.2)" : "rgba(255,255,255,0.04)"}`,
                        color: isActive ? "#F1A66C" : "rgba(255,255,255,0.62)",
                      }}
                    >
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <MessageSquare size={11} />
                      </div>
                      <span className="text-xs truncate">{session.name}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        {fileTree.map((folder) => {
          const isExpanded = expandedFolders[folder.id];
          const isSubjectFolder = folder.id === "art";
          const visibleSessions = folder.sessions.filter((session) => {
            if (!searchText) return true;
            const keyword = searchText.toLowerCase();
            return folder.name.toLowerCase().includes(keyword) || session.name.toLowerCase().includes(keyword);
          });

          if (searchText && visibleSessions.length === 0) {
            return null;
          }

          return (
            <div
              key={folder.id}
              className="rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.02) 100%)",
                border: "1px solid rgba(255,255,255,0.05)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
              }}
            >
              <button
                onClick={() => toggleFolder(folder.id)}
                className="w-full flex items-center gap-2 px-3 py-3 text-xs transition-colors"
                style={{ color: "rgba(255,255,255,0.78)" }}
              >
                <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(232,115,34,0.1)", border: "1px solid rgba(232,115,34,0.14)" }}>
                  {isExpanded ? <FolderOpen size={13} style={{ color: "#E87322" }} /> : <Folder size={13} style={{ color: "#D68A4E" }} />}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-[13px] font-medium truncate">{folder.name}</div>
                  <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.28)" }}>
                    {visibleSessions.length} 个内容
                  </div>
                </div>
                <div className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>
                  {visibleSessions.length}
                </div>
                <ChevronRight size={12} style={{ color: "rgba(255,255,255,0.28)", transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s", flexShrink: 0 }} />
              </button>

              {isExpanded && (
                <div className="px-2 pb-2">
                  {visibleSessions.map((session) => {
                    const isActive = session.id === activeSession;
                    const isRenamingSession = renamingSessionId === session.id;
                    const showSessionMenu = sessionMenuId === session.id;
                    return (
                      <div key={session.id} className="flex items-center group relative">
                        <button
                          className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-colors min-w-0"
                          style={{
                            background: isActive ? "rgba(232,115,34,0.12)" : "transparent",
                            color: isActive ? "#F3AB72" : "rgba(255,255,255,0.62)",
                          }}
                          onClick={() => setActiveSession(session.id)}
                        >
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: isActive ? "rgba(232,115,34,0.16)" : "rgba(255,255,255,0.05)" }}>
                            <MessageSquare size={11} style={{ opacity: isActive ? 1 : 0.7 }} />
                          </div>
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
                        {!isSubjectFolder && (
                          <button
                            className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5"
                            onClick={(e) => { e.stopPropagation(); setSessionMenuId(showSessionMenu ? null : session.id); }}
                          >
                            <MoreHorizontal size={10} style={{ color: "rgba(255,255,255,0.35)" }} />
                          </button>
                        )}
                        {!isSubjectFolder && showSessionMenu && (
                          <div className="absolute right-0 top-full z-20 rounded-xl overflow-hidden" style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.6)", minWidth: "130px" }} onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => startRenameSession(folder.id, session.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-white/5" style={{ color: "rgba(255,255,255,0.7)" }}>
                              <Pencil size={10} />重命名
                            </button>
                            <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
                            <button onClick={() => requestDeleteSession(folder.id, session.id)} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-red-900/20" style={{ color: "#ff6b6b" }}>
                              <Trash2 size={10} />删除
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {isSubjectFolder ? null : creatingSessionInFolder === folder.id ? (
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <MessageSquare size={11} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                      <input autoFocus
                        className="flex-1 bg-transparent text-xs outline-none px-1 py-0.5 rounded"
                        style={{ border: "1px solid rgba(232,115,34,0.5)", color: "rgba(255,255,255,0.8)", caretColor: "#E87322" }}
                        value={newSessionName}
                        onChange={(e) => setNewSessionName(e.target.value)}
                        placeholder="输入内容名称..."
                        onKeyDown={(e) => { if (e.key === "Enter") createSession(folder.id); if (e.key === "Escape") { setCreatingSessionInFolder(null); setNewSessionName(""); } }}
                        onBlur={() => { if (newSessionName.trim()) createSession(folder.id); else { setCreatingSessionInFolder(null); setNewSessionName(""); } }}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setCreatingSessionInFolder(folder.id)}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs transition-colors w-full"
                      style={{ color: "rgba(255,255,255,0.32)", background: "rgba(255,255,255,0.025)" }}
                    >
                      <Plus size={10} />新建对话
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="px-3 py-3 border-t flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <button
          onClick={() => {
            setCreatingRootSession(true);
            setNewRootSessionName("");
          }}
          className="w-full h-10 rounded-xl text-sm font-medium transition-opacity hover:opacity-90"
          style={{
            background: "linear-gradient(180deg, #F29A54 0%, #E87322 100%)",
            color: "#fff",
            boxShadow: "0 10px 24px rgba(232,115,34,0.25)",
          }}
        >
          新建剧集
        </button>
        {creatingRootSession && (
          <div className="mt-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <input
              autoFocus
              className="w-full bg-transparent text-xs outline-none"
              style={{ color: "rgba(255,255,255,0.78)", caretColor: "#E87322" }}
              value={newRootSessionName}
              onChange={(e) => setNewRootSessionName(e.target.value)}
              placeholder="输入剧集名称..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && newRootSessionName.trim()) {
                  const s: Session = { id: `root${Date.now()}`, name: newRootSessionName.trim() };
                  setRootSessions((prev) => [...prev, s]);
                  setActiveSession(s.id);
                  setNewRootSessionName("");
                  setCreatingRootSession(false);
                }
                if (e.key === "Escape") {
                  setCreatingRootSession(false);
                  setNewRootSessionName("");
                }
              }}
              onBlur={() => {
                if (newRootSessionName.trim()) {
                  const s: Session = { id: `root${Date.now()}`, name: newRootSessionName.trim() };
                  setRootSessions((prev) => [...prev, s]);
                  setActiveSession(s.id);
                }
                setNewRootSessionName("");
                setCreatingRootSession(false);
              }}
            />
          </div>
        )}
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
    { key: "storyboard", label: "分镜" },
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
        <div className="flex-1 flex flex-col overflow-hidden relative" style={{ background: "#120D08", marginLeft: sidebarCollapsed ? "0px" : "240px", transition: "margin-left 0.2s ease" }}>
          {/* Header with Visible Filter Tags */}
          <div className="px-6 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Package size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.34)" }}>
                  {currentEpisodeLabel}
                </span>
                <ChevronRight size={12} style={{ color: "rgba(255,255,255,0.18)" }} />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {activeSessionName || "未命名分镜"}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
                  {filteredMessages.length} 条
                </span>
              </div>

              <div
                className="flex items-center rounded-2xl px-2 py-1.5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 30px rgba(0,0,0,0.14)" }}
                onClick={(e) => e.stopPropagation()}
              >
              <div className="flex items-center gap-2 px-3 min-w-[170px]">
                <Search size={15} style={{ color: "rgba(255,255,255,0.62)" }} />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="搜索内容、成员、模型..."
                  className="bg-transparent text-xs flex-1 outline-none"
                  style={{ color: "rgba(255,255,255,0.78)" }}
                />
                {searchKeyword && (
                  <button onClick={() => setSearchKeyword("")} className="w-4 h-4 flex items-center justify-center rounded hover:bg-white/10">
                    <X size={10} style={{ color: "rgba(255,255,255,0.32)" }} />
                  </button>
                )}
              </div>
              <div className="mx-2 h-5 w-px" style={{ background: "rgba(255,255,255,0.08)" }} />

              <div className="relative">
                <button
                  onClick={() => {
                    setShowTimeMenu((v) => !v);
                    setShowGenerateTypeMenu(false);
                    setShowMemberMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
                  style={{ color: timeFilter !== "all" ? "#E87322" : "rgba(255,255,255,0.82)" }}
                >
                  <span>{timeFilter === "all" ? "时间" : timeFilter === "today" ? "今天" : timeFilter === "week" ? "近7天" : timeFilter === "month" ? "近30天" : "自定义"}</span>
                  <ChevronDown size={11} />
                </button>
                {showTimeMenu && (
                  <div className="absolute top-full mt-2 left-0 z-20 rounded-xl overflow-hidden shadow-2xl"
                    style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)", minWidth: "180px" }}>
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
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left hover:bg-white/5"
                        style={{ color: timeFilter === key ? "#E87322" : "rgba(255,255,255,0.6)" }}
                      >
                        <Check size={9} style={{ color: timeFilter === key ? "#E87322" : "transparent" }} />
                        {label}
                      </button>
                    ))}
                    {timeFilter === "custom" && (
                      <div className="px-3 py-2.5 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        <div className="flex items-center gap-1.5">
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
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mx-2 h-5 w-px" style={{ background: "rgba(255,255,255,0.08)" }} />

              <div className="relative">
                <button
                  onClick={() => {
                    setShowGenerateTypeMenu((v) => !v);
                    setShowTimeMenu(false);
                    setShowMemberMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
                  style={{ color: generateTypeFilter !== "all" ? "#E87322" : "rgba(255,255,255,0.82)" }}
                >
                  <span>{generateTypeFilter === "all" ? "类型" : generateTypeFilter === "image" ? "图片" : "视频"}</span>
                  <ChevronDown size={11} />
                </button>
                {showGenerateTypeMenu && (
                  <div className="absolute top-full mt-2 left-0 z-20 rounded-xl overflow-hidden shadow-2xl"
                    style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)", minWidth: "140px" }}>
                    {[
                      { key: "all", label: "全部" },
                      { key: "image", label: "图片" },
                      { key: "video", label: "视频" },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        onClick={() => { setGenerateTypeFilter(key as GenerateTypeFilter); setShowGenerateTypeMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left hover:bg-white/5"
                        style={{ color: generateTypeFilter === key ? "#E87322" : "rgba(255,255,255,0.6)" }}
                      >
                        <Check size={9} style={{ color: generateTypeFilter === key ? "#E87322" : "transparent" }} />
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mx-2 h-5 w-px" style={{ background: "rgba(255,255,255,0.08)" }} />

              <div className="relative">
                <button
                  onClick={() => {
                    setShowMemberMenu((v) => !v);
                    setShowTimeMenu(false);
                    setShowGenerateTypeMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
                  style={{ color: memberFilter.length > 0 ? "#E87322" : "rgba(255,255,255,0.82)" }}
                >
                  <span>{memberFilter.length === 1 && memberFilter[0] === CURRENT_USER.id ? "成员·我" : memberFilter.length > 0 ? `成员 ${memberFilter.length}` : "成员"}</span>
                  <ChevronDown size={11} />
                </button>
                {showMemberMenu && (
                  <div className="absolute top-full mt-2 right-0 z-20 rounded-xl overflow-hidden shadow-2xl"
                    style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)", minWidth: "170px" }}>
                    <button
                      onClick={() => setMemberFilter([])}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left hover:bg-white/5"
                      style={{
                        color: memberFilter.length === 0 ? "#E87322" : "rgba(255,255,255,0.6)",
                        background: memberFilter.length === 0 ? "rgba(232,115,34,0.08)" : "transparent",
                      }}>
                      <Check size={9} style={{ color: memberFilter.length === 0 ? "#E87322" : "transparent" }} />
                      全部成员
                    </button>
                    <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
                    {PROJECT_MEMBERS.map((member) => {
                      const selected = memberFilter.includes(member.id);
                      return (
                        <button
                          key={member.id}
                          onClick={() => toggleMemberFilter(member.id)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-left hover:bg-white/5"
                          style={{
                            color: selected ? member.color : "rgba(255,255,255,0.6)",
                            background: selected ? `${member.color}12` : "transparent",
                          }}
                        >
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: member.color, fontSize: "8px", color: "#fff" }}>
                            {member.avatar}
                          </div>
                          <span className="flex-1">{member.name}</span>
                          {selected && <Check size={9} style={{ color: member.color }} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto px-6 py-10" style={{ background: "radial-gradient(circle at top, rgba(232,115,34,0.04), transparent 26%), #120D08" }}>
            <div className="max-w-3xl mx-auto">
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
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-6 pb-6">
            <div
              className="pointer-events-auto w-full max-w-6xl rounded-[36px] p-6"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(18,13,8,0.92) 12%, rgba(10,8,13,0.96) 100%)",
                border: "1px solid rgba(255,255,255,0.22)",
                boxShadow: "0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)",
                backdropFilter: "blur(18px)",
              }}
            >
              <div className="flex items-start gap-4">
                <button className="w-18 h-18 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1" style={{ width: "76px", height: "76px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.22)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)" }}>
                  <Plus size={34} style={{ color: "rgba(255,255,255,0.75)" }} />
                </button>
                <div className="flex-1 min-h-[170px] flex flex-col">
                  <div className="flex-1">
                    <textarea
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      placeholder={`在 "${activeSessionName}" 中继续创作...`}
                      className="w-full bg-transparent text-sm resize-none outline-none"
                      style={{ color: "rgba(255,255,255,0.82)", caretColor: "#E87322", lineHeight: 1.7, minHeight: "120px", maxHeight: "220px" }}
                    />
                  </div>
                  <div className="flex items-center justify-between pt-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-3 py-1.5 rounded-xl" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.78)" }}>图片生成</span>
                      <span className="text-xs px-3 py-1.5 rounded-xl" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.78)" }}>Image-2</span>
                      <span className="text-xs px-3 py-1.5 rounded-xl" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.78)" }}>智能比例</span>
                      <span className="text-xs px-3 py-1.5 rounded-xl" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.78)" }}>1K</span>
                      <span className="text-xs px-3 py-1.5 rounded-xl" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.78)" }}>4张</span>
                      <button className="text-xs px-3 py-1.5 rounded-xl" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)" }}>
                        选择风格
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{promptText.length} / 1000</span>
                      <button
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-white text-sm transition-opacity hover:opacity-85"
                        style={{ background: promptText.trim() ? "#E87322" : "rgba(232,115,34,0.3)", boxShadow: promptText.trim() ? "0 12px 30px rgba(232,115,34,0.28)" : "none" }}
                        disabled={!promptText.trim()}
                      >
                        <Send size={14} />生成
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {deleteSessionState && (
        <DeleteSessionModal
          sessionName={deleteSessionState.sessionName}
          moveTargetId={moveTargetSessionId}
          setMoveTargetId={setMoveTargetSessionId}
          moveMode={deleteMode}
          setMoveMode={setDeleteMode}
          availableTargets={fileTree
            .filter((folder) => folder.id !== "art")
            .flatMap((folder) => folder.sessions.map((session) => ({
              id: session.id,
              sessionName: session.name,
              folderId: folder.id,
              folderName: folder.name,
            })))
            .filter((session) => session.id !== deleteSessionState.sessionId)}
          onClose={() => setDeleteSessionState(null)}
          onConfirm={confirmDeleteSessionAction}
        />
      )}
      {storyboardDetailPanel && (
        <StoryboardDetailModal panel={storyboardDetailPanel} onClose={() => setStoryboardDetailPanel(null)} />
      )}
    </>
  );
}
