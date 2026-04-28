// 右上角任务队列面板
import { useState } from "react";
import { ChevronUp, ChevronDown, X, Zap, PenTool, CheckCircle2, Loader2, Clock, AlertCircle } from "lucide-react";

type TaskModule = "generate" | "canvas";
type TaskStatus = "completed" | "running" | "pending" | "failed";

interface TaskItem {
  id: string;
  title: string;
  time: string;
  module: TaskModule;
  status: TaskStatus;
  project?: string;
  thumbnail: string | null;
}

const MOCK_TASKS: TaskItem[] = [
  { id: "1", title: "图片生成 · 古风女侠立绘 v3", time: "13:30:12", module: "generate", status: "completed", project: "东方神话", thumbnail: null },
  { id: "2", title: "视频生成 · 第三集分镜渲染", time: "13:28:45", module: "generate", status: "completed", project: "东方神话", thumbnail: null },
  { id: "3", title: "画布创作 · 人物概念图布局", time: "13:25:30", module: "canvas", status: "running", project: "星际征途", thumbnail: null },
  { id: "4", title: "图片生成 · 仙境云海背景", time: "13:22:15", module: "generate", status: "pending", project: "山海奇谭", thumbnail: null },
  { id: "5", title: "画布创作 · 故事板场景拼接", time: "13:20:00", module: "canvas", status: "pending", project: "东方神话", thumbnail: null },
  { id: "6", title: "图片生成 · 神兽貔貅精绘", time: "13:15:44", module: "generate", status: "failed", project: "山海奇谭", thumbnail: null },
  { id: "7", title: "视频生成 · 片头动画输出", time: "13:10:22", module: "generate", status: "completed", project: "龙族传说", thumbnail: null },
  { id: "8", title: "画布创作 · 概念稿排版", time: "13:05:08", module: "canvas", status: "completed", project: "动画短片集", thumbnail: null },
];

const MODULE_CONFIG: Record<TaskModule, { label: string; color: string; Icon: typeof Zap }> = {
  generate: { label: "生成", color: "#E87322", Icon: Zap },
  canvas:   { label: "画布", color: "#7B3FC4", Icon: PenTool },
};

const STATUS_CONFIG: Record<TaskStatus, { icon: typeof CheckCircle2; color: string; label: string }> = {
  completed: { icon: CheckCircle2, color: "#4AC678", label: "已完成" },
  running:   { icon: Loader2,      color: "#E87322", label: "进行中" },
  pending:   { icon: Clock,        color: "rgba(255,255,255,0.35)", label: "等待中" },
  failed:    { icon: AlertCircle,  color: "#ef4444", label: "失败" },
};

interface TaskQueueProps {
  onClose: () => void;
}

export function TaskQueue({ onClose }: TaskQueueProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [tasks] = useState<TaskItem[]>(MOCK_TASKS);

  const completedCount = tasks.filter(t => t.status === "completed").length;
  const runningCount = tasks.filter(t => t.status === "running").length;
  const totalCount = tasks.length;

  return (
    <div
      className="fixed z-[200] flex flex-col rounded-2xl overflow-hidden"
      style={{
        top: "16px",
        right: "16px",
        width: "320px",
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(50px)",
        WebkitBackdropFilter: "blur(50px)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "inset 0 0 12px 0 rgba(255,255,255,0.08), 0 24px 60px rgba(0,0,0,0.7)",
        maxHeight: collapsed ? "48px" : "480px",
        transition: "max-height 0.3s ease",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          {runningCount > 0 ? (
            <Loader2 size={14} style={{ color: "#E87322", animation: "spin 1s linear infinite" }} />
          ) : (
            <CheckCircle2 size={14} style={{ color: "#4AC678" }} />
          )}
          <span className="text-sm text-white">
            {runningCount > 0 ? `${runningCount} 个任务进行中` : `${completedCount}/${totalCount} 已完成`}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          </button>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Task List */}
      {!collapsed && (
        <div className="flex-1 overflow-auto px-3 pb-3 flex flex-col gap-2">
          {tasks.map((task) => {
            const mod = MODULE_CONFIG[task.module];
            const ModIcon = mod.Icon;
            const st = STATUS_CONFIG[task.status];
            const StIcon = st.icon;
            return (
              <div
                key={task.id}
                className="flex items-center gap-2.5 p-2 rounded-xl"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                {/* Thumbnail */}
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative">
                  <img
                    src={imgThumb}
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ opacity: task.status === "pending" ? 0.4 : 0.85 }}
                  />
                  {/* Module badge overlay */}
                  <div
                    className="absolute bottom-0 right-0 flex items-center justify-center rounded-tl-md"
                    style={{ background: mod.color, width: "14px", height: "14px" }}
                  >
                    <ModIcon size={8} style={{ color: "white" }} />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: `${mod.color}18`, color: mod.color, fontSize: "9px" }}
                    >
                      {mod.label}
                    </span>
                    {task.project && (
                      <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)" }}>{task.project}</span>
                    )}
                  </div>
                  <p
                    className="text-xs truncate"
                    style={{ color: task.status === "pending" ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.8)" }}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <StIcon
                      size={9}
                      style={{
                        color: st.color,
                        animation: task.status === "running" ? "spin 1s linear infinite" : undefined,
                      }}
                    />
                    <span style={{ fontSize: "10px", color: st.color }}>{st.label}</span>
                    <span className="ml-auto" style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>
                      {task.time}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Running progress bar */}
      {runningCount > 0 && !collapsed && (
        <div
          className="h-0.5 flex-shrink-0 overflow-hidden"
          style={{ background: "rgba(255,255,255,0.07)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${(completedCount / totalCount) * 100}%`,
              background: "linear-gradient(90deg,#E87322,#F5A623)",
              transition: "width 0.5s",
            }}
          />
        </div>
      )}
    </div>
  );
}
