//项目里左侧导航

import { useState } from "react";
import { useNavigate, useLocation, Outlet, useParams } from "react-router";
import { Layers, Sparkles, Film, ArrowLeft, Home, RefreshCw } from "lucide-react";
import { getProjectById } from "../data/projectsData";
import { TokenModal, ENTERPRISE_ALLOC, GIFT_TOKENS, TOTAL_TOKENS, ALL_PROJECT_ALLOC } from "./TokenModal";
import { PROJECTS_DATA } from "../data/projectsData";
import { SpaceSwitcher } from "./SpaceSwitcher";
import { EnterpriseSettings } from "./enterprise/EnterpriseSettings";

type NavKey = "home" | "assets" | "generate" | "canvas" | "storyboard";
type PermLevel = "管理" | "编辑" | "阅读";

interface NavItemDef { icon: typeof Layers; label: string; path: string; key: NavKey }

const ALL_NAV_ITEMS: NavItemDef[] = [
  { icon: Sparkles, label: "生成", path: "generate", key: "generate" },
  { icon: Film, label: "分镜", path: "storyboard", key: "storyboard" },
];

// Permission → allowed nav keys
const PERM_NAV: Record<PermLevel, NavKey[]> = {
  "管理": ["generate", "storyboard"],
  "编辑": ["generate", "storyboard"],
  "阅读": ["storyboard"],
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

const ALL_USED = PROJECTS_DATA.reduce((s, p) => s + p.tokenUsed, 0);

function fmt(n: number) {
  return n >= 10000 ? `${(n / 10000).toFixed(1)}万` : n.toLocaleString();
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

  const getActiveKey = (): NavKey => {
    const base = `/project/${id}`;
    const pathname = location.pathname;
    if (pathname === base || pathname === base + "/") return "home";
    const seg = pathname.split("/").pop() as NavKey;
    return seg ?? "home";
  };

  const activeKey = getActiveKey();
  const isOnHome = activeKey === "home";

  // Filter nav items by permission
  const perm = project?.permission ?? "编辑";
  const allowedKeys = PERM_NAV[perm];
  const visibleNavItems = ALL_NAV_ITEMS.filter(item => allowedKeys.includes(item.key));

  // Check if current route is allowed
  const isAllowed = !isOnHome && activeKey !== "home" ? allowedKeys.includes(activeKey) : true;

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

        {/* ── 返回按钮 (always shown) ── */}
        <button
          title="返回项目列表"
          onClick={() => navigate("/projects")}
          className="flex flex-col items-center gap-0.5 py-2 rounded-lg transition-all w-full relative group mb-0.5"
          style={{ color: "rgba(255,255,255,0.4)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.75)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)"; }}
        >
          <ArrowLeft size={15} />
          <span style={{ fontSize: "8px", lineHeight: 1.2 }}>返回</span>
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
              {fmt(TOTAL_TOKENS)}
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
        {/* Project info header — shown only when NOT on home page */}
        {!isOnHome && project && (
          <div
            className="flex items-center gap-4 px-5 py-2 flex-shrink-0"
            style={{ background: "#0D0A06", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center gap-2 min-w-0">
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

            <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.08)" }} />

            

            <div className="flex-1" />

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(232,115,34,0.1)" }}>
                <span style={{ fontSize: "10px", color: "#E87322" }}>
                  进度 {project.completedEpisodes}/{project.episodes} 集
                </span>
              </div>
              
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          {isAllowed ? (
            <Outlet />
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
          projectName={project.name}
          projectAlloc={project.tokenTotal}
          projectUsed={project.tokenUsed}
        />
      )}
    </div>
  );
}