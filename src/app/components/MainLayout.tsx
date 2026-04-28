import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import {
  Home, Box, Zap, FolderOpen, Layout, Wrench,
  ClipboardList, Menu, RefreshCw, ListTodo, ChevronDown,
} from "lucide-react";
import { SpaceSwitcher } from "./SpaceSwitcher";
import { EnterpriseSettings } from "./enterprise/EnterpriseSettings";
import { TokenModal, TOTAL_TOKENS, ENTERPRISE_ALLOC, GIFT_TOKENS, ALL_PROJECT_ALLOC } from "./TokenModal";
import { TaskQueue } from "./TaskQueue";
import { PROJECTS_DATA } from "../data/projectsData";

const NAV_ITEMS = [
  { icon: Home, label: "主页", path: "/" },
  { icon: Box, label: "资产", path: "/assets" },
  { icon: Zap, label: "生成", path: "/generate" },
  { icon: FolderOpen, label: "项目", path: "/projects" },
  { icon: Layout, label: "画布", path: "/canvas" },
  { icon: Wrench, label: "工具库", path: "/tools" },
];

const ALL_USED = PROJECTS_DATA.reduce((s, p) => s + p.tokenUsed, 0);
const CURRENT_AVAILABLE = TOTAL_TOKENS - ALL_USED;

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSpaceId, setCurrentSpaceId] = useState("ent1");
  const [showSpaceSwitcher, setShowSpaceSwitcher] = useState(false);
  const [showEnterpriseSettings, setShowEnterpriseSettings] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showTaskQueue, setShowTaskQueue] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "#140F09" }}>
      {/* Sidebar */}
      <div className="flex flex-col items-center py-4 flex-shrink-0 relative z-20"
        style={{ width: "60px", background: "rgba(20,15,9,0.95)", borderRight: "1px solid rgba(255,255,255,0.05)" }}>

        {/* Logo */}
        <div className="mb-6 cursor-pointer" onClick={() => navigate("/")}>
          <span className="text-sm" style={{ color: "#E87322", fontWeight: "700", letterSpacing: "0.05em" }}>山海</span>
        </div>

        {/* Nav Items */}
        <div className="flex flex-col gap-1 flex-1">
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg transition-colors w-12"
                style={{ color: isActive ? "#E87322" : "rgba(255,255,255,0.4)" }}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)";
                }}
              >
                <Icon size={18} />
                <span className="text-center" style={{ fontSize: "10px", lineHeight: 1.2 }}>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col items-center gap-2">
          {/* Token button */}
          <button
            onClick={() => setShowTokenModal(true)}
            className="flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-lg w-12 transition-colors hover:bg-white/5"
            title="生产栗详情"
          >
            <span style={{ fontSize: "12px", lineHeight: 1 }}>🌰</span>
            <div className="flex flex-col items-center gap-0">
              <span style={{ fontSize: "8px", fontWeight: 600, color: "#E87322", lineHeight: 1.2 }}>
                {CURRENT_AVAILABLE >= 1000 ? `${(CURRENT_AVAILABLE / 1000).toFixed(0)}` : CURRENT_AVAILABLE}
              </span>
            </div>
          </button>

          {/* User Avatar */}
          <div className="relative">
            <button
              onClick={() => setShowSpaceSwitcher(!showSpaceSwitcher)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs overflow-hidden relative"
              style={{ background: "#E87322" }}
            >
              Bob
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: "#2A2018", border: "1.5px solid rgba(255,255,255,0.15)" }}>
                <RefreshCw size={8} style={{ color: "#E87322" }} />
              </div>
            </button>
          </div>

          {/* Menu */}
          <button className="w-9 h-6 flex items-center justify-center rounded transition-colors"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)"; }}>
            <Menu size={16} />
          </button>
        </div>
      </div>

      {/* Space Switcher */}
      {showSpaceSwitcher && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowSpaceSwitcher(false)} />
          <SpaceSwitcher
            onClose={() => setShowSpaceSwitcher(false)}
            currentSpaceId={currentSpaceId}
            onSwitchSpace={(id) => { setCurrentSpaceId(id); setShowSpaceSwitcher(false); }}
            onOpenSettings={() => { setShowSpaceSwitcher(false); setShowEnterpriseSettings(true); }}
          />
        </>
      )}

      {showEnterpriseSettings && (
        <EnterpriseSettings onClose={() => setShowEnterpriseSettings(false)} />
      )}

      {showTokenModal && (
        <TokenModal onClose={() => setShowTokenModal(false)} mode="total" />
      )}

      {showTaskQueue && (
        <TaskQueue onClose={() => setShowTaskQueue(false)} />
      )}

      {/* ── Floating Task Queue Pill (always visible, top-right) ── */}
      {!showTaskQueue && (
        <button
          onClick={() => setShowTaskQueue(true)}
          className="fixed z-[150] flex items-center gap-2 rounded-[20px]"
          title="任务队列"
          style={{
            top: "16px",
            right: "16px",
            padding: "8px 16px 8px 14px",
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "inset 0 0 12px 0 rgba(255,255,255,0.2), 0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <ListTodo size={15} style={{ color: "rgba(255,255,255,0.6)" }} />
          <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1 }}>队列</span>
          {/* Running task indicator */}
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#E87322" }} />
          <ChevronDown size={12} style={{ color: "rgba(255,255,255,0.35)" }} />
        </button>
      )}

      <div className="flex-1 overflow-hidden relative">
        <Outlet />
      </div>
    </div>
  );
}