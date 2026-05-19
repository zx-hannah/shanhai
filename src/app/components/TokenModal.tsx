import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { PROJECTS_DATA } from "../data/projectsData";

type TotalTxTab = "all" | "consume" | "gain";
type ProjectTxTab = "consume";

export interface TokenModalProps {
  onClose: () => void;
  mode?: "total" | "project";
  projectId?: string;
  projectName?: string;
  projectAlloc?: number;
  projectUsed?: number;
}

export const PERSONAL_TOKEN_BALANCE = 517;

const PERSONAL_TX_LIST: Array<{
  id: string;
  desc: string;
  amount: number;
  date: string;
  type: "consume" | "gain";
}> = [
  { id: "t-1", desc: "图片生成消耗 · 角色表情包", amount: -62, date: "2026-05-17 20:18", type: "consume" },
  { id: "t-2", desc: "工具使用消耗 · 智能抠图", amount: -18, date: "2026-05-17 17:42", type: "consume" },
  { id: "t-3", desc: "运营发放 · 月度补充", amount: 300, date: "2026-05-16 10:00", type: "gain" },
  { id: "t-4", desc: "图片生成消耗 · 海报草稿", amount: -41, date: "2026-05-15 15:26", type: "consume" },
  { id: "t-5", desc: "系统返还 · 任务取消", amount: 24, date: "2026-05-15 12:08", type: "gain" },
  { id: "t-6", desc: "工具使用消耗 · 高清修复", amount: -12, date: "2026-05-14 21:03", type: "consume" },
];

const PROJECT_CONSUME_MAP: Record<string, Array<{ id: string; desc: string; amount: number; date: string }>> = {
  "1": [
    { id: "p1-1", desc: "图片生成消耗 · 人物设定", amount: -4200, date: "2026-04-16 18:20" },
    { id: "p1-2", desc: "视频生成消耗 · 第五集分镜", amount: -3100, date: "2026-04-15 15:40" },
    { id: "p1-3", desc: "图片生成消耗 · 场景背景", amount: -2600, date: "2026-04-14 11:30" },
    { id: "p1-4", desc: "视频生成消耗 · 第四集动作镜头", amount: -1800, date: "2026-04-12 20:10" },
    { id: "p1-5", desc: "图片生成消耗 · 道具细化", amount: -800, date: "2026-04-11 09:20" },
  ],
  "2": [
    { id: "p2-1", desc: "图片生成消耗 · 星际角色设定", amount: -2800, date: "2026-04-16 17:50" },
    { id: "p2-2", desc: "视频生成消耗 · 第一集分镜渲染", amount: -2200, date: "2026-04-15 14:15" },
    { id: "p2-3", desc: "图片生成消耗 · 舰桥场景", amount: -1600, date: "2026-04-14 10:40" },
    { id: "p2-4", desc: "视频生成消耗 · 第二集转场", amount: -900, date: "2026-04-13 18:05" },
    { id: "p2-5", desc: "图片生成消耗 · 道具贴图", amount: -300, date: "2026-04-12 09:00" },
  ],
  "3": [
    { id: "p3-1", desc: "图片生成消耗 · 神兽角色定稿", amount: -5200, date: "2026-03-29 18:35" },
    { id: "p3-2", desc: "视频生成消耗 · 完结篇镜头", amount: -4800, date: "2026-03-26 13:10" },
    { id: "p3-3", desc: "图片生成消耗 · 章节海报", amount: -4100, date: "2026-03-22 17:00" },
    { id: "p3-4", desc: "视频生成消耗 · 第二集特效", amount: -3900, date: "2026-03-18 20:30" },
  ],
  "4": [
    { id: "p4-1", desc: "图片生成消耗 · 短片01角色图", amount: -1800, date: "2026-04-08 15:20" },
    { id: "p4-2", desc: "视频生成消耗 · 短片02预演", amount: -900, date: "2026-04-06 11:45" },
    { id: "p4-3", desc: "图片生成消耗 · 短片03分镜参考", amount: -580, date: "2026-04-05 17:30" },
    { id: "p4-4", desc: "视频生成消耗 · 短片04片段", amount: -280, date: "2026-04-03 13:05" },
  ],
  "5": [
    { id: "p5-1", desc: "图片生成消耗 · 龙族角色设定", amount: -2100, date: "2026-04-16 16:10" },
    { id: "p5-2", desc: "视频生成消耗 · 第二集战斗镜头", amount: -1600, date: "2026-04-15 10:50" },
    { id: "p5-3", desc: "图片生成消耗 · 山海场景背景", amount: -1200, date: "2026-04-13 19:40" },
    { id: "p5-4", desc: "视频生成消耗 · 第三集测试片段", amount: -700, date: "2026-04-11 14:00" },
  ],
};

function fmt(n: number) {
  return n.toLocaleString("zh-CN");
}

function FormulaCard({
  title,
  total,
  items,
  highlight,
  note,
  hideTotalValue,
  hideItemValues,
  hideItems,
}: {
  title: string;
  total: number;
  items: { label: string; value: number }[];
  highlight?: boolean;
  note?: string;
  hideTotalValue?: boolean;
  hideItemValues?: boolean;
  hideItems?: boolean;
}) {
  return (
    <div
      className="flex-1 rounded-xl p-4"
      style={{
        background: highlight ? "rgba(232,115,34,0.08)" : "rgba(255,255,255,0.04)",
        border: highlight ? "1px solid rgba(232,115,34,0.2)" : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="mb-2">
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>{title}</span>
          {highlight && (
            <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: "rgba(232,115,34,0.15)", color: "#E87322", fontSize: "9px" }}>
              当前
            </span>
          )}
        </div>
        {note && (
          <p className="mt-1.5" style={{ fontSize: "11px", color: "rgba(255,255,255,0.34)", lineHeight: 1.55 }}>
            {note}
          </p>
        )}
      </div>
      {!hideTotalValue && (
        <div className="mb-3">
          <span style={{ fontSize: "26px", fontWeight: 800, color: "#E87322", lineHeight: 1 }}>
            {fmt(total)}
          </span>
        </div>
      )}
      {!hideItems && (
        <div className="flex flex-col gap-1">
          {items.map((item, i) => (
            <div key={item.label} className="flex items-center gap-2">
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", width: "12px", flexShrink: 0 }}>
                {i === 0 ? "=" : "-"}
              </span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", flex: 1 }}>{item.label}</span>
              {!hideItemValues && (
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.68)", fontWeight: 500 }}>{fmt(item.value)}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TokenModal({
  onClose,
  mode = "total",
  projectId,
  projectName,
  projectAlloc = 0,
  projectUsed = 0,
}: TokenModalProps) {
  const [activeTab, setActiveTab] = useState<TotalTxTab | ProjectTxTab>(mode === "project" ? "consume" : "all");

  const projectAvailable = Math.max(projectAlloc - projectUsed, 0);
  const currentProjectTx = useMemo(() => {
    if (!projectId) return [];
    return PROJECT_CONSUME_MAP[projectId] ?? [];
  }, [projectId]);

  const totalTxList = useMemo(() => {
    if (activeTab === "consume") return PERSONAL_TX_LIST.filter((tx) => tx.type === "consume");
    if (activeTab === "gain") return PERSONAL_TX_LIST.filter((tx) => tx.type === "gain");
    return PERSONAL_TX_LIST;
  }, [activeTab]);

  const totalTabs: { key: TotalTxTab; label: string }[] = [
    { key: "all", label: "全部" },
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
        <div className="flex items-center justify-between px-6 pt-5 pb-4 flex-shrink-0">
          <div>
            <h2 className="text-white" style={{ fontSize: "18px", fontWeight: 700 }}>生产栗详情</h2>
            <p className="mt-0.5" style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
              {mode === "project" ? `当前项目：${projectName ?? "未命名项目"}` : "当前展示个人生产栗余额与项目额度说明"}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10">
            <X size={15} style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>

        <div className="flex gap-3 px-6 pb-4 flex-shrink-0">
          {mode === "project" ? (
            <>
              <FormulaCard
                title="个人生产栗余额"
                total={PERSONAL_TOKEN_BALANCE}
                items={[
                  { label: "个人账户可用余额", value: PERSONAL_TOKEN_BALANCE },
                ]}
                note="个人生产栗用于项目外的个人生成、工具使用等场景，不跟随单个项目额度变化。"
                hideItems
              />
              <FormulaCard
                title="项目额度"
                total={projectAvailable}
                items={[
                  { label: `项目额度（${projectName ?? "当前项目"}）`, value: projectAlloc },
                  { label: "已消耗", value: -projectUsed },
                ].map((item) => ({ ...item, value: Math.abs(item.value) }))}
                highlight
                note="该生产栗用于项目内的生成，需要进入项目内查看当前项目的剩余可用额度与消耗情况。"
              />
            </>
          ) : (
            <>
              <FormulaCard
                title="个人生产栗余额"
                total={PERSONAL_TOKEN_BALANCE}
                items={[
                  { label: "个人账户可用余额", value: PERSONAL_TOKEN_BALANCE },
                ]}
                highlight
                note="个人生产栗用于项目外的个人生成、工具使用等场景，不跟随单个项目额度变化。"
                hideItems
              />
              <FormulaCard
                title="项目额度"
                total={0}
                items={[
                  { label: "项目内生成使用", value: 0 },
                ]}
                note="该生产栗用于项目内的生成。由于不同项目额度独立且数值不同，此处不展示具体额度，请进入对应项目内查看。"
                hideTotalValue
                hideItems
              />
            </>
          )}
        </div>

        <div
          className="flex items-center gap-5 px-6 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          {(mode === "project" ? [{ key: "consume" as const, label: "消耗" }] : totalTabs).map((tab) => (
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

        <div className="flex-1 overflow-auto">
          {mode === "project" ? (
            <div className="px-6 py-5">
              {currentProjectTx.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
                  暂无项目消耗记录
                </div>
              ) : (
                currentProjectTx.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-3"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(255,100,100,0.1)" }}
                      >
                        <span style={{ fontSize: "14px" }}>🔥</span>
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
                        color: "rgba(255,120,120,0.8)",
                        flexShrink: 0,
                        marginLeft: "16px",
                      }}
                    >
                      {fmt(tx.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="px-6 py-5">
              {totalTxList.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
                  暂无记录
                </div>
              ) : (
                totalTxList.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between py-3"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: tx.amount > 0 ? "rgba(78,205,132,0.12)" : "rgba(255,100,100,0.1)" }}
                      >
                        <span style={{ fontSize: "14px" }}>{tx.amount > 0 ? "↘" : "🔥"}</span>
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
                        color: tx.amount > 0 ? "rgba(90,214,152,0.92)" : "rgba(255,120,120,0.8)",
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
          )}
        </div>

        <div
          className="flex items-center gap-1.5 px-6 py-3 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.28)" }}>
            ⓘ 项目外展示个人生产栗余额、说明与全部/消耗/获得记录，项目内仅展示当前项目剩余可用额度与消耗明细。
          </span>
        </div>
      </div>
    </div>
  );
}
