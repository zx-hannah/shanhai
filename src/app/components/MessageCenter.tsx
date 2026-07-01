import { useMemo, useState } from "react";
import {
  AlertCircle, Bell, CheckCircle2, ChevronDown, Clock, Image as ImageIcon,
  Loader2, MessageSquare, Megaphone, Sparkles, Users, X, Zap, CheckCheck,
} from "lucide-react";
import { LEGACY_OFFLINE_TIME } from "./MigrationPrompts";

type MessageTab = "tasks" | "team" | "official";
type TaskStatus = "completed" | "running" | "pending" | "failed";
type TaskFilter = "全部" | "图片" | "视频";
export type MessageReadIds = Set<string>;

interface MessageCenterProps {
  isTeamSpace: boolean;
  readIds: MessageReadIds;
  setReadIds: React.Dispatch<React.SetStateAction<MessageReadIds>>;
  onClose: () => void;
  onGoMigration: () => void;
}

export const TASK_MESSAGES = [
  { id: "task-1", title: "图片生成中", desc: "专业图片-2", spec: "auto | 1张", time: "13:30", status: "running" as TaskStatus, kind: "图片" as const, thumb: null },
  { id: "task-2", title: "视频完成", desc: "视频生成", spec: "1个", time: "13:28", status: "completed" as TaskStatus, kind: "视频" as const, thumb: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=220&h=160&fit=crop&q=80" },
  { id: "task-3", title: "图片失败", desc: "万能模型pro", spec: "auto | 4张", time: "13:25", status: "failed" as TaskStatus, kind: "图片" as const, thumb: null },
  { id: "task-4", title: "图片完成", desc: "专业图片-2", spec: "16:9 | 2张", time: "13:20", status: "completed" as TaskStatus, kind: "图片" as const, thumb: "https://images.unsplash.com/photo-1557683316-973673baf926?w=220&h=160&fit=crop&q=80" },
  { id: "task-5", title: "视频完成", desc: "视频生成", spec: "1个", time: "13:10", status: "completed" as TaskStatus, kind: "视频" as const, thumb: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=220&h=160&fit=crop&q=80" },
  { id: "task-6", title: "图片完成", desc: "图片生成", spec: "1张", time: "12:58", status: "completed" as TaskStatus, kind: "图片" as const, thumb: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=220&h=160&fit=crop&q=80" },
];

export const TEAM_MESSAGES = [
  { id: "team-1", title: "东方神话·第一季 配额已调整", desc: "Bob 将项目总配额调整为 60,000 颗。", time: "今天 14:20" },
  { id: "team-2", title: "成员权限变更", desc: "Carol 的项目权限已更新为编辑。", time: "昨天 18:12" },
  { id: "team-3", title: "山海奇谭 生成预警", desc: "视频生成消耗较上周增长 32%，建议关注项目成本。", time: "2天前" },
];

export const OFFICIAL_MESSAGES = [
  {
    id: "official-1",
    title: "团队协作新版已上线",
    desc: `团队协作能力将统一在团队空间中使用。旧版团队协作将于 ${LEGACY_OFFLINE_TIME} 停止服务，请在下线前完成个人空间历史项目迁移。`,
    time: "今天",
    action: "前往迁移",
    thumb: "https://images.unsplash.com/photo-1557683316-973673baf926?w=120&h=120&fit=crop&q=80",
  },
  {
    id: "official-2",
    title: "Seedance 2.0 模型限时优惠结束通知",
    desc: "Seedance 2.0 / 2.0 Fast 限时积分折扣优惠即将结束，感谢您的支持。",
    time: "75天前",
    thumb: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=120&h=120&fit=crop&q=80",
  },
  {
    id: "official-3",
    title: "排队优化体验",
    desc: "近期使用量增长较快，我们已优化任务调度策略，整体排队时间将逐步缩短。",
    time: "98天前",
  },
  {
    id: "official-4",
    title: "发票申请提醒",
    desc: "您购买的订单即梦会员，可进入设置中的订阅和发票页面申请开具发票。",
    time: "117天前",
  },
];

const TASK_STATUS_CONFIG: Record<TaskStatus, { icon: typeof CheckCircle2; color: string; label: string }> = {
  completed: { icon: CheckCircle2, color: "#4AC678", label: "已完成" },
  running: { icon: Loader2, color: "#E87322", label: "进行中" },
  pending: { icon: Clock, color: "rgba(255,255,255,0.45)", label: "等待中" },
  failed: { icon: AlertCircle, color: "#ff6b6b", label: "失败" },
};

function CountBadge({ count }: { count: number }) {
  return (
    <span className="ml-1 rounded-full px-1.5 py-0.5 text-[10px]" style={{ background: count > 0 ? "rgba(232,115,34,0.18)" : "rgba(255,255,255,0.06)", color: count > 0 ? "#E87322" : "rgba(255,255,255,0.36)" }}>
      {count}
    </span>
  );
}

export function getMessageUnreadCount(isTeamSpace: boolean, readIds: MessageReadIds) {
  const messages = [
    ...TASK_MESSAGES,
    ...(isTeamSpace ? TEAM_MESSAGES : []),
    ...OFFICIAL_MESSAGES,
  ];
  return messages.filter((message) => !readIds.has(message.id)).length;
}

export function MessageCenter({ isTeamSpace, readIds, setReadIds, onClose, onGoMigration }: MessageCenterProps) {
  const [activeTab, setActiveTab] = useState<MessageTab>("tasks");
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("全部");
  const [taskFilterOpen, setTaskFilterOpen] = useState(false);

  const tabs = useMemo(() => {
    const visible = [
      { key: "tasks" as const, label: "任务队列", icon: Zap, messages: TASK_MESSAGES },
      ...(isTeamSpace ? [{ key: "team" as const, label: "团队消息", icon: Users, messages: TEAM_MESSAGES }] : []),
      { key: "official" as const, label: "官方消息", icon: Megaphone, messages: OFFICIAL_MESSAGES },
    ];
    return visible.map((tab) => ({
      ...tab,
      unreadCount: tab.messages.filter((message) => !readIds.has(message.id)).length,
    }));
  }, [isTeamSpace, readIds]);

  const active = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];

  const markAllRead = () => {
    setReadIds((prev) => {
      const next = new Set(prev);
      tabs.forEach((tab) => tab.messages.forEach((message) => next.add(message.id)));
      return next;
    });
  };

  const totalUnread = tabs.reduce((sum, tab) => sum + tab.unreadCount, 0);
  const visibleTasks = TASK_MESSAGES.filter((task) => taskFilter === "全部" || task.kind === taskFilter);
  const runningTasks = visibleTasks.filter((task) => task.status === "running" || task.status === "pending");
  const completedTasks = visibleTasks.filter((task) => task.status === "completed" || task.status === "failed");

  return (
    <div className="fixed inset-0 z-[220]" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.52)" }} />
      <div
        className="absolute left-[78px] bottom-5 flex h-[680px] max-h-[calc(100vh-40px)] w-[500px] flex-col overflow-hidden rounded-2xl"
        style={{
          background: "linear-gradient(180deg, #1F1812 0%, #15100B 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 90px rgba(0,0,0,0.58)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pb-3 pt-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell size={18} style={{ color: "#E87322" }} />
              <h2 className="text-2xl font-semibold text-white">消息中心</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] transition-colors hover:bg-white/5"
                style={{ color: totalUnread > 0 ? "#E87322" : "rgba(255,255,255,0.36)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <CheckCheck size={12} />
                全部已读
              </button>
              <button onClick={onClose} className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5" style={{ color: "rgba(255,255,255,0.5)" }}>
                <X size={14} />
              </button>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-3 gap-1.5">
              {tabs.map(({ key, label, icon: Icon, unreadCount }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className="flex items-center justify-center gap-1 rounded-xl px-2 py-1.5 text-xs transition-colors"
                  style={{
                    background: activeTab === key ? "rgba(255,255,255,0.1)" : "transparent",
                    color: activeTab === key ? "#FFFFFF" : "rgba(255,255,255,0.45)",
                    border: activeTab === key ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
                  }}
                >
                  <Icon size={13} />
                  {label}
                  {unreadCount > 0 && <CountBadge count={unreadCount} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-5 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {activeTab === "tasks" ? (
            <div className="pb-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.42)" }}>任务状态</div>
                <div className="relative">
                  <button
                    onClick={() => setTaskFilterOpen((prev) => !prev)}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs"
                    style={{ background: "rgba(255,255,255,0.08)", color: "#fff" }}
                  >
                    {taskFilter} <ChevronDown size={12} />
                  </button>
                  {taskFilterOpen && (
                    <div className="absolute right-0 top-full z-10 mt-2 w-32 rounded-xl p-1.5" style={{ background: "#2A2723", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 18px 40px rgba(0,0,0,0.36)" }}>
                      {(["全部", "图片", "视频"] as TaskFilter[]).map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setTaskFilter(option);
                            setTaskFilterOpen(false);
                          }}
                          className="w-full rounded-lg px-3 py-2 text-left text-sm"
                          style={{ background: taskFilter === option ? "rgba(255,255,255,0.12)" : "transparent", color: "#fff" }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <TaskSection title="进行中" tasks={runningTasks} readIds={readIds} setReadIds={setReadIds} />
              <TaskSection title="已完成" tasks={completedTasks} readIds={readIds} setReadIds={setReadIds} />
            </div>
          ) : (
          <div className="flex flex-col">
            {active.messages.map((message) => {
              const read = readIds.has(message.id);
              const thumb = "thumb" in message ? message.thumb : undefined;

              return (
                <button
                  key={message.id}
                  onClick={() => setReadIds((prev) => new Set(prev).add(message.id))}
                  className="flex gap-3 py-3 text-left transition-colors hover:bg-white/[0.03]"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <div className="relative mt-1 h-9 w-9 flex-shrink-0 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      {active.key === "team" ? (
                        <MessageSquare size={15} style={{ color: "#4A9EE0" }} />
                      ) : (
                        <Megaphone size={15} style={{ color: "#E87322" }} />
                      )}
                    {!read && <span className="absolute right-0 top-0 h-2 w-2 rounded-full" style={{ background: "#E87322", border: "2px solid #1E1711" }} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-semibold" style={{ color: "#FFFFFF" }}>{message.title}</div>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5" style={{ color: "rgba(255,255,255,0.52)" }}>{message.desc}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{message.time}</span>
                      {"action" in message && message.action && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setReadIds((prev) => new Set(prev).add(message.id));
                            onGoMigration();
                          }}
                          className="rounded-lg px-2.5 py-0.5 text-xs"
                          style={{ color: "#E87322", background: "rgba(232,115,34,0.1)" }}
                        >
                          {message.action}
                        </span>
                      )}
                    </div>
                  </div>
                  {thumb && (
                    <img src={thumb} alt="" className="mt-1 h-12 w-12 flex-shrink-0 rounded-lg object-cover" />
                  )}
                </button>
              );
            })}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TaskSection({
  title,
  tasks,
  readIds,
  setReadIds,
}: {
  title: string;
  tasks: typeof TASK_MESSAGES;
  readIds: Set<string>;
  setReadIds: React.Dispatch<React.SetStateAction<MessageReadIds>>;
}) {
  if (tasks.length === 0) return null;

  return (
    <div className="mb-6">
      <div className="mb-2 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{title}</div>
      <div className="flex flex-col gap-2.5">
        {tasks.map((task) => {
          const status = TASK_STATUS_CONFIG[task.status];
          const StatusIcon = status.icon;
          const read = readIds.has(task.id);
          return (
            <button
              key={task.id}
              onClick={() => setReadIds((prev) => new Set(prev).add(task.id))}
              className="relative flex items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/[0.04]"
            >
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg" style={{ background: "rgba(255,255,255,0.08)" }}>
                {task.thumb ? (
                  <img src={task.thumb} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon size={24} style={{ color: "rgba(255,255,255,0.28)" }} />
                  </div>
                )}
                {!read && <span className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full" style={{ background: "#E87322", boxShadow: "0 0 0 2px rgba(0,0,0,0.45)" }} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white">{task.title}</div>
                <div className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.68)" }}>{task.desc}</div>
                <div className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.82)" }}>{task.spec}</div>
              </div>
              <StatusIcon
                size={16}
                style={{
                  color: status.color,
                  animation: task.status === "running" ? "spin 1s linear infinite" : undefined,
                  flexShrink: 0,
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
