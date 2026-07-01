import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import {
  Home, Box, Zap, FolderOpen, Layout, Wrench,
  Menu, RefreshCw, Bell, Link2,
} from "lucide-react";
import { SpaceSwitcher } from "./SpaceSwitcher";
import { EnterpriseSettings } from "./enterprise/EnterpriseSettings";
import { TokenModal, PERSONAL_TOKEN_BALANCE } from "./TokenModal";
import { getMessageUnreadCount, MessageCenter, type MessageReadIds } from "./MessageCenter";
import { SpaceContext, type SpaceId } from "../context/SpaceContext";
import { LEGACY_OFFLINE_TIME, MigrationAnnouncementModal, PersonalProjectMigrationDialog } from "./MigrationPrompts";
import { PROJECTS_DATA } from "../data/projectsData";

const NAV_ITEMS = [
  { icon: Home, label: "主页", path: "/" },
  { icon: Box, label: "资产", path: "/assets" },
  { icon: FolderOpen, label: "项目", path: "/projects" },
  { icon: Zap, label: "生成", path: "/generate" },
  { icon: Link2, label: "链接", path: "/project-link" },
  { icon: Layout, label: "画布", path: "/canvas" },
  { icon: Wrench, label: "工具库", path: "/tools" },
];

const SPACES = [
  { id: "personal", name: "个人空间", short: "个人", type: "personal" as const, avatarColor: "#4A4A4A", letter: "我" },
  { id: "ent1", name: "山海科技有限公司", short: "山海科技", type: "enterprise" as const, role: "所有者", avatarColor: "#C45C1A", letter: "山" },
  { id: "ent2", name: "未来创意工作室", short: "未来创意", type: "enterprise" as const, role: "成员", avatarColor: "#1A5CC4", letter: "未" },
];

const ANNOUNCEMENT_STORAGE_KEY = "team-collab-migration-announcement-read-v2";

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentSpaceId, setCurrentSpaceId] = useState("ent1");
  const [showSpaceSwitcher, setShowSpaceSwitcher] = useState(false);
  const [showEnterpriseSettings, setShowEnterpriseSettings] = useState(false);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [showMessageCenter, setShowMessageCenter] = useState(false);
  const [messageReadIds, setMessageReadIds] = useState<MessageReadIds>(new Set());
  const [showAnnouncement, setShowAnnouncement] = useState(() => localStorage.getItem(ANNOUNCEMENT_STORAGE_KEY) !== "true");
  const [showPersonalMigration, setShowPersonalMigration] = useState(false);
  const [migrationInitialProjectIds, setMigrationInitialProjectIds] = useState<string[] | undefined>(undefined);
  const [migratedProjectIds, setMigratedProjectIds] = useState<string[]>([]);

  const currentSpace = SPACES.find(s => s.id === currentSpaceId)!;
  const messageUnreadCount = getMessageUnreadCount(currentSpaceId !== "personal", messageReadIds);

  const openPersonalMigration = (projectIds?: string[]) => {
    setMigrationInitialProjectIds(projectIds);
    setShowPersonalMigration(true);
  };

  return (
    <SpaceContext.Provider value={{ spaceId: currentSpaceId as SpaceId, migratedProjectIds, openPersonalMigration }}>
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
            const isActive = location.pathname === path || (path !== "/" && location.pathname.startsWith(`${path}/`));
            const isProjects = path === "/projects";
            const showNewTag = currentSpaceId !== "personal" && isProjects;
            const showOfflineTag = currentSpaceId === "personal" && isProjects;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg transition-colors w-12 relative"
                style={{ color: isActive ? "#E87322" : "rgba(255,255,255,0.4)" }}
                title={showNewTag ? "新版团队协作已上线，项目协作能力统一在团队空间中使用" : showOfflineTag ? `个人空间项目将于 ${LEGACY_OFFLINE_TIME} 下线，请尽快完成迁移` : label}
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)";
                }}
              >
                <div className="relative">
                  <Icon size={18} />
                </div>
                <span className="text-center relative" style={{ fontSize: "10px", lineHeight: 1.2 }}>
                  {label}
                  {showNewTag && (
                    <span
                      className="absolute -top-2 -right-4 rounded px-1 font-semibold"
                      style={{ fontSize: "7px", lineHeight: "10px", color: "white", background: "#E87322" }}
                    >
                      NEW
                    </span>
                  )}
                </span>
                {showOfflineTag && (
                  <span
                    className="absolute -right-5 top-1 rounded px-1 font-semibold whitespace-nowrap"
                    style={{ fontSize: "7px", lineHeight: "12px", color: "#fff", background: "#D9534F" }}
                  >
                    即将下线
                  </span>
                )}
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
                {PERSONAL_TOKEN_BALANCE >= 1000 ? `${(PERSONAL_TOKEN_BALANCE / 1000).toFixed(1)}k` : PERSONAL_TOKEN_BALANCE}
              </span>
            </div>
          </button>

          <button
            onClick={() => setShowMessageCenter(true)}
            className="relative flex h-11 w-11 items-center justify-center rounded-xl transition-colors hover:bg-white/5"
            title="消息中心"
            style={{ color: "rgba(255,255,255,0.72)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Bell size={18} />
            {messageUnreadCount > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
                style={{ background: "#E87322", color: "#fff", boxShadow: "0 0 0 2px #140F09" }}
              >
                {messageUnreadCount > 99 ? "99+" : messageUnreadCount}
              </span>
            )}
          </button>

          {/* ── Space Switcher Avatar ── */}
          <div className="relative">
            <button
              onClick={() => setShowSpaceSwitcher(!showSpaceSwitcher)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
              style={{ background: currentSpace.avatarColor }}
              title="切换空间"
            >
              {currentSpace.letter}
            </button>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
              style={{ background: "#140F09", border: "1.5px solid rgba(255,255,255,0.15)" }}
            >
              <RefreshCw size={7} style={{ color: "#E87322" }} />
            </div>
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

      {showAnnouncement && (
        <MigrationAnnouncementModal
          onClose={() => {
            localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, "true");
            setShowAnnouncement(false);
          }}
          onGoMigration={() => {
            localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, "true");
            setShowAnnouncement(false);
            setCurrentSpaceId("personal");
            navigate("/projects");
            openPersonalMigration();
          }}
        />
      )}

      {showMessageCenter && (
        <MessageCenter
          isTeamSpace={currentSpaceId !== "personal"}
          readIds={messageReadIds}
          setReadIds={setMessageReadIds}
          onClose={() => setShowMessageCenter(false)}
          onGoMigration={() => {
            localStorage.setItem(ANNOUNCEMENT_STORAGE_KEY, "true");
            setShowAnnouncement(false);
            setShowMessageCenter(false);
            setCurrentSpaceId("personal");
            navigate("/projects");
            openPersonalMigration();
          }}
        />
      )}

      {showPersonalMigration && (
        <PersonalProjectMigrationDialog
          projects={PROJECTS_DATA}
          migratedIds={migratedProjectIds}
          initialProjectIds={migrationInitialProjectIds}
          teamSpaces={[]}
          onClose={() => setShowPersonalMigration(false)}
          onComplete={(ids) => setMigratedProjectIds(prev => Array.from(new Set([...prev, ...ids])))}
        />
      )}

      <div className="flex-1 overflow-hidden relative">
        <Outlet />
      </div>
    </div>
    </SpaceContext.Provider>
  );
}
