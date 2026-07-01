import { useState, useEffect, useLayoutEffect, useRef, useId, type CSSProperties, type ReactNode } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import {
  ChevronRight, Plus, Film, MoreHorizontal, AlignLeft, LayoutGrid,
  Filter, Settings2, Upload, Download, X, Check, Pencil, Trash2,
  Users, Clock, ChevronDown, Share2, Link, Eye, Edit3,
  ChevronLeft, Sparkles, Package, Star, Search, Image as LucideImage, Video, Music,
  Copy, Send, MessageSquare, Target, RotateCcw, RotateCw,
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
  storyboardVideo?: string;
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
type ColumnKey = "eventType" | "sceneLabel" | "shotNo" | "script" | "refImg" | "storyboardImg" | "storyboardVideo" | "crew" | "duration" | "progress" | "notes";
const ALL_COLUMNS: { key: ColumnKey; label: string; width: number }[] = [
  { key: "eventType", label: "事件", width: 60 },
  { key: "sceneLabel", label: "场次", width: 80 },
  { key: "shotNo", label: "分镜号", width: 70 },
  { key: "script", label: "文字脚本", width: 260 },
  { key: "refImg", label: "画面参考", width: 140 },
  { key: "storyboardImg", label: "分镜图", width: 140 },
  { key: "storyboardVideo", label: "分镜视频", width: 140 },
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
type StoryboardGuideTarget =
  | "applied-image"
  | "detail-image-list"
  | "detail-image-info"
  | "detail-annotation"
  | "detail-comment"
  | "story-files"
  | "story-toolbar"
  | "story-table"
  | "fill-handle"
  | "story-export"
  | "story-progress"
  | "drag-asset-replace";

const STORYBOARD_GUIDE_STEPS: { target: StoryboardGuideTarget; title: string; body: ReactNode }[] = [
  {
    target: "applied-image",
    title: "查看应用结果",
    body: "刚刚在生成模块点击「应用」确认后，图片已经写入到这里的分镜图，点击查看详情进行审阅批注",
  },
  {
    target: "detail-image-list",
    title: "查看应用素材及历史记录",
    body: "详情页左侧展示当前分镜下的全部内容。删除素材后可以切换到历史记录进行查看。",
  },
  {
    target: "detail-image-info",
    title: "查看图片信息",
    body: "顶部展示生图信息，在本项目生成并应用的图片可以一键定位到对话，快速回到生成位置进行二次修改。",
  },
  {
    target: "detail-annotation",
    title: "审阅批注",
    body: "支持使用批注工具标记，发送到批注对话框，进行评论回复。",
  },
  {
    target: "story-files",
    title: "分镜目录",
    body: "左侧按剧集进行管理，通过标签查看每集当前进度，支持新增/切换不同视图。",
  },
  {
    target: "story-table",
    title: "分镜表编辑区",
    body: "分镜表维护每条分镜的脚本、分镜图/视频、进度等信息，可自定义新增/编辑/隐藏行。",
  },
  {
    target: "drag-asset-replace",
    title: "应用资产到分镜",
    body: "拖拽左侧资产图片到画面参考/分镜图/分镜视频上松开，即可把生成结果补充到对应镜头。",
  },
  {
    target: "story-export",
    title: "导出分镜素材",
    body: "一键导出画面参考/分镜图/分镜视频等素材，进行后续制作、审阅或其他交付使用。",
  },
];
const STORYBOARD_DETAIL_GUIDE_TARGETS: StoryboardGuideTarget[] = ["detail-image-list", "detail-image-info", "detail-annotation", "detail-comment"];
const STORYBOARD_BASE_GUIDE_STEPS = STORYBOARD_GUIDE_STEPS.filter((step) => step.target !== "applied-image" && !STORYBOARD_DETAIL_GUIDE_TARGETS.includes(step.target));

function StoryboardModuleGuide({
  step,
  total,
  current,
  onPrev,
  onNext,
  onClose,
}: {
  step: number;
  total: number;
  current: { target: StoryboardGuideTarget; title: string; body: ReactNode };
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const [cardPosition, setCardPosition] = useState<CSSProperties>({ right: 24, bottom: 24 });
  const [targetFrame, setTargetFrame] = useState<CSSProperties | null>(null);
  const [extraFrames, setExtraFrames] = useState<CSSProperties[]>([]);
  const [annotationCue, setAnnotationCue] = useState<{ from: CSSProperties; to: CSSProperties; image: string } | null>(null);
  const [fillHandleCue, setFillHandleCue] = useState<{ from: CSSProperties; to: CSSProperties } | null>(null);
  const [dragAssetCue, setDragAssetCue] = useState<{ from: CSSProperties; to: CSSProperties; image: string } | null>(null);
  const maskId = `storyboard-guide-mask-${useId().replace(/:/g, "")}`;
  const isLast = step === total - 1;
  const nextLabel = current.target === "applied-image" ? "查看详情" : isLast ? "完成引导" : "下一步";

  useLayoutEffect(() => {
    let frame = 0;
    let tries = 0;
    const updatePosition = () => {
      // fill-handle and drag-asset-replace use multiple targets, not a single element
      const isMultiTarget = current.target === "fill-handle" || current.target === "drag-asset-replace";
      const target = isMultiTarget
        ? (document.querySelector(current.target === "drag-asset-replace" ? '[data-storyboard-guide-target="story-video-cell"]' : '[data-storyboard-guide-target="fill-shot-cell"]') as HTMLElement | null)
        : (document.querySelector(`[data-storyboard-guide-target="${current.target}"]`) as HTMLElement | null);
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
      const cardHeight = 230;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
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

      // For multi-target steps, use extraFrames for highlighting, no single targetFrame
      if (isMultiTarget) {
        setTargetFrame(null);

        if (current.target === "fill-handle") {
          setExtraFrames([]);

          // Compute fillHandleCue from shot-cell and fill-visible-rows
          const fromEl = document.querySelector('[data-storyboard-guide-target="fill-shot-cell"]') as HTMLElement | null;
          const toEl = document.querySelector('[data-storyboard-guide-target="fill-visible-rows"]') as HTMLElement | null;
          if (fromEl && toEl) {
            const fromRect = fromEl.getBoundingClientRect();
            const toRect = toEl.getBoundingClientRect();
            setFillHandleCue({
              from: { left: fromRect.right - 7, top: fromRect.bottom - 7 },
              to: { left: fromRect.right - 7, top: Math.min(toRect.bottom - 10, fromRect.bottom + 162) },
            });
          } else {
            setFillHandleCue(null);
          }
          setDragAssetCue(null);
        } else if (current.target === "drag-asset-replace") {
          const sidebarFrame = makeFrame('[data-storyboard-guide-target="story-assets-sidebar"]', 4);
          const storyVideoFrame = makeFrame('[data-storyboard-guide-target="story-video-cell"]', 4);
          const assetImgFrame = makeFrame('[data-storyboard-video-guide-source="true"], [data-storyboard-guide-target="story-asset-item"]', 4);
          setExtraFrames([sidebarFrame, storyVideoFrame, assetImgFrame].filter(Boolean) as CSSProperties[]);

          // Compute dragAssetCue: from asset item to storyboard video cell
          const fromEl = document.querySelector('[data-storyboard-video-guide-source="true"], [data-storyboard-guide-target="story-asset-item"]') as HTMLElement | null;
          const toEl = document.querySelector('[data-storyboard-guide-target="story-video-cell"]') as HTMLElement | null;
          const imgEl = fromEl?.querySelector("img") as HTMLImageElement | null;
          if (fromEl && toEl) {
            const fromRect = fromEl.getBoundingClientRect();
            const toRect = toEl.getBoundingClientRect();
            setDragAssetCue({
              from: { left: fromRect.left + 4, top: fromRect.top + 4 },
              to: { left: toRect.left + toRect.width / 2 - 30, top: toRect.top + toRect.height / 2 - 30 },
              image: imgEl?.src ?? "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=120&q=70",
            });
          } else if (tries < 18) {
            tries += 1;
            frame = window.requestAnimationFrame(updatePosition);
            return;
          } else {
            setDragAssetCue(null);
          }
          setFillHandleCue(null);
        }
      } else {
        const mainFrame = {
          left: Math.max(margin, rect.left - pad),
          top: Math.max(margin, rect.top - pad),
          width: Math.max(0, Math.min(viewportWidth - margin, rect.right + pad) - Math.max(margin, rect.left - pad)),
          height: Math.max(0, Math.min(viewportHeight - margin, rect.bottom + pad) - Math.max(margin, rect.top - pad)),
        } as CSSProperties;
        setTargetFrame(mainFrame);

        const nextExtraFrames: CSSProperties[] = [];
        if (current.target === "detail-image-info") {
          const locateFrame = makeFrame('[data-storyboard-guide-target="detail-locate-icon"]', 6);
          if (locateFrame) nextExtraFrames.push(locateFrame);
        }
        if (current.target === "detail-annotation") {
          const imageFrame = makeFrame('[data-storyboard-guide-target="detail-main-image"]', 8);
          const toolbarFrame = makeFrame('[data-storyboard-guide-target="detail-drawing-toolbar"]', 6);
          if (imageFrame) nextExtraFrames.push(imageFrame);
          if (toolbarFrame) nextExtraFrames.push(toolbarFrame);
        }
        setExtraFrames(nextExtraFrames);
      }

      if (current.target === "detail-annotation") {
        const fromEl = document.querySelector('[data-storyboard-guide-target="detail-main-image"]') as HTMLElement | null;
        const toEl = document.querySelector('[data-storyboard-guide-target="detail-annotation"]') as HTMLElement | null;
        const img = fromEl?.querySelector("img") as HTMLImageElement | null;
        if (fromEl && toEl) {
          const fromRect = fromEl.getBoundingClientRect();
          const toRect = toEl.getBoundingClientRect();
          setAnnotationCue({
            from: { left: fromRect.left + fromRect.width / 2 - 30, top: fromRect.top + fromRect.height / 2 - 30 },
            to: { left: toRect.left + 60, top: toRect.top + 84 },
            image: img?.src ?? "https://images.unsplash.com/photo-1636075219672-a422660ce589?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=120&q=70",
          });
        } else if (tries < 18) {
          tries += 1;
          frame = window.requestAnimationFrame(updatePosition);
          return;
        } else {
          setAnnotationCue(null);
        }
      } else {
        setAnnotationCue(null);
        if (current.target !== "drag-asset-replace") {
          setDragAssetCue(null);
        }
      }

      let left = rect.right + gap;
      let top = rect.top + Math.max(0, (rect.height - cardHeight) / 2);
      if (current.target === "detail-image-list") {
        left = rect.right + gap;
        top = Math.min(Math.max(rect.top + 58, margin), viewportHeight - cardHeight - margin);
      } else if (current.target === "story-files") {
        left = Math.min(rect.right + gap, viewportWidth - cardWidth - margin);
        top = Math.min(Math.max(rect.top + 54, margin), viewportHeight - cardHeight - margin);
      } else if (current.target === "drag-asset-replace") {
        left = Math.min(Math.max(rect.right + 64, margin), viewportWidth - cardWidth - margin);
        top = Math.min(Math.max(rect.top - 34, margin), viewportHeight - cardHeight - margin);
      } else if (current.target === "fill-handle") {
        left = Math.min(Math.max(rect.right + 64, margin), viewportWidth - cardWidth - margin);
        top = Math.min(Math.max(rect.top - 34, margin), viewportHeight - cardHeight - margin);
      } else if (current.target === "story-export") {
        left = Math.max(margin, rect.left - cardWidth - gap);
        top = Math.min(Math.max(rect.bottom + gap, margin), viewportHeight - cardHeight - margin);
      } else if (current.target === "detail-annotation") {
        left = Math.max(margin, Math.min(rect.left - cardWidth -20, viewportWidth - cardWidth - margin));
        top = Math.min(Math.max(rect.top + 100, margin), viewportHeight - cardHeight - margin);
      } else if (current.target.startsWith("detail-")) {
        left = Math.max(margin, Math.min(rect.left - cardWidth - gap, viewportWidth - cardWidth - margin));
        if (left < margin + 40) left = Math.max(margin, viewportWidth - cardWidth - margin);
        top = Math.min(Math.max(rect.top, margin), viewportHeight - cardHeight - margin);
      }
      if (left + cardWidth + margin > viewportWidth) left = rect.left - cardWidth - gap;
      if (left < margin) {
        left = Math.min(Math.max(rect.left, margin), viewportWidth - cardWidth - margin);
        top = rect.bottom + gap;
      }
      if (top + cardHeight + margin > viewportHeight) top = rect.top - cardHeight - gap;
      if (top < margin) top = Math.min(Math.max(rect.bottom + gap, margin), viewportHeight - cardHeight - margin);

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

  const renderMaskHole = (frame: CSSProperties, radius = 20) => (
    <rect
      x={Number(frame.left) || 0}
      y={Number(frame.top) || 0}
      width={Number(frame.width) || 0}
      height={Number(frame.height) || 0}
      rx={radius}
      fill="black"
    />
  );

  const renderHighlightFrame = (frame: CSSProperties, zIndex = 75, opacity = 0.24) => (
    <div
      className="absolute rounded-[20px]"
      style={{
        ...frame,
        zIndex,
        border: "3px solid #F5A623",
        boxShadow: `0 0 0 6px rgba(245,166,35,0.18), 0 18px 44px rgba(245,166,35,${opacity})`,
      }}
    />
  );

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none">
      {current.target === "fill-handle" ? null : current.target === "drag-asset-replace" ? (
        <>
          {/* SVG mask: punch holes for the highlighted cells */}
          {extraFrames.length > 0 && (
            <svg className="absolute inset-0 h-full w-full" style={{ zIndex: 70 }} aria-hidden="true">
              <defs>
                <mask id={maskId}>
                  <rect x="0" y="0" width="100%" height="100%" fill="white" />
                  {extraFrames.map((frame, index) => (
                    <rect
                      key={index}
                      x={Number(frame.left) || 0}
                      y={Number(frame.top) || 0}
                      width={Number(frame.width) || 0}
                      height={Number(frame.height) || 0}
                      rx={18}
                      fill="black"
                    />
                  ))}
                </mask>
              </defs>
              <rect x="0" y="0" width="100%" height="100%" fill="rgba(4,3,2,0.56)" mask={`url(#${maskId})`} />
            </svg>
          )}
          {extraFrames.map((frame, index) => (
            <div key={index}>{renderHighlightFrame(frame, 76, 0.2)}</div>
          ))}
        </>
      ) : targetFrame ? (
        <>
          <svg className="absolute inset-0 h-full w-full" style={{ zIndex: 70 }} aria-hidden="true">
            <defs>
              <mask id={maskId}>
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {renderMaskHole(targetFrame, 20)}
                {extraFrames.map((frame, index) => (
                  <g key={index}>{renderMaskHole(frame, 18)}</g>
                ))}
              </mask>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="rgba(4,3,2,0.56)" mask={`url(#${maskId})`} />
          </svg>
          {renderHighlightFrame(targetFrame, 75, 0.24)}
          {extraFrames.map((frame, index) => (
            <div key={index}>{renderHighlightFrame(frame, 76, 0.2)}</div>
          ))}
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: "rgba(4,3,2,0.56)" }} />
      )}
      {annotationCue && (
        <>
          <style>{`
            @keyframes storyboard-annotation-drag {
              0%, 12% { transform: translate3d(0, 0, 0) scale(1); opacity: 0; }
              18% { opacity: 1; }
              74% { transform: translate3d(calc(var(--to-x) - var(--from-x)), calc(var(--to-y) - var(--from-y)), 0) scale(0.72); opacity: 1; }
              88%, 100% { transform: translate3d(calc(var(--to-x) - var(--from-x)), calc(var(--to-y) - var(--from-y)), 0) scale(0.72); opacity: 0; }
            }
          `}</style>
          <div
            className="absolute z-[78] overflow-hidden rounded-xl"
            style={{
              ...annotationCue.from,
              width: 60,
              height: 60,
              "--from-x": `${annotationCue.from.left}px`,
              "--from-y": `${annotationCue.from.top}px`,
              "--to-x": `${annotationCue.to.left}px`,
              "--to-y": `${annotationCue.to.top}px`,
              animation: "storyboard-annotation-drag 2.2s ease-in-out infinite",
              border: "2px solid #F5A623",
              boxShadow: "0 16px 36px rgba(0,0,0,0.42), 0 0 24px rgba(245,166,35,0.28)",
            } as CSSProperties}
          >
            <img src={annotationCue.image} alt="" className="h-full w-full object-cover" />
          </div>
        </>
      )}
      {fillHandleCue && (
        <>
          <style>{`
            @keyframes storyboard-fill-handle-drag {
              0%, 10% { transform: translateY(0) scale(1); opacity: 0; }
              18% { opacity: 1; }
              42% { transform: translateY(8px) scale(1.08); opacity: 1; }
              72% { transform: translateY(var(--drag-distance, 160px)) scale(1); opacity: 1; }
              86%, 100% { transform: translateY(var(--drag-distance, 160px)) scale(1); opacity: 0; }
            }
          `}</style>
          <div
            className="absolute z-[79] flex items-center justify-center rounded-[4px] text-base font-black leading-none"
            style={{
              left: fillHandleCue.from.left,
              top: fillHandleCue.from.top,
              width: 22,
              height: 22,
              "--drag-distance": `${fillHandleCue.to.top - fillHandleCue.from.top}px`,
              animation: "storyboard-fill-handle-drag 2.1s ease-in-out infinite",
              background: "#FFFFFF",
              border: "2px solid #6F8FF7",
              color: "#6F8FF7",
              boxShadow: "0 0 0 2px rgba(255,255,255,0.8), 0 10px 24px rgba(0,0,0,0.38)",
            } as CSSProperties}
          >
            +
          </div>
        </>
      )}
      {dragAssetCue && (
        <>
          <style>{`
            @keyframes storyboard-drag-asset {
              0%, 10% { transform: translate(0, 0) scale(0.6); opacity: 0; }
              18% { transform: translate(0, 0) scale(0.65); opacity: 1; }
              30% { transform: translate(calc((var(--dx) * 0.3)), calc((var(--dy) * 0.1))) scale(0.72); opacity: 1; }
              60% { transform: translate(calc((var(--dx) * 0.7)), calc((var(--dy) * 0.6))) scale(0.85); opacity: 1; }
              82% { transform: translate(var(--dx), var(--dy)) scale(0.95); opacity: 1; }
              92%, 100% { transform: translate(var(--dx), var(--dy)) scale(1); opacity: 0; }
            }
          `}</style>
          <div
            className="fixed z-[79] overflow-hidden rounded-lg"
            style={{
              left: dragAssetCue.from.left,
              top: dragAssetCue.from.top,
              width: 56,
              height: 56,
              "--dx": `${dragAssetCue.to.left - dragAssetCue.from.left}px`,
              "--dy": `${dragAssetCue.to.top - dragAssetCue.from.top}px`,
              animation: "storyboard-drag-asset 2.4s ease-in-out infinite",
              border: "2.5px solid #E87322",
              boxShadow: "0 18px 40px rgba(0,0,0,0.48), 0 0 28px rgba(232,115,34,0.3)",
            } as CSSProperties}
          >
            <img src={dragAssetCue.image} alt="" className="h-full w-full object-cover" />
          </div>
        </>
      )}
      <div className="absolute z-[80] w-[360px] rounded-2xl p-4 pointer-events-auto" style={{ ...cardPosition, background: "#1A1510", border: "2px solid #F5A623", boxShadow: "0 28px 70px rgba(0,0,0,0.58), 0 0 0 1px rgba(255,255,255,0.08), 0 0 34px rgba(245,166,35,0.22)" }}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="text-base font-semibold text-white">{current.title}</h3>
            <span className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ color: "#F5A623", background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.22)" }}>
              {step + 1}/{total}
            </span>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/10" style={{ color: "rgba(255,255,255,0.45)" }} title="关闭新手引导">
            <X size={14} />
          </button>
        </div>
        <div className="mb-4 text-sm leading-6" style={{ color: "rgba(255,255,255,0.68)" }}>{current.body}</div>
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

const STORY_ASSETS = [
  { id: "sa1", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200&q=70", name: "白发女侠_v1.jpg", type: "image" as const },
  { id: "sa2", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200&q=70", name: "古城背景.jpg", type: "image" as const },
  { id: "sa3", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200&q=70", name: "山林场景.jpg", type: "image" as const },
  { id: "sa4", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200&q=70", name: "远景背景.jpg", type: "image" as const },
  { id: "sa5", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200&q=70", name: "战斗特效.jpg", type: "image" as const },
  { id: "sa6", src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200&q=70", name: "动效_v1.mp4", type: "video" as const },
];

function StoryboardDetailDrawer({
  panel,
  onClose,
}: {
  panel: StoryPanel;
  onClose: () => void;
}) {
  const previewPanels = [
    panel,
    { ...panel, id: "preview-2", storyboardImg: "https://images.unsplash.com/photo-1551264397-09c6f678a930?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&q=80", shotNo: "2" },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6 py-5" style={{ background: "rgba(0,0,0,0.82)" }}>
      <button
        onClick={onClose}
        className="absolute right-6 top-5 flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ background: "rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.58)" }}
      >
        <X size={22} />
      </button>
      <button className="absolute left-7 top-1/2 flex h-14 w-10 -translate-y-1/2 items-center justify-center rounded-xl" style={{ background: "rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.58)" }}>
        <ChevronLeft size={24} />
      </button>
      <button className="absolute right-7 top-1/2 flex h-14 w-10 -translate-y-1/2 items-center justify-center rounded-xl" style={{ background: "rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.58)" }}>
        <ChevronRight size={24} />
      </button>

      <div className="flex h-[calc(100vh-40px)] w-full max-w-[1880px] overflow-hidden rounded-2xl" style={{ background: "#11100D", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 28px 90px rgba(0,0,0,0.72)" }}>
        <aside
          className="flex w-[260px] flex-col"
          data-storyboard-guide-target="detail-image-list"
          style={{ background: "#12120F", borderRight: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="px-4 py-4">
            <h3 className="text-sm font-semibold text-white">场次 2_分镜1-1</h3>
            <div className="mt-4 grid grid-cols-2 gap-1 rounded-lg p-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <button className="h-8 rounded-md text-xs font-medium" style={{ background: "rgba(232,115,34,0.22)", color: "#E87322" }}>当前列表</button>
              <button className="h-8 rounded-md text-xs" style={{ color: "rgba(255,255,255,0.48)" }}>历史记录</button>
            </div>
            <button className="mt-4 flex h-[68px] w-full items-center justify-center gap-2 rounded-lg border border-dashed text-sm font-semibold" style={{ background: "rgba(232,115,34,0.1)", borderColor: "rgba(232,115,34,0.34)", color: "#E87322" }}>
              <Upload size={16} />上传图片
            </button>
          </div>
          <div className="flex-1 overflow-auto px-4 pb-4">
            {previewPanels.map((item, index) => (
              <div
                key={item.id}
                className="group relative mb-3 overflow-hidden rounded-lg"
                style={{
                  aspectRatio: "16/9",
                  background: "#0D0A06",
                  border: index === 0 ? "1px solid rgba(232,115,34,0.62)" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {item.storyboardImg && <img src={item.storyboardImg} alt="" className="h-full w-full object-cover" />}
                <div className="absolute left-2 top-2 rounded px-1.5 py-0.5 text-[10px]" style={{ background: "rgba(0,0,0,0.58)", color: "rgba(255,255,255,0.86)" }}>
                  <MessageSquare size={10} className="mr-1 inline" />{index + 1}/1
                </div>
                <div className="absolute right-2 top-2 flex items-center gap-1">
                  <button className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: "rgba(0,0,0,0.48)", color: "rgba(255,255,255,0.75)" }}><Star size={13} /></button>
                  <button className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: "rgba(0,0,0,0.48)", color: "rgba(255,255,255,0.75)" }}><Download size={13} /></button>
                  <button className="flex h-6 w-6 items-center justify-center rounded-md" style={{ background: "rgba(0,0,0,0.48)", color: "rgba(255,255,255,0.75)" }}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-[58px] items-center justify-between px-5" style={{ background: "#1E1C18", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-white">004_image_场景_张晓茵</h2>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.72)" }}>
                <Pencil size={15} />
              </button>
            </div>
          </div>

          <div
            className="px-5 py-3"
            data-storyboard-guide-target="detail-image-info"
            style={{ background: "#151410", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: "#E87322", color: "#fff", fontSize: 11 }}>张</div>
                <span className="text-sm font-medium text-white">张晓茵</span>
                <span className="rounded-md px-2 py-0.5 text-xs" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.74)" }}>1K</span>
                <span className="rounded-md px-2 py-0.5 text-xs" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.74)" }}>智能比例</span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.36)" }}>2026-06-16 09:52</span>
              </div>
              <div className="flex items-center gap-2">
                {[Target, Copy, Pencil].map((Icon, index) => (
                  <button
                    key={index}
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    data-storyboard-guide-target={index === 0 ? "detail-locate-icon" : undefined}
                    style={{ background: index === 0 ? "rgba(232,115,34,0.18)" : "rgba(255,255,255,0.06)", color: index === 0 ? "#F5A623" : "rgba(255,255,255,0.66)", boxShadow: index === 0 ? "0 0 0 3px rgba(245,166,35,0.12)" : "none" }}
                  >
                    <Icon size={15} />
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-lg px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-sm leading-6" style={{ color: "rgba(255,255,255,0.72)" }}>
                这张照片捕捉了一个复古风格的办公室或书房，充满了温暖而怀旧的氛围。房间被从右侧大窗户透入的柔和自然光照亮，窗户部分被白色窗帘遮挡。
              </p>
              <p className="mt-3 truncate text-sm" style={{ color: "rgba(255,255,255,0.72)" }}>
                在画面中央，有一张绿色的木桌，上面铺着绿色桌布。桌上摊开一张详细的大地图，部分被斜放在上面的木尺覆盖。
              </p>
            </div>
          </div>

          <div className="relative flex-1 overflow-hidden" style={{ background: "radial-gradient(circle at top, rgba(36,115,102,0.16), transparent 28%), #11100D" }}>
            <div
              className="absolute left-1/2 top-4 z-10 flex -translate-x-1/2 items-center gap-5 rounded-full px-5 py-3"
              data-storyboard-guide-target="detail-drawing-toolbar"
              style={{ background: "rgba(16,31,32,0.9)", border: "1px solid rgba(74,198,198,0.22)", boxShadow: "0 10px 36px rgba(0,0,0,0.44)" }}
            >
              {[LayoutGrid, Link, Send, AlignLeft, RotateCcw, RotateCw, Trash2].map((Icon, index) => (
                <button key={index} className="flex h-5 w-5 items-center justify-center" style={{ color: "rgba(220,232,232,0.76)" }}>
                  <Icon size={18} />
                </button>
              ))}
              <div className="h-6 w-px" style={{ background: "rgba(255,255,255,0.12)" }} />
              {["#F05252", "#4CC3FF", "#F5C142"].map((color) => (
                <span key={color} className="h-5 w-5 rounded-full" style={{ background: color, border: "2px solid rgba(255,255,255,0.8)" }} />
              ))}
              <ChevronDown size={16} style={{ color: "rgba(255,255,255,0.62)" }} />
            </div>
            <div className="flex h-full items-center justify-center px-2 pt-24">
              <div
                className="relative h-[min(66vh,760px)] w-full overflow-hidden rounded-sm"
                data-storyboard-guide-target="detail-main-image"
                style={{ background: "#0D0A06" }}
              >
                {panel.storyboardImg && <img src={panel.storyboardImg} alt="" className="h-full w-full object-cover" />}
                <div className="absolute left-8 top-8 rounded-xl px-5 py-3 text-4xl font-semibold" style={{ color: "rgba(255,255,255,0.78)", border: "2px solid rgba(255,255,255,0.32)", background: "rgba(0,0,0,0.12)" }}>
                  AI 生成
                </div>
              </div>
            </div>
          </div>
        </main>

        <aside className="flex w-[390px] flex-col p-4" style={{ background: "#12120F", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 className="text-sm font-semibold" style={{ color: "#E87322" }}>分镜信息</h3>
          <div className="mt-2 h-px w-14" style={{ background: "#E87322" }} />
          <div className="mt-3 rounded-lg p-4" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
            <p className="text-sm font-semibold text-white">文字脚本</p>
            <p className="mt-2 text-xs leading-5" style={{ color: "rgba(255,255,255,0.58)" }}>{panel.script}</p>
          </div>

          <div
            className="mt-4 rounded-lg p-3"
            data-storyboard-guide-target="detail-annotation"
            style={{ border: "1px solid rgba(232,115,34,0.5)", background: "rgba(232,115,34,0.04)", boxShadow: "0 0 0 3px rgba(232,115,34,0.08)" }}
          >
            <p className="mb-3 text-sm font-semibold text-white">批注</p>
            <div className="flex h-[310px] flex-col rounded-lg p-3" style={{ border: "1px solid rgba(232,115,34,0.3)", background: "#14110D" }}>
              <button className="mb-5 flex h-20 w-20 items-center justify-center rounded-md" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.72)" }}>
                <Plus size={28} />
              </button>
              <textarea className="min-h-0 flex-1 resize-none bg-transparent text-sm outline-none" style={{ color: "rgba(255,255,255,0.72)", caretColor: "#E87322" }} placeholder="点击输入批注" defaultValue={panel.notes} />
              <div className="mt-3 flex justify-end">
                <button
                  className="rounded-md px-4 py-1.5 text-xs font-medium"
                  data-storyboard-guide-target="detail-comment"
                  style={{ background: "#B34E12", color: "#fff" }}
                >
                  发送
                </button>
              </div>
            </div>
          </div>

          <div className="mt-5 min-h-0 flex-1">
            <p className="text-sm font-semibold text-white">评论 <span style={{ color: "rgba(255,255,255,0.42)" }}>(总评论数:1)</span></p>
            <div className="mt-3 rounded-lg p-3" style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: "#E87322", color: "#fff", fontSize: 11 }}>张</div>
                <span className="text-sm font-semibold text-white">张晓茵</span>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.42)" }}>2026-06-25 16:11</span>
              </div>
              <p className="mt-3 text-sm text-white">评论</p>
              <div className="mt-3 flex gap-4 text-xs" style={{ color: "rgba(255,255,255,0.48)" }}>
                <button>回复</button>
                <button style={{ color: "#E87322" }}>解决</button>
                <button>发送到对话</button>
              </div>
              <div className="ml-7 mt-4 rounded-lg p-3" style={{ border: "1px solid rgba(255,255,255,0.06)", background: "#151410" }}>
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: "#E87322", color: "#fff", fontSize: 10 }}>张</div>
                  <span className="text-sm font-semibold text-white">张晓茵</span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.42)" }}>2026-06-25 16:11</span>
                </div>
                <p className="mt-2 text-sm text-white">111</p>
                <p className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.42)" }}>发送到对话</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ProjectStoryboardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
    refImg: true, storyboardImg: true, storyboardVideo: true, crew: true, duration: true,
    progress: true, notes: true,
  });
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [editingPanelId, setEditingPanelId] = useState<string | null>(null);
  const [editField, setEditField] = useState<string>("");
  const [editValue, setEditValue] = useState<string>("");
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);
  const [detailPanelId, setDetailPanelId] = useState<string | null>(null);
  const [sortDuration, setSortDuration] = useState<"none" | "asc" | "desc">("none");
  const [showShareModal, setShowShareModal] = useState(false);
  const [progressDropdownId, setProgressDropdownId] = useState<string | null>(null);
  const [showStoryboardGuide, setShowStoryboardGuide] = useState(() => searchParams.get("guide") === "1");
  const [storyboardGuideStep, setStoryboardGuideStep] = useState(0);
  const tableRef = useRef<HTMLDivElement>(null);
  const isAppliedGuide = searchParams.get("applied") === "1";
  const storyboardGuideSteps = isAppliedGuide ? STORYBOARD_GUIDE_STEPS : STORYBOARD_BASE_GUIDE_STEPS;
  const currentStoryboardGuideStep = storyboardGuideSteps[storyboardGuideStep];

  const closeStoryboardGuide = () => {
    setShowStoryboardGuide(false);
    setStoryboardGuideStep(0);
    const nextUrl = `${window.location.pathname}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);
  };

  useEffect(() => {
    if (searchParams.get("guide") === "1") {
      setShowStoryboardGuide(true);
      setStoryboardGuideStep(() => {
        if (searchParams.get("guideStep") === "last") return storyboardGuideSteps.length - 1;
        if (isAppliedGuide) return 0;
        return 0;
      });
    }
  }, [searchParams, isAppliedGuide, storyboardGuideSteps.length]);

  useEffect(() => {
    if (searchParams.get("applied") !== "1") return;
    const appliedSrc = searchParams.get("appliedSrc");
    if (!appliedSrc) return;
    setEpisodes((prev) => prev.map((ep) => ep.id === "ep1" ? {
      ...ep,
      scenes: ep.scenes.map((scene) => scene.id === "s1" ? {
        ...scene,
        panels: scene.panels.map((panel) => panel.id === "p1" ? {
          ...panel,
          storyboardImg: appliedSrc,
          progress: "审核中" as ProgressStatus,
          notes: "来自生成模块应用",
        } : panel),
      } : scene),
    } : ep));
  }, [searchParams]);

  useEffect(() => {
    if (!showStoryboardGuide || !currentStoryboardGuideStep) return;
    if (currentStoryboardGuideStep.target === "applied-image") {
      setViewMode("table");
      setSidebarCollapsed(false);
      setStorySidebarTab("files");
      setActiveEpisodeId("ep1");
      setActiveSceneId("s1");
      setExpandedEpisodes((prev) => ({ ...prev, ep1: true }));
      setSelectedPanelId("p1");
    }
    if (STORYBOARD_DETAIL_GUIDE_TARGETS.includes(currentStoryboardGuideStep.target)) {
      setViewMode("table");
      setSidebarCollapsed(false);
      setStorySidebarTab("files");
      setActiveEpisodeId("ep1");
      setActiveSceneId("s1");
      setExpandedEpisodes((prev) => ({ ...prev, ep1: true }));
      setSelectedPanelId("p1");
      setDetailPanelId("p1");
    }
    if (currentStoryboardGuideStep.target === "story-files") {
      setSidebarCollapsed(false);
      setStorySidebarTab("files");
      setDetailPanelId(null);
    }
    if (currentStoryboardGuideStep.target === "story-table" || currentStoryboardGuideStep.target === "fill-handle" || currentStoryboardGuideStep.target === "story-export") {
      setDetailPanelId(null);
    }
    if (currentStoryboardGuideStep.target === "drag-asset-replace") {
      setViewMode("table");
      setSidebarCollapsed(false);
      setStorySidebarTab("assets");
      setDetailPanelId(null);
    }
    if (currentStoryboardGuideStep.target === "story-table" || currentStoryboardGuideStep.target === "fill-handle" || currentStoryboardGuideStep.target === "story-export" || currentStoryboardGuideStep.target === "drag-asset-replace" || currentStoryboardGuideStep.target === "story-progress" || currentStoryboardGuideStep.target === "applied-image" || STORYBOARD_DETAIL_GUIDE_TARGETS.includes(currentStoryboardGuideStep.target)) {
      setViewMode("table");
      setProgressDropdownId(null);
    }
    window.setTimeout(() => {
      const scrollTarget = currentStoryboardGuideStep.target === "fill-handle"
        ? document.querySelector('[data-storyboard-guide-target="fill-shot-cell"]')
        : currentStoryboardGuideStep.target === "drag-asset-replace"
          ? document.querySelector('[data-storyboard-guide-target="story-video-cell"]')
        : document.querySelector(`[data-storyboard-guide-target="${currentStoryboardGuideStep.target}"]`);
      scrollTarget?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  }, [currentStoryboardGuideStep, showStoryboardGuide]);

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
  const detailPanel = activeScene?.panels.find((panel) => panel.id === detailPanelId) ?? null;

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
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>分镜</span>
                  </div>
                  <button title="新建集" onClick={() => toast.success("新建集功能")}>
                    <Plus size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
                  </button>
                </div>

                <div className="flex-1 overflow-auto py-1" data-storyboard-guide-target="story-files">
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
              <div className="flex flex-col h-full overflow-hidden" style={{ width: "280px", flexShrink: 0 }} data-storyboard-guide-target="story-assets-sidebar">
                <ProjectAssetsSidebarPanel
                  projectId="1"
                  activeSubTab="generate"
                  hideSubTabs
                  hideTitle
                  hideSourceFilter
                  title="资产"
                  guideDragAssetReplace={showStoryboardGuide && currentStoryboardGuideStep?.target === "drag-asset-replace"}
                  guideStoryboardVideoDrop={showStoryboardGuide && currentStoryboardGuideStep?.target === "drag-asset-replace"}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Main Storyboard Area ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0" data-storyboard-guide-target="story-toolbar" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#0D0A06" }}>
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
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:opacity-80 transition-opacity"
              data-storyboard-guide-target="story-export"
              style={{ background: "#E87322", color: "white" }}
            >
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
            <div ref={tableRef} data-storyboard-guide-target="story-table" style={{ minWidth: "fit-content" }}>
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
                panels.map((panel, rowIndex) => {
                  const isSelected = selectedPanelId === panel.id;
                  return (
                    <div
                      key={panel.id}
                      className="flex items-stretch group transition-colors"
                      data-storyboard-guide-target={rowIndex === 2 ? "fill-visible-rows" : undefined}
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
                          <div
                            key={col.key}
                            className="relative flex items-start px-3 py-2 flex-shrink-0"
                            data-storyboard-guide-target={
                              rowIndex === 1 && col.key === "sceneLabel" ? "fill-scene-cell"
                                : rowIndex === 1 && col.key === "shotNo" ? "fill-shot-cell"
                                  : undefined
                            }
                            style={{
                              width: `${col.width}px`,
                              borderRight: "1px solid rgba(255,255,255,0.04)",
                            }}
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
                                <div
                                  className="rounded-md overflow-hidden"
                                  data-storyboard-guide-target={panel.id === "p1" ? "applied-image" : panel.id === "p3" ? "story-img-cell" : undefined}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setSelectedPanelId(panel.id);
                                    setDetailPanelId(panel.id);
                                  }}
                                  style={{
                                    width: "100px",
                                    height: "64px",
                                    cursor: "pointer",
                                    boxShadow: searchParams.get("applied") === "1" && panel.id === "p1" ? "0 0 0 2px rgba(232,115,34,0.62), 0 10px 26px rgba(232,115,34,0.2)" : "none",
                                  }}
                                >
                                  <img src={panel.storyboardImg} alt="" className="w-full h-full object-cover" />
                                </div>
                              ) : (
                                <div className="flex items-center justify-center rounded-md" style={{ width: "100px", height: "64px", background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.07)" }}>
                                  <Plus size={14} style={{ color: "rgba(255,255,255,0.1)" }} />
                                </div>
                              )
                            )}

                            {col.key === "storyboardVideo" && (
                              panel.storyboardVideo ? (
                                <div className="relative rounded-md overflow-hidden" style={{ width: "100px", height: "64px" }}>
                                  <img src={panel.storyboardVideo} alt="" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.18)" }}>
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: "rgba(0,0,0,0.62)", color: "rgba(255,255,255,0.86)" }}>
                                      <Video size={12} />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div
                                  className="flex flex-col items-center justify-center gap-1 rounded-md"
                                  data-storyboard-guide-target={panel.id === "p3" ? "story-video-cell" : undefined}
                                  style={{ width: "100px", height: "64px", background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.09)" }}
                                >
                                  <Video size={14} style={{ color: "rgba(255,255,255,0.16)" }} />
                                  <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.16)" }}>拖入视频</span>
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
                                <button
                                  data-storyboard-guide-target={panel.id === "p1" ? "story-progress" : undefined}
                                  className="px-2 py-0.5 rounded text-xs"
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
    {detailPanel && (
      <StoryboardDetailDrawer panel={detailPanel} onClose={() => setDetailPanelId(null)} />
    )}
    {showStoryboardGuide && currentStoryboardGuideStep && (
      <StoryboardModuleGuide
        step={storyboardGuideStep}
        total={storyboardGuideSteps.length}
        current={currentStoryboardGuideStep}
        onPrev={() => {
          if (storyboardGuideStep === 0) {
            closeStoryboardGuide();
            navigate(`/project/${id}/generate?guide=1&guideStep=last`);
            return;
          }
          setStoryboardGuideStep((value) => Math.max(0, value - 1));
        }}
        onNext={() => {
          if (currentStoryboardGuideStep.target === "applied-image") {
            setSelectedPanelId("p1");
            setDetailPanelId("p1");
            const firstDetailStep = storyboardGuideSteps.findIndex((item) => item.target === "detail-image-list");
            setStoryboardGuideStep(firstDetailStep >= 0 ? firstDetailStep : Math.min(storyboardGuideSteps.length - 1, storyboardGuideStep + 1));
            return;
          }
          if (currentStoryboardGuideStep.target === "detail-comment") {
            setDetailPanelId(null);
            const tableStep = storyboardGuideSteps.findIndex((item) => item.target === "story-table");
            setStoryboardGuideStep(tableStep >= 0 ? tableStep : Math.min(storyboardGuideSteps.length - 1, storyboardGuideStep + 1));
            return;
          }
          if (storyboardGuideStep === storyboardGuideSteps.length - 1) {
            closeStoryboardGuide();
            return;
          }
          setStoryboardGuideStep((value) => Math.min(storyboardGuideSteps.length - 1, value + 1));
        }}
        onClose={closeStoryboardGuide}
      />
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
