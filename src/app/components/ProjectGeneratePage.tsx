import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useSearchParams } from "react-router";
import type { CSSProperties, ReactNode } from "react";
import {
  Folder, FolderOpen, MessageSquare, ChevronRight, Plus, Image as LucideImage, Image, Video, Music,
  Star, Upload, Package, Send, Sparkles, MoreHorizontal, Download, RefreshCw,
  Search, Pencil, Trash2, X, Check, ChevronDown, Film, AlignLeft, Copy, Play,
  ChevronLeft, Users, Filter, Clock, Grid2X2, Globe, Crown,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router";
import { ProjectAssetsSidebarPanel } from "./ProjectAssetsSidebarPanel";
import { StoryboardSidebarPanel } from "./StoryboardSidebarPanel";
import { getProjectById } from "../data/projectsData";

// ─── Types ────────────────────────────────────────────────────────────────────
type SidebarTab = "files" | "assets" | "subject" | "storyboard";
type AssetSubTab = "generate" | "upload" | "subject" | "collect";
type AssetTypeFilter = "all" | "image" | "video" | "audio";
type GenerateTypeFilter = "all" | "image" | "video";
type TimeFilter = "all" | "today" | "week" | "month" | "custom";
type GenerateGuideTarget =
  | "session-tree"
  | "asset-link"
  | "asset-to-prompt"
  | "subject-link"
  | "subject-to-prompt"
  | "subject-detail-edit"
  | "generated-to-subject"
  | "storyboard-link"
  | "storyboard-send"
  | "generated-to-storyboard"
  | "generation-results"
  | "apply-result"
  | "apply-dialog";

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

const GENERATE_GUIDE_STEPS: { target: GenerateGuideTarget; title: string; body: ReactNode }[] = [
  {
    target: "session-tree",
    title: "对话列表",
    body: "左侧按剧集维度分类，可以新建对话进行分类创作。",
  },
  {
    target: "asset-link",
    title: "资产快捷入口",
    body: "调用素材的快捷入口，集中查看全部生成、收藏、未分类和项目文件夹。可以把素材直接拖入对话输入框作为参考内容。",
  },
  {
    target: "subject-to-prompt",
    title: "查看主体并引用",
    body: "左侧主体按人物、场景、道具分类展示。按照动画提示，把主体卡片拖到右侧输入框，就能把角色、场景或道具设定带入当前对话。",
  },
  {
    target: "subject-detail-edit",
    title: "查看主体详情",
    body: "点击左侧主体卡片可以查看主体详情，包括主体图片、名称、类型和基础信息。进入详情后再点击编辑，可继续维护主体设定。",
  },
  {
    target: "generated-to-subject",
    title: "生成结果应用到主体",
    body: "满意的生成结果也可以直接拖到左侧主体卡片上，用作主体参考图。",
  },
  {
    target: "storyboard-send",
    title: "分镜快捷入口",
    body: "查看分镜表的快捷入口，点击分镜内容旁的发送按钮，一键将分镜素材填入右侧对话框；生成完成后，也可以把结果图从中间拖到左侧空白分镜图上。",
  },
  {
    target: "apply-result",
    title: "应用",
    body: "点击生成结果上的「应用」，可以把满意的图片或视频应用到主体、分镜等生产位置。",
  },
  {
    target: "apply-dialog",
    title: "应用图片",
    body: (
      <div className="space-y-1">
        <div>应用到主体：把结果应用为人物、场景、道具等可复用设定。</div>
        <div>应用到分镜：把结果写入具体镜头的分镜图或分镜视频。</div>
      </div>
    ),
  },
];

function GenerateModuleGuide({
  step,
  total,
  current,
  applyDialogPhase,
  onPrev,
  onNext,
  onClose,
}: {
  step: number;
  total: number;
  current: { target: GenerateGuideTarget; title: string; body: ReactNode };
  applyDialogPhase?: "subject" | "storyboard";
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const [cardPosition, setCardPosition] = useState<CSSProperties>({ right: 24, bottom: 24 });
  const [targetFrame, setTargetFrame] = useState<CSSProperties | null>(null);
  const [extraFrame, setExtraFrame] = useState<CSSProperties | null>(null);
  const [secondaryExtraFrame, setSecondaryExtraFrame] = useState<CSSProperties | null>(null);
  const [pulseFrame, setPulseFrame] = useState<CSSProperties | null>(null);
  const [dragCue, setDragCue] = useState<{ from: CSSProperties; to: CSSProperties; image: string; label: string } | null>(null);
  const isLast = step === total - 1;
  const nextLabel = current.target === "apply-result"
    ? "点击应用"
    : current.target === "apply-dialog"
      ? applyDialogPhase === "subject" ? "查看分镜应用" : "应用并进入分镜"
      : current.target === "subject-detail-edit"
        ? "查看详情"
      : isLast ? "完成引导" : "下一步";
  const targetSelectorMap: Partial<Record<GenerateGuideTarget, string>> = {
    "asset-link": '[data-generate-guide-target~="prompt-drop"]',
    "asset-to-prompt": '[data-generate-guide-target~="prompt-drop"]',
    "subject-to-prompt": '[data-generate-guide-target~="prompt-drop"]',
    "subject-detail-edit": '[data-subject-guide-item="true"]',
    "generated-to-subject": '[data-generate-guide-target="subject-link"]',
    "generated-to-storyboard": '[data-generate-guide-target="storyboard-link"]',
    "storyboard-send": '[data-generate-guide-target="storyboard-link"]',
  };

  useLayoutEffect(() => {
    let frame = 0;
    let tries = 0;
    const updatePosition = () => {
      const target = document.querySelector(targetSelectorMap[current.target] ?? `[data-generate-guide-target="${current.target}"]`) as HTMLElement | null;
      if (!target) {
        if (tries < 18) {
          tries += 1;
          frame = window.requestAnimationFrame(updatePosition);
        }
        return;
      }
      const rect = target.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        if (tries < 18) {
          tries += 1;
          frame = window.requestAnimationFrame(updatePosition);
        }
        return;
      }

      const margin = 18;
      const gap = 18;
      const pad = 8;
      const cardWidth = 360;
      const cardHeight = 240;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const frameLeft = Math.max(margin, rect.left - pad);
      const frameTop = Math.max(margin, rect.top - pad);
      const frameRight = Math.min(viewportWidth - margin, rect.right + pad);
      const frameBottom = Math.min(viewportHeight - margin, rect.bottom + pad);

      setTargetFrame({
        left: frameLeft,
        top: frameTop,
        width: Math.max(0, frameRight - frameLeft),
        height: Math.max(0, frameBottom - frameTop),
      });

      const makeFrame = (selector: string, padding = 8) => {
        const el = document.querySelector(selector) as HTMLElement | null;
        if (!el) return null;
        const box = el.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) return null;
        const leftValue = Math.max(margin, box.left - padding);
        const topValue = Math.max(margin, box.top - padding);
        const rightValue = Math.min(viewportWidth - margin, box.right + padding);
        const bottomValue = Math.min(viewportHeight - margin, box.bottom + padding);
        return {
          left: leftValue,
          top: topValue,
          width: Math.max(0, rightValue - leftValue),
          height: Math.max(0, bottomValue - topValue),
        } as CSSProperties;
      };

      if (current.target === "asset-link") {
        setSecondaryExtraFrame(null);
        const assetPanelFrame = makeFrame('[data-generate-guide-target="asset-link"]', 4);
        if (!assetPanelFrame && tries < 18) {
          tries += 1;
          frame = window.requestAnimationFrame(updatePosition);
          return;
        }
        setExtraFrame(assetPanelFrame);
      } else if (current.target === "subject-to-prompt") {
        setSecondaryExtraFrame(null);
        const subjectPanelFrame = makeFrame('[data-generate-guide-target="subject-panel"]', 4);
        if (!subjectPanelFrame && tries < 18) {
          tries += 1;
          frame = window.requestAnimationFrame(updatePosition);
          return;
        }
        setExtraFrame(subjectPanelFrame);
      } else if (current.target === "storyboard-send") {
        const storyboardPanelFrame = makeFrame('[data-generate-guide-target="storyboard-link"]', 4);
        if (!storyboardPanelFrame && tries < 18) {
          tries += 1;
          frame = window.requestAnimationFrame(updatePosition);
          return;
        }
        setExtraFrame(makeFrame('[data-generate-result-item="true"]', 8));
        setSecondaryExtraFrame(makeFrame('[data-storyboard-script-send="true"]', 6));
      } else if (current.target === "generated-to-subject" || current.target === "generated-to-storyboard") {
        setExtraFrame(makeFrame('[data-generate-result-item="true"]', 8));
        setSecondaryExtraFrame(null);
      } else {
        setExtraFrame(null);
        setSecondaryExtraFrame(null);
      }
      if (current.target === "storyboard-send") {
        setPulseFrame(makeFrame('[data-storyboard-script-send="true"]', 6));
      } else {
        setPulseFrame(null);
      }

      const cueConfig: Partial<Record<GenerateGuideTarget, { fromSelector: string; toSelector: string; label: string }>> = {
        "asset-link": { fromSelector: '[data-asset-quick-guide-item="true"], [data-asset-prop-guide-item="true"], [data-generate-guide-target="asset-drag-demo"], [data-asset-guide-item="true"]', toSelector: '[data-generate-guide-target~="prompt-drop"]', label: "拖入输入框" },
        "asset-to-prompt": { fromSelector: '[data-asset-guide-item="true"]', toSelector: '[data-generate-guide-target~="prompt-drop"]', label: "拖入输入框" },
        "subject-to-prompt": { fromSelector: '[data-subject-guide-item="true"]', toSelector: '[data-generate-guide-target~="prompt-drop"]', label: "拖入输入框" },
        "generated-to-subject": { fromSelector: '[data-generate-result-item="true"]', toSelector: '[data-subject-edit-drop="true"], [data-subject-guide-item="true"]', label: "拖到主体" },
        "storyboard-send": { fromSelector: '[data-generate-result-item="true"]', toSelector: '[data-empty-storyboard-image-drop="true"]', label: "拖到空白分镜图" },
        "generated-to-storyboard": { fromSelector: '[data-generate-result-item="true"]', toSelector: '[data-empty-storyboard-image-drop="true"], [data-storyboard-guide-drop="true"]', label: "拖到空分镜图" },
      };
      const cue = cueConfig[current.target];
      if (cue) {
        const fromEl = document.querySelector(cue.fromSelector) as HTMLElement | null;
        const toEl = document.querySelector(cue.toSelector) as HTMLElement | null;
        const img = fromEl?.querySelector("img") as HTMLImageElement | null;
        if (fromEl && toEl) {
          const fromRect = fromEl.getBoundingClientRect();
          const toRect = toEl.getBoundingClientRect();
          setDragCue({
            from: {
              left: fromRect.left + fromRect.width / 2 - 24,
              top: fromRect.top + fromRect.height / 2 - 24,
            },
            to: {
              left: toRect.left + toRect.width / 2 - 24,
              top: toRect.top + (current.target === "storyboard-send" ? toRect.height * 0.68 : Math.min(toRect.height / 2, 92)) - 24,
            },
            image: img?.src ?? "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=120&q=70",
            label: cue.label,
          });
        } else {
          if ((current.target === "asset-link" || current.target === "subject-to-prompt" || current.target === "storyboard-send") && tries < 18) {
            tries += 1;
            frame = window.requestAnimationFrame(updatePosition);
            return;
          }
          setDragCue(null);
        }
      } else {
        setDragCue(null);
      }

      let left = rect.right + gap;
      let top = rect.top + Math.max(0, (rect.height - cardHeight) / 2);
      if (current.target === "asset-link" || current.target === "storyboard-send") {
        left = Math.min(Math.max(rect.right - cardWidth, sidebarCollapsed ? margin : 310), viewportWidth - cardWidth - margin);
        top = current.target === "storyboard-send"
          ? margin + 76
          : Math.max(margin, rect.top - cardHeight - gap);
      } else if (current.target === "subject-to-prompt") {
        left = Math.min(Math.max(rect.right - cardWidth, sidebarCollapsed ? margin : 310), viewportWidth - cardWidth - margin);
        top = Math.max(margin, rect.top - cardHeight - gap);
      } else if (current.target === "generated-to-subject") {
        left = Math.min(Math.max((viewportWidth - cardWidth) / 2, margin), viewportWidth - cardWidth - margin);
        top = viewportHeight - cardHeight - margin;
      } else {
        if (left + cardWidth + margin > viewportWidth) left = rect.left - cardWidth - gap;
        if (left < margin) {
          left = Math.min(Math.max(rect.left, margin), viewportWidth - cardWidth - margin);
          top = rect.bottom + gap;
        }
        if (top + cardHeight + margin > viewportHeight) top = rect.top - cardHeight - gap;
        if (top < margin) top = Math.min(Math.max(rect.bottom + gap, margin), viewportHeight - cardHeight - margin);
      }

      setCardPosition({ left, top });
    };

    frame = window.requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [current.target]);

  const renderMaskHole = (frame: CSSProperties, radius: number) => (
    <rect
      x={frame.left as number}
      y={frame.top as number}
      width={frame.width as number}
      height={frame.height as number}
      rx={radius}
      ry={radius}
      fill="black"
    />
  );
  const renderHighlightFrame = (frame: CSSProperties, radiusClass: string, zIndex: number, shadowOpacity = 0.24) => (
    <div
      className={`absolute ${radiusClass}`}
      style={{
        ...frame,
        zIndex,
        border: "3px solid #F5A623",
        boxShadow: `0 0 0 6px rgba(245,166,35,0.18), 0 18px 44px rgba(245,166,35,${shadowOpacity})`,
      }}
    />
  );
  const maskId = `generate-guide-mask-${current.target}`;

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none">
      {targetFrame ? (
        <>
          <svg className="absolute inset-0 h-full w-full" style={{ zIndex: 70 }} aria-hidden="true">
            <defs>
              <mask id={maskId}>
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {renderMaskHole(targetFrame, 20)}
                {extraFrame && renderMaskHole(extraFrame, 18)}
                {secondaryExtraFrame && renderMaskHole(secondaryExtraFrame, 14)}
              </mask>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="rgba(4,3,2,0.56)" mask={`url(#${maskId})`} />
          </svg>
          {renderHighlightFrame(targetFrame, "rounded-[20px]", 75, 0.24)}
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: "rgba(4,3,2,0.56)" }} />
      )}
      {extraFrame && renderHighlightFrame(extraFrame, "rounded-[18px]", 76, 0.2)}
      {secondaryExtraFrame && renderHighlightFrame(secondaryExtraFrame, "rounded-[14px]", 77, 0.2)}
      {pulseFrame && (
        <>
          <style>{`
            @keyframes guide-send-pulse {
              0%, 100% { transform: scale(1); box-shadow: 0 0 0 4px rgba(245,166,35,0.16), 0 0 0 0 rgba(245,166,35,0.4); }
              50% { transform: scale(1.08); box-shadow: 0 0 0 7px rgba(245,166,35,0.26), 0 0 24px 4px rgba(245,166,35,0.45); }
            }
          `}</style>
          <div
            className="absolute rounded-xl"
            style={{ ...pulseFrame, zIndex: 77, border: "2px solid #F5A623", animation: "guide-send-pulse 1.1s ease-in-out infinite" }}
          />
        </>
      )}
      {dragCue && (
        (() => {
          const toX = (dragCue.to.left as number) + 24;
          const toY = (dragCue.to.top as number) + 24;
          return (
        <>
          <style>{`
            @keyframes generate-guide-drop-pulse {
              0%, 100% { transform: translate(-50%, -50%) scale(0.78); opacity: 0.35; }
              50% { transform: translate(-50%, -50%) scale(1.18); opacity: 0.9; }
            }
            @keyframes generate-guide-drag {
              0%, 12% { transform: translate3d(0, 0, 0) scale(1); opacity: 0; }
              18% { opacity: 1; }
              72% { transform: translate3d(calc(var(--to-x) - var(--from-x)), calc(var(--to-y) - var(--from-y)), 0) scale(0.9); opacity: 1; }
              86%, 100% { transform: translate3d(calc(var(--to-x) - var(--from-x)), calc(var(--to-y) - var(--from-y)), 0) scale(0.9); opacity: 0; }
            }
          `}</style>
          <div
            className="absolute z-[78] h-16 w-16 rounded-full"
            style={{
              left: toX,
              top: toY,
              border: "2px solid rgba(245,166,35,0.78)",
              background: "rgba(245,166,35,0.1)",
              boxShadow: "0 0 28px rgba(245,166,35,0.34)",
              animation: "generate-guide-drop-pulse 1.2s ease-in-out infinite",
            }}
          />
          <div
            className="absolute z-[78] flex items-center gap-2 rounded-2xl px-2 py-2"
            style={{
              ...dragCue.from,
              "--from-x": `${dragCue.from.left}px`,
              "--from-y": `${dragCue.from.top}px`,
              "--to-x": `${dragCue.to.left}px`,
              "--to-y": `${dragCue.to.top}px`,
              animation: "generate-guide-drag 2.2s ease-in-out infinite",
              background: "rgba(26,21,16,0.92)",
              border: "1px solid rgba(245,166,35,0.5)",
              boxShadow: "0 16px 36px rgba(0,0,0,0.42), 0 0 24px rgba(245,166,35,0.28)",
            } as CSSProperties}
          >
            <div className="h-12 w-12 overflow-hidden rounded-xl" style={{ background: "#0D0A06" }}>
              <img src={dragCue.image} alt="" className="h-full w-full object-cover" />
            </div>
            <span className="whitespace-nowrap pr-1 text-xs font-medium" style={{ color: "#F5A623" }}>{dragCue.label}</span>
          </div>
        </>
          );
        })()
      )}
      <div className="absolute z-[80] w-[360px] rounded-2xl p-4 pointer-events-auto" style={{ ...cardPosition, background: "#1A1510", border: "2px solid #F5A623", boxShadow: "0 28px 70px rgba(0,0,0,0.58), 0 0 0 1px rgba(255,255,255,0.08), 0 0 34px rgba(245,166,35,0.22)" }}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="text-base font-semibold text-white">{current.title}</h3>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ color: "#F5A623", background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.22)" }}
            >
              {step + 1}/{total}
            </span>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/10" style={{ color: "rgba(255,255,255,0.45)" }} title="关闭新手引导">
            <X size={14} />
          </button>
        </div>
        <p className="mb-4 text-sm leading-6" style={{ color: "rgba(255,255,255,0.68)" }}>
          {current.target === "apply-dialog" && applyDialogPhase === "storyboard"
            ? "选择剧集和具体镜头后点击「应用」，生成结果会写入该镜头，成为后续视频生成基础。"
            : current.body}
        </p>
        <div className="flex items-center justify-between gap-2">
          <button onClick={onPrev} className="h-8 rounded-lg px-3 text-xs transition-opacity" style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.68)" }}>
            上一步
          </button>
          <button onClick={onNext} className="h-8 rounded-lg px-3 text-xs font-medium transition-opacity hover:opacity-90" style={{ background: "#E87322", color: "#fff" }}>
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
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

function ApplyImageModal({
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
  onCancel,
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
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const subjectFolder = fileTree.find((folder) => folder.id === "art");
  const episodeFolders = fileTree.filter((folder) => folder.name.startsWith("第"));
  const currentEpisode = episodeFolders.find((folder) => folder.id === selectedEpisode) ?? episodeFolders[0];
  const subjectItems = (subjectFolder?.sessions ?? []).map((session) => ({
    id: `${session.id}-item-1`,
    name: session.id === "chars" ? "白发女侠" : session.id === "scenes" ? "云雾山林" : "青铜古剑",
    meta: session.name,
    preview: asset.src,
  }));
  const storyboardItems = [
    { id: "sb1", name: "分镜 01", desc: "女主角出场，云雾缭绕", preview: asset.src },
    { id: "sb2", name: "分镜 02", desc: "近景，持剑回眸", preview: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200&q=70" },
    { id: "still", name: "分镜 03", desc: "全景，古城楼背景", preview: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200&q=70" },
  ];
  const shotItems = (currentEpisode?.sessions ?? []).map((session, index) => ({
    id: session.id,
    name: session.name,
    preview: index === 0 ? asset.src : "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200&q=70",
  }));

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-5"
      style={{ background: "rgba(0,0,0,0.68)" }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        className="flex max-h-[82vh] w-full max-w-[880px] flex-col overflow-hidden rounded-2xl"
        data-generate-guide-target="apply-dialog"
        style={{ background: "#17110D", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 30px 90px rgba(0,0,0,0.68)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <h3 className="text-base font-semibold text-white">{asset.type === "image" ? "应用图片" : "应用视频"}</h3>
            <p className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.42)" }}>选择要写入的位置，确认后会同步到对应模块。</p>
          </div>
          <button onClick={onCancel} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10">
            <X size={15} style={{ color: "rgba(255,255,255,0.45)" }} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1">
          <div className="w-[184px] flex-shrink-0 p-4" style={{ borderRight: "1px solid rgba(255,255,255,0.08)", background: "#120D09" }}>
            <div className="mb-4 overflow-hidden rounded-xl" style={{ aspectRatio: "1", background: "#0D0A06", border: "1px solid rgba(255,255,255,0.08)" }}>
              <img src={asset.src} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="space-y-2">
              {[
                { key: "subject" as const, label: "主体", desc: "沉淀为角色/场景/道具设定" },
                { key: "storyboard" as const, label: "分镜", desc: "写入具体镜头画面" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setTargetType(item.key);
                    if (item.key === "storyboard") {
                      setSelectedEpisode("ep1");
                      setSelectedShot("sb1");
                    }
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left"
                  style={{
                    background: targetType === item.key ? "rgba(232,115,34,0.16)" : "rgba(255,255,255,0.04)",
                    color: targetType === item.key ? "#FFFFFF" : "rgba(255,255,255,0.58)",
                    border: `1px solid ${targetType === item.key ? "rgba(232,115,34,0.36)" : "rgba(255,255,255,0.06)"}`,
                  }}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{item.label}</span>
                    <span className="mt-0.5 block truncate text-[10px]" style={{ color: targetType === item.key ? "rgba(255,255,255,0.58)" : "rgba(255,255,255,0.34)" }}>{item.desc}</span>
                  </span>
                  <ChevronRight size={14} style={{ opacity: 0.72 }} />
                </button>
              ))}
            </div>
          </div>

          <div className="min-w-0 flex-1 p-5">
            {targetType === "subject" ? (
              <div className="flex h-full flex-col">
                <div className="mb-4 rounded-2xl px-4 py-3" style={{ background: "rgba(74,198,120,0.08)", border: "1px solid rgba(74,198,120,0.18)" }}>
                  <div className="text-sm font-medium" style={{ color: "#4AC678" }}>应用到主体</div>
                  <p className="mt-1 text-xs leading-5" style={{ color: "rgba(255,255,255,0.58)" }}>
                    主体是项目里的核心设定资产，包括人物、场景、道具等。应用到主体后，这张图会成为该主体的参考图或生成结果，后续生成时可以反复引用，保持角色和场景一致。
                  </p>
                </div>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex rounded-xl p-1" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    {(subjectFolder?.sessions ?? []).map((session) => (
                      <button
                        key={session.id}
                        onClick={() => setSubjectCategory(session.id)}
                        className="h-8 rounded-lg px-4 text-xs"
                        style={{
                          background: subjectCategory === session.id ? "#E87322" : "transparent",
                          color: subjectCategory === session.id ? "#fff" : "rgba(255,255,255,0.52)",
                        }}
                      >
                        {session.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex h-9 w-[220px] items-center gap-2 rounded-xl px-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <Search size={13} style={{ color: "rgba(255,255,255,0.32)" }} />
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.32)" }}>搜索主体</span>
                  </div>
                </div>
                <div className="grid flex-1 auto-rows-min grid-cols-3 gap-3 overflow-auto pr-1">
                  {subjectItems.map((item) => {
                    const selected = item.meta === (subjectFolder?.sessions.find((session) => session.id === subjectCategory)?.name ?? "");
                    return (
                      <button
                        key={item.id}
                        onClick={() => setSubjectCategory(item.id.split("-")[0])}
                        className="overflow-hidden rounded-xl text-left transition-opacity hover:opacity-90"
                        style={{ background: "#211812", border: `1px solid ${selected ? "rgba(232,115,34,0.55)" : "rgba(255,255,255,0.08)"}` }}
                      >
                        <div style={{ aspectRatio: "16/10", background: `url(${item.preview}) center / cover no-repeat` }} />
                        <div className="p-3">
                          <div className="truncate text-sm text-white">{item.name}</div>
                          <div className="mt-1 text-[11px]" style={{ color: "#E87322" }}>{item.meta}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col">
                <div className="mb-4 rounded-2xl px-4 py-3" style={{ background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.18)" }}>
                  <div className="text-sm font-medium" style={{ color: "#a78bfa" }}>应用到分镜</div>
                  <p className="mt-1 text-xs leading-5" style={{ color: "rgba(255,255,255,0.58)" }}>
                    分镜是按剧集和镜头拆分的画面生产单元。应用到分镜后，这张图会写入选中的镜头，可作为分镜图、画面参考或后续视频生成的基础。
                  </p>
                </div>
                <div className="grid min-h-0 flex-1 grid-cols-[180px_1fr] gap-4">
                <div className="overflow-hidden rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "#120D09" }}>
                  <div className="px-3 py-2 text-xs" style={{ color: "rgba(255,255,255,0.35)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>选择剧集</div>
                  <div className="p-2">
                    {episodeFolders.map((folder) => (
                      <button
                        key={folder.id}
                        onClick={() => {
                          setSelectedEpisode(folder.id);
                          setSelectedShot(folder.sessions[0]?.id ?? "");
                        }}
                        className="mb-1 flex h-9 w-full items-center justify-between rounded-lg px-3 text-left text-xs"
                        style={{
                          background: selectedEpisode === folder.id ? "rgba(232,115,34,0.14)" : "transparent",
                          color: selectedEpisode === folder.id ? "#E87322" : "rgba(255,255,255,0.55)",
                        }}
                      >
                        <span>{folder.name}</span>
                        <span style={{ color: "rgba(255,255,255,0.25)" }}>{folder.sessions.length}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.08)", background: "#120D09" }}>
                  <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>选择分镜</span>
                    <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.25)" }}>{currentEpisode?.name}</span>
                  </div>
                  <div className="grid max-h-[390px] grid-cols-2 gap-3 overflow-auto p-3">
                    {storyboardItems.map((item, index) => {
                      const relatedShot = shotItems[index] ?? shotItems[0];
                      const selected = selectedShot === relatedShot?.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedShot(relatedShot?.id ?? "sb1")}
                          className="overflow-hidden rounded-xl text-left transition-opacity hover:opacity-90"
                          style={{
                            background: "#211812",
                            border: `1px solid ${selected ? "rgba(232,115,34,0.62)" : "rgba(255,255,255,0.08)"}`,
                          }}
                        >
                          <div className="relative" style={{ aspectRatio: "16/9", background: `url(${item.preview}) center / cover no-repeat` }}>
                            {selected && (
                              <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full" style={{ background: "#E87322" }}>
                                <Check size={12} className="text-white" />
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <div className="truncate text-sm text-white">{item.name}</div>
                            <div className="mt-1 text-[11px]" style={{ color: "rgba(255,255,255,0.45)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{item.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={onCancel} className="h-9 rounded-xl px-4 text-xs" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.62)" }}>
            取消
          </button>
          <button onClick={onConfirm} className="h-9 rounded-xl px-5 text-xs font-medium text-white" style={{ background: "#E87322", boxShadow: "0 12px 28px rgba(232,115,34,0.24)" }}>
            应用
          </button>
        </div>
      </div>
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

// ─── Virtual IP Modal ─────────────────────────────────────────────────────────
const VIRTUAL_IP_ITEMS_INITIAL = [
  { id: "vip1", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=200&q=70", name: "古风将军", status: "失败" as const },
  { id: "vip2", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=200&q=70", name: "白发女侠", status: "可用" as const },
  { id: "vip3", src: "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?w=200&q=70", name: "城市英雄", status: "可用" as const },
  { id: "vip4", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=200&q=70", name: "赛博战士", status: "待审核" as const },
];

const VIRTUAL_IP_STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  "可用": { color: "#4AC678", bg: "rgba(74,198,120,0.2)" },
  "失败": { color: "#ff6b6b", bg: "rgba(255,107,107,0.2)" },
  "待审核": { color: "rgba(255,255,255,0.5)", bg: "rgba(255,255,255,0.1)" },
};

function VirtualIPModal({
  open, onClose,
  virtualIPItems,
  onSelectAsset,
  virtualIPType, setVirtualIPType,
  assetName, setAssetName, uploadedFile, setUploadedFile,
  onConfirmUpload,
}: {
  open: boolean; onClose: () => void;
  virtualIPItems: Array<{ id: string; src: string; name: string; status: string }>;
  onSelectAsset: (item: { id: string; src: string; name: string }) => void;
  virtualIPType: string; setVirtualIPType: (v: string) => void;
  assetName: string; setAssetName: (v: string) => void;
  uploadedFile: string | null; setUploadedFile: (v: string | null) => void;
  onConfirmUpload: () => void;
}) {
  const [statusFilter, setStatusFilter] = useState("全部");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const filteredItems = statusFilter === "全部" ? virtualIPItems : virtualIPItems.filter(item => item.status === statusFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.72)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="flex rounded-2xl overflow-hidden"
        style={{ background: "#1A1510", border: "1px solid rgba(255,255,255,0.08)", width: "960px", height: "560px", maxHeight: "80vh", boxShadow: "0 24px 80px rgba(0,0,0,0.8)" }}>
        {/* Left: Upload panel */}
        <div className="flex flex-col flex-shrink-0" style={{ width: "320px", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 className="text-sm font-semibold text-white">上传虚拟IP</h2>
          </div>

          <div className="flex-1 overflow-auto px-4 py-3 flex flex-col gap-4">
            {/* Type selector */}
            <div>
              <label className="text-xs font-medium text-white mb-1.5 block">虚拟IP类型 <span style={{ color: "#ff6b6b" }}>*</span></label>
              <button
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {virtualIPType}
                <ChevronDown size={10} style={{ color: "rgba(255,255,255,0.4)" }} />
              </button>
            </div>

            {/* Upload area */}
            <div
              className="flex flex-col items-center justify-center rounded-lg py-6 cursor-pointer transition-colors hover:bg-white/5"
              style={{ border: "1px dashed rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.02)" }}
              onClick={() => fileInputRef.current?.click()}>
              {uploadedFile ? (
                <img src={uploadedFile} alt="上传预览" className="max-h-28 max-w-full object-contain rounded" />
              ) : (
                <>
                  <Plus size={16} style={{ color: "rgba(255,255,255,0.4)" }} />
                  <span className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.5)" }}>点击上传</span>
                </>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setUploadedFile(URL.createObjectURL(file));
                }} />
            </div>

            {/* Format info */}
            <div className="rounded-lg px-3 py-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                格式 jpg / jpeg / png / webp | 大小 &lt;= 30MB
              </p>
            </div>

            {/* Asset name */}
            <div>
              <label className="text-xs font-medium text-white mb-1.5 block">资产名称 <span style={{ color: "#ff6b6b" }}>*</span></label>
              <div className="relative">
                <input
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)" }}
                  placeholder="请输入名称"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  maxLength={64}
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                  {assetName.length}/64
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 px-4 py-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button
              onClick={onConfirmUpload}
              className="h-8 rounded-lg px-4 text-xs font-medium text-white"
              style={{ background: "linear-gradient(135deg, #C47A3A, #E87322)", boxShadow: "0 4px 16px rgba(232,115,34,0.24)" }}>
              确认上传
            </button>
          </div>
        </div>

        {/* Right: Asset library panel */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 className="text-sm font-semibold text-white">虚拟IP库</h2>
            <div className="flex items-center gap-3">
              {/* Status filter dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {statusFilter}
                  <ChevronDown size={10} />
                </button>
                {showStatusMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowStatusMenu(false)} />
                    <div className="absolute top-full mt-1 right-0 z-20 rounded-lg overflow-hidden" style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)", minWidth: "100px" }}>
                      {["全部", "待审核", "可用", "失败"].map(status => (
                        <button key={status}
                          onClick={() => { setStatusFilter(status); setShowStatusMenu(false); }}
                          className="w-full px-3 py-2 text-xs text-left transition-colors hover:bg-white/5"
                          style={{ color: statusFilter === status ? "#E87322" : "rgba(255,255,255,0.6)" }}>
                          {status}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10">
                <X size={14} style={{ color: "rgba(255,255,255,0.5)" }} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-5 pt-3 flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <Search size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
              <input className="flex-1 bg-transparent text-xs outline-none" placeholder="搜索资产名称" style={{ color: "rgba(255,255,255,0.6)" }} />
            </div>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-auto px-5 py-3">
            <div className="grid grid-cols-3 gap-3">
              {/* IP items */}
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className="relative rounded-xl overflow-hidden group cursor-pointer"
                  style={{ aspectRatio: "1/1", background: "#1A1510" }}
                  onClick={() => onSelectAsset(item)}
                >
                  <img src={item.src} alt={item.name} className="w-full h-full object-cover" />
                  {/* Status badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-medium"
                    style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.7)", backdropFilter: "blur(4px)" }}>
                    图片
                  </div>
                  {/* Bottom bar */}
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-2"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: VIRTUAL_IP_STATUS_CONFIG[item.status].bg, color: VIRTUAL_IP_STATUS_CONFIG[item.status].color }}>
                        {item.status}
                      </span>
                      <div className="flex items-center gap-1">
                        <button className="px-2 py-0.5 rounded text-[10px] transition-colors hover:bg-white/10"
                          style={{ background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.7)" }}>
                          预览
                        </button>
                        <button className="w-5 h-5 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                          style={{ background: "rgba(0,0,0,0.5)" }}>
                          <MoreHorizontal size={10} style={{ color: "rgba(255,255,255,0.5)" }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ProjectGeneratePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
    return INITIAL_FILE_TREE.reduce<Record<string, boolean>>((result, folder) => {
      if (folder.id !== "art") result[folder.id] = true;
      return result;
    }, {});
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

  // Plus button menu
  const [showPlusMenu, setShowPlusMenu] = useState(false);

  // Virtual IP modal (single modal with library + upload pages)
  const [showVirtualIPModal, setShowVirtualIPModal] = useState(false);
  const [virtualIPItems, setVirtualIPItems] = useState(VIRTUAL_IP_ITEMS_INITIAL);
  const [virtualIPType, setVirtualIPType] = useState("图片");
  const [virtualIPAssetName, setVirtualIPAssetName] = useState("");
  const [virtualIPUploadedFile, setVirtualIPUploadedFile] = useState<string | null>(null);

  // Prompt reference assets
  const [promptAssets, setPromptAssets] = useState<Array<{ id: string; src: string; name: string }>>([]);

  // Root sessions (not inside any folder)
  const [rootSessions, setRootSessions] = useState<Session[]>([]);
  const [creatingRootSession, setCreatingRootSession] = useState(false);
  const [newRootSessionName, setNewRootSessionName] = useState("");
  const [deleteSessionState, setDeleteSessionState] = useState<DeleteSessionState | null>(null);
  const [deleteMode, setDeleteMode] = useState<"delete" | "move">("delete");
  const [moveTargetSessionId, setMoveTargetSessionId] = useState("");
  const [showGenerateGuide, setShowGenerateGuide] = useState(() => searchParams.get("guide") === "1");
  const [generateGuideStep, setGenerateGuideStep] = useState(0);
  const [applyGuideExplainedSubject, setApplyGuideExplainedSubject] = useState(false);
  const currentGenerateGuideStep = GENERATE_GUIDE_STEPS[generateGuideStep];
  const openApplyDialog = (asset: ApplyAssetState) => {
    setApplyAsset(asset);
    setApplyGuideExplainedSubject(false);
    setApplyTargetType("subject");
    setSelectedEpisode("ep1");
    setSelectedShot("sb1");
    if (showGenerateGuide && currentGenerateGuideStep?.target === "apply-result") {
      setGenerateGuideStep(GENERATE_GUIDE_STEPS.findIndex((item) => item.target === "apply-dialog"));
    }
  };

  const confirmApplyAsset = () => {
    if (!applyAsset) return;
    if (showGenerateGuide && currentGenerateGuideStep?.target === "apply-dialog" && !applyGuideExplainedSubject) {
      setApplyGuideExplainedSubject(true);
      setApplyTargetType("storyboard");
      return;
    }
    const folder = applyTargetType === "subject"
      ? fileTree.find((item) => item.id === "art")
      : fileTree.find((item) => item.id === selectedEpisode);
    const targetName = applyTargetType === "subject"
      ? folder?.sessions.find((item) => item.id === subjectCategory)?.name
      : folder?.sessions.find((item) => item.id === selectedShot)?.name;
    toast.success(`已应用到${applyTargetType === "subject" ? "主体" : "分镜"} / ${targetName ?? "未命名"}`);
    const appliedSrc = applyAsset.src;
    setApplyAsset(null);
    if (showGenerateGuide && currentGenerateGuideStep?.target === "apply-dialog") {
      closeGenerateGuide();
      navigate(`/project/${id}/storyboard?guide=1&applied=1&appliedSrc=${encodeURIComponent(appliedSrc)}`);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, []);

  const closeGenerateGuide = () => {
    setShowGenerateGuide(false);
    setGenerateGuideStep(0);
    setApplyAsset(null);
    setApplyGuideExplainedSubject(false);
    const nextUrl = `${window.location.pathname}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);
  };

  useEffect(() => {
    if (searchParams.get("guide") === "1") {
      setShowGenerateGuide(true);
      setGenerateGuideStep(searchParams.get("guideStep") === "last" ? GENERATE_GUIDE_STEPS.length - 1 : 0);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!showGenerateGuide || !currentGenerateGuideStep) return;
    if (currentGenerateGuideStep.target === "session-tree") {
      setSidebarCollapsed(false);
      setSidebarTab("files");
      setApplyAsset(null);
    }
    if (currentGenerateGuideStep.target === "asset-link") {
      setSidebarCollapsed(false);
      setSidebarTab("assets");
      setAssetSubTab("generate");
      setApplyAsset(null);
    }
    if (currentGenerateGuideStep.target === "asset-to-prompt") {
      setSidebarCollapsed(false);
      setSidebarTab("assets");
      setAssetSubTab("generate");
      setApplyAsset(null);
    }
    if (currentGenerateGuideStep.target === "subject-link" || currentGenerateGuideStep.target === "subject-to-prompt" || currentGenerateGuideStep.target === "subject-detail-edit" || currentGenerateGuideStep.target === "generated-to-subject") {
      setSidebarCollapsed(false);
      setSidebarTab("subject");
      setAssetSubTab("subject");
      setApplyAsset(null);
    }
    if (currentGenerateGuideStep.target === "storyboard-link" || currentGenerateGuideStep.target === "storyboard-send" || currentGenerateGuideStep.target === "generated-to-storyboard") {
      setSidebarCollapsed(false);
      setSidebarTab("storyboard");
      setApplyAsset(null);
    }
    if (currentGenerateGuideStep.target === "generation-results") {
      setSidebarTab("files");
      setApplyAsset(null);
    }
    if (currentGenerateGuideStep.target === "apply-result") {
      setSidebarTab("files");
      const firstImageMessage = CHAT_MESSAGES.find((msg) => msg.type === "ai" && "images" in msg && msg.images?.[0]);
      if (firstImageMessage && firstImageMessage.type === "ai" && "images" in firstImageMessage && firstImageMessage.images?.[0]) {
        setApplyAsset(null);
        setApplyTargetType("storyboard");
        setSubjectCategory("chars");
        setSelectedEpisode("ep1");
        setSelectedShot("sb1");
      }
    }
    if (currentGenerateGuideStep.target === "apply-dialog") {
      setSidebarTab("files");
      const firstImageMessage = CHAT_MESSAGES.find((msg) => msg.type === "ai" && "images" in msg && msg.images?.[0]);
      if (!applyAsset && firstImageMessage && firstImageMessage.type === "ai" && "images" in firstImageMessage && firstImageMessage.images?.[0]) {
        setApplyAsset({ type: "image", src: firstImageMessage.images[0], anchorId: `${firstImageMessage.id}-0` });
      }
      setApplyTargetType(applyGuideExplainedSubject ? "storyboard" : "subject");
      setSelectedEpisode("ep1");
      setSelectedShot("sb1");
    }
    window.setTimeout(() => {
      if (currentGenerateGuideStep.target === "generated-to-subject" || currentGenerateGuideStep.target === "generated-to-storyboard" || currentGenerateGuideStep.target === "storyboard-send") {
        document
          .querySelector('[data-generate-result-item="true"]')
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      document
        .querySelector({
          "asset-to-prompt": '[data-generate-guide-target~="prompt-drop"]',
          "subject-to-prompt": '[data-generate-guide-target~="prompt-drop"]',
          "subject-detail-edit": '[data-subject-guide-item="true"]',
          "generated-to-subject": '[data-generate-guide-target="subject-link"]',
          "generated-to-storyboard": '[data-generate-guide-target="storyboard-link"]',
          "storyboard-send": '[data-generate-guide-target="storyboard-link"]',
        }[currentGenerateGuideStep.target] ?? `[data-generate-guide-target="${currentGenerateGuideStep.target}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  }, [currentGenerateGuideStep, showGenerateGuide]);

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
      const showVideoGuideActions = showGenerateGuide && currentGenerateGuideStep?.target === "apply-result" && msg.id === "m6";
      return (
        <div key={msg.id} className="mb-6" data-generate-guide-target={msg.id === "m6" ? "generation-results" : undefined}>
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
            <div className={`absolute inset-0 ${showVideoGuideActions ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity flex flex-col justify-between p-2`}
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }}>
              <div className="flex justify-end gap-1">
                <button className="w-6 h-6 rounded-lg flex items-center justify-center hover:opacity-80" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
                  <Download size={11} className="text-white" />
                </button>
              </div>
              <div className="flex items-end justify-between">
                <button
                  data-generate-guide-target={msg.id === "m6" ? "apply-result" : undefined}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:opacity-80"
                  style={{ background: "rgba(0,0,0,0.52)", backdropFilter: "blur(10px)", color: "white", border: "1px solid rgba(255,255,255,0.08)" }}
                  onClick={() => {
                    openApplyDialog({ type: "video", src: msg.videoThumbnail, anchorId: msg.id });
                  }}
                >
                  <Upload size={11} />
                  <span className="text-[10px]">应用</span>
                </button>
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
      <div key={msg.id} className="mb-6" data-generate-guide-target={msg.id === "m2" ? "generation-results" : undefined}>
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
            <div
              key={i}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", JSON.stringify({
                  type: "external-asset",
                  src,
                  name: `生成结果_${msg.id}_${i + 1}.jpg`,
                  assetType: "image" as const,
                }));
                e.dataTransfer.effectAllowed = "copy";
              }}
              className="relative rounded-xl overflow-hidden group cursor-pointer"
              data-generate-result-item={msg.id === "m2" && i === 0 ? "true" : undefined}
              style={{ aspectRatio: "1", background: "#1A1510" }}
            >
              <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className={`absolute inset-0 ${showGenerateGuide && currentGenerateGuideStep?.target === "apply-result" && msg.id === "m2" && i === 0 ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity flex flex-col justify-between p-2`}
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
                    data-generate-guide-target={msg.id === "m2" && i === 0 ? "apply-result" : undefined}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:opacity-80"
                    style={{ background: "rgba(0,0,0,0.52)", backdropFilter: "blur(10px)", color: "white", border: "1px solid rgba(255,255,255,0.08)" }}
                    onClick={() => {
                      openApplyDialog({ type: "image", src, anchorId: `${msg.id}-${i}` });
                    }}
                  >
                    <Upload size={11} />
                    <span className="text-[10px]">应用</span>
                  </button>
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
      <div className="px-2 py-1.5 flex-shrink-0">
        <div className="flex items-center gap-1 rounded px-1.5 py-1" style={{ background: "rgba(255,255,255,0.06)" }}>
          <Search size={8} style={{ color: "rgba(255,255,255,0.25)" }} />
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="搜索对话..."
            className="flex-1 min-w-0 bg-transparent outline-none"
            style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", caretColor: "#E87322", padding: 0 }}
          />
          {searchText && (
            <button onClick={() => setSearchText("")} className="w-4 h-4 flex items-center justify-center rounded hover:bg-white/10">
              <X size={8} style={{ color: "rgba(255,255,255,0.25)" }} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-2 pb-2 pt-1">
        {rootSessions.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between px-1 mb-1.5">
              <span className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.36)" }}>
                最近对话
              </span>
              <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                {rootSessions.length}
              </span>
            </div>
            <div className="space-y-1.5">
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

        {fileTree.filter((folder) => folder.id !== "art").map((folder) => {
          const isExpanded = expandedFolders[folder.id];
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
              className="mb-2 overflow-visible rounded-xl"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.055)" }}
            >
              <button
                onClick={() => toggleFolder(folder.id)}
                className="group relative flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-white/5"
                style={{
                  background: isExpanded ? "rgba(255,255,255,0.04)" : "transparent",
                  color: "rgba(255,255,255,0.82)",
                }}
              >
                <ChevronDown size={13} style={{ color: "rgba(255,255,255,0.42)", transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s", flexShrink: 0 }} />
                <Folder size={15} strokeWidth={1.7} style={{ color: isExpanded ? "#E87322" : "rgba(255,255,255,0.44)", flexShrink: 0 }} />
                <span className="min-w-0 flex-1 truncate text-xs font-medium">{folder.name}</span>
                <span className="rounded px-1.5 py-0.5 text-[10px]" style={{ color: "rgba(255,255,255,0.32)", background: "rgba(255,255,255,0.04)" }}>
                  {folder.sessions.length}
                </span>
                <button
                  className="flex h-6 w-6 items-center justify-center rounded-md opacity-70 transition-colors hover:bg-white/10 group-hover:opacity-100"
                  style={{ background: sessionMenuId === `${folder.id}:folder` ? "rgba(232,115,34,0.16)" : "transparent", color: sessionMenuId === `${folder.id}:folder` ? "#E87322" : "rgba(255,255,255,0.36)" }}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSessionMenuId(sessionMenuId === `${folder.id}:folder` ? null : `${folder.id}:folder`);
                  }}
                >
                  <MoreHorizontal size={13} />
                </button>
                {sessionMenuId === `${folder.id}:folder` && (
                  <div
                    className="absolute right-2 top-[38px] z-30 overflow-hidden rounded-xl"
                    style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.6)", minWidth: "130px" }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <button onClick={() => setCreatingSessionInFolder(folder.id)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-white/5" style={{ color: "rgba(255,255,255,0.72)" }}>
                      <Plus size={10} />新建对话
                    </button>
                    <button onClick={() => startRenameSession(folder.id, folder.sessions[0]?.id ?? "")} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-white/5" style={{ color: "rgba(255,255,255,0.62)" }}>
                      <Pencil size={10} />重命名
                    </button>
                    <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
                    <button onClick={() => toast.success(`已删除${folder.name}`)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-red-900/20" style={{ color: "#ff6b6b" }}>
                      <Trash2 size={10} />删除
                    </button>
                  </div>
                )}
              </button>

              {isExpanded && (
                <div className="px-2 pb-2">
                  {creatingSessionInFolder === folder.id ? (
                    <div className="mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ background: "rgba(255,255,255,0.035)" }}>
                      <Plus size={11} style={{ color: "#E87322", flexShrink: 0 }} />
                      <input autoFocus
                        className="min-w-0 flex-1 bg-transparent px-1 py-0.5 text-xs outline-none"
                        style={{ color: "rgba(255,255,255,0.82)", borderBottom: "1px solid rgba(232,115,34,0.45)", caretColor: "#E87322" }}
                        value={newSessionName}
                        onChange={(e) => setNewSessionName(e.target.value)}
                        placeholder="输入对话名称"
                        onKeyDown={(e) => { if (e.key === "Enter") createSession(folder.id); if (e.key === "Escape") { setCreatingSessionInFolder(null); setNewSessionName(""); } }}
                        onBlur={() => { if (newSessionName.trim()) createSession(folder.id); else { setCreatingSessionInFolder(null); setNewSessionName(""); } }}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setCreatingSessionInFolder(folder.id)}
                      className="mb-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/5"
                      style={{ color: "rgba(255,255,255,0.36)" }}
                    >
                      <Plus size={11} style={{ color: "#E87322", flexShrink: 0 }} />
                      <span className="text-[10px] font-medium">新增对话</span>
                    </button>
                  )}
                  {visibleSessions.map((session) => {
                    const isActive = session.id === activeSession;
                    const isRenamingSession = renamingSessionId === session.id;
                    const showSessionMenu = sessionMenuId === session.id;
                    return (
                      <div
                        key={session.id}
                        className="group relative mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5"
                        style={{ background: isActive ? "rgba(232,115,34,0.11)" : "transparent", border: `1px solid ${isActive ? "rgba(232,115,34,0.18)" : "transparent"}` }}
                      >
                        <Film size={11} strokeWidth={1.6} style={{ color: isActive ? "#E87322" : "rgba(255,255,255,0.42)", flexShrink: 0 }} />
                        <button
                          className="min-w-0 flex-1 text-left transition-opacity hover:opacity-85"
                          style={{
                            color: isActive ? "#F3AB72" : "rgba(255,255,255,0.74)",
                          }}
                          onClick={() => setActiveSession(session.id)}
                        >
                          {isRenamingSession ? (
                            <input autoFocus className="w-full bg-transparent px-1 py-0.5 text-xs outline-none"
                              style={{ borderBottom: "1px solid rgba(232,115,34,0.5)", color: "rgba(255,255,255,0.8)", caretColor: "#E87322" }}
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              onBlur={() => confirmRenameSession(folder.id, session.id)}
                              onKeyDown={(e) => { if (e.key === "Enter") confirmRenameSession(folder.id, session.id); if (e.key === "Escape") setRenamingSessionId(null); }}
                            />
                          ) : (
                            <span className="block truncate text-xs">{session.name}</span>
                          )}
                        </button>
                        <button
                          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md opacity-0 transition-opacity hover:bg-white/5 group-hover:opacity-100"
                          onClick={(e) => { e.stopPropagation(); setSessionMenuId(showSessionMenu ? null : session.id); }}
                        >
                          <MoreHorizontal size={11} style={{ color: "rgba(255,255,255,0.34)" }} />
                        </button>
                        {showSessionMenu && (
                          <div className="absolute right-0 top-full z-20 overflow-hidden rounded-xl" style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 8px 24px rgba(0,0,0,0.6)", minWidth: "130px" }} onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => startRenameSession(folder.id, session.id)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-white/5" style={{ color: "rgba(255,255,255,0.7)" }}>
                              <Pencil size={10} />重命名
                            </button>
                            <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
                            <button onClick={() => requestDeleteSession(folder.id, session.id)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-red-900/20" style={{ color: "#ff6b6b" }}>
                              <Trash2 size={10} />删除
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── Sidebar: Assets Tab ──────────────────────────────────────────────────────
  const renderAssetsTab = () => {
    return (
      <div className="relative h-full" data-generate-guide-target="asset-link">
        <div
          className="pointer-events-none absolute left-11 top-[260px] z-10 h-16 w-16 overflow-hidden rounded-xl"
          data-generate-guide-target="asset-drag-demo"
          style={{ opacity: showGenerateGuide && currentGenerateGuideStep?.target === "asset-link" ? 0.98 : 0, border: "2px solid rgba(245,166,35,0.76)", boxShadow: "0 14px 30px rgba(0,0,0,0.36)" }}
        >
          <img src="https://images.unsplash.com/photo-1743951896798-2936f661f939?w=160&q=70" alt="" className="h-full w-full object-cover" />
        </div>
        <ProjectAssetsSidebarPanel projectId={id ?? "1"} activeSubTab="generate" hideSubTabs hideTitle hideSourceFilter title="资产" />
      </div>
    );
  };

  const renderSubjectTab = () => {
    return (
      <div className="h-full" data-generate-guide-target="subject-link">
        <ProjectAssetsSidebarPanel
          projectId={id ?? "1"}
          activeSubTab="subject"
          hideSubTabs
          hideTitle
          hideSourceFilter
          title="主体"
          guideSubjectDetailOpen={showGenerateGuide && currentGenerateGuideStep?.target === "generated-to-subject"}
          guideSubjectEditing={showGenerateGuide && currentGenerateGuideStep?.target === "generated-to-subject"}
          onSubjectCardClick={() => {
            if (showGenerateGuide && currentGenerateGuideStep?.target === "subject-detail-edit") {
              setGenerateGuideStep((value) => Math.min(GENERATE_GUIDE_STEPS.length - 1, value + 1));
            }
          }}
        />
      </div>
    );
  };

  // ── Sidebar: Storyboard Tab ──────────────────────────────────────────────────
  const renderStoryboardTab = () => {
    return (
      <div className="h-full" data-generate-guide-target="storyboard-link">
        <StoryboardSidebarPanel onSendToChat={(content) => {
          setPromptText((current) => current.trim() ? `${current}\n\n${content}` : content);
        }} />
      </div>
    );
  };

  const SIDEBAR_TABS: { key: SidebarTab; label: string }[] = [
    { key: "files", label: "对话" },
    { key: "assets", label: "资产" },
    { key: "subject", label: "主体" },
    { key: "storyboard", label: "分镜" },
  ];
  const sidebarWidth = 280;
  const guideSidebarTab: SidebarTab | null =
    showGenerateGuide && currentGenerateGuideStep
      ? currentGenerateGuideStep.target === "asset-link" || currentGenerateGuideStep.target === "asset-to-prompt"
        ? "assets"
        : currentGenerateGuideStep.target === "subject-link" || currentGenerateGuideStep.target === "subject-to-prompt" || currentGenerateGuideStep.target === "subject-detail-edit" || currentGenerateGuideStep.target === "generated-to-subject"
          ? "subject"
          : currentGenerateGuideStep.target === "storyboard-link" || currentGenerateGuideStep.target === "storyboard-send" || currentGenerateGuideStep.target === "generated-to-storyboard"
            ? "storyboard"
            : currentGenerateGuideStep.target === "session-tree" || currentGenerateGuideStep.target === "generation-results" || currentGenerateGuideStep.target === "apply-result" || currentGenerateGuideStep.target === "apply-dialog"
              ? "files"
              : null
      : null;
  const visibleSidebarTab = guideSidebarTab ?? sidebarTab;

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
            width: sidebarCollapsed ? "0px" : `${sidebarWidth}px`,
            background: "#110E0A",
            borderRight: sidebarCollapsed ? "none" : "1px solid rgba(255,255,255,0.05)",
            transition: "width 0.2s ease",
            overflow: "visible",
            zIndex: 20,
          }}
          data-generate-guide-target={visibleSidebarTab === "files" ? "session-tree" : visibleSidebarTab === "subject" ? "subject-panel" : undefined}
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
                    style={{ color: visibleSidebarTab === tab.key ? "#E87322" : "rgba(255,255,255,0.4)", borderBottom: visibleSidebarTab === tab.key ? "2px solid #E87322" : "2px solid transparent" }}>
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-hidden">
                {visibleSidebarTab === "files" && renderFilesTab()}
                {visibleSidebarTab === "assets" && renderAssetsTab()}
                {visibleSidebarTab === "subject" && renderSubjectTab()}
                {visibleSidebarTab === "storyboard" && renderStoryboardTab()}
              </div>
            </>
          )}
        </div>

        {/* ── Main Chat Area ─────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden relative" style={{ background: "#120D08", marginLeft: sidebarCollapsed ? "0px" : `${sidebarWidth}px`, transition: "margin-left 0.2s ease" }}>
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
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center px-6 pb-4">
            <div
              className="pointer-events-auto w-full max-w-5xl rounded-3xl overflow-hidden"
              data-generate-guide-target="prompt-drop"
              style={{
                background: "linear-gradient(180deg, rgba(232,115,34,0.12) 0%, rgba(14,10,7,0.96) 15%, rgba(10,8,13,0.97) 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                backdropFilter: "blur(12px)",
              }}
            >
              {/* Upload buttons */}
              <div className="flex items-start gap-2 px-5 pt-4 pb-2">
                <button
                  className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl transition-opacity hover:opacity-80"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  <Plus size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
                  <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>参考内容</span>
                </button>
                <button
                  className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl transition-opacity hover:opacity-80"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                  onClick={() => setShowVirtualIPModal(true)}
                >
                  <Plus size={16} style={{ color: "rgba(255,255,255,0.6)" }} />
                  <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.55)" }}>虚拟IP</span>
                </button>

                {/* Prompt assets chips */}
                {promptAssets.length > 0 && (
                  <div className="flex items-start gap-2 ml-2">
                    {promptAssets.map(pa => (
                      <div
                        key={pa.id}
                        className="relative flex flex-col items-center flex-shrink-0 cursor-pointer group"
                        style={{ width: "64px" }}
                      >
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                          <img src={pa.src} alt={pa.name} className="w-full h-full object-cover" />
                          {/* X remove button */}
                          <button
                            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setPromptAssets(prev => prev.filter(p => p.id !== pa.id));
                            }}
                          >
                            <X size={8} style={{ color: "rgba(255,255,255,0.8)" }} />
                          </button>
                        </div>
                        <span className="text-[10px] mt-1 text-center truncate w-full" style={{ color: "rgba(255,255,255,0.5)" }}>{pa.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Textarea with placeholder */}
              <div className="px-5 pb-2">
                {promptText ? (
                  <textarea
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    className="w-full bg-transparent text-sm resize-none outline-none"
                    style={{ color: "rgba(255,255,255,0.82)", caretColor: "#E87322", lineHeight: 1.7, minHeight: "60px", maxHeight: "160px", fontSize: "14px" }}
                  />
                ) : (
                  <div
                    className="text-sm leading-relaxed cursor-text"
                    style={{ color: "rgba(255,255,255,0.3)", lineHeight: 1.7, fontSize: "14px" }}
                    onClick={() => {
                      const el = document.getElementById("prompt-textarea");
                      el?.focus();
                    }}
                  >
                    请将人像参考上传至「虚拟IP」入口(从左侧主体库拖拽上传)，待审核通过后即可使用，「参考内容」仅限上传非人物类的参考图/视频/音频等多种模态的参考素材。
                  </div>
                )}
                {promptText && (
                  <textarea
                    id="prompt-textarea"
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    className="w-full bg-transparent text-sm resize-none outline-none hidden"
                    style={{ color: "rgba(255,255,255,0.82)", caretColor: "#E87322", lineHeight: 1.7, minHeight: "60px", maxHeight: "160px", fontSize: "14px" }}
                  />
                )}
              </div>

              {/* Character count */}
              <div className="px-5 pb-3 flex justify-end">
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{promptText.length} / 3000</span>
              </div>

              {/* Bottom toolbar */}
              <div className="flex items-center justify-between px-4 pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Generation type */}
                  <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors hover:bg-white/10" style={{ background: "rgba(232,115,34,0.15)", color: "#E87322", border: "1px solid rgba(232,115,34,0.2)" }}>
                    视频生成
                    <ChevronDown size={10} />
                  </button>
                  {/* Model */}
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors hover:bg-white/10" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <LucideImage size={11} style={{ color: "#E87322" }} />
                    Seedance 2.0 Fast
                    <ChevronDown size={10} />
                  </button>
                  {/* Reference mode */}
                  <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors hover:bg-white/10" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    全能参考
                    <ChevronDown size={10} />
                  </button>
                  {/* Ratio/Resolution/Count/Duration */}
                  <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors hover:bg-white/10" style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Image size={11} />
                    智能比例
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
                    720p
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
                    1个
                    <span style={{ color: "rgba(255,255,255,0.4)" }}>|</span>
                    5s
                  </button>
                  {/* Globe OFF */}
                  <button className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-white/10" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Globe size={12} style={{ color: "rgba(255,255,255,0.4)" }} />
                    <span style={{ position: "absolute", bottom: "-2px", right: "-3px", fontSize: "6px", fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>OFF</span>
                  </button>
                  {/* Reference ON */}
                  <button className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-white/10 relative" style={{ background: "rgba(232,115,34,0.15)", border: "1px solid rgba(232,115,34,0.25)" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E87322" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                    <span style={{ position: "absolute", bottom: "-2px", right: "-2px", fontSize: "6px", fontWeight: 600, color: "#E87322" }}>ON</span>
                  </button>
                </div>

                {/* Token count + Send button */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div className="w-3 h-3 rounded" style={{ background: "linear-gradient(135deg, #E87322, #F5A623)" }} />
                    <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>22</span>
                  </div>
                  <button
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity hover:opacity-85"
                    style={{ background: promptText.trim() ? "linear-gradient(135deg, #C47A3A, #E87322)" : "rgba(232,115,34,0.25)", boxShadow: promptText.trim() ? "0 4px 16px rgba(232,115,34,0.28)" : "none" }}
                    disabled={!promptText.trim()}
                    onClick={() => {
                      if (promptText.trim()) {
                        toast.success("已发送生成请求");
                        setPromptText("");
                      }
                    }}
                  >
                    <Send size={14} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showVirtualIPModal && (
        <VirtualIPModal
          open={showVirtualIPModal}
          onClose={() => setShowVirtualIPModal(false)}
          virtualIPItems={virtualIPItems}
          onSelectAsset={(item) => {
            if (!promptAssets.find(p => p.id === item.id)) {
              setPromptAssets(prev => [...prev, item]);
              toast.success(`已添加「${item.name}」到输入框`);
              setShowVirtualIPModal(false);
            } else {
              toast.info("该资产已在输入框中");
            }
          }}
          virtualIPType={virtualIPType}
          setVirtualIPType={setVirtualIPType}
          assetName={virtualIPAssetName}
          setAssetName={setVirtualIPAssetName}
          uploadedFile={virtualIPUploadedFile}
          setUploadedFile={setVirtualIPUploadedFile}
          onConfirmUpload={() => {
            if (!virtualIPAssetName.trim()) {
              toast.error("请输入资产名称");
              return;
            }
            const newId = `vip_${Date.now()}`;
            const newAsset = {
              id: newId,
              src: virtualIPUploadedFile || "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=200&q=70",
              name: virtualIPAssetName,
              status: "待审核" as const,
            };
            setVirtualIPItems(prev => [...prev, newAsset]);
            setVirtualIPUploadedFile(null);
            setVirtualIPAssetName("");
            toast.success("虚拟IP已提交审核");
          }}
        />
      )}
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
      {applyAsset && (
        <ApplyImageModal
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
          onCancel={() => setApplyAsset(null)}
          onConfirm={confirmApplyAsset}
        />
      )}
      {showGenerateGuide && currentGenerateGuideStep && (
        <GenerateModuleGuide
          step={generateGuideStep}
          total={GENERATE_GUIDE_STEPS.length}
          current={currentGenerateGuideStep}
          applyDialogPhase={currentGenerateGuideStep.target === "apply-dialog" ? (applyGuideExplainedSubject ? "storyboard" : "subject") : undefined}
          onPrev={() => {
            if (generateGuideStep === 0) {
              closeGenerateGuide();
              navigate(`/project/${id}/subjects?guide=1&guideStep=last`);
              return;
            }
            setGenerateGuideStep((value) => Math.max(0, value - 1));
          }}
          onNext={() => {
            if (currentGenerateGuideStep.target === "apply-result") {
              const firstImageMessage = CHAT_MESSAGES.find((msg) => msg.type === "ai" && "images" in msg && msg.images?.[0]);
              if (firstImageMessage && firstImageMessage.type === "ai" && "images" in firstImageMessage && firstImageMessage.images?.[0]) {
                openApplyDialog({ type: "image", src: firstImageMessage.images[0], anchorId: `${firstImageMessage.id}-0` });
              }
              return;
            }
            if (currentGenerateGuideStep.target === "apply-dialog") {
              if (!applyGuideExplainedSubject) {
                setApplyGuideExplainedSubject(true);
                setApplyTargetType("storyboard");
                return;
              }
              confirmApplyAsset();
              return;
            }
            if (currentGenerateGuideStep.target === "subject-detail-edit") {
              setGenerateGuideStep((value) => Math.min(GENERATE_GUIDE_STEPS.length - 1, value + 1));
              return;
            }
            setGenerateGuideStep((value) => Math.min(GENERATE_GUIDE_STEPS.length - 1, value + 1));
          }}
          onClose={closeGenerateGuide}
        />
      )}
    </>
  );
}
