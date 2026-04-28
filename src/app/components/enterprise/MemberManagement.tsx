import { useState, useRef, useEffect } from "react";
import {
  UserPlus, ChevronDown, AlertTriangle, X, Link, Check,
  Copy, Edit2, Camera, ArrowLeft, Clock, Hash, Crown, Coins, List,
} from "lucide-react";
import { toast } from "sonner";

type Role = "所有者" | "管理员" | "普通成员";

interface Member {
  id: string;
  name: string;
  phone: string;
  role: Role;
  department: string;
  personalTokens: number;
  joinDate: string;
  status: "正常" | "停用";
  isSelf?: boolean;
  avatarColor: string;
  avatarLetter: string;
}

const INITIAL_MEMBERS: Member[] = [
  { id: "1", name: "Bob",     phone: "138****8888", role: "所有者",  department: "管理层", personalTokens: 500, joinDate: "2024-01-15", status: "正常", isSelf: true, avatarColor: "#E87322", avatarLetter: "B" },
  { id: "2", name: "Alice",   phone: "135****2233", role: "管理员",  department: "产品部", personalTokens: 300, joinDate: "2024-02-01", status: "正常", avatarColor: "#7B3FC4", avatarLetter: "A" },
  { id: "3", name: "Charlie", phone: "139****4455", role: "普通成员", department: "设计部", personalTokens: 150, joinDate: "2024-03-10", status: "正常", avatarColor: "#2A6FC4", avatarLetter: "C" },
  { id: "4", name: "Diana",   phone: "136****6677", role: "普通成员", department: "研发部", personalTokens: 0,   joinDate: "2024-03-22", status: "停用", avatarColor: "#C42A6F", avatarLetter: "D" },
  { id: "5", name: "Eve",     phone: "132****8899", role: "普通成员", department: "运营部", personalTokens: 200, joinDate: "2024-04-05", status: "正常", avatarColor: "#2AC4A2", avatarLetter: "E" },
];

const ROLES: Role[] = ["所有者", "管理员", "普通成员"];
const ROLE_FILTER_OPTIONS = ["全部", "所有者", "管理员", "普通成员"];
const ROLE_COLORS: Record<Role, string> = { "所有者": "#E87322", "管理员": "#7B3FC4", "普通成员": "#2A6FC4" };
const EXPIRY_OPTIONS = ["1天", "3天", "7天", "30天", "永久有效"];

function getExpiryDays(expiry: string): number | "永久" {
  if (expiry === "永久有效") return "永久";
  return parseInt(expiry);
}

/* ─── Personal Token History ─────────────────────────────────────────────────── */
const PERSONAL_TOKEN_HISTORY: Record<string, { id: string; time: string; type: "分配" | "回收" | "消费"; amount: number; operator: string; remark: string }[]> = {
  "1": [
    { id: "1", time: "2024-04-02 10:00", type: "分配", amount: 200,  operator: "Bob（自己）", remark: "手动分配" },
    { id: "2", time: "2024-03-15 09:30", type: "分配", amount: 300,  operator: "Bob（自己）", remark: "手动分配" },
    
  ],
  "2": [
    { id: "1", time: "2024-04-01 11:00", type: "分配", amount: 300,  operator: "Bob",  remark: "手动分配" },

  ],
  "3": [
    { id: "1", time: "2024-03-15 11:00", type: "分配", amount: 200,  operator: "Bob",  remark: "手动分配" },
   
  ],
  "4": [
    { id: "1", time: "2024-03-10 09:00", type: "分配", amount: 200,  operator: "Bob",  remark: "手动分配" },

  ],
  "5": [
    { id: "1", time: "2024-04-01 09:00", type: "分配", amount: 300,  operator: "Bob",  remark: "手动分配" },
  ],
};

const TX_TYPE_COLORS = { "分配": "#22c55e", "回收": "#ef4444", "消费": "#ef4444" } as const;

/* ─── Editable Dept Cell ─────────────────────────────────────────────────────── */
function DeptCell({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed) onSave(trimmed); else setDraft(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
        className="text-xs px-2 py-1 rounded outline-none text-white w-full"
        style={{ background: "rgba(232,115,34,0.15)", border: "1px solid #E87322", maxWidth: "90px" }} />
    );
  }
  return (
    <button onClick={() => setEditing(true)} className="flex items-center gap-1 group text-xs"
      style={{ color: "rgba(255,255,255,0.5)" }} title="点击编辑部门">
      <span>{value}</span>
      <Edit2 size={10} className="opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
    </button>
  );
}

/* ─── Allocate / Recycle Personal Token Dialog ───────────────────────────────── */
function AllocatePersonalTokenDialog({ member, onClose }: { member: Member; onClose: () => void }) {
  const [mode, setMode] = useState<"allocate" | "recycle">("allocate");
  const [amount, setAmount] = useState("");
  const teamBalance = 1150;
  const personalBalance = member.personalTokens;

  const n = Number(amount);
  const maxAmount = mode === "allocate" ? teamBalance : personalBalance;
  const isOverLimit = amount !== "" && !isNaN(n) && n > maxAmount;
  const isValid = amount !== "" && !isNaN(n) && n > 0 && n <= maxAmount;

  const switchMode = (m: "allocate" | "recycle") => { setMode(m); setAmount(""); };

  const handleConfirm = () => {
    if (!isValid) { toast.error(mode === "allocate" ? "请输入有效的分配数量" : "请输入有效的回收数量"); return; }
    if (mode === "allocate") {
      toast.success(`已向 ${member.name} 分配 ${n} 颗个人生产栗`);
    } else {
      toast.success(`已从 ${member.name} 回收 ${n} 颗个人生产栗`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div className="w-[440px] rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <h3 className="text-white">{mode === "allocate" ? "分配个人生产栗" : "回收个人生产栗"}</h3>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>成员：{member.name}</p>
          </div>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.4)" }}><X size={18} /></button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Mode toggle */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            {([
              { key: "allocate", label: "分配", activeColor: "#22c55e", activeBg: "rgba(34,197,94,0.15)" },
              { key: "recycle",  label: "回收", activeColor: "#ef4444", activeBg: "rgba(239,68,68,0.15)" },
            ] as const).map(({ key, label, activeColor, activeBg }) => (
              <button
                key={key}
                onClick={() => switchMode(key)}
                className="flex-1 py-1.5 rounded-lg text-sm transition-all"
                style={{
                  background: mode === key ? activeBg : "transparent",
                  color: mode === key ? activeColor : "rgba(255,255,255,0.45)",
                  border: mode === key ? `1px solid ${activeColor}40` : "1px solid transparent",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Notice */}
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl" style={{ background: "rgba(232,115,34,0.07)", border: "1px solid rgba(232,115,34,0.2)" }}>
            <AlertTriangle size={13} style={{ color: "#E87322", flexShrink: 0, marginTop: 1 }} />
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.75 }}>
              {mode === "allocate"
                ? <>该生产栗用于<strong className="text-white">项目外个人生产消耗</strong>，项目成员生产栗分配要到<strong className="text-white">项目总览页</strong>进行分配。</>
                : <>回收将从该成员个人余额扣除，回收数量<strong className="text-white">不可超过当前余额（{personalBalance.toLocaleString()} 颗）</strong>，回收后生产栗退回团队可分配池。</>
              }
            </p>
          </div>

          {/* Balance cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-0.5 px-4 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                {mode === "allocate" ? "团队剩余可分配" : "成员当前余额"}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Coins size={11} style={{ color: mode === "allocate" ? "#E87322" : "#ef4444" }} />
                <span className="text-sm" style={{ color: mode === "allocate" ? "white" : "#ef4444" }}>
                  {(mode === "allocate" ? teamBalance : personalBalance).toLocaleString()} 颗
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 px-4 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                {mode === "allocate" ? "成员当前余额" : "回收后余额（预览）"}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Coins size={11} style={{ color: "#E87322" }} />
                <span className="text-sm text-white">
                  {mode === "allocate"
                    ? `${personalBalance.toLocaleString()} 颗`
                    : `${Math.max(0, personalBalance - (isValid ? n : 0)).toLocaleString()} 颗`}
                </span>
              </div>
            </div>
          </div>

          {/* Amount input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                {mode === "allocate" ? "分配数量（颗）" : "回收数量（颗）"}
                <span className="text-red-400">*</span>
              </label>
              <button
                onClick={() => setAmount(String(maxAmount))}
                className="text-xs px-2 py-0.5 rounded-md hover:opacity-80"
                style={{ background: "rgba(232,115,34,0.12)", color: "#E87322", border: "1px solid rgba(232,115,34,0.25)" }}
              >
                {mode === "allocate" ? `最大（${teamBalance.toLocaleString()}）` : `全部回收（${personalBalance.toLocaleString()}）`}
              </button>
            </div>
            <input
              type="number" min="1" max={maxAmount} value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`最多 ${maxAmount.toLocaleString()} 颗`}
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm text-white"
              style={{ background: "rgba(255,255,255,0.06)", border: isOverLimit ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)" }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = mode === "allocate" ? "#E87322" : "#ef4444"; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = isOverLimit ? "#ef4444" : "rgba(255,255,255,0.1)"; }}
            />
            {isOverLimit && (
              <p className="text-xs mt-1.5" style={{ color: "#ef4444" }}>
                {mode === "allocate"
                  ? `超出团队可分配额度（最多 ${teamBalance.toLocaleString()} 颗）`
                  : `超出成员当前余额（最多 ${personalBalance.toLocaleString()} 颗）`}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>取消</button>
            <button onClick={handleConfirm} disabled={!isValid}
              className="flex-1 py-2.5 rounded-xl text-sm text-white transition-opacity"
              style={{
                background: !isValid ? "rgba(255,255,255,0.1)" : mode === "allocate" ? "#E87322" : "#ef4444",
                cursor: isValid ? "pointer" : "not-allowed",
              }}>
              {mode === "allocate" ? "确认分配" : "确认回收"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── (PersonalTokenHistoryDialog removed — replaced by inline expand in table) ─ */

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export function MemberManagement() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [roleFilter, setRoleFilter] = useState("全部");
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);
  const [statusTarget, setStatusTarget] = useState<Member | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState<string | null>(null);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [allocatePersonalTarget, setAllocatePersonalTarget] = useState<Member | null>(null);
  const [expandedDetailMemberId, setExpandedDetailMemberId] = useState<string | null>(null);

  const [entName, setEntName] = useState("山海科技有限公司");
  const [entAvatarPreview, setEntAvatarPreview] = useState<string | null>(null);
  const [showEditEnt, setShowEditEnt] = useState(false);
  const [editEntName, setEditEntName] = useState("");
  const [editEntAvatarPreview, setEditEntAvatarPreview] = useState<string | null>(null);
  const entFileRef = useRef<HTMLInputElement>(null);
  const editEntFileRef = useRef<HTMLInputElement>(null);

  const [inviteView, setInviteView] = useState<"main" | "settings">("main");
  const [remainingDays, setRemainingDays] = useState<number | "永久">(5);
  const [remainingUses, setRemainingUses] = useState<number>(47);
  const [requireApproval, setRequireApproval] = useState(false);
  const [linkExpiry, setLinkExpiry] = useState("7天");
  const [linkUsageLimit, setLinkUsageLimit] = useState("100");
  const [showExpiryDropdown, setShowExpiryDropdown] = useState(false);

  const filtered = members.filter(m => roleFilter === "全部" || m.role === roleFilter);

  const handleRoleChange = (memberId: string, newRole: Role) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: newRole } : m));
    setShowRoleDropdown(null);
    toast.success("角色修改成功");
  };

  const handleDeptChange = (memberId: string, dept: string) => {
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, department: dept } : m));
    toast.success("部门已更新");
  };

  const handleRemove = () => {
    if (!removeTarget) return;
    setMembers(prev => prev.filter(m => m.id !== removeTarget.id));
    setRemoveTarget(null);
    toast.success("移除成员成功");
  };

  const handleStatusToggle = () => {
    if (!statusTarget) return;
    const newStatus = statusTarget.status === "正常" ? "停用" : "正常";
    setMembers(prev => prev.map(m => m.id === statusTarget.id ? { ...m, status: newStatus } : m));
    setStatusTarget(null);
    toast.success(newStatus === "停用" ? "已停用该成员" : "已恢复成员状态");
  };

  const handleCopyLink = () => { toast.success("邀请链接已复制到剪贴板"); };

  const closeInviteModal = () => {
    setShowInviteModal(false);
    setTimeout(() => setInviteView("main"), 300);
    setShowExpiryDropdown(false);
  };

  const handleGenerateNewLink = () => {
    const days = getExpiryDays(linkExpiry);
    const uses = parseInt(linkUsageLimit) || 0;
    setRemainingDays(days);
    setRemainingUses(uses);
    toast.success("新链接生成成功");
    setInviteView("main");
  };

  const openEditEnt = () => { setEditEntName(entName); setEditEntAvatarPreview(entAvatarPreview); setShowEditEnt(true); };

  const saveEditEnt = () => {
    if (!editEntName.trim()) { toast.error("团队名称不能为空"); return; }
    setEntName(editEntName.trim());
    setEntAvatarPreview(editEntAvatarPreview);
    setShowEditEnt(false);
    toast.success("团队信息已更新");
  };

  const handleTransferOwnership = (targetId: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.isSelf) return { ...m, role: "普通成员" as Role };
        if (m.id === targetId) return { ...m, role: "所有者" as Role };
        return m;
      })
    );
    setShowTransferDialog(false);
    toast.success("空间所有权已成功转让");
  };

  const COL = "1.8fr 1.2fr 1.1fr 0.9fr 1fr 0.9fr 2.4fr";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-white">成员管理</h3>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
            {members.length} 人
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Role Filter */}
          <div className="relative">
            <button onClick={() => setShowRoleFilter(!showRoleFilter)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
              <span>角色：{roleFilter}</span><ChevronDown size={13} />
            </button>
            {showRoleFilter && (
              <div className="absolute top-full left-0 mt-1 w-32 rounded-xl overflow-hidden z-20 shadow-2xl"
                style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}>
                {ROLE_FILTER_OPTIONS.map(opt => (
                  <button key={opt} onClick={() => { setRoleFilter(opt); setShowRoleFilter(false); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm transition-colors text-left"
                    style={{ color: roleFilter === opt ? "#E87322" : "rgba(255,255,255,0.7)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
                    <span>{opt}</span>
                    {roleFilter === opt && <Check size={13} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Invite Button */}
          <button onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 rounded-lg text-sm text-white transition-opacity hover:opacity-80 px-[8px] py-[8px] ml-auto"
            style={{ background: "#E87322" }}>
            <UserPlus size={14} />邀请成员
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
        {/* Header */}
        <div className="grid text-xs px-4 py-3"
          style={{ gridTemplateColumns: COL, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>昵称</div>
          <div>手机号</div>
          <div>角色</div>
          <div>部门</div>
          <div>个人生产栗</div>
          <div>状态</div>
          <div>操作</div>
        </div>

        {/* Rows */}
        {filtered.map((member, idx) => {
          const isDetailExpanded = expandedDetailMemberId === member.id;
          const allocHistory = (PERSONAL_TOKEN_HISTORY[member.id] ?? []).filter(tx => tx.type === "分配");
          return (
          <div key={member.id}>
          <div className="grid items-center px-4 py-3 text-sm"
            style={{ gridTemplateColumns: COL, background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)", borderBottom: isDetailExpanded ? "none" : "1px solid rgba(255,255,255,0.04)", opacity: member.status === "停用" ? 0.6 : 1, transition: "opacity 0.2s" }}>

            {/* Name */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0" style={{ background: member.avatarColor }}>{member.avatarLetter}</div>
              <span className="text-white">{member.name}</span>
              {member.isSelf && <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "rgba(232,115,34,0.2)", color: "#E87322" }}>我</span>}
            </div>

            {/* Phone */}
            <div style={{ color: "rgba(255,255,255,0.5)" }}>{member.phone}</div>

            {/* Role */}
            <div className="relative">
              <button
                onClick={() => !member.isSelf && setShowRoleDropdown(showRoleDropdown === member.id ? null : member.id)}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors"
                style={{ background: `${ROLE_COLORS[member.role]}22`, color: ROLE_COLORS[member.role], cursor: member.isSelf ? "default" : "pointer" }}>
                <span>{member.role}</span>{!member.isSelf && <ChevronDown size={11} />}
              </button>
              {showRoleDropdown === member.id && (
                <div className="absolute top-full left-0 mt-1 w-24 rounded-xl overflow-hidden z-20 shadow-2xl"
                  style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}>
                  {ROLES.filter(r => r !== "所有者").map(role => (
                    <button key={role} onClick={() => handleRoleChange(member.id, role)}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs transition-colors text-left"
                      style={{ color: member.role === role ? "#E87322" : "rgba(255,255,255,0.7)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
                      <span>{role}</span>{member.role === role && <Check size={11} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Department */}
            <DeptCell value={member.department} onSave={(v) => handleDeptChange(member.id, v)} />

            {/* 个人生产栗 */}
            <div className="flex items-center gap-1">
              <Coins size={11} style={{ color: member.personalTokens > 0 ? "#E87322" : "rgba(255,255,255,0.18)" }} />
              <span className="text-sm" style={{ color: member.personalTokens > 0 ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.3)" }}>
                {member.personalTokens.toLocaleString()}
              </span>
            </div>

            {/* Status */}
            <div>
              {member.isSelf ? (
                <div className="flex items-center gap-1.5">
                  <div className="relative w-9 h-5 rounded-full flex-shrink-0" style={{ background: "rgba(34,197,94,0.25)", border: "1px solid rgba(34,197,94,0.4)" }}>
                    <div className="absolute top-0.5 w-4 h-4 rounded-full" style={{ background: "#22c55e", transform: "translateX(18px)" }} />
                  </div>
                  <span className="text-xs" style={{ color: "#22c55e" }}>正常</span>
                </div>
              ) : (
                <button onClick={() => setStatusTarget(member)} className="flex items-center gap-1.5 group transition-opacity hover:opacity-80"
                  title={member.status === "正常" ? "点击停用该成员" : "点击恢复该成员"}>
                  <div className="relative w-9 h-5 rounded-full flex-shrink-0 transition-all duration-300"
                    style={{ background: member.status === "正常" ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.2)", border: `1px solid ${member.status === "正常" ? "rgba(34,197,94,0.5)" : "rgba(239,68,68,0.4)"}` }}>
                    <div className="absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-300"
                      style={{ background: member.status === "正常" ? "#22c55e" : "#ef4444", transform: member.status === "正常" ? "translateX(18px)" : "translateX(2px)" }} />
                  </div>
                  <span className="text-xs transition-colors" style={{ color: member.status === "正常" ? "#22c55e" : "#ef4444" }}>{member.status}</span>
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 flex-wrap">
            {/* Transfer / Remove */}
              {member.isSelf && member.role === "所有者" ? (
                <button onClick={() => setShowTransferDialog(true)}
                  className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                  style={{ color: "rgba(239,68,68,0.75)", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.15)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)"; }}
                  title="转让空间所有权">
                  <Crown size={11} />转让
                </button>
              ) : !member.isSelf ? (
                <button onClick={() => setRemoveTarget(member)}
                  className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                  style={{ color: "rgba(239,68,68,0.75)", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.15)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)"; }}
                  title="移除成员">
                  <X size={11} />移除
                </button>
              ) : null}
              {/* 分配生产栗 — non-self only */}
            
                <button onClick={() => setAllocatePersonalTarget(member)}
                  className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg transition-colors whitespace-nowrap hover:opacity-80"
                  style={{ color: "#E87322", background: "rgba(232,115,34,0.1)", border: "1px solid rgba(232,115,34,0.2)" }}
                  title="分配个人生产栗">
                  <Coins size={10} />分配
                </button>
           
              {/* 分配明细 — inline expand toggle */}
              <button onClick={() => setExpandedDetailMemberId(isDetailExpanded ? null : member.id)}
                className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                style={{
                  color: isDetailExpanded ? "#E87322" : "rgba(255,255,255,0.55)",
                  background: isDetailExpanded ? "rgba(232,115,34,0.12)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${isDetailExpanded ? "rgba(232,115,34,0.3)" : "rgba(255,255,255,0.1)"}`,
                }}>
                <List size={10} />明细
                <ChevronDown size={10} style={{ transform: isDetailExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
              </button>
          
            </div>
          </div>

          {/* ── Inline allocation detail expand ── */}
          {isDetailExpanded && (
            <div style={{ background: "rgba(232,115,34,0.025)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="px-6 pt-2 pb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>个人生产栗分配明细</span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.22)" }}>·</span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.22)" }}>当前余额 {member.personalTokens.toLocaleString()} 颗</span>
                </div>
                {/* Detail table header */}
                <div className="grid text-xs px-3 py-2 rounded-lg mb-0.5"
                  style={{ gridTemplateColumns: "1.5fr 1.6fr 0.65fr 1fr", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)" }}>
                  <div>时间</div><div>备注</div><div>金额（颗）</div><div>操作人</div>
                </div>
                {allocHistory.length === 0 ? (
                  <div className="text-xs text-center py-4" style={{ color: "rgba(255,255,255,0.22)" }}>暂无分配记录</div>
                ) : (
                  allocHistory.map((tx) => (
                    <div key={tx.id} className="grid items-center text-xs px-3 py-2 hover:bg-white/5 rounded-lg"
                      style={{ gridTemplateColumns: "1.5fr 1.6fr 0.65fr 1fr" }}>
                      <div style={{ color: "rgba(255,255,255,0.4)" }}>{tx.time}</div>
                      <div style={{ color: "rgba(255,255,255,0.55)" }}>{tx.remark}</div>
                      <div style={{ color: "#22c55e" }}>+{tx.amount}</div>
                      <div style={{ color: "rgba(255,255,255,0.4)" }}>{tx.operator}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          </div>
          );
        })}
      </div>

      {/* Transfer Ownership Dialog */}
      {showTransferDialog && (
        <TransferOwnershipDialog members={members} onClose={() => setShowTransferDialog(false)} onConfirm={handleTransferOwnership} />
      )}

      {/* Allocate Personal Token Dialog */}
      {allocatePersonalTarget && (
        <AllocatePersonalTokenDialog member={allocatePersonalTarget} onClose={() => setAllocatePersonalTarget(null)} />
      )}

      {/* Status Toggle Confirm */}
      {statusTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-96 rounded-2xl p-6 shadow-2xl" style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: statusTarget.status === "正常" ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.12)" }}>
                <AlertTriangle size={18} style={{ color: statusTarget.status === "正常" ? "#ef4444" : "#22c55e" }} />
              </div>
              <h3 className="text-white">{statusTarget.status === "正常" ? "确认停用成员" : "确认恢复成员"}</h3>
            </div>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
              {statusTarget.status === "正常"
                ? <>停用后 <strong className="text-white">{statusTarget.name}</strong> 将无法使用团队空间功能，其已分配的生产栗暂时冻结，可随时恢复。</>
                : <>确认恢复 <strong className="text-white">{statusTarget.name}</strong> 的账号状态为正常，恢复后可正常使用团队空间。</>
              }
            </p>
            <div className="flex gap-3">
              <button onClick={() => setStatusTarget(null)} className="flex-1 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>取消</button>
              <button onClick={handleStatusToggle} className="flex-1 py-2.5 rounded-xl text-sm text-white transition-opacity hover:opacity-80"
                style={{ background: statusTarget.status === "正常" ? "#ef4444" : "#22c55e" }}>
                {statusTarget.status === "正常" ? "确认停用" : "确认恢复"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirm Modal */}
      {removeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-96 rounded-2xl p-6 shadow-2xl" style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239,68,68,0.15)" }}>
                <AlertTriangle size={18} style={{ color: "#ef4444" }} />
              </div>
              <h3 className="text-white">确认移除成员</h3>
            </div>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
              移除后其空间资产归属所有者、生产栗划入团队账户，操作无法恢复，请确认是否移除 <strong className="text-white">{removeTarget.name}</strong>？
            </p>
            <div className="flex gap-3">
              <button onClick={() => setRemoveTarget(null)} className="flex-1 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>取消</button>
              <button onClick={handleRemove} className="flex-1 py-2.5 rounded-xl text-sm text-white transition-opacity hover:opacity-80"
                style={{ background: "#ef4444" }}>确认移除</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Enterprise Modal */}
      {showEditEnt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-[420px] rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <h3 className="text-white">编辑团队信息</h3>
              <button onClick={() => setShowEditEnt(false)} style={{ color: "rgba(255,255,255,0.4)" }}><X size={18} /></button>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div>
                <label className="text-xs mb-3 block" style={{ color: "rgba(255,255,255,0.4)" }}>团队头像</label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div onClick={() => editEntFileRef.current?.click()}
                      className="w-16 h-16 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden group relative"
                      style={{ background: editEntAvatarPreview ? "transparent" : "#C45C1A", fontSize: "24px" }}>
                      {editEntAvatarPreview ? <img src={editEntAvatarPreview} alt="preview" className="w-full h-full object-cover" /> : <span className="text-white">{editEntName.charAt(0) || "企"}</span>}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.5)" }}>
                        <Camera size={18} style={{ color: "rgba(255,255,255,0.9)" }} />
                      </div>
                    </div>
                    <button onClick={() => editEntFileRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "#E87322", border: "2px solid #1E1A14" }}>
                      <Camera size={9} className="text-white" />
                    </button>
                  </div>
                  <div>
                    <div className="text-xs text-white mb-1">点击更换头像</div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>支持 JPG、PNG，建议 200×200</div>
                    {editEntAvatarPreview && (
                      <button onClick={() => setEditEntAvatarPreview(null)} className="text-xs mt-1 transition-opacity hover:opacity-70" style={{ color: "rgba(239,68,68,0.7)" }}>移除图片</button>
                    )}
                  </div>
                  <input ref={editEntFileRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const file = e.target.files?.[0]; if (file) { const r = new FileReader(); r.onload = (ev) => setEditEntAvatarPreview(ev.target?.result as string); r.readAsDataURL(file); } }} />
                </div>
              </div>
              <div>
                <label className="text-xs mb-2 block" style={{ color: "rgba(255,255,255,0.4)" }}>团队名称</label>
                <input type="text" value={editEntName} onChange={(e) => e.target.value.length <= 50 && setEditEntName(e.target.value)}
                  placeholder="请输入团队名称" maxLength={50}
                  className="w-full px-3 py-2.5 rounded-xl outline-none text-sm text-white"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#E87322"; }}
                  onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"; }} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowEditEnt(false)} className="flex-1 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-80"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>取消</button>
                <button onClick={saveEditEnt} className="flex-1 py-2.5 rounded-xl text-sm text-white transition-opacity hover:opacity-80"
                  style={{ background: "#E87322" }}>保存</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-[460px] rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-2">
                {inviteView === "settings" && (
                  <button onClick={() => { setInviteView("main"); setShowExpiryDropdown(false); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80 flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
                    <ArrowLeft size={15} />
                  </button>
                )}
                <h3 className="text-white">{inviteView === "main" ? "邀请成员" : "链接设置"}</h3>
              </div>
              <button onClick={closeInviteModal} style={{ color: "rgba(255,255,255,0.4)" }}><X size={18} /></button>
            </div>

            {inviteView === "main" && (
              <div className="p-6 flex flex-col gap-5">
                <div>
                  <label className="text-xs mb-2 block" style={{ color: "rgba(255,255,255,0.4)" }}>当前邀请链接</label>
                  <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Link size={13} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
                    <span className="flex-1 text-xs truncate" style={{ color: "rgba(255,255,255,0.5)" }}>https://shanhai.ai/invite/ent8823/abc123xyz</span>
                    <button onClick={handleCopyLink} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg flex-shrink-0 transition-opacity hover:opacity-80" style={{ background: "#E87322", color: "#fff" }}>
                      <Copy size={11} />复制
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(232,115,34,0.15)" }}>
                      <Clock size={14} style={{ color: "#E87322" }} />
                    </div>
                    <div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>剩余有效期</div>
                      <div className="text-sm text-white mt-0.5">{remainingDays === "永久" ? "永久有效" : `${remainingDays} 天`}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(59,130,246,0.15)" }}>
                      <Hash size={14} style={{ color: "#3b82f6" }} />
                    </div>
                    <div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>剩余使用次数</div>
                      <div className="text-sm text-white mt-0.5">{remainingUses === 0 ? "不限次数" : `${remainingUses} 次`}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div>
                    <div className="text-sm text-white">加入需要审核</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>开启后，成员通过链接申请加入时需管理员审批通过</div>
                  </div>
                  <button onClick={() => setRequireApproval(!requireApproval)}
                    className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors ml-4"
                    style={{ background: requireApproval ? "#E87322" : "rgba(255,255,255,0.12)" }}>
                    <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                      style={{ transform: requireApproval ? "translateX(22px)" : "translateX(2px)" }} />
                  </button>
                </div>
                <button onClick={() => setInviteView("settings")}
                  className="w-full py-2.5 rounded-xl text-sm transition-opacity hover:opacity-80 flex items-center justify-center gap-2"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <Edit2 size={13} />编辑链接设置
                </button>
              </div>
            )}

            {inviteView === "settings" && (
              <div className="p-6 flex flex-col gap-5">
                <div>
                  <label className="text-xs mb-2 block" style={{ color: "rgba(255,255,255,0.4)" }}>链接有效期</label>
                  <div className="relative">
                    <button onClick={() => setShowExpiryDropdown(!showExpiryDropdown)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}>
                      <span>{linkExpiry}</span><ChevronDown size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
                    </button>
                    {showExpiryDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20 shadow-2xl"
                        style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}>
                        {EXPIRY_OPTIONS.map(opt => (
                          <button key={opt} onClick={() => { setLinkExpiry(opt); setShowExpiryDropdown(false); }}
                            className="w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors text-left"
                            style={{ color: linkExpiry === opt ? "#E87322" : "rgba(255,255,255,0.7)" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
                            <span>{opt}</span>{linkExpiry === opt && <Check size={13} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs mb-2 block" style={{ color: "rgba(255,255,255,0.4)" }}>有效使用次数</label>
                  <input type="number" min="0" value={linkUsageLimit} onChange={(e) => setLinkUsageLimit(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl outline-none text-sm text-white"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#E87322"; }}
                    onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"; }}
                    placeholder="如：100" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setInviteView("main")} className="flex-1 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-80"
                    style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>取消</button>
                  <button onClick={handleGenerateNewLink} className="flex-1 py-2.5 rounded-xl text-sm text-white transition-opacity hover:opacity-80"
                    style={{ background: "#E87322" }}>生成新链接</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Transfer Ownership Dialog ──────────────────────────────────────────────── */
function TransferOwnershipDialog({ members, onClose, onConfirm }: { members: Member[]; onClose: () => void; onConfirm: (targetId: string) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const eligible = members.filter((m) => !m.isSelf && m.status === "正常");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div className="w-[480px] rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(239,68,68,0.12)" }}>
              <Crown size={15} style={{ color: "#ef4444" }} />
            </div>
            <h3 className="text-white">转让空间所有权</h3>
          </div>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.4)" }}><X size={18} /></button>
        </div>
        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}>
            <AlertTriangle size={15} style={{ color: "#ef4444", flexShrink: 0, marginTop: 2 }} />
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.8 }}>
              转让后您将失去空间所有者权限，<strong className="text-white">自动降级为普通成员</strong>，且无法撤销。新所有者将拥有团队所有管理权限，请谨慎操作。
            </div>
          </div>
          <div>
            <div className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>选择新的空间所有者（{eligible.length} 位可选成员）</div>
            <div className="flex flex-col gap-2 max-h-52 overflow-auto">
              {eligible.map((m) => (
                <button key={m.id} onClick={() => setSelectedId(m.id)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                  style={{ background: selectedId === m.id ? "rgba(232,115,34,0.1)" : "rgba(255,255,255,0.03)", border: `1px solid ${selectedId === m.id ? "rgba(232,115,34,0.4)" : "rgba(255,255,255,0.07)"}` }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0" style={{ background: m.avatarColor }}>{m.avatarLetter}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white">{m.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{m.department} · {m.role}</div>
                  </div>
                  <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                    style={{ background: selectedId === m.id ? "#E87322" : "transparent", border: `1px solid ${selectedId === m.id ? "#E87322" : "rgba(255,255,255,0.2)"}` }}>
                    {selectedId === m.id && <Check size={9} className="text-white" />}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>取消</button>
            <button onClick={() => selectedId && onConfirm(selectedId)} disabled={!selectedId}
              className="flex-1 py-2.5 rounded-xl text-sm text-white transition-opacity"
              style={{ background: selectedId ? "#ef4444" : "rgba(239,68,68,0.25)", cursor: selectedId ? "pointer" : "not-allowed" }}>
              确认转让所有权
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
