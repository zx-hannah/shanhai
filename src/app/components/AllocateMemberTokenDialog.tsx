import { useState } from "react";
import { X, Coins, Plus, Minus, Users } from "lucide-react";
import { toast } from "sonner";

interface Member {
  id: string;
  name: string;
  avatar: string;
  avatarColor: string;
  role: string;
  currentBalance: number;
}

interface AllocateMemberTokenDialogProps {
  projectName: string;
  members: Member[];
  projectBalance: number;
  onClose: () => void;
  onAllocate: (allocations: { memberId: string; amount: number }[]) => void;
}

export function AllocateMemberTokenDialog({
  projectName,
  members,
  projectBalance,
  onClose,
  onAllocate,
}: AllocateMemberTokenDialogProps) {
  const [allocations, setAllocations] = useState<Record<string, string>>(
    members.reduce((acc, m) => ({ ...acc, [m.id]: "0" }), {})
  );

  const getTotalAllocating = () => {
    return Object.values(allocations).reduce((sum, val) => sum + (parseInt(val) || 0), 0);
  };

  const handleChange = (memberId: string, value: string) => {
    const num = value === "" ? "" : Math.max(0, parseInt(value) || 0).toString();
    setAllocations((prev) => ({ ...prev, [memberId]: num }));
  };

  const handleQuickAdd = (memberId: string, delta: number) => {
    const current = parseInt(allocations[memberId] || "0");
    const newVal = Math.max(0, current + delta);
    setAllocations((prev) => ({ ...prev, [memberId]: newVal.toString() }));
  };

  const handleAllocate = () => {
    const total = getTotalAllocating();
    if (total === 0) {
      toast.error("请至少为一位成员分配生产栗");
      return;
    }

    if (total > projectBalance) {
      toast.error("分配总额超出项目可用余额");
      return;
    }

    const allocList = Object.entries(allocations)
      .map(([memberId, amount]) => ({ memberId, amount: parseInt(amount) || 0 }))
      .filter((a) => a.amount > 0);

    onAllocate(allocList);
    toast.success(`成功分配 ${total} 颗生产栗给 ${allocList.length} 位成员`);
    onClose();
  };

  const totalAllocating = getTotalAllocating();
  const remainingBalance = projectBalance - totalAllocating;
  const isOverBudget = totalAllocating > projectBalance;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-[540px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div>
            <h3 className="text-white">分配生产栗</h3>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
              {projectName}
            </p>
          </div>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.4)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Project Balance */}
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl mb-4"
            style={{ background: "rgba(232,115,34,0.08)", border: "1px solid rgba(232,115,34,0.15)" }}
          >
            <div className="flex items-center gap-2">
              <Coins size={14} style={{ color: "#E87322" }} />
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>项目可分配余额</span>
            </div>
            <span className="text-lg text-white">{projectBalance.toLocaleString()}</span>
          </div>

          {/* Members List */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Users size={12} style={{ color: "rgba(255,255,255,0.4)" }} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                成员列表（{members.length} 人）
              </span>
            </div>

            <div className="flex flex-col gap-2 max-h-[280px] overflow-auto">
              {members.map((member) => {
                const allocating = parseInt(allocations[member.id] || "0");
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    {/* Avatar & Info */}
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                        style={{ background: member.avatarColor }}
                      >
                        {member.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">{member.name}</div>
                        <div className="text-xs flex items-center gap-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                          <span>{member.role}</span>
                          <span>·</span>
                          <span>余额 {member.currentBalance}</span>
                        </div>
                      </div>
                    </div>

                    {/* Allocation Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuickAdd(member.id, -100)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                        style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}
                      >
                        <Minus size={11} />
                      </button>

                      <input
                        type="number"
                        value={allocations[member.id] || ""}
                        onChange={(e) => handleChange(member.id, e.target.value)}
                        placeholder="0"
                        className="w-20 px-2 py-1.5 rounded-lg text-center text-sm outline-none text-white"
                        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}
                      />

                      <button
                        onClick={() => handleQuickAdd(member.id, 100)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                        style={{ background: "rgba(232,115,34,0.15)", color: "#E87322" }}
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div
            className="px-4 py-3 rounded-xl mb-4"
            style={{
              background: isOverBudget ? "rgba(239,68,68,0.08)" : "rgba(74,198,120,0.08)",
              border: `1px solid ${isOverBudget ? "rgba(239,68,68,0.15)" : "rgba(74,198,120,0.15)"}`,
            }}
          >
            <div className="flex items-center justify-between text-sm mb-1">
              <span style={{ color: "rgba(255,255,255,0.5)" }}>本次分配总额</span>
              <span className="text-lg" style={{ color: isOverBudget ? "#ef4444" : "#4AC678" }}>
                {totalAllocating.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: "rgba(255,255,255,0.35)" }}>分配后剩余</span>
              <span style={{ color: isOverBudget ? "#ef4444" : "rgba(255,255,255,0.5)" }}>
                {remainingBalance.toLocaleString()} 颗
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm transition-colors"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)" }}
            >
              取消
            </button>
            <button
              onClick={handleAllocate}
              disabled={isOverBudget || totalAllocating === 0}
              className="flex-1 py-3 rounded-xl text-white text-sm transition-opacity"
              style={{
                background: isOverBudget || totalAllocating === 0 ? "rgba(232,115,34,0.3)" : "#E87322",
                opacity: isOverBudget || totalAllocating === 0 ? 0.5 : 1,
                cursor: isOverBudget || totalAllocating === 0 ? "not-allowed" : "pointer",
              }}
            >
              确认分配
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
