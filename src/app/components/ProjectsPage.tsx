import { memo, useState } from "react";
import { useNavigate } from "react-router";
import { AlertTriangle, BookOpenCheck, Check, Clock, FolderOpen, MoveRight, Pencil, Plus, Trash2, Users } from "lucide-react";
import { ONBOARDING_DEMO_PROJECT_ID, PROJECTS_DATA, ProjectData } from "../data/projectsData";
import { useSpace } from "../context/SpaceContext";
import { toast } from "sonner";
import { CreateProjectDialog, EditProjectDialog } from "./CreateProjectDialog";
import { LEGACY_OFFLINE_TIME, PersonalMigrationBanner } from "./MigrationPrompts";

const PROJECT_STATUS = {
  IN_PROGRESS: "进行中",
  COMPLETED: "已完成",
  PAUSED: "暂停",
} as const;

type ProjectStatus = typeof PROJECT_STATUS[keyof typeof PROJECT_STATUS];

const STATUS_COLORS: Record<ProjectStatus, { bg: string; text: string }> = {
  [PROJECT_STATUS.IN_PROGRESS]: { bg: "rgba(232,115,34,0.15)", text: "#E87322" },
  [PROJECT_STATUS.COMPLETED]: { bg: "rgba(74,198,120,0.15)", text: "#4AC678" },
  [PROJECT_STATUS.PAUSED]: { bg: "rgba(255,255,255,0.08)", text: "rgba(255,255,255,0.4)" },
};

const COLORS = {
  primary: "#E87322",
  success: "#4AC678",
  danger: "#ff6b6b",
  textMuted: "rgba(255,255,255,0.4)",
  textSecondary: "rgba(255,255,255,0.35)",
  textPrimary: "rgba(255,255,255,0.7)",
  textWeak: "rgba(255,255,255,0.45)",
  borderSubtle: "rgba(255,255,255,0.07)",
  borderHover: "rgba(232,115,34,0.4)",
  bgDark: "#1A1510",
  bgDarker: "#140F09",
  bgMenu: "#2A2018",
};

interface ProjectCardProps {
  project: ProjectData;
  onNavigate: (id: string) => void;
  onEdit: (project: ProjectData) => void;
  onDelete: (project: ProjectData) => void;
  mode?: "team" | "personalLegacy";
  migrated?: boolean;
  onMigrate?: (project: ProjectData) => void;
}

const ProjectCard = memo(function ProjectCard({ project, onNavigate, onEdit, onDelete, mode = "team", migrated = false, onMigrate }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isPersonalLegacy = mode === "personalLegacy";

  const statusStyle = STATUS_COLORS[project.status] ?? STATUS_COLORS[PROJECT_STATUS.PAUSED];

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);
  const handleCardClick = () => {
    if (isPersonalLegacy) return;
    onNavigate(project.id);
  };

  return (
    <div
      className={`rounded-xl overflow-hidden relative group transition-transform ${isPersonalLegacy ? "cursor-default" : "cursor-pointer hover:scale-[1.02]"}`}
      style={{
        border: migrated ? "1px solid rgba(74,198,120,0.28)" : isHovered ? `1px solid ${COLORS.borderHover}` : `1px solid ${COLORS.borderSubtle}`,
        background: COLORS.bgDark,
        opacity: migrated ? 0.76 : 1,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden" style={{ height: "130px" }}>
        <img
          src={project.cover}
          alt={project.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          className="absolute inset-0 transition-opacity duration-200"
          style={{ background: "linear-gradient(to top, rgba(26,21,16,0.9) 0%, transparent 55%)" }}
        />

        <span
          className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs"
          style={{
            background: isPersonalLegacy ? migrated ? "rgba(74,198,120,0.16)" : "rgba(245,166,35,0.16)" : statusStyle.bg,
            color: isPersonalLegacy ? migrated ? COLORS.success : "#F5A623" : statusStyle.text,
            fontSize: "10px",
            backdropFilter: "blur(4px)",
          }}
        >
          {isPersonalLegacy ? migrated ? "已迁移" : "即将下线" : project.status}
        </span>

        {!isPersonalLegacy && (
          <div
            className="absolute top-2 right-2 flex gap-1.5 transition-opacity duration-200"
            style={{ opacity: isHovered ? 1 : 0 }}
          >
            <button
              className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
              onClick={(e) => { e.stopPropagation(); onEdit(project); }}
              title="编辑项目"
            >
              <Pencil size={11} style={{ color: COLORS.textPrimary }} />
            </button>
            <button
              className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
              style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
              onClick={(e) => { e.stopPropagation(); onDelete(project); }}
              title="删除项目"
            >
              <Trash2 size={11} style={{ color: COLORS.danger }} />
            </button>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2">
          <div className="flex items-center justify-between mb-1">
            {/*
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.55)" }}>
              {project.completedEpisodes}/{project.episodes} 集
            </span>
            */}
            <span
              style={{
                fontSize: "11px",
                color: project.progress === 100 ? COLORS.success : COLORS.primary,
              }}
            >
              {project.progress}%
            </span>
          </div>
          <div
            className="w-full rounded-full overflow-hidden"
            style={{ height: "3px", background: "rgba(255,255,255,0.12)" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${project.progress}%`,
                background: project.progress === 100
                  ? COLORS.success
                  : "linear-gradient(90deg, #E87322, #F5A623)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <div className="text-sm text-white truncate">{project.name}</div>
        </div>
        <div
          className="flex items-center justify-between mt-1.5"
          style={{ color: COLORS.textMuted }}
        >
          <div className="flex items-center gap-1">
            <Clock size={9} />
            <span style={{ fontSize: "10px" }}>{project.lastEdit}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={9} />
            <span style={{ fontSize: "10px" }}>{project.members.length} 人</span>
          </div>
          {/*
          <div className="flex items-center gap-1">
            <Film size={9} />
            <span style={{ fontSize: "10px" }}>{project.totalAssets} 资产</span>
          </div>
          */}
        </div>
        {isPersonalLegacy && (
          <div className="mt-3">
            <button
              disabled={migrated}
              onClick={(e) => { e.stopPropagation(); if (!migrated) onMigrate?.(project); }}
              className="w-full h-8 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-opacity disabled:opacity-55"
              style={{ background: migrated ? "rgba(74,198,120,0.12)" : "rgba(232,115,34,0.14)", color: migrated ? COLORS.success : COLORS.primary, border: migrated ? "1px solid rgba(74,198,120,0.22)" : "1px solid rgba(232,115,34,0.24)" }}
            >
              {migrated ? <Check size={13} /> : <MoveRight size={13} />}
              {migrated ? "已完成迁移" : "迁移至团队空间"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

const LEGACY_PROJECT_META: Record<string, { title: string; count: number; period: string; image?: string; avatars: string[] }> = {
  "1": { title: "1", count: 3, period: "2026.04.06-2026.05.04", avatars: ["A"] },
  "2": { title: "自爱", count: 32, period: "2026.01.07-2026.01.14", avatars: ["E"] },
  "3": { title: "失落的睡莲", count: 14, period: "2026.01.26-2026.01.27", avatars: ["H"] },
  "4": { title: "嘉奖令ppt", count: 12, period: "2025.12.25-2025.12.26", avatars: ["K", "L", "4"] },
  "5": {
    title: "武林外传",
    count: 6,
    period: "2025.12.05-2026.01.06",
    avatars: ["M"],
  },
};

function LegacyProjectCard({
  project,
  migrated,
  onMigrate,
}: {
  project: ProjectData;
  migrated: boolean;
  onMigrate: (project: ProjectData) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const meta = LEGACY_PROJECT_META[project.id] ?? {
    title: project.name,
    count: project.episodes,
    period: project.startDate,
    avatars: project.members.slice(0, 3).map(member => member.avatar),
  };

  return (
    <div
      className="relative overflow-hidden rounded-xl"
      style={{
        height: 235,
        background: meta.image
          ? `linear-gradient(to top, rgba(20,4,0,0.86), rgba(20,4,0,0.12)), url(${meta.image}) center/cover`
          : "radial-gradient(circle at 62% 58%, rgba(131,58,38,0.75), rgba(92,27,14,0.72) 35%, rgba(50,10,6,0.96) 72%), repeating-linear-gradient(135deg, rgba(255,126,45,0.1) 0 3px, transparent 3px 9px)",
        boxShadow: "0 22px 46px rgba(0,0,0,0.28)",
        opacity: migrated ? 0.62 : 1,
        border: migrated ? "1px solid rgba(74,198,120,0.28)" : "1px solid rgba(255,255,255,0.06)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="absolute left-0 top-0 h-10 min-w-16 px-4 flex items-center rounded-br-xl text-base font-semibold"
        style={{ color: "#1D0D06", background: "linear-gradient(180deg, #FFD0B2, #FF7829)" }}
      >
        {meta.count}
      </div>

      {migrated && (
        <div className="absolute right-4 top-4 px-3 py-1 rounded-full text-xs font-semibold" style={{ color: "#4AC678", background: "rgba(0,0,0,0.42)", border: "1px solid rgba(74,198,120,0.28)" }}>
          已迁移
        </div>
      )}

      {!migrated && (
        <button
          onClick={() => onMigrate(project)}
          className="absolute right-4 top-4 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-opacity"
          style={{
            opacity: 1,
            color: "#FFE6D5",
            background: isHovered ? "rgba(232,115,34,0.78)" : "rgba(0,0,0,0.62)",
            border: isHovered ? "1px solid rgba(255,180,128,0.5)" : "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(10px)",
          }}
        >
          <MoveRight size={13} />
          迁移至团队空间
        </button>
      )}

      <div className="absolute inset-x-6 top-[86px] text-center text-2xl font-semibold text-white truncate">
        {meta.title}
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-16 px-5 flex items-center justify-between"
        style={{ background: "rgba(31,4,0,0.86)" }}
      >
        <span className="text-sm" style={{ color: "rgba(255,255,255,0.76)" }}>{meta.period}</span>
        <div className="flex -space-x-2">
          {meta.avatars.map((avatar, index) => (
            <div
              key={`${avatar}-${index}`}
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold"
              style={{
                background: index === 2 ? "#6D4BD8" : "linear-gradient(135deg, #E9F0EA, #9FB8B2)",
                color: index === 2 ? "white" : "#14342E",
                border: "1.5px solid rgba(30,4,0,0.95)",
              }}
            >
              {avatar}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PersonalLegacyProjectsPage({
  migratedProjectIds,
  onMigrate,
}: {
  migratedProjectIds: string[];
  onMigrate: (project?: ProjectData) => void;
}) {
  return (
    <div
      className="h-full overflow-auto"
      style={{
        background: "radial-gradient(circle at 28% 92%, rgba(224,85,22,0.74), rgba(109,56,35,0.62) 24%, rgba(20,11,8,0.98) 54%, #050403 82%)",
      }}
    >
      <div className="px-10 py-9">
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-3">
            <h2 className="text-white text-lg font-semibold">所有项目</h2>
            
          </div>
        </div>

        <PersonalMigrationBanner onStartMigration={() => onMigrate()} />

        <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {PROJECTS_DATA.map(project => (
            <LegacyProjectCard
              key={project.id}
              project={project}
              migrated={migratedProjectIds.includes(project.id)}
              onMigrate={onMigrate}
            />
          ))}
        </div>

        <div className="mt-6 text-xs leading-5" style={{ color: "rgba(255,255,255,0.48)" }}>
          个人空间旧版项目仅支持迁移，不再支持新建或进入协作。未完成迁移的项目协作数据将不再保留，项目内生成/上传资产将保留在个人空间资产中。
        </div>
      </div>
    </div>
  );
}

export function ProjectsPage() {
  const { spaceId, migratedProjectIds, openPersonalMigration } = useSpace();
  const navigate = useNavigate();
  const isReadOnly = spaceId === "ent2";
  const isPersonalSpace = spaceId === "personal";

  const handleNavigate = (id: string) => navigate(`/project/${id}`);
  const [showNewProject, setShowNewProject] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);

  const handleNewProject = (data: { name: string; tokenTotal: number; cover?: string }) => {
    // TODO: persist to backend, for now just navigate
    navigate(`/project/${PROJECTS_DATA.length + 1}`);
  };

  const handleEditProject = (project: ProjectData) => {
    setEditingProject(project);
  };

  const handleDeleteProject = (project: ProjectData) => {
    // TODO: implement delete, for now just toast
    toast.success(`项目 "${project.name}" 已删除`);
  };

  const handleSaveEdit = (data: { name: string; tokenTotal: number; cover?: string }) => {
    setEditingProject(null);
    toast.success(`项目 "${data.name}" 已更新`);
  };

  const openMigration = (project?: ProjectData) => {
    openPersonalMigration(project ? [project.id] : undefined);
  };

  if (isPersonalSpace) {
    return (
      <PersonalLegacyProjectsPage
        migratedProjectIds={migratedProjectIds}
        onMigrate={openMigration}
      />
    );
  }

  return (
    <div
      className="h-full overflow-auto"
      style={{
        background: "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(140,70,20,0.25) 0%, rgba(20,15,9,0) 60%), #140F09",
      }}
    >
      <div className="px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 mb-1">
            <FolderOpen size={18} style={{ color: COLORS.primary }} />
            <h2 className="text-white">{isPersonalSpace ? "个人空间旧版项目" : "所有项目"}</h2>
            {isPersonalSpace && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1" style={{ color: "#F5A623", background: "rgba(245,166,35,0.14)" }}>
                <AlertTriangle size={10} />
                即将下线
              </span>
            )}
            <span className="text-xs ml-2" style={{ color: COLORS.textMuted }}>
              共 {PROJECTS_DATA.length} 个项目
            </span>
          </div>
        </div>

        {isPersonalSpace && (
          <PersonalMigrationBanner onStartMigration={() => openMigration()} />
        )}

        {!isPersonalSpace && (
          <div
            className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3"
            style={{
              background: "linear-gradient(135deg, rgba(245,166,35,0.13), rgba(232,115,34,0.06))",
              border: "1px solid rgba(245,166,35,0.2)",
            }}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ background: "rgba(245,166,35,0.15)", color: "#F5A623" }}
              >
                <BookOpenCheck size={18} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white">第一次使用项目协作？</div>
                <div className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                  点击「示例项目《国宝》」，按步骤学习项目总览、成员协作、额度和内容生产入口。
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/project/${ONBOARDING_DEMO_PROJECT_ID}`)}
              className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-opacity hover:opacity-85"
              style={{ background: "#E87322", color: "#fff" }}
            >
              开始新手引导
              <MoveRight size={13} />
            </button>
          </div>
        )}

        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))" }}
        >
          {!isPersonalSpace && (isReadOnly ? (
          <div
            className="rounded-xl relative group flex flex-col items-center justify-center"
            style={{
              border: "2px dashed rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.02)",
              minHeight: "210px",
              opacity: 0.5,
              cursor: "not-allowed",
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1.5px dashed rgba(255,255,255,0.15)",
              }}
            >
              <Plus size={20} style={{ color: "rgba(255,255,255,0.25)" }} />
            </div>
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
              新建项目
            </span>
            {/* Hover tooltip */}
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 rounded-lg text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10"
              style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}
            >
              没有权限，请联系团队管理员开启
            </div>
          </div>
          ) : (
          <div
            className="rounded-xl cursor-pointer flex flex-col items-center justify-center transition-all hover:opacity-80"
            style={{
              border: "2px dashed rgba(232,115,34,0.3)",
              background: "rgba(232,115,34,0.04)",
              minHeight: "210px",
            }}
            onClick={() => setShowNewProject(true)}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
              style={{
                background: "rgba(232,115,34,0.12)",
                border: "1.5px dashed rgba(232,115,34,0.5)",
              }}
            >
              <Plus size={20} style={{ color: COLORS.primary }} />
            </div>
            <span className="text-sm" style={{ color: COLORS.textWeak }}>
              新建项目
            </span>
          </div>
          ))}

          {PROJECTS_DATA.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onNavigate={handleNavigate}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
              mode={isPersonalSpace ? "personalLegacy" : "team"}
              migrated={migratedProjectIds.includes(project.id)}
              onMigrate={openMigration}
            />
          ))}
        </div>
        {isPersonalSpace && (
          <div className="mt-5 text-xs leading-5" style={{ color: COLORS.textMuted }}>
            个人空间旧版项目仅支持迁移，不再支持新建或进入协作。下线时间：{LEGACY_OFFLINE_TIME}。
          </div>
        )}
      </div>

      {/* ── New Project Dialog ── */}
      {showNewProject && (
        <CreateProjectDialog
          onClose={() => setShowNewProject(false)}
          onSave={handleNewProject}
        />
      )}

      {/* ── Edit Project Dialog ── */}
      {editingProject && (
        <EditProjectDialog
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSave={handleSaveEdit}
        />
      )}

    </div>
  );
}
