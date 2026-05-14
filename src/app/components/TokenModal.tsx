import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { PROJECTS_DATA } from "../data/projectsData";

type TotalTxTab = "personal" | "projects";
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
          <div key={item.label} className="flex items-center gap-2">
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", width: "12px", flexShrink: 0 }}>
              {i === 0 ? "=" : "+"}
            </span>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", flex: 1 }}>{item.label}</span>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.68)", fontWeight: 500 }}>{fmt(item.value)}</span>
          </div>
        ))}
      </div>
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
  const [activeTab, setActiveTab] = useState<TotalTxTab | ProjectTxTab>(mode === "project" ? "consume" : "personal");

  const projectAvailable = Math.max(projectAlloc - projectUsed, 0);
  const currentProjectTx = useMemo(() => {
    if (!projectId) return [];
    return PROJECT_CONSUME_MAP[projectId] ?? [];
  }, [projectId]);

  const totalTabs: { key: TotalTxTab; label: string }[] = [
    { key: "personal", label: "个人生产栗" },
    { key: "projects", label: "项目额度" },
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
              {mode === "project" ? `当前项目：${projectName ?? "未命名项目"}` : "当前展示个人生产栗余额与各项目额度"}
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
                title="当前项目可用额度"
                total={projectAvailable}
                items={[
                  { label: `项目额度（${projectName ?? "当前项目"}）`, value: projectAlloc },
                  { label: "已消耗", value: -projectUsed },
                ].map((item) => ({ ...item, value: Math.abs(item.value) }))}
                highlight
              />
              <FormulaCard
                title="项目消耗概览"
                total={projectUsed}
                items={[
                  { label: "图片与视频累计消耗", value: projectUsed },
                  { label: "当前剩余额度", value: projectAvailable },
                ]}
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
              />
              <FormulaCard
                title="项目额度总览"
                total={PROJECTS_DATA.reduce((sum, project) => sum + Math.max(project.tokenTotal - project.tokenUsed, 0), 0)}
                items={PROJECTS_DATA.slice(0, 4).map((project) => ({
                  label: project.name,
                  value: Math.max(project.tokenTotal - project.tokenUsed, 0),
                }))}
              />
            </>
          )}
        </div>

        {mode === "total" && (
          <div
            className="flex items-center gap-5 px-6 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            {totalTabs.map((tab) => (
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
        )}

        <div className="flex-1 overflow-auto">
          {mode === "project" ? (
            currentProjectTx.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-sm" style={{ color: "rgba(255,255,255,0.25)" }}>
                暂无项目消耗记录
              </div>
            ) : (
              currentProjectTx.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between px-6 py-3"
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
            )
          ) : activeTab === "personal" ? (
            <div className="px-6 py-5">
              <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.68)", fontWeight: 600 }}>个人生产栗余额</span>
                  <span style={{ fontSize: "22px", color: "#E87322", fontWeight: 800 }}>{fmt(PERSONAL_TOKEN_BALANCE)}</span>
                </div>
                <p className="mt-2" style={{ fontSize: "12px", color: "rgba(255,255,255,0.38)", lineHeight: 1.7 }}>
                  个人生产栗用于项目外的个人生成、工具使用等场景，不跟随单个项目额度变化。
                </p>
              </div>
            </div>
          ) : (
            PROJECTS_DATA.map((project) => {
              const remain = Math.max(project.tokenTotal - project.tokenUsed, 0);
              const pct = project.tokenTotal > 0 ? Math.round((project.tokenUsed / project.tokenTotal) * 100) : 0;
              return (
                <div
                  key={project.id}
                  className="px-6 py-4"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.82)", fontWeight: 600 }}>{project.name}</div>
                      <div className="mt-1 flex items-center gap-3" style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>
                        <span>项目额度 {fmt(project.tokenTotal)}</span>
                        <span>已消耗 {fmt(project.tokenUsed)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div style={{ fontSize: "18px", color: "#E87322", fontWeight: 800 }}>{fmt(remain)}</div>
                      <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>剩余可用</div>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div
                      style={{
                        width: `${Math.min(100, pct)}%`,
                        height: "100%",
                        background: pct > 80 ? "linear-gradient(90deg, #ff6b6b, #ff9b9b)" : "linear-gradient(90deg, #E87322, #F5A623)",
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div
          className="flex items-center gap-1.5 px-6 py-3 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.28)" }}>
            ⓘ 项目内仅展示当前项目额度与消耗明细，项目外展示个人生产栗余额与各项目额度概览。
          </span>
        </div>
      </div>
    </div>
  );
}
