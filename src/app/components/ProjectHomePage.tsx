import { useState, useEffect, Fragment, type ReactNode, type CSSProperties, type ComponentType } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ChevronRight, ChevronDown, Check, Plus,
  Users, Film, AlertTriangle, TrendingDown, Coins,
  Clock, Edit2, BarChart2,
  CheckCircle2, Circle, Loader2, Activity,
  Info,
  Monitor, Zap, Layers, Video,
  Shield, Eye, Droplets, Trash2, X,
  RefreshCw, FolderOpen, MessageCircle, Search, Pencil,
  Image as LucideImage,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar,
  Tooltip as ReTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { getProjectById } from "../data/projectsData";
import { toast } from "sonner";
import { EditProjectMembersDialog, type DialogMember } from "./EditProjectMembersDialog";
import { AllocateMemberTokenDialog } from "./AllocateMemberTokenDialog";

// ─── Types ────────────────────────────────────────────────────────────────────
type ProjectPermission = "管理" | "编辑" | "阅读";
type PeriodKey = "all" | "week" | "month" | "year" | "custom";
type QuotaType = "unlimited" | "periodic" | "fixed";

interface MemberWithPerm {
  name: string;
  avatar: string;
  role: string;
  generated: number;
  tokenUsed: number;
  contribution: number;
  permission: ProjectPermission;
  // Image generation
  imageGenerated: number;
  imageTokenUsed: number;
  // Video generation
  videoGenerated: number;
  videoDuration: string; // e.g. "12:30"
  videoTokenUsed: number;
  // Episodes
  episodesGenerated: number;
  // Gacha
  avgGachaRate: number; // percentage
  gachaRate: number; // percentage
}

interface MemberQuota {
  type: QuotaType;
  total: number;
  remaining: number;
  period?: string;
}

const STATUS_OPTIONS = ["进行中", "已完成", "暂停"] as const;
const STATUS_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  进行中: { bg: "rgba(232,115,34,0.15)", text: "#E87322", border: "rgba(232,115,34,0.3)" },
  已完成: { bg: "rgba(74,198,120,0.15)", text: "#4AC678", border: "rgba(74,198,120,0.3)" },
  暂停:   { bg: "rgba(255,255,255,0.07)", text: "rgba(255,255,255,0.45)", border: "rgba(255,255,255,0.1)" },
};
const MEMBER_COLORS = ["#E87322", "#4AC678", "#4A9EE0", "#9B59B6", "#F5A623", "#E74C3C"];
const PERM_COLORS: Record<ProjectPermission, string> = {
  管理: "#E87322", 编辑: "#7B3FC4", 阅读: "#2A6FC4",
};
const PERIOD_LABELS: { key: PeriodKey; label: string }[] = [
  { key: "all", label: "累计" },
  { key: "week", label: "本周" },
  { key: "month", label: "本月" },
  { key: "year", label: "本年" },
  { key: "custom", label: "自定义" },
];

// ─── Tab Types ────────────────────────────────────────────────────────────────
type ProjectTab = "members" | "progress" | "warnings";

const TAB_CONFIG: { key: ProjectTab; label: string; icon: typeof Users }[] = [
  { key: "members", label: "项目成本", icon: Users },
  { key: "progress", label: "分镜进度", icon: Film },
  { key: "warnings", label: "生成预警", icon: AlertTriangle },
];

// ─── Trend Data ───────────────────────────────────────────────────────────────
const TREND_DATA: Record<PeriodKey, Array<{ date: string; value: number }>> = {
  week: [
    { date: "4/10", value: 85 },
    { date: "4/11", value: 120 },
    { date: "4/12", value: 95 },
    { date: "4/13", value: 180 },
    { date: "4/14", value: 145 },
    { date: "4/15", value: 210 },
    { date: "4/16", value: 160 },
  ],
  month: [
    { date: "3/18", value: 80 },
    { date: "3/21", value: 120 },
    { date: "3/24", value: 95 },
    { date: "3/27", value: 175 },
    { date: "3/30", value: 145 },
    { date: "4/2",  value: 210 },
    { date: "4/5",  value: 160 },
    { date: "4/8",  value: 195 },
    { date: "4/11", value: 240 },
    { date: "4/14", value: 185 },
    { date: "4/16", value: 220 },
  ],
  year: [
    { date: "5月",  value: 980 },
    { date: "6月",  value: 1200 },
    { date: "7月",  value: 850 },
    { date: "8月",  value: 1450 },
    { date: "9月",  value: 1100 },
    { date: "10月", value: 1680 },
    { date: "11月", value: 1320 },
    { date: "12月", value: 1850 },
    { date: "1月",  value: 1500 },
    { date: "2月",  value: 900 },
    { date: "3月",  value: 1750 },
    { date: "4月",  value: 1420 },
  ],
  custom: [
    { date: "4/1",  value: 120 },
    { date: "4/3",  value: 85 },
    { date: "4/5",  value: 190 },
    { date: "4/7",  value: 145 },
    { date: "4/9",  value: 210 },
    { date: "4/11", value: 165 },
    { date: "4/13", value: 130 },
    { date: "4/16", value: 185 },
  ],
  all: [
    { date: "1月",  value: 1200 },
    { date: "2月",  value: 980 },
    { date: "3月",  value: 1650 },
    { date: "4月",  value: 1420 },
    { date: "5月",  value: 1800 },
    { date: "6月",  value: 2100 },
    { date: "7月",  value: 1900 },
    { date: "8月",  value: 2400 },
    { date: "9月",  value: 2200 },
    { date: "10月", value: 2650 },
    { date: "11月", value: 2900 },
    { date: "12月", value: 3200 },
  ],
};

const PERIOD_CONSUMED: Record<PeriodKey, number> = {
  week: 820, month: 3200, year: 12500, custom: 1600, all: 0,
};
const MEMBER_PERIOD_CONSUMED: Record<PeriodKey, number[]> = {
  week:   [320, 220, 180, 100],
  month:  [1280, 860, 720, 340],
  year:   [4800, 3500, 2900, 1300],
  custom: [560, 420, 380, 240],
  all:    [4800, 3500, 2900, 1300],
};

const INITIAL_MEMBER_QUOTAS: MemberQuota[] = [
  { type: "unlimited", total: 0,     remaining: 0 },
  { type: "periodic",  total: 10000, remaining: 6800, period: "月" },
  { type: "fixed",     total: 5000,  remaining: 2100 },
  { type: "unlimited", total: 0,     remaining: 0 },
  { type: "fixed",     total: 3000,  remaining: 1400 },
  { type: "periodic",  total: 8000,  remaining: 4500, period: "月" },
];

// ─── Member Detail Stats (per-member breakdown) ──────────────────────────────
interface MemberDetailStats {
  imageGenerated: number;
  imageTokenUsed: number;
  videoGenerated: number;
  videoDuration: string;
  videoTokenUsed: number;
  episodesGenerated: number;
  avgGachaRate: number;
  gachaRate: number;
}

const MEMBER_DETAIL_STATS: MemberDetailStats[] = [
  { imageGenerated: 320, imageTokenUsed: 2800, videoGenerated: 18, videoDuration: "6分42秒", videoTokenUsed: 2000, episodesGenerated: 5, avgGachaRate: 3.2, gachaRate: 2.8 },
  { imageGenerated: 210, imageTokenUsed: 1900, videoGenerated: 12, videoDuration: "4分18秒", videoTokenUsed: 1600, episodesGenerated: 4, avgGachaRate: 2.8, gachaRate: 2.5 },
  { imageGenerated: 185, imageTokenUsed: 1600, videoGenerated: 10, videoDuration: "3分35秒", videoTokenUsed: 1300, episodesGenerated: 3, avgGachaRate: 3.5, gachaRate: 3.1 },
  { imageGenerated: 90,  imageTokenUsed: 720,  videoGenerated: 6,  videoDuration: "2分10秒", videoTokenUsed: 580,  episodesGenerated: 2, avgGachaRate: 4.1, gachaRate: 3.8 },
];

// ─── Member Transaction Data ──────────────────────────────────────────────────
interface MemberTransaction {
  time: string;
  type: "消费" | "退款";
  description: string;
  amount: number;
  memberName: string;
}

const MEMBER_TRANSACTIONS: MemberTransaction[] = [
  { time: "2026/04/16 14:32", type: "消费", description: "生成角色设计 — 主角组 第45张", amount: -120, memberName: "Alice" },
  { time: "2026/04/16 11:20", type: "消费", description: "生成场景背景 — 山林雾景 第12张", amount: -85, memberName: "Alice" },
  { time: "2026/04/15 16:45", type: "退款", description: "重复生成退款 — 角色设计 第38张", amount: 60, memberName: "Alice" },
  { time: "2026/04/15 09:10", type: "消费", description: "生成分镜画面 — 第三集 分镜7", amount: -95, memberName: "Alice" },
  { time: "2026/04/14 20:30", type: "消费", description: "生成角色设计 — 配角组 第22张", amount: -110, memberName: "Alice" },
  { time: "2026/04/16 13:15", type: "消费", description: "生成场景背景 — 室内场景 第8张", amount: -75, memberName: "Bob" },
  { time: "2026/04/15 18:40", type: "消费", description: "生成角色设计 — 反派组 第15张", amount: -130, memberName: "Bob" },
  { time: "2026/04/15 10:22", type: "退款", description: "质量不达标退款 — 场景背景 第5张", amount: 45, memberName: "Bob" },
  { time: "2026/04/14 15:50", type: "消费", description: "生成分镜画面 — 第二集 分镜3", amount: -88, memberName: "Bob" },
  { time: "2026/04/16 09:30", type: "消费", description: "生成角色设计 — 主角组 第30张", amount: -105, memberName: "Carol" },
  { time: "2026/04/15 14:18", type: "消费", description: "生成特效素材 — 剑气特效 第4张", amount: -140, memberName: "Carol" },
  { time: "2026/04/14 11:05", type: "消费", description: "生成分镜画面 — 第一集 分镜12", amount: -78, memberName: "Carol" },
  { time: "2026/04/16 16:00", type: "消费", description: "生成场景背景 — 夜空星河 第3张", amount: -92, memberName: "Dave" },
  { time: "2026/04/15 21:30", type: "消费", description: "生成角色设计 — 配角组 第18张", amount: -115, memberName: "Dave" },
  { time: "2026/04/14 08:45", type: "退款", description: "系统异常退款 — 批量生成", amount: 200, memberName: "Dave" },
];

// ─── Duplicate Prompts Data ───────────────────────────────────────────────────
const DUPLICATE_PROMPTS = [
  { prompt: "古风女侠，白发飞扬，身着月白色长袍，腰悬宝剑，敦煌壁画风格", count: 8, similarity: 94, person: "Alice", episode: "第一集", shots: ["分镜3", "分镜7", "分镜12"] },
  { prompt: "山林背景，云雾缭绕，仙气飘渺，光线柔和，写实风格", count: 5, similarity: 89, person: "Bob", episode: "第二集", shots: ["分镜2", "分镜5"] },
  { prompt: "剑气特效，光芒四射，蓝紫色能量，动态模糊效果", count: 4, similarity: 86, person: "Carol", episode: "第三集", shots: ["分镜4", "分镜9"] },
  { prompt: "近景人物特写，眼神凌厉，侧脸构图，景深虚化背景", count: 3, similarity: 82, person: "Dave", episode: "第四集", shots: ["分镜1", "分镜6"] },
];

// ─── Category Consumption Data (Multi-metric with drill-down) ─────────────────────
interface CategoryLeaf {
  name: string;
  totalTokens: number;
  imageCount: number;
  imageTokens: number;
  videoCount: number;
  videoDurationSec: number;
  videoTokens: number;
}

interface CategoryFolder {
  type: "folder";
  name: string;
  children: (CategoryFolder | CategoryLeaf)[];
}

type CategoryNode = CategoryFolder | CategoryLeaf;

function sumCat(nodes: CategoryNode[], field: keyof CategoryLeaf | "totalTokens"): number {
  return nodes.reduce((s, n) => s + ("type" in n ? sumCat(n.children, field) : (n as CategoryLeaf)[field as keyof CategoryLeaf] ?? 0), 0);
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}分${String(s).padStart(2, "0")}秒`;
}

const CATEGORY_CONSUMPTION: CategoryNode[] = [
  { type: "folder", name: "美术设定", children: [
    { name: "人物设定", totalTokens: 4800, imageCount: 98, imageTokens: 3200, videoCount: 12, videoDurationSec: 240, videoTokens: 1600 },
    { name: "场景设定", totalTokens: 3200, imageCount: 72, imageTokens: 2100, videoCount: 8, videoDurationSec: 180, videoTokens: 1100 },
    { name: "道具设定", totalTokens: 1800, imageCount: 38, imageTokens: 1200, videoCount: 5, videoDurationSec: 90, videoTokens: 600 },
  ] },
  { type: "folder", name: "第一集", children: [
    { name: "分镜1-5", totalTokens: 2800, imageCount: 60, imageTokens: 1800, videoCount: 15, videoDurationSec: 360, videoTokens: 1000 },
    { name: "分镜6-10", totalTokens: 2200, imageCount: 45, imageTokens: 1400, videoCount: 10, videoDurationSec: 240, videoTokens: 800 },
  ] },
  { type: "folder", name: "第二集", children: [
    { name: "静帧", totalTokens: 1500, imageCount: 40, imageTokens: 1200, videoCount: 3, videoDurationSec: 60, videoTokens: 300 },
    { name: "动态", totalTokens: 1800, imageCount: 15, imageTokens: 600, videoCount: 20, videoDurationSec: 480, videoTokens: 1200 },
  ] },
  { name: "未命名", totalTokens: 650, imageCount: 15, imageTokens: 400, videoCount: 3, videoDurationSec: 45, videoTokens: 250 },
];


// ─── Stage progress derivation ────────────────────────────────────────────────
function deriveStages(epProgress: number) {
  const s1 = Math.min(100, Math.round(epProgress * 3));
  const s2 = epProgress >= 34 ? Math.min(100, Math.round((epProgress - 33) * 3)) : 0;
  const s3 = epProgress >= 67 ? Math.min(100, Math.round((epProgress - 66) * 3)) : 0;
  return [
    { label: "草分绘制", progress: s1 },
    { label: "静帧生成", progress: s2 },
    { label: "动态生成", progress: s3 },
  ];
}

// ─── Mini Progress Ring ───────────────────────────────────────────────────────
function MiniRing({ pct, size = 36, stroke = 3, color = "#E87322" }: { pct: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
    </svg>
  );
}

// ─── Stat Tooltip ─────────────────────────────────────────────────────────────
function StatTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}>
      <Info size={11} style={{ color: "rgba(255,255,255,0.25)", cursor: "help" }} />
      {show && (
        <div className="absolute z-30 w-52 px-3 py-2 rounded-lg text-xs"
          style={{
            bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
            background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.7)", lineHeight: 1.6,
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)", whiteSpace: "normal",
          }}>
          {text}
          <div className="absolute border-4 border-transparent"
            style={{ top: "100%", left: "50%", transform: "translateX(-50%)", borderTopColor: "#2A2018" }} />
        </div>
      )}
    </div>
  );
}

// ─── Custom Recharts Tooltip ───────────────────────────────────────────────────
function TrendTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg shadow-2xl"
      style={{ background: "#1E1A14", border: "1px solid rgba(232,115,34,0.3)", minWidth: "110px" }}>
      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginBottom: "4px" }}>{label}</p>
      <p style={{ fontSize: "14px", fontWeight: 600, color: "#E87322" }}>
        {payload[0].value.toLocaleString()} <span style={{ fontSize: "10px", fontWeight: 400, color: "rgba(255,255,255,0.4)" }}>颗</span>
      </p>
    </div>
  );
}

// ─── Quota Tag (read-only display) ──────────────────────────────────────────────
function QuotaTag({ qd }: { qd: MemberQuota }) {
  if (qd.type === "unlimited") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(74,198,120,0.1)", color: "#4AC678", border: "1px solid rgba(74,198,120,0.2)", fontSize: "11px" }}>
          无额度限制
        </span>
        <span style={{ color: "#4AC678", fontSize: "14px" }}>∞</span>
      </div>
    );
  }
  const pct = Math.round((qd.remaining / qd.total) * 100);
  const lowBalance = pct < 20;
  return (
    <div className="flex flex-col gap-1 min-w-0" style={{ width: "160px" }}>
      <div className="flex items-center justify-between">
        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: qd.type === "periodic" ? "rgba(74,158,224,0.1)" : "rgba(155,89,182,0.1)", color: qd.type === "periodic" ? "#4A9EE0" : "#9B59B6", fontSize: "10px" }}>
          {qd.type === "periodic" ? `周期/${qd.period}` : "固定"}
        </span>
        <span style={{ fontSize: "11px", color: lowBalance ? "#ff6b6b" : "rgba(255,255,255,0.55)" }}>
          {qd.remaining.toLocaleString()}<span style={{ color: "rgba(255,255,255,0.3)" }}>/{qd.total.toLocaleString()}</span>
        </span>
      </div>
      <div className="w-full rounded-full overflow-hidden" style={{ height: "3px", background: "rgba(255,255,255,0.07)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: lowBalance ? "#ff6b6b" : qd.type === "periodic" ? "#4A9EE0" : "#9B59B6" }} />
      </div>
    </div>
  );
}

// ─── Inline Edit Badge (for basic info) ───────────────────────────────────────
function InlineEditBadge({
  label,
  value,
  icon: Icon,
  suffix,
  onSave,
  readOnly,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ size?: number; style?: CSSProperties }>;
  suffix?: string;
  onSave: (v: string) => void;
  readOnly?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  useEffect(() => { setVal(value); }, [value]);

  const handleSave = () => {
    const trimmed = val.trim();
    if (trimmed) { onSave(trimmed); toast.success(`${label}已更新`); }
    else setVal(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
        style={{ background: "rgba(232,115,34,0.08)", border: "1px solid rgba(232,115,34,0.35)" }}>
        <Icon size={11} style={{ color: "#E87322" }} />
        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>{label}:</span>
        <input
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") { setVal(value); setEditing(false); }
          }}
          className="bg-transparent outline-none text-white"
          style={{ fontSize: "11px", width: "64px", caretColor: "#E87322", borderBottom: "1px solid rgba(232,115,34,0.5)" }}
        />
        {suffix && <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>{suffix}</span>}
      </div>
    );
  }

  return (
    readOnly ? (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
    >
      <Icon size={11} style={{ color: "rgba(255,255,255,0.35)" }} />
      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{label}:</span>
      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)" }}>{value}{suffix ? ` ${suffix}` : ""}</span>
    </div>
    ) : (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all group hover:border-orange-500/30"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
      title={`点击编辑${label}`}
    >
      <Icon size={11} style={{ color: "rgba(255,255,255,0.35)" }} />
      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{label}:</span>
      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)" }}>{value}{suffix ? ` ${suffix}` : ""}</span>
      <Edit2 size={9} className="opacity-0 group-hover:opacity-60 transition-opacity" />
    </button>
    )
  );
}

// ─── Member Quota Editor Modal ─────────────────────────────────────────────────
function MemberQuotaEditorModal({
  member,
  quota,
  memberTokenUsed,
  onClose,
  onSave,
}: {
  member: { name: string; avatar: string; avatarColor: string };
  quota: MemberQuota;
  memberTokenUsed: number;
  onClose: () => void;
  onSave: (q: MemberQuota) => void;
}) {
  const [mode, setMode] = useState<QuotaType>(quota.type);
  const [amount, setAmount] = useState(quota.total > 0 ? String(quota.total) : "10000");
  const [period, setPeriod] = useState(quota.period ?? "月");

  const numAmount = Number(amount.replace(/,/g, "")) || 0;
  const tooLow = mode !== "unlimited" && numAmount < memberTokenUsed;

  const handleSave = () => {
    if (tooLow) return;
    const newQuota: MemberQuota = {
      type: mode,
      total: mode === "unlimited" ? 0 : numAmount,
      remaining: mode === "unlimited" ? 0 : Math.max(0, numAmount - memberTokenUsed),
      period: mode === "periodic" ? period : undefined,
    };
    onSave(newQuota);
    onClose();
    toast.success(`${member.name} 的配额已更新`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="rounded-2xl w-80 overflow-hidden shadow-2xl" style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: member.avatarColor, fontSize: "11px", fontWeight: 600, color: "#fff" }}>
              {member.avatar}
            </div>
            <div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{member.name}</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>编辑配额分配模式</div>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-4">
          {/* Mode Selection */}
          <div className="mb-4">
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>分配模式</div>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { key: "unlimited", label: "无限制", color: "#4AC678" },
                { key: "periodic",  label: "周期额度", color: "#4A9EE0" },
                { key: "fixed",     label: "固定额度", color: "#9B59B6" },
              ] as const).map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className="py-2 rounded-lg text-xs transition-all"
                  style={{
                    background: mode === key ? `${color}20` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${mode === key ? `${color}50` : "rgba(255,255,255,0.07)"}`,
                    color: mode === key ? color : "rgba(255,255,255,0.45)",
                    fontWeight: mode === key ? 600 : 400,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount input (if not unlimited) */}
          {mode !== "unlimited" && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                  {mode === "periodic" ? "每期额度（颗）" : "固定总额（颗）"}
                </span>
                {mode === "periodic" && (
                  <div className="flex gap-1">
                    {["日", "周", "月"].map((p) => (
                      <button key={p} onClick={() => setPeriod(p)}
                        className="px-2 py-0.5 rounded text-xs"
                        style={{
                          background: period === p ? "rgba(74,158,224,0.2)" : "rgba(255,255,255,0.04)",
                          color: period === p ? "#4A9EE0" : "rgba(255,255,255,0.35)",
                          border: `1px solid ${period === p ? "rgba(74,158,224,0.3)" : "rgba(255,255,255,0.06)"}`,
                          fontSize: "10px",
                        }}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${tooLow ? "rgba(255,100,100,0.4)" : "rgba(255,255,255,0.1)"}`,
                  color: "rgba(255,255,255,0.85)",
                  fontSize: "14px",
                }}
                placeholder="输入额度数量"
              />

              {/* Visual constraint */}
              <div className="mt-3 rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>当前额度</span>
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>
                    已消耗 {memberTokenUsed.toLocaleString()} 颗
                  </span>
                </div>
                {/* Bar */}
                <div className="relative w-full rounded-full overflow-hidden" style={{ height: "8px", background: "rgba(255,255,255,0.06)" }}>
                  {/* New quota fill background */}
                  {numAmount > 0 && (
                    <div className="absolute left-0 top-0 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (numAmount / Math.max(numAmount, memberTokenUsed, 1)) * 100)}%`,
                        background: tooLow ? "rgba(255,100,100,0.15)" : "rgba(232,115,34,0.15)",
                        transition: "width 0.3s",
                      }} />
                  )}
                  {/* Consumed fill */}
                  <div className="absolute left-0 top-0 h-full rounded-full"
                    style={{
                      width: `${numAmount > 0 ? Math.min(100, (memberTokenUsed / Math.max(numAmount, memberTokenUsed, 1)) * 100) : 0}%`,
                      background: tooLow ? "linear-gradient(90deg,#ff6b6b,#ff9b9b)" : "linear-gradient(90deg,#E87322,#F5A623)",
                      transition: "width 0.3s",
                    }} />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span style={{ fontSize: "9px", color: tooLow ? "#ff6b6b" : "rgba(255,255,255,0.3)" }}>
                    已消耗 {memberTokenUsed.toLocaleString()}
                  </span>
                  {numAmount > 0 && (
                    <span style={{ fontSize: "9px", color: tooLow ? "#ff6b6b" : "rgba(255,255,255,0.3)" }}>
                      设定 {numAmount.toLocaleString()}
                    </span>
                  )}
                </div>
                {tooLow && (
                  <div className="flex items-center gap-1.5 mt-2 px-2 py-1.5 rounded-lg" style={{ background: "rgba(255,100,100,0.1)", border: "1px solid rgba(255,100,100,0.2)" }}>
                    <AlertTriangle size={11} style={{ color: "#ff6b6b", flexShrink: 0 }} />
                    <span style={{ fontSize: "10px", color: "#ff9b9b", lineHeight: 1.4 }}>
                      配额不能小于已消耗的 <strong>{memberTokenUsed.toLocaleString()}</strong> 颗
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {mode === "unlimited" && (
            <div className="mb-4 px-3 py-2.5 rounded-lg flex items-center gap-2" style={{ background: "rgba(74,198,120,0.06)", border: "1px solid rgba(74,198,120,0.15)" }}>
              <span style={{ fontSize: "18px", color: "#4AC678" }}>∞</span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>成员将不受生产栗配额限制</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm hover:opacity-80 transition-opacity"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={tooLow}
              className="flex-1 py-2 rounded-lg text-sm transition-all"
              style={{
                background: tooLow ? "rgba(255,100,100,0.1)" : "rgba(232,115,34,0.85)",
                border: `1px solid ${tooLow ? "rgba(255,100,100,0.2)" : "rgba(232,115,34,0.4)"}`,
                color: tooLow ? "#ff6b6b" : "#fff",
                cursor: tooLow ? "not-allowed" : "pointer",
                fontWeight: 500,
              }}>
              {tooLow ? "不可保存" : "保存配额"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Remove Member Confirm ─────────────────────────────────────────────────────
function RemoveMemberConfirm({
  member,
  onClose,
  onConfirm,
}: {
  member: { name: string; avatar: string; avatarColor: string; role: string };
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.65)" }} onClick={onClose}>
      <div className="rounded-2xl w-80 overflow-hidden shadow-2xl" style={{ background: "#1E1A14", border: "1px solid rgba(255,100,100,0.2)" }} onClick={(e) => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: member.avatarColor, fontSize: "12px", fontWeight: 600, color: "#fff" }}>
              {member.avatar}
            </div>
            <div>
              <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>移除 {member.name}？</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>{member.role}</div>
            </div>
          </div>

          <div className="rounded-xl p-3.5 mb-4" style={{ background: "rgba(255,100,100,0.06)", border: "1px solid rgba(255,100,100,0.15)" }}>
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(255,100,100,0.15)" }}>
                  <span style={{ fontSize: "9px", color: "#ff6b6b" }}>!</span>
                </div>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
                  <strong style={{ color: "rgba(255,255,255,0.75)" }}>资产归属</strong>：{member.name} 名下所有资产将归当前操作人所有。
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(74,198,120,0.15)" }}>
                  <span style={{ fontSize: "9px", color: "#4AC678" }}>↑</span>
                </div>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
                  <strong style={{ color: "rgba(255,255,255,0.75)" }}>配额释放</strong>：剩余生产栗配额将自动释放回项目预算池。
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm hover:opacity-80 transition-opacity"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
              取消
            </button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className="flex-1 py-2 rounded-lg text-sm transition-all hover:opacity-90"
              style={{ background: "rgba(255,80,80,0.15)", border: "1px solid rgba(255,80,80,0.3)", color: "#ff6b6b", fontWeight: 500 }}>
              确认移除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Member Quota Editor Modal ────────────────────────────────────────────────
function MemberQuotaEditor({
  member,
  currentQuota,
  currentConsumed,
  onSave,
  onCancel,
}: {
  member: { name: string; avatar: string; avatarColor: string; role: string };
  currentQuota: MemberQuota;
  currentConsumed: number;
  onSave: (q: MemberQuota) => void;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<QuotaType>(currentQuota.type === "unlimited" ? "unlimited" : "fixed");
  const [val, setVal] = useState(String(currentQuota.type === "fixed" ? currentQuota.total : 0));
  const numVal = Number(val.replace(/,/g, "")) || 0;
  const tooLow = mode === "fixed" && numVal < currentConsumed;
  const pct = mode === "fixed" && numVal > 0 ? Math.min(100, (currentConsumed / numVal) * 100) : 100;

  const handleSave = () => {
    if (mode === "unlimited") {
      onSave({ type: "unlimited", total: 0, remaining: 0 });
    } else if (!tooLow) {
      onSave({ type: "fixed", total: numVal, remaining: Math.max(0, numVal - currentConsumed) });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.65)" }} onClick={onCancel}>
      <div className="rounded-2xl w-96 overflow-hidden shadow-2xl" style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>编辑额度</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>{member.name} · {member.role}</div>
          </div>
          <button onClick={onCancel} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-4">
          {/* Mode selector */}
          <div className="flex gap-2 mb-4">
            <button onClick={() => setMode("unlimited")}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: mode === "unlimited" ? "rgba(74,198,120,0.12)" : "rgba(255,255,255,0.03)",
                border: `1.5px solid ${mode === "unlimited" ? "rgba(74,198,120,0.3)" : "rgba(255,255,255,0.06)"}`,
                color: mode === "unlimited" ? "#4AC678" : "rgba(255,255,255,0.45)",
              }}>
              无限制
            </button>
            <button onClick={() => setMode("fixed")}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: mode === "fixed" ? "rgba(155,89,182,0.12)" : "rgba(255,255,255,0.03)",
                border: `1.5px solid ${mode === "fixed" ? "rgba(155,89,182,0.3)" : "rgba(255,255,255,0.06)"}`,
                color: mode === "fixed" ? "#9B59B6" : "rgba(255,255,255,0.45)",
              }}>
              固定额度
            </button>
          </div>

          {mode === "fixed" && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <input
                  autoFocus
                  type="number"
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !tooLow) handleSave(); if (e.key === "Escape") onCancel(); }}
                  className="flex-1 px-3 py-2 rounded-lg outline-none"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${tooLow ? "rgba(255,100,100,0.4)" : "rgba(155,89,182,0.35)"}`,
                    color: "rgba(255,255,255,0.85)",
                    fontSize: "14px",
                    caretColor: "#9B59B6",
                  }}
                  placeholder="输入额度"
                />
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>颗</span>
              </div>

              {/* Visual bar */}
              <div className="rounded-lg p-3 mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>额度使用</span>
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>
                    已消耗 {currentConsumed.toLocaleString()} 颗
                  </span>
                </div>
                <div className="w-full rounded-full overflow-hidden" style={{ height: "5px", background: "rgba(255,255,255,0.07)" }}>
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${pct}%`,
                    background: pct > 90 ? "#ff6b6b" : "#9B59B6",
                  }} />
                </div>
              </div>

              {tooLow && (
                <div className="rounded-lg px-3 py-2 mb-3" style={{ background: "rgba(255,100,100,0.06)", border: "1px solid rgba(255,100,100,0.15)" }}>
                  <span style={{ fontSize: "10px", color: "#ff6b6b" }}>额度不能低于已消耗量</span>
                </div>
              )}
            </>
          )}

          {mode === "unlimited" && (
            <div className="rounded-lg p-4 mb-4" style={{ background: "rgba(74,198,120,0.06)", border: "1px solid rgba(74,198,120,0.15)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <span style={{ fontSize: "12px", color: "#4AC678", fontWeight: 500 }}>无额度限制</span>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>不限制该成员的生产栗使用</div>
                </div>
                <span style={{ fontSize: "18px", color: "#4AC678" }}>∞</span>
              </div>
              <div className="w-full rounded-full overflow-hidden mt-3" style={{ height: "5px", background: "rgba(74,198,120,0.15)" }}>
                <div className="h-full rounded-full" style={{ width: "100%", background: "#4AC678" }} />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={onCancel} className="flex-1 py-2 rounded-lg text-sm hover:opacity-80 transition-opacity"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
              取消
            </button>
            <button onClick={handleSave} disabled={tooLow}
              className="flex-1 py-2 rounded-lg text-sm transition-all hover:opacity-90 disabled:opacity-30"
              style={{
                background: "rgba(232,115,34,0.15)",
                border: "1px solid rgba(232,115,34,0.3)",
                color: "#E87322",
                fontWeight: 500,
              }}>
              确认
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Inline Total Quota Editor (inside card) ───────────────────────────────────
function InlineTotalQuotaEditor({
  currentConsumed,
  currentTotal,
  onSave,
  onCancel,
}: {
  currentConsumed: number;
  currentTotal: number;
  onSave: (v: number) => void;
  onCancel: () => void;
}) {
  const [val, setVal] = useState(String(currentTotal));
  const numVal = Number(val.replace(/,/g, "")) || 0;
  const tooLow = numVal < currentConsumed;
  const pctConsumed = numVal > 0 ? Math.min(100, (currentConsumed / Math.max(numVal, currentConsumed)) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onCancel}>
      <div className="rounded-2xl w-96 overflow-hidden shadow-2xl" style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>修改项目总配额</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>当前总配额 {currentTotal.toLocaleString()} 颗</div>
          </div>
          <button onClick={onCancel} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-4">
            <input
              autoFocus
              type="number"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !tooLow) { onSave(numVal); toast.success("项目总配额已更新"); }
                if (e.key === "Escape") onCancel();
              }}
              className="flex-1 px-3 py-2 rounded-lg outline-none"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${tooLow ? "rgba(255,100,100,0.4)" : "rgba(232,115,34,0.35)"}`,
                color: "rgba(255,255,255,0.85)",
                fontSize: "14px",
                caretColor: "#E87322",
              }}
              placeholder="输入总配额"
            />
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>颗</span>
          </div>

          {/* Visual bar */}
          <div className="rounded-lg p-3 mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center justify-between mb-1.5">
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>配额约束</span>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>
                已消耗 {currentConsumed.toLocaleString()} 颗（最低限额）
              </span>
            </div>
            <div className="relative w-full rounded-full overflow-hidden" style={{ height: "8px", background: "rgba(255,255,255,0.06)" }}>
              {numVal > 0 && (
                <div className="absolute left-0 top-0 h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (numVal / Math.max(numVal, currentConsumed)) * 100)}%`,
                    background: tooLow ? "rgba(255,100,100,0.12)" : "rgba(232,115,34,0.12)",
                    transition: "width 0.25s",
                  }} />
              )}
              <div className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width: `${pctConsumed}%`,
                  background: tooLow ? "linear-gradient(90deg,#ff6b6b,#ff9b9b)" : "linear-gradient(90deg,#E87322,#F5A623)",
                  transition: "width 0.25s",
                }} />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span style={{ fontSize: "9px", color: tooLow ? "#ff6b6b" : "rgba(255,255,255,0.25)" }}>
                已消耗 {currentConsumed.toLocaleString()}
              </span>
              {numVal > 0 && (
                <span style={{ fontSize: "9px", color: tooLow ? "#ff6b6b" : "rgba(255,255,255,0.25)" }}>
                  → 新总额 {numVal.toLocaleString()}
                </span>
              )}
            </div>
            {tooLow && (
              <div className="flex items-center gap-1.5 mt-2 px-2.5 py-2 rounded-lg" style={{ background: "rgba(255,100,100,0.1)", border: "1px solid rgba(255,100,100,0.2)" }}>
                <AlertTriangle size={11} style={{ color: "#ff6b6b", flexShrink: 0 }} />
                <span style={{ fontSize: "10px", color: "#ff9b9b", lineHeight: 1.5 }}>
                  配额不能小于已消耗的 <strong>{currentConsumed.toLocaleString()}</strong> 颗，请输入更大的数值
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={onCancel} className="flex-1 py-2 rounded-lg text-sm hover:opacity-80 transition-opacity"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
              取消
            </button>
            <button
              onClick={() => { if (!tooLow) { onSave(numVal); toast.success("项目总配额已更新"); } }}
              disabled={tooLow}
              className="flex-1 py-2 rounded-lg text-sm transition-all"
              style={{
                background: tooLow ? "rgba(255,100,100,0.1)" : "rgba(232,115,34,0.85)",
                border: `1px solid ${tooLow ? "rgba(255,100,100,0.2)" : "rgba(232,115,34,0.4)"}`,
                color: tooLow ? "#ff6b6b" : "#fff",
                cursor: tooLow ? "not-allowed" : "pointer",
                fontWeight: 500,
              }}>
              {tooLow ? "不可保存" : "保存配额"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper Components for Member Table ──────────────────────────────────────────
function MetricHeader({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <div className="relative group/header cursor-help flex items-center justify-end gap-1" style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>
      <span>{label}</span>
      <Info size={10} style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0 }} />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover/header:opacity-100 transition-opacity z-10"
        style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", boxShadow: "0 4px 12px rgba(0,0,0,0.4)", fontSize: "10px" }}>
        {tooltip}
      </div>
    </div>
  );
}

function MetricCell({ value, tooltip, subValue, subTooltip, progressPct, progressColor }: {
  value: string;
  tooltip: string;
  subValue?: string;
  subTooltip?: string;
  progressPct?: number;
  progressColor?: string;
}) {
  return (
    <div className="relative group/metric flex flex-col items-center gap-0.5 cursor-help">
      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{value}</span>
      {progressPct !== undefined && progressColor && (
        <div className="w-full rounded-full overflow-hidden" style={{ height: "3px", background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, progressPct)}%`, background: progressColor, transition: "width 0.3s" }} />
        </div>
      )}
      {subValue && <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{subValue}</span>}
      {/* Hover tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover/metric:opacity-100 transition-opacity z-10"
        style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", boxShadow: "0 4px 12px rgba(0,0,0,0.4)", fontSize: "10px" }}>
        {tooltip}
        {subTooltip && <><br />{subTooltip}</>}
      </div>
    </div>
  );
}

function FilterDropdown({ label, options, selected, onChange }: {
  label: string;
  options: string[];
  selected: Set<string>;
  onChange: (s: Set<string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const count = selected.size;
  const toggle = (name: string) => {
    const next = new Set(selected);
    if (next.has(name)) next.delete(name); else next.add(name);
    onChange(next);
  };
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all"
        style={{
          background: count > 0 ? "rgba(232,115,34,0.12)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${count > 0 ? "rgba(232,115,34,0.25)" : "rgba(255,255,255,0.08)"}`,
          color: count > 0 ? "#E87322" : "rgba(255,255,255,0.45)",
          fontSize: "10px",
        }}>
        {label}{count > 0 ? ` (${count})` : ""}
        <ChevronDown size={8} style={{ marginLeft: "1px", opacity: 0.5 }} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 rounded-xl overflow-hidden z-20 shadow-2xl min-w-[140px]"
          style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>{label}</span>
            {count > 0 && (
              <button onClick={() => onChange(new Set())} style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>清空</button>
            )}
          </div>
          {options.map(name => (
            <button key={name} onClick={() => toggle(name)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-white/5 transition-colors"
              style={{ color: "rgba(255,255,255,0.65)" }}>
              <div className="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0"
                style={{ border: `1.5px solid ${selected.has(name) ? "#E87322" : "rgba(255,255,255,0.2)"}`, background: selected.has(name) ? "rgba(232,115,34,0.2)" : "transparent" }}>
                {selected.has(name) && <Check size={8} style={{ color: "#E87322" }} />}
              </div>
              <span style={{ fontSize: "11px" }}>{name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PermFilterDropdown({ value, onChange }: {
  value: ProjectPermission | "all";
  onChange: (v: ProjectPermission | "all") => void;
}) {
  const [open, setOpen] = useState(false);
  const label = value === "all" ? "全部权限" : value;
  const options: (ProjectPermission | "all")[] = ["all", "管理", "编辑", "阅读"];
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all"
        style={{
          background: value !== "all" ? "rgba(74,158,224,0.12)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${value !== "all" ? "rgba(74,158,224,0.25)" : "rgba(255,255,255,0.08)"}`,
          color: value !== "all" ? "#4A9EE0" : "rgba(255,255,255,0.45)",
          fontSize: "10px",
        }}>
        {label}
        <ChevronDown size={8} style={{ marginLeft: "1px", opacity: 0.5 }} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 rounded-xl overflow-hidden z-20 shadow-2xl min-w-[120px]"
          style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}>
          {options.map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-white/5 transition-colors"
              style={{ color: value === opt ? "#4A9EE0" : "rgba(255,255,255,0.65)" }}>
              <span style={{ fontSize: "11px" }}>{opt === "all" ? "全部权限" : opt}</span>
              {value === opt && <Check size={10} style={{ color: "#4A9EE0" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DownloadIcon(props: { size?: number }) {
  return (
    <svg width={props.size || 10} height={props.size || 10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ProjectHomePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const project = getProjectById(id ?? "");

  const [projectName, setProjectName] = useState(project?.name ?? "");
  const [editingName, setEditingName] = useState(false);
  const [status, setStatus] = useState(project?.status ?? "进行中");
  const [showStatusDrop, setShowStatusDrop] = useState(false);
  const [period, setPeriod] = useState<PeriodKey>("month");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showAllocateDialog, setShowAllocateDialog] = useState(false);

  // Basic info inline state
  const [basicInfo, setBasicInfo] = useState({
    aspectRatio: "16:9",
    resolution: "1920×1080",
    frameRate: "24",
  });

  // Total quota for the project (used in consumption section)
  const [localTokenTotal, setLocalTokenTotal] = useState(project?.tokenTotal ?? 50000);
  const [editingTotalQuota, setEditingTotalQuota] = useState(false);

  // Watermark state
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);

  // Member state
  const [memberPermissions, setMemberPermissions] = useState<Record<number, ProjectPermission>>({});
    const [quotaEditorIndex, setQuotaEditorIndex] = useState<number | null>(null);
  const [editQuotaIndex, setEditQuotaIndex] = useState<number | null>(null); // member quota editor
  const [removeConfirmIndex, setRemoveConfirmIndex] = useState<number | null>(null);
  const [removedMembers, setRemovedMembers] = useState<Set<number>>(new Set());
  const [memberQuotas, setMemberQuotas] = useState<MemberQuota[]>(INITIAL_MEMBER_QUOTAS);

  // Tab state
  const [activeTab, setActiveTab] = useState<ProjectTab>("members");

  // Episode progress collapse state
  const [expandedEpisodes, setExpandedEpisodes] = useState<Set<number>>(new Set());

  // Category drill-down expand state
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Transaction detail inline expand
  const [expandedDetailMember, setExpandedDetailMember] = useState<string | null>(null);

  // Filter states
  const [filterMembers, setFilterMembers] = useState<Set<string>>(new Set());
  const [filterPerm, setFilterPerm] = useState<ProjectPermission | "all">("all");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: "rgba(255,255,255,0.4)" }}>项目不存在</div>
    );
  }

  const projectPerm = project.permission;

  const membersWithPerm: MemberWithPerm[] = project.members.map((m, i) => {
    const detail = MEMBER_DETAIL_STATS[i] ?? MEMBER_DETAIL_STATS[0];
    return {
      ...m,
      permission: (memberPermissions[i] ?? (["管理", "编辑", "编辑", "阅读"] as ProjectPermission[])[i]) ?? "编辑",
      ...detail,
    };
  });

  // Filter out removed members (keep original index for key)
  const activeMembersIndexed = membersWithPerm
    .map((m, i) => ({ m, i }))
    .filter(({ i }) => !removedMembers.has(i));

  const activeMembers = activeMembersIndexed.map(({ m }) => m);

  const permCounts = {
    管理: activeMembers.filter(m => m.permission === "管理").length,
    编辑: activeMembers.filter(m => m.permission === "编辑").length,
    阅读: activeMembers.filter(m => m.permission === "阅读").length,
  };

  const tokenPercent = Math.round((project.tokenUsed / localTokenTotal) * 100);
  const projectBalance = localTokenTotal - project.tokenUsed;
  const memberTotalBalance = Math.round(localTokenTotal * 0.12);
  const periodConsumed = period === "all"
    ? project.tokenUsed
    : (PERIOD_CONSUMED[period] ?? 0);
  const memberPeriodConsumed: number[] = period === "all"
    ? membersWithPerm.map((m) => m.tokenUsed)
    : (MEMBER_PERIOD_CONSUMED[period] ?? []);
  const contentProgress = project.progress;
  const budgetEfficiency = tokenPercent - contentProgress;
  const statusStyle = STATUS_STYLE[status] ?? STATUS_STYLE["暂停"];
  const trendData = TREND_DATA[period] ?? TREND_DATA.month;

  // Convert to DialogMember format
  const dialogMembers: DialogMember[] = activeMembers.map((m, i) => ({
    id: String(i + 1),
    name: m.name,
    role: m.role,
    avatarColor: MEMBER_COLORS[i % MEMBER_COLORS.length],
    letter: m.avatar,
    projectPermission: m.permission,
  }));

  const handleRemoveMember = (originalIndex: number) => {
    setRemovedMembers(prev => new Set([...prev, originalIndex]));
    const releasedQuota = memberQuotas[originalIndex];
    const released = releasedQuota?.type !== "unlimited" ? releasedQuota?.remaining ?? 0 : 0;
    toast.success(`成员已移除，${released > 0 ? `${released.toLocaleString()} 颗生产栗已释放至项目预算` : "配额已释放至项目预算"}`);
  };

  const handlePermChange = (originalIndex: number, perm: ProjectPermission) => {
    setMemberPermissions(prev => ({ ...prev, [originalIndex]: perm }));
    setOpenPermDropdown(null);
    toast.success(`权限已更新为「${perm}」`);
  };

  const toggleDetailMember = (name: string) => {
    setExpandedDetailMember(prev => prev === name ? null : name);
  };

  const handleDownloadCSV = () => {
    const visible = filteredMembersIndexed;
    const headers = ["成员", "角色", "消耗", "配额类型", "配额总额", "剩余", "图片生成", "图片消耗", "视频生成", "视频消耗", "视频时长"];
    const rows = visible.map(({ m, i }) => {
      const qd = memberQuotas[i] ?? memberQuotas[0];
      const qLabel = qd.type === "unlimited" ? "无限制" : "固定额度";
      const qTotal = qd.type === "unlimited" ? "-" : qd.total.toLocaleString();
      const qRemaining = qd.type === "unlimited" ? "-" : qd.remaining.toLocaleString();
      return [m.name, m.role, m.tokenUsed.toLocaleString(), qLabel, qTotal, qRemaining, m.imageGenerated, m.imageTokenUsed, m.videoGenerated, m.videoTokenUsed, m.videoDuration];
    });
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `成员消耗_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered members
  const filteredMembersIndexed = activeMembersIndexed.filter(({ m, i }) => {
    if (filterMembers.size > 0 && !filterMembers.has(m.name)) return false;
    if (filterPerm !== "all" && m.permission !== filterPerm) return false;
    return true;
  });

  // Pre-compute modal data to avoid IIFE blocks in JSX
  const quotaEditorEntry = quotaEditorIndex !== null
    ? (activeMembersIndexed.find(x => x.i === quotaEditorIndex) ?? null)
    : null;
  const editQuotaEntry = editQuotaIndex !== null
    ? activeMembersIndexed.find(x => x.i === editQuotaIndex)
    : null;
  const handleMemberQuotaSave = (i: number, q: MemberQuota) => {
    setMemberQuotas(prev => prev.map((m, idx) => idx === i ? q : m));
    setEditQuotaIndex(null);
  };
  const removeConfirmEntry = removeConfirmIndex !== null
    ? (activeMembersIndexed.find(x => x.i === removeConfirmIndex) ?? null)
    : null;

  return (
    <div
      className="h-full overflow-auto"
      style={{ background: "radial-gradient(ellipse 70% 35% at 50% 0%, rgba(140,70,20,0.18) 0%, rgba(20,15,9,0) 55%), #140F09" }}
      onClick={() => setShowStatusDrop(false)}
    >
      <div className="max-w-5xl mx-auto px-8 py-7">

        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-1.5 mb-5" style={{ color: "rgba(255,255,255,0.3)" }}>
          <button className="text-xs hover:text-white transition-colors" onClick={() => navigate("/projects")}>所有项目</button>
          <ChevronRight size={12} />
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{projectName}</span>
        </div>

        {/* ── Header ── */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            {editingName ? (
              <input
                autoFocus
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={() => { setEditingName(false); toast.success("项目名称已更新"); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { setEditingName(false); toast.success("项目名称已更新"); }
                  if (e.key === "Escape") { setProjectName(project.name); setEditingName(false); }
                }}
                className="bg-transparent outline-none text-white rounded-lg px-2 py-0.5"
                style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em", border: "1px solid rgba(232,115,34,0.5)", caretColor: "#E87322", minWidth: "200px" }}
              />
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-white" style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>{projectName}</h1>
                <button onClick={() => projectPerm === "管理" && setEditingName(true)}
                  className={`transition-opacity w-6 h-6 rounded-lg flex items-center justify-center ${projectPerm === "管理" ? "opacity-0 group-hover:opacity-100 hover:bg-white/10" : "opacity-0 pointer-events-none"}`}
                  style={{ color: "rgba(255,255,255,0.4)" }}>
                  <Edit2 size={12} />
                </button>
              </div>
            )}

            {/* Status dropdown / badge */}
            {projectPerm === "阅读" ? (
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}`, fontSize: "12px" }}>
                {status}
              </span>
            ) : (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowStatusDrop(!showStatusDrop)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0 transition-colors"
                style={{ background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}`, fontSize: "12px" }}>
                {status}<ChevronDown size={10} />
              </button>
              {showStatusDrop && (
                <div className="absolute left-0 top-full mt-1 rounded-xl overflow-hidden z-30 shadow-2xl"
                  style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)", minWidth: "120px" }}>
                  {STATUS_OPTIONS.map((s) => {
                    const st = STATUS_STYLE[s];
                    return (
                      <button key={s} onClick={() => { setStatus(s); setShowStatusDrop(false); toast.success(`状态已更新为「${s}」`); }}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-left hover:bg-white/5"
                        style={{ color: status === s ? st.text : "rgba(255,255,255,0.7)" }}>
                        <span>{s}</span>
                        {status === s && <Check size={12} style={{ color: st.text }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            )}

            <div className="flex items-center gap-1 ml-2" style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
              <Clock size={11} /><span>始于 {project.startDate}</span>
              <span className="mx-2">·</span>
              <Clock size={11} /><span>最近 {project.lastEdit}</span>
            </div>
          </div>

          {/* ── Basic Info inline-edit badges ── */}
          <div className="flex items-center gap-2 flex-wrap">
            <InlineEditBadge
              label="比例"
              value={basicInfo.aspectRatio}
              icon={Monitor}
              onSave={(v) => setBasicInfo(prev => ({ ...prev, aspectRatio: v }))}
              readOnly={projectPerm === "阅读"}
            />
            <InlineEditBadge
              label="分辨率"
              value={basicInfo.resolution}
              icon={Layers}
              onSave={(v) => setBasicInfo(prev => ({ ...prev, resolution: v }))}
              readOnly={projectPerm === "阅读"}
            />
            <InlineEditBadge
              label="帧率"
              value={basicInfo.frameRate}
              icon={Zap}
              suffix="fps"
              onSave={(v) => setBasicInfo(prev => ({ ...prev, frameRate: v }))}
              readOnly={projectPerm === "阅读"}
            />

            {/* Watermark indicator */}
            {watermarkEnabled && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                style={{ background: "rgba(155,89,182,0.1)", border: "1px solid rgba(155,89,182,0.25)", color: "#9B59B6" }}>
                <Droplets size={11} />
                <span style={{ fontSize: "11px" }}>水印已启用</span>
              </div>
            )}
          </div>
        </div>

      {/* ── Stats Row: 4 unified cards ── */}
        <div className={`grid gap-4 mb-6 ${projectPerm === "管理" ? "grid-cols-4" : "grid-cols-2"}`}>

          {/* ── 参与成员 ── */}
          {projectPerm === "管理" && (
          <div className="rounded-xl p-4 flex flex-col" style={{ background: "#1A1510", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Users size={12} style={{ color: "rgba(232,115,34,0.7)" }} />
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>参与成员</span>
                <StatTooltip text="当前参与此项目的活跃成员及其权限分布" />
              </div>
              {projectPerm === "管理" && (
                <button
                  onClick={() => setShowMemberModal(true)}
                  className="px-2 py-1 rounded-lg text-xs transition-colors hover:opacity-80"
                  style={{ background: "rgba(232,115,34,0.12)", color: "#E87322", border: "1px solid rgba(232,115,34,0.25)", fontSize: "10px" }}>
                  管理成员
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="flex items-center" style={{ marginLeft: "-4px" }}>
                {activeMembers.slice(0, 5).map((m, i) => (
                  <div key={i} className="w-7 h-7 rounded-full flex items-center justify-center text-white flex-shrink-0"
                    style={{ background: MEMBER_COLORS[i % MEMBER_COLORS.length], fontSize: "9px", fontWeight: 600, border: "2px solid #1A1510", marginLeft: i > 0 ? "-8px" : "4px", zIndex: 10 - i, position: "relative" }}>
                    {m.avatar}
                  </div>
                ))}
                {activeMembers.length > 5 && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.08)", fontSize: "9px", color: "rgba(255,255,255,0.5)", border: "2px solid #1A1510", marginLeft: "-8px", zIndex: 3, position: "relative" }}>
                    +{activeMembers.length - 5}
                  </div>
                )}
              </div>
              <span className="text-white" style={{ fontSize: "20px", fontWeight: 600 }}>{activeMembers.length}</span>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>人</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-auto">
              {(Object.entries(permCounts) as [ProjectPermission, number][]).map(([perm, cnt]) => cnt > 0 && (
                <div key={perm} className="flex items-center gap-1 px-1.5 py-0.5 rounded"
                  style={{ background: `${PERM_COLORS[perm]}12`, border: `1px solid ${PERM_COLORS[perm]}25`, fontSize: "10px", color: PERM_COLORS[perm] }}>
                  {perm} ×{cnt}
                </div>
              ))}
            </div>
          </div>
          )}

          {/* ── 生产栗消耗 ── */}
          {projectPerm === "管理" ? (
          <div className="rounded-xl p-4 flex flex-col" style={{ background: "#1A1510", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Coins size={12} style={{ color: "rgba(232,115,34,0.7)" }} />
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>生产栗消耗</span>
                <StatTooltip text="项目已消耗生产栗 / 总配额。超过 80% 时进入预警区间" />
              </div>
              <button
                onClick={() => setEditingTotalQuota(!editingTotalQuota)}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-xs hover:opacity-80 transition-opacity"
                style={{
                  background: editingTotalQuota ? "rgba(232,115,34,0.15)" : "rgba(76,73,252,0.12)",
                  color: editingTotalQuota ? "#E87322" : "#4c49fc",
                  border: `1px solid ${editingTotalQuota ? "rgba(232,115,34,0.3)" : "rgba(76,73,252,0.2)"}`,
                  fontSize: "10px",
                }}>
                <Edit2 size={9} />{editingTotalQuota ? "收起" : "配额"}
              </button>
            </div>
            <div className="flex items-end gap-1.5 mb-2">
              <span className="text-white" style={{ fontSize: "20px", fontWeight: 600 }}>{project.tokenUsed.toLocaleString()}</span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginBottom: "2px" }}>/ {localTokenTotal.toLocaleString()} 颗</span>
            </div>
            {!editingTotalQuota && (
              <>
                <div className="w-full rounded-full overflow-hidden mb-1.5" style={{ height: "5px", background: "rgba(255,255,255,0.07)" }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, tokenPercent)}%`, background: tokenPercent > 80 ? "linear-gradient(90deg,#ff6b6b,#ff9b9b)" : "linear-gradient(90deg,#E87322,#F5A623)", transition: "width 0.6s" }} />
                </div>
                <div className="text-xs mt-auto" style={{ color: tokenPercent > 80 ? "#ff6b6b" : "rgba(255,255,255,0.35)" }}>
                  已消耗 {tokenPercent}% · 剩余 {projectBalance.toLocaleString()} 颗
                </div>
              </>
            )}
            {editingTotalQuota && (
              <InlineTotalQuotaEditor
                currentConsumed={project.tokenUsed}
                currentTotal={localTokenTotal}
                onSave={(v) => { setLocalTokenTotal(v); setEditingTotalQuota(false); }}
                onCancel={() => setEditingTotalQuota(false)}
              />
            )}
          </div>
          ) : (() => {
            const myUsed = membersWithPerm[0]?.tokenUsed ?? 0;
            const myQuota = memberQuotas[0];
            const myTotal = myQuota?.type === "unlimited" ? 0 : (myQuota?.total ?? 0);
            const myRemaining = myQuota?.type === "unlimited" ? Infinity : (myQuota?.remaining ?? 0);
            const myPct = myTotal > 0 ? Math.round((myUsed / myTotal) * 100) : 0;
            return (
              <div className="rounded-xl p-4 flex flex-col" style={{ background: "#1A1510", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-1.5 mb-3">
                  <Coins size={12} style={{ color: "rgba(232,115,34,0.7)" }} />
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>我的消耗</span>
                  <StatTooltip text="当前时间段内你的生产栗消耗 / 分配配额" />
                </div>
                <div className="flex items-end gap-1.5 mb-2">
                  <span className="text-white" style={{ fontSize: "20px", fontWeight: 600 }}>{myUsed.toLocaleString()}</span>
                  {myQuota?.type !== "unlimited" && myTotal > 0 && (
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginBottom: "2px" }}>/ {myTotal.toLocaleString()} 颗</span>
                  )}
                  {myQuota?.type === "unlimited" && (
                    <span style={{ fontSize: "11px", color: "#4AC678", marginBottom: "2px" }}>颗 · 无限制</span>
                  )}
                </div>
                {myQuota?.type !== "unlimited" && myTotal > 0 && (
                  <>
                    <div className="w-full rounded-full overflow-hidden mb-1.5" style={{ height: "5px", background: "rgba(255,255,255,0.07)" }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, myPct)}%`, background: myPct > 80 ? "linear-gradient(90deg,#ff6b6b,#ff9b9b)" : "linear-gradient(90deg,#E87322,#F5A623)", transition: "width 0.6s" }} />
                    </div>
                    <div className="text-xs mt-auto" style={{ color: myPct > 80 ? "#ff6b6b" : "rgba(255,255,255,0.35)" }}>
                      已消耗 {myPct}% · 剩余 {isFinite(myRemaining) ? myRemaining.toLocaleString() : "∞"} 颗
                    </div>
                  </>
                )}
                {(myQuota?.type === "unlimited" || myTotal === 0) && (
                  <div className="text-xs mt-auto" style={{ color: "rgba(255,255,255,0.35)" }}>无消耗额度限制</div>
                )}
              </div>
            );
          })()}

          {/* ── 项目进度 ── */}
          <div className="rounded-xl p-4 flex flex-col" style={{ background: "#1A1510", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <BarChart2 size={12} style={{ color: "rgba(232,115,34,0.7)" }} />
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>项目进度</span>
                <StatTooltip text="按集数统计的内容完成度（已完成集数/总集数），每集完成需通过全部分镜审核" />
              </div>
              <span className="px-1.5 py-0.5 rounded" style={{ fontSize: "10px", background: contentProgress === 100 ? "rgba(74,198,120,0.12)" : "rgba(232,115,34,0.1)", color: contentProgress === 100 ? "#4AC678" : "#E87322", border: `1px solid ${contentProgress === 100 ? "rgba(74,198,120,0.25)" : "rgba(232,115,34,0.2)"}` }}>
                {contentProgress === 100 ? "已完成" : "进行中"}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="relative flex-shrink-0">
                <MiniRing pct={contentProgress} size={52} stroke={4} color={contentProgress === 100 ? "#4AC678" : "#E87322"} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span style={{ fontSize: "11px", fontWeight: 700, color: contentProgress === 100 ? "#4AC678" : "#E87322" }}>{contentProgress}%</span>
                </div>
              </div>
              <div>
                <div className="text-white" style={{ fontSize: "20px", fontWeight: 600 }}>
                  {project.completedEpisodes}/{project.episodes}
                </div>
                
              </div>
            </div>
            <div className="text-xs mt-auto" style={{ color: "rgba(255,255,255,0.3)" }}>
              {project.episodes - project.completedEpisodes > 0 ? `${project.episodes - project.completedEpisodes} 集待完成` : "全部集数已完成"}
            </div>
          </div>

          {/* ── 效率诊断 ── */}
          {projectPerm === "管理" && (
          <div className="rounded-xl p-4 flex flex-col"
            style={{
              background: budgetEfficiency > 15 ? "rgba(255,100,100,0.06)" : budgetEfficiency < -10 ? "rgba(74,198,120,0.06)" : "#1A1510",
              border: `1px solid ${budgetEfficiency > 15 ? "rgba(255,100,100,0.2)" : budgetEfficiency < -10 ? "rgba(74,198,120,0.2)" : "rgba(255,255,255,0.06)"}`,
            }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Activity size={12} style={{ color: budgetEfficiency > 15 ? "#ff6b6b" : budgetEfficiency < -10 ? "#4AC678" : "rgba(232,115,34,0.7)" }} />
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>效率诊断</span>
                <StatTooltip text="对比内容完成度与预算消耗率差值。差值 > 15% 为预算超耗，< -10% 为高效节约" />
              </div>
              <span style={{ fontSize: "11px", fontWeight: 600, color: budgetEfficiency > 15 ? "#ff6b6b" : budgetEfficiency < -10 ? "#4AC678" : "#E87322" }}>
                {budgetEfficiency > 0 ? "+" : ""}{budgetEfficiency}%
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 rounded-full self-start"
              style={{
                background: budgetEfficiency > 15 ? "rgba(255,100,100,0.15)" : budgetEfficiency < -10 ? "rgba(74,198,120,0.15)" : "rgba(232,115,34,0.12)",
                color: budgetEfficiency > 15 ? "#ff6b6b" : budgetEfficiency < -10 ? "#4AC678" : "#E87322",
                fontSize: "11px",
              }}>
              {budgetEfficiency > 15 ? "⚠️ 预算超耗" : budgetEfficiency < -10 ? "✅ 高效节约" : "ℹ️ 正常进度"}
            </div>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }} className="mt-auto">
              {budgetEfficiency > 15
                ? `预算 ${tokenPercent}% vs 内容 ${contentProgress}%，差值 +${budgetEfficiency}%`
                : budgetEfficiency < -10
                ? `内容 ${contentProgress}% vs 预算 ${tokenPercent}%，领先 ${Math.abs(budgetEfficiency)}%`
                : `内容 ${contentProgress}% / 预算 ${tokenPercent}%，差值 ${budgetEfficiency > 0 ? "+" : ""}${budgetEfficiency}%`}
            </p>
          </div>
          )}
        </div>
        {/* ══════════════════════════════════════════════════════════════════════
            ── Tab Container ──
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="rounded-xl overflow-hidden mb-5" style={{ background: "#1A1510", border: "1px solid rgba(255,255,255,0.06)" }}>
          {/* Tab Header */}
          <div className="flex items-center gap-1 px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            {TAB_CONFIG.filter(t => projectPerm === "管理" || t.key !== "warnings").map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{
                  background: activeTab === key ? "rgba(232,115,34,0.15)" : "transparent",
                  color: activeTab === key ? "#E87322" : "rgba(255,255,255,0.45)",
                  border: activeTab === key ? "1px solid rgba(232,115,34,0.3)" : "1px solid transparent",
                  fontWeight: activeTab === key ? 500 : 400,
                }}
              >
                <Icon size={12} />
                {label}
                {key === "members" && (
                  <span className="px-1.5 py-0.5 rounded-full" style={{ background: "rgba(232,115,34,0.2)", color: "#E87322", fontSize: "10px" }}>
                    {activeMembers.length}
                  </span>
                )}
                {key === "warnings" && (
                  <span className="px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,100,100,0.15)", color: "#ff6b6b", fontSize: "10px" }}>
                    {DUPLICATE_PROMPTS.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-5">
            {/* ── 成员与成本 Tab (merged) ── */}
            {activeTab === "members" && (
              <div className="flex flex-col gap-6">

                {/* ── Section 1: 成员管理 ── */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                      {projectPerm === "管理" ? "成员管理" : "我的信息"}
                    </span>
                    <div className="flex items-center gap-2">
                      {projectPerm === "管理" && (
                      <button
                        onClick={() => setShowAllocateDialog(true)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs hover:opacity-80"
                        style={{ background: "rgba(155,89,182,0.12)", color: "#9B59B6", border: "1px solid rgba(155,89,182,0.2)", fontSize: "11px" }}>
                        <RefreshCw size={9} />批量分配
                      </button>
                      )}
                    </div>
                  </div>

                  {/* Filter Bar (only 管理) */}
                  {projectPerm === "管理" && (
                  <div className="flex items-center gap-3 mb-3 px-1">
                    <FilterDropdown
                      label="成员"
                      options={activeMembers.map(m => m.name)}
                      selected={filterMembers}
                      onChange={setFilterMembers}
                    />
                    <PermFilterDropdown value={filterPerm} onChange={setFilterPerm} />
                    <div className="flex items-center gap-1.5">
                      <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)}
                        className="px-2 py-1 rounded-lg text-xs outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", colorScheme: "dark", fontSize: "10px" }} />
                      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>~</span>
                      <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)}
                        className="px-2 py-1 rounded-lg text-xs outline-none"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", colorScheme: "dark", fontSize: "10px" }} />
                    </div>
                    <button onClick={handleDownloadCSV}
                      className="ml-auto flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all hover:opacity-80"
                      style={{ background: "rgba(74,198,120,0.1)", color: "#4AC678", border: "1px solid rgba(74,198,120,0.2)", fontSize: "10px" }}>
                      <DownloadIcon size={10} />下载表格
                    </button>
                  </div>
                  )}

                  {/* Table Header */}
                  <div className="grid px-4 py-2.5 rounded-lg"
                    style={{ gridTemplateColumns: "120px 140px 85px 85px 85px 85px 80px 90px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>成员</span>
                    <MetricHeader label="消耗/配额" tooltip="点击可修改配额模式（无限制/固定额度）" />
                    <MetricHeader label="图片生成" tooltip="生成的图片数量" />
                    <MetricHeader label="图片消耗" tooltip="生成图片消耗的生产栗" />
                    <MetricHeader label="视频生成" tooltip="生成的视频数量" />
                    <MetricHeader label="视频消耗" tooltip="生成视频消耗的生产栗" />
                    <MetricHeader label="视频时长" tooltip="累计生成的视频总时长" />
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>操作</span>
                  </div>

                  {/* Member Rows */}
                  <div className="flex flex-col gap-1 mt-2">
                    {/* ── 总计 Row ── */}
                    {(() => {
                      const ti = filteredMembersIndexed;
                      const totalConsumed = ti.reduce((s, { i }) => s + (memberPeriodConsumed[i] ?? 0), 0);
                      const totalImageGen = ti.reduce((s, { m }) => s + m.imageGenerated, 0);
                      const totalImageTok = ti.reduce((s, { m }) => s + m.imageTokenUsed, 0);
                      const totalVidGen = ti.reduce((s, { m }) => s + m.videoGenerated, 0);
                      const totalVidTok = ti.reduce((s, { m }) => s + m.videoTokenUsed, 0);
                      const totalDuration = ti.reduce((s, { m }) => {
                        const parts = m.videoDuration.match(/(\d+)分(\d+)秒/);
                        return s + (parts ? parseInt(parts[1]) * 60 + parseInt(parts[2]) : 0);
                      }, 0);
                      return (
                        <div className="grid px-5 py-2.5 rounded-lg"
                          style={{ gridTemplateColumns: "120px 140px 85px 85px 85px 85px 80px 90px", alignItems: "center", background: "rgba(232,115,34,0.04)", border: "1px solid rgba(232,115,34,0.1)" }}>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(232,115,34,0.2)", fontSize: "10px", fontWeight: 700, color: "#E87322" }}>Σ</div>
                            <span style={{ fontSize: "12px", color: "#E87322", fontWeight: 600 }}>总计</span>
                          </div>
                          <button
                            className="text-left rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors relative group/edit-total"
                            onClick={() => setQuotaEditorIndex(-1)}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-full rounded-full overflow-hidden" style={{ height: "5px", background: "rgba(255,255,255,0.07)", flex: 1 }}>
                                <div className="h-full rounded-full" style={{ width: `${tokenPercent}%`, background: tokenPercent > 80 ? "linear-gradient(90deg,#ff6b6b,#ff9b9b)" : "linear-gradient(90deg,#E87322,#F5A623)" }} />
                              </div>
                              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>
                                {tokenPercent}%
                              </span>
                            </div>
                            <span style={{ fontSize: "10px", color: "#E87322" }}>编辑配额</span>
                          </button>
                          <div className="text-right" style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{totalImageGen}</div>
                          <div className="text-right" style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{totalImageTok.toLocaleString()}</div>
                          <div className="text-right" style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{totalVidGen}</div>
                          <div className="text-right" style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{totalVidTok.toLocaleString()}</div>
                          <div className="text-right" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{formatDuration(totalDuration)}</div>
                          <div />
                        </div>
                      );
                    })()}

                    {/* Member Rows */}
                    {filteredMembersIndexed.map(({ m, i }) => {
                      const qd = memberQuotas[i] ?? memberQuotas[0];
                      const totalTok = memberPeriodConsumed[i] ?? 0;
                      const quotaPct = qd.type === "fixed" && qd.total > 0 ? Math.min(100, (totalTok / qd.total) * 100) : 0;
                      const isExpanded = expandedDetailMember === m.name;
                      const memberTxns = MEMBER_TRANSACTIONS.filter(t => t.memberName === m.name);

                      return (
                        <Fragment key={i}>
                          <div
                            className="grid px-5 py-3 hover:bg-white/[0.02] transition-colors group/row"
                            style={{ gridTemplateColumns: "120px 140px 85px 85px 85px 85px 80px 90px", alignItems: "center" }}
                          >
                            {/* Member Info */}
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: MEMBER_COLORS[i % MEMBER_COLORS.length], fontSize: "10px", fontWeight: 600, color: "#fff" }}>
                                {m.avatar}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="truncate" style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{m.name}</span>
                                  {i === 0 && (
                                    <span className="px-1 py-0.5 rounded flex-shrink-0" style={{ background: "rgba(232,115,34,0.1)", color: "#E87322", fontSize: "9px" }}>你</span>
                                  )}
                                </div>
                                <div className="truncate" style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>
                                  {m.role}
                                </div>
                              </div>
                            </div>

                            {/* Quota — progress bar + edit额度 */}
                            <div className="flex flex-col gap-0.5">
                              <div className="w-full rounded-full overflow-hidden" style={{ height: "4px", background: "rgba(255,255,255,0.07)" }}>
                                <div className="h-full rounded-full transition-all" style={{
                                  width: qd.type === "unlimited" ? "100%" : `${Math.min(100, quotaPct)}%`,
                                  background: qd.type === "unlimited" ? "#4AC678" : quotaPct > 90 ? "#ff6b6b" : "#9B59B6",
                                }} />
                              </div>
                              <div className="flex items-center justify-between">
                                <button
                                  className="text-xs transition-all hover:opacity-80"
                                  style={{
                                    color: qd.type === "unlimited" ? "#4AC678" : "rgba(255,255,255,0.55)",
                                    fontSize: "10px",
                                  }}
                                  onClick={() => setEditQuotaIndex(i)}
                                >
                                  {qd.type === "unlimited" ? "无额度限制" : `${totalTok.toLocaleString()} / ${qd.total.toLocaleString()}`}
                                </button>
                                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>
                                  {qd.type === "unlimited" ? "∞" : "固定"}
                                </span>
                              </div>
                            </div>

                            {/* Image count */}
                            <div className="text-right" style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{m.imageGenerated}</div>

                            {/* Image tokens */}
                            <div className="text-right" style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{m.imageTokenUsed}</div>

                            {/* Video count */}
                            <div className="text-right" style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{m.videoGenerated}</div>

                            {/* Video tokens */}
                            <div className="text-right" style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{m.videoTokenUsed}</div>

                            {/* Video duration */}
                            <div className="text-right" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{m.videoDuration}</div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 justify-end">
                              <button
                                onClick={() => toggleDetailMember(m.name)}
                                className="px-1.5 py-0.5 rounded text-xs transition-all"
                                style={{
                                  color: isExpanded ? "#E87322" : "rgba(255,255,255,0.4)",
                                  fontSize: "10px",
                                }}
                              >
                                明细
                              </button>
                              <span style={{ color: "rgba(255,255,255,0.1)" }}>|</span>
                              <button
                                onClick={() => setRemoveConfirmIndex(i)}
                                className="px-1.5 py-0.5 rounded text-xs transition-all hover:text-red-400"
                                style={{ color: "rgba(255,100,100,0.5)", fontSize: "10px" }}
                              >
                                删除
                              </button>
                            </div>
                          </div>

                          {/* ── Inline Detail Dropdown ── */}
                          {isExpanded && (
                            <div className="mx-5 my-1 rounded-lg overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                              <div className="px-4 py-2 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{m.name} — 消耗明细</span>
                                <button onClick={() => setExpandedDetailMember(null)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10" style={{ color: "rgba(255,255,255,0.3)" }}>
                                  <X size={10} />
                                </button>
                              </div>
                              {memberTxns.length === 0 ? (
                                <div className="px-4 py-6 text-center" style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px" }}>暂无交易记录</div>
                              ) : (
                                <div className="max-h-48 overflow-auto">
                                  <div className="grid grid-cols-12 gap-2 px-4 py-1.5 text-xs" style={{ color: "rgba(255,255,255,0.3)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                    <span className="col-span-3">时间</span>
                                    <span className="col-span-1 text-center">类型</span>
                                    <span className="col-span-5">描述</span>
                                    <span className="col-span-3 text-right">金额</span>
                                  </div>
                                  {memberTxns.map((t, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 px-4 py-2 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                                      <span className="col-span-3 truncate" style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>{t.time}</span>
                                      <span className="col-span-1 flex items-center justify-center">
                                        <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: t.type === "消费" ? "rgba(232,115,34,0.12)" : "rgba(74,198,120,0.12)", color: t.type === "消费" ? "#E87322" : "#4AC678", fontSize: "10px" }}>{t.type}</span>
                                      </span>
                                      <span className="col-span-5 truncate" title={t.description}>{t.description}</span>
                                      <span className="col-span-3 text-right font-mono" style={{ color: t.type === "消费" ? "rgba(255,255,255,0.7)" : "#4AC678", fontSize: "11px" }}>
                                        {t.type === "消费" ? `-${Math.abs(t.amount)}` : `+${t.amount}`}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </Fragment>
                      );
                    })}

                    {activeMembers.length === 0 && (
                      <div className="px-4 py-8 text-center rounded-lg" style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>
                        暂无成员
                      </div>
                    )}
                  </div>


                  {/* Footer summary */}
                  {projectPerm === "管理" && (
                  <div className="px-4 py-3 flex items-center gap-6 rounded-lg mt-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="flex items-center gap-1.5">
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>成员总消耗</span>
                      <span style={{ fontSize: "12px", color: "#E87322", fontWeight: 600 }}>
                        {memberPeriodConsumed.reduce((a, b) => a + b, 0).toLocaleString()}
                      </span>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>颗</span>
                    </div>
                    <div className="w-px h-3" style={{ background: "rgba(255,255,255,0.1)" }} />
                    <div className="flex items-center gap-1.5">
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>项目剩余预算</span>
                      <span style={{ fontSize: "12px", color: "#4AC678", fontWeight: 600 }}>{projectBalance.toLocaleString()}</span>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>颗</span>
                    </div>
                  </div>
                  )}
                </div>

                {/* ── Divider ── */}
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />

                {/* ── 按分类消耗 ── */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>按分类消耗</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setExpandedCategories(new Set(CATEGORY_CONSUMPTION.filter(c => "type" in c).map(c => c.name)))}
                        className="px-2 py-0.5 rounded text-xs hover:opacity-80 transition-opacity"
                        style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}>全部展开</button>
                      <button onClick={() => setExpandedCategories(new Set())}
                        className="px-2 py-0.5 rounded text-xs hover:opacity-80 transition-opacity"
                        style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}>全部收起</button>
                    </div>
                  </div>
                  <div className="overflow-auto rounded-lg" style={{ maxHeight: "380px", border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                    {/* Header */}
                    <div className="grid grid-cols-7 gap-2 px-4 py-2 text-xs sticky top-0 z-10"
                      style={{ background: "rgba(30,26,20,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>
                      <span className="col-span-1 flex items-center gap-1">类别</span>
                      <MetricHeader label="总消耗" tooltip="该分类下所有生成消耗的总生产栗数" />
                      <MetricHeader label="图片生成" tooltip="生成的图片数量" />
                      <MetricHeader label="图片消耗" tooltip="生成图片消耗的生产栗" />
                      <MetricHeader label="视频生成" tooltip="生成的视频数量" />
                      <MetricHeader label="视频时长" tooltip="生成视频的总时长" />
                      <MetricHeader label="视频消耗" tooltip="生成视频消耗的生产栗" />
                    </div>
                    {/* Rows */}
                    <div className="flex flex-col">
                      {CATEGORY_CONSUMPTION.map((cat, i) => {
                        const isFolder = "type" in cat;
                        const isExp = isFolder && expandedCategories.has(cat.name);
                        const leaf = isFolder ? null : (cat as CategoryLeaf);
                        const totalTokens = isFolder ? sumCat(cat.children, "totalTokens") : (leaf?.totalTokens ?? 0);
                        const imageCount = isFolder ? sumCat(cat.children, "imageCount") : (leaf?.imageCount ?? 0);
                        const imageTokens = isFolder ? sumCat(cat.children, "imageTokens") : (leaf?.imageTokens ?? 0);
                        const videoCount = isFolder ? sumCat(cat.children, "videoCount") : (leaf?.videoCount ?? 0);
                        const videoDuration = isFolder ? sumCat(cat.children, "videoDurationSec") : (leaf?.videoDurationSec ?? 0);
                        const videoTokens = isFolder ? sumCat(cat.children, "videoTokens") : (leaf?.videoTokens ?? 0);
                        const Icon = isFolder ? (isExp ? ChevronDown : ChevronRight) : MessageCircle;
                        const iconColor = isFolder ? "#E87322" : "rgba(74,158,224,0.5)";

                        return (
                          <Fragment key={i}>
                            {/* Parent/Leaf row */}
                            <button onClick={() => {
                              if (isFolder) {
                                const next = new Set(expandedCategories);
                                isExp ? next.delete(cat.name) : next.add(cat.name);
                                setExpandedCategories(next);
                              }
                            }}
                              className={`w-full grid grid-cols-7 gap-2 px-4 py-2.5 text-xs transition-colors hover:bg-white/[0.02] ${isFolder ? "cursor-pointer" : "cursor-default"}`}
                              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: "rgba(255,255,255,0.01)" }}>
                              <span className="col-span-1 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
                                <Icon size={10} style={{ color: iconColor }} />
                                {cat.name}
                              </span>
                              <span className="text-center" style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{totalTokens.toLocaleString()}</span>
                              <MetricCell value={imageCount.toString()} tooltip={`图片生成: ${imageCount} 张`} />
                              <MetricCell value={imageTokens.toLocaleString()} tooltip={`图片消耗: ${imageTokens} 颗`} />
                              <MetricCell value={videoCount.toString()} tooltip={`视频生成: ${videoCount} 个`} />
                              <MetricCell value={formatDuration(videoDuration)} tooltip={`视频时长: ${videoDuration}秒`} />
                              <MetricCell value={videoTokens.toLocaleString()} tooltip={`视频消耗: ${videoTokens} 颗`} />
                            </button>
                            {/* Expanded children */}
                            {isExp && isFolder && (cat as { children: CategoryNode[] }).children.map((child, cIdx) => {
                              const cl = child as CategoryLeaf;
                              return (
                                <div key={cIdx} className="grid grid-cols-7 gap-2 px-4 pl-8 py-2 text-xs"
                                  style={{ background: "rgba(255,255,255,0.015)", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                                  <span className="col-span-1 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.55)", fontSize: "11px" }}>
                                    <MessageCircle size={9} style={{ color: "rgba(74,158,224,0.5)", flexShrink: 0 }} />
                                    {cl.name}
                                  </span>
                                  <span className="text-right" style={{ color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>{cl.totalTokens.toLocaleString()}</span>
                                  <span className="text-right" style={{ color: "rgba(255,255,255,0.5)" }}>{cl.imageCount}</span>
                                  <span className="text-right" style={{ color: "rgba(255,255,255,0.5)" }}>{cl.imageTokens.toLocaleString()}</span>
                                  <span className="text-right" style={{ color: "rgba(255,255,255,0.5)" }}>{cl.videoCount}</span>
                                  <span className="text-right" style={{ color: "rgba(255,255,255,0.5)" }}>{formatDuration(cl.videoDurationSec)}</span>
                                  <span className="text-right" style={{ color: "rgba(255,255,255,0.5)" }}>{cl.videoTokens.toLocaleString()}</span>
                                </div>
                              );
                            })}
                          </Fragment>
                        );
                      })}
                      {/* Totals row */}
                      <div className="grid grid-cols-7 gap-2 px-4 py-2.5 text-xs font-semibold sticky bottom-0"
                        style={{ background: "rgba(30,26,20,0.95)", borderTop: "1px solid rgba(255,255,255,0.08)", color: "#E87322" }}>
                        <span className="col-span-1 flex items-center gap-1.5">
                          <TrendingDown size={10} />
                          总计
                        </span>
                        <span className="text-right font-bold">{sumCat(CATEGORY_CONSUMPTION, "totalTokens").toLocaleString()}</span>
                        <span className="text-right">{sumCat(CATEGORY_CONSUMPTION, "imageCount")}</span>
                        <span className="text-right">{sumCat(CATEGORY_CONSUMPTION, "imageTokens").toLocaleString()}</span>
                        <span className="text-right">{sumCat(CATEGORY_CONSUMPTION, "videoCount")}</span>
                        <span className="text-right">{formatDuration(sumCat(CATEGORY_CONSUMPTION, "videoDurationSec"))}</span>
                        <span className="text-right">{sumCat(CATEGORY_CONSUMPTION, "videoTokens").toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>


                {/* ── Section 2: 成本消耗 ── */}
                <div className="flex flex-col gap-5">

                  {/* Period filter + trend chart */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>消耗趋势</span>
                      </div>
                      <div className="flex gap-0.5 p-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        {PERIOD_LABELS.map(({ key, label }) => (
                          <button key={key} onClick={() => setPeriod(key)}
                            className="px-2 py-1 rounded-md text-xs transition-colors"
                            style={{ background: period === key ? "rgba(232,115,34,0.7)" : "transparent", color: period === key ? "#fff" : "rgba(255,255,255,0.45)" }}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {period === "custom" && (
                      <div className="flex items-center gap-2 mb-3">
                        {["from", "to"].map((k) => (
                          <input key={k} type="date"
                            value={k === "from" ? dateFrom : dateTo}
                            onChange={(e) => k === "from" ? setDateFrom(e.target.value) : setDateTo(e.target.value)}
                            className="flex-1 px-2 py-1 rounded-lg text-xs outline-none"
                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", colorScheme: "dark" }} />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-4" style={{ background: "rgba(232,115,34,0.06)", border: "1px solid rgba(232,115,34,0.12)" }}>
                      <TrendingDown size={12} style={{ color: "#ef4444" }} />
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
                        {projectPerm === "管理" ? "期间消耗" : "我的期间消耗"}
                      </span>
                      <span className="ml-auto" style={{ fontSize: "16px", fontWeight: 600, color: "#E87322" }}>
                        {(projectPerm === "管理" ? periodConsumed : (memberPeriodConsumed[0] ?? 0)).toLocaleString()}
                      </span>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>颗</span>
                    </div>

                    {/* Recharts Trend Chart */}
                    <div className="rounded-lg px-1 pt-2 pb-1" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <div className="flex items-center justify-between px-3 mb-1">
                        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>消耗趋势</span>
                        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>
                          {period === "week" ? "最近7天" : period === "month" ? "最近30天" : period === "year" ? "最近12月" : period === "all" ? "全部时段" : "自定义时段"}
                        </span>
                      </div>
                      <ResponsiveContainer width="100%" height={110}>
                        <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                          <defs>
                            <linearGradient id="trendGradFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#E87322" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#E87322" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                          <XAxis
                            dataKey="date"
                            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }}
                            axisLine={false}
                            tickLine={false}
                            interval="preserveStartEnd"
                          />
                          <YAxis
                            tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)}
                          />
                          <ReTooltip
                            content={<TrendTooltip />}
                            cursor={{ stroke: "rgba(232,115,34,0.3)", strokeWidth: 1, strokeDasharray: "4 3" }}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#E87322"
                            strokeWidth={2}
                            fill="url(#trendGradFill)"
                            dot={false}
                            activeDot={{ r: 4, fill: "#E87322", stroke: "#140F09", strokeWidth: 2 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="flex flex-col gap-5">
                    {/* ── 按成员消耗 ── */}
                    <div>
                      {(() => {
                        const visibleMembers = projectPerm === "管理"
                          ? activeMembersIndexed
                          : activeMembersIndexed.filter(({ i }) => i === 0);
                        const barData = visibleMembers.map(({ m, i }) => ({
                          name: m.name,
                          imageTokens: m.imageTokenUsed,
                          videoTokens: m.videoTokenUsed,
                          total: memberPeriodConsumed[i] ?? 0,
                        }));
                        const totalConsumed = barData.reduce((s, d) => s + d.total, 0);

                        return (
                          <>
                          <div className="flex items-center justify-between mb-3">
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                              {projectPerm === "管理" ? "按成员消耗" : "我的消耗"}
                            </span>
                            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>
                              总计 <span style={{ color: "#E87322", fontWeight: 500 }}>{totalConsumed.toLocaleString()}</span> 颗
                            </span>
                          </div>

                          {/* Bar chart: image vs video per member */}
                          <div className="rounded-lg px-2 pt-2 pb-1 mb-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                            <div className="flex items-center gap-3 px-2 mb-1">
                              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: "#4A9EE0" }} /><span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>图片消耗</span></div>
                              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: "#9B59B6" }} /><span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>视频消耗</span></div>
                            </div>
                            <ResponsiveContainer width="100%" height={180}>
                              <BarChart data={barData} barCategoryGap="15%" margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)} />
                                <ReTooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={({ active, payload }) => {
                                  if (!active || !payload?.length) return null;
                                  const d = payload[0].payload;
                                  return (
                                    <div className="px-3 py-2 rounded-lg shadow-2xl" style={{ background: "#1E1A14", border: "1px solid rgba(232,115,34,0.3)" }}>
                                      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", marginBottom: "4px" }}>{d.name}</p>
                                      <p style={{ fontSize: "11px", color: "#4A9EE0" }}>图片 {d.imageTokens.toLocaleString()} 颗</p>
                                      <p style={{ fontSize: "11px", color: "#9B59B6" }}>视频 {d.videoTokens.toLocaleString()} 颗</p>
                                      <p style={{ fontSize: "11px", color: "#E87322", fontWeight: 600 }}>合计 {d.total.toLocaleString()} 颗</p>
                                    </div>
                                  );
                                }} />
                                <Bar dataKey="imageTokens" fill="#4A9EE0" stackId="tokens" radius={[3, 3, 0, 0]} />
                                <Bar dataKey="videoTokens" fill="#9B59B6" stackId="tokens" radius={[0, 0, 3, 3]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Member list */}
                          <div className="flex flex-col gap-2.5" style={{ maxHeight: "180px", overflowY: "auto" }}>
                            {visibleMembers.map(({ m, i }) => {
                              const val = memberPeriodConsumed[i] ?? 0;
                              const qd = memberQuotas[i] ?? memberQuotas[0];
                              const qLabel = qd.type === "unlimited" ? "♾️" : `固定 ${qd.total.toLocaleString()}`;
                              return (
                                <div key={i} className="flex items-center justify-between py-1.5">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0"
                                      style={{ background: MEMBER_COLORS[i % MEMBER_COLORS.length], fontSize: "9px", fontWeight: 600 }}>
                                      {m.avatar}
                                    </div>
                                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)" }}>{m.name}</span>
                                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>{qLabel}</span>
                                  </div>
                                  <span style={{ fontSize: "12px", color: "#E87322", fontWeight: 500 }}>
                                    {val.toLocaleString()} 颗
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* ── 按分类消耗图表 ── */}
                    <div>
                      {(() => {
                        const categoryBarData: Array<{ name: string; imageTokens: number; videoTokens: number; total: number; isFolder: boolean }> = CATEGORY_CONSUMPTION.map(cat => {
                          const isFolder = "type" in cat;
                          const imageTokens = isFolder ? sumCat(cat.children, "imageTokens") : (cat as CategoryLeaf).imageTokens;
                          const videoTokens = isFolder ? sumCat(cat.children, "videoTokens") : (cat as CategoryLeaf).videoTokens;
                          return { name: cat.name, imageTokens, videoTokens, total: imageTokens + videoTokens, isFolder };
                        });
                        const catTotal = categoryBarData.reduce((s, d) => s + d.total, 0);

                        return (
                          <>
                          <div className="flex items-center justify-between mb-3">
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>按分类消耗</span>
                            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>
                              总计 <span style={{ color: "#E87322", fontWeight: 500 }}>{catTotal.toLocaleString()}</span> 颗
                            </span>
                          </div>

                          {/* Bar chart: image vs video per category */}
                          <div className="rounded-lg px-2 pt-2 pb-1 mb-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                            <div className="flex items-center gap-3 px-2 mb-1">
                              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: "#4A9EE0" }} /><span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>图片消耗</span></div>
                              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: "#9B59B6" }} /><span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>视频消耗</span></div>
                            </div>
                            <ResponsiveContainer width="100%" height={180}>
                              <BarChart data={categoryBarData} barCategoryGap="15%" margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                                <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)} />
                                <ReTooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={({ active, payload }) => {
                                  if (!active || !payload?.length) return null;
                                  const d = payload[0].payload;
                                  return (
                                    <div className="px-3 py-2 rounded-lg shadow-2xl" style={{ background: "#1E1A14", border: "1px solid rgba(232,115,34,0.3)" }}>
                                      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", marginBottom: "4px" }}>{d.name}</p>
                                      <p style={{ fontSize: "11px", color: "#4A9EE0" }}>图片 {d.imageTokens.toLocaleString()} 颗</p>
                                      <p style={{ fontSize: "11px", color: "#9B59B6" }}>视频 {d.videoTokens.toLocaleString()} 颗</p>
                                      <p style={{ fontSize: "11px", color: "#E87322", fontWeight: 600 }}>合计 {d.total.toLocaleString()} 颗</p>
                                    </div>
                                  );
                                }} />
                                <Bar dataKey="imageTokens" fill="#4A9EE0" stackId="tokens" radius={[3, 3, 0, 0]} />
                                <Bar dataKey="videoTokens" fill="#9B59B6" stackId="tokens" radius={[0, 0, 3, 3]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Category list */}
                          <div className="flex flex-col gap-1.5">
                            {CATEGORY_CONSUMPTION.map((cat, i) => {
                              const isFolder = "type" in cat;
                              const imageTokens = isFolder ? sumCat(cat.children, "imageTokens") : (cat as CategoryLeaf).imageTokens;
                              const videoTokens = isFolder ? sumCat(cat.children, "videoTokens") : (cat as CategoryLeaf).videoTokens;
                              const total = imageTokens + videoTokens;
                              const pct = catTotal > 0 ? Math.round((total / catTotal) * 100) : 0;
                              return (
                                <div key={i} className="flex items-center justify-between py-1">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: isFolder ? "#E87322" : "#4A9EE0" }} />
                                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)" }}>{cat.name}</span>
                                    <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>{pct}%</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span style={{ fontSize: "10px", color: "#4A9EE0" }}>{imageTokens}</span>
                                    <span style={{ fontSize: "10px", color: "#9B59B6" }}>{videoTokens}</span>
                                    <span style={{ fontSize: "12px", color: "#E87322", fontWeight: 500, minWidth: "55px", textAlign: "right" }}>
                                      {total.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          </>
                        );
                      })()}
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* ── 分镜进度 Tab ── */}
            {activeTab === "progress" && (
              <div className="flex flex-col gap-2">
                {/* Summary bar */}
                <div className="flex items-center gap-4 px-4 py-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: "#4AC678" }} />
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>
                      已完成 <span style={{ color: "#4AC678", fontWeight: 600 }}>{project.episodeStats.filter(ep => ep.progress === 100).length}</span>
                    </span>
                  </div>
                  <div className="w-px h-3" style={{ background: "rgba(255,255,255,0.1)" }} />
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: "#E87322" }} />
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>
                      进行中 <span style={{ color: "#E87322", fontWeight: 600 }}>{project.episodeStats.filter(ep => ep.progress > 0 && ep.progress < 100).length}</span>
                    </span>
                  </div>
                  <div className="w-px h-3" style={{ background: "rgba(255,255,255,0.1)" }} />
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>
                      未开始 <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>{project.episodeStats.filter(ep => ep.progress === 0).length}</span>
                    </span>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <button onClick={() => setExpandedEpisodes(new Set(project.episodeStats.map((_, i) => i)))}
                      className="px-2 py-0.5 rounded text-xs hover:opacity-80"
                      style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}>全部展开</button>
                    <button onClick={() => setExpandedEpisodes(new Set())}
                      className="px-2 py-0.5 rounded text-xs hover:opacity-80"
                      style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px" }}>全部收起</button>
                  </div>
                </div>

                {/* Episode list */}
                {project.episodeStats.map((ep, idx) => {
                  const stages = deriveStages(ep.progress);
                  const isExpanded = expandedEpisodes.has(idx);
                  const statusColor = ep.progress === 100 ? "#4AC678" : ep.progress > 0 ? "#E87322" : "rgba(255,255,255,0.2)";
                  const StatusIcon = ep.progress === 100 ? CheckCircle2 : ep.progress > 0 ? Loader2 : Circle;

                  return (
                    <div key={idx} className="rounded-lg overflow-hidden transition-all"
                      style={{ background: isExpanded ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.02)", border: `1px solid ${isExpanded ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.04)"}` }}>
                      {/* Header row — always visible */}
                      <button onClick={() => {
                        setExpandedEpisodes(prev => {
                          const next = new Set(prev);
                          next.has(idx) ? next.delete(idx) : next.add(idx);
                          return next;
                        });
                      }} className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.01] transition-colors">
                        <div className="flex items-center gap-3">
                          <StatusIcon size={14} style={{ color: statusColor }} />
                          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{ep.name}</span>
                          {/* Mini stage pills */}
                          <div className="flex items-center gap-1.5">
                            {stages.map(s => (
                              <span key={s.label} className="flex items-center gap-1 px-1.5 py-0.5 rounded"
                                style={{
                                  background: s.progress === 100 ? "rgba(74,198,120,0.1)" : s.progress > 0 ? "rgba(232,115,34,0.08)" : "rgba(255,255,255,0.03)",
                                  fontSize: "9px",
                                  color: s.progress === 100 ? "#4AC678" : s.progress > 0 ? "#E87322" : "rgba(255,255,255,0.2)",
                                }}>
                                {s.label} {s.progress}%
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Overall mini bar */}
                          <div className="w-20 rounded-full overflow-hidden" style={{ height: "4px", background: "rgba(255,255,255,0.06)" }}>
                            <div className="h-full rounded-full" style={{ width: `${ep.progress}%`, background: statusColor, transition: "width 0.5s" }} />
                          </div>
                          <span style={{ fontSize: "13px", fontWeight: 600, color: statusColor, width: "32px", textAlign: "right" }}>
                            {ep.progress}%
                          </span>
                          {isExpanded
                            ? <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.25)" }} />
                            : <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.25)" }} />}
                        </div>
                      </button>

                      {/* Expanded stage details */}
                      {isExpanded && (
                        <div className="px-5 pb-3 pt-0 flex flex-col gap-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                          {stages.map((stage) => {
                            const StageIcon = stage.label === "草分绘制" ? Edit2 : stage.label === "静帧生成" ? LucideImage : Zap;
                            return (
                              <div key={stage.label} className="flex items-center gap-3">
                                <StageIcon size={12} style={{ color: stage.progress === 100 ? "#4AC678" : "rgba(255,255,255,0.25)", flexShrink: 0 }} />
                                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", width: "56px", flexShrink: 0 }}>{stage.label}</span>
                                <div className="flex-1 rounded-full overflow-hidden" style={{ height: "6px", background: "rgba(255,255,255,0.06)" }}>
                                  <div className="h-full rounded-full"
                                    style={{
                                      width: `${stage.progress}%`,
                                      background: stage.progress === 100 ? "#4AC678" : stage.progress > 0 ? "linear-gradient(90deg,#E87322,#F5A623)" : "rgba(255,255,255,0.04)",
                                      transition: "width 0.5s",
                                    }} />
                                </div>
                                <span style={{ fontSize: "11px", fontWeight: 600, color: stage.progress === 100 ? "#4AC678" : stage.progress > 0 ? "#E87322" : "rgba(255,255,255,0.2)", width: "32px", textAlign: "right" }}>
                                  {stage.progress}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── 生成预警 Tab ── */}
                   {/* ── 生成预警 Tab ── */}
            {activeTab === "warnings" && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-4 py-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={13} style={{ color: "#ff6b6b" }} />
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>
                      共 <span style={{ color: "#ff6b6b", fontWeight: 600 }}>{DUPLICATE_PROMPTS.length}</span> 组重复 Prompt
                    </span>
                  </div>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>
                    预估浪费 <span style={{ color: "#E87322", fontWeight: 600 }}>{DUPLICATE_PROMPTS.reduce((s, i) => s + (i.count - 1) * 50, 0).toLocaleString()}</span> 颗
                  </span>
                </div>

                {DUPLICATE_PROMPTS.map((item, idx) => {
                  const isHigh = item.similarity > 90;
                  return (
                    <div key={idx} className="flex items-center gap-3 px-4 py-3 rounded-lg"
                      style={{
                        background: isHigh ? "rgba(255,100,100,0.04)" : "rgba(255,255,255,0.02)",
                        border: `1px solid ${isHigh ? "rgba(255,100,100,0.15)" : "rgba(255,255,255,0.04)"}`,
                      }}>
                      {/* Similarity badge */}
                      <div className="flex flex-col items-center justify-center flex-shrink-0 w-12" style={{ gap: "2px" }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: isHigh ? "rgba(255,100,100,0.12)" : "rgba(232,115,34,0.1)" }}>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: isHigh ? "#ff6b6b" : "#E87322" }}>
                            {item.similarity}%
                          </span>
                        </div>
                        <span style={{ fontSize: "9px", color: isHigh ? "#ff6b6b" : "#E87322", fontWeight: 500 }}>
                          {isHigh ? "高危" : "注意"}
                        </span>
                      </div>

                      {/* Prompt + person + episode */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>{item.prompt}</p>
                        <div className="flex items-center gap-2 flex-wrap mt-1.5">
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                              style={{ background: MEMBER_COLORS[idx % MEMBER_COLORS.length], fontSize: "8px", fontWeight: 600 }}>
                              {item.person.charAt(0)}
                            </div>
                            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>{item.person}</span>
                          </div>
                          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.15)" }}>·</span>
                          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)" }}>
                            {item.episode} · {item.shots.join("、")}
                          </span>
                        </div>
                      </div>

                      {/* Right side: count + waste */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>出现</span>
                          <span style={{ fontSize: "16px", fontWeight: 700, color: isHigh ? "#ff6b6b" : "#E87322" }}>
                            {item.count}
                          </span>
                          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>次</span>
                        </div>
                        <span
                          className="px-2 py-0.5 rounded text-xs"
                          style={{ background: "rgba(232,115,34,0.1)", color: "#E87322", fontWeight: 500, fontSize: "11px" }}
                        >
                          浪费 ~{(item.count - 1) * 50} 颗
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
           
          </div>
        </div>

      </div>

      {/* ── Member Management Modal ── */}
      {showMemberModal && (
        <EditProjectMembersDialog
          projectName={projectName}
          initialMembers={dialogMembers}
          onClose={() => setShowMemberModal(false)}
          onSave={() => { toast.success("项目成员已更新"); }}
        />
      )}

      {/* ── Allocate Member Token Dialog ── */}
      {showAllocateDialog && (
        <AllocateMemberTokenDialog
          projectName={projectName}
          members={activeMembers.map((m, i) => ({
            id: String(i + 1),
            name: m.name,
            avatar: m.avatar,
            avatarColor: MEMBER_COLORS[i % MEMBER_COLORS.length],
            role: m.role,
            currentBalance: memberTotalBalance / activeMembers.length,
          }))}
          projectBalance={projectBalance}
          onClose={() => setShowAllocateDialog(false)}
          onAllocate={() => { toast.success("批量分配已完成"); }}
        />
      )}

      {/* ── Member Quota Editor Modal (totals row) ── */}
      {quotaEditorEntry && (
        <MemberQuotaEditorModal
          member={{ name: quotaEditorEntry.m.name, avatar: quotaEditorEntry.m.avatar, avatarColor: MEMBER_COLORS[quotaEditorEntry.i % MEMBER_COLORS.length] }}
          quota={memberQuotas[quotaEditorEntry.i] ?? INITIAL_MEMBER_QUOTAS[0]}
          memberTokenUsed={quotaEditorEntry.m.tokenUsed}
          onClose={() => setQuotaEditorIndex(null)}
          onSave={(q) => {
            const idx = quotaEditorEntry.i;
            setMemberQuotas(prev => {
              const next = [...prev];
              next[idx] = q;
              return next;
            });
          }}
        />
      )}

      {/* ── Member Quota Editor (individual member) ── */}
      {editQuotaEntry && (
        <MemberQuotaEditor
          member={{ name: editQuotaEntry.m.name, avatar: editQuotaEntry.m.avatar, avatarColor: MEMBER_COLORS[editQuotaEntry.i % MEMBER_COLORS.length], role: editQuotaEntry.m.role }}
          currentQuota={memberQuotas[editQuotaEntry.i]}
          currentConsumed={memberPeriodConsumed[editQuotaEntry.i] ?? 0}
          onSave={(q) => handleMemberQuotaSave(editQuotaEntry.i, q)}
          onCancel={() => setEditQuotaIndex(null)}
        />
      )}

      {/* ── Remove Member Confirm ── */}
      {removeConfirmEntry && (
        <RemoveMemberConfirm
          member={{ name: removeConfirmEntry.m.name, avatar: removeConfirmEntry.m.avatar, avatarColor: MEMBER_COLORS[removeConfirmEntry.i % MEMBER_COLORS.length], role: removeConfirmEntry.m.role }}
          onClose={() => setRemoveConfirmIndex(null)}
          onConfirm={() => handleRemoveMember(removeConfirmEntry.i)}
        />
      )}

    </div>
  );
}
