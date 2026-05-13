import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlignLeft,
  ArrowRight,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Download,
  Edit3,
  Eye,
  Filter,
  Film,
  GripVertical,
  Image as LucideImage,
  Info,
  Link,
  MessageSquare,
  MoreHorizontal,
  MoveHorizontal,
  Pencil,
  Plus,
  Share2,
  Trash2,
  Upload,
  UserPlus,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ProjectAssetsSidebarPanel } from "./ProjectAssetsSidebarPanel";

type StoryViewKey = "master" | "image" | "video";
type StorySidebarTab = "files" | "assets";
type ProgressState = "待上传" | "待审核" | "待修改" | "已完成";
type AssetKind = "image" | "video";
type CommentStatus = "待处理" | "已处理";

interface StoryComment {
  id: string;
  author: string;
  status: CommentStatus;
  time: string;
  content: string;
  timestamp?: string;
}

interface StoryAsset {
  id: string;
  src: string;
  label: string;
  countLabel: string;
  uploadInfo: string;
}

interface StoryPanel {
  id: string;
  rowNo: number;
  sceneNo: number;
  shotNo: string;
  script: string;
  referenceImages: string[];
  storyboardImages: StoryAsset[];
  videoAssets: StoryAsset[];
  dub: string;
  owners: string[];
  duration: number;
  totalDone: boolean;
  imageProgress: ProgressState;
  videoProgress: ProgressState;
  notes: string;
  imageComments: StoryComment[];
  videoComments: StoryComment[];
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

interface StoryCustomView {
  id: string;
  name: string;
  type: "custom";
  columns: ColumnKey[];
}

type StoryView = StoryViewKey | StoryCustomView;

type ColumnKey =
  | "sceneNo"
  | "shotNo"
  | "script"
  | "referenceImages"
  | "storyboardImages"
  | "videoAssets"
  | "dub"
  | "owners"
  | "duration"
  | "totalDone"
  | "imageProgress"
  | "videoProgress"
  | "notes";

interface ColumnConfig {
  key: ColumnKey;
  label: string;
  width: number;
  sticky?: boolean;
}

const PROGRESS_ORDER: ProgressState[] = ["待上传", "待审核", "待修改", "已完成"];

const PROGRESS_META: Record<ProgressState, { bg: string; color: string; dot: string }> = {
  待上传: { bg: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.62)", dot: "#8C867E" },
  待审核: { bg: "rgba(232,115,34,0.14)", color: "#E87322", dot: "#E87322" },
  待修改: { bg: "rgba(238,83,83,0.14)", color: "#F06B6B", dot: "#F06B6B" },
  已完成: { bg: "rgba(86,196,138,0.14)", color: "#56C48A", dot: "#56C48A" },
};

const COMMENT_STATUS_META: Record<CommentStatus, { bg: string; color: string }> = {
  待处理: { bg: "rgba(232,115,34,0.15)", color: "#E87322" },
  已处理: { bg: "rgba(86,196,138,0.15)", color: "#56C48A" },
};

const ALL_COLUMNS: ColumnConfig[] = [
  { key: "sceneNo", label: "场次", width: 92, sticky: true },
  { key: "shotNo", label: "分镜号", width: 96, sticky: true },
  { key: "script", label: "文字脚本", width: 280 },
  { key: "referenceImages", label: "画面参考", width: 160 },
  { key: "storyboardImages", label: "分镜图", width: 170 },
  { key: "videoAssets", label: "分镜视频", width: 170 },
  { key: "dub", label: "配音", width: 140 },
  { key: "owners", label: "负责人", width: 130 },
  { key: "duration", label: "时长", width: 92 },
  { key: "totalDone", label: "总进度", width: 92 },
  { key: "imageProgress", label: "画面进度", width: 128 },
  { key: "videoProgress", label: "视频进度", width: 128 },
  { key: "notes", label: "备注", width: 180 },
];

const DEFAULT_MASTER_COLUMNS: ColumnKey[] = ALL_COLUMNS.map((column) => column.key);
const DEFAULT_IMAGE_COLUMNS: ColumnKey[] = ["sceneNo", "shotNo", "script", "storyboardImages", "imageProgress"];
const DEFAULT_VIDEO_COLUMNS: ColumnKey[] = ["sceneNo", "shotNo", "script", "videoAssets", "videoProgress"];

const STORYBOARD_DATA: StoryEpisode[] = [
  {
    id: "ep1",
    name: "第一集",
    scenes: [
      {
        id: "ep1-sc1",
        name: "第一幕 · 引子",
        panels: [
          {
            id: "panel-1",
            rowNo: 1,
            sceneNo: 1,
            shotNo: "001",
            script: "晨雾压过古道，白发女侠从云海深处走来，远处城楼露出轮廓。",
            referenceImages: [
              "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&q=80",
            ],
            storyboardImages: [
              {
                id: "img-1",
                src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&q=80",
                label: "分镜图 A",
                countLabel: "2 条评论",
                uploadInfo: "AI 生成 · 2026-05-11 14:20",
              },
              {
                id: "img-2",
                src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&q=80",
                label: "分镜图 B",
                countLabel: "原图",
                uploadInfo: "上传 · 2026-05-11 16:08",
              },
            ],
            videoAssets: [
              {
                id: "video-1",
                src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&q=80",
                label: "动态预演",
                countLabel: "00:12 / 1 条评论",
                uploadInfo: "AI 视频 · 2026-05-11 18:10",
              },
            ],
            dub: "旁白：山海之间，风雪先至。",
            owners: ["林月", "阿青"],
            duration: 5.0,
            totalDone: false,
            imageProgress: "待审核",
            videoProgress: "待上传",
            notes: "镜头缓推，保留雾气层次",
            imageComments: [
              { id: "ic-1", author: "导演", status: "待处理", time: "今天 15:30", content: "人物边缘需要更干净，左肩轮廓再提亮。" },
              { id: "ic-2", author: "美术", status: "已处理", time: "今天 16:02", content: "已根据批注修正头发高光，并补了一版烟雾。", },
            ],
            videoComments: [
              { id: "vc-1", author: "制片", status: "待处理", time: "今天 18:40", content: "0:07 处推进太快，建议慢 20%。", timestamp: "00:07" },
            ],
          },
          {
            id: "panel-2",
            rowNo: 2,
            sceneNo: 1,
            shotNo: "002",
            script: "近景定格回眸，剑柄出现在右下角，风吹起发丝。",
            referenceImages: [],
            storyboardImages: [
              {
                id: "img-3",
                src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&q=80",
                label: "回眸特写",
                countLabel: "1 张",
                uploadInfo: "上传 · 2026-05-11 17:12",
              },
            ],
            videoAssets: [],
            dub: "女主：你终于来了。",
            owners: ["阿青"],
            duration: 3.5,
            totalDone: true,
            imageProgress: "已完成",
            videoProgress: "待上传",
            notes: "保留负空间给字幕",
            imageComments: [],
            videoComments: [],
          },
          {
            id: "panel-3",
            rowNo: 3,
            sceneNo: 2,
            shotNo: "003",
            script: "古城楼全景，城门开启，人群向两侧退开。",
            referenceImages: [
              "https://images.unsplash.com/photo-1551264397-09c6f678a930?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&q=80",
            ],
            storyboardImages: [],
            videoAssets: [
              {
                id: "video-2",
                src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&q=80",
                label: "城门开场",
                countLabel: "00:08 / 原始版",
                uploadInfo: "生成 · 2026-05-12 09:14",
              },
            ],
            dub: "",
            owners: ["道具组"],
            duration: 4.2,
            totalDone: false,
            imageProgress: "待上传",
            videoProgress: "待审核",
            notes: "",
            imageComments: [],
            videoComments: [
              { id: "vc-2", author: "导演", status: "待处理", time: "今天 10:22", content: "镜头末端的人群调度不够整齐。", timestamp: "00:06" },
            ],
          },
        ],
      },
      {
        id: "ep1-sc2",
        name: "第二幕 · 对决",
        panels: [
          {
            id: "panel-4",
            rowNo: 4,
            sceneNo: 3,
            shotNo: "004",
            script: "双人对峙中景，剑锋切过画面前景。",
            referenceImages: [
              "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&q=80",
            ],
            storyboardImages: [
              {
                id: "img-4",
                src: "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&q=80",
                label: "对峙构图",
                countLabel: "3 条评论",
                uploadInfo: "AI 生成 · 2026-05-12 08:33",
              },
            ],
            videoAssets: [
              {
                id: "video-3",
                src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&q=80",
                label: "对峙试动",
                countLabel: "00:10 / 2 条评论",
                uploadInfo: "上传 · 2026-05-12 11:10",
              },
            ],
            dub: "男主：此剑之后，再无退路。",
            owners: ["林月", "导演"],
            duration: 6.3,
            totalDone: false,
            imageProgress: "待修改",
            videoProgress: "待修改",
            notes: "情绪强度还不够",
            imageComments: [
              { id: "ic-3", author: "导演", status: "待处理", time: "今天 08:40", content: "两个人的视线关系还没对上。" },
            ],
            videoComments: [
              { id: "vc-3", author: "后期", status: "待处理", time: "今天 11:28", content: "0:03 的动势建议再强一点。", timestamp: "00:03" },
              { id: "vc-4", author: "导演", status: "已处理", time: "今天 11:40", content: "已确认保留当前速度，重做镜头路径。", timestamp: "00:05" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "ep2",
    name: "第二集",
    scenes: [
      {
        id: "ep2-sc1",
        name: "第一幕 · 启程",
        panels: [
          {
            id: "panel-5",
            rowNo: 1,
            sceneNo: 1,
            shotNo: "001",
            script: "清晨的栈道与薄雾，旅人背影渐远。",
            referenceImages: [
              "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&q=80",
            ],
            storyboardImages: [],
            videoAssets: [],
            dub: "旁白：人总要向更远处走去。",
            owners: ["阿青"],
            duration: 4.0,
            totalDone: false,
            imageProgress: "待上传",
            videoProgress: "待上传",
            notes: "等待脚本同步后再拆镜",
            imageComments: [],
            videoComments: [],
          },
        ],
      },
    ],
  },
];

const PROJECT_MEMBERS = [
  { id: "pm-1", name: "林月", role: "导演", tip: "项目成员可对项目所有文件和团队成员进行管理" },
  { id: "pm-2", name: "阿青", role: "美术", tip: "项目成员可对项目所有文件和团队成员进行管理" },
  { id: "pm-3", name: "道具组", role: "执行", tip: "项目成员可对项目所有文件和团队成员进行管理" },
];

const EXTERNAL_MEMBERS = [
  { id: "ext-1", name: "投资方 A", email: "partner-a@demo.com", permission: "可阅读", scope: "第一集 / 画面表" },
  { id: "ext-2", name: "外包后期", email: "post@demo.com", permission: "可编辑", scope: "第一集 / 视频表" },
];

const SCRIPT_IMPORT_ROWS = [
  { id: "row-1", episode: "第一集", scene: "第1场", shotNo: "001", script: "晨雾压过古道，白发女侠从云海深处走来。", selected: true },
  { id: "row-2", episode: "第一集", scene: "第1场", shotNo: "002", script: "近景回眸，发丝飞扬，剑柄压低在画面右侧。", selected: true },
  { id: "row-3", episode: "第二集", scene: "第1场", shotNo: "001", script: "栈道长镜头，人物背影渐远。", selected: true },
];

function flattenPanels(episode: StoryEpisode) {
  return episode.scenes.flatMap((scene) =>
    scene.panels.map((panel) => ({
      ...panel,
      sceneName: scene.name,
    })),
  );
}

function getProgressCountForView(view: StoryView, panels: StoryPanel[]) {
  if (typeof view !== "string") {
    const hasImage = view.columns.includes("imageProgress");
    const hasVideo = view.columns.includes("videoProgress");
    const hasTotal = view.columns.includes("totalDone");
    if (hasImage) {
      return {
        label: "画面进度",
        completed: panels.filter((panel) => panel.imageProgress === "已完成").length,
        total: panels.length,
        description: "按画面进度字段中为“已完成”的行数计算",
      };
    }
    if (hasVideo) {
      return {
        label: "视频进度",
        completed: panels.filter((panel) => panel.videoProgress === "已完成").length,
        total: panels.length,
        description: "按视频进度字段中为“已完成”的行数计算",
      };
    }
    if (hasTotal) {
      return {
        label: "总进度",
        completed: panels.filter((panel) => panel.totalDone).length,
        total: panels.length,
        description: "按总进度复选框勾选行数计算",
      };
    }
    return null;
  }

  if (view === "master") {
    return {
      label: "总进度",
      completed: panels.filter((panel) => panel.totalDone).length,
      total: panels.length,
      description: "分镜总表按总进度复选框勾选行数 / 总行数计算",
    };
  }

  if (view === "image") {
    return {
      label: "画面进度",
      completed: panels.filter((panel) => panel.imageProgress === "已完成").length,
      total: panels.length,
      description: "画面表按画面进度为“已完成”的行数 / 总行数计算",
    };
  }

  return {
    label: "视频进度",
    completed: panels.filter((panel) => panel.videoProgress === "已完成").length,
    total: panels.length,
    description: "视频表按视频进度为“已完成”的行数 / 总行数计算",
  };
}

function getViewLabel(view: StoryView) {
  if (typeof view !== "string") {
    return view.name;
  }
  if (view === "master") return "分集总表";
  if (view === "image") return "画面表";
  return "视频表";
}

function getViewColumns(view: StoryView) {
  if (typeof view !== "string") {
    return view.columns;
  }
  if (view === "master") return DEFAULT_MASTER_COLUMNS;
  if (view === "image") return DEFAULT_IMAGE_COLUMNS;
  return DEFAULT_VIDEO_COLUMNS;
}

function AssetThumb({
  src,
  label,
  meta,
  onClick,
  kind,
}: {
  src?: string;
  label: string;
  meta?: string;
  onClick?: () => void;
  kind: AssetKind;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-2 rounded-xl border p-2 text-left transition-colors hover:bg-white/6"
      style={{
        background: "rgba(255,255,255,0.03)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <div
        className="relative h-14 w-16 overflow-hidden rounded-lg"
        style={{ background: "rgba(255,255,255,0.04)" }}
      >
        {src ? (
          <img src={src} alt={label} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {kind === "image" ? (
              <LucideImage size={18} style={{ color: "rgba(255,255,255,0.25)" }} />
            ) : (
              <Video size={18} style={{ color: "rgba(255,255,255,0.25)" }} />
            )}
          </div>
        )}
        {kind === "video" && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.55) 100%)" }}
          >
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{ background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.14)" }}
            >
              <Video size={12} style={{ color: "white" }} />
            </div>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium" style={{ color: "rgba(255,255,255,0.82)" }}>
          {label}
        </div>
        <div className="mt-1 text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
          {meta ?? "点击查看详情"}
        </div>
      </div>
    </button>
  );
}

function MemberAvatars({ owners }: { owners: string[] }) {
  if (owners.length === 0) {
    return (
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed"
        style={{ borderColor: "rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.2)" }}
      >
        <UserPlus size={12} />
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {owners.map((owner, index) => (
        <div
          key={`${owner}-${index}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-semibold"
          style={{
            marginLeft: index === 0 ? 0 : -8,
            background: index % 2 === 0 ? "#E87322" : "#6B84FF",
            borderColor: "#140F09",
            color: "white",
          }}
          title={owner}
        >
          {owner.slice(0, 1)}
        </div>
      ))}
    </div>
  );
}

function ProgressPill({
  value,
  onClick,
}: {
  value: ProgressState;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
      style={{ background: PROGRESS_META[value].bg, color: PROGRESS_META[value].color }}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: PROGRESS_META[value].dot }}
      />
      {value}
    </button>
  );
}

function StoryReviewDialog({
  open,
  onOpenChange,
  panel,
  kind,
  initialAssetIndex,
  episodeName,
  sceneName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  panel: StoryPanel | null;
  kind: AssetKind;
  initialAssetIndex: number;
  episodeName: string;
  sceneName: string;
}) {
  const [selectedAssetIndex, setSelectedAssetIndex] = useState(initialAssetIndex);
  const [commentDraft, setCommentDraft] = useState("");
  const [isRenamingTitle, setIsRenamingTitle] = useState(false);
  const [assetTitle, setAssetTitle] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedAssetIndex(initialAssetIndex);
      setCommentDraft("");
      setIsRenamingTitle(false);
    }
  }, [initialAssetIndex, open]);

  if (!panel) {
    return null;
  }

  const assets = kind === "image" ? panel.storyboardImages : panel.videoAssets;
  const comments = kind === "image" ? panel.imageComments : panel.videoComments;
  const activeAsset = assets[selectedAssetIndex] ?? assets[0];
  const generatedTitle = `${episodeName}_${sceneName}_${panel.owners[0] ?? "未分配"}_${selectedAssetIndex + 1}`;

  useEffect(() => {
    if (open) {
      setAssetTitle(generatedTitle);
    }
  }, [generatedTitle, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-hidden border-0 p-0"
        style={{
          maxWidth: "calc(100vw - 48px)",
          width: "1220px",
          background: "#18120D",
          color: "white",
        }}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{kind === "image" ? "图片批注" : "视频批注"}</DialogTitle>
          <DialogDescription>查看并编辑分镜素材批注</DialogDescription>
        </DialogHeader>
        <div className="flex min-h-[700px] max-h-[86vh]">
          <div
            className="flex w-[260px] flex-col border-r"
            style={{ borderColor: "rgba(255,255,255,0.06)", background: "#110D09" }}
          >
            <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-sm font-semibold">{kind === "image" ? "图片批注" : "视频批注"}</div>
              <div className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.42)" }}>
                镜号 {panel.shotNo} · 当前共 {assets.length} 个{kind === "image" ? "图片" : "视频"}版本
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-auto px-4 py-4">
              {assets.map((asset, index) => {
                const selected = index === selectedAssetIndex;
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => setSelectedAssetIndex(index)}
                    className="w-full rounded-2xl border p-2 text-left transition-colors"
                    style={{
                      borderColor: selected ? "rgba(232,115,34,0.45)" : "rgba(255,255,255,0.08)",
                      background: selected ? "rgba(232,115,34,0.08)" : "rgba(255,255,255,0.03)",
                    }}
                  >
                    <div className="relative overflow-hidden rounded-xl" style={{ aspectRatio: "16 / 10" }}>
                      <img src={asset.src} alt={asset.label} className="h-full w-full object-cover" />
                      <div
                        className="absolute left-2 top-2 rounded-full px-2 py-1 text-[10px] font-medium"
                        style={{ background: "rgba(0,0,0,0.56)", color: "rgba(255,255,255,0.88)" }}
                      >
                        {asset.countLabel}
                      </div>
                    </div>
                    <div className="mt-2 text-xs font-medium" style={{ color: "rgba(255,255,255,0.86)" }}>
                      {asset.label}
                    </div>
                    <div className="mt-1 text-[11px]" style={{ color: "rgba(255,255,255,0.42)" }}>
                      {asset.uploadInfo}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div
                className="rounded-2xl border p-3"
                style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.62)" }}>
                    批注工具
                  </span>
                  <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>
                    涂鸦 / 文本 / 框选 / 箭头
                  </span>
                </div>
                <div className="flex gap-2">
                  {["涂鸦", "文本", "框选", "箭头", "附件"].map((tool) => (
                    <div
                      key={tool}
                      className="rounded-full px-2 py-1 text-[11px]"
                      style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.48)" }}
                    >
                      {tool}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col" style={{ background: "#0E0A07" }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <div className="flex items-center gap-2">
                  {isRenamingTitle ? (
                    <input
                      autoFocus
                      value={assetTitle}
                      onChange={(event) => setAssetTitle(event.target.value)}
                      onBlur={() => setIsRenamingTitle(false)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") setIsRenamingTitle(false);
                        if (event.key === "Escape") {
                          setAssetTitle(generatedTitle);
                          setIsRenamingTitle(false);
                        }
                      }}
                      className="min-w-[320px] rounded-xl border bg-transparent px-3 py-1.5 text-sm font-semibold outline-none"
                      style={{ borderColor: "rgba(232,115,34,0.28)", color: "rgba(255,255,255,0.92)" }}
                    />
                  ) : (
                    <>
                      <div className="text-sm font-semibold">{assetTitle || generatedTitle}</div>
                      <button
                        type="button"
                        onClick={() => setIsRenamingTitle(true)}
                        className="flex h-7 w-7 items-center justify-center rounded-full"
                        style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.46)" }}
                        title="重命名"
                      >
                        <Pencil size={12} />
                      </button>
                    </>
                  )}
                </div>
                <div className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.42)" }}>
                  支持在素材上标记并发送评论，右侧同步展示分镜信息与评论记录
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-full border px-3 py-1.5 text-xs"
                  style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" }}
                  onClick={() => toast.success("已切换上一条")}
                >
                  <ChevronLeft size={12} className="inline mr-1" />
                  上一行
                </button>
                <button
                  type="button"
                  className="rounded-full border px-3 py-1.5 text-xs"
                  style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" }}
                  onClick={() => toast.success("已切换下一条")}
                >
                  下一行
                  <ChevronRight size={12} className="inline ml-1" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-5">
              <div
                className="relative overflow-hidden rounded-[28px] border"
                style={{ borderColor: "rgba(255,255,255,0.08)", background: "#17120E", minHeight: "420px" }}
              >
                {activeAsset ? (
                  <img src={activeAsset.src} alt={activeAsset.label} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full min-h-[420px] items-center justify-center">
                    <span style={{ color: "rgba(255,255,255,0.28)" }}>暂无素材</span>
                  </div>
                )}
                <div
                  className="absolute left-6 top-6 rounded-2xl px-3 py-2 text-xs"
                  style={{ background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.82)" }}
                >
                  点击下方输入批注，可对 {kind === "image" ? "图片" : "视频"} 进行标记
                </div>
              </div>

              <div
                className="mt-4 rounded-[24px] border p-4"
                style={{ borderColor: "rgba(255,255,255,0.08)", background: "#15100C" }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <MessageSquare size={14} style={{ color: "#E87322" }} />
                  <span className="text-sm font-medium">新增批注</span>
                </div>
                <textarea
                  value={commentDraft}
                  onChange={(event) => setCommentDraft(event.target.value)}
                  placeholder={`点击输入文字批注，可对${kind === "image" ? "图片" : "视频"}进行标记`}
                  className="h-24 w-full resize-none rounded-2xl border bg-transparent px-4 py-3 text-sm outline-none"
                  style={{
                    borderColor: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.82)",
                  }}
                />
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.36)" }}>
                    支持图片/视频时间点批注、箭头标记与附件上传
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      toast.success("批注已发送");
                      setCommentDraft("");
                    }}
                    className="rounded-full px-4 py-2 text-sm font-medium"
                    style={{ background: "#E87322", color: "white" }}
                  >
                    发送批注
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="flex w-[340px] flex-col border-l"
            style={{ borderColor: "rgba(255,255,255,0.06)", background: "#120E0A" }}
          >
            <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-sm font-semibold">分镜信息</div>
            </div>
            <div className="flex-1 space-y-4 overflow-auto px-5 py-4">
              <section
                className="rounded-2xl border p-4"
                style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
              >
                <div className="mb-2 text-xs font-medium" style={{ color: "rgba(255,255,255,0.42)" }}>
                  固定信息
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="mb-1 text-[11px]" style={{ color: "rgba(255,255,255,0.34)" }}>文字脚本</div>
                    <div style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.6 }}>{panel.script}</div>
                  </div>
                  <div>
                    <div className="mb-1 text-[11px]" style={{ color: "rgba(255,255,255,0.34)" }}>
                      {kind === "image" ? "画面参考" : "分镜图"}
                    </div>
                    <div className="flex gap-2">
                      {(kind === "image" ? panel.referenceImages : panel.storyboardImages.map((asset) => asset.src))
                        .slice(0, 2)
                        .map((src, index) => (
                          <div
                            key={`${src}-${index}`}
                            className="h-16 w-16 overflow-hidden rounded-xl border"
                            style={{ borderColor: "rgba(255,255,255,0.08)" }}
                          >
                            <img src={src} alt="" className="h-full w-full object-cover" />
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </section>

              <section
                className="rounded-2xl border p-4"
                style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.42)" }}>
                    评论记录
                  </div>
                  <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.28)" }}>
                    {comments.length} 条
                  </span>
                </div>
                <div className="space-y-3">
                  {comments.length === 0 && (
                    <div className="rounded-xl border border-dashed px-3 py-4 text-xs" style={{ color: "rgba(255,255,255,0.28)", borderColor: "rgba(255,255,255,0.08)" }}>
                      暂无评论
                    </div>
                  )}
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-2xl border p-3"
                      style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.82)" }}>
                            {comment.author}
                          </span>
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px]"
                            style={{ background: COMMENT_STATUS_META[comment.status].bg, color: COMMENT_STATUS_META[comment.status].color }}
                          >
                            {comment.status}
                          </span>
                        </div>
                        <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.28)" }}>
                          {comment.timestamp ? `${comment.time} · ${comment.timestamp}` : comment.time}
                        </span>
                      </div>
                      <div className="text-sm leading-6" style={{ color: "rgba(255,255,255,0.6)" }}>
                        {comment.content}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section
                className="rounded-2xl border p-4"
                style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
              >
                <div className="mb-2 text-xs font-medium" style={{ color: "rgba(255,255,255,0.42)" }}>
                  {kind === "image" ? "图片信息" : "视频信息"}
                </div>
                <div className="space-y-2 text-sm" style={{ color: "rgba(255,255,255,0.62)" }}>
                  <div className="flex items-center justify-between">
                    <span>生成/上传</span>
                    <span style={{ color: "rgba(255,255,255,0.84)" }}>{activeAsset?.uploadInfo ?? "暂无"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>备注</span>
                    <span style={{ color: "rgba(255,255,255,0.84)" }}>{panel.notes || "无"}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShareProjectDialog({
  open,
  onOpenChange,
  episodes,
  customViews,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  episodes: StoryEpisode[];
  customViews: StoryCustomView[];
}) {
  const [externalPermission, setExternalPermission] = useState<"可阅读" | "可编辑">("可阅读");
  const [selectedScopes, setSelectedScopes] = useState<string[]>(["ep1", "master"]);

  const scopes = [
    ...episodes.map((episode) => ({ id: episode.id, label: `${episode.name}（含全集视图）` })),
    { id: "master", label: "分集总表" },
    { id: "image", label: "画面表" },
    { id: "video", label: "视频表" },
    ...customViews.map((view) => ({ id: view.id, label: view.name })),
  ];

  const toggleScope = (scopeId: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scopeId) ? prev.filter((id) => id !== scopeId) : [...prev, scopeId],
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-hidden border-0 p-0"
        style={{
          width: "920px",
          maxWidth: "calc(100vw - 32px)",
          background: "#17110C",
          color: "white",
        }}
      >
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2 text-white">
            <Share2 size={16} style={{ color: "#E87322" }} />
            项目分享
          </DialogTitle>
          <DialogDescription style={{ color: "rgba(255,255,255,0.42)" }}>
            支持项目/表格/视图维度的分享协作，并区分阅读、编辑权限
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-0 md:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5 border-r px-6 py-5" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <section
              className="rounded-[24px] border p-4"
              style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm font-semibold">项目成员</span>
                <div
                  className="group relative inline-flex h-5 w-5 items-center justify-center rounded-full border"
                  style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.45)" }}
                >
                  <Info size={11} />
                  <div
                    className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden w-52 -translate-x-1/2 rounded-xl border px-3 py-2 text-[11px] leading-5 group-hover:block"
                    style={{
                      background: "#221810",
                      borderColor: "rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.68)",
                    }}
                  >
                    项目成员可对项目所有文件和团队成员进行管理
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {PROJECT_MEMBERS.map((member, index) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-2xl border px-4 py-3"
                    style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
                        style={{ background: index % 2 === 0 ? "#E87322" : "#6273FF", color: "white" }}
                      >
                        {member.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.82)" }}>
                          {member.name}
                        </div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.36)" }}>
                          {member.role}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-full border px-3 py-1.5 text-xs"
                      style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.56)" }}
                      onClick={() => toast.success("已打开项目成员管理")}
                    >
                      编辑项目
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section
              className="rounded-[24px] border p-4"
              style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
            >
              <div className="mb-3 text-sm font-semibold">外部成员</div>
              <div className="mb-4 grid gap-3 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>权限</div>
                  <div className="flex gap-2">
                    {(["可阅读", "可编辑"] as const).map((permission) => (
                      <button
                        key={permission}
                        type="button"
                        onClick={() => setExternalPermission(permission)}
                        className="rounded-full px-3 py-1.5 text-xs"
                        style={{
                          background: externalPermission === permission ? "rgba(232,115,34,0.15)" : "rgba(255,255,255,0.05)",
                          color: externalPermission === permission ? "#E87322" : "rgba(255,255,255,0.46)",
                          border: `1px solid ${externalPermission === permission ? "rgba(232,115,34,0.28)" : "rgba(255,255,255,0.08)"}`,
                        }}
                      >
                        {permission}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>分享链接</div>
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-full px-3 py-2 text-xs"
                    style={{ background: "#E87322", color: "white" }}
                    onClick={() => {
                      navigator.clipboard.writeText("https://storyboard.demo/share/project-01").catch(() => {});
                      toast.success("分享链接已复制");
                    }}
                  >
                    <Link size={12} />
                    {externalPermission}
                  </button>
                </div>
              </div>
              <div className="mb-2 text-xs" style={{ color: "rgba(255,255,255,0.38)" }}>文件范围</div>
              <div className="flex flex-wrap gap-2">
                {scopes.map((scope) => {
                  const selected = selectedScopes.includes(scope.id);
                  return (
                    <button
                      key={scope.id}
                      type="button"
                      onClick={() => toggleScope(scope.id)}
                      className="rounded-full px-3 py-1.5 text-xs"
                      style={{
                        background: selected ? "rgba(232,115,34,0.14)" : "rgba(255,255,255,0.05)",
                        color: selected ? "#E87322" : "rgba(255,255,255,0.5)",
                        border: `1px solid ${selected ? "rgba(232,115,34,0.24)" : "rgba(255,255,255,0.08)"}`,
                      }}
                    >
                      {scope.label}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <div className="space-y-4 px-6 py-5">
            <div className="text-sm font-semibold">当前分享权限</div>
            {EXTERNAL_MEMBERS.map((member) => (
              <div
                key={member.id}
                className="rounded-[24px] border p-4"
                style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.84)" }}>
                      {member.name}
                    </div>
                    <div className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.36)" }}>
                      {member.email}
                    </div>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-[11px]"
                    style={{
                      background: member.permission === "可编辑" ? "rgba(232,115,34,0.14)" : "rgba(255,255,255,0.06)",
                      color: member.permission === "可编辑" ? "#E87322" : "rgba(255,255,255,0.56)",
                    }}
                  >
                    {member.permission}
                  </span>
                </div>
                <div className="mt-3 text-xs" style={{ color: "rgba(255,255,255,0.46)" }}>
                  文件范围：{member.scope}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {["可阅读", "可编辑", "移除"].map((action) => (
                    <button
                      key={action}
                      type="button"
                      className="rounded-full border px-3 py-1.5 text-xs"
                      style={{
                        borderColor: action === "移除" ? "rgba(255,107,107,0.2)" : "rgba(255,255,255,0.08)",
                        color: action === "移除" ? "#F06B6B" : "rgba(255,255,255,0.56)",
                        opacity: action === "移除" ? 1 : 0.92,
                      }}
                      onClick={() => toast.success(`已为 ${member.name} 设置 ${action}`)}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div
              className="rounded-[24px] border p-4"
              style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
            >
              <div className="mb-2 text-sm font-semibold">权限提醒</div>
              <div className="text-xs leading-6" style={{ color: "rgba(255,255,255,0.48)" }}>
                外部成员进入后，分享按钮会显示为对应权限；项目列表编辑/删除按钮会置灰，并提示“无权调整分享范围”。
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UploadScriptDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [rows, setRows] = useState(SCRIPT_IMPORT_ROWS);
  const allSelected = rows.every((row) => row.selected);

  const toggleRow = (id: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, selected: !row.selected } : row)),
    );
  };

  const toggleAll = () => {
    setRows((prev) => prev.map((row) => ({ ...row, selected: !allSelected })));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="overflow-hidden border-0 p-0"
        style={{
          width: "980px",
          maxWidth: "calc(100vw - 32px)",
          background: "#17110C",
          color: "white",
        }}
      >
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2 text-white">
            <Upload size={16} style={{ color: "#E87322" }} />
            上传脚本
          </DialogTitle>
          <DialogDescription style={{ color: "rgba(255,255,255,0.42)" }}>
            支持下载模版，上传 Excel 后解析并同步到分镜表。若文件有其他信息，将追加在现有数据后面。
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-0 md:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-4 border-r px-6 py-5" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div
              className="rounded-[24px] border border-dashed p-5"
              style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.02)" }}
            >
              <div className="text-sm font-semibold">storyboard_script_v5.xlsx</div>
              <div className="mt-2 text-xs leading-6" style={{ color: "rgba(255,255,255,0.42)" }}>
                左上角显示文件名，可重新上传；上传完成后立即进入解析列表。
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className="rounded-full border px-3 py-2 text-xs"
                  style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.58)" }}
                  onClick={() => toast.success("模板下载已开始")}
                >
                  下载模版
                </button>
                <button
                  type="button"
                  className="rounded-full px-3 py-2 text-xs"
                  style={{ background: "#E87322", color: "white" }}
                  onClick={() => toast.success("已重新上传脚本")}
                >
                  重新上传
                </button>
              </div>
            </div>

            <div
              className="rounded-[24px] border p-4"
              style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
            >
              <div className="mb-3 text-sm font-semibold">筛选条件</div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border px-3 py-2" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.34)" }}>集数</div>
                  <div className="mt-1 text-sm">全部</div>
                </div>
                <div className="rounded-2xl border px-3 py-2" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.34)" }}>场次</div>
                  <div className="mt-1 text-sm">全部</div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">解析结果</div>
                <div className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.42)" }}>
                  默认全选所有行，确认同步后写入文件
                </div>
              </div>
              <button
                type="button"
                onClick={toggleAll}
                className="rounded-full border px-3 py-1.5 text-xs"
                style={{ borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.56)" }}
              >
                {allSelected ? "取消全选" : "全选"}
              </button>
            </div>

            <div
              className="overflow-hidden rounded-[24px] border"
              style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
            >
              <div
                className="grid px-4 py-3 text-xs font-medium"
                style={{
                  gridTemplateColumns: "52px 1fr 90px 90px 1.8fr",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.42)",
                }}
              >
                <span>选择</span>
                <span>集数</span>
                <span>场次</span>
                <span>镜号</span>
                <span>脚本</span>
              </div>
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="grid items-center px-4 py-3 text-sm"
                  style={{
                    gridTemplateColumns: "52px 1fr 90px 90px 1.8fr",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    color: "rgba(255,255,255,0.74)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleRow(row.id)}
                    className="flex h-5 w-5 items-center justify-center rounded border"
                    style={{
                      borderColor: row.selected ? "#E87322" : "rgba(255,255,255,0.14)",
                      background: row.selected ? "#E87322" : "transparent",
                    }}
                  >
                    {row.selected && <Check size={12} className="text-white" />}
                  </button>
                  <span>{row.episode}</span>
                  <span>{row.scene}</span>
                  <span>{row.shotNo}</span>
                  <span className="line-clamp-2" style={{ color: "rgba(255,255,255,0.56)" }}>
                    {row.script}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => toast.success("已确认同步脚本到文件")}
                className="rounded-full px-4 py-2 text-sm font-medium"
                style={{ background: "#E87322", color: "white" }}
              >
                确认同步
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ProjectStoryboardPage() {
  const [episodes, setEpisodes] = useState(STORYBOARD_DATA);
  const [activeEpisodeId, setActiveEpisodeId] = useState("ep1");
  const [activeSceneId, setActiveSceneId] = useState("ep1-sc1");
  const [expandedEpisodes, setExpandedEpisodes] = useState<Record<string, boolean>>({
    ep1: true,
    ep2: true,
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [storySidebarTab, setStorySidebarTab] = useState<StorySidebarTab>("files");
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{
    panel: StoryPanel;
    kind: AssetKind;
    assetIndex: number;
  } | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<{ panelId: string; field: ColumnKey } | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [activeView, setActiveView] = useState<StoryView>("master");
  const [customViews, setCustomViews] = useState<StoryCustomView[]>([
    {
      id: "view-static",
      name: "静态流程",
      type: "custom",
      columns: ["sceneNo", "shotNo", "script", "storyboardImages", "imageProgress", "owners", "notes"],
    },
    {
      id: "view-dynamic",
      name: "动态流程",
      type: "custom",
      columns: ["sceneNo", "shotNo", "script", "videoAssets", "videoProgress", "owners", "notes"],
    },
  ]);
  const [draggedColumn, setDraggedColumn] = useState<ColumnKey | null>(null);
  const [columnOrder, setColumnOrder] = useState<Record<string, ColumnKey[]>>({
    master: [...DEFAULT_MASTER_COLUMNS],
    image: [...DEFAULT_IMAGE_COLUMNS],
    video: [...DEFAULT_VIDEO_COLUMNS],
    "view-static": ["sceneNo", "shotNo", "script", "storyboardImages", "imageProgress", "owners", "notes"],
    "view-dynamic": ["sceneNo", "shotNo", "script", "videoAssets", "videoProgress", "owners", "notes"],
  });
  const [columnVisibility, setColumnVisibility] = useState<Record<string, Record<ColumnKey, boolean>>>({
    master: Object.fromEntries(DEFAULT_MASTER_COLUMNS.map((key) => [key, true])) as Record<ColumnKey, boolean>,
    image: Object.fromEntries(DEFAULT_IMAGE_COLUMNS.map((key) => [key, true])) as Record<ColumnKey, boolean>,
    video: Object.fromEntries(DEFAULT_VIDEO_COLUMNS.map((key) => [key, true])) as Record<ColumnKey, boolean>,
    "view-static": Object.fromEntries(ALL_COLUMNS.map((column) => [column.key, columnOrder["view-static"]?.includes(column.key) ?? false])) as Record<ColumnKey, boolean>,
    "view-dynamic": Object.fromEntries(ALL_COLUMNS.map((column) => [column.key, columnOrder["view-dynamic"]?.includes(column.key) ?? false])) as Record<ColumnKey, boolean>,
  });
  const [sortDirection, setSortDirection] = useState<"none" | "asc" | "desc">("none");
  const [progressMenu, setProgressMenu] = useState<{ panelId: string; field: "imageProgress" | "videoProgress" } | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!progressMenu) return;
    const handler = (event: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(event.target as Node)) {
        setProgressMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [progressMenu]);

  const activeEpisode = episodes.find((episode) => episode.id === activeEpisodeId) ?? episodes[0];
  const activeScene = activeEpisode?.scenes.find((scene) => scene.id === activeSceneId) ?? activeEpisode?.scenes[0];

  const viewId = typeof activeView === "string" ? activeView : activeView.id;
  const configuredColumns = columnOrder[viewId] ?? getViewColumns(activeView);
  const visibleMap =
    columnVisibility[viewId] ??
    (Object.fromEntries(ALL_COLUMNS.map((column) => [column.key, configuredColumns.includes(column.key)])) as Record<ColumnKey, boolean>);
  const visibleColumns = configuredColumns
    .filter((key) => visibleMap[key])
    .map((key) => ALL_COLUMNS.find((column) => column.key === key))
    .filter(Boolean) as ColumnConfig[];

  const basePanels = activeScene?.panels ?? [];
  const filteredPanels = useMemo(() => {
    const viewAdjusted = basePanels.filter((panel) => {
      if (typeof activeView === "string") {
        if (activeView === "image") return panel.storyboardImages.length > 0 || panel.imageProgress !== "待上传";
        if (activeView === "video") return panel.videoAssets.length > 0 || panel.videoProgress !== "待上传";
      }
      return true;
    });

    if (sortDirection === "none") return viewAdjusted;
    return [...viewAdjusted].sort((a, b) =>
      sortDirection === "asc" ? a.duration - b.duration : b.duration - a.duration,
    );
  }, [activeView, basePanels, sortDirection]);

  const progressSummary = getProgressCountForView(activeView, filteredPanels);

  const updatePanel = (panelId: string, updater: (panel: StoryPanel) => StoryPanel) => {
    setEpisodes((prev) =>
      prev.map((episode) =>
        episode.id !== activeEpisodeId
          ? episode
          : {
              ...episode,
              scenes: episode.scenes.map((scene) =>
                scene.id !== activeSceneId
                  ? scene
                  : {
                      ...scene,
                      panels: scene.panels.map((panel) => (panel.id === panelId ? updater(panel) : panel)),
                    },
              ),
            },
      ),
    );
  };

  const addPanel = () => {
    if (!activeScene) return;
    const nextNo = activeScene.panels.length + 1;
    const newPanel: StoryPanel = {
      id: `panel-${Date.now()}`,
      rowNo: nextNo,
      sceneNo: activeScene.panels.length > 0 ? activeScene.panels[activeScene.panels.length - 1].sceneNo : 1,
      shotNo: String(nextNo).padStart(3, "0"),
      script: "请填写文字脚本",
      referenceImages: [],
      storyboardImages: [],
      videoAssets: [],
      dub: "",
      owners: [],
      duration: 3.0,
      totalDone: false,
      imageProgress: "待上传",
      videoProgress: "待上传",
      notes: "",
      imageComments: [],
      videoComments: [],
    };
    setEpisodes((prev) =>
      prev.map((episode) =>
        episode.id !== activeEpisodeId
          ? episode
          : {
              ...episode,
              scenes: episode.scenes.map((scene) =>
                scene.id !== activeSceneId ? scene : { ...scene, panels: [...scene.panels, newPanel] },
              ),
            },
      ),
    );
    toast.success("已新增分镜行");
  };

  const duplicatePanel = (panelId: string) => {
    const panel = basePanels.find((item) => item.id === panelId);
    if (!panel) return;
    const duplicated = {
      ...panel,
      id: `panel-${Date.now()}`,
      rowNo: basePanels.length + 1,
      shotNo: `${panel.shotNo}-副本`,
    };
    setEpisodes((prev) =>
      prev.map((episode) =>
        episode.id !== activeEpisodeId
          ? episode
          : {
              ...episode,
              scenes: episode.scenes.map((scene) =>
                scene.id !== activeSceneId ? scene : { ...scene, panels: [...scene.panels, duplicated] },
              ),
            },
      ),
    );
    toast.success("已复制分镜行");
  };

  const deletePanel = (panelId: string) => {
    setEpisodes((prev) =>
      prev.map((episode) =>
        episode.id !== activeEpisodeId
          ? episode
          : {
              ...episode,
              scenes: episode.scenes.map((scene) =>
                scene.id !== activeSceneId
                  ? scene
                  : { ...scene, panels: scene.panels.filter((panel) => panel.id !== panelId) },
              ),
            },
      ),
    );
    toast.success("已删除分镜行");
  };

  const startEdit = (panel: StoryPanel, field: ColumnKey) => {
    if (["referenceImages", "storyboardImages", "videoAssets", "owners"].includes(field)) return;
    setEditingCell({ panelId: panel.id, field });
    if (field === "duration") setEditingValue(String(panel.duration));
    else if (field === "sceneNo") setEditingValue(String(panel.sceneNo));
    else if (field === "totalDone") setEditingValue(panel.totalDone ? "true" : "false");
    else setEditingValue(String((panel as unknown as Record<string, string | number | boolean>)[field] ?? ""));
  };

  const commitEdit = () => {
    if (!editingCell) return;
    const { panelId, field } = editingCell;
    updatePanel(panelId, (panel) => {
      if (field === "duration") {
        return { ...panel, duration: Number(editingValue || 0) };
      }
      if (field === "sceneNo") {
        return { ...panel, sceneNo: Number(editingValue || 0) };
      }
      if (field === "shotNo" || field === "script" || field === "dub" || field === "notes") {
        return { ...panel, [field]: editingValue } as StoryPanel;
      }
      return panel;
    });
    setEditingCell(null);
  };

  const toggleEpisode = (episodeId: string) => {
    setExpandedEpisodes((prev) => ({ ...prev, [episodeId]: !prev[episodeId] }));
  };

  const setProgressValue = (
    panelId: string,
    field: "imageProgress" | "videoProgress",
    value: ProgressState,
  ) => {
    updatePanel(panelId, (panel) => ({ ...panel, [field]: value }));
    setProgressMenu(null);
  };

  const moveColumn = (target: ColumnKey) => {
    if (!draggedColumn || draggedColumn === target) return;
    const current = [...configuredColumns];
    const from = current.indexOf(draggedColumn);
    const to = current.indexOf(target);
    if (from === -1 || to === -1) return;
    current.splice(from, 1);
    current.splice(to, 0, draggedColumn);
    setColumnOrder((prev) => ({ ...prev, [viewId]: current }));
    setDraggedColumn(null);
  };

  const toggleColumn = (columnKey: ColumnKey) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [viewId]: {
        ...(prev[viewId] ?? ({} as Record<ColumnKey, boolean>)),
        [columnKey]: !(prev[viewId]?.[columnKey] ?? configuredColumns.includes(columnKey)),
      },
    }));
  };

  const createView = () => {
    const id = `view-${Date.now()}`;
    const view: StoryCustomView = {
      id,
      name: `新视图 ${customViews.length + 1}`,
      type: "custom",
      columns: ["sceneNo", "shotNo", "script", "storyboardImages", "imageProgress", "notes"],
    };
    setCustomViews((prev) => [...prev, view]);
    setColumnOrder((prev) => ({ ...prev, [id]: [...view.columns] }));
    setColumnVisibility((prev) => ({
      ...prev,
      [id]: Object.fromEntries(ALL_COLUMNS.map((column) => [column.key, view.columns.includes(column.key)])) as Record<ColumnKey, boolean>,
    }));
    setActiveView(view);
    toast.success("已新增视图");
  };

  const renameView = (viewIdToRename: string) => {
    setCustomViews((prev) =>
      prev.map((view, index) =>
        view.id === viewIdToRename ? { ...view, name: `协作视图 ${index + 1}` } : view,
      ),
    );
    toast.success("视图已重命名");
  };

  const removeView = (viewIdToRemove: string) => {
    setCustomViews((prev) => prev.filter((view) => view.id !== viewIdToRemove));
    setActiveView("master");
    toast.success("视图已删除");
  };

  const duplicateView = (viewToDuplicate: StoryCustomView) => {
    const id = `view-${Date.now()}`;
    const copy = { ...viewToDuplicate, id, name: `${viewToDuplicate.name} 副本` };
    setCustomViews((prev) => [...prev, copy]);
    setColumnOrder((prev) => ({ ...prev, [id]: [...(columnOrder[viewToDuplicate.id] ?? viewToDuplicate.columns)] }));
    setColumnVisibility((prev) => ({
      ...prev,
      [id]: { ...(prev[viewToDuplicate.id] ?? {}) } as Record<ColumnKey, boolean>,
    }));
    toast.success("视图已复制");
  };

  const getSceneSidebarLabel = (scene: StoryScene, index: number) => {
    const matched = scene.name.match(/第(\d+)幕|第(\d+)场/);
    const parsedNo = matched ? Number(matched[1] ?? matched[2]) : index + 1;
    return `第${parsedNo}场`;
  };

  return (
    <>
      <div className="flex h-full overflow-hidden" style={{ background: "#120D08", color: "white" }}>
        <aside
          className="relative flex shrink-0 flex-col border-r"
          style={{
            width: sidebarCollapsed ? "28px" : "248px",
            borderColor: "rgba(255,255,255,0.06)",
            background: "linear-gradient(180deg, #100C08 0%, #0B0907 100%)",
            transition: "width 0.2s ease",
          }}
        >
          <button
            type="button"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="absolute right-1 top-2 z-20 flex h-6 w-6 items-center justify-center rounded-full"
            style={{ color: "rgba(255,255,255,0.36)", background: "rgba(255,255,255,0.04)" }}
          >
            {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>

          {!sidebarCollapsed && (
            <>
              <div className="flex border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                {[
                  { key: "files" as const, label: "文件" },
                  { key: "assets" as const, label: "资产" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setStorySidebarTab(tab.key)}
                    className="flex-1 px-3 py-3 text-xs font-medium"
                    style={{
                      color: storySidebarTab === tab.key ? "#E87322" : "rgba(255,255,255,0.42)",
                      borderBottom: storySidebarTab === tab.key ? "2px solid #E87322" : "2px solid transparent",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {storySidebarTab === "files" ? (
                <div className="flex-1 overflow-auto px-3 py-3">
                  {episodes.map((episode) => {
                    const expanded = expandedEpisodes[episode.id];
                    const panels = flattenPanels(episode);
                    const episodeProgress = getProgressCountForView(activeView, panels);
                    return (
                      <div key={episode.id} className="mb-3 rounded-[22px] border" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveEpisodeId(episode.id);
                            if (episode.scenes[0]) setActiveSceneId(episode.scenes[0].id);
                            if (episode.id === "ep1") setActiveView("master");
                            toggleEpisode(episode.id);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-3 text-left"
                          style={{
                            background: episode.id === activeEpisodeId && activeView === "master" && episode.id === "ep1" ? "rgba(232,115,34,0.08)" : "transparent",
                          }}
                        >
                          <ChevronRight
                            size={12}
                            style={{
                              color: episode.id === activeEpisodeId && activeView === "master" && episode.id === "ep1" ? "#E87322" : "rgba(255,255,255,0.36)",
                              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                              transition: "transform 0.15s",
                            }}
                          />
                          <Film size={13} style={{ color: episode.id === activeEpisodeId && activeView === "master" && episode.id === "ep1" ? "#E87322" : "#E87322" }} />
                          <span
                            className="flex-1 text-sm font-medium"
                            style={{ color: episode.id === activeEpisodeId && activeView === "master" && episode.id === "ep1" ? "#E87322" : "rgba(255,255,255,0.82)" }}
                          >
                            {episode.name}
                          </span>
                          {episodeProgress && (
                            <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.34)" }}>
                              {episodeProgress.completed}/{episodeProgress.total}
                            </span>
                          )}
                        </button>
                        {expanded && (
                          <div className="space-y-1 px-2 pb-2">
                            {episode.id === "ep1" ? (
                              <>
                                {episode.scenes.map((scene, index) => {
                                  const active = episode.id === activeEpisodeId && scene.id === activeSceneId && activeView === "master";
                                  return (
                                    <div
                                      key={scene.id}
                                      className="group flex items-center gap-2 rounded-2xl px-3 py-2"
                                      style={{
                                        background: active ? "rgba(232,115,34,0.12)" : "transparent",
                                        color: active ? "#E87322" : "rgba(255,255,255,0.5)",
                                      }}
                                    >
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setActiveEpisodeId(episode.id);
                                          setActiveSceneId(scene.id);
                                          setActiveView("master");
                                        }}
                                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                                      >
                                        <AlignLeft size={11} />
                                        <span className="flex-1 truncate text-xs">{getSceneSidebarLabel(scene, index)}</span>
                                      </button>
                                      <button
                                        type="button"
                                        className="opacity-0 transition-opacity group-hover:opacity-100"
                                        style={{ color: "rgba(255,255,255,0.32)" }}
                                        onClick={() => toast.success(`可重命名 ${getSceneSidebarLabel(scene, index)}`)}
                                        title="重命名"
                                      >
                                        <Pencil size={11} />
                                      </button>
                                      <button
                                        type="button"
                                        className="opacity-0 transition-opacity group-hover:opacity-100"
                                        style={{ color: "rgba(255,107,107,0.66)" }}
                                        onClick={() => toast.success(`可删除 ${getSceneSidebarLabel(scene, index)}`)}
                                        title="删除"
                                      >
                                        <Trash2 size={11} />
                                      </button>
                                    </div>
                                  );
                                })}
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveEpisodeId(episode.id);
                                    if (episode.scenes[0]) setActiveSceneId(episode.scenes[0].id);
                                    setActiveView("video");
                                  }}
                                  className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left"
                                  style={{
                                    background: activeEpisodeId === episode.id && activeView === "video" ? "rgba(232,115,34,0.12)" : "transparent",
                                    color: activeEpisodeId === episode.id && activeView === "video" ? "#E87322" : "rgba(255,255,255,0.5)",
                                  }}
                                >
                                  <Video size={11} />
                                  <span className="flex-1 text-xs">动态</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveEpisodeId(episode.id);
                                    if (episode.scenes[0]) setActiveSceneId(episode.scenes[0].id);
                                    setActiveView("image");
                                  }}
                                  className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left"
                                  style={{
                                    background: activeEpisodeId === episode.id && activeView === "image" ? "rgba(232,115,34,0.12)" : "transparent",
                                    color: activeEpisodeId === episode.id && activeView === "image" ? "#E87322" : "rgba(255,255,255,0.5)",
                                  }}
                                >
                                  <LucideImage size={11} />
                                  <span className="flex-1 text-xs">静态</span>
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-xs"
                              style={{ color: "rgba(255,255,255,0.28)" }}
                              onClick={() => toast.success(`已在 ${episode.name} 新建视图`)}
                            >
                              <Plus size={11} />
                              新建视图
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-[22px] border border-dashed px-3 py-3 text-sm"
                    style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.36)" }}
                    onClick={() => toast.success("已新建剧集")}
                  >
                    <Plus size={13} />
                    新建剧集
                  </button>
                </div>
              ) : (
                <div className="min-h-0 flex-1 overflow-hidden">
                  <ProjectAssetsSidebarPanel />
                </div>
              )}
            </>
          )}
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden" style={{ background: "#13110F" }}>
          <header
            className="border-b px-6 pb-3 pt-4"
            style={{
              borderColor: "rgba(255,255,255,0.05)",
              background: "#141210",
            }}
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>《见君心》番外短片</span>
                  <ChevronRight size={12} style={{ color: "rgba(255,255,255,0.24)" }} />
                  {progressSummary && (
                    <div
                      className="group relative rounded-xl px-3 py-1.5 text-sm font-semibold"
                      style={{
                        background: "linear-gradient(180deg, #FFB06A 0%, #FF7F2D 100%)",
                        color: "#1A120C",
                      }}
                    >
                      进度： {progressSummary.completed}/{progressSummary.total}
                      <div
                        className="pointer-events-none absolute left-0 top-full z-10 mt-2 hidden w-64 rounded-2xl border px-3 py-2 text-[11px] leading-5 group-hover:block"
                        style={{
                          background: "#1D150F",
                          borderColor: "rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.62)",
                        }}
                      >
                        {progressSummary.description}
                      </div>
                    </div>
                  )}
                  <ChevronRight size={12} style={{ color: "rgba(255,255,255,0.24)" }} />
                  <span style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>{activeEpisode?.name}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowShareModal(true)}
                  className="rounded-full px-5 py-2 text-sm font-semibold"
                  style={{ background: "linear-gradient(180deg, #FFB06A 0%, #FF7F2D 100%)", color: "#120D08" }}
                >
                  分享
                </button>
                <button
                  type="button"
                  onClick={() => setShowUploadDialog(true)}
                  className="rounded-full px-5 py-2 text-sm font-semibold"
                  style={{ background: "linear-gradient(180deg, #FFB06A 0%, #FF7F2D 100%)", color: "#120D08" }}
                >
                  上传脚本
                </button>
                <button
                  type="button"
                  className="rounded-full px-5 py-2 text-sm font-semibold"
                  style={{ background: "#4A4A4A", color: "white" }}
                  onClick={() => toast.success("已开始批量导出")}
                >
                  导出
                </button>
              </div>
            </div>
          </header>

          <div className="border-b px-6 py-0" style={{ borderColor: "rgba(255,255,255,0.05)", background: "#141210" }}>
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setActiveView("master")}
                className="flex items-center gap-2 border-b-2 px-1 py-4 text-[15px] font-medium"
                style={{
                  borderColor: activeView === "master" ? "#FF8A33" : "transparent",
                  color: activeView === "master" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.68)",
                }}
              >
                <AlignLeft size={14} />
                {activeEpisode?.name}
              </button>
              <button
                type="button"
                onClick={() => setActiveView("image")}
                className="border-b-2 px-1 py-4 text-[15px] font-medium"
                style={{
                  borderColor: activeView === "image" ? "#FF8A33" : "transparent",
                  color: activeView === "image" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.68)",
                }}
              >
                画面表
              </button>
              <button
                type="button"
                onClick={() => setActiveView("video")}
                className="border-b-2 px-1 py-4 text-[15px] font-medium"
                style={{
                  borderColor: activeView === "video" ? "#FF8A33" : "transparent",
                  color: activeView === "video" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.68)",
                }}
              >
                视频表
              </button>
              {typeof activeView !== "string" && (
                <div className="group flex items-center gap-2 border-b-2 px-1 py-4 text-[15px] font-medium" style={{ borderColor: "#FF8A33", color: "rgba(255,255,255,0.9)" }}>
                  <button type="button" onClick={() => setActiveView(activeView)}>{activeView.name}</button>
                  <button type="button" onClick={() => duplicateView(activeView)} style={{ color: "rgba(255,255,255,0.4)" }}>
                    <Copy size={11} />
                  </button>
                  <button type="button" onClick={() => renameView(activeView.id)} style={{ color: "rgba(255,255,255,0.4)" }}>
                    <Pencil size={11} />
                  </button>
                  <button type="button" onClick={() => removeView(activeView.id)} style={{ color: "rgba(255,107,107,0.72)" }}>
                    <Trash2 size={11} />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 text-[15px] font-medium" style={{ color: "rgba(255,255,255,0.72)" }}>
                <button
                  type="button"
                  onClick={createView}
                  className="px-1 py-4"
                >
                  <Plus size={13} className="mr-1 inline" />
                  新建视图
                </button>
              </div>
            </div>
          </div>

          <div className="relative flex items-center gap-4 border-b px-6 py-2.5" style={{ borderColor: "rgba(255,255,255,0.05)", background: "#211D1B" }}>
            <button
              type="button"
              onClick={() => setShowFilterMenu((prev) => !prev)}
              className="text-sm"
              style={{ color: "rgba(255,255,255,0.62)" }}
            >
              筛选
              <span className="ml-1 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[11px]" style={{ background: "rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.72)" }}>
                2
              </span>
            </button>
            <button
              type="button"
              onClick={() => setShowColumnMenu((prev) => !prev)}
              className="text-sm"
              style={{ color: "rgba(255,255,255,0.62)" }}
            >
              列设置
            </button>
            <button
              type="button"
              onClick={() => setSortDirection((prev) => (prev === "none" ? "desc" : prev === "desc" ? "asc" : "none"))}
              className="text-sm"
              style={{ color: "rgba(255,255,255,0.62)" }}
            >
              时长 {sortDirection === "asc" ? "↑" : sortDirection === "desc" ? "↓" : ""}
            </button>

            {showFilterMenu && (
              <div
                className="absolute left-6 top-full z-20 mt-2 w-[320px] rounded-[24px] border p-4"
                style={{ background: "#1B140E", borderColor: "rgba(255,255,255,0.08)" }}
              >
                <div className="mb-3 text-sm font-semibold">筛选</div>
                <div className="space-y-2 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                  <div className="rounded-2xl border px-3 py-2" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    画面进度：支持等于 / 不等于 / 包含 / 不包含 / 为空 / 不为空
                  </div>
                  <div className="rounded-2xl border px-3 py-2" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    时长：支持大于 / 小于 / 等于
                  </div>
                  <div className="rounded-2xl border px-3 py-2" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    负责人：支持成员筛选
                  </div>
                </div>
              </div>
            )}

            {showColumnMenu && (
              <div
                className="absolute left-[96px] top-full z-20 mt-2 w-[240px] rounded-[24px] border p-3"
                style={{ background: "#1B140E", borderColor: "rgba(255,255,255,0.08)" }}
              >
                <div className="mb-2 text-sm font-semibold">列设置</div>
                {configuredColumns.map((columnKey) => {
                  const column = ALL_COLUMNS.find((item) => item.key === columnKey);
                  if (!column) return null;
                  const visible = visibleMap[columnKey];
                  return (
                    <button
                      key={column.key}
                      type="button"
                      onClick={() => toggleColumn(column.key)}
                      className="flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-xs"
                      style={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      <span>{column.label}</span>
                      <span
                        className="flex h-4 w-4 items-center justify-center rounded"
                        style={{
                          background: visible ? "#E87322" : "rgba(255,255,255,0.08)",
                          color: visible ? "white" : "transparent",
                        }}
                      >
                        <Check size={10} />
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            <div
              ref={tableRef}
              className="overflow-auto"
              style={{ background: "#12100F" }}
            >
              <div
                className="grid min-w-max"
                style={{
                  gridTemplateColumns: `36px 68px ${visibleColumns.map((column) => `${column.width}px`).join(" ")} 64px`,
                }}
              >
                <div
                  className="sticky left-0 top-0 z-10 flex h-9 items-center justify-center border-b border-r"
                  style={{ borderColor: "rgba(255,255,255,0.12)", background: "#0B0B0A", color: "rgba(255,255,255,0.28)" }}
                >
                  ○
                </div>
                <div
                  className="sticky top-0 z-10 flex h-9 items-center justify-center border-b border-r"
                  style={{ borderColor: "rgba(255,255,255,0.12)", background: "#0B0B0A", color: "rgba(255,255,255,0.28)" }}
                >
                  
                </div>
                {visibleColumns.map((column) => (
                  <div
                    key={column.key}
                    className="flex h-9 items-center gap-1 border-b border-r px-3"
                    draggable
                    onDragStart={() => setDraggedColumn(column.key)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => moveColumn(column.key)}
                    style={{ borderColor: "rgba(255,255,255,0.12)", background: "#0B0B0A", color: "rgba(255,255,255,0.86)" }}
                  >
                    <span className="text-[13px]">{column.label}</span>
                    {(column.key === "videoAssets" || column.key === "duration") && (
                      <ChevronDown size={11} style={{ color: "rgba(255,255,255,0.72)" }} />
                    )}
                  </div>
                ))}
                <div
                  className="flex h-9 items-center justify-center border-b"
                  style={{ borderColor: "rgba(255,255,255,0.12)", background: "#0B0B0A", color: "rgba(255,255,255,0.3)" }}
                >
                  
                </div>

                {filteredPanels.length === 0 && (
                  <div
                    className="col-span-full flex flex-col items-center justify-center gap-3 px-6 py-16"
                    style={{ color: "rgba(255,255,255,0.28)" }}
                  >
                    <Film size={28} />
                    <span className="text-sm">暂无数据</span>
                  </div>
                )}

                {filteredPanels.map((panel) => (
                  <FragmentRow
                    key={panel.id}
                    panel={panel}
                    selected={selectedRowId === panel.id}
                    visibleColumns={visibleColumns}
                    editingCell={editingCell}
                    editingValue={editingValue}
                    setEditingValue={setEditingValue}
                    setEditingCell={setEditingCell}
                    startEdit={startEdit}
                    commitEdit={commitEdit}
                    setSelectedRowId={setSelectedRowId}
                    setProgressMenu={setProgressMenu}
                    progressMenu={progressMenu}
                    setProgressValue={setProgressValue}
                    openReview={(kind, assetIndex) => setReviewTarget({ panel, kind, assetIndex })}
                    duplicatePanel={duplicatePanel}
                    deletePanel={deletePanel}
                    updatePanel={updatePanel}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <ShareProjectDialog
        open={showShareModal}
        onOpenChange={setShowShareModal}
        episodes={episodes}
        customViews={customViews}
      />
      <UploadScriptDialog open={showUploadDialog} onOpenChange={setShowUploadDialog} />
      <StoryReviewDialog
        open={!!reviewTarget}
        onOpenChange={(open) => {
          if (!open) setReviewTarget(null);
        }}
        panel={reviewTarget?.panel ?? null}
        kind={reviewTarget?.kind ?? "image"}
        initialAssetIndex={reviewTarget?.assetIndex ?? 0}
        episodeName={activeEpisode?.name ?? "第1集"}
        sceneName={activeScene?.name ?? "session名称"}
      />
    </>
  );
}

function FragmentRow({
  panel,
  selected,
  visibleColumns,
  editingCell,
  editingValue,
  setEditingValue,
  setEditingCell,
  startEdit,
  commitEdit,
  setSelectedRowId,
  setProgressMenu,
  progressMenu,
  setProgressValue,
  openReview,
  duplicatePanel,
  deletePanel,
  updatePanel,
}: {
  panel: StoryPanel;
  selected: boolean;
  visibleColumns: ColumnConfig[];
  editingCell: { panelId: string; field: ColumnKey } | null;
  editingValue: string;
  setEditingValue: (value: string) => void;
  setEditingCell: (cell: { panelId: string; field: ColumnKey } | null) => void;
  startEdit: (panel: StoryPanel, field: ColumnKey) => void;
  commitEdit: () => void;
  setSelectedRowId: (value: string | null) => void;
  setProgressMenu: (value: { panelId: string; field: "imageProgress" | "videoProgress" } | null) => void;
  progressMenu: { panelId: string; field: "imageProgress" | "videoProgress" } | null;
  setProgressValue: (
    panelId: string,
    field: "imageProgress" | "videoProgress",
    value: ProgressState,
  ) => void;
  openReview: (kind: AssetKind, assetIndex: number) => void;
  duplicatePanel: (panelId: string) => void;
  deletePanel: (panelId: string) => void;
  updatePanel: (panelId: string, updater: (panel: StoryPanel) => StoryPanel) => void;
}) {
  const leftActionSymbol = selected ? "✓" : panel.rowNo === 1 ? "+" : panel.rowNo === 2 ? "" : "+";

  const renderEditableInput = (field: ColumnKey, value: string) => (
    <input
      autoFocus
      value={editingValue}
      onChange={(event) => setEditingValue(event.target.value)}
      onBlur={commitEdit}
      onKeyDown={(event) => {
        if (event.key === "Enter") commitEdit();
        if (event.key === "Escape") setEditingCell(null);
      }}
      className="w-full rounded-xl border bg-transparent px-3 py-2 text-xs outline-none"
      style={{ borderColor: "rgba(232,115,34,0.32)", color: "rgba(255,255,255,0.84)" }}
      aria-label={field}
    />
  );

  return (
    <>
      <div
        className="sticky left-0 z-[1] flex items-start justify-center border-b border-r pt-3"
        style={{
          borderColor: "rgba(255,255,255,0.12)",
          background: "#12100F",
          color: selected ? "#FF8A33" : "rgba(255,255,255,0.56)",
          minHeight: "158px",
        }}
        onClick={() => setSelectedRowId(selected ? null : panel.id)}
      >
        <div
          className="flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-semibold"
          style={{
            borderColor: selected ? "#FF8A33" : "rgba(255,255,255,0.22)",
            background: leftActionSymbol ? "rgba(255,255,255,0.04)" : "transparent",
          }}
        >
          {leftActionSymbol}
        </div>
      </div>

      <div
        className="flex items-center justify-center border-b border-r"
        style={{
          borderColor: "rgba(255,255,255,0.12)",
          background: "#12100F",
          minHeight: "158px",
        }}
      >
        <span className="text-sm" style={{ color: "rgba(255,255,255,0.72)" }}>
          {panel.rowNo}
        </span>
      </div>

      {visibleColumns.map((column) => {
        const isEditing = editingCell?.panelId === panel.id && editingCell.field === column.key;
        return (
          <div
            key={`${panel.id}-${column.key}`}
            className="border-b border-r px-3 py-4"
            style={{
              borderColor: "rgba(255,255,255,0.12)",
              background: "#12100F",
              minHeight: "158px",
            }}
            onDoubleClick={() => startEdit(panel, column.key)}
          >
            {column.key === "sceneNo" &&
              (isEditing ? (
                renderEditableInput(column.key, String(panel.sceneNo))
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="rounded-md border px-3 py-1 text-sm" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.82)" }}>
                    第 {panel.sceneNo} 场
                  </span>
                </div>
              ))}

            {column.key === "shotNo" &&
              (isEditing ? (
                renderEditableInput(column.key, panel.shotNo)
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="rounded-md border px-3 py-1 text-sm" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.82)" }}>
                    {panel.sceneNo}-{panel.shotNo.replace(/^0+/, "") || panel.shotNo}
                  </span>
                </div>
              ))}

            {column.key === "script" &&
              (isEditing ? (
                <textarea
                  autoFocus
                  value={editingValue}
                  onChange={(event) => setEditingValue(event.target.value)}
                  onBlur={commitEdit}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") setEditingCell(null);
                  }}
                  className="h-24 w-full resize-none rounded-xl border bg-transparent px-3 py-2 text-xs outline-none"
                  style={{ borderColor: "rgba(232,115,34,0.32)", color: "rgba(255,255,255,0.84)" }}
                />
              ) : (
                <div className="line-clamp-5 text-[14px] leading-8" style={{ color: "rgba(255,255,255,0.82)" }}>
                  {panel.script}
                </div>
              ))}

            {column.key === "referenceImages" && (
              <div className="space-y-2">
                {panel.referenceImages.length > 0 ? (
                  panel.referenceImages.slice(0, 2).map((src, index) => (
                    <AssetThumb
                      key={`${src}-${index}`}
                      src={src}
                      label={`参考图 ${index + 1}`}
                      meta="本地上传 / 可拖拽"
                      kind="image"
                    />
                  ))
                ) : (
                  <AssetThumb label="上传画面参考" meta="支持本地上传 / 侧边栏拖拽" kind="image" />
                )}
              </div>
            )}

            {column.key === "storyboardImages" && (
              <div className="space-y-2">
                {panel.storyboardImages.length > 0 ? (
                  panel.storyboardImages.slice(0, 2).map((asset, index) => (
                    <AssetThumb
                      key={asset.id}
                      src={asset.src}
                      label={asset.label}
                      meta={asset.countLabel}
                      onClick={() => openReview("image", index)}
                      kind="image"
                    />
                  ))
                ) : (
                  <AssetThumb
                    label="上传分镜图"
                    meta="支持评论、上传、删除、下载"
                    onClick={() => toast.success("请先上传图片")}
                    kind="image"
                  />
                )}
              </div>
            )}

            {column.key === "videoAssets" && (
              <div className="space-y-2">
                {panel.videoAssets.length > 0 ? (
                  panel.videoAssets.slice(0, 2).map((asset, index) => (
                    <AssetThumb
                      key={asset.id}
                      src={asset.src}
                      label={asset.label}
                      meta={asset.countLabel}
                      onClick={() => openReview("video", index)}
                      kind="video"
                    />
                  ))
                ) : (
                  <AssetThumb
                    label="上传分镜视频"
                    meta="支持评论、上传、删除、下载"
                    onClick={() => toast.success("请先上传视频")}
                    kind="video"
                  />
                )}
              </div>
            )}

            {column.key === "dub" &&
              (isEditing ? (
                renderEditableInput(column.key, panel.dub)
              ) : (
                <div className="line-clamp-5 text-[14px] leading-8" style={{ color: panel.dub ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.26)" }}>
                  {panel.dub || "待补充配音文案"}
                </div>
              ))}

            {column.key === "owners" && (
              <div className="flex h-full items-center">
                <MemberAvatars owners={panel.owners} />
              </div>
            )}

            {column.key === "duration" &&
              (isEditing ? (
                renderEditableInput(column.key, String(panel.duration))
              ) : (
                <div className="flex h-full items-center justify-center">
                  <span className="rounded-md border px-3 py-1 text-sm" style={{ borderColor: "rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.82)" }}>
                    {panel.duration}s
                  </span>
                </div>
              ))}

            {column.key === "totalDone" && (
              <button
                type="button"
                onClick={() => updatePanel(panel.id, (current) => ({ ...current, totalDone: !current.totalDone }))}
                className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs"
                style={{
                  background: panel.totalDone ? "rgba(86,196,138,0.14)" : "rgba(255,255,255,0.05)",
                  color: panel.totalDone ? "#56C48A" : "rgba(255,255,255,0.5)",
                }}
              >
                {panel.totalDone ? <CheckSquare size={12} /> : <Check size={12} />}
                {panel.totalDone ? "已勾选" : "未勾选"}
              </button>
            )}

            {column.key === "imageProgress" && (
              <div className="relative inline-flex">
                <ProgressPill
                  value={panel.imageProgress}
                  onClick={() =>
                    setProgressMenu(
                      progressMenu?.panelId === panel.id && progressMenu.field === "imageProgress"
                        ? null
                        : { panelId: panel.id, field: "imageProgress" },
                    )
                  }
                />
                {progressMenu?.panelId === panel.id && progressMenu.field === "imageProgress" && (
                  <div
                    className="absolute left-0 top-full z-20 mt-2 w-28 overflow-hidden rounded-2xl border"
                    style={{ borderColor: "rgba(255,255,255,0.08)", background: "#1C150F" }}
                  >
                    {PROGRESS_ORDER.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setProgressValue(panel.id, "imageProgress", status)}
                        className="flex w-full items-center justify-between px-3 py-2 text-xs"
                        style={{ color: panel.imageProgress === status ? PROGRESS_META[status].color : "rgba(255,255,255,0.58)" }}
                      >
                        {status}
                        {panel.imageProgress === status && <Check size={11} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {column.key === "videoProgress" && (
              <div className="relative inline-flex">
                <ProgressPill
                  value={panel.videoProgress}
                  onClick={() =>
                    setProgressMenu(
                      progressMenu?.panelId === panel.id && progressMenu.field === "videoProgress"
                        ? null
                        : { panelId: panel.id, field: "videoProgress" },
                    )
                  }
                />
                {progressMenu?.panelId === panel.id && progressMenu.field === "videoProgress" && (
                  <div
                    className="absolute left-0 top-full z-20 mt-2 w-28 overflow-hidden rounded-2xl border"
                    style={{ borderColor: "rgba(255,255,255,0.08)", background: "#1C150F" }}
                  >
                    {PROGRESS_ORDER.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setProgressValue(panel.id, "videoProgress", status)}
                        className="flex w-full items-center justify-between px-3 py-2 text-xs"
                        style={{ color: panel.videoProgress === status ? PROGRESS_META[status].color : "rgba(255,255,255,0.58)" }}
                      >
                        {status}
                        {panel.videoProgress === status && <Check size={11} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {column.key === "notes" &&
              (isEditing ? (
                renderEditableInput(column.key, panel.notes)
              ) : (
                <div className="line-clamp-4 text-[14px] leading-7" style={{ color: panel.notes ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.26)" }}>
                  {panel.notes || "填写备注"}
                </div>
              ))}
          </div>
        );
      })}

      <div
        className="flex items-start justify-center gap-2 border-b px-2 pt-3"
        style={{
          borderColor: "rgba(255,255,255,0.12)",
          background: "#12100F",
          minHeight: "158px",
        }}
      >
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.46)" }}
          onClick={() => duplicatePanel(panel.id)}
          title="复制行"
        >
          <Copy size={11} />
        </button>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.46)" }}
          onClick={() => startEdit(panel, "script")}
          title="编辑"
        >
          <Edit3 size={11} />
        </button>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-full"
          style={{ background: "rgba(255,107,107,0.12)", color: "#F06B6B" }}
          onClick={() => deletePanel(panel.id)}
          title="删除"
        >
          <Trash2 size={11} />
        </button>
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-full"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.38)" }}
          onClick={() => toast.success("右键菜单支持向上/下插入、复制、剪切、粘贴")}
          title="更多"
        >
          <MoreHorizontal size={11} />
        </button>
      </div>
    </>
  );
}
