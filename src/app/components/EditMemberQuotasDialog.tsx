import { useState } from "react";
import { X, Users, Settings, Infinity as InfinityIcon, RotateCcw, Lock, ChevronDown } from "lucide-react";
import { toast } from "sonner";

type QuotaType = "unlimited" | "periodic" | "fixed";
type Period = "monthly" | "quarterly" | "yearly";

interface MemberQuota {
  memberId: string;
  type: QuotaType;
  amount?: number;
  period?: Period;
}

interface Member {
  id: string;
  name: string;
  avatar: string;
  avatarColor: string;
  role: string;
  quota: {
    type: QuotaType;
    amount?: number;
    period?: Period;
  };
}

interface EditMemberQuotasDialogProps {
  projectName: string;
  members: Member[];
  onClose: () => void;
  onSave: (quotas: MemberQuota[]) => void;
}

const QUOTA_TYPE_CONFIG = {
  unlimited: { label: "无限", icon: InfinityIcon, color: "#E87322" },
  periodic: { label: "周期", icon: RotateCcw, color: "#4A9EE0" },
  fixed: { label: "固定", icon: Lock, color: "#9B59B6" },
};

const PERIOD_OPTIONS: { key: Period; label: string }[] = [
  { key: "monthly", label: "每月" },
  { key: "quarterly", label: "每季度" },
  { key: "yearly", label: "每年" },
];

export function EditMemberQuotasDialog({ projectName, members, onClose, onSave }: EditMemberQuotasDialogProps) {
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [quotas, setQuotas] = useState<Record<string, MemberQuota>>(
    members.reduce((acc, m) => ({
      ...acc,
      [m.id]: {
        memberId: m.id,
        type: m.quota.type,
        amount: m.quota.amount,
        period: m.quota.period,
      },
    }), {})
  );
  const [showPeriodDropdown, setShowPeriodDropdown] = useState<string | null>(null);

  const updateQuota = (memberId: string, updates: Partial<MemberQuota>) => {
    setQuotas((prev) => ({
      ...prev,
      [memberId]: { ...prev[memberId], ...updates },
    }));
  };

  const handleSave = () => {
    onSave(Object.values(quotas));
    toast.success("成员配额已更新");
    onClose();
  };

  const getQuotaDisplay = (quota: MemberQuota) => {
    if (quota.type === "unlimited") return "无限制";
    if (quota.type === "periodic") {
      const periodLabel = PERIOD_OPTIONS.find(p => p.key === quota.period)?.label || "每月";
      return `${periodLabel} ${quota.amount?.toLocaleString() || 0} 颗`;
    }
    return `固定 ${quota.amount?.toLocaleString() || 0} 颗`;
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="w-[620px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={() => {
          setShowPeriodDropdown(null);
          if (editingMemberId) setEditingMemberId(null);
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div>
            <h3 className="text-white">成员配额设置</h3>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
              {projectName} · {members.length} 位成员
            </p>
          </div>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.4)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col gap-2 max-h-[480px] overflow-auto mb-4">
            {members.map((member) => {
              const quota = quotas[member.id];
              const isEditing = editingMemberId === member.id;
              const config = QUOTA_TYPE_CONFIG[quota.type];
              const Icon = config.icon;

              return (
                <div
                  key={member.id}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: isEditing ? "rgba(232,115,34,0.05)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${isEditing ? "rgba(232,115,34,0.2)" : "rgba(255,255,255,0.06)"}`
                  }}
                >
                  {/* Member Header */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                      style={{ background: member.avatarColor }}
                    >
                      {member.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white">{member.name}</div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {member.role}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                        style={{ background: `${config.color}18`, border: `1px solid ${config.color}30` }}>
                        <Icon size={11} style={{ color: config.color }} />
                        <span className="text-xs" style={{ color: config.color }}>
                          {getQuotaDisplay(quota)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingMemberId(isEditing ? null : member.id);
                        }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                        style={{
                          background: isEditing ? "rgba(232,115,34,0.15)" : "rgba(255,255,255,0.05)",
                          color: isEditing ? "#E87322" : "rgba(255,255,255,0.4)"
                        }}
                      >
                        <Settings size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Edit Section */}
                  {isEditing && (
                    <div className="px-4 pb-4 pt-2" onClick={(e) => e.stopPropagation()}>
                      <div
                        className="p-3 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        {/* Type Selection */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          {(["unlimited", "periodic", "fixed"] as QuotaType[]).map((type) => {
                            const typeConfig = QUOTA_TYPE_CONFIG[type];
                            const TypeIcon = typeConfig.icon;
                            return (
                              <button
                                key={type}
                                onClick={() => updateQuota(member.id, { type, period: "monthly", amount: 10000 })}
                                className="flex flex-col items-center gap-1.5 py-2 rounded-lg transition-all"
                                style={{
                                  background: quota.type === type ? `${typeConfig.color}15` : "rgba(255,255,255,0.03)",
                                  border: `1.5px solid ${quota.type === type ? typeConfig.color : "rgba(255,255,255,0.08)"}`,
                                }}
                              >
                                <TypeIcon size={14} style={{ color: quota.type === type ? typeConfig.color : "rgba(255,255,255,0.3)" }} />
                                <span className="text-xs" style={{ color: quota.type === type ? typeConfig.color : "rgba(255,255,255,0.5)" }}>
                                  {typeConfig.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Periodic Config */}
                        {quota.type === "periodic" && (
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              <div className="flex-1 relative">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowPeriodDropdown(showPeriodDropdown === member.id ? null : member.id);
                                  }}
                                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs"
                                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
                                >
                                  <span>{PERIOD_OPTIONS.find(p => p.key === quota.period)?.label || "每月"}</span>
                                  <ChevronDown size={12} style={{ color: "rgba(255,255,255,0.4)" }} />
                                </button>
                                {showPeriodDropdown === member.id && (
                                  <div
                                    className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-30 shadow-2xl"
                                    style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)" }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {PERIOD_OPTIONS.map((opt) => (
                                      <button
                                        key={opt.key}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          updateQuota(member.id, { period: opt.key });
                                          setShowPeriodDropdown(null);
                                        }}
                                        className="w-full px-3 py-2 text-xs text-left transition-colors hover:bg-white/5"
                                        style={{ color: quota.period === opt.key ? "#4A9EE0" : "rgba(255,255,255,0.7)" }}
                                      >
                                        {opt.label}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <input
                                type="number"
                                value={quota.amount || ""}
                                onChange={(e) => updateQuota(member.id, { amount: parseInt(e.target.value) || 0 })}
                                placeholder="10000"
                                className="flex-1 px-3 py-2 rounded-lg text-xs outline-none text-white"
                                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                        )}

                        {/* Fixed Config */}
                        {quota.type === "fixed" && (
                          <div>
                            <input
                              type="number"
                              value={quota.amount || ""}
                              onChange={(e) => updateQuota(member.id, { amount: parseInt(e.target.value) || 0 })}
                              placeholder="10000"
                              className="w-full px-3 py-2 rounded-lg text-xs outline-none text-white"
                              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Info */}
          <div className="text-xs px-3 py-2 rounded-lg mb-4"
            style={{ background: "rgba(74,158,224,0.08)", color: "rgba(255,255,255,0.5)" }}>
            成员配额限制该成员在项目中可使用的生产栗数量
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
              onClick={handleSave}
              className="flex-1 py-3 rounded-xl text-white text-sm transition-opacity hover:opacity-90"
              style={{ background: "#E87322" }}
            >
              保存设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
