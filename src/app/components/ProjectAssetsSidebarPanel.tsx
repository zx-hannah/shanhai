// Shared assets sidebar panel - unified style for all project pages
import { useState, useRef } from "react";
import {
  ChevronLeft, ChevronDown, Search, Star, Plus, Video, Sparkles,
  Upload, Package, X, Image as LucideImage, Music, Check,
  Film, Cpu, Scan, MoveRight, Clock3, CheckCircle2, AlertCircle,
  Download, Trash2, Pencil, Copy, User, TreePalm, ImagePlus,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";

type SubTab = "generate" | "upload" | "subject" | "collect";
type TypeFilter = "image" | "video" | "audio";
type ReviewStatus = "pending" | "approved" | "rejected";
type SubjectKind = "sd_ip" | "character" | "scene" | "prop";

// ─── Asset data ──────────────────────────────────────────────────────────────
interface SidebarAsset {
  id: string;
  name: string;
  type: TypeFilter;
  src: string;
  size: string;
  date: string;
  memberId?: string;
  reviewStatus?: ReviewStatus;
}

interface GenerateAsset extends SidebarAsset {
  prompt: string;
  model: string;
  resolution: string;
  ratio: string;
  referenceImages?: string[];
  appliedTo?: { type: "subject" | "storyboard"; label: string; id: string }[];
}

interface SubjectSidebarAsset extends SidebarAsset {
  subjectKind?: SubjectKind;
  displayName?: string;
}

const PROJECT_MEMBERS = [
  { id: "1", name: "Alice", avatar: "Al", color: "#E87322", role: "主创" },
  { id: "2", name: "Bob", avatar: "Bo", color: "#7B3FC4", role: "背景" },
  { id: "3", name: "Carol", avatar: "Ca", color: "#2A6FC4", role: "角色" },
  { id: "4", name: "Dave", avatar: "Da", color: "#C42A6F", role: "道具" },
];

const REVIEW_STATUS_CONFIG: Record<ReviewStatus, { label: string; shortLabel: string; color: string; bg: string; border: string; icon: typeof Clock3 }> = {
  pending: {
    label: "审核中", shortLabel: "审核中",
    color: "rgba(255,255,255,0.78)", bg: "rgba(255,255,255,0.08)", border: "rgba(255,255,255,0.12)",
    icon: Clock3,
  },
  approved: {
    label: "审核通过", shortLabel: "已通过",
    color: "#4AC678", bg: "rgba(74,198,120,0.14)", border: "rgba(74,198,120,0.22)",
    icon: CheckCircle2,
  },
  rejected: {
    label: "审核失败", shortLabel: "未通过",
    color: "#ff6b6b", bg: "rgba(255,107,107,0.14)", border: "rgba(255,107,107,0.22)",
    icon: AlertCircle,
  },
};

const SUBJECT_KIND_CONFIG: Record<SubjectKind, { icon: typeof User; label: string; color: string }> = {
  sd_ip:     { icon: Sparkles, label: "虚拟IP",  color: "#E87322" },
  character: { icon: User,     label: "人物",    color: "#7B3FC4" },
  scene:     { icon: TreePalm, label: "场景",    color: "#2A6FC4" },
  prop:      { icon: Package,  label: "道具",    color: "#C42A6F" },
};

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
    referenceImages: ["https://images.unsplash.com/photo-1551264397-09c6f678a930?w=100&q=60"],
    appliedTo: [{ type: "storyboard", label: "分镜 #03", id: "sp3" }],
  },
  {
    id: "g3", name: "山林场景.mp4", type: "video", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=200&q=70",
    size: "12MB", date: "今天", memberId: "2",
    prompt: "山林云雾缭绕，仙气飘渺，镜头缓慢推进，云海翻涌，光影变化",
    model: "Seedream 3.0 Video", resolution: "1280×720", ratio: "16:9",
    referenceImages: [],
    appliedTo: [{ type: "storyboard", label: "分镜 #01", id: "sp1" }],
  },
  {
    id: "g4", name: "道具宝剑.jpg", type: "image", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=200&q=70",
    size: "0.9MB", date: "昨天", memberId: "3",
    prompt: "古风宝剑，剑身晶莹，剑柄镶嵌宝石，蓝光流转，细节精致，暗色背景，特写镜头",
    model: "Seedream 3.0", resolution: "1024×1024", ratio: "1:1",
    referenceImages: [],
    appliedTo: [{ type: "subject", label: "道具·宝剑", id: "s4" }],
  },
  {
    id: "g5", name: "云雾山脉.jpg", type: "image", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=200&q=70",
    size: "4.2MB", date: "昨天", memberId: "2",
    prompt: "远山层叠，云海翻涌，日出金光，仙境氛围，中国山水画风格，水墨渲染",
    model: "Seedream 3.0", resolution: "2048×1024", ratio: "2:1",
    referenceImages: ["https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=100&q=60"],
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

const UPLOAD_ASSETS: SidebarAsset[] = [
  { id: "u1", name: "人物参考_古装.jpg", type: "image", src: "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?w=200&q=70", size: "1.5MB", date: "昨天", memberId: "1", reviewStatus: "approved" },
  { id: "u2", name: "角色立绘参考.jpg", type: "image", src: "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?w=200&q=70", size: "2.1MB", date: "3天前", memberId: "2", reviewStatus: "pending" },
];

const SUBJECT_ASSETS: SubjectSidebarAsset[] = [
  { id: "s1", name: "女主角·林月", type: "image", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=200&q=70", size: "1.2MB", date: "今天", memberId: "1", reviewStatus: "approved", subjectKind: "character", displayName: "女主角·林月" },
  { id: "s2", name: "周星驰", type: "image", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=200&q=70", size: "2.3MB", date: "今天", memberId: "1", reviewStatus: "approved", subjectKind: "sd_ip", displayName: "周星驰" },
  { id: "s3", name: "古城背景·青云", type: "image", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=200&q=70", size: "1.8MB", date: "今天", memberId: "2", reviewStatus: "rejected", subjectKind: "scene", displayName: "古城背景·青云" },
  { id: "s4", name: "道具·宝剑", type: "image", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=200&q=70", size: "0.9MB", date: "昨天", memberId: "3", reviewStatus: "approved", subjectKind: "prop", displayName: "道具·宝剑" },
];

const SIDEBAR_ASSETS: Record<SubTab, SidebarAsset[]> = {
  generate: GENERATE_ASSETS,
  upload: UPLOAD_ASSETS,
  subject: SUBJECT_ASSETS,
  collect: [
    { id: "c1", name: "白发女侠_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=200&q=70", size: "2.3MB", date: "今天", memberId: "1", reviewStatus: "approved" },
    { id: "c2", name: "山林场景.jpg", type: "image", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=200&q=70", size: "3.1MB", date: "今天", memberId: "2", reviewStatus: "approved" },
  ],
};

const ASSET_TYPE_ICONS: Record<TypeFilter, typeof LucideImage> = { image: LucideImage, video: Video, audio: Music };

// ─── Shared member avatar row ─────────────────────────────────────────────────
function MemberRow({ memberId }: { memberId?: string }) {
  const member = PROJECT_MEMBERS.find(m => m.id === memberId);
  if (!member) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-semibold text-white"
        style={{ background: member.color }}>
        {member.avatar}
      </div>
      <span className="text-sm flex-1" style={{ color: "rgba(255,255,255,0.75)" }}>{member.name}</span>
      <span className="text-xs px-1.5 py-0.5 rounded"
        style={{ background: `${member.color}18`, color: member.color }}>
        {member.role}
      </span>
    </div>
  );
}

// ─── Generate Asset Detail Modal ──────────────────────────────────────────────
function GenerateAssetModal({ asset, open, onClose }: { asset: GenerateAsset | null; open: boolean; onClose: () => void }) {
  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="p-0 overflow-hidden border-0 gap-0"
        style={{
          background: "#1A1510",
          maxWidth: "820px",
          width: "calc(100vw - 2rem)",
          maxHeight: "90vh",
          borderRadius: "16px",
        }}
      >
        <DialogTitle className="sr-only">{asset.name}</DialogTitle>
        <div className="flex" style={{ minHeight: "520px", maxHeight: "90vh" }}>
          {/* Left: image preview */}
          <div className="flex-[1.3] relative overflow-hidden" style={{ background: "#0D0B08", minWidth: 0 }}>
            <img
              src={asset.src}
              alt={asset.name}
              className="w-full h-full object-cover"
              style={{ minHeight: "100%" }}
            />
            <div className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-medium"
              style={{ background: "rgba(0,0,0,0.65)", color: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)" }}>
              AI 生成
            </div>
          </div>

          {/* Right: info panel */}
          <div className="flex flex-col overflow-hidden"
            style={{ width: "300px", flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.07)" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2">
                <Sparkles size={13} style={{ color: "#E87322" }} />
                <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.9)" }}>图片生成</span>
              </div>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{asset.date}</span>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
              {/* Prompt */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>提示词</span>
                  <button
                    className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded transition-colors hover:bg-white/8"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                    onClick={() => { navigator.clipboard.writeText(asset.prompt); toast.success("已复制提示词"); }}
                  >
                    <Copy size={9} />复制
                  </button>
                </div>
                <div className="text-xs leading-relaxed rounded-xl p-3"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
                  {asset.prompt}
                </div>
              </div>

              {/* Reference images */}
              {asset.referenceImages && asset.referenceImages.length > 0 && (
                <div>
                  <span className="text-xs font-medium block mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>参考图</span>
                  <div className="flex gap-2 flex-wrap">
                    {asset.referenceImages.map((src, i) => (
                      <div key={i} className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0"
                        style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <span className="text-xs font-medium block mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>标签</span>
                <div className="flex flex-wrap gap-1.5">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
                    style={{ background: "rgba(232,115,34,0.1)", border: "1px solid rgba(232,115,34,0.2)" }}>
                    <Cpu size={9} style={{ color: "#E87322" }} />
                    <span className="text-xs" style={{ color: "#E87322" }}>{asset.model}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
                    style={{ background: "rgba(74,158,224,0.1)", border: "1px solid rgba(74,158,224,0.2)" }}>
                    <Scan size={9} style={{ color: "#4A9EE0" }} />
                    <span className="text-xs" style={{ color: "#4A9EE0" }}>{asset.resolution}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
                    style={{ background: "rgba(74,198,120,0.1)", border: "1px solid rgba(74,198,120,0.2)" }}>
                    <MoveRight size={9} style={{ color: "#4AC678" }} />
                    <span className="text-xs" style={{ color: "#4AC678" }}>{asset.ratio}</span>
                  </div>
                </div>
              </div>

              {/* Creator */}
              {asset.memberId && (
                <div>
                  <span className="text-xs font-medium block mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>创建人员</span>
                  <MemberRow memberId={asset.memberId} />
                </div>
              )}

              {/* Applied scenes */}
              {asset.appliedTo && asset.appliedTo.length > 0 && (
                <div>
                  <span className="text-xs font-medium block mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>已应用于</span>
                  <div className="flex flex-col gap-1.5">
                    {asset.appliedTo.map((applied, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        {applied.type === "subject" ? (
                          <Package size={11} style={{ color: "#4AC678", flexShrink: 0 }} />
                        ) : (
                          <Film size={11} style={{ color: "#a78bfa", flexShrink: 0 }} />
                        )}
                        <span className="text-sm flex-1" style={{ color: "rgba(255,255,255,0.7)" }}>{applied.label}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded-md"
                          style={{
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

            {/* Action buttons */}
            <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-colors hover:bg-white/5"
                style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
                onClick={() => toast.success("已收藏")}
              >
                <Star size={12} />收藏
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-colors hover:bg-white/5"
                style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
                onClick={() => toast.success("开始下载")}
              >
                <Download size={12} />下载
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-colors"
                style={{ border: "1px solid rgba(255,107,107,0.18)", color: "rgba(255,107,107,0.65)" }}
                onClick={() => { toast.success("已删除"); onClose(); }}
              >
                <Trash2 size={12} />删除
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Upload Asset Detail Modal ────────────────────────────────────────────────
function UploadAssetModal({ asset, open, onClose }: { asset: SidebarAsset | null; open: boolean; onClose: () => void }) {
  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="p-0 overflow-hidden border-0 gap-0"
        style={{
          background: "#1A1510",
          maxWidth: "680px",
          width: "calc(100vw - 2rem)",
          maxHeight: "90vh",
          borderRadius: "16px",
        }}
      >
        <DialogTitle className="sr-only">{asset.name}</DialogTitle>
        <div className="flex" style={{ minHeight: "460px", maxHeight: "90vh" }}>
          {/* Left: image */}
          <div className="flex-[1.2] relative overflow-hidden" style={{ background: "#0D0B08", minWidth: 0 }}>
            <img src={asset.src} alt={asset.name} className="w-full h-full object-cover" style={{ minHeight: "100%" }} />
            {asset.reviewStatus && (
              <div className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs"
                style={{
                  background: REVIEW_STATUS_CONFIG[asset.reviewStatus].bg,
                  border: `1px solid ${REVIEW_STATUS_CONFIG[asset.reviewStatus].border}`,
                  color: REVIEW_STATUS_CONFIG[asset.reviewStatus].color,
                  backdropFilter: "blur(4px)",
                }}>
                {REVIEW_STATUS_CONFIG[asset.reviewStatus].label}
              </div>
            )}
          </div>

          {/* Right: info panel */}
          <div className="flex flex-col overflow-hidden"
            style={{ width: "280px", flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.07)" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2">
                <Upload size={13} style={{ color: "#3b82f6" }} />
                <span className="text-sm font-semibold truncate" style={{ color: "rgba(255,255,255,0.9)", maxWidth: "160px" }}>{asset.name}</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
              {/* File info */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-3 py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>文件大小</span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>{asset.size}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>上传时间</span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>{asset.date}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>类型</span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
                    {asset.type === "image" ? "图片" : asset.type === "video" ? "视频" : "音频"}
                  </span>
                </div>
              </div>

              {/* Creator */}
              {asset.memberId && (
                <div>
                  <span className="text-xs font-medium block mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>上传人员</span>
                  <MemberRow memberId={asset.memberId} />
                </div>
              )}

              {/* Review status */}
              {asset.reviewStatus && (
                <div>
                  <span className="text-xs font-medium block mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>审核状态</span>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{
                      background: REVIEW_STATUS_CONFIG[asset.reviewStatus].bg,
                      border: `1px solid ${REVIEW_STATUS_CONFIG[asset.reviewStatus].border}`,
                    }}>
                    {(() => { const Icon = REVIEW_STATUS_CONFIG[asset.reviewStatus].icon; return <Icon size={12} style={{ color: REVIEW_STATUS_CONFIG[asset.reviewStatus].color }} />; })()}
                    <span className="text-sm" style={{ color: REVIEW_STATUS_CONFIG[asset.reviewStatus].color }}>
                      {REVIEW_STATUS_CONFIG[asset.reviewStatus].label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-colors hover:bg-white/5"
                style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
                onClick={() => toast.success("开始下载")}
              >
                <Download size={12} />下载
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-colors"
                style={{ border: "1px solid rgba(255,107,107,0.18)", color: "rgba(255,107,107,0.65)" }}
                onClick={() => { toast.success("已删除"); onClose(); }}
              >
                <Trash2 size={12} />删除
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Subject Detail Panel (inline in sidebar) ─────────────────────────────────
function SubjectDetailPanel({
  asset,
  onBack,
  onUpdate,
}: {
  asset: SubjectSidebarAsset;
  onBack: () => void;
  onUpdate: (updated: SubjectSidebarAsset) => void;
}) {
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(asset.displayName || asset.name);
  const [imgSrc, setImgSrc] = useState(asset.src);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isVirtualIp = asset.subjectKind === "sd_ip";
  const kindConfig = SUBJECT_KIND_CONFIG[asset.subjectKind ?? "character"];
  const KindIcon = kindConfig.icon;

  const handleNameSave = () => {
    setEditingName(false);
    onUpdate({ ...asset, name, displayName: name });
    toast.success("名称已更新");
  };

  const handleImageReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    onUpdate({ ...asset, src: url });
    toast.success("图片已替换");
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col" style={{ background: "#110E0A" }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-2.5 py-2.5 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors hover:bg-white/5"
          style={{ color: "rgba(255,255,255,0.5)" }}>
          <ChevronLeft size={11} />返回
        </button>
        <div style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.08)" }} />
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <KindIcon size={10} style={{ color: kindConfig.color, flexShrink: 0 }} />
          <span className="truncate text-xs font-medium" style={{ color: "rgba(255,255,255,0.75)" }}>{name}</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0"
          style={{ background: `${kindConfig.color}18`, color: kindConfig.color }}>
          {kindConfig.label}
        </span>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Image area */}
        <div className="px-2.5 pt-2.5 relative group">
          <div className="rounded-xl overflow-hidden" style={{ background: "#1A1510", aspectRatio: "16/9" }}>
            <img src={imgSrc} alt={name} className="w-full h-full object-cover" />
          </div>
          {isVirtualIp && (
            <>
              <button
                className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "rgba(0,0,0,0.7)", color: "rgba(255,255,255,0.8)", backdropFilter: "blur(4px)" }}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus size={9} />替换图片
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageReplace} />
            </>
          )}
        </div>

        {/* Name section */}
        <div className="px-2.5 py-2.5 flex flex-col gap-2.5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>名称</span>
              {isVirtualIp && !editingName && (
                <button
                  className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded transition-colors hover:bg-white/5"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                  onClick={() => setEditingName(true)}
                >
                  <Pencil size={8} />修改
                </button>
              )}
            </div>
            {editingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  className="flex-1 rounded-lg px-2 py-1.5 text-xs outline-none"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(232,115,34,0.4)",
                    color: "rgba(255,255,255,0.85)",
                    caretColor: "#E87322",
                  }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
                  autoFocus
                />
                <button
                  className="px-2 py-1.5 rounded-lg text-[10px] font-medium"
                  style={{ background: "#E87322", color: "#fff" }}
                  onClick={handleNameSave}
                >
                  确定
                </button>
                <button
                  className="px-2 py-1.5 rounded-lg text-[10px]"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
                  onClick={() => { setEditingName(false); setName(asset.displayName || asset.name); }}
                >
                  取消
                </button>
              </div>
            ) : (
              <div className="px-2.5 py-2 rounded-xl text-xs"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)" }}>
                {name}
              </div>
            )}
          </div>

          {/* Meta info */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span style={{ color: "rgba(255,255,255,0.35)" }}>大小</span>
              <span style={{ color: "rgba(255,255,255,0.6)" }}>{asset.size}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span style={{ color: "rgba(255,255,255,0.35)" }}>更新于</span>
              <span style={{ color: "rgba(255,255,255,0.6)" }}>{asset.date}</span>
            </div>
          </div>

          {/* Creator */}
          {asset.memberId && (
            <div>
              <span className="text-[10px] font-medium block mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>创建人员</span>
              {(() => {
                const member = PROJECT_MEMBERS.find(m => m.id === asset.memberId);
                if (!member) return null;
                return (
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[7px] font-semibold text-white"
                      style={{ background: member.color }}>
                      {member.avatar}
                    </div>
                    <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.65)" }}>{member.name}</span>
                    <span className="text-[9px] px-1 py-0.5 rounded ml-auto"
                      style={{ background: `${member.color}15`, color: member.color }}>{member.role}</span>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Review status */}
          {asset.reviewStatus && (
            <div>
              <span className="text-[10px] font-medium block mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>审核状态</span>
              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg"
                style={{
                  background: REVIEW_STATUS_CONFIG[asset.reviewStatus].bg,
                  border: `1px solid ${REVIEW_STATUS_CONFIG[asset.reviewStatus].border}`,
                }}>
                {(() => { const Icon = REVIEW_STATUS_CONFIG[asset.reviewStatus].icon; return <Icon size={10} style={{ color: REVIEW_STATUS_CONFIG[asset.reviewStatus].color }} />; })()}
                <span className="text-[10px]" style={{ color: REVIEW_STATUS_CONFIG[asset.reviewStatus].color }}>
                  {REVIEW_STATUS_CONFIG[asset.reviewStatus].label}
                </span>
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

export function ProjectAssetsSidebarPanel({ sidebarOpen = true, onToggleSidebar }: Props) {
  const [assetSubTab, setAssetSubTab] = useState<SubTab>("subject");
  const [assetTypeFilter, setAssetTypeFilter] = useState<TypeFilter>("image");
  const [assetSearch, setAssetSearch] = useState("");
  const [reviewStatusFilter, setReviewStatusFilter] = useState<"all" | ReviewStatus>("all");
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  // Modal state for generate / upload
  const [generateModal, setGenerateModal] = useState<GenerateAsset | null>(null);
  const [uploadModal, setUploadModal] = useState<SidebarAsset | null>(null);

  // Inline panel state for subject tab
  const [subjectDetail, setSubjectDetail] = useState<SubjectSidebarAsset | null>(null);

  // Mutable subject list
  const [subjectAssets, setSubjectAssets] = useState<SubjectSidebarAsset[]>(SUBJECT_ASSETS);

  // Filter assets
  const currentAssets = assetSubTab === "subject" ? subjectAssets : SIDEBAR_ASSETS[assetSubTab];
  const filteredAssets = currentAssets.filter(a => {
    if (a.type !== assetTypeFilter) return false;
    if (assetSearch && !a.name.toLowerCase().includes(assetSearch.toLowerCase())) return false;
    if (reviewStatusFilter !== "all" && a.reviewStatus !== reviewStatusFilter) return false;
    return true;
  });

  const handleAssetClick = (asset: SidebarAsset) => {
    if (assetSubTab === "generate") {
      const genAsset = GENERATE_ASSETS.find(g => g.id === asset.id);
      if (genAsset) setGenerateModal(genAsset);
    } else if (assetSubTab === "upload") {
      setUploadModal(asset);
    } else if (assetSubTab === "subject") {
      const subjectAsset = subjectAssets.find(s => s.id === asset.id);
      if (subjectAsset) setSubjectDetail(subjectAsset);
    }
  };

  const handleSubjectUpdate = (updated: SubjectSidebarAsset) => {
    setSubjectAssets(prev => prev.map(s => s.id === updated.id ? updated : s));
    setSubjectDetail(updated);
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
    <>
      {/* Modals (portal-rendered, outside sidebar) */}
      <GenerateAssetModal
        asset={generateModal}
        open={!!generateModal}
        onClose={() => setGenerateModal(null)}
      />
      <UploadAssetModal
        asset={uploadModal}
        open={!!uploadModal}
        onClose={() => setUploadModal(null)}
      />

      <div className="flex flex-col h-full relative" onClick={() => setShowStatusMenu(false)}>
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

        {/* Title bar */}
        <div className="flex items-center px-3 py-2 flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>资产</span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-2 py-1.5 flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {[
            { key: "generate" as const, label: "生成", icon: Sparkles, color: "#E87322" },
            { key: "upload" as const, label: "上传", icon: Upload, color: "#3b82f6" },
            { key: "subject" as const, label: "主体", icon: Package, color: "#4AC678" },
            { key: "collect" as const, label: "收藏", icon: Star, color: "#a78bfa" },
          ].map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => { setAssetSubTab(key); setSubjectDetail(null); }}
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

        {/* Filter row */}
        <div className="flex items-center gap-1.5 px-2 py-1.5 flex-shrink-0">
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

          {/* Review status filter */}
          <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors"
              style={{
                background: reviewStatusFilter === "all" ? "rgba(255,255,255,0.04)" : REVIEW_STATUS_CONFIG[reviewStatusFilter].bg,
                border: reviewStatusFilter === "all" ? "1px solid rgba(255,255,255,0.07)" : `1px solid ${REVIEW_STATUS_CONFIG[reviewStatusFilter].border}`,
                color: reviewStatusFilter === "all" ? "rgba(255,255,255,0.4)" : REVIEW_STATUS_CONFIG[reviewStatusFilter].color,
              }}
            >
              {reviewStatusFilter === "all"
                ? <Clock3 size={8} />
                : (() => { const Icon = REVIEW_STATUS_CONFIG[reviewStatusFilter].icon; return <Icon size={8} />; })()}
              {reviewStatusFilter === "all" ? "全部状态" : REVIEW_STATUS_CONFIG[reviewStatusFilter].shortLabel}
              <ChevronDown size={6} style={{ marginLeft: "1px" }} />
            </button>
            {showStatusMenu && (
              <div className="absolute left-0 top-full mt-1 rounded-xl overflow-hidden z-30 shadow-2xl"
                style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)", width: "150px" }}>
                <button
                  onClick={() => setReviewStatusFilter("all")}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors"
                  style={{
                    background: reviewStatusFilter === "all" ? "rgba(255,255,255,0.08)" : "transparent",
                    color: reviewStatusFilter === "all" ? "#fff" : "rgba(255,255,255,0.6)",
                  }}
                >
                  <span>全部状态</span>
                  {reviewStatusFilter === "all" && <Check size={10} style={{ color: "#fff" }} />}
                </button>
                <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
                {(Object.entries(REVIEW_STATUS_CONFIG) as [ReviewStatus, typeof REVIEW_STATUS_CONFIG[ReviewStatus]][]).map(([status, config]) => {
                  const selected = reviewStatusFilter === status;
                  const Icon = config.icon;
                  return (
                    <button
                      key={status}
                      onClick={() => setReviewStatusFilter(status)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors"
                      style={{
                        background: selected ? config.bg : "transparent",
                        color: selected ? config.color : "rgba(255,255,255,0.6)",
                      }}
                    >
                      <Icon size={12} />
                      <span className="flex-1">{config.label}</span>
                      {selected && <Check size={10} style={{ color: config.color }} />}
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

        {/* Asset grid + subject detail overlay */}
        <div className="flex-1 overflow-hidden relative">
          {/* Subject detail inline overlay */}
          {assetSubTab === "subject" && subjectDetail && (
            <SubjectDetailPanel
              asset={subjectDetail}
              onBack={() => setSubjectDetail(null)}
              onUpdate={handleSubjectUpdate}
            />
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
                  const subjectAsset = asset as SubjectSidebarAsset;
                  const isSubjectTab = assetSubTab === "subject";
                  const kindConfig = isSubjectTab && subjectAsset.subjectKind ? SUBJECT_KIND_CONFIG[subjectAsset.subjectKind] : null;
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
                      {/* Type badge — for subject tab show kind instead */}
                      {isSubjectTab && kindConfig ? (
                        <div className="absolute top-1 left-1 px-1 py-0.5 rounded flex items-center gap-1"
                          style={{ background: "rgba(0,0,0,0.62)" }}>
                          <kindConfig.icon size={7} style={{ color: kindConfig.color }} />
                          <span style={{ fontSize: "8px", color: kindConfig.color, lineHeight: 1 }}>{kindConfig.label}</span>
                        </div>
                      ) : (
                        <div className="absolute top-1 left-1 px-1 py-0.5 rounded flex items-center gap-1"
                          style={{ background: "rgba(0,0,0,0.62)" }}>
                          <Icon size={7} style={{ color: "rgba(255,255,255,0.78)" }} />
                          <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.78)", lineHeight: 1 }}>
                            {asset.type === "image" ? "图片" : asset.type === "video" ? "视频" : "音频"}
                          </span>
                        </div>
                      )}
                      {/* Click indicator for generate tab */}
                      {assetSubTab === "generate" && (
                        <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: "rgba(232,115,34,0.7)" }}>
                          <ChevronLeft size={8} className="text-white" style={{ transform: "rotate(180deg)" }} />
                        </div>
                      )}
                      {asset.reviewStatus && (
                        <div
                          className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full"
                          style={{
                            background: REVIEW_STATUS_CONFIG[asset.reviewStatus].bg,
                            border: `1px solid ${REVIEW_STATUS_CONFIG[asset.reviewStatus].border}`,
                          }}
                        >
                          <span style={{ fontSize: "8px", color: REVIEW_STATUS_CONFIG[asset.reviewStatus].color, lineHeight: 1 }}>
                            {REVIEW_STATUS_CONFIG[asset.reviewStatus].shortLabel}
                          </span>
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
    </>
  );
}
