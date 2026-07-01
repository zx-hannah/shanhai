import { useState, useRef, useEffect, useLayoutEffect, type CSSProperties, type ReactNode } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router";
import {
  X, Edit3, Plus, Download, Trash2, ChevronLeft, ChevronRight,
  ArrowLeft, Send, Check, MessageSquare, Undo2, Redo2,
  Square, Pencil as PencilIcon, ArrowUpRight, Type, History, Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

type AnnotationColor = "#EF4444" | "#06B6D4" | "#EAB308" | "#22C55E" | "#8B5CF6";
type AnnotationTool = "rect" | "pen" | "arrow" | "text" | "eraser";

interface Annotation {
  id: string;
  type: AnnotationTool;
  color: AnnotationColor;
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  resolved: boolean;
}

interface Comment {
  id: string;
  author: string;
  avatar: string;
  time: string;
  text: string;
  thumbnail?: string;
  resolved: boolean;
}

const MOCK_PANELS = [
  { id: "p1", thumb: "https://images.unsplash.com/photo-1636075219672-a422660ce589?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=120&q=60", name: "分镜 1-1" },
  { id: "p2", thumb: "https://images.unsplash.com/photo-1551264397-09c6f678a930?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=120&q=60", name: "分镜 1-2" },
  { id: "p3", thumb: "https://images.unsplash.com/photo-1743951896798-2936f661f939?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=120&q=60", name: "分镜 1-3" },
  { id: "p4", thumb: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=120&q=60", name: "分镜 2-1" },
  { id: "p5", thumb: "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=120&q=60", name: "分镜 2-2" },
];

const MOCK_COMMENTS: Comment[] = [
  {
    id: "c1",
    author: "name",
    avatar: "",
    time: "2026-06-16 09:53",
    text: "批论",
    thumbnail: "https://images.unsplash.com/photo-1636075219672-a422660ce589?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200&q=60",
    resolved: true,
  },
];

const TOOL_COLORS: AnnotationColor[] = ["#EF4444", "#06B6D4", "#EAB308", "#22C55E", "#8B5CF6"];

type ReviewGuideTarget = "history-tab" | "image-info" | "annotation-panel";

const REVIEW_GUIDE_STEPS: { target: ReviewGuideTarget; title: string; body: ReactNode }[] = [
  {
    target: "history-tab",
    title: "历史记录",
    body: "切换「历史记录」标签可以查看该分镜的历史版本和修改记录，方便追溯每次修改的内容和审批状态。",
  },
  {
    target: "image-info",
    title: "生图信息",
    body: "顶部显示图片的生成来源、上传者、时间和脚本内容。可以编辑脚本信息，方便关联对应的分镜描述。",
  },
  {
    target: "annotation-panel",
    title: "审批批注",
    body: "右侧可以输入文字批注、在图片上圈画标注。已有的批注评论支持标记「已解决」和「发送到对话」，方便团队协作文档反馈。",
  },
];

// ─── Guide Component ──────────────────────────────────────────────────────────
function ReviewGuideOverlay({
  step,
  total,
  current,
  onPrev,
  onNext,
  onClose,
}: {
  step: number;
  total: number;
  current: { target: ReviewGuideTarget; title: string; body: ReactNode };
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const [cardPosition, setCardPosition] = useState<CSSProperties>({ right: 24, bottom: 24 });
  const [targetFrame, setTargetFrame] = useState<CSSProperties | null>(null);
  const isLast = step === total - 1;

  useLayoutEffect(() => {
    let frame = 0;
    let tries = 0;
    const updatePosition = () => {
      const target = document.querySelector(`[data-review-guide-target="${current.target}"]`) as HTMLElement | null;
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

      let left = rect.right + gap;
      let top = rect.top + Math.max(0, (rect.height - cardHeight) / 2);
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

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none">
      {targetFrame ? (
        <>
          <div className="absolute left-0 right-0 top-0" style={{ height: targetFrame.top as number, background: "rgba(4,3,2,0.56)" }} />
          <div className="absolute left-0 bottom-0 right-0" style={{ top: ((targetFrame.top as number) + (targetFrame.height as number)), background: "rgba(4,3,2,0.56)" }} />
          <div className="absolute left-0" style={{ top: targetFrame.top as number, width: targetFrame.left as number, height: targetFrame.height as number, background: "rgba(4,3,2,0.56)" }} />
          <div className="absolute right-0" style={{ top: targetFrame.top as number, left: ((targetFrame.left as number) + (targetFrame.width as number)), height: targetFrame.height as number, background: "rgba(4,3,2,0.56)" }} />
          <div className="absolute rounded-[20px] pointer-events-none" style={{ ...targetFrame, zIndex: 75, border: "3px solid #F5A623", boxShadow: "0 0 0 6px rgba(245,166,35,0.18), 0 18px 44px rgba(245,166,35,0.24)" }} />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: "rgba(4,3,2,0.56)" }} />
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
        <p className="mb-4 text-sm leading-6" style={{ color: "rgba(255,255,255,0.68)" }}>{current.body}</p>
        <div className="flex items-center justify-between gap-2">
          <button onClick={onPrev} className="h-8 rounded-lg px-3 text-xs transition-opacity" style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.68)" }}>
            上一步
          </button>
          <button onClick={onNext} className="h-8 rounded-lg px-3 text-xs font-medium transition-opacity hover:opacity-90" style={{ background: "#E87322", color: "#fff" }}>
            {isLast ? "完成引导" : "下一步"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function ImageReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get("id") ?? id;
  const panelId = searchParams.get("panel") ?? "p1";
  const currentPanel = MOCK_PANELS.find((p) => p.id === panelId) ?? MOCK_PANELS[0];

  const [activeTool, setActiveTool] = useState<AnnotationTool>("rect");
  const [activeColor, setActiveColor] = useState<AnnotationColor>("#EF4444");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [commentText, setCommentText] = useState("");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<"current" | "history">("current");
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [previewAnnotation, setPreviewAnnotation] = useState<Annotation | null>(null);

  // Guide state
  const [showReviewGuide, setShowReviewGuide] = useState(() => searchParams.get("guide") === "1");
  const [reviewGuideStep, setReviewGuideStep] = useState(0);
  const currentReviewGuideStep = REVIEW_GUIDE_STEPS[reviewGuideStep];

  const closeReviewGuide = () => {
    setShowReviewGuide(false);
    setReviewGuideStep(0);
  };

  useEffect(() => {
    if (!showReviewGuide || !currentReviewGuideStep) return;
    if (currentReviewGuideStep.target === "history-tab") {
      setActiveTab("history");
    }
    window.setTimeout(() => {
      document
        .querySelector(`[data-review-guide-target="${currentReviewGuideStep.target}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
  }, [currentReviewGuideStep, showReviewGuide]);

  const navigatePanel = (dir: "prev" | "next") => {
    const idx = MOCK_PANELS.findIndex((p) => p.id === panelId);
    const nextIdx = dir === "prev" ? idx - 1 : idx + 1;
    if (nextIdx >= 0 && nextIdx < MOCK_PANELS.length) {
      navigate(`/project-review?id=${projectId}&panel=${MOCK_PANELS[nextIdx].id}${searchParams.get("guide") === "1" ? "&guide=1" : ""}`);
    }
  };

  const getCanvasCoords = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === "eraser") return;
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setDrawStart(coords);
    setPreviewAnnotation({
      id: "preview",
      type: activeTool,
      color: activeColor,
      x: coords.x,
      y: coords.y,
      width: 0,
      height: 0,
      resolved: false,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !previewAnnotation) return;
    const coords = getCanvasCoords(e);
    const w = coords.x - drawStart.x;
    const h = coords.y - drawStart.y;
    setPreviewAnnotation({
      ...previewAnnotation,
      x: w < 0 ? coords.x : drawStart.x,
      y: h < 0 ? coords.y : drawStart.y,
      width: Math.abs(w),
      height: Math.abs(h),
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !previewAnnotation) return;
    setIsDrawing(false);
    if ((previewAnnotation.width ?? 0) > 5 || (previewAnnotation.height ?? 0) > 5) {
      setAnnotations((prev) => [...prev, { ...previewAnnotation, id: `a${Date.now()}` }]);
    }
    setPreviewAnnotation(null);
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment: Comment = {
      id: `c${Date.now()}`,
      author: "当前用户",
      avatar: "",
      time: new Date().toLocaleString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).replace(/\//g, "-"),
      text: commentText,
      thumbnail: currentPanel.thumb,
      resolved: false,
    };
    setComments((prev) => [...prev, newComment]);
    setCommentText("");
    toast.success("评论已发送");
  };

  return (
    <>
    <div className="fixed inset-0 z-50 flex" style={{ background: "#0D0B08" }}>
      {/* ── Left Sidebar ── */}
      <div className="flex flex-col flex-shrink-0" style={{ width: "220px", background: "#141210", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        {/* Title */}
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={() => navigate(`/project/${projectId}/storyboard`)} className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/10 transition-colors">
            <ArrowLeft size={14} style={{ color: "rgba(255,255,255,0.6)" }} />
          </button>
          <span className="text-sm font-medium text-white truncate">{currentPanel.name}</span>
        </div>

        {/* Tabs */}
        <div className="flex px-3 pt-2 gap-1">
          {(["current", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-1.5 rounded-lg text-xs transition-colors relative"
              data-review-guide-target={tab === "history" ? "history-tab" : undefined}
              style={{
                background: activeTab === tab ? "rgba(232,115,34,0.15)" : "transparent",
                color: activeTab === tab ? "#E87322" : "rgba(255,255,255,0.4)",
              }}
            >
              {tab === "current" ? "当前列表" : "历史记录"}
            </button>
          ))}
        </div>

        {/* Upload button */}
        <div className="px-3 py-3">
          <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ background: "rgba(232,115,34,0.15)", color: "#E87322", border: "1px solid rgba(232,115,34,0.2)" }}
            onClick={() => toast.info("上传图片功能")}>
            <Plus size={12} />
            上传图片
          </button>
        </div>

        {/* Thumbnail list */}
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <div className="flex flex-col gap-2">
            {MOCK_PANELS.map((panel) => (
              <button
                key={panel.id}
                onClick={() => navigate(`/project-review?id=${projectId}&panel=${panel.id}${searchParams.get("guide") === "1" ? "&guide=1" : ""}`)}
                className="relative rounded-lg overflow-hidden group"
                style={{
                  border: panel.id === panelId ? "2px solid #E87322" : "2px solid transparent",
                  transition: "border-color 0.15s",
                }}
              >
                <div className="relative" style={{ height: "56px" }}>
                  <img src={panel.thumb} alt={panel.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.3)" }}>
                    <MessageSquare size={12} style={{ color: "#fff" }} />
                  </div>
                </div>
                {/* Annotation count badge */}
                <div className="absolute top-1 left-1 px-1 py-0.5 rounded text-[10px] flex items-center gap-0.5"
                  style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.7)" }}>
                  <MessageSquare size={8} /> 0/1
                </div>
                {/* Action buttons */}
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.7)" }}
                    onClick={(e) => { e.stopPropagation(); toast.info("下载"); }}>
                    <Download size={9} />
                  </button>
                  <button className="w-5 h-5 rounded flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.7)" }}
                    onClick={(e) => { e.stopPropagation(); toast.info("删除"); }}>
                    <Trash2 size={9} />
                  </button>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-2 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div data-review-guide-target="image-info" className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-sm text-white font-medium">图片-{Date.now()}</span>
            <button className="flex items-center justify-center w-6 h-6 rounded hover:bg-white/10 transition-colors">
              <Edit3 size={12} style={{ color: "rgba(255,255,255,0.4)" }} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#E87322", fontSize: "9px", fontWeight: 600 }}>张</div>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>hannah</span>
              <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>本地上传</span>
              <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>2026-06-09 22:27</span>
            </div>
          </div>
          <div className="flex-1 max-w-md">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-xs truncate" style={{ color: "rgba(255,255,255,0.5)" }}>本场在从利行办楼高昇独的没不功风...</span>
              <button className="flex-shrink-0">
                <Edit3 size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
              </button>
            </div>
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden"
          style={{ background: "#0D0B08" }}>
          {/* Navigation arrows */}
          <button onClick={() => navigatePanel("prev")}
            className="absolute left-4 z-10 w-8 h-12 rounded-r-lg flex items-center justify-center transition-colors"
            style={{ background: "rgba(0,0,0,0.4)", color: "rgba(255,255,255,0.4)" }}>
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => navigatePanel("next")}
            className="absolute right-4 z-10 w-8 h-12 rounded-l-lg flex items-center justify-center transition-colors"
            style={{ background: "rgba(0,0,0,0.4)", color: "rgba(255,255,255,0.4)" }}>
            <ChevronRight size={16} />
          </button>

          {/* Toolbar */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(20,18,16,0.9)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
            {[
              { key: "rect" as AnnotationTool, icon: <Square size={13} /> },
              { key: "pen" as AnnotationTool, icon: <PencilIcon size={13} /> },
              { key: "arrow" as AnnotationTool, icon: <ArrowUpRight size={13} /> },
              { key: "text" as AnnotationTool, icon: <Type size={13} /> },
            ].map(({ key, icon }) => (
              <button key={key} onClick={() => setActiveTool(key)}
                className="w-7 h-7 rounded flex items-center justify-center transition-colors"
                style={{
                  color: activeTool === key ? "#fff" : "rgba(255,255,255,0.4)",
                  background: activeTool === key ? "rgba(232,115,34,0.2)" : "transparent",
                }}>
                {icon}
              </button>
            ))}
            <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.1)" }} />
            <button className="w-7 h-7 rounded flex items-center justify-center" style={{ color: "rgba(255,255,255,0.4)" }}>
              <Undo2 size={13} />
            </button>
            <button className="w-7 h-7 rounded flex items-center justify-center" style={{ color: "rgba(255,255,255,0.4)" }}>
              <Redo2 size={13} />
            </button>
            <button className="w-7 h-7 rounded flex items-center justify-center" style={{ color: "rgba(255,255,255,0.4)" }}>
              <Trash2 size={13} />
            </button>
            <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.1)" }} />
            {/* Color picker */}
            <div className="relative">
              <button onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: activeColor }}>
              </button>
              {showColorPicker && (
                <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 flex gap-1.5 px-2 py-1.5 rounded-full"
                  style={{ background: "rgba(20,18,16,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  {TOOL_COLORS.map((c) => (
                    <button key={c} onClick={() => { setActiveColor(c); setShowColorPicker(false); }}
                      className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                      style={{ background: c, boxShadow: activeColor === c ? `0 0 0 2px #fff` : "none" }} />
                  ))}
                </div>
              )}
            </div>
            <button className="w-5 h-5 rounded flex items-center justify-center" style={{ color: "rgba(255,255,255,0.4)" }}>
              <ChevronRight size={10} style={{ transform: "rotate(90deg)" }} />
            </button>
          </div>

          {/* Image canvas */}
          <div ref={canvasRef}
            className="relative"
            style={{ maxWidth: "70%", maxHeight: "80%" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => { setIsDrawing(false); setPreviewAnnotation(null); }}
          >
            <img src={currentPanel.thumb.replace("w=120", "w=800")} alt="" className="max-h-[70vh] object-contain" />
            {/* Existing annotations */}
            {annotations.map((a) => (
              <div key={a.id} className="absolute pointer-events-none"
                style={{
                  left: a.x, top: a.y, width: a.width, height: a.height,
                  border: a.type === "rect" ? `2px solid ${a.color}` : "none",
                  background: a.type === "rect" ? `${a.color}15` : "transparent",
                }}>
              </div>
            ))}
            {/* Preview annotation */}
            {previewAnnotation && previewAnnotation.width && previewAnnotation.width > 0 && (
              <div className="absolute pointer-events-none"
                style={{
                  left: previewAnnotation.x, top: previewAnnotation.y,
                  width: previewAnnotation.width, height: previewAnnotation.height,
                  border: `2px solid ${previewAnnotation.color}`,
                  background: `${previewAnnotation.color}15`,
                }}>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Right Sidebar ── */}
      <div className="flex flex-col flex-shrink-0" style={{ width: "300px", background: "#141210", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
        {/* Close button */}
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <span className="text-sm font-medium" style={{ color: "#E87322" }}>分镜信息</span>
          <button onClick={() => navigate(`/project/${projectId}/storyboard`)} className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10 transition-colors">
            <X size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {/* Script info */}
          <div className="mb-4">
            <label className="text-xs block mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>文字脚本</label>
            <div className="px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>本场在从利行办楼高昇独的没不功风...</span>
            </div>
          </div>

          {/* Annotation input */}
          <div data-review-guide-target="annotation-panel" className="mb-4">
            <label className="text-xs block mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>批注</label>
            <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(232,115,34,0.2)" }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2" style={{ background: "rgba(255,255,255,0.06)", border: "1px dashed rgba(255,255,255,0.1)" }}>
                <Plus size={16} style={{ color: "rgba(255,255,255,0.3)" }} />
              </div>
              <textarea
                className="w-full bg-transparent text-xs outline-none resize-none"
                placeholder="点击输入批注"
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{ color: "rgba(255,255,255,0.6)", caretColor: "#E87322" }}
              />
              <div className="flex justify-end mt-2">
                <button onClick={handleAddComment}
                  className="px-3 py-1 rounded text-xs font-medium transition-colors"
                  style={{ background: commentText.trim() ? "#E87322" : "rgba(255,255,255,0.06)", color: commentText.trim() ? "#fff" : "rgba(255,255,255,0.25)" }}>
                  发送
                </button>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div>
            <label className="text-xs block mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
              评论 (总评论数:{comments.length})
            </label>
            <div className="flex flex-col gap-3">
              {comments.map((c) => (
                <div key={c.id} className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ background: "#4A9EE0", fontSize: "8px", fontWeight: 600 }}>
                      {c.author[0]}
                    </div>
                    <span className="text-xs text-white">{c.author}</span>
                    <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>{c.time}</span>
                    {c.resolved && (
                      <span className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]" style={{ background: "rgba(74,198,120,0.12)", color: "#4AC678" }}>
                        <Check size={8} /> 已解决
                      </span>
                    )}
                  </div>
                  <div className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>{c.text}</div>
                  {c.thumbnail && (
                    <div className="rounded-md overflow-hidden mb-2" style={{ width: "100%", height: "72px" }}>
                      <img src={c.thumbnail} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <button className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>回复</button>
                    <button className="flex items-center gap-1 text-[10px]" style={{ color: "#4AC678" }}>
                      <Check size={8} /> 已解决
                    </button>
                    <button className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>发送到对话</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Guide overlay */}
    {showReviewGuide && currentReviewGuideStep && (
      <ReviewGuideOverlay
        step={reviewGuideStep}
        total={REVIEW_GUIDE_STEPS.length}
        current={currentReviewGuideStep}
        onPrev={() => setReviewGuideStep((value) => Math.max(0, value - 1))}
        onNext={() => {
          if (reviewGuideStep === REVIEW_GUIDE_STEPS.length - 1) {
            closeReviewGuide();
          } else {
            setReviewGuideStep((value) => Math.min(REVIEW_GUIDE_STEPS.length - 1, value + 1));
          }
        }}
        onClose={closeReviewGuide}
      />
    )}
    </>
  );
}
