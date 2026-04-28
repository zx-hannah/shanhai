import { useState } from "react";
import { Check, X, Clock, CheckCircle, XCircle, Coins, Shield, FolderOpen } from "lucide-react";
import { toast } from "sonner";

type ApprovalStatus = "待审批" | "已通过" | "已拒绝";
type ApprovalType = "生产栗申请" | "权限申请";

interface ApprovalItem {
  id: string;
  type: ApprovalType;
  subType: "团队" | "项目";
  applicant: string;
  applicantColor: string;
  applicantLetter: string;
  target?: string;
  amount?: number;
  permission?: string;
  reason: string;
  applyTime: string;
  status: ApprovalStatus;
}

const INITIAL_APPROVALS: ApprovalItem[] = [
  { id: "1", type: "生产栗申请", subType: "团队", applicant: "Charlie", applicantColor: "#2A6FC4", applicantLetter: "C", amount: 200, reason: "近期项目任务较多，需要额外生产栗完成图片生成工作", applyTime: "2024-04-01 10:30", status: "待审批" },
  { id: "3", type: "生产栗申请", subType: "项目", applicant: "Alice", applicantColor: "#7B3FC4", applicantLetter: "A", target: "品牌视觉重塑", amount: 500, reason: "项目最后阶段需要大量视频超分处理", applyTime: "2024-03-31 16:00", status: "已通过" },
  { id: "4", type: "权限申请", subType: "团队", applicant: "Diana", applicantColor: "#C42A6F", applicantLetter: "D", permission: "数据导出权限", reason: "", applyTime: "2024-03-30 14:20", status: "已拒绝" },
  { id: "5", type: "生产栗申请", subType: "项目", applicant: "Charlie", applicantColor: "#2A6FC4", applicantLetter: "C", target: "新品发布会", amount: 100, reason: "测试新功能需要消耗生产栗", applyTime: "2024-03-28 11:00", status: "已通过" },
];

const STATUS_CONFIG: Record<ApprovalStatus, { color: string; icon: any; bg: string }> = {
  "待审批": { color: "#E87322", icon: Clock, bg: "rgba(232,115,34,0.15)" },
  "已通过": { color: "#22c55e", icon: CheckCircle, bg: "rgba(34,197,94,0.12)" },
  "已拒绝": { color: "#ef4444", icon: XCircle, bg: "rgba(239,68,68,0.12)" },
};

const TYPE_CONFIG: Record<ApprovalType, { color: string; bg: string }> = {
  "生产栗申请": { color: "#E87322", bg: "rgba(232,115,34,0.12)" },
  "权限申请": { color: "#7B3FC4", bg: "rgba(123,63,196,0.12)" },
};

export function ApprovalManagement() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVALS);
  const [typeFilter, setTypeFilter] = useState<"全部" | ApprovalType>("全部");
  const [statusFilter, setStatusFilter] = useState<"全部" | ApprovalStatus>("全部");
  const [rejectTarget, setRejectTarget] = useState<ApprovalItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // 过滤掉项目权限申请
  const filtered = approvals.filter(a => {
    if (a.type === "权限申请" && a.subType === "项目") return false;
    const typeMatch = typeFilter === "全部" || a.type === typeFilter;
    const statusMatch = statusFilter === "全部" || a.status === statusFilter;
    return typeMatch && statusMatch;
  });

  const pendingCount = approvals.filter(a => a.status === "待审批").length;

  const handleApprove = (id: string) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: "已通过" } : a));
    toast.success("已批准申请");
  };

  const handleReject = () => {
    if (!rejectTarget) return;
    setApprovals(prev => prev.map(a => a.id === rejectTarget.id ? { ...a, status: "已拒绝" } : a));
    setRejectTarget(null);
    setRejectReason("");
    toast.success("已拒绝申请");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h3 className="text-white">审批管理</h3>
          {pendingCount > 0 && (
            <span className="text-xs px-2.5 py-0.5 rounded-full text-white" style={{ background: "#E87322" }}>
              {pendingCount} 待处理
            </span>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "待审批", count: approvals.filter(a => a.status === "待审批").length, color: "#E87322", bg: "rgba(232,115,34,0.1)", border: "rgba(232,115,34,0.25)" },
          { label: "已通过", count: approvals.filter(a => a.status === "已通过").length, color: "#22c55e", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)" },
          { label: "已拒绝", count: approvals.filter(a => a.status === "已拒绝").length, color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)" },
        ].map(({ label, count, color, bg, border }) => (
          <div key={label} className="p-4 rounded-xl flex items-center gap-3" style={{ background: bg, border: `1px solid ${border}` }}>
            <div className="text-3xl text-white">{count}</div>
            <div className="text-sm" style={{ color }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {/* Type filter */}
        {/*
        <div>
          <div className="text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>申请类型</div>
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {(["全部", "生产栗申请", "权限申请"] as const).map(type => (
              <button key={type} onClick={() => setTypeFilter(type)}
                className="px-3 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap"
                style={{
                  background: typeFilter === type ? TYPE_CONFIG[type as ApprovalType]?.bg || "rgba(255,255,255,0.1)" : "transparent",
                  color: typeFilter === type
                    ? (TYPE_CONFIG[type as ApprovalType]?.color || "#fff")
                    : "rgba(255,255,255,0.5)",
                  fontWeight: typeFilter === type ? "500" : "normal",
                }}>
                {type}
              </button>
            ))}
          </div>
        </div>
       */}
        {/* Status filter */}
        <div>
          <div className="text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>审批状态</div>
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {(["全部", "待审批", "已通过", "已拒绝"] as const).map(status => (
              <button key={status} onClick={() => setStatusFilter(status)}
                className="px-3 py-1.5 rounded-lg text-sm transition-colors"
                style={{
                  background: statusFilter === status ? STATUS_CONFIG[status as ApprovalStatus]?.bg || "rgba(255,255,255,0.1)" : "transparent",
                  color: statusFilter === status
                    ? (STATUS_CONFIG[status as ApprovalStatus]?.color || "#fff")
                    : "rgba(255,255,255,0.5)",
                  fontWeight: statusFilter === status ? "500" : "normal",
                }}>
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Approval Cards */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="text-center py-12" style={{ color: "rgba(255,255,255,0.3)" }}>暂无审批记录</div>
        )}
        {filtered.map((item) => {
          const statusCfg = STATUS_CONFIG[item.status];
          const StatusIcon = statusCfg.icon;
          const typeCfg = TYPE_CONFIG[item.type];
          const isProject = item.subType === "项目";

          return (
            <div key={item.id} className="p-5 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              
              {/* Top row: type badge + project name + status */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 flex-wrap flex-1">
                  {/* Type badge */}
                  <span className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5"
                    style={{ background: typeCfg.bg, color: typeCfg.color }}>
                    {item.type === "生产栗申请"
                      ? <Coins size={11} />
                      : <Shield size={11} />}
                    {item.subType}{item.type}
                  </span>

                  {/* Project name - prominent */}
                  {isProject && item.target && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
                      <FolderOpen size={12} style={{ color: "#E87322" }} />
                      <span className="text-sm text-white">{item.target}</span>
                    </div>
                  )}
                </div>

                {/* Status badge */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{ background: statusCfg.bg }}>
                  <StatusIcon size={12} style={{ color: statusCfg.color }} />
                  <span className="text-xs" style={{ color: statusCfg.color }}>{item.status}</span>
                </div>
              </div>

              {/* Main content row */}
              <div className="flex items-start gap-3">
                {/* Applicant avatar */}
                <div className="flex-shrink-0 flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ background: item.applicantColor, fontSize: "13px" }}>
                    {item.applicantLetter}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  {/* Applicant + time */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-white">{item.applicant}</span>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>申请于 {item.applyTime}</span>
                  </div>

                  {/* Core request */}
                  <div className="text-sm mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
                    {item.type === "生产栗申请" ? (
                      <span>申请 <strong className="text-white" style={{ fontSize: "15px" }}>{item.amount}</strong> 颗生产栗</span>
                    ) : (
                      <span>申请 <strong className="text-white">{item.permission}</strong></span>
                    )}
                  </div>

                  {/* Reason — only show for 生产栗申请 */}
                  {item.type === "生产栗申请" && item.reason && (
                    <div className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)" }}>
                      申请原因：{item.reason}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {item.status === "待审批" && (
                  <div className="flex gap-2 flex-shrink-0 mt-1">
                    <button onClick={() => { setRejectTarget(item); setRejectReason(""); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-opacity hover:opacity-80"
                      style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <X size={12} />
                      拒绝
                    </button>
                    <button onClick={() => handleApprove(item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white transition-opacity hover:opacity-80"
                      style={{ background: "#22c55e" }}>
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

      {/* Reject Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-96 rounded-2xl p-6 shadow-2xl" style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}>
            <h3 className="text-white mb-4">拒绝申请</h3>
            <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
              请填写拒绝原因（可选），将通知申请人 <strong className="text-white">{rejectTarget.applicant}</strong>
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="请输入拒绝原因..."
              className="w-full px-3 py-2 rounded-xl outline-none text-sm text-white resize-none mb-4"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", minHeight: "80px" }}
              onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "#E87322"; }}
              onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
            />
            <div className="flex gap-3">
              <button onClick={() => setRejectTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
                取消
              </button>
              <button onClick={handleReject}
                className="flex-1 py-2.5 rounded-xl text-sm text-white transition-opacity hover:opacity-80"
                style={{ background: "#ef4444" }}>
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
