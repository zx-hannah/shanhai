import { useMemo, useState } from "react";
import { AlertTriangle, Check, CheckCircle, Clock, Coins, KeyRound, Search, X, XCircle } from "lucide-react";
import { toast } from "sonner";

type ApprovalStatus = "待审批" | "已通过" | "已拒绝";
type ApprovalType = "生产栗申请" | "权限申请";
type FilterOption<T extends string> = "全部" | T;

interface ApprovalItem {
  id: string;
  type: ApprovalType;
  applicant: string;
  title: string;
  reason: string;
  applyTime: string;
  status: ApprovalStatus;
  amount?: number;
}

const TEAM_ASSIGNABLE_QUOTA = 150;

const INITIAL_APPROVALS: ApprovalItem[] = [
  {
    id: "1",
    type: "生产栗申请",
    applicant: "Charlie",
    title: "申请个人生产栗 200 颗",
    reason: "近期项目任务较多，需要额外生产栗完成素材生成工作",
    applyTime: "2024-04-01 10:30",
    status: "待审批",
    amount: 200,
  },
  {
    id: "2",
    type: "权限申请",
    applicant: "Diana",
    title: "申请「新品发布会」项目编辑权限",
    reason: "需要整理素材消耗明细并修改项目内容",
    applyTime: "2024-03-31 18:40",
    status: "待审批",
  },
  {
    id: "3",
    type: "生产栗申请",
    applicant: "Alice",
    title: "申请项目额度「品牌视觉重塑」500 颗",
    reason: "项目最后阶段需要大量视频超分处理",
    applyTime: "2024-03-31 16:00",
    status: "已通过",
    amount: 500,
  },
  {
    id: "4",
    type: "权限申请",
    applicant: "Bob",
    title: "申请「品牌视觉重塑」项目管理权限",
    reason: "项目进入交付阶段，需要协调成员与验收内容",
    applyTime: "2024-03-30 14:20",
    status: "已拒绝",
  },
  {
    id: "5",
    type: "生产栗申请",
    applicant: "Charlie",
    title: "申请「新品发布会」100 颗生产栗",
    reason: "测试新功能需要消耗生产栗",
    applyTime: "2024-03-28 11:00",
    status: "已通过",
    amount: 100,
  },
];

const TYPE_OPTIONS: ApprovalType[] = ["生产栗申请", "权限申请"];
const STATUS_OPTIONS: ApprovalStatus[] = ["待审批", "已通过", "已拒绝"];

const STATUS_CONFIG: Record<ApprovalStatus, { color: string; icon: typeof Clock; bg: string; border: string }> = {
  待审批: { color: "#E87322", icon: Clock, bg: "rgba(232,115,34,0.14)", border: "rgba(232,115,34,0.32)" },
  已通过: { color: "#22c55e", icon: CheckCircle, bg: "rgba(34,197,94,0.11)", border: "rgba(34,197,94,0.24)" },
  已拒绝: { color: "#ef4444", icon: XCircle, bg: "rgba(239,68,68,0.11)", border: "rgba(239,68,68,0.24)" },
};

const TYPE_CONFIG: Record<ApprovalType, { color: string; bg: string; icon: typeof Coins }> = {
  生产栗申请: { color: "#E87322", bg: "rgba(232,115,34,0.12)", icon: Coins },
  权限申请: { color: "#8B5CF6", bg: "rgba(139,92,246,0.13)", icon: KeyRound },
};

const APPLICANT_META: Record<string, { letter: string; color: string }> = {
  Bob: { letter: "B", color: "#E87322" },
  Alice: { letter: "A", color: "#7B3FC4" },
  Charlie: { letter: "C", color: "#2A6FC4" },
  Diana: { letter: "D", color: "#C42A6F" },
};

function FilterGroup<T extends string>({
  label,
  value,
  options,
  counts,
  onChange,
  getActiveColor,
}: {
  label: string;
  value: FilterOption<T>;
  options: readonly T[];
  counts: Record<FilterOption<T>, number>;
  onChange: (value: FilterOption<T>) => void;
  getActiveColor: (value: T) => string;
}) {
  return (
    <div>
      <div className="text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</div>
      <div className="flex gap-1 p-1 rounded-xl flex-wrap" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {(["全部", ...options] as FilterOption<T>[]).map(option => {
          const isActive = value === option;
          const activeColor = option === "全部" ? "#fff" : getActiveColor(option);

          return (
            <button
              key={option}
              onClick={() => onChange(option)}
              className="px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap"
              style={{
                background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                color: isActive ? activeColor : "rgba(255,255,255,0.5)",
                fontWeight: isActive ? "500" : "normal",
              }}
            >
              <span>{option}</span>
              <span
                className="ml-1.5 px-1.5 rounded-full"
                style={{
                  background: isActive ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)",
                  color: isActive ? activeColor : "rgba(255,255,255,0.4)",
                  fontSize: "11px",
                }}
              >
                {counts[option]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ApprovalManagement() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVALS);
  const [typeFilter, setTypeFilter] = useState<FilterOption<ApprovalType>>("全部");
  const [statusFilter, setStatusFilter] = useState<FilterOption<ApprovalStatus>>("全部");
  const [rejectTarget, setRejectTarget] = useState<ApprovalItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = useMemo(() => approvals.filter(item => {
    const typeMatch = typeFilter === "全部" || item.type === typeFilter;
    const statusMatch = statusFilter === "全部" || item.status === statusFilter;

    return typeMatch && statusMatch;
  }), [approvals, statusFilter, typeFilter]);

  const typeCounts: Record<FilterOption<ApprovalType>, number> = {
    全部: approvals.length,
    生产栗申请: approvals.filter(item => item.type === "生产栗申请").length,
    权限申请: approvals.filter(item => item.type === "权限申请").length,
  };
  const statusCounts: Record<FilterOption<ApprovalStatus>, number> = {
    全部: approvals.length,
    待审批: approvals.filter(item => item.status === "待审批").length,
    已通过: approvals.filter(item => item.status === "已通过").length,
    已拒绝: approvals.filter(item => item.status === "已拒绝").length,
  };

  const handleApprove = (id: string) => {
    const target = approvals.find(item => item.id === id);
    if (target?.type === "生产栗申请" && (target.amount ?? 0) > TEAM_ASSIGNABLE_QUOTA) {
      toast.error(`当前可分配额度仅剩 ${TEAM_ASSIGNABLE_QUOTA.toLocaleString()} 颗，无法通过 ${target.amount?.toLocaleString()} 颗的申请`);
      return;
    }
    setApprovals(prev => prev.map(item => item.id === id ? { ...item, status: "已通过" } : item));
    toast.success("已批准申请");
  };

  const handleReject = () => {
    if (!rejectTarget) return;
    setApprovals(prev => prev.map(item => item.id === rejectTarget.id ? { ...item, status: "已拒绝" } : item));
    setRejectTarget(null);
    setRejectReason("");
    toast.success("已拒绝申请");
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-white">审批管理</h3>
          <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: "rgba(255,255,255,0.42)" }}>
            <Coins size={12} style={{ color: "#E87322" }} />
            团队当前可分配额度：<span style={{ color: "#E87322", fontWeight: 600 }}>{TEAM_ASSIGNABLE_QUOTA.toLocaleString()} 颗</span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 mb-5 flex-wrap">
        <FilterGroup
          label="申请类型"
          value={typeFilter}
          options={TYPE_OPTIONS}
          counts={typeCounts}
          onChange={setTypeFilter}
          getActiveColor={(value) => TYPE_CONFIG[value].color}
        />
        <FilterGroup
          label="审批状态"
          value={statusFilter}
          options={STATUS_OPTIONS}
          counts={statusCounts}
          onChange={setStatusFilter}
          getActiveColor={(value) => STATUS_CONFIG[value].color}
        />
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl text-center py-12" style={{ color: "rgba(255,255,255,0.34)", background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.12)" }}>
            <Search size={22} className="mx-auto mb-2" />
            当前筛选下暂无审批记录
          </div>
        )}

        {filtered.map(item => {
          const statusCfg = STATUS_CONFIG[item.status];
          const StatusIcon = statusCfg.icon;
          const typeCfg = TYPE_CONFIG[item.type];
          const TypeIcon = typeCfg.icon;
          const applicantMeta = APPLICANT_META[item.applicant] ?? { letter: item.applicant.slice(0, 1), color: "#4A9EE0" };
          const quotaInsufficient = item.status === "待审批" && item.type === "生产栗申请" && (item.amount ?? 0) > TEAM_ASSIGNABLE_QUOTA;

          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))",
                border: item.status === "待审批" ? "1px solid rgba(232,115,34,0.22)" : "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-2 flex-wrap flex-1">
                  <span className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5" style={{ background: typeCfg.bg, color: typeCfg.color }}>
                    <TypeIcon size={11} />
                    {item.type}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: statusCfg.bg, border: `1px solid ${statusCfg.border}` }}>
                  <StatusIcon size={12} style={{ color: statusCfg.color }} />
                  <span className="text-xs" style={{ color: statusCfg.color }}>{item.status}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm text-white flex-shrink-0"
                  style={{ background: applicantMeta.color, fontWeight: 600 }}
                >
                  {applicantMeta.letter}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-sm text-white">{item.applicant}</span>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.34)" }}>{item.applyTime}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-base text-white">{item.title}</span>
                  </div>
                  <div className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.55)" }}>
                    <span style={{ color: "rgba(255,255,255,0.35)" }}>备注：</span>{item.reason}
                  </div>
                  {quotaInsufficient && (
                    <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(239,68,68,0.09)", border: "1px solid rgba(239,68,68,0.22)", color: "#ff9b9b" }}>
                      <AlertTriangle size={13} style={{ color: "#ef4444", flexShrink: 0 }} />
                      <span className="text-xs">
                        额度不足：当前最多可通过 {TEAM_ASSIGNABLE_QUOTA.toLocaleString()} 颗
                      </span>
                    </div>
                  )}
                </div>

                {item.status === "待审批" && (
                  <div className="flex gap-2 flex-shrink-0 mt-1">
                    <button
                      onClick={() => { setRejectTarget(item); setRejectReason(""); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-opacity hover:opacity-80"
                      style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
                    >
                      <X size={12} />
                      拒绝
                    </button>
                    <button
                      onClick={() => handleApprove(item.id)}
                      disabled={quotaInsufficient}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white transition-opacity hover:opacity-80"
                      style={{ background: quotaInsufficient ? "rgba(255,255,255,0.1)" : "#22c55e", color: quotaInsufficient ? "rgba(255,255,255,0.32)" : "#fff", cursor: quotaInsufficient ? "not-allowed" : "pointer" }}
                    >
                      <Check size={12} />
                      批准
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-96 rounded-2xl p-6 shadow-2xl" style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h3 className="text-white mb-4">拒绝申请</h3>
            <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
              请填写拒绝原因（可选），将通知申请人 <strong className="text-white">{rejectTarget.applicant}</strong>
            </p>
            <textarea
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="请输入拒绝原因..."
              className="w-full px-3 py-2 rounded-xl outline-none text-sm text-white resize-none mb-4"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", minHeight: "80px" }}
              onFocus={(event) => { event.currentTarget.style.borderColor = "#E87322"; }}
              onBlur={(event) => { event.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRejectTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
              >
                取消
              </button>
              <button
                onClick={handleReject}
                className="flex-1 py-2.5 rounded-xl text-sm text-white transition-opacity hover:opacity-80"
                style={{ background: "#ef4444" }}
              >
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
