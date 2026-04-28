import { useState } from "react";
import { X, Infinity as InfinityIcon, RotateCcw, Lock, HelpCircle, ChevronDown } from "lucide-react";
import { toast } from "sonner";

type QuotaType = "unlimited" | "periodic" | "fixed";
type Period = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

interface ProjectQuotaDialogProps {
  projectName: string;
  currentQuota: {
    type: QuotaType;
    amount?: number;
    period?: Period;
    resetDay?: number;
  };
  onClose: () => void;
  onSave: (quota: {
    type: QuotaType;
    amount?: number;
    period?: Period;
    resetDay?: number;
  }) => void;
}

const PERIOD_OPTIONS: { key: Period; label: string; resetLabel: string }[] = [
  { key: "daily", label: "每日", resetLabel: "每日" },
  { key: "weekly", label: "每周", resetLabel: "每周一" },
  { key: "monthly", label: "每月", resetLabel: "每月1日" },
  { key: "quarterly", label: "每季度", resetLabel: "每季度首日" },
  { key: "yearly", label: "每年", resetLabel: "每年1月1日" },
];

export function ProjectQuotaDialog({ projectName, currentQuota, onClose, onSave }: ProjectQuotaDialogProps) {
  const [quotaType, setQuotaType] = useState<QuotaType>(currentQuota.type);
  const [amount, setAmount] = useState(currentQuota.amount?.toString() || "20000");
  const [period, setPeriod] = useState<Period>(currentQuota.period || "monthly");
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  const handleSave = () => {
    if (quotaType === "periodic" || quotaType === "fixed") {
      const parsedAmount = parseInt(amount);
      if (!parsedAmount || parsedAmount <= 0) {
        toast.error("请输入有效的额度数量");
        return;
      }
    }

    const quota = {
      type: quotaType,
      ...(quotaType !== "unlimited" && { amount: parseInt(amount) }),
      ...(quotaType === "periodic" && { period }),
    };

    onSave(quota);
    toast.success("项目配额已更新");
    onClose();
  };

  const selectedPeriod = PERIOD_OPTIONS.find((p) => p.key === period)!;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-[580px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={() => setShowPeriodDropdown(false)}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div>
            <h3 className="text-white">项目配额设置</h3>
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
          {/* Type Selection */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-white">类型</span>
              <HelpCircle size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Unlimited */}
              <button
                onClick={() => setQuotaType("unlimited")}
                className="rounded-2xl p-4 transition-all relative"
                style={{
                  background: quotaType === "unlimited" ? "rgba(232,115,34,0.1)" : "rgba(255,255,255,0.03)",
                  border: `2px solid ${quotaType === "unlimited" ? "#E87322" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                {/* Help icon */}
                <div className="absolute top-3 right-3">
                  <HelpCircle size={14} style={{ color: "rgba(255,255,255,0.2)" }} />
                </div>

                <div className="flex flex-col items-center gap-3 pt-2">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <InfinityIcon size={24} style={{ color: "rgba(255,255,255,0.4)" }} />
                  </div>
                  <span className="text-sm" style={{ color: quotaType === "unlimited" ? "#E87322" : "rgba(255,255,255,0.6)" }}>
                    无额度限制
                  </span>
                </div>
              </button>

              {/* Periodic */}
              <button
                onClick={() => setQuotaType("periodic")}
                className="rounded-2xl p-4 transition-all relative"
                style={{
                  background: quotaType === "periodic" ? "rgba(74,158,224,0.1)" : "rgba(255,255,255,0.03)",
                  border: `2px solid ${quotaType === "periodic" ? "#4A9EE0" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                <div className="absolute top-3 right-3">
                  <HelpCircle size={14} style={{ color: "rgba(255,255,255,0.2)" }} />
                </div>

                <div className="flex flex-col items-center gap-3 pt-2">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(74,158,224,0.15)" }}
                  >
                    <RotateCcw size={24} style={{ color: "#4A9EE0" }} />
                  </div>
                  <span className="text-sm" style={{ color: quotaType === "periodic" ? "#4A9EE0" : "rgba(255,255,255,0.6)" }}>
                    周期额度
                  </span>
                </div>
              </button>

              {/* Fixed */}
              <button
                onClick={() => setQuotaType("fixed")}
                className="rounded-2xl p-4 transition-all relative"
                style={{
                  background: quotaType === "fixed" ? "rgba(155,89,182,0.1)" : "rgba(255,255,255,0.03)",
                  border: `2px solid ${quotaType === "fixed" ? "#9B59B6" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                <div className="absolute top-3 right-3">
                  <HelpCircle size={14} style={{ color: "rgba(255,255,255,0.2)" }} />
                </div>

                <div className="flex flex-col items-center gap-3 pt-2">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(155,89,182,0.15)" }}
                  >
                    <Lock size={24} style={{ color: "#9B59B6" }} />
                  </div>
                  <span className="text-sm" style={{ color: quotaType === "fixed" ? "#9B59B6" : "rgba(255,255,255,0.6)" }}>
                    固定额度
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Periodic Config */}
          {quotaType === "periodic" && (
            <div className="flex flex-col gap-4 mb-6">
              {/* Period Selection */}
              <div>
                <div className="text-sm mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>恢复周期</div>
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}
                  >
                    <span>{selectedPeriod.label}</span>
                    <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
                  </button>
                  {showPeriodDropdown && (
                    <div
                      className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-30 shadow-2xl"
                      style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      {PERIOD_OPTIONS.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => { setPeriod(opt.key); setShowPeriodDropdown(false); }}
                          className="w-full px-4 py-3 text-sm text-left transition-colors hover:bg-white/5"
                          style={{ color: period === opt.key ? "#4A9EE0" : "rgba(255,255,255,0.7)" }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Amount */}
              <div>
                <div className="text-sm mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>单期额度</div>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-white"
                    placeholder="20000"
                  />
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Tapies</span>
                </div>
              </div>

              {/* Reset Info */}
              <div className="text-xs px-3 py-2 rounded-lg" style={{ background: "rgba(74,158,224,0.08)", color: "rgba(255,255,255,0.5)" }}>
                {selectedPeriod.resetLabel}恢复
              </div>
            </div>
          )}

          {/* Fixed Config */}
          {quotaType === "fixed" && (
            <div className="mb-6">
              <div className="text-sm mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>总额度</div>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-white"
                  placeholder="20000"
                />
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Tapies</span>
              </div>
            </div>
          )}

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
              保存并应用
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
