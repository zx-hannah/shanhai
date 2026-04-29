import { useState } from "react";
import {
  ChevronDown, Coins, Users, FolderOpen, Calendar, X, Check,
  Search, AlertTriangle, TrendingDown, ArrowRightLeft,
  Download, SendHorizonal, ChevronUp, Edit2, Wallet, User,
} from "lucide-react";
import { toast } from "sonner";
import { QuotaConfigDialog } from "./QuotaConfigDialog";

// ── Inline editable budget cell ───────────────────────────────────────────────
function EditableBudgetCell({ value, onSave }: { value: number; onSave: (v: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value.toString());

  const commit = () => {
    const n = parseInt(draft);
    if (!isNaN(n) && n > 0) onSave(n);
    else setDraft(value.toString());
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        type="number"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(value.toString()); setEditing(false); } }}
        className="text-xs px-2 py-1 rounded-lg outline-none text-white w-full"
        style={{ background: "rgba(232,115,34,0.12)", border: "1px solid #E87322", maxWidth: "80px" }}
        autoFocus
      />
    );
  }
  return (
    <button onClick={() => { setDraft(value.toString()); setEditing(true); }}
      className="flex items-center gap-1 group text-xs hover:opacity-80"
      style={{ color: "rgba(255,255,255,0.75)" }} title="点击编辑项目预算">
      <span>{value.toLocaleString()}</span>
      <Edit2 size={10} className="opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" style={{ color: "#E87322" }} />
    </button>
  );
}

// ── CSV download helper ───────────────────────────────────────────────────────
function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const bom = "﻿";
  const content = bom + [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast.success(`已导出 ${filename}`);
}

// ── Transfer Dialog (personal → enterprise) ───────────────────────────────────
function TransferToEnterpriseDialog({ onClose }: { onClose: () => void }) {
  const [amount, setAmount] = useState("");
  const personalBalance = 2340;

  const handleConfirm = () => {
    const n = Number(amount);
    if (!amount || isNaN(n) || n <= 0) { toast.error("请输入有效的转账数量"); return; }
    if (n > personalBalance) { toast.error("转账数量超过个人账户余额"); return; }
    toast.success(`已将 ${n} 颗生产栗从个人账户转入团队账户`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div className="w-[400px] rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <h3 className="text-white">转入团队账户</h3>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>将个人生产栗转移至团队可分配额度</p>
          </div>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.4)" }}><X size={18} /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>个人账户</span>
              <span className="text-sm text-white">{personalBalance.toLocaleString()} 颗</span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="flex items-center gap-1.5">
                <div className="h-px" style={{ width: "32px", background: "rgba(232,115,34,0.4)" }} />
                <ArrowRightLeft size={14} style={{ color: "#E87322" }} />
                <div className="h-px" style={{ width: "32px", background: "rgba(232,115,34,0.4)" }} />
              </div>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>团队账户</span>
              <span className="text-sm text-white">1,150 颗</span>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>转账数量（颗）<span className="text-red-400">*</span></label>
              <button onClick={() => setAmount(String(personalBalance))} className="text-xs px-2 py-0.5 rounded-md hover:opacity-80"
                style={{ background: "rgba(232,115,34,0.12)", color: "#E87322", border: "1px solid rgba(232,115,34,0.25)" }}>
                全部转入（{personalBalance.toLocaleString()}）
              </button>
            </div>
            <input type="number" min="1" max={personalBalance} value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder={`最多 ${personalBalance.toLocaleString()} 颗`}
              className="w-full px-3 py-2.5 rounded-xl outline-none text-sm text-white"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#E87322"; }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"; }} />
          </div>
          <div className="px-3 py-2.5 rounded-xl text-xs" style={{ background: "rgba(232,115,34,0.06)", border: "1px solid rgba(232,115,34,0.15)", color: "rgba(255,255,255,0.45)", lineHeight: 1.7 }}>转入后生产栗将进入团队可分配额度，此操作不可撤销。</div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>取消</button>
            <button onClick={handleConfirm} className="flex-1 py-2.5 rounded-xl text-sm text-white hover:opacity-80"
              style={{ background: "#E87322" }}>确认转入</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
type MetricTab = "teamBalance" | "teamAllocatable" | "projectRemaining" | "personalRemaining";

// ─── Mock Data ────────────────────────────────────────────────────────────────
const ENTERPRISE_PROJECTS = [
  { id: "p1", name: "东方神话·第一季" },
  { id: "p2", name: "星际征途" },
  { id: "p3", name: "山海奇谭" },
  { id: "p4", name: "动画短片集" },
];

interface ProjectData {
  id: string;
  name: string;
  members: number;
  totalBalance: number;
  projectBalance: number;
  consumed: number;
  allocated: number;
}

const INITIAL_PROJECTS_DATA: ProjectData[] = [
  { id: "p1", name: "东方神话·第一季", members: 4, totalBalance: 680, projectBalance: 800, consumed: 2300, allocated: 3100 },
  { id: "p2", name: "星际征途",         members: 3, totalBalance: 350, projectBalance: 150, consumed: 1200, allocated: 1350 },
  { id: "p3", name: "山海奇谭",         members: 3, totalBalance: 0,   projectBalance: 0,   consumed: 980,  allocated: 980  },
  { id: "p4", name: "动画短片集",       members: 2, totalBalance: 195, projectBalance: 500, consumed: 420,  allocated: 900  },
];

// ── Team Balance Transaction Records ──
interface TeamBalanceTx {
  id: string;
  time: string;
  type: "充值" | "转账" | "消费" | "退款";
  operator: string;
  operatorColor: string;
  operatorLetter: string;
  project?: string;
  description: string;
  amount: number;
}

const TEAM_BALANCE_TX: TeamBalanceTx[] = [
  { id: "1", time: "2024-04-02 09:00", type: "充值", operator: "Bob", operatorColor: "#E87322", operatorLetter: "B", description: "购买生产栗套餐 x500", amount: 500 },
  { id: "2", time: "2024-04-01 14:23", type: "转账", operator: "Alice", operatorColor: "#7B3FC4", operatorLetter: "A", project: "-", description: "个人生产栗转入团队", amount: 300 },
  { id: "3", time: "2024-04-01 11:05", type: "消费", operator: "Alice", operatorColor: "#7B3FC4", operatorLetter: "A", project: "东方神话·第一季", description: "图片高清生成 x10", amount: -50 },
  { id: "4", time: "2024-03-30 16:40", type: "充值", operator: "Bob", operatorColor: "#E87322", operatorLetter: "B", description: "购买生产栗套餐", amount: 200 },
  { id: "5", time: "2024-03-29 09:15", type: "消费", operator: "Charlie", operatorColor: "#2A6FC4", operatorLetter: "C", project: "山海奇谭", description: "视频超分 x5", amount: -80 },
  { id: "6", time: "2024-03-28 20:33", type: "消费", operator: "Eve", operatorColor: "#2AC4A2", operatorLetter: "E", project: "-", description: "图片高清生成（项目外单点）", amount: -120 },
  { id: "7", time: "2024-03-27 14:00", type: "退款", operator: "Diana", operatorColor: "#C42A6F", operatorLetter: "D", project: "东方神话·第一季", description: "任务失败退款", amount: 30 },
  { id: "8", time: "2024-03-26 10:00", type: "转账", operator: "Bob", operatorColor: "#E87322", operatorLetter: "B", project: "-", description: "个人生产栗转入团队", amount: 150 },
  { id: "9", time: "2024-03-25 14:00", type: "退款", operator: "Bob", operatorColor: "#E87322", operatorLetter: "B", project: "-", description: "单点任务失败退款", amount: 25 },
  { id: "10", time: "2024-03-20 11:00", type: "充值", operator: "Charlie", operatorColor: "#2A6FC4", operatorLetter: "C", description: "购买生产栗套餐 x200", amount: 200 },
];

const TX_COLORS: Record<string, string> = {
  "消费": "#ef4444", "充值": "#22c55e", "退款": "#3b82f6", "转账": "#8b5cf6",
};

// ── Team Allocatable Quota Records ──
interface AllocatableTx {
  id: string;
  time: string;
  type: "充值" | "转账" | "分配" | "回收";
  operator: string;
  operatorColor: string;
  operatorLetter: string;
  target: string;
  description: string;
  amount: number;
}

const ALLOCATABLE_TX: AllocatableTx[] = [
  { id: "1", time: "2024-04-02 10:00", type: "分配", operator: "Bob", operatorColor: "#E87322", operatorLetter: "B", target: "Alice", description: "分配个人生产栗 300 颗", amount: -300 },
  { id: "2", time: "2024-04-01 14:00", type: "分配", operator: "Bob", operatorColor: "#E87322", operatorLetter: "B", target: "东方神话·第一季", description: "项目配额从 2800 调整到 3100", amount: -300 },
  { id: "3", time: "2024-04-01 09:00", type: "分配", operator: "Bob", operatorColor: "#E87322", operatorLetter: "B", target: "Charlie", description: "分配个人生产栗 100 颗", amount: -100 },
  { id: "4", time: "2024-03-30 16:00", type: "分配", operator: "Bob", operatorColor: "#E87322", operatorLetter: "B", target: "星际征途", description: "项目配额从 1000 调整到 1350", amount: -350 },
  { id: "5", time: "2024-03-28 11:00", type: "转账", operator: "Charlie", operatorColor: "#2A6FC4", operatorLetter: "C", target: "团队账户", description: "个人生产栗转入团队可分配额度", amount: 200 },
  { id: "6", time: "2024-03-26 10:00", type: "分配", operator: "Bob", operatorColor: "#E87322", operatorLetter: "B", target: "动画短片集", description: "项目配额从 600 调整到 900", amount: -300 },
  { id: "7", time: "2024-03-25 14:30", type: "回收", operator: "Alice", operatorColor: "#7B3FC4", operatorLetter: "A", target: "Bob", description: "回收个人生产栗 100 颗", amount: 100 },
  { id: "8", time: "2024-03-20 09:00", type: "分配", operator: "Bob", operatorColor: "#E87322", operatorLetter: "B", target: "山海奇谭", description: "项目配额从 800 调整到 980", amount: -180 },
  { id: "9", time: "2024-03-18 14:00", type: "充值", operator: "Alice", operatorColor: "#7B3FC4", operatorLetter: "A", target: "团队账户", description: "购买生产栗套餐 x500", amount: 500 },
  { id: "10", time: "2024-03-15 10:00", type: "回收", operator: "Bob", operatorColor: "#E87322", operatorLetter: "B", target: "星际征途", description: "项目额度从 1550 调整到 1350", amount: 200 },
];

// ── Project Consumption/Refund Records ──
interface ProjectConsumptionTx {
  id: string;
  time: string;
  type: "消费" | "退款";
  member: string;
  memberColor: string;
  memberLetter: string;
  description: string;
  amount: number;
}

const PROJECT_CONSUMPTION_TX: Record<string, ProjectConsumptionTx[]> = {
  p1: [
    { id: "1", time: "2024-04-02 15:30", type: "消费", member: "Alice", memberColor: "#7B3FC4", memberLetter: "A", description: "图片高清生成 x20", amount: -120 },
    { id: "2", time: "2024-04-02 10:15", type: "消费", member: "Bob", memberColor: "#E87322", memberLetter: "B", description: "无限画布创作", amount: -80 },
    { id: "3", time: "2024-04-01 14:23", type: "退款", member: "Alice", memberColor: "#7B3FC4", memberLetter: "A", description: "任务失败退款", amount: 30 },
    { id: "4", time: "2024-04-01 11:05", type: "消费", member: "Charlie", memberColor: "#2A6FC4", memberLetter: "C", description: "视频超分 x5", amount: -95 },
    { id: "5", time: "2024-03-29 09:00", type: "消费", member: "Bob", memberColor: "#E87322", memberLetter: "B", description: "语音克隆 x3", amount: -45 },
    { id: "6", time: "2024-03-28 20:33", type: "消费", member: "Eve", memberColor: "#2AC4A2", memberLetter: "E", description: "故事板生成", amount: -120 },
    { id: "7", time: "2024-03-27 14:00", type: "退款", member: "Diana", memberColor: "#C42A6F", memberLetter: "D", description: "任务失败退款", amount: 30 },
  ],
  p2: [
    { id: "1", time: "2024-04-02 11:00", type: "消费", member: "Eve", memberColor: "#2AC4A2", memberLetter: "E", description: "画布渲染 x10", amount: -85 },
    { id: "2", time: "2024-04-01 16:30", type: "消费", member: "Diana", memberColor: "#C42A6F", memberLetter: "D", description: "角色生成 x8", amount: -60 },
    { id: "3", time: "2024-03-30 09:15", type: "退款", member: "Eve", memberColor: "#2AC4A2", memberLetter: "E", description: "任务失败退款", amount: 15 },
    { id: "4", time: "2024-03-28 14:00", type: "消费", member: "Diana", memberColor: "#C42A6F", memberLetter: "D", description: "视频超分 x6", amount: -75 },
  ],
  p3: [
    { id: "1", time: "2024-03-20 14:00", type: "消费", member: "Charlie", memberColor: "#2A6FC4", memberLetter: "C", description: "视频超分 x5", amount: -80 },
    { id: "2", time: "2024-03-15 10:00", type: "消费", member: "Alice", memberColor: "#7B3FC4", memberLetter: "A", description: "场景生成 x12", amount: -150 },
    { id: "3", time: "2024-03-10 16:45", type: "退款", member: "Bob", memberColor: "#E87322", memberLetter: "B", description: "任务失败退款", amount: 20 },
    { id: "4", time: "2024-02-28 11:30", type: "消费", member: "Bob", memberColor: "#E87322", memberLetter: "B", description: "图片高清生成 x15", amount: -90 },
  ],
  p4: [
    { id: "1", time: "2024-04-01 15:00", type: "消费", member: "Bob", memberColor: "#E87322", memberLetter: "B", description: "动画渲染 x6", amount: -120 },
    { id: "2", time: "2024-03-28 09:30", type: "消费", member: "Eve", memberColor: "#2AC4A2", memberLetter: "E", description: "角色设计 x4", amount: -80 },
    { id: "3", time: "2024-03-25 14:00", type: "退款", member: "Bob", memberColor: "#E87322", memberLetter: "B", description: "任务失败退款", amount: 25 },
  ],
};

// ── Member Data ──
interface MemberData {
  id: string;
  name: string;
  avatarColor: string;
  letter: string;
  projectCount: number;
  enterpriseBalance: number;
  projectBalances: Record<string, number>;
  consumed: number;
  personalConsumed: number;
  allocated: number;
}

const MEMBERS_DATA: MemberData[] = [
  { id: "1", name: "Bob（我）", avatarColor: "#E87322", letter: "B", projectCount: 4, enterpriseBalance: 500, projectBalances: { p1: 200, p2: 0, p3: 0, p4: 80 }, consumed: 1200, personalConsumed: 200, allocated: 1700 },
  { id: "2", name: "Alice", avatarColor: "#7B3FC4", letter: "A", projectCount: 2, enterpriseBalance: 300, projectBalances: { p1: 150, p2: 80, p3: 0, p4: 0 }, consumed: 800, personalConsumed: 150, allocated: 1100 },
  { id: "3", name: "Charlie", avatarColor: "#2A6FC4", letter: "C", projectCount: 2, enterpriseBalance: 150, projectBalances: { p1: 80, p2: 0, p3: 0, p4: 0 }, consumed: 450, personalConsumed: 80, allocated: 600 },
  { id: "4", name: "Diana", avatarColor: "#C42A6F", letter: "D", projectCount: 2, enterpriseBalance: 0, projectBalances: { p1: 50, p2: 130, p3: 0, p4: 0 }, consumed: 620, personalConsumed: 50, allocated: 620 },
  { id: "5", name: "Eve", avatarColor: "#2AC4A2", letter: "E", projectCount: 2, enterpriseBalance: 200, projectBalances: { p1: 0, p2: 0, p3: 0, p4: 100 }, consumed: 310, personalConsumed: 100, allocated: 510 },
];

// ── Member Token History (for personal remaining detail) ──
interface MemberTokenTx {
  id: string;
  time: string;
  source: string;
  type: "分配" | "回收" | "消费" | "退款";
  subtype?: "个人" | "项目";
  amount: number;
  operator: string;
}

const MEMBER_TOKEN_HISTORY: Record<string, MemberTokenTx[]> = {
  "1": [
    { id: "1", time: "2024-04-02 10:00", source: "分配个人生产栗给成员", type: "分配", subtype: "个人", amount: 200, operator: "Bob（自己）" },
    { id: "2", time: "2024-04-01 14:23", source: "分配个人生产栗给成员", type: "分配", subtype: "个人", amount: 500, operator: "Bob（自己）" },
    { id: "3", time: "2024-04-01 10:00", source: "分配个人生产栗给成员", type: "分配", subtype: "项目", amount: 200, operator: "Bob（自己）" },
    { id: "4", time: "2024-03-28 09:00", source: "图片高清生成 x20", type: "消费", amount: -120, operator: "系统" },
    { id: "5", time: "2024-03-20 11:00", source: "任务失败退款", type: "退款", amount: 25, operator: "系统" },
  ],
  "2": [
    { id: "1", time: "2024-04-02 10:00", source: "分配个人生产栗给成员", type: "分配", subtype: "项目", amount: 300, operator: "Bob" },
    { id: "2", time: "2024-04-01 11:00", source: "分配个人生产栗给成员", type: "分配", subtype: "个人", amount: 300, operator: "Bob" },
    { id: "3", time: "2024-03-25 14:30", source: "回收个人生产栗", type: "回收", amount: -100, operator: "Bob" },
    { id: "4", time: "2024-03-15 11:00", source: "分配个人生产栗给成员", type: "分配", subtype: "项目", amount: 150, operator: "Bob" },
    { id: "5", time: "2024-03-01 09:00", source: "分配个人生产栗给成员", type: "分配", subtype: "个人", amount: 200, operator: "Bob" },
    { id: "6", time: "2024-03-10 16:45", source: "任务失败退款", type: "退款", amount: 20, operator: "系统" },
  ],
  "3": [
    { id: "1", time: "2024-03-15 11:00", source: "分配个人生产栗给成员", type: "分配", subtype: "项目", amount: 100, operator: "Bob" },
    { id: "2", time: "2024-03-15 10:00", source: "分配个人生产栗给成员", type: "分配", subtype: "个人", amount: 200, operator: "Bob" },
    { id: "3", time: "2024-02-20 10:00", source: "分配个人生产栗给成员", type: "分配", subtype: "个人", amount: 150, operator: "Bob" },
  ],
  "4": [
    { id: "1", time: "2024-03-20 16:00", source: "分配个人生产栗给成员", type: "分配", subtype: "项目", amount: 130, operator: "Bob" },
    { id: "2", time: "2024-03-10 09:00", source: "分配个人生产栗给成员", type: "分配", subtype: "项目", amount: 50, operator: "Bob" },
    { id: "3", time: "2024-03-27 14:00", source: "任务失败退款", type: "退款", amount: 30, operator: "系统" },
  ],
  "5": [
    { id: "1", time: "2024-04-01 09:00", source: "分配个人生产栗给成员", type: "分配", subtype: "项目", amount: 100, operator: "Bob" },
    { id: "2", time: "2024-04-01 08:30", source: "分配个人生产栗给成员", type: "分配", subtype: "个人", amount: 300, operator: "Bob" },
    { id: "3", time: "2024-03-15 14:00", source: "分配个人生产栗给成员", type: "分配", subtype: "个人", amount: 200, operator: "Bob" },
    { id: "4", time: "2024-03-28 20:33", source: "视频超分 x5", type: "消费", amount: -80, operator: "系统" },
  ],
};

// ─── Metric Card Component ───────────────────────────────────────────────────
function MetricCard({ label, value, unit = "颗", icon, color, bg, isActive, onClick, description }: {
  label: string; value: number | string; unit?: string;
  icon: React.ReactNode; color: string; bg: string;
  isActive: boolean; onClick: () => void; description: string;
}) {
  return (
    <button
      onClick={onClick}
      className="p-4 rounded-2xl text-left transition-all w-full"
      style={{
        background: isActive ? bg : "rgba(255,255,255,0.03)",
        border: `2px solid ${isActive ? color : "rgba(255,255,255,0.06)"}`,
        boxShadow: isActive ? `0 0 20px ${color}15` : "none",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
          {icon}
        </div>
        <span className="text-sm" style={{ color: isActive ? color : "rgba(255,255,255,0.5)" }}>{label}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl text-white font-semibold">{typeof value === "number" ? value.toLocaleString() : value}</span>
        <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{unit}</span>
      </div>
      <div className="text-xs" style={{ color: isActive ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.3)" }}>{description}</div>
    </button>
  );
}

// Multi-select project filter (reusable)
function MultiProjectFilter({
  selectedIds,
  onChange,
}: {
  selectedIds: Set<string>;
  onChange: (ids: Set<string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasFilter = selectedIds.size > 0;
  const toggle = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    onChange(next);
  };
  const label = hasFilter
    ? selectedIds.size === 1
      ? ENTERPRISE_PROJECTS.find((p) => selectedIds.has(p.id))?.name ?? ""
      : `已选 ${selectedIds.size} 个项目`
    : "全部项目";
  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
        style={{
          background: hasFilter ? "rgba(232,115,34,0.15)" : "rgba(255,255,255,0.06)",
          border: `1px solid ${hasFilter ? "rgba(232,115,34,0.3)" : "rgba(255,255,255,0.1)"}`,
          color: hasFilter ? "#E87322" : "rgba(255,255,255,0.7)",
        }}
      >
        <FolderOpen size={12} />
        <span>{label}</span>
        <ChevronDown size={11} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 rounded-xl overflow-hidden z-20 shadow-2xl"
          style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)", minWidth: "190px" }}>
          <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={() => onChange(new Set(ENTERPRISE_PROJECTS.map((p) => p.id)))} className="text-xs hover:opacity-80" style={{ color: "#E87322" }}>全选</button>
            <button onClick={() => onChange(new Set())} className="text-xs hover:opacity-80" style={{ color: "rgba(255,255,255,0.4)" }}>清除</button>
          </div>
          {ENTERPRISE_PROJECTS.map((p) => {
            const checked = selectedIds.has(p.id);
            return (
              <button key={p.id} onClick={() => toggle(p.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left hover:bg-white/5">
                <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                  style={{ background: checked ? "#E87322" : "transparent", border: `1px solid ${checked ? "#E87322" : "rgba(255,255,255,0.2)"}` }}>
                  {checked && <Check size={9} className="text-white" />}
                </div>
                <span style={{ color: checked ? "#E87322" : "rgba(255,255,255,0.7)" }}>{p.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Inline quota edit dialog
function QuotaEditDialog({
  projectName, currentQuota, consumed, onClose, onSave,
}: {
  projectName: string; currentQuota: number; consumed: number;
  onClose: () => void; onSave: (q: number) => void;
}) {
  const [quota, setQuota] = useState(currentQuota.toString());
  const n = parseInt(quota) || 0;
  const isValid = n > 0 && n >= consumed;
  const handleSave = () => {
    if (!isValid) { toast.error(`配额不能小于已消耗数量（${consumed.toLocaleString()} 颗）`); return; }
    onSave(n);
  };
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-[400px] rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <h3 className="text-white">修改项目配额</h3>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{projectName}</p>
          </div>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.4)" }}><X size={18} /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>当前已消耗</span>
            <span className="text-sm" style={{ color: "#E87322" }}>{consumed.toLocaleString()} 颗</span>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>配额数量（颗）<span className="text-red-400 ml-0.5">*</span></label>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>最小值 ≥ {consumed.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <input type="number" min={consumed} value={quota} onChange={(e) => setQuota(e.target.value)}
                className="flex-1 bg-transparent outline-none text-white text-sm" placeholder="请输入配额数量" autoFocus
                onFocus={(e) => { (e.target as HTMLInputElement).parentElement!.style.borderColor = "#E87322"; }}
                onBlur={(e) => { (e.target as HTMLInputElement).parentElement!.style.borderColor = "rgba(255,255,255,0.1)"; }} />
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>颗</span>
            </div>
            {!isValid && quota && n > 0 && (
              <p className="text-xs mt-1.5" style={{ color: "#ef4444" }}>配额不能小于已消耗数量（{consumed.toLocaleString()} 颗）</p>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>取消</button>
            <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm text-white hover:opacity-80"
              style={{ background: "#E87322" }}>保存</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Allocate Dialog ───────────────────────────────────────────────────────────
type AllocateTarget = { type: "member"; id: string; name: string } | { type: "project"; id: string; name: string } | null;

function AllocateDialog({ target, onClose }: { target: NonNullable<AllocateTarget>; onClose: () => void }) {
  const [selectedProjectId, setSelectedProjectId] = useState(ENTERPRISE_PROJECTS[0].id);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [amount, setAmount] = useState("");
  const [showQuotaConfig, setShowQuotaConfig] = useState(false);

  const selectedProject = ENTERPRISE_PROJECTS.find((p) => p.id === selectedProjectId);

  const handleConfirm = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { toast.error("请输入有效的分配数量"); return; }
    toast.success(`已向 ${target.name} 分配 ${amount} 颗`);
    onClose();
  };

  if (target.type === "project") {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.75)" }}>
        <div className="w-[400px] rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div>
              <h3 className="text-white">分配生产栗</h3>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>给项目：{target.name}</p>
            </div>
            <button onClick={onClose} style={{ color: "rgba(255,255,255,0.4)" }}><X size={18} /></button>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <div className="px-3 py-2.5 rounded-xl text-xs" style={{ background: "rgba(232,115,34,0.06)", border: "1px solid rgba(232,115,34,0.15)" }}>
              <span style={{ color: "rgba(255,255,255,0.4)" }}>团队账户剩余可分配：</span>
              <span className="text-white">1,150 颗</span>
            </div>
            <div>
              <label className="text-xs mb-2 block" style={{ color: "rgba(255,255,255,0.4)" }}>分配数量（颗）<span className="text-red-400">*</span></label>
              <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="请输入分配数量"
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm text-white"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#E87322"; }}
                onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"; }} />
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>取消</button>
              <button onClick={handleConfirm} className="flex-1 py-2.5 rounded-xl text-sm text-white hover:opacity-80"
                style={{ background: "#E87322" }}>确认分配</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.75)" }}
        onClick={() => setShowProjectDropdown(false)}>
        <div className="w-[440px] rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}
          onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div>
              <h3 className="text-white">分配项目生产栗</h3>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>给成员：{target.name}</p>
            </div>
            <button onClick={onClose} style={{ color: "rgba(255,255,255,0.4)" }}><X size={18} /></button>
          </div>
          <div className="p-6 flex flex-col gap-5">
            <div>
              <label className="text-xs mb-2 block" style={{ color: "rgba(255,255,255,0.4)" }}>选择项目 <span className="text-red-400">*</span></label>
              <div className="relative">
                <button onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}>
                  <span>{selectedProject?.name}</span>
                  <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
                </button>
                {showProjectDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20 shadow-2xl"
                    style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {ENTERPRISE_PROJECTS.map((p) => (
                      <button key={p.id} onClick={() => { setSelectedProjectId(p.id); setShowProjectDropdown(false); }}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-left hover:bg-white/5"
                        style={{ color: selectedProjectId === p.id ? "#E87322" : "rgba(255,255,255,0.7)" }}>
                        <span>{p.name}</span>
                        {selectedProjectId === p.id && <Check size={13} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>分配数量（颗）<span className="text-red-400">*</span></label>
                <button onClick={() => setShowQuotaConfig(true)}
                  className="text-xs px-2 py-1 rounded-lg hover:opacity-80"
                  style={{ background: "rgba(123,63,196,0.12)", color: "#7B3FC4", border: "1px solid rgba(123,63,196,0.2)" }}>
                  配置额度
                </button>
              </div>
              <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="请输入分配数量"
                className="w-full px-3 py-2.5 rounded-xl outline-none text-sm text-white"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#E87322"; }}
                onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)"; }} />
              <p className="text-xs mt-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>成员只能在该项目内使用这些生产栗</p>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm hover:opacity-80"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>取消</button>
              <button onClick={handleConfirm} className="flex-1 py-2.5 rounded-xl text-sm text-white hover:opacity-80"
                style={{ background: "#E87322" }}>确认分配</button>
            </div>
          </div>
        </div>
      </div>
      {showQuotaConfig && (
        <QuotaConfigDialog
          title="配置分配额度"
          subtitle={`为 ${target.name} 配置项目「${selectedProject?.name}」的额度类型`}
          currentConfig={{ type: "periodic", amount: 20000, period: "monthly" }}
          onClose={() => setShowQuotaConfig(false)}
          onSave={(config) => { console.log("Quota config:", config); setShowQuotaConfig(false); }}
        />
      )}
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ConsumptionManagement() {
  const [activeMetric, setActiveMetric] = useState<MetricTab>("teamBalance");
  const [allocateTarget, setAllocateTarget] = useState<AllocateTarget>(null);
  const [projectsData, setProjectsData] = useState(INITIAL_PROJECTS_DATA);
  const [showTransferDialog, setShowTransferDialog] = useState(false);

  // Team Balance tab state
  const [tbTxFilter, setTbTxFilter] = useState<string>("全部");
  const [tbOperatorSearch, setTbOperatorSearch] = useState("");
  const [tbDateFrom, setTbDateFrom] = useState("");
  const [tbDateTo, setTbDateTo] = useState("");
  const [showTbTypeDropdown, setShowTbTypeDropdown] = useState(false);
  const [tbProjectSearch, setTbProjectSearch] = useState("");
  const TB_TYPE_OPTIONS = ["全部", "充值", "转账", "消费", "退款"];

  // Team Allocatable tab state
  const [taTxFilter, setTaTxFilter] = useState<string>("全部");
  const [taOperatorSearch, setTaOperatorSearch] = useState("");
  const [taProjectSearch, setTaProjectSearch] = useState("");
  const [showTaTypeDropdown, setShowTaTypeDropdown] = useState(false);
  const [taDateFrom, setTaDateFrom] = useState("");
  const [taDateTo, setTaDateTo] = useState("");
  const TA_TYPE_OPTIONS = ["全部", "充值", "转账", "分配", "回收"];
  const TA_TYPE_COLORS: Record<string, string> = { "充值": "#22c55e", "转账": "#8b5cf6", "分配": "#4A9EE0", "回收": "#ef4444" };

  // Project Remaining tab state
  const [projSearch, setProjSearch] = useState("");
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  const [editCmQuotaId, setEditCmQuotaId] = useState<string | null>(null);
  const [prDateFrom, setPrDateFrom] = useState("");
  const [prDateTo, setPrDateTo] = useState("");
  const [cmProjectQuotas, setCmProjectQuotas] = useState<Record<string, number>>(
    () => Object.fromEntries(INITIAL_PROJECTS_DATA.map((p) => [p.id, p.allocated]))
  );
  const [projectBudgets, setProjectBudgets] = useState<Record<string, number>>(
    () => Object.fromEntries(INITIAL_PROJECTS_DATA.map((p) => [p.id, p.allocated]))
  );

  // Personal Remaining tab state
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [personalDateFrom, setPersonalDateFrom] = useState("");
  const [personalDateTo, setPersonalDateTo] = useState("");

  // ── Team Balance filtered ──
  const filteredTbTx = TEAM_BALANCE_TX.filter((t) => {
    const typeMatch = tbTxFilter === "全部" || t.type === tbTxFilter;
    const projectMatch = !tbProjectSearch || (t.project && t.project.toLowerCase().includes(tbProjectSearch.toLowerCase()));
    const operatorMatch = !tbOperatorSearch || t.operator.toLowerCase().includes(tbOperatorSearch.toLowerCase());
    let dateMatch = true;
    if (tbDateFrom || tbDateTo) {
      const txDate = t.time.slice(0, 10);
      if (tbDateFrom && txDate < tbDateFrom) dateMatch = false;
      if (tbDateTo && txDate > tbDateTo) dateMatch = false;
    }
    return typeMatch && dateMatch && projectMatch && operatorMatch;
  });

  // ── Team Allocatable filtered ──
  // Recharge/transfer come from TEAM_BALANCE_TX (same as team balance section)
  const teamFundTx = TEAM_BALANCE_TX.filter((t) => t.type === "充值" || t.type === "转账");
  const filteredTaTx = ALLOCATABLE_TX.filter((t) => {
    const typeMatch = taTxFilter === "全部" || t.type === taTxFilter;
    const projectMatch = !taProjectSearch
      || (t.description + t.target).toLowerCase().includes(taProjectSearch.toLowerCase());
    const operatorMatch = !taOperatorSearch || t.operator.toLowerCase().includes(taOperatorSearch.toLowerCase());
    let dateMatch = true;
    if (taDateFrom || taDateTo) {
      const txDate = t.time.slice(0, 10);
      if (taDateFrom && txDate < taDateFrom) dateMatch = false;
      if (taDateTo && txDate > taDateTo) dateMatch = false;
    }
    return typeMatch && dateMatch && projectMatch && operatorMatch;
  });

  // When filter shows only fund types (充值/转账), show from teamFundTx
  const showFundTypes = taTxFilter === "团队充值" || taTxFilter === "团队转账" || taTxFilter === "全部";
  const fundFiltered = taTxFilter === "团队充值"
    ? teamFundTx.filter((t) => t.type === "充值")
    : taTxFilter === "团队转账"
      ? teamFundTx.filter((t) => t.type === "转账")
      : teamFundTx;

  const dateFilteredFundTx = fundFiltered.filter((t) => {
    if (!taDateFrom && !taDateTo) return true;
    const txDate = t.time.slice(0, 10);
    if (taDateFrom && txDate < taDateFrom) return false;
    if (taDateTo && txDate > taDateTo) return false;
    return true;
  });

  // Normalize team fund records to match AllocatableTx display shape
  const normalizedFundTx = dateFilteredFundTx
    .filter((t) => !taOperatorSearch || t.operator.toLowerCase().includes(taOperatorSearch.toLowerCase()))
    .map((t) => ({
    id: `fund-${t.id}`,
    time: t.time,
    type: t.type === "充值" ? "充值" as const : "转账" as const,
    operator: t.operator,
    operatorColor: t.operatorColor,
    operatorLetter: t.operatorLetter,
    target: "团队账户",
    description: t.description,
    amount: t.amount,
  }));

  // Merge: when showing 全部, combine fund + allocatable; when showing specific type, show only that
  const mergedTaTx = taTxFilter === "全部"
    ? [...normalizedFundTx, ...filteredTaTx].sort((a, b) => b.time.localeCompare(a.time))
    : taTxFilter === "充值" || taTxFilter === "转账"
      ? normalizedFundTx
      : filteredTaTx;

  // ── Computed totals ──
  const totalTeamBalance = 1150;
  const totalAllocatable = 1150;
  const totalProjectRemaining = INITIAL_PROJECTS_DATA.reduce((s, p) => s + p.projectBalance, 0);
  const totalPersonalRemaining = MEMBERS_DATA.reduce((s, m) => s + m.enterpriseBalance, 0);
  const filteredProjects = projSearch
    ? projectsData.filter((p) => p.name.toLowerCase().includes(projSearch.toLowerCase()))
    : projectsData;

  // Personal remaining detail
  const [expandedPersonalMemberDetailId, setExpandedPersonalMemberDetailId] = useState<string | null>(null);
  // ── Personal Remaining member list ──
  const filteredMembers = selectedMemberId
    ? MEMBERS_DATA.filter((m) => m.id === selectedMemberId)
    : MEMBERS_DATA;

  const TYPE_CLR: Record<string, string> = { "分配": "#22c55e", "回收": "#ef4444", "消费": "#ef4444", "退款": "#3b82f6" };
  const TYPE_BG: Record<string, string>  = { "分配": "rgba(34,197,94,0.12)", "回收": "rgba(239,68,68,0.12)", "消费": "rgba(239,68,68,0.12)", "退款": "rgba(59,130,246,0.12)" };

  return (
    <div onClick={() => { setShowTbTypeDropdown(false); setShowTaTypeDropdown(false); setShowMemberDropdown(false); }}>
      {/* Overview */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white text-lg">成本管理</h3>
        <button
          onClick={() => setShowTransferDialog(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:opacity-80 transition-opacity"
          style={{ background: "rgba(232,115,34,0.2)", color: "#E87322", border: "1px solid rgba(232,115,34,0.35)" }}
          title="将个人账户生产栗转入团队"
        >
          <SendHorizonal size={11} />转帐
        </button>
      </div>

      {/* ── 4 Metric Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="团队余额"
          value={totalTeamBalance}
          icon={<Wallet size={14} style={{ color: "#F5A623" }} />}
          color="#F5A623"
          bg="rgba(245,166,35,0.1)"
          isActive={activeMetric === "teamBalance"}
          onClick={() => setActiveMetric("teamBalance")}
          description="团队可用于实际内容生产的生产栗额度"
        />
        <MetricCard
          label="团队可分配额度"
          value={totalAllocatable}
          icon={<ArrowRightLeft size={14} style={{ color: "#4A9EE0" }} />}
          color="#4A9EE0"
          bg="rgba(74,158,224,0.1)"
          isActive={activeMetric === "teamAllocatable"}
          onClick={() => setActiveMetric("teamAllocatable")}
          description="团队可用于分配下发的生产栗额度"
        />
        <MetricCard
          label="项目剩余总额度"
          value={totalProjectRemaining}
          icon={<FolderOpen size={14} style={{ color: "#22c55e" }} />}
          color="#22c55e"
          bg="rgba(34,197,94,0.1)"
          isActive={activeMetric === "projectRemaining"}
          onClick={() => setActiveMetric("projectRemaining")}
          description="团队所有项目剩余额度总和"
        />
        <MetricCard
          label="个人剩余总额度"
          value={totalPersonalRemaining}
          icon={<User size={14} style={{ color: "#9B59B6" }} />}
          color="#9B59B6"
          bg="rgba(155,89,182,0.1)"
          isActive={activeMetric === "personalRemaining"}
          onClick={() => setActiveMetric("personalRemaining")}
          description="团队所有个人生产栗余额总和"
        />
      </div>

      {/* ── Detail: Team Balance ───────────────────────────────────────────── */}
      {activeMetric === "teamBalance" && (
        <div>
          {/* Filters */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div onClick={(e) => e.stopPropagation()}>
              <label className="text-xs block mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>交易类型</label>
              <div className="relative">
                <button onClick={() => setShowTbTypeDropdown(!showTbTypeDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                  <span style={{ color: tbTxFilter !== "全部" ? TX_COLORS[tbTxFilter] : undefined }}>{tbTxFilter}</span>
                  <ChevronDown size={12} />
                </button>
                {showTbTypeDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-28 rounded-xl overflow-hidden z-20 shadow-2xl"
                    style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {TB_TYPE_OPTIONS.map((opt) => (
                      <button key={opt} onClick={() => { setTbTxFilter(opt); setShowTbTypeDropdown(false); }}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-white/5"
                        style={{ color: tbTxFilter === opt ? "#E87322" : TX_COLORS[opt] || "rgba(255,255,255,0.7)" }}>
                        <span>{opt}</span>{tbTxFilter === opt && <Check size={12} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs block mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>项目</label>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <Search size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
                <input value={tbProjectSearch} onChange={(e) => setTbProjectSearch(e.target.value)}
                  placeholder="搜索项目名称"
                  className="bg-transparent outline-none w-28 text-xs"
                  style={{ color: "rgba(255,255,255,0.7)" }} />
                {tbProjectSearch && (
                  <button onClick={() => setTbProjectSearch("")} style={{ color: "rgba(255,255,255,0.3)" }}>
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs block mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>操作人</label>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <Search size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
                <input value={tbOperatorSearch} onChange={(e) => setTbOperatorSearch(e.target.value)}
                  placeholder="搜索操作人"
                  className="bg-transparent outline-none w-28 text-xs"
                  style={{ color: "rgba(255,255,255,0.7)" }} />
                {tbOperatorSearch && (
                  <button onClick={() => setTbOperatorSearch("")} style={{ color: "rgba(255,255,255,0.3)" }}>
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs block mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>时间段</label>
              <div className="flex items-center gap-1.5">
                <input type="date" value={tbDateFrom} onChange={(e) => setTbDateFrom(e.target.value)}
                  className="px-2 py-1.5 rounded-lg text-xs outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", colorScheme: "dark" }} />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>至</span>
                <input type="date" value={tbDateTo} onChange={(e) => setTbDateTo(e.target.value)}
                  className="px-2 py-1.5 rounded-lg text-xs outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", colorScheme: "dark" }} />
              </div>
            </div>

            {(tbTxFilter !== "全部" || tbDateFrom || tbDateTo || tbProjectSearch || tbOperatorSearch) && (
              <button onClick={() => { setTbTxFilter("全部"); setTbDateFrom(""); setTbDateTo(""); setTbProjectSearch(""); setTbOperatorSearch(""); }}
                className="text-xs px-2.5 py-1.5 rounded-lg self-end"
                style={{ color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.05)" }}>
                清除筛选
              </button>
            )}

            <button
              onClick={() => downloadCSV("团队余额明细.csv",
                ["操作人", "时间", "类型", "项目", "描述", "金额"],
                filteredTbTx.map(t => [t.operator, t.time, t.type, t.project || "-", t.description, t.amount])
              )}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:opacity-80 transition-opacity self-end ml-auto"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <Download size={12} />下载
            </button>
          </div>

          {/* Summary stats */}
          <div className="flex gap-3 mb-4">
            {(["充值", "转账", "消费", "退款"] as const).map((type) => {
              const sum = filteredTbTx.filter(t => t.type === type).reduce((s, t) => s + Math.abs(t.amount), 0);
              return (
                <div key={type} className="flex-1 px-3 py-2.5 rounded-xl"
                  style={{ background: `${TX_COLORS[type]}08`, border: `1px solid ${TX_COLORS[type]}15` }}>
                  <div className="text-xs" style={{ color: TX_COLORS[type] }}>{type}</div>
                  <div className="text-lg text-white font-semibold">{sum.toLocaleString()}</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>颗</div>
                </div>
              );
            })}
          </div>

          {/* Transaction table */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="grid text-xs px-4 py-3"
              style={{ gridTemplateColumns: "1.2fr 1.2fr 0.7fr 1.2fr 2.2fr 0.7fr", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div>操作人</div><div>时间</div><div>类型</div><div>项目</div><div>描述</div><div>金额</div>
            </div>
            {filteredTbTx.length === 0 ? (
              <div className="text-center py-10" style={{ color: "rgba(255,255,255,0.3)" }}>暂无匹配记录</div>
            ) : filteredTbTx.map((t, idx) => (
              <div key={t.id} className="grid items-center px-4 py-3 text-sm"
                style={{ gridTemplateColumns: "1.2fr 1.2fr 0.7fr 1.2fr 2.2fr 0.7fr", background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0" style={{ background: t.operatorColor }}>{t.operatorLetter}</div>
                  <span className="text-white">{t.operator}</span>
                </div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{t.time}</div>
                <div>
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${TX_COLORS[t.type]}22`, color: TX_COLORS[t.type] }}>{t.type}</span>
                </div>
                <div className="text-xs truncate" style={{ color: "rgba(255,255,255,0.5)" }}>{t.project || "-"}</div>
                <div className="text-xs truncate" style={{ color: "rgba(255,255,255,0.5)" }}>{t.description}</div>
                <div className="text-sm" style={{ color: t.amount > 0 ? "#22c55e" : "#ef4444" }}>
                  {t.amount > 0 ? "+" : ""}{t.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Detail: Team Allocatable ───────────────────────────────────────── */}
      {activeMetric === "teamAllocatable" && (
        <div>
          {/* Filters */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div onClick={(e) => e.stopPropagation()}>
              <label className="text-xs block mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>记录类型</label>
              <div className="relative">
                <button onClick={() => setShowTaTypeDropdown(!showTaTypeDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}>
                  <span>{taTxFilter}</span>
                  <ChevronDown size={12} />
                </button>
                {showTaTypeDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-28 rounded-xl overflow-hidden z-20 shadow-2xl"
                    style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {TA_TYPE_OPTIONS.map((opt) => (
                      <button key={opt} onClick={() => { setTaTxFilter(opt); setShowTaTypeDropdown(false); }}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-white/5"
                        style={{ color: taTxFilter === opt ? "#E87322" : TA_TYPE_COLORS[opt] || "rgba(255,255,255,0.7)" }}>
                        <span>{opt}</span>{taTxFilter === opt && <Check size={12} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs block mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>项目/对象</label>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <Search size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
                <input value={taProjectSearch} onChange={(e) => setTaProjectSearch(e.target.value)}
                  placeholder="搜索项目或对象"
                  className="bg-transparent outline-none w-28 text-xs"
                  style={{ color: "rgba(255,255,255,0.7)" }} />
                {taProjectSearch && (
                  <button onClick={() => setTaProjectSearch("")} style={{ color: "rgba(255,255,255,0.3)" }}>
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs block mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>操作人</label>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <Search size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
                <input value={taOperatorSearch} onChange={(e) => setTaOperatorSearch(e.target.value)}
                  placeholder="搜索操作人"
                  className="bg-transparent outline-none w-28 text-xs"
                  style={{ color: "rgba(255,255,255,0.7)" }} />
                {taOperatorSearch && (
                  <button onClick={() => setTaOperatorSearch("")} style={{ color: "rgba(255,255,255,0.3)" }}>
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs block mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>时间段</label>
              <div className="flex items-center gap-1.5">
                <input type="date" value={taDateFrom} onChange={(e) => setTaDateFrom(e.target.value)}
                  className="px-2 py-1.5 rounded-lg text-xs outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", colorScheme: "dark" }} />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>至</span>
                <input type="date" value={taDateTo} onChange={(e) => setTaDateTo(e.target.value)}
                  className="px-2 py-1.5 rounded-lg text-xs outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", colorScheme: "dark" }} />
              </div>
            </div>

            {(taTxFilter !== "全部" || taProjectSearch || taOperatorSearch || taDateFrom || taDateTo) && (
              <button onClick={() => { setTaTxFilter("全部"); setTaProjectSearch(""); setTaOperatorSearch(""); setTaDateFrom(""); setTaDateTo(""); }}
                className="text-xs px-2.5 py-1.5 rounded-lg self-end"
                style={{ color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.05)" }}>
                清除筛选
              </button>
            )}

            <button
              onClick={() => downloadCSV("团队可分配额度明细.csv",
                ["操作人", "时间", "类型", "对象", "描述", "金额"],
                mergedTaTx.map(t => [t.operator, t.time, t.type, t.target, t.description, t.amount])
              )}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:opacity-80 transition-opacity self-end ml-auto"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <Download size={12} />下载
            </button>
          </div>

          {/* Summary - 4 categories */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
              <div className="text-xs" style={{ color: "#22c55e" }}>充值</div>
              <div className="text-lg text-white font-semibold">
                {mergedTaTx.filter(t => t.type === "充值").reduce((s, t) => s + Math.abs(t.amount), 0).toLocaleString()}
              </div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>颗</div>
            </div>
            <div className="flex-1 px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <div className="text-xs" style={{ color: "#8b5cf6" }}>转账</div>
              <div className="text-lg text-white font-semibold">
                {mergedTaTx.filter(t => t.type === "转账").reduce((s, t) => s + Math.abs(t.amount), 0).toLocaleString()}
              </div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>颗</div>
            </div>
            <div className="flex-1 px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(74,158,224,0.06)", border: "1px solid rgba(74,158,224,0.15)" }}>
              <div className="text-xs" style={{ color: "#4A9EE0" }}>分配</div>
              <div className="text-lg text-white font-semibold">
                {mergedTaTx.filter(t => t.type === "分配").reduce((s, t) => s + Math.abs(t.amount), 0).toLocaleString()}
              </div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>颗</div>
            </div>
            <div className="flex-1 px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <div className="text-xs" style={{ color: "#ef4444" }}>回收</div>
              <div className="text-lg text-white font-semibold">
                {mergedTaTx.filter(t => t.type === "回收").reduce((s, t) => s + Math.abs(t.amount), 0).toLocaleString()}
              </div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>颗</div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="grid text-xs px-4 py-3"
              style={{ gridTemplateColumns: "1.2fr 1.2fr 0.8fr 1fr 2.5fr 0.7fr", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div>操作人</div><div>时间</div><div>类型</div><div>对象</div><div>描述</div><div>金额</div>
            </div>
            {mergedTaTx.length === 0 ? (
              <div className="text-center py-10" style={{ color: "rgba(255,255,255,0.3)" }}>暂无记录</div>
            ) : mergedTaTx.map((t, idx) => {
              const typeColor = TA_TYPE_COLORS[t.type] || "rgba(255,255,255,0.5)";
              const typeBgMap: Record<string, string> = { "充值": "rgba(34,197,94,0.12)", "转账": "rgba(139,92,246,0.12)", "分配": "rgba(74,158,224,0.12)", "回收": "rgba(239,68,68,0.12)" };
              const typeBg = typeBgMap[t.type] || "rgba(255,255,255,0.08)";
              return (
                <div key={t.id} className="grid items-center px-4 py-3 text-sm"
                  style={{ gridTemplateColumns: "1.2fr 1.2fr 0.8fr 1fr 2.5fr 0.7fr", background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0" style={{ background: t.operatorColor }}>{t.operatorLetter}</div>
                    <span className="text-white">{t.operator}</span>
                  </div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{t.time}</div>
                  <div>
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: typeBg, color: typeColor }}>
                      {t.type}
                    </span>
                  </div>
                  <div className="text-xs truncate" style={{ color: "rgba(255,255,255,0.6)" }}>{t.target}</div>
                  <div className="text-xs truncate" style={{ color: "rgba(255,255,255,0.5)" }}>{t.description}</div>
                  <div className="text-sm" style={{ color: t.amount > 0 ? "#22c55e" : "#ef4444" }}>
                    {t.amount > 0 ? "+" : ""}{t.amount}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Detail: Project Remaining ──────────────────────────────────────── */}
      {activeMetric === "projectRemaining" && (
        <div>
          {/* Filters */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            {/* Project search */}
            <div>
              <label className="text-xs block mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>项目</label>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <Search size={12} style={{ color: "rgba(255,255,255,0.3)" }} />
                <input value={projSearch} onChange={(e) => setProjSearch(e.target.value)}
                  placeholder="搜索项目名称"
                  className="bg-transparent outline-none w-28 text-xs"
                  style={{ color: "rgba(255,255,255,0.7)" }} />
                {projSearch && (
                  <button onClick={() => setProjSearch("")} style={{ color: "rgba(255,255,255,0.3)" }}>
                    <X size={11} />
                  </button>
                )}
              </div>
            </div>

            {/* Date range */}
            <div>
              <label className="text-xs block mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>时间段</label>
              <div className="flex items-center gap-1.5">
                <input type="date" value={prDateFrom} onChange={(e) => setPrDateFrom(e.target.value)}
                  className="px-2 py-1.5 rounded-lg text-xs outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", colorScheme: "dark" }} />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>至</span>
                <input type="date" value={prDateTo} onChange={(e) => setPrDateTo(e.target.value)}
                  className="px-2 py-1.5 rounded-lg text-xs outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", colorScheme: "dark" }} />
              </div>
            </div>

            {(projSearch || prDateFrom || prDateTo) && (
              <button onClick={() => { setProjSearch(""); setPrDateFrom(""); setPrDateTo(""); }}
                className="text-xs px-2.5 py-1.5 rounded-lg self-end"
                style={{ color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.05)" }}>
                清除筛选
              </button>
            )}

            <button
              onClick={() => downloadCSV("项目额度明细.csv",
                ["项目", "人数", "项目预算", "剩余额度", "消耗/配额"],
                filteredProjects.map(p => [p.name, p.members, projectBudgets[p.id] ?? p.allocated, p.projectBalance, `${p.consumed}/${cmProjectQuotas[p.id] ?? projectBudgets[p.id] ?? p.allocated}`])
              )}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:opacity-80 transition-opacity ml-auto"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <Download size={12} />下载
            </button>
          </div>

          {/* Summary */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>项目配额总量</div>
              <div className="text-lg text-white font-semibold">
                {filteredProjects.reduce((s, p) => s + (cmProjectQuotas[p.id] ?? projectBudgets[p.id] ?? p.allocated), 0).toLocaleString()}
              </div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>颗</div>
            </div>
            <div className="flex-1 px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>剩余总额度</div>
              <div className="text-lg text-white font-semibold">{filteredProjects.reduce((s, p) => s + p.projectBalance, 0).toLocaleString()}</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>颗</div>
            </div>
            <div className="flex-1 px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                {(prDateFrom || prDateTo) ? "时间段消耗" : "总消耗"}
              </div>
              <div className="text-lg text-white font-semibold">
                {(() => {
                  if (!prDateFrom && !prDateTo) return filteredProjects.reduce((s, p) => s + p.consumed, 0);
                  let sum = 0;
                  for (const p of filteredProjects) {
                    const txs = PROJECT_CONSUMPTION_TX[p.id] ?? [];
                    sum += txs.filter(tx => {
                      const d = tx.time.slice(0, 10);
                      if (prDateFrom && d < prDateFrom) return false;
                      if (prDateTo && d > prDateTo) return false;
                      return tx.type === "消费";
                    }).reduce((s, tx) => s + Math.abs(tx.amount), 0);
                  }
                  return sum;
                })().toLocaleString()}
              </div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>颗</div>
            </div>
          </div>

          {/* Project table with expandable consumption details */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="grid text-xs px-4 py-3"
                  style={{ gridTemplateColumns: "1.3fr 0.4fr 0.8fr 0.75fr 1.3fr 1.15fr", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div>项目</div>
                  <div>人数</div>
                  <div>项目配额</div>
                  <div>剩余额度</div>
                  <div>消耗/配额</div>
                  <div>操作</div>
                </div>

                {filteredProjects.length === 0 && (
                  <div className="text-center py-10 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>暂无项目数据</div>
                )}

                {filteredProjects.map((p, idx) => {
                  const isExpanded = expandedProjectId === p.id;
                  const allTxList = PROJECT_CONSUMPTION_TX[p.id] ?? [];
                  const txList = (prDateFrom || prDateTo)
                    ? allTxList.filter(tx => {
                        const txDate = tx.time.slice(0, 10);
                        if (prDateFrom && txDate < prDateFrom) return false;
                        if (prDateTo && txDate > prDateTo) return false;
                        return true;
                      })
                    : allTxList;
                  const budget = projectBudgets[p.id] ?? p.allocated;
                  const quota = cmProjectQuotas[p.id] ?? budget;

                  return (
                    <div key={p.id}>
                      <div className="grid items-center px-4 py-3 text-sm"
                        style={{ gridTemplateColumns: "1.3fr 0.4fr 0.8fr 0.75fr 1.3fr 1.15fr", background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)", borderBottom: isExpanded ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(34,197,94,0.15)" }}>
                            <FolderOpen size={14} style={{ color: "#22c55e" }} />
                          </div>
                          <span className="text-white">{p.name}</span>
                        </div>
                        <div style={{ color: "rgba(255,255,255,0.5)" }}>{p.members}</div>
                        <EditableBudgetCell value={budget} onSave={(v) => { setProjectBudgets((prev) => ({ ...prev, [p.id]: v })); toast.success(`「${p.name}」预算已更新`); }} />
                        <div className="text-xs" style={{ color: p.projectBalance > 0 ? "#22c55e" : "rgba(255,255,255,0.3)" }}>
                          {p.projectBalance.toLocaleString()}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1">
                            <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)" }}>{p.consumed.toLocaleString()}</span>
                            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>/ {quota.toLocaleString()}</span>
                          </div>
                          <div className="w-full rounded-full overflow-hidden" style={{ height: "3px", background: "rgba(255,255,255,0.08)" }}>
                            <div className="h-full rounded-full"
                              style={{ width: `${quota > 0 ? Math.min(100, (p.consumed / quota) * 100) : 0}%`, background: "linear-gradient(90deg,#E87322,#F5A623)" }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setEditCmQuotaId(p.id)}
                            className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                            style={{ background: "rgba(74,158,224,0.1)", color: "#4A9EE0", border: "1px solid rgba(74,158,224,0.2)" }}>
                            <Coins size={10} />修改配额
                          </button>
                          <button onClick={() => setExpandedProjectId(isExpanded ? null : p.id)}
                            className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                            style={{
                              background: isExpanded ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
                              color: isExpanded ? "#22c55e" : "rgba(255,255,255,0.55)",
                              border: `1px solid ${isExpanded ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.1)"}`,
                            }}>
                            {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                            消费明细
                          </button>
                        </div>
                      </div>

                      {/* Expanded: consumption/refund records */}
                      {isExpanded && (
                        <div style={{ background: "rgba(34,197,94,0.02)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          <div className="px-6 pt-3 pb-3">
                            <div className="grid text-xs px-3 py-2 rounded-lg mb-1"
                              style={{ gridTemplateColumns: "1.4fr 1.2fr 0.6fr 1.6fr 0.7fr", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)" }}>
                              <div>时间</div><div>操作人</div><div>类型</div><div>描述</div><div>金额</div>
                            </div>
                            {txList.length === 0 && (
                              <div className="text-xs text-center py-4" style={{ color: "rgba(255,255,255,0.25)" }}>暂无消费记录</div>
                            )}
                            {txList.map((tx) => (
                              <div key={tx.id} className="grid items-center text-xs px-3 py-2.5 hover:bg-white/5 rounded-lg"
                                style={{ gridTemplateColumns: "1.4fr 1.2fr 0.6fr 1.6fr 0.7fr" }}>
                                <div style={{ color: "rgba(255,255,255,0.4)" }}>{tx.time}</div>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
                                    style={{ background: tx.memberColor, fontSize: "8px" }}>{tx.memberLetter}</div>
                                  <span style={{ color: "rgba(255,255,255,0.7)" }}>{tx.member}</span>
                                </div>
                                <div>
                                  <span className="px-1.5 py-0.5 rounded text-xs"
                                    style={{
                                      background: tx.type === "消费" ? "rgba(239,68,68,0.12)" : "rgba(59,130,246,0.12)",
                                      color: tx.type === "消费" ? "#ef4444" : "#3b82f6",
                                    }}>
                                    {tx.type}
                                  </span>
                                </div>
                                <div style={{ color: "rgba(255,255,255,0.5)" }}>{tx.description}</div>
                                <div style={{ color: tx.amount > 0 ? "#3b82f6" : "#ef4444" }}>
                                  {tx.amount > 0 ? "+" : ""}{tx.amount}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

      {/* ── Detail: Personal Remaining ─────────────────────────────────────── */}
      {activeMetric === "personalRemaining" && (
        <div>
          {/* Filters */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <label className="text-xs block mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>成员筛选</label>
              <button onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm"
                style={{
                  background: selectedMemberId ? "rgba(155,89,182,0.15)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${selectedMemberId ? "rgba(155,89,182,0.3)" : "rgba(255,255,255,0.1)"}`,
                  color: selectedMemberId ? "#9B59B6" : "rgba(255,255,255,0.7)",
                }}>
                <Users size={12} />
                <span>{selectedMemberId ? MEMBERS_DATA.find(m => m.id === selectedMemberId)?.name : "全部成员"}</span>
                <ChevronDown size={11} />
              </button>
              {showMemberDropdown && (
                <div className="absolute top-full left-0 mt-1 rounded-xl overflow-hidden z-20 shadow-2xl"
                  style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)", minWidth: "180px" }}>
                  <button onClick={() => { setSelectedMemberId(null); setShowMemberDropdown(false); }}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-left hover:bg-white/5"
                    style={{ color: !selectedMemberId ? "#9B59B6" : "rgba(255,255,255,0.7)" }}>
                    全部成员 {!selectedMemberId && <Check size={12} />}
                  </button>
                  {MEMBERS_DATA.map((m) => (
                    <button key={m.id} onClick={() => { setSelectedMemberId(m.id); setShowMemberDropdown(false); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-left hover:bg-white/5"
                      style={{ color: selectedMemberId === m.id ? "#9B59B6" : "rgba(255,255,255,0.7)" }}>
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0" style={{ background: m.avatarColor, fontSize: "8px" }}>{m.letter}</div>
                        {m.name}
                      </span>
                      {selectedMemberId === m.id && <Check size={12} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedMemberId && (
              <button onClick={() => { setSelectedMemberId(null); setExpandedPersonalMemberDetailId(null); }}
                className="text-xs px-2.5 py-1.5 rounded-lg self-end"
                style={{ color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.05)" }}>
                清除筛选
              </button>
            )}

            <div>
              <label className="text-xs block mb-1" style={{ color: "rgba(255,255,255,0.35)" }}>时间段</label>
              <div className="flex items-center gap-1.5">
                <input type="date" value={personalDateFrom} onChange={(e) => setPersonalDateFrom(e.target.value)}
                  className="px-2 py-1.5 rounded-lg text-xs outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", colorScheme: "dark" }} />
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>至</span>
                <input type="date" value={personalDateTo} onChange={(e) => setPersonalDateTo(e.target.value)}
                  className="px-2 py-1.5 rounded-lg text-xs outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", colorScheme: "dark" }} />
              </div>
            </div>

            {(personalDateFrom || personalDateTo) && (
              <button onClick={() => { setPersonalDateFrom(""); setPersonalDateTo(""); }}
                className="text-xs px-2.5 py-1.5 rounded-lg self-end"
                style={{ color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.05)" }}>
                清除日期
              </button>
            )}

            <button
              onClick={() => downloadCSV("个人额度明细.csv",
                ["成员", "时间", "类型", "描述", "操作人", "金额"],
                filteredMembers.flatMap(m => {
                  const h = (MEMBER_TOKEN_HISTORY[m.id] ?? []).filter(tx => {
                    const d = tx.time.slice(0, 10);
                    if (personalDateFrom && d < personalDateFrom) return false;
                    if (personalDateTo && d > personalDateTo) return false;
                    return tx.type === "分配" || tx.type === "消费" || tx.type === "退款";
                  }).map(tx => [m.name, tx.time, tx.type, tx.source, tx.operator, tx.amount]);
                  return h;
                })
              )}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:opacity-80 transition-opacity self-end ml-auto"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <Download size={12} />下载
            </button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                {(personalDateFrom || personalDateTo) ? "时间段分配" : "分配总额"}
              </div>
              <div className="text-lg text-white font-semibold">
                {(() => {
                  let sum = 0;
                  for (const m of filteredMembers) {
                    const history = MEMBER_TOKEN_HISTORY[m.id] ?? [];
                    const filtered = history.filter(tx => {
                      const txDate = tx.time.slice(0, 10);
                      if (personalDateFrom && txDate < personalDateFrom) return false;
                      if (personalDateTo && txDate > personalDateTo) return false;
                      return tx.type === "分配";
                    });
                    sum += filtered.reduce((s, tx) => s + tx.amount, 0);
                  }
                  return sum;
                })().toLocaleString()}
              </div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>颗</div>
            </div>
            <div className="px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                {(personalDateFrom || personalDateTo) ? "时间段回收" : "回收总额"}
              </div>
              <div className="text-lg text-white font-semibold">
                {(() => {
                  let sum = 0;
                  for (const m of filteredMembers) {
                    const history = MEMBER_TOKEN_HISTORY[m.id] ?? [];
                    const filtered = history.filter(tx => {
                      const txDate = tx.time.slice(0, 10);
                      if (personalDateFrom && txDate < personalDateFrom) return false;
                      if (personalDateTo && txDate > personalDateTo) return false;
                      return tx.type === "回收";
                    });
                    sum += Math.abs(filtered.reduce((s, tx) => s + tx.amount, 0));
                  }
                  return sum;
                })().toLocaleString()}
              </div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>颗</div>
            </div>
            <div className="px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                {(personalDateFrom || personalDateTo) ? "时间段消费" : "消费总额"}
              </div>
              <div className="text-lg text-white font-semibold">
                {(() => {
                  let sum = 0;
                  for (const m of filteredMembers) {
                    const history = MEMBER_TOKEN_HISTORY[m.id] ?? [];
                    const filtered = history.filter(tx => {
                      const txDate = tx.time.slice(0, 10);
                      if (personalDateFrom && txDate < personalDateFrom) return false;
                      if (personalDateTo && txDate > personalDateTo) return false;
                      return tx.type === "消费";
                    });
                    sum += Math.abs(filtered.reduce((s, tx) => s + tx.amount, 0));
                  }
                  return sum;
                })().toLocaleString()}
              </div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>颗</div>
            </div>
            <div className="px-3 py-2.5 rounded-xl"
              style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                {(personalDateFrom || personalDateTo) ? "时间段退款" : "退款总额"}
              </div>
              <div className="text-lg text-white font-semibold">
                {(() => {
                  let sum = 0;
                  for (const m of filteredMembers) {
                    const history = MEMBER_TOKEN_HISTORY[m.id] ?? [];
                    const filtered = history.filter(tx => {
                      const txDate = tx.time.slice(0, 10);
                      if (personalDateFrom && txDate < personalDateFrom) return false;
                      if (personalDateTo && txDate > personalDateTo) return false;
                      return tx.type === "退款";
                    });
                    sum += filtered.reduce((s, tx) => s + tx.amount, 0);
                  }
                  return sum;
                })().toLocaleString()}
              </div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>颗</div>
            </div>
          </div>

          {/* Member list table with expandable detail rows */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="grid text-xs px-4 py-3"
              style={{ gridTemplateColumns: "1.2fr 0.9fr 0.9fr 0.9fr 0.8fr", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div>成员</div>
              <div>个人总分配</div>
              <div>个人生产栗余额</div>
              <div>个人总消费</div>
              <div>操作</div>
              <div>操作</div>
            </div>
            {filteredMembers.length === 0 ? (
              <div className="text-center py-10" style={{ color: "rgba(255,255,255,0.3)" }}>暂无记录</div>
            ) : filteredMembers.map((m, idx) => {
              const history = MEMBER_TOKEN_HISTORY[m.id] ?? [];
              const dateFiltered = history.filter(tx => {
                const txDate = tx.time.slice(0, 10);
                if (personalDateFrom && txDate < personalDateFrom) return false;
                if (personalDateTo && txDate > personalDateTo) return false;
                return true;
              });
              const totalAllocated = dateFiltered.filter(tx => tx.type === "分配").reduce((s, tx) => s + tx.amount, 0);
              const totalConsumed = Math.abs(dateFiltered.filter(tx => tx.type === "消费").reduce((s, tx) => s + tx.amount, 0));
              const totalBalance = personalDateFrom || personalDateTo
                ? dateFiltered.reduce((s, tx) => s + tx.amount, 0)
                : m.enterpriseBalance;
              const isDetailExpanded = expandedPersonalMemberDetailId === m.id;
              const detailTx = [...dateFiltered]
                .filter(tx => tx.type === "分配" || tx.type === "回收" || tx.type === "消费" || tx.type === "退款")
                .map((tx, i) => ({
                  id: `d-${i}`,
                  time: tx.time,
                  type: tx.type as "分配" | "回收" | "消费" | "退款",
                  description: tx.source,
                  operator: tx.operator,
                  amount: tx.amount,
                }))
                .sort((a, b) => b.time.localeCompare(a.time));

              return (
                <div key={m.id}>
                  <div className="grid items-center px-4 py-3 text-sm"
                    style={{ gridTemplateColumns: "1.2fr 0.9fr 0.9fr 0.9fr 0.8fr", background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)", borderBottom: isDetailExpanded ? "none" : "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs text-white flex-shrink-0" style={{ background: m.avatarColor }}>{m.letter}</div>
                      <span className="text-white">{m.name}</span>
                    </div>
                    <div className="text-sm" style={{ color: totalAllocated > 0 ? "#22c55e" : "rgba(255,255,255,0.3)" }}>
                      {totalAllocated.toLocaleString()} 颗
                    </div>
                    <div className="text-sm" style={{ color: totalBalance > 0 ? "#22c55e" : "rgba(255,255,255,0.3)" }}>
                      {totalBalance.toLocaleString()} 颗
                    </div>
                    <div className="text-sm" style={{ color: totalConsumed > 0 ? "#ef4444" : "rgba(255,255,255,0.3)" }}>
                      {totalConsumed.toLocaleString()} 颗
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setExpandedPersonalMemberDetailId(isDetailExpanded ? null : m.id)}
                        className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg transition-colors"
                        style={{
                          background: isDetailExpanded ? "rgba(155,89,182,0.15)" : "rgba(255,255,255,0.06)",
                          color: isDetailExpanded ? "#9B59B6" : "rgba(255,255,255,0.55)",
                          border: `1px solid ${isDetailExpanded ? "rgba(155,89,182,0.3)" : "rgba(255,255,255,0.1)"}`,
                        }}>
                        {isDetailExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                        明细
                      </button>
                    </div>
                  </div>

                  {/* Expanded: personal token transaction records */}
                  {isDetailExpanded && (
                    <div style={{ background: "rgba(155,89,182,0.02)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <div className="px-6 pt-3 pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{m.name} 的额度明细</span>
                          <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>共 {detailTx.length} 条记录</span>
                        </div>
                        {detailTx.length === 0 && (
                          <div className="text-xs text-center py-4" style={{ color: "rgba(255,255,255,0.25)" }}>暂无明细记录</div>
                        )}
                        {detailTx.length > 0 && (
                          <>
                            <div className="grid text-xs px-3 py-2 rounded-lg mb-1"
                              style={{ gridTemplateColumns: "1.3fr 0.6fr 2.2fr 1fr 0.7fr", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)" }}>
                              <div>时间</div><div>类型</div><div>描述</div><div>操作人</div><div>金额</div>
                            </div>
                            {detailTx.map((tx) => (
                              <div key={tx.id} className="grid items-center text-xs px-3 py-2.5 hover:bg-white/5 rounded-lg"
                                style={{ gridTemplateColumns: "1.3fr 0.6fr 2.2fr 1fr 0.7fr" }}>
                                <div style={{ color: "rgba(255,255,255,0.4)" }}>{tx.time}</div>
                                <div>
                                  <span className="px-1.5 py-0.5 rounded text-xs"
                                    style={{
                                      background: TYPE_BG[tx.type] ?? "rgba(255,255,255,0.08)",
                                      color: TYPE_CLR[tx.type] ?? "rgba(255,255,255,0.5)",
                                    }}>
                                    {tx.type}
                                  </span>
                                </div>
                                <div style={{ color: "rgba(255,255,255,0.5)" }}>{tx.description}</div>
                                <div style={{ color: "rgba(255,255,255,0.6)" }}>{tx.operator}</div>
                                <div style={{ color: tx.amount > 0 ? "#22c55e" : "#ef4444" }}>
                                  {tx.amount > 0 ? "+" : ""}{tx.amount}
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dialogs */}
      {allocateTarget && <AllocateDialog target={allocateTarget} onClose={() => setAllocateTarget(null)} />}
      {showTransferDialog && <TransferToEnterpriseDialog onClose={() => setShowTransferDialog(false)} />}
      {editCmQuotaId && (() => {
        const p = projectsData.find((pd) => pd.id === editCmQuotaId);
        return p ? (
          <QuotaEditDialog
            projectName={p.name}
            currentQuota={cmProjectQuotas[editCmQuotaId] ?? p.allocated}
            consumed={p.consumed}
            onClose={() => setEditCmQuotaId(null)}
            onSave={(q) => {
              setCmProjectQuotas((prev) => ({ ...prev, [editCmQuotaId]: q }));
              toast.success(`「${p.name}」配额已更新为 ${q.toLocaleString()} 颗`);
              setEditCmQuotaId(null);
            }}
          />
        ) : null;
      })()}
    </div>
  );
}