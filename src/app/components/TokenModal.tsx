//生产栗明细弹窗
import { useState } from "react";
import { X, ChevronRight } from "lucide-react";
import { PROJECTS_DATA } from "../data/projectsData";

type TxTab = "all" | "distribute" | "consume" | "gain";

export interface TokenModalProps {
  onClose: () => void;
  mode?: "total" | "project";
  projectName?: string;
  projectAlloc?: number;   // current project tokenTotal
  projectUsed?: number;    // current project tokenUsed
}

// ─── Constants ────────────────────────────────────────────────────────────────
export const ENTERPRISE_ALLOC = 5000;
export const GIFT_TOKENS = 517;
export const PETRSON_TOKENS = ENTERPRISE_ALLOC + GIFT_TOKENS;
export const ALL_PROJECT_ALLOC = PROJECTS_DATA.reduce((s, p) => s + p.tokenTotal, 0);
export const TOTAL_TOKENS = ENTERPRISE_ALLOC + ALL_PROJECT_ALLOC + GIFT_TOKENS;

// ─── Transaction data ─────────────────────────────────────────────────────────
const ALL_TX = [
  { id: "d1", type: "gain" as const, txType: "distribute" as const, desc: "企业分配（2026年4月）", amount: ENTERPRISE_ALLOC, date: "2026-04-01 00:00" },
  { id: "d2", type: "gain" as const, txType: "distribute" as const, desc: "项目分配 · 东方神话·第一季", amount: 50000, date: "2026-04-01 00:00" },
  { id: "d3", type: "gain" as const, txType: "distribute" as const, desc: "项目分配 · 星际征途", amount: 40000, date: "2026-04-01 00:00" },
  { id: "d4", type: "gain" as const, txType: "distribute" as const, desc: "项目分配 · 山海奇谭", amount: 20000, date: "2026-04-01 00:00" },
  { id: "d5", type: "gain" as const, txType: "distribute" as const, desc: "项目分配 · 动画短片集", amount: 30000, date: "2026-04-01 00:00" },
  { id: "d6", type: "gain" as const, txType: "distribute" as const, desc: "项目分配 · 龙族传说", amount: 60000, date: "2026-04-01 00:00" },
  { id: "t1", type: "consume" as const, txType: "normal" as const, desc: "自动赠送积分（2026-04-06）过期", amount: -66, date: "2026-04-07 00:02" },
  { id: "t2", type: "gain" as const, txType: "normal" as const, desc: "自动赠送", amount: 66, date: "2026-04-07 00:00" },
  { id: "t3", type: "gain" as const, txType: "normal" as const, desc: "自动赠送", amount: 66, date: "2026-04-06 00:00" },
  { id: "t4", type: "consume" as const, txType: "normal" as const, desc: "自动赠送积分（2026-04-03）过期", amount: -66, date: "2026-04-04 00:02" },
  { id: "t5", type: "gain" as const, txType: "normal" as const, desc: "自动赠送", amount: 66, date: "2026-04-04 00:00" },
  { id: "t6", type: "consume" as const, txType: "normal" as const, desc: "图片生成消耗 · 人物设定", amount: -50, date: "2026-04-03 16:45" },
  { id: "t7", type: "consume" as const, txType: "normal" as const, desc: "视频生成消耗 · 分镜渲染", amount: -180, date: "2026-04-03 14:20" },
  { id: "t8", type: "consume" as const, txType: "normal" as const, desc: "图片生成消耗 · 场景背景", amount: -120, date: "2026-04-02 11:00" },
];

function fmt(n: number) {
  return n.toLocaleString("zh-CN");
}

// ─── Formula card ─────────────────────────────────────────────────────────────
function FormulaCard({
  title,
  total,
  items,
  highlight,
}: {
  title: string;
  total: number;
  items: { label: string; value: number }[];
  highlight?: boolean;
}) {
  return (
    <div
      className="flex-1 rounded-xl p-4"
      style={{
        background: highlight ? "rgba(232,115,34,0.08)" : "rgba(255,255,255,0.04)",
        border: highlight ? "1px solid rgba(232,115,34,0.2)" : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>{title}</span>
        {highlight && (
          <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: "rgba(232,115,34,0.15)", color: "#E87322", fontSize: "9px" }}>
            当前
          </span>
        )}
      </div>
      <div className="mb-3">
        <span style={{ fontSize: "26px", fontWeight: 800, color: "#E87322", lineHeight: 1 }}>
          {fmt(total)}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1">
            {i > 0 && <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", width: "10px", flexShrink: 0 }}>+</span>}
            {i === 0 && <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", width: "10px", flexShrink: 0 }}>=</span>}
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", flex: 1 }}>{item.label}</span>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{fmt(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function TokenModal({
  onClose,
  mode = "total",
  projectName,
  projectAlloc = 50000,
  projectUsed = 0,
}: TokenModalProps) {
  const [activeTab, setActiveTab] = useState<TxTab>("all");

  const currentAvailable = ENTERPRISE_ALLOC + projectAlloc + GIFT_TOKENS - projectUsed;

  const filteredTx = ALL_TX.filter((tx) => {
    if (activeTab === "distribute") return tx.txType === "distribute";
    if (activeTab === "consume") return tx.type === "consume";
    if (activeTab === "gain") return tx.type === "gain" && tx.txType !== "distribute";
    return true;
  });

  const tabs: { key: TxTab; label: string }[] = [
    { key: "all", label: "全部" },
   // { key: "distribute", label: "分配" },
    { key: "consume", label: "消耗" },
    { key: "gain", label: "获得" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: "#1A1510",
          border: "1px solid rgba(255,255,255,0.1)",
          width: "720px",
          maxHeight: "85vh",
          boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0">
          <div>
            <h2 className="text-white" style={{ fontSize: "18px", fontWeight: 700 }}>生产栗详情</h2>
            {projectName && (
              <p className="mt-0.5" style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
                当前项目：{projectName}
              </p>
            )}
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10">
            <X size={15} style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>

        {/* formula cards */}
        <div className="flex gap-3 px-6 pb-4 flex-shrink-0">
         <FormulaCard
            title="当前可用生产栗"
            total={mode === "project" ? currentAvailable : TOTAL_TOKENS - (PROJECTS_DATA.reduce((s, p) => s + p.tokenUsed, 0))}
            items={[
              { label: "企业生产栗", value: ENTERPRISE_ALLOC },
              { label: mode === "project" ? `项目生产栗（${projectName ?? "当前项目名称"}）` : "当前项目名称", value: mode === "project" ? projectAlloc : Math.round(ALL_PROJECT_ALLOC / PROJECTS_DATA.length) },
            //  { label: "赠送生产栗", value: GIFT_TOKENS },    

            ]}
            highlight={mode === "project"}
          />
          <FormulaCard
            title="总生产栗余额"
            total={TOTAL_TOKENS}
            items={[
              { label: "企业生产栗", value: ENTERPRISE_ALLOC },
              { label: "项目A生产栗", value: ALL_PROJECT_ALLOC  },
              { label: "项目B生产栗", value: GIFT_TOKENS },
            ]}
          />
          

        </div>

        {/* Tabs */}
        <div
          className="flex items-center gap-5 px-6 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="py-3 text-sm transition-colors"
              style={{
                color: activeTab === tab.key ? "#E87322" : "rgba(255,255,255,0.45)",
                borderBottom: activeTab === tab.key ? "2px solid #E87322" : "2px solid transparent",
                marginBottom: "-1px",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transaction list */}
        <div className="flex-1 overflow-auto">
          {filteredTx.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
              暂无记录
            </div>
          ) : (
            filteredTx.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between px-6 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: tx.txType === "distribute"
                        ? "rgba(74,198,120,0.12)"
                        : tx.type === "consume"
                          ? "rgba(255,100,100,0.1)"
                          : "rgba(232,115,34,0.1)",
                    }}
                  >
                    <span style={{ fontSize: "14px" }}>
                      {tx.txType === "distribute" ? "📋" : tx.type === "consume" ? "🔥" : "🌰"}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>{tx.desc}</div>
                    <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>{tx.date}</div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "15px",
                    fontWeight: 600,
                    color: tx.amount > 0 ? "#4AC678" : "rgba(255,120,120,0.8)",
                    flexShrink: 0,
                    marginLeft: "16px",
                  }}
                >
                  {tx.amount > 0 ? `+${fmt(tx.amount)}` : fmt(tx.amount)}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-1.5 px-6 py-3 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.28)" }}>
            ⓘ 图片与视频的生成由于生成数量、模式等参数不同费用会有差异，
          </span>
          <button style={{ fontSize: "11px", color: "#E87322" }}>查看生产栗规则</button>
        </div>
      </div>
    </div>
  );
}
