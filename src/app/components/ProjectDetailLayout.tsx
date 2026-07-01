//项目里左侧导航

import { useState } from "react";
import { useNavigate, useLocation, Outlet, useParams } from "react-router";
import { Layers, Sparkles, Film, Home, RefreshCw, Users, ChevronRight, BookOpen, BookOpenCheck, X, Pencil, ChevronDown, Plus, Link2 } from "lucide-react";
import { getProjectById } from "../data/projectsData";
import { TokenModal } from "./TokenModal";
import { SpaceSwitcher } from "./SpaceSwitcher";
import { EnterpriseSettings } from "./enterprise/EnterpriseSettings";
import { LegacyEntryBar, LegacySwitchDialog } from "./MigrationPrompts";
import { toast } from "sonner";

type NavKey = "home" | "assets" | "generate" | "canvas" | "storyboard" | "subjects" | "script";
type PermLevel = "管理" | "编辑" | "阅读";

interface NavItemDef { icon: typeof Layers; label: string; path: string; key: NavKey }

const ALL_NAV_ITEMS: NavItemDef[] = [
  { icon: BookOpen, label: "剧本", path: "script", key: "script" },
  { icon: Users, label: "主体", path: "subjects", key: "subjects" },
  { icon: Sparkles, label: "生成", path: "generate", key: "generate" },
  { icon: Film, label: "分镜", path: "storyboard", key: "storyboard" },
];

// Permission → allowed nav keys
const PERM_NAV: Record<PermLevel, NavKey[]> = {
  "管理": ["script", "subjects", "generate", "storyboard"],
  "编辑": ["script", "subjects", "generate", "storyboard"],
  "阅读": ["script", "subjects", "storyboard"],
};

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  进行中: { bg: "rgba(232,115,34,0.15)", text: "#E87322" },
  已完成: { bg: "rgba(74,198,120,0.15)", text: "#4AC678" },
  暂停: { bg: "rgba(255,255,255,0.08)", text: "rgba(255,255,255,0.4)" },
};

const PERM_STYLE: Record<string, { bg: string; text: string }> = {
  "管理": { bg: "rgba(232,115,34,0.15)", text: "#E87322" },
  "编辑": { bg: "rgba(59,130,246,0.15)", text: "#3b82f6" },
  "阅读": { bg: "rgba(255,255,255,0.08)", text: "rgba(255,255,255,0.4)" },
};

function fmt(n: number) {
  return n >= 10000 ? `${(n / 10000).toFixed(1)}万` : n.toLocaleString();
}

function LegacyProjectPreview({ projectName }: { projectName: string }) {
  const rows = [
    {
      shot: "1",
      duration: "3s",
      script: "（空镜）夜晚，镜头起幅是“同福客栈”的牌匾，随即镜头下移露出漆黑的大门和挂着的灯笼。",
      voice: "邢：“我得走。”\n佟：“老邢……”",
    },
    {
      shot: "2",
      duration: "8s",
      script: "老邢身穿官服推门而出，佟湘玉身穿粉色衣裳紧随其后拽住他。伸手欲拉被老邢侧身躲开。",
      voice: "邢：“我公务在身，我心系百姓。”\n佟：“你听我说……”",
    },
  ];

  return (
    <div className="h-full overflow-auto" style={{ background: "#111111", color: "rgba(255,255,255,0.86)" }}>
      <div
        className="h-[76px] px-7 flex items-center justify-between sticky top-0 z-10"
        style={{ background: "#231E1C", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-4 min-w-0">
          <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)" }} title="关闭旧版预览">
            <X size={21} />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold truncate max-w-[220px]">{projectName}</span>
              <span className="px-2 py-0.5 rounded-md text-xs font-semibold" style={{ background: "linear-gradient(135deg, #FFB389, #FF6D2D)", color: "white" }}>6</span>
              <Pencil size={14} style={{ color: "rgba(255,255,255,0.45)" }} />
            </div>
            <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>项目时间：2025.12.05 - 2026.01.06</div>
          </div>
        </div>

        <div className="rounded-xl p-1 flex items-center gap-1" style={{ background: "rgba(255,255,255,0.08)" }}>
          {["脚本生成", "美术设定", "分镜制作"].map((tab, index) => (
            <button
              key={tab}
              className="h-9 px-9 rounded-lg text-sm font-semibold"
              style={{ background: index === 0 ? "rgba(255,255,255,0.11)" : "transparent", color: index === 0 ? "#fff" : "rgba(255,255,255,0.82)" }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 text-sm">
          <button style={{ color: "#FF9A5B" }}>充值中心</button>
          <span style={{ color: "#FF9A5B" }}>个人: 0</span>
          <span style={{ color: "#FF9A5B" }}>企业: 1604</span>
          <div className="w-8 h-8 rounded-full" style={{ background: "linear-gradient(135deg, #D7C2B0, #6C4F45)" }} />
          <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.5)" }} />
        </div>
      </div>

      <div className="text-center text-xs py-2" style={{ background: "#231E1C", color: "rgba(255,255,255,0.35)" }}>
        内容由AI生成，重要信息请务必核查
      </div>

      <div className="px-10 py-10">
        <h2 className="text-2xl font-semibold text-center mb-10">创建分镜脚本</h2>

        <section className="max-w-[1120px] mx-auto rounded-xl overflow-hidden" style={{ background: "#241F1C", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="grid grid-cols-2 text-center text-sm font-semibold" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="py-4" style={{ color: "#FF9A5B", borderBottom: "2px solid #FF9A5B" }}>自动创建分镜脚本</div>
            <div className="py-4">批量导入分镜脚本</div>
          </div>
          <div className="p-5">
            <div className="h-36 rounded-md p-4 text-sm leading-7 relative" style={{ background: "#10110F", border: "1px solid rgba(255,255,255,0.16)", color: "rgba(255,255,255,0.7)" }}>
              <div>分镜序号</div>
              <div>图</div>
              <div>分镜图</div>
              <div>场景/时间</div>
              <div>时长</div>
              <div>景别</div>
              <div>摄像机角度</div>
              <div>摄像机运动</div>
              <div className="absolute right-4 bottom-2 text-xs" style={{ color: "rgba(255,255,255,0.42)" }}>1027 / 3000</div>
            </div>
            <div className="flex justify-end mt-4">
              <button className="px-5 py-2 rounded-full text-sm font-semibold" style={{ background: "#FF8A3D", color: "#24140C" }}>生成脚本 1</button>
            </div>
          </div>
        </section>

        <section className="max-w-[1120px] mx-auto mt-6 rounded-xl overflow-hidden" style={{ background: "#241F1C", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="px-5 py-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">文字分镜脚本</h3>
            <button className="px-3 py-1.5 rounded-full text-xs flex items-center gap-2" style={{ border: "1px solid rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.78)" }}>
              版本：2025-12-19 10:03
              <ChevronDown size={13} />
            </button>
          </div>
          <div className="grid text-xs" style={{ gridTemplateColumns: "90px 80px 80px 80px 1fr 220px 120px", color: "rgba(255,255,255,0.38)", borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {["编辑", "集数", "场次", "分镜号", "文字脚本", "配音", "责任人"].map(header => (
              <div key={header} className="px-4 py-3">{header}</div>
            ))}
          </div>
          {rows.map(row => (
            <div
              key={row.shot}
              className="grid text-sm"
              style={{ gridTemplateColumns: "90px 80px 80px 80px 1fr 220px 120px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="px-4 py-7 flex flex-col gap-3" style={{ color: "#FF9A5B" }}><Plus size={14} /><span>-</span></div>
              <div className="px-4 py-7">第1集</div>
              <div className="px-4 py-7">第1场</div>
              <div className="px-4 py-7">{row.shot}</div>
              <div className="px-4 py-7 leading-6">{row.script}</div>
              <div className="px-4 py-7 whitespace-pre-line leading-6" style={{ color: "rgba(255,255,255,0.76)" }}>{row.voice}</div>
              <div className="px-4 py-7 flex items-start justify-center">
                <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ border: "1px dashed rgba(255,255,255,0.28)" }}>+</button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export function ProjectDetailLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const project = getProjectById(id ?? "");
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showSpaceSwitcher, setShowSpaceSwitcher] = useState(false);
  const [showEnterpriseSettings, setShowEnterpriseSettings] = useState(false);
  const [currentSpaceId, setCurrentSpaceId] = useState("ent1");
  const [legacyMode, setLegacyMode] = useState(false);
  const [legacySwitchDialog, setLegacySwitchDialog] = useState<"toLegacy" | "toNew" | null>(null);

  const getActiveKey = (): NavKey => {
    const base = `/project/${id}`;
    const pathname = location.pathname;
    if (pathname === base || pathname === base + "/") return "home";
    const seg = pathname.split("/").pop() as NavKey;
    return seg ?? "home";
  };

  const activeKey = getActiveKey();
  const isOnHome = activeKey === "home";
  const activeModule = ALL_NAV_ITEMS.find(n => n.key === activeKey)?.label ?? "";

  // Filter nav items by permission
  const perm = project?.permission ?? "编辑";
  const allowedKeys = PERM_NAV[perm];
  const visibleNavItems = ALL_NAV_ITEMS.filter(item => allowedKeys.includes(item.key));

  // Check if current route is allowed
  const isAllowed = !isOnHome && activeKey !== "home" ? allowedKeys.includes(activeKey) : true;
  const copyProjectLink = () => {
    const link = `${window.location.origin}/project/${id}`;
    navigator.clipboard.writeText(link)
      .then(() => toast.success("链接已复制到剪贴板"))
      .catch(() => toast.error("复制失败"));
  };
  const startOnboarding = () => {
    const params = new URLSearchParams(location.search);
    params.set("guide", "1");
    const nextSearch = params.toString();
    navigate(`${location.pathname}${nextSearch ? `?${nextSearch}` : ""}${location.hash}`);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "#140F09" }}>
      {/* ── Icon Sidebar ──────────────────────────────────────────────── */}
      <div
        className="flex flex-col items-center py-3 flex-shrink-0 relative z-20"
        style={{
          width: "52px",
          background: "#0D0A06",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {/* Logo */}
        <button
          className="mb-4 flex flex-col items-center gap-0.5 transition-opacity hover:opacity-75"
          onClick={() => navigate("/")}
          title="返回主页"
        >
          <span style={{ color: "#E87322", fontWeight: "700", fontSize: "11px", letterSpacing: "0.05em" }}>
            山海
          </span>
        </button>


        {/* ── 总览按钮 (always shown, active on home) ── */}
        <button
          title="项目总览"
          onClick={() => navigate(`/project/${id}`)}
          className="flex flex-col items-center gap-0.5 py-2 rounded-lg transition-all w-full relative group mb-1"
          style={{
            color: isOnHome ? "#E87322" : "rgba(255,255,255,0.4)",
            background: isOnHome ? "rgba(232,115,34,0.1)" : "transparent",
          }}
          onMouseEnter={(e) => {
            if (!isOnHome) (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.75)";
          }}
          onMouseLeave={(e) => {
            if (!isOnHome) (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)";
          }}
        >
          {isOnHome && (
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-r-full"
              style={{ height: "18px", background: "#E87322" }}
            />
          )}
          <Home size={15} />
          <span style={{ fontSize: "8px", lineHeight: 1.2 }}>总览</span>
        </button>

        {/* Divider */}
        <div className="w-6 mb-1" style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />

        {/* Sub nav items */}
        <div className="flex flex-col gap-0.5 flex-1 w-full">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activeKey;
            return (
              <button
                key={item.key}
                title={item.label}
                onClick={() => navigate(`/project/${id}/${item.path}`)}
                className="flex flex-col items-center gap-0.5 py-2 rounded-lg transition-all w-full relative group"
                style={{
                  color: isActive ? "#E87322" : "rgba(255,255,255,0.4)",
                  background: isActive ? "rgba(232,115,34,0.1)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.75)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)";
                }}
              >
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-r-full"
                    style={{ height: "18px", background: "#E87322" }}
                  />
                )}
                <Icon size={15} />
                <span style={{ fontSize: "8px", lineHeight: 1.2 }}>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Token + User at bottom */}
        <div className="flex flex-col items-center gap-1.5">
          {/* Token button */}
          <button
            onClick={() => setShowTokenModal(true)}
            className="flex flex-col items-center gap-0 px-1 py-1.5 rounded-lg w-full transition-colors hover:bg-white/5"
            title="生产栗详情"
          >
            <span style={{ fontSize: "12px", lineHeight: 1 }}>🌰</span>
            <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.4)", lineHeight: 1.2 }}>
              {fmt(Math.max((project?.tokenTotal ?? 0) - (project?.tokenUsed ?? 0), 0))}
            </span>
          </button>

          {/* User avatar — clickable to open SpaceSwitcher */}
          <div className="relative">
            <button
              onClick={() => setShowSpaceSwitcher(!showSpaceSwitcher)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white relative"
              style={{ background: "#E87322", fontSize: "9px", fontWeight: "600" }}
            >
              Bob
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                style={{ background: "#1A1208", border: "1.5px solid rgba(255,255,255,0.15)" }}>
                <RefreshCw size={7} style={{ color: "#E87322" }} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Space Switcher */}
      {showSpaceSwitcher && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowSpaceSwitcher(false)} />
          <SpaceSwitcher
            onClose={() => setShowSpaceSwitcher(false)}
            currentSpaceId={currentSpaceId}
            onSwitchSpace={(sid) => { setCurrentSpaceId(sid); setShowSpaceSwitcher(false); }}
            onOpenSettings={() => { setShowSpaceSwitcher(false); setShowEnterpriseSettings(true); }}
          />
        </>
      )}

      {showEnterpriseSettings && (
        <EnterpriseSettings onClose={() => setShowEnterpriseSettings(false)} />
      )}

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Unified breadcrumb header - always visible */}
        {project && (
          <div
            className="flex items-center gap-4 px-5 py-2.5 flex-shrink-0"
            style={{ background: "#0D0A06", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            {/* Breadcrumb: 所有项目 > 项目名称 */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navigate("/projects")}
                className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                <Layers size={12} />
                所有项目
              </button>
              <ChevronRight size={12} style={{ color: "rgba(255,255,255,0.25)" }} />
              <LegacyEntryBar
                isLegacy={legacyMode}
                variant="inline"
                onSwitchLegacy={() => {
                  setLegacyMode(true);
                  setLegacySwitchDialog("toLegacy");
                }}
                onReturnNew={() => setLegacyMode(false)}
              />
              <span className="text-sm text-white truncate" style={{ maxWidth: "200px" }}>
                {project.name}
              </span>
              <span
                className="px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ ...STATUS_STYLE[project.status], fontSize: "10px" }}
              >
                {project.status}
              </span>
              <span
                className="px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ ...PERM_STYLE[project.permission], fontSize: "10px" }}
              >
                {project.permission}
              </span>
            </div>

              {/* Module name as breadcrumb — only when a module is active */}
              {!isOnHome && activeModule && (
                <>
                  <ChevronRight size={12} style={{ color: "rgba(255,255,255,0.25)" }} />
                  <span className="text-sm font-medium" style={{ color: "#E87322" }}>
                    {activeModule}
                  </span>
                </>
              )}

            <div className="flex-1" />
            <div className="relative group/guide-tip">
              <button
                onClick={startOnboarding}
                className="h-7 rounded-lg px-2.5 flex items-center gap-1.5 transition-colors hover:bg-white/10"
                style={{ color: "#F5A623", border: "1px solid rgba(245,166,35,0.18)", background: "rgba(245,166,35,0.08)", fontSize: "11px", fontWeight: 500 }}
              >
                <BookOpenCheck size={13} />
                新手引导
              </button>
              <div
                className="absolute right-0 top-full mt-2 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap pointer-events-none opacity-0 translate-y-1 group-hover/guide-tip:opacity-100 group-hover/guide-tip:translate-y-0 transition-all z-30"
                style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.72)", boxShadow: "0 10px 24px rgba(0,0,0,0.35)", fontSize: "11px" }}
              >
                重新查看项目使用教学
              </div>
            </div>
            <div className="relative group/link-tip">
              <button
                onClick={copyProjectLink}
                aria-label="复制项目链接"
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
              >
                <Link2 size={13} />
              </button>
              <div
                className="absolute right-0 top-full mt-2 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap pointer-events-none opacity-0 translate-y-1 group-hover/link-tip:opacity-100 group-hover/link-tip:translate-y-0 transition-all z-30"
                style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.72)", boxShadow: "0 10px 24px rgba(0,0,0,0.35)", fontSize: "11px" }}
              >
                复制项目链接
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          {isAllowed ? (
            legacyMode ? (
              <LegacyProjectPreview projectName={project?.name ?? "旧版项目"} />
            ) : (
              <Outlet />
            )
          ) : (
            <div className="flex items-center justify-center h-full" style={{ background: "#140F09" }}>
              <div className="text-center">
                <div className="text-4xl mb-4" style={{ opacity: 0.15 }}>🔒</div>
                <h3 className="text-base text-white mb-2">无权访问</h3>
                <p className="text-sm mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                  当前权限为 <span style={{ color: PERM_STYLE[perm].text }}>{perm}</span>，无法使用此功能
                </p>
                <button
                  onClick={() => navigate(`/project/${id}`)}
                  className="px-4 py-1.5 rounded-lg text-sm transition-colors"
                  style={{ color: "#E87322", background: "rgba(232,115,34,0.1)" }}
                >
                  返回项目总览
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Token Modal */}
      {showTokenModal && project && (
        <TokenModal
          onClose={() => setShowTokenModal(false)}
          mode="project"
          projectId={project.id}
          projectName={project.name}
          projectAlloc={project.tokenTotal}
          projectUsed={project.tokenUsed}
        />
      )}

      {legacySwitchDialog && (
        <LegacySwitchDialog
          mode={legacySwitchDialog}
          onClose={() => setLegacySwitchDialog(null)}
          onConfirm={() => {
            setLegacyMode(legacySwitchDialog !== "toLegacy");
            setLegacySwitchDialog(null);
          }}
        />
      )}

    </div>
  );
}
