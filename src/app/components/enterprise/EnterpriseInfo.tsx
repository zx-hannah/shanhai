import { useState, useRef } from "react";
import { Camera, Copy, Edit2, Info, Zap, ArrowUpCircle, Cloud, Users, Share2, Gift, Wallet } from "lucide-react";
import { toast } from "sonner";

// ── Inline Tooltip ─────────────────────────────────────────────────────────────
function Tip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <Info size={11} style={{ color: "rgba(255,255,255,0.25)", cursor: "help" }} />
      {show && (
        <div
          className="absolute z-30 w-52 px-3 py-2 rounded-lg text-xs"
          style={{
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#2A2018",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.6,
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
            whiteSpace: "normal",
            pointerEvents: "none",
          }}
        >
          {text}
          <div
            className="absolute border-4 border-transparent"
            style={{ top: "100%", left: "50%", transform: "translateX(-50%)", borderTopColor: "#2A2018" }}
          />
        </div>
      )}
    </div>
  );
}

export function EnterpriseInfo() {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("山海科技有限公司");
  const [editName, setEditName] = useState(name);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const enterpriseId = "ENT-20240315-8823";

  const handleSave = () => {
    if (!editName.trim()) { toast.error("团队名称不能为空"); return; }
    setName(editName);
    setIsEditing(false);
    toast.success("团队信息已保存");
  };

  const handleCancel = () => {
    setEditName(name);
    setIsEditing(false);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(enterpriseId).catch(() => {});
    toast.success("团队 ID 已复制");
  };

  const STATS = [
    {
      label: "成员数",
      value: "12",
      unit: "人",
      tip: "当前团队空间中的有效成员总数，含所有者、管理员和普通成员，不含已停用账号",
      color: "#E87322",
    },
    {
      label: "项目数",
      value: "8",
      unit: "个",
      tip: "团队下所有项目的总数，包含进行中、已完成和暂停状态的项目",
      color: "#4A9EE0",
    },
    {
      label: "团队余额",
      value: "3,600",
      unit: "颗",
      tip: "团队账户持有的生产栗总量，包含已分配至项目和成员的部分，以及尚未分配的部分之和",
      color: "#4AC678",
    },
    {
      label: "团队可分配额度",
      value: "1,150",
      unit: "颗",
      tip: "企业账户中尚未分配给任何项目或成员、可立即用于分配的生产栗数量",
      color: "#9B59B6",
    },
  ];

  return (
    <div className="max-w-2xl">
      <h3 className="text-white mb-6">团队信息</h3>

      {/* Avatar Section */}
      <div
        className="flex items-start gap-6 mb-8 p-6 rounded-2xl"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="relative flex-shrink-0">
          <div
            onClick={() => isEditing && fileInputRef.current?.click()}
            className={`w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden relative ${isEditing ? "cursor-pointer group" : ""}`}
            style={{ background: avatarPreview ? "transparent" : "#C45C1A" }}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="enterprise" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl text-white">山</span>
            )}
            {isEditing && (
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "rgba(0,0,0,0.5)" }}
              >
                <Camera size={20} className="text-white" />
              </div>
            )}
          </div>
          {isEditing && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "#E87322", border: "2px solid #12100D" }}
            >
              <Camera size={10} className="text-white" />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
                reader.readAsDataURL(file);
              }
            }}
          />
        </div>

        <div className="flex-1">
          <div className="mb-4">
            <label className="text-xs mb-1 block" style={{ color: "rgba(255,255,255,0.4)" }}>团队名称</label>
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={50}
                className="w-full px-3 py-2 rounded-lg outline-none text-sm text-white"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid #E87322" }}
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-white">{name}</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs mb-1 block" style={{ color: "rgba(255,255,255,0.4)" }}>团队 ID</label>
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{enterpriseId}</span>
              <button onClick={handleCopyId} className="transition-opacity hover:opacity-70" style={{ color: "rgba(255,255,255,0.4)" }}>
                <Copy size={12} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          {isEditing ? (
            <div className="flex gap-2">
              <button onClick={handleCancel}
                className="px-4 py-1.5 rounded-lg text-sm transition-opacity hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
                取消
              </button>
              <button onClick={handleSave}
                className="px-4 py-1.5 rounded-lg text-sm text-white transition-opacity hover:opacity-80"
                style={{ background: "#E87322" }}>
                保存
              </button>
            </div>
          ) : (
            <button onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm transition-opacity hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
              <Edit2 size={13} />
              编辑
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards — 4 metrics */}
      {/* 
      <div className="grid grid-cols-2 gap-4 mb-8">
        {STATS.map(({ label, value, unit, tip, color }) => (
          <div
            key={label}
            className="p-4 rounded-xl"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</span>
              <Tip text={tip} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl text-white">{value}</span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{unit}</span>
            </div>
            <div className="mt-3 h-0.5 w-8 rounded-full" style={{ background: color, opacity: 0.5 }} />
          </div>
        ))}
      </div>
 */}
      {/* Subscription Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white">套餐订阅</h3>
          <button
            onClick={() => toast.success("已提交套餐升级申请，等待审核")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs text-white transition-opacity hover:opacity-80"
            style={{ background: "#E87322" }}
          >
            <ArrowUpCircle size={12} />
            升级套餐
          </button>
        </div>

        <div className="p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {/* Plan header */}
          <div className="flex items-center gap-3 mb-4">
            <Zap size={18} style={{ color: "#4A9EE0" }} />
            <span className="text-base text-white font-medium">标准套餐</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>生效中</span>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[
              { label: "生效日期", value: "2024-01-15" },
              { label: "到期日期", value: "2025-01-15" },
              { label: "剩余天数", value: "254 天" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</div>
                <div className="text-sm text-white">{value}</div>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="mb-5">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full" style={{ width: "30%", background: "linear-gradient(90deg, #E87322, #F5A623)" }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>已使用 111 天</span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>共 365 天</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "用户排队分级", value: "高优先级", icon: Zap, color: "#4A9EE0" },
              { label: "并发数", value: "8", icon: Zap, color: "#4A9EE0" },
              { label: "云储存大小", value: "50 GB", icon: Cloud, color: "#4A9EE0" },
              { label: "团队席位", value: "15 席", icon: Users, color: "#4A9EE0" },
              { label: "资产共享", value: "完全共享", icon: Share2, color: "#4A9EE0" },
              { label: "赠送积分数量", value: "2,000", icon: Gift, color: "#4A9EE0" },
              { label: "充值金额", value: "399 元/月", icon: Wallet, color: "#4A9EE0" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</div>
                  <div className="text-sm text-white">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
