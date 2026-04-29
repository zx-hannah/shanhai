import { useState } from "react";
import { FolderOpen, Users, Calendar, ChevronDown, X, Check, Plus, Trash2, Edit2, Search, Shield, Settings, Coins, Info } from "lucide-react";
import { toast } from "sonner";
import { PROJECTS_DATA } from "../../data/projectsData";

type ProjectPermission = "管理" | "编辑" | "阅读";

interface ProjectMember {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
  letter: string;
  projectPermission?: ProjectPermission;
}

interface ManagedProject {
  id: string;
  name: string;
  status: string;
  members: ProjectMember[];
  createdAt: string;
}

const ALL_ENTERPRISE_MEMBERS: ProjectMember[] = [
  { id: "1", name: "Bob", role: "所有者", avatarColor: "#E87322", letter: "B" },
  { id: "2", name: "Alice", role: "管理员", avatarColor: "#7B3FC4", letter: "A" },
  { id: "3", name: "Charlie", role: "普通成员", avatarColor: "#2A6FC4", letter: "C" },
  { id: "4", name: "Diana", role: "普通成员", avatarColor: "#C42A6F", letter: "D" },
  { id: "5", name: "Eve", role: "普通成员", avatarColor: "#2AC4A2", letter: "E" },
];

const STATUS_COLORS: Record<string, string> = {
  "进行中": "#E87322",
  "已完成": "#22c55e",
  "暂停": "#94a3b8",
};

const INITIAL_PROJECTS: ManagedProject[] = PROJECTS_DATA.map((p, i) => ({
  id: p.id,
  name: p.name,
  status: p.status,
  members: ALL_ENTERPRISE_MEMBERS.slice(0, [4, 3, 3, 2, 3][i] ?? 2),
  createdAt: p.startDate,
}));

// ── Edit Members Dialog ──────────────────────────────────────────────────────
const PERMISSION_OPTIONS: { key: ProjectPermission; label: string; desc: string; color: string }[] = [
  { key: "管理", label: "管理", desc: "可管理项目成员及设置", color: "#E87322" },
  { key: "编辑", label: "编辑", desc: "可编辑项目内容", color: "#7B3FC4" },
  { key: "阅读", label: "阅读", desc: "只读权限", color: "#2A6FC4" },
];

function EditMembersDialog({
  project,
  onClose,
  onSave,
}: {
  project: ManagedProject;
  onClose: () => void;
  onSave: (members: ProjectMember[]) => void;
}) {
  const [members, setMembers] = useState<ProjectMember[]>(
    project.members.map((m) => ({ ...m, projectPermission: m.projectPermission ?? "编辑" }))
  );
  const [search, setSearch] = useState("");
  const [permDropdownId, setPermDropdownId] = useState<string | null>(null);

  const memberIds = new Set(members.map((m) => m.id));
  const available = ALL_ENTERPRISE_MEMBERS.filter(
    (m) => !memberIds.has(m.id) && m.name.toLowerCase().includes(search.toLowerCase())
  );

  const addMember = (m: ProjectMember) => {
    setMembers((prev) => [...prev, { ...m, projectPermission: "编辑" }]);
    setSearch("");
  };

  const removeMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const setPermission = (id: string, perm: ProjectPermission) => {
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, projectPermission: perm } : m));
    setPermDropdownId(null);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={() => setPermDropdownId(null)}
    >
      <div
        className="w-[520px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div>
            <h3 className="text-white">编辑项目成员</h3>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
              {project.name}
            </p>
          </div>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.4)" }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Current Members */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                当前成员（{members.length} 人）
              </div>
              <div className="flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                <Shield size={10} />
                <span>项目权限</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 max-h-48 overflow-auto">
              {members.map((m) => {
                const perm = m.projectPermission ?? "编辑";
                const permInfo = PERMISSION_OPTIONS.find((p) => p.key === perm)!;
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                        style={{ background: m.avatarColor }}
                      >
                        {m.letter}
                      </div>
                      <div>
                        <div className="text-sm text-white">{m.name}</div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                          {m.role}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Permission selector */}
                      <div className="relative">
                        <button
                          onClick={() => setPermDropdownId(permDropdownId === m.id ? null : m.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors"
                          style={{
                            background: `${permInfo.color}18`,
                            color: permInfo.color,
                            border: `1px solid ${permInfo.color}30`,
                          }}
                        >
                          <Shield size={10} />
                          {perm}
                          <ChevronDown size={9} />
                        </button>
                        {permDropdownId === m.id && (
                          <div
                            className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-30 shadow-2xl"
                            style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)", minWidth: "160px" }}
                          >
                            {PERMISSION_OPTIONS.map((opt) => (
                              <button
                                key={opt.key}
                                onClick={() => setPermission(m.id, opt.key)}
                                className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                              >
                                <div className="w-4 h-4 rounded flex items-center justify-center mt-0.5 flex-shrink-0"
                                  style={{ background: perm === opt.key ? opt.color : "transparent", border: `1px solid ${perm === opt.key ? opt.color : "rgba(255,255,255,0.2)"}` }}>
                                  {perm === opt.key && <Check size={9} className="text-white" />}
                                </div>
                                <div>
                                  <div className="text-xs" style={{ color: perm === opt.key ? opt.color : "rgba(255,255,255,0.7)" }}>{opt.label}</div>
                                  <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px" }}>{opt.desc}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeMember(m.id)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-red-900/20"
                        style={{ color: "rgba(239,68,68,0.6)" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Members */}
          <div>
            <div className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
              添加成员
            </div>
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl mb-2"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <Search size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
              <input
                className="bg-transparent text-xs flex-1 outline-none text-white"
                placeholder="搜索团队成员..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ caretColor: "#E87322" }}
              />
            </div>
            {available.length === 0 ? (
              <div className="text-xs text-center py-3" style={{ color: "rgba(255,255,255,0.25)" }}>
                {search ? "未找到匹配成员" : "所有成员已加入"}
              </div>
            ) : (
              <div className="flex flex-col gap-1 max-h-32 overflow-auto">
                {available.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => addMember(m)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors hover:bg-white/5"
                    style={{ border: "1px solid transparent" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                        style={{ background: m.avatarColor }}
                      >
                        {m.letter}
                      </div>
                      <div>
                        <div className="text-sm text-white">{m.name}</div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{m.role}</div>
                      </div>
                    </div>
                    <div
                      className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                      style={{ color: "#E87322", background: "rgba(232,115,34,0.1)" }}
                    >
                      <Plus size={10} /> 添加
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
            >
              取消
            </button>
            <button
              onClick={() => { onSave(members); onClose(); toast.success("项目成员已更新"); }}
              className="flex-1 py-2.5 rounded-xl text-sm text-white transition-opacity hover:opacity-80"
              style={{ background: "#E87322" }}
            >
              保存
            </button>
          </div>
          <p className="text-center" style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>
            权限说明：管理 &gt; 编辑 &gt; 阅读，管理员可修改项目设置及成员权限
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Simple Project Quota Dialog ──────────────────────────────────────────────
function SimpleProjectQuotaDialog({
  title,
  subtitle,
  description,
  currentQuota,
  consumed,
  onClose,
  onSave,
}: {
  title: string;
  subtitle?: string;
  description?: string;
  currentQuota: number;
  consumed?: number; // undefined = no min validation
  onClose: () => void;
  onSave: (quota: number) => void;
}) {
  const [quota, setQuota] = useState(currentQuota.toString());

  const handleSave = () => {
    const n = parseInt(quota);
    if (isNaN(n) || n <= 0) {
      toast.error("请输入有效的配额数量");
      return;
    }
    if (consumed !== undefined && n < consumed) {
      toast.error(`配额不能小于当前已消耗数量（${consumed.toLocaleString()} 颗）`);
      return;
    }
    onSave(n);
  };

  const quotaNum = parseInt(quota) || 0;
  const isValid = quotaNum > 0 && (consumed === undefined || quotaNum >= consumed);

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-[420px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div>
            <h3 className="text-white">{title}</h3>
            {subtitle && (
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{subtitle}</p>
            )}
          </div>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.4)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-5">
          {/* Description */}
          {description && (
            <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-xs" style={{ background: "rgba(74,158,224,0.06)", border: "1px solid rgba(74,158,224,0.15)", color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>
              <Info size={13} style={{ color: "#4A9EE0", flexShrink: 0, marginTop: 1 }} />
              {description}
            </div>
          )}

          {/* Consumed info (for edit quota) */}
          {consumed !== undefined && (
            <div className="flex items-center justify-between px-3.5 py-3 rounded-xl text-sm" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>当前已消耗</span>
              <span style={{ color: "#E87322" }}>{consumed.toLocaleString()} 颗</span>
            </div>
          )}

          {/* Quota input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                配额数量（颗）<span className="text-red-400 ml-0.5">*</span>
              </label>
              {consumed !== undefined && (
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                  最小值 ≥ {consumed.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${!isValid && quota ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}` }}>
              <input
                type="number"
                min={consumed ?? 1}
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                className="flex-1 bg-transparent outline-none text-white text-sm"
                placeholder="请输入配额数量"
                autoFocus
                onFocus={(e) => { (e.target as HTMLInputElement).parentElement!.style.borderColor = "#E87322"; }}
                onBlur={(e) => { (e.target as HTMLInputElement).parentElement!.style.borderColor = !isValid && quota ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"; }}
              />
              <span className="text-xs flex-shrink-0" style={{ color: "rgba(255,255,255,0.35)" }}>颗生产栗</span>
            </div>
            {!isValid && quota && consumed !== undefined && quotaNum > 0 && (
              <p className="text-xs mt-1.5" style={{ color: "#ef4444" }}>
                配额不能小于已消耗数量（{consumed.toLocaleString()} 颗）
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 rounded-xl text-sm text-white transition-opacity hover:opacity-80"
              style={{ background: "#E87322" }}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function ProjectManagement() {
  const [projects, setProjects] = useState<ManagedProject[]>(INITIAL_PROJECTS);
  const [editTarget, setEditTarget] = useState<ManagedProject | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showDefaultQuotaDialog, setShowDefaultQuotaDialog] = useState(false);
  const [editQuotaProjectId, setEditQuotaProjectId] = useState<string | null>(null);
  const [defaultQuota, setDefaultQuota] = useState(50000);
  const [projectQuotas, setProjectQuotas] = useState<Record<string, number>>(() =>
    Object.fromEntries(PROJECTS_DATA.map((p) => [p.id, 50000]))
  );
  const [statusDropdownId, setStatusDropdownId] = useState<string | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<{ projectId: string; newStatus: string } | null>(null);
  const [allowMemberCreate, setAllowMemberCreate] = useState(false);

  const STATUS_OPTIONS = [
    { value: "进行中", color: "#E87322" },
    { value: "已完成", color: "#22c55e" },
    { value: "暂停",   color: "#94a3b8" },
  ];

  const STATUS_CONFIRM_CFG: Record<string, { title: string; body: string; btnLabel: string; btnColor: string }> = {
    "暂停":   { title: "确认暂停项目", body: "该操作将停用项目并冻结全部生产栗额度，项目内所有内容生产活动将暂停。请确认是否继续", btnLabel: "确认暂停", btnColor: "#94a3b8" },
    "已完成": { title: "标记为已完成", body: "该操作将回收项目未消耗的生产栗额度至团队账户，项目剩余额度将同步清零。请确认是否标记为完成", btnLabel: "确认完成", btnColor: "#22c55e" },
  };

  const handleStatusSelect = (projectId: string, newStatus: string) => {
    setStatusDropdownId(null);
    if (STATUS_CONFIRM_CFG[newStatus]) {
      setConfirmStatus({ projectId, newStatus });
    } else {
      setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, status: newStatus } : p));
      toast.success("项目状态已更新");
    }
  };

  const handleSaveMembers = (projectId: string, members: ProjectMember[]) => {
    setProjects((prev) => prev.map((p) => p.id === projectId ? { ...p, members } : p));
  };

  return (
    <div onClick={() => setStatusDropdownId(null)}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white">项目管理</h3>
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
        >
          {projects.length} 个项目
        </span>
      </div>

      {/* Default Quota Banner — prominent */}
     <div
        className="rounded-2xl mb-5 overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(123,63,196,0.18) 0%, rgba(74,158,224,0.12) 100%)", border: "1px solid rgba(123,63,196,0.3)" }}
      >
        {/* Toggle row */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(123,63,196,0.2)" }}>
              <Settings size={16} style={{ color: "#7B3FC4" }} />
            </div>
            <div>
              <div className="text-sm text-white">允许团队成员新建项目</div>
              <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
开启后，普通成员将拥有创建项目的权限，且新建项目会自动分配默认配额。
              </div>
            </div>
          </div>
          {/* Toggle switch */}
          <button
            onClick={() => setAllowMemberCreate((v) => !v)}
            className="relative flex-shrink-0 transition-all duration-200"
            style={{ width: "44px", height: "24px" }}
          >
            <div
              className="w-full h-full rounded-full transition-colors duration-200"
              style={{ background: allowMemberCreate ? "#7B3FC4" : "rgba(255,255,255,0.12)", border: `1px solid ${allowMemberCreate ? "#7B3FC4" : "rgba(255,255,255,0.2)"}` }}
            />
            <div
              className="absolute top-0.5 rounded-full transition-all duration-200"
              style={{
                width: "20px",
                height: "20px",
                background: "white",
                left: allowMemberCreate ? "22px" : "2px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
              }}
            />
          </button>
        </div>

        {/* Default quota row — only visible when toggle is on */}
        {allowMemberCreate && (
          <div
            className="flex items-center justify-between px-5 py-3.5 cursor-pointer transition-opacity hover:opacity-90"
            style={{ borderTop: "1px solid rgba(123,63,196,0.2)", background: "rgba(123,63,196,0.06)" }}
            onClick={() => setShowDefaultQuotaDialog(true)}
          >
            <div className="flex items-center gap-2" style={{ color: "rgba(255,255,255,0.55)" }}>
              <Coins size={13} />
              <span className="text-xs">项目默认配额</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="text-right">
                <div className="text-white" style={{ fontSize: "14px" }}>
                  {defaultQuota.toLocaleString()} <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>颗</span>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-lg text-xs" style={{ background: "rgba(123,63,196,0.25)", color: "#A97CF0", border: "1px solid rgba(123,63,196,0.35)" }}>
                修改
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table Header */}
      <div
        className="grid text-xs px-4 py-3 rounded-t-xl"
        style={{
          gridTemplateColumns: "2.2fr 1fr 1.4fr 1.5fr 1.2fr 1.3fr",
          background: "rgba(255,255,255,0.04)",
          color: "rgba(255,255,255,0.4)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderBottom: "none",
        }}
      >
        <div>项目名称</div>
        <div>状态</div>
        <div>项目成员</div>
        <div>消耗/总额</div>
        <div>创建时间</div>
        <div>操作</div>
      </div>

      {/* Table Rows */}
      <div
        className="rounded-b-xl overflow-hidden"
        style={{ border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {projects.map((project, idx) => (
          <div key={project.id}>
            {/* Main Row */}
            <div
              className="grid items-center px-4 py-3 text-sm"
              style={{
                gridTemplateColumns: "2.2fr 1fr 1.4fr 1.5fr 1.2fr 1.3fr",
                background: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
                borderBottom: expandedId === project.id ? "none" : "1px solid rgba(255,255,255,0.04)",
              }}
            >
              {/* Project Name */}
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0"
                >
                  <img
                    src={PROJECTS_DATA.find((p) => p.id === project.id)?.cover}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-white">{project.name}</div>
                  
                </div>
              </div>

              {/* Status */}
              <div>
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setStatusDropdownId(statusDropdownId === project.id ? null : project.id)}
                    className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      background: `${STATUS_COLORS[project.status] ?? "rgba(255,255,255,0.1)"}18`,
                      color: STATUS_COLORS[project.status] ?? "rgba(255,255,255,0.5)",
                      border: `1px solid ${STATUS_COLORS[project.status] ?? "rgba(255,255,255,0.1)"}35`,
                    }}
                  >
                    {project.status}
                    <ChevronDown size={9} />
                  </button>
                  {statusDropdownId === project.id && (
                    <div
                      className="absolute left-0 top-full mt-1 rounded-xl overflow-hidden z-30 shadow-2xl"
                      style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.12)", minWidth: "110px" }}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleStatusSelect(project.id, opt.value)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: opt.color }}
                          />
                          <span className="text-xs" style={{ color: project.status === opt.value ? opt.color : "rgba(255,255,255,0.7)" }}>
                            {opt.value}
                          </span>
                          {project.status === opt.value && <Check size={10} className="ml-auto" style={{ color: opt.color }} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Members */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center">
                  {project.members.slice(0, 4).map((m, mi) => (
                    <div
                      key={m.id}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white flex-shrink-0"
                      style={{
                        background: m.avatarColor,
                        fontSize: "9px",
                        fontWeight: "600",
                        marginLeft: mi > 0 ? "-6px" : "0",
                        border: "1.5px solid #1E1A14",
                        zIndex: 10 - mi,
                        position: "relative",
                      }}
                      title={m.name}
                    >
                      {m.letter}
                    </div>
                  ))}
                  {project.members.length > 4 && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(255,255,255,0.1)",
                        fontSize: "9px",
                        color: "rgba(255,255,255,0.5)",
                        marginLeft: "-6px",
                        border: "1.5px solid #1E1A14",
                        position: "relative",
                        zIndex: 6,
                      }}
                    >
                      +{project.members.length - 4}
                    </div>
                  )}
                </div>
                <span className="text-xs ml-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {project.members.length} 人
                </span>
              </div>

              {/* Project Quota — 消耗/配额 */}
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1">
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)" }}>
                    {(PROJECTS_DATA.find((p) => p.id === project.id)?.tokenUsed ?? 0).toLocaleString()}
                  </span>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                    / {(projectQuotas[project.id] ?? 50000).toLocaleString()}
                  </span>
                </div>
                <div className="w-full rounded-full overflow-hidden" style={{ height: "3px", background: "rgba(255,255,255,0.08)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, ((PROJECTS_DATA.find((p) => p.id === project.id)?.tokenUsed ?? 0) / (projectQuotas[project.id] ?? 50000)) * 100)}%`,
                      background: "linear-gradient(90deg,#E87322,#F5A623)",
                    }}
                  />
                </div>
              </div>

              {/* Created At */}
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                {project.createdAt}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditTarget(project)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
                  style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; }}
                >
                  <Edit2 size={11} />编辑成员
                </button>
                <button
                  onClick={() => setEditQuotaProjectId(project.id)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors"
                  style={{ background: "rgba(74,158,224,0.1)", color: "#4A9EE0", border: "1px solid rgba(74,158,224,0.2)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(74,158,224,0.18)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(74,158,224,0.1)"; }}
                >
                  <Coins size={11} />修改配额
                </button>
              </div>
            </div>

            {/* Expanded Members Detail */}
            {expandedId === project.id && (
              <div
                className="px-6 pb-4"
                style={{
                  background: idx % 2 === 0 ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.025)",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                }}
              >
                <div className="text-xs mb-3 pt-3" style={{ color: "rgba(255,255,255,0.35)" }}>
                  项目成员详情
                </div>
                <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                  {project.members.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                        style={{ background: m.avatarColor }}
                      >
                        {m.letter}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">{m.name}</div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{m.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Members Dialog */}
      {editTarget && (
        <EditMembersDialog
          project={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={(members) => handleSaveMembers(editTarget.id, members)}
        />
      )}

      {/* Default Quota Config Dialog */}
      {showDefaultQuotaDialog && (
        <SimpleProjectQuotaDialog
          title="新建项目默认配额"
          subtitle="设置新建项目时的初始生产栗配额"
          description="团队普通成员创建新项目时将自动分配该数量的生产栗作为初始配额，团队管理员可后续根据需要手动调整单个项目配额。"
          currentQuota={defaultQuota}
          onClose={() => setShowDefaultQuotaDialog(false)}
          onSave={(quota) => {
            setDefaultQuota(quota);
            toast.success(`默认配额已更新为 ${quota.toLocaleString()} 颗`);
            setShowDefaultQuotaDialog(false);
          }}
        />
      )}

      {/* Edit Project Quota Dialog */}
      {editQuotaProjectId && (() => {
        const proj = projects.find((p) => p.id === editQuotaProjectId);
        const consumed = PROJECTS_DATA.find((p) => p.id === editQuotaProjectId)?.tokenUsed ?? 0;
        return (
          <SimpleProjectQuotaDialog
            title="修改项目配额"
            subtitle={proj?.name}
            currentQuota={projectQuotas[editQuotaProjectId] ?? 50000}
            consumed={consumed}
            onClose={() => setEditQuotaProjectId(null)}
            onSave={(quota) => {
              setProjectQuotas((prev) => ({ ...prev, [editQuotaProjectId]: quota }));
              toast.success(`「${proj?.name}」配额已更新为 ${quota.toLocaleString()} 颗`);
              setEditQuotaProjectId(null);
            }}
          />
        );
      })()}

      {/* Status Confirmation Dialog */}
      {confirmStatus && (() => {
        const proj = projects.find((p) => p.id === confirmStatus.projectId);
        const cfg = STATUS_CONFIRM_CFG[confirmStatus.newStatus];
        return (
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.85)" }}
            onClick={(e) => e.target === e.currentTarget && setConfirmStatus(null)}
          >
            <div
              className="w-[420px] rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div>
                  <h3 className="text-white">{cfg.title}</h3>
                </div>
                <button onClick={() => setConfirmStatus(null)} style={{ color: "rgba(255,255,255,0.4)" }}>
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col gap-5">
                {/* Description */}
                {cfg.body && (
                  <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl text-xs" style={{ background: "rgba(74,158,224,0.06)", border: "1px solid rgba(74,158,224,0.15)", color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>
                    <Info size={13} style={{ color: "#4A9EE0", flexShrink: 0, marginTop: 1 }} />
                    {cfg.body}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmStatus(null)}
                    className="flex-1 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-80"
                    style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      setProjects((prev) => prev.map((p) => p.id === confirmStatus.projectId ? { ...p, status: confirmStatus.newStatus } : p));
                      toast.success("项目状态已更新");
                      setConfirmStatus(null);
                    }}
                    className="flex-1 py-2.5 rounded-xl text-sm text-white transition-opacity hover:opacity-80"
                    style={{ background: cfg.btnColor }}
                  >
                    {cfg.btnLabel}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}