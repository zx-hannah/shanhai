import { memo, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Clock, MoreHorizontal, Trash2, Edit2, FolderOpen, Film } from "lucide-react";
import { PROJECTS_DATA, ProjectData } from "../data/projectsData";
import { useSpace } from "../context/SpaceContext";

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

interface DropdownItemProps {
  icon: typeof Edit2;
  label: string;
  color: string;
  onClick?: () => void;
}

function DropdownItem({ icon: Icon, label, color, onClick }: DropdownItemProps) {
  return (
    <button
      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors hover:bg-white/5"
      style={{ color }}
      onClick={onClick}
    >
      <Icon size={11} />
      {label}
    </button>
  );
}

interface ProjectCardProps {
  project: ProjectData;
  onNavigate: (id: string) => void;
}

const ProjectCard = memo(function ProjectCard({ project, onNavigate }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const statusStyle = STATUS_COLORS[project.status] ?? STATUS_COLORS[PROJECT_STATUS.PAUSED];

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsMenuOpen(false);
  };
  const handleCardClick = () => onNavigate(project.id);
  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div
      className="rounded-xl overflow-hidden cursor-pointer relative group transition-transform hover:scale-[1.02]"
      style={{
        border: isHovered ? `1px solid ${COLORS.borderHover}` : `1px solid ${COLORS.borderSubtle}`,
        background: COLORS.bgDark,
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
            background: statusStyle.bg,
            color: statusStyle.text,
            fontSize: "10px",
            backdropFilter: "blur(4px)",
          }}
        >
          {project.status}
        </span>

        <div
          className="absolute top-2 right-2 flex gap-1.5 transition-opacity duration-200"
          style={{ opacity: isHovered ? 1 : 0 }}
        >
          <button
            className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={handleMenuToggle}
            title="更多操作"
          >
            <MoreHorizontal size={12} style={{ color: COLORS.textPrimary }} />
          </button>
        </div>

        {isMenuOpen && (
          <div
            className="absolute top-10 right-2 rounded-lg overflow-hidden z-10"
            style={{
              background: COLORS.bgMenu,
              border: `1px solid ${COLORS.borderSubtle}`,
              boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
              minWidth: "120px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownItem icon={Edit2} label="重命名" color={COLORS.textPrimary} />
            <div style={{ borderTop: `1px solid rgba(255,255,255,0.06)` }} />
            <DropdownItem icon={Trash2} label="删除项目" color={COLORS.danger} />
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2">
          <div className="flex items-center justify-between mb-1">
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.55)" }}>
              {project.completedEpisodes}/{project.episodes} 集
            </span>
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
        <div className="text-sm text-white truncate">{project.name}</div>
        <div
          className="flex items-center justify-between mt-1.5"
          style={{ color: COLORS.textMuted }}
        >
          <div className="flex items-center gap-1">
            <Clock size={9} />
            <span style={{ fontSize: "10px" }}>{project.lastEdit}</span>
          </div>
          <div className="flex items-center gap-1">
            <Film size={9} />
            <span style={{ fontSize: "10px" }}>{project.totalAssets} 资产</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export function ProjectsPage() {
  const { spaceId } = useSpace();
  const navigate = useNavigate();
  const isReadOnly = spaceId === "ent2";

  const handleNavigate = (id: string) => navigate(`/project/${id}`);
  const handleNewProject = () => {
    // TODO: Implement new project creation dialog
  };

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
            <h2 className="text-white">所有项目</h2>
            <span className="text-xs ml-2" style={{ color: COLORS.textMuted }}>
              共 {PROJECTS_DATA.length} 个项目
            </span>
          </div>
        </div>

        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))" }}
        >
          {isReadOnly ? (
          <div
            className="rounded-xl cursor-pointer flex flex-col items-center justify-center transition-all group relative"
            style={{
              border: "2px dashed rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.02)",
              minHeight: "210px",
              opacity: 0.5,
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
            onClick={handleNewProject}
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
          )}

          {PROJECTS_DATA.map((project) => (
            <ProjectCard key={project.id} project={project} onNavigate={handleNavigate} />
          ))}
        </div>
      </div>
    </div>
  );
}