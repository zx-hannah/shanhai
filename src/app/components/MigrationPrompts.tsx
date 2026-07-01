import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Building2, Check, Clock, Info, MoveRight, Plus, X } from "lucide-react";
import { toast } from "sonner";
import type { ProjectData } from "../data/projectsData";
import { CreateSpaceDialog } from "./CreateSpaceDialog";

const COLORS = {
  primary: "#E87322",
  success: "#4AC678",
  warning: "#F5A623",
  danger: "#ff6b6b",
  bg: "#140F09",
  panel: "#1A1510",
  panelStrong: "#0D0A06",
  border: "rgba(255,255,255,0.1)",
  borderStrong: "rgba(232,115,34,0.36)",
  text: "rgba(255,255,255,0.86)",
  textMuted: "rgba(255,255,255,0.48)",
  textWeak: "rgba(255,255,255,0.34)",
};

export const LEGACY_OFFLINE_TIME = "2026.07.13 00:00";

export type MigrationTargetSpace = {
  id: string;
  name: string;
  role: string;
  letter: string;
  color: string;
};

const DEFAULT_TEAM_SPACES: MigrationTargetSpace[] = [
  { id: "ent1", name: "山海科技有限公司", role: "所有者", letter: "山", color: "#C45C1A" },
  { id: "ent2", name: "未来创意工作室", role: "成员", letter: "未", color: "#1A5CC4" },
];

export interface MigrationAnnouncementModalProps {
  onClose: () => void;
  onGoMigration: () => void;
}

export function MigrationAnnouncementModal({ onClose, onGoMigration }: MigrationAnnouncementModalProps) {
  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-5" style={{ background: "rgba(0,0,0,0.62)" }}>
      <div
        className="w-full max-w-[780px] rounded-xl overflow-hidden"
        style={{ background: "#11100E", border: `1px solid ${COLORS.border}`, boxShadow: "0 24px 80px rgba(0,0,0,0.62)" }}
      >
        <div className="flex items-center justify-between px-6 py-4" style={{ background: "#17130F", borderBottom: `1px solid ${COLORS.border}` }}>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-white">系统公告</span>
            <span className="h-4 w-px" style={{ background: "rgba(255,255,255,0.12)" }} />
            <span className="text-xs" style={{ color: COLORS.textMuted }}>团队协作新版上线通知</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5"
            title="关闭"
          >
            <X size={16} style={{ color: COLORS.textMuted }} />
          </button>
        </div>

        <div className="px-8 py-7">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded text-[11px]" style={{ color: COLORS.primary, background: "rgba(232,115,34,0.12)" }}>重要</span>
              <span className="text-xs" style={{ color: COLORS.textWeak }}>下线时间：{LEGACY_OFFLINE_TIME}</span>
            </div>
            <h2 className="text-white text-xl font-semibold leading-tight">团队协作新版已上线</h2>
            <p className="mt-4 text-sm leading-7" style={{ color: COLORS.text }}>
              团队协作新版现已上线，后续项目协作能力将统一在「团队空间」中使用。旧版团队协作将于 {LEGACY_OFFLINE_TIME} 停止服务，请在下线前完成个人空间历史项目迁移。
            </p>
          </div>

          <div className="mt-6 rounded-lg overflow-hidden" style={{ border: `1px solid ${COLORS.border}` }}>
            <div className="grid grid-cols-[128px_1fr]" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
              <div className="px-4 py-3 text-xs" style={{ color: COLORS.textMuted, background: "rgba(255,255,255,0.035)" }}>团队空间项目</div>
              <div className="px-4 py-3 text-sm leading-6" style={{ color: COLORS.text }}>
                团队空间内的项目已迁移至新版团队协作，下线前仍支持返回旧版查看。旧版切换入口将在过渡期内保留，最晚至 {LEGACY_OFFLINE_TIME}；旧版下线后，将无法再通过旧版入口访问项目协作数据。
              </div>
            </div>
            <div className="grid grid-cols-[128px_1fr]">
              <div className="px-4 py-3 text-xs" style={{ color: COLORS.textMuted, background: "rgba(255,255,255,0.035)" }}>个人空间项目</div>
              <div className="px-4 py-3 text-sm leading-6" style={{ color: COLORS.text }}>
                个人空间不再支持团队协作功能。个人空间中的旧版项目需手动选择目标团队空间进行迁移；未完成迁移的项目协作数据将不再保留，项目内生成/上传的资产将保留在个人空间资产中。
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-4" style={{ background: "#17130F", borderTop: `1px solid ${COLORS.border}` }}>
          <div className="text-xs" style={{ color: COLORS.textWeak }}>点击「我已知晓」后不再重复展示。</div>
          <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
            style={{ color: COLORS.textMuted, border: `1px solid ${COLORS.border}` }}
          >
            我已知晓
          </button>
          <button
            onClick={onGoMigration}
            className="px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-opacity hover:opacity-90"
            style={{ background: COLORS.primary, color: "white" }}
          >
            前往迁移
            <ArrowRight size={14} />
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface LegacyEntryBarProps {
  isLegacy: boolean;
  onSwitchLegacy: () => void;
  onReturnNew: () => void;
  variant?: "bar" | "inline";
}

export function LegacyEntryBar({ isLegacy, onSwitchLegacy, onReturnNew, variant = "bar" }: LegacyEntryBarProps) {
  if (variant === "inline") {
    return (
      <div className="relative inline-flex items-center gap-2 group">
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.34)" }}>
          当前{isLegacy ? "旧版" : "新版"}
        </span>
        <button
          onClick={isLegacy ? onReturnNew : onSwitchLegacy}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-opacity hover:opacity-85"
          style={{ color: isLegacy ? "#6ED48E" : "#F29A63", background: isLegacy ? "rgba(74,198,120,0.1)" : "rgba(232,115,34,0.1)", border: `1px solid ${isLegacy ? "rgba(74,198,120,0.2)" : "rgba(232,115,34,0.22)"}` }}
        >
          {isLegacy ? "切至新版" : "切至旧版本"}
        </button>
        <div
          className="absolute right-0 top-9 z-[20] w-[520px] rounded-2xl px-5 py-4 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity"
          style={{ background: "#030303", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 18px 50px rgba(0,0,0,0.48)" }}
        >
          <div className="text-base font-semibold text-white mb-2">旧版将于{LEGACY_OFFLINE_TIME}下线</div>
          <p className="text-xs leading-6" style={{ color: "rgba(255,255,255,0.72)" }}>
            {isLegacy
              ? "旧版本项目可导入新版本中，但历史对话无法使用「回到此刻」和「从此刻开始新项目」的功能，且创作效果可能有差异（新版本创建项目不受影响）。"
              : "当前项目已迁移至新版团队协作。如需核对旧版项目内容，可在过渡期内切换至旧版界面查看。旧版下线后，将无法再通过旧版入口访问项目协作数据。"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 py-4 flex-shrink-0" style={{ background: "linear-gradient(90deg, rgba(30,24,18,0.98), rgba(14,14,20,0.98))", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="relative inline-flex items-center gap-6 group">
        <span className="text-sm" style={{ color: "rgba(255,255,255,0.34)" }}>
          当前为{isLegacy ? "旧版" : "新版"}项目
        </span>
        <button
          onClick={isLegacy ? onReturnNew : onSwitchLegacy}
          className="text-base font-semibold underline underline-offset-4 transition-opacity hover:opacity-85"
          style={{ color: isLegacy ? "#6ED48E" : "#F29A63" }}
        >
          {isLegacy ? "切至新版" : "切至旧版本"}
        </button>
        <div
          className="absolute left-[184px] top-10 z-[20] w-[620px] rounded-2xl px-6 py-5 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity"
          style={{ background: "#030303", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 18px 50px rgba(0,0,0,0.48)" }}
        >
          <div className="text-lg font-semibold text-white mb-3">旧版将于{LEGACY_OFFLINE_TIME}下线</div>
          <p className="text-sm leading-7" style={{ color: "rgba(255,255,255,0.72)" }}>
            {isLegacy
              ? "旧版本项目可导入新版本中，但历史对话无法使用「回到此刻」和「从此刻开始新项目」的功能，且创作效果可能有差异（新版本创建项目不受影响）。"
              : "当前项目已迁移至新版团队协作。如需核对旧版项目内容，可在过渡期内切换至旧版界面查看。旧版下线后，将无法再通过旧版入口访问项目协作数据。"}
          </p>
        </div>
      </div>
    </div>
  );
}

export interface LegacySwitchDialogProps {
  mode: "toLegacy" | "toNew";
  onClose: () => void;
  onConfirm: () => void;
}

export function LegacySwitchDialog({ mode, onClose, onConfirm }: LegacySwitchDialogProps) {
  const isToLegacy = mode === "toLegacy";
  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-5" style={{ background: "rgba(0,0,0,0.56)" }}>
      <div
        className="w-full max-w-[560px] rounded-2xl p-6"
        style={{ background: "#050403", border: `1px solid ${COLORS.border}`, boxShadow: "0 22px 70px rgba(0,0,0,0.62)" }}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(232,115,34,0.13)" }}>
            <Info size={18} style={{ color: COLORS.primary }} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">
              {isToLegacy ? "旧版仅建议查看" : "返回新版团队协作"}
            </h3>
            <p className="mt-3 text-sm leading-6" style={{ color: COLORS.textMuted }}>
              {isToLegacy
                ? `旧版仅建议用于查看和核对历史内容。继续编辑或生成可能导致数据不同步；旧版将于 ${LEGACY_OFFLINE_TIME} 下线，后续请优先回到新版完成生成操作。`
                : `当前为旧版团队协作界面。团队空间中的项目已迁移至新版团队协作，建议返回新版继续查看与协作。旧版入口仅在过渡期内保留，最晚至 ${LEGACY_OFFLINE_TIME}。旧版下线后，将无法再切回旧版项目界面。`}
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm hover:bg-white/5"
            style={{ color: COLORS.textMuted, border: `1px solid ${COLORS.border}` }}
          >
            {isToLegacy ? "我知道了" : "取消"}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm hover:opacity-90"
            style={{ background: COLORS.primary, color: "white" }}
          >
            {isToLegacy ? "返回新版生成" : "返回新版"}
          </button>
        </div>
      </div>
    </div>
  );
}

export interface LegacyVersionNoticeProps {
  onReturnNew: () => void;
}

export function LegacyVersionNotice({ onReturnNew }: LegacyVersionNoticeProps) {
  return (
    <div className="px-5 pt-4 pb-3" style={{ background: "linear-gradient(90deg, rgba(32,24,16,0.96), rgba(15,14,20,0.98))" }}>
      <button
        onClick={onReturnNew}
        className="mb-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
        style={{ color: "#F29A63", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.13)" }}
      >
        <Info size={16} />
        切至新版
      </button>
      <div
        className="max-w-[840px] rounded-2xl px-6 py-5"
        style={{ background: "#030303", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 18px 50px rgba(0,0,0,0.46)" }}
      >
        <div className="text-lg font-semibold text-white mb-3">旧版将于{LEGACY_OFFLINE_TIME}下线</div>
        <p className="text-sm leading-7" style={{ color: "rgba(255,255,255,0.72)" }}>
          当前为旧版团队协作界面。团队空间中的项目已迁移至新版团队协作，建议返回新版继续查看与协作。
          旧版入口仅在过渡期内保留，旧版下线后，将无法再切回旧版项目界面。
        </p>
      </div>
    </div>
  );
}

export interface PersonalMigrationBannerProps {
  onStartMigration: () => void;
}

export function PersonalMigrationBanner({ onStartMigration }: PersonalMigrationBannerProps) {
  return (
    <div
      className="rounded-2xl p-5 mb-6"
      style={{ background: "linear-gradient(135deg, rgba(245,166,35,0.13), rgba(232,115,34,0.06))", border: "1px solid rgba(245,166,35,0.26)" }}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(245,166,35,0.14)" }}>
          <AlertTriangle size={19} style={{ color: COLORS.warning }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white text-base font-semibold">个人空间旧版项目即将下线</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ color: COLORS.warning, background: "rgba(245,166,35,0.14)" }}>
              即将下线
            </span>
          </div>
          <p className="text-sm leading-6" style={{ color: COLORS.textMuted }}>
            个人空间不再支持团队协作功能。请在 {LEGACY_OFFLINE_TIME} 前，将需要保留协作数据的旧版项目迁移至团队空间；未完成迁移的项目协作数据将不再保留，项目内生成/上传的资产将保留在个人空间资产中。
          </p>
        </div>
        <button
          onClick={onStartMigration}
          className="px-4 py-2 rounded-lg text-sm flex items-center gap-2 flex-shrink-0 hover:opacity-90"
          style={{ background: COLORS.primary, color: "white" }}
        >
          批量迁移
          <MoveRight size={14} />
        </button>
      </div>
    </div>
  );
}

export interface PersonalProjectMigrationDialogProps {
  projects: ProjectData[];
  migratedIds: string[];
  initialProjectIds?: string[];
  teamSpaces?: MigrationTargetSpace[];
  onClose: () => void;
  onComplete: (projectIds: string[]) => void;
}

export function PersonalProjectMigrationDialog({
  projects,
  migratedIds,
  initialProjectIds,
  teamSpaces = DEFAULT_TEAM_SPACES,
  onClose,
  onComplete,
}: PersonalProjectMigrationDialogProps) {
  const availableProjects = useMemo(() => projects.filter(project => !migratedIds.includes(project.id)), [migratedIds, projects]);
  const initialSelection = initialProjectIds?.filter(id => !migratedIds.includes(id)) ?? availableProjects.slice(0, 2).map(project => project.id);
  const [step, setStep] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelection);
  const [targetSpaceId, setTargetSpaceId] = useState<string | null>(teamSpaces[0]?.id ?? null);
  const [showCreateSpaceDialog, setShowCreateSpaceDialog] = useState(false);

  const selectedProjects = projects.filter(project => selectedIds.includes(project.id));
  const targetSpace = teamSpaces.find(space => space.id === targetSpaceId) ?? null;
  const canNext = step === 1 ? selectedIds.length > 0 : step === 2 ? Boolean(targetSpace) : true;

  const toggleProject = (projectId: string) => {
    setSelectedIds(prev => prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]);
  };

  const completeMigration = () => {
    if (!targetSpace) {
      toast.error("请先新建或选择团队空间");
      return;
    }

    onComplete(selectedIds);
    toast.success(`已提交 ${selectedIds.length} 个旧版项目迁移至${targetSpace.name}`);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-[230] flex items-center justify-center p-5" style={{ background: "rgba(0,0,0,0.62)" }}>
        <div
          className="w-full max-w-[860px] max-h-[88vh] overflow-hidden rounded-2xl flex flex-col"
          style={{ background: "#0B0806", border: `1px solid ${COLORS.border}`, boxShadow: "0 24px 80px rgba(0,0,0,0.62)" }}
        >
          <div className="px-6 py-5 flex items-start gap-4" style={{ borderBottom: `1px solid ${COLORS.border}` }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(232,115,34,0.13)" }}>
              <MoveRight size={19} style={{ color: COLORS.primary }} />
            </div>
            <div className="flex-1">
              <h3 className="text-white text-lg font-semibold">个人空间旧版项目迁移</h3>
              <p className="text-sm mt-1" style={{ color: COLORS.textMuted }}>
                请选择需要保留协作数据的旧版项目，并迁移至目标团队空间。
              </p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5" title="关闭">
              <X size={16} style={{ color: COLORS.textMuted }} />
            </button>
          </div>

          <div className="px-6 pt-5">
            <div className="grid grid-cols-3 gap-3">
              {["选择项目", "选择团队空间", "确认迁移"].map((label, index) => {
                const current = index + 1;
                const active = step === current;
                const done = step > current;
                return (
                  <div
                    key={label}
                    className="rounded-xl px-3 py-2 flex items-center gap-2"
                    style={{ background: active ? "rgba(232,115,34,0.13)" : "rgba(255,255,255,0.035)", border: active ? `1px solid ${COLORS.borderStrong}` : `1px solid ${COLORS.border}` }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                      style={{ background: done ? COLORS.success : active ? COLORS.primary : "rgba(255,255,255,0.08)", color: done || active ? "white" : COLORS.textMuted }}
                    >
                      {done ? <Check size={13} /> : current}
                    </div>
                    <span className="text-sm" style={{ color: active ? "white" : COLORS.textMuted }}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-auto px-6 py-5">
            {step === 1 && (
              <div className="space-y-3">
                {availableProjects.map(project => {
                  const selected = selectedIds.includes(project.id);
                  return (
                    <button
                      key={project.id}
                      onClick={() => toggleProject(project.id)}
                      className="w-full rounded-xl p-3 flex items-center gap-3 text-left transition-colors hover:bg-white/5"
                      style={{ background: selected ? "rgba(232,115,34,0.1)" : "rgba(255,255,255,0.035)", border: selected ? `1px solid ${COLORS.borderStrong}` : `1px solid ${COLORS.border}` }}
                    >
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                        style={{ background: selected ? COLORS.primary : "rgba(255,255,255,0.06)", border: selected ? "none" : `1px solid ${COLORS.border}` }}
                      >
                        {selected && <Check size={13} color="white" />}
                      </div>
                      <img src={project.cover} alt={project.name} className="w-16 h-12 object-cover rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">{project.name}</div>
                        <div className="flex items-center gap-4 mt-1 text-xs" style={{ color: COLORS.textMuted }}>
                          <span className="flex items-center gap-1"><Clock size={11} />{project.lastEdit}</span>
                          <span>{project.members.length} 位成员</span>
                          <span>{project.totalAssets} 个资产</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ color: COLORS.warning, background: "rgba(245,166,35,0.14)" }}>
                        待迁移
                      </span>
                    </button>
                  );
                })}
                {availableProjects.length === 0 && (
                  <div className="py-12 text-center text-sm" style={{ color: COLORS.textMuted }}>个人空间旧版项目已全部完成迁移</div>
                )}
              </div>
            )}

            {step === 2 && (
              teamSpaces.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {teamSpaces.map(space => {
                    const selected = targetSpaceId === space.id;
                    return (
                      <button
                        key={space.id}
                        onClick={() => setTargetSpaceId(space.id)}
                        className="rounded-2xl p-5 text-left transition-colors hover:bg-white/5"
                        style={{ background: selected ? "rgba(232,115,34,0.1)" : "rgba(255,255,255,0.035)", border: selected ? `1px solid ${COLORS.borderStrong}` : `1px solid ${COLORS.border}` }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold" style={{ background: space.color }}>{space.letter}</div>
                          <div>
                            <div className="text-white text-sm font-medium">{space.name}</div>
                            <div className="text-xs mt-1" style={{ color: COLORS.textMuted }}>{space.role}</div>
                          </div>
                        </div>
                        <div className="mt-4 text-xs leading-5" style={{ color: COLORS.textMuted }}>
                          迁移后，所选项目将在该团队空间的新版团队协作中继续查看与协作。
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div
                  className="min-h-[280px] rounded-2xl px-6 py-10 flex flex-col items-center justify-center text-center"
                  style={{ background: "rgba(255,255,255,0.035)", border: `1px dashed ${COLORS.borderStrong}` }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "rgba(232,115,34,0.12)", border: `1px solid ${COLORS.borderStrong}` }}
                  >
                    <Building2 size={24} style={{ color: COLORS.primary }} />
                  </div>
                  <h4 className="text-white text-base font-semibold">暂无可选择的团队空间</h4>
                  <p className="mt-2 max-w-[420px] text-sm leading-6" style={{ color: COLORS.textMuted }}>
                    个人空间旧版项目需要迁移至团队空间后才能继续协作。请先新建团队空间，再返回选择目标空间完成迁移。
                  </p>
                  <button
                    onClick={() => setShowCreateSpaceDialog(true)}
                    className="mt-5 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 hover:opacity-90"
                    style={{ background: COLORS.primary, color: "white" }}
                  >
                    <Plus size={15} />
                    新建团队空间
                  </button>
                </div>
              )
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.035)", border: `1px solid ${COLORS.border}` }}>
                  <div className="text-sm text-white font-medium mb-2">确认迁移</div>
                  <p className="text-sm leading-6 mb-4" style={{ color: COLORS.textMuted }}>
                    请确认将所选个人空间旧版项目迁移至目标团队空间。迁移完成后，项目将在团队空间的新版团队协作中继续使用。
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs mb-1" style={{ color: COLORS.textWeak }}>迁移项目</div>
                      <div className="text-white">{selectedProjects.length} 个旧版项目</div>
                    </div>
                    <div>
                      <div className="text-xs mb-1" style={{ color: COLORS.textWeak }}>目标团队空间</div>
                      <div className="text-white">{targetSpace?.name ?? "未选择"}</div>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl p-5" style={{ background: "rgba(245,166,35,0.1)", border: "1px solid rgba(245,166,35,0.28)" }}>
                  <div className="flex items-center gap-2 text-sm text-white font-medium mb-2">
                    <AlertTriangle size={16} style={{ color: COLORS.warning }} />
                    操作确认
                  </div>
                  <p className="text-sm leading-6" style={{ color: COLORS.textMuted }}>
                    迁移操作提交后不可撤销，请确认目标团队空间选择无误。
                  </p>
                  <p className="text-sm leading-6 mt-2" style={{ color: COLORS.textMuted }}>
                    迁移完成后，项目协作数据将迁移至目标团队空间；项目内生成/上传的资产也将同步迁移至该团队空间。个人空间将不再保留该旧版项目入口。
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-5 flex items-center justify-between" style={{ borderTop: `1px solid ${COLORS.border}` }}>
            <button
              onClick={() => step === 1 ? onClose() : setStep(step - 1)}
              className="px-4 py-2 rounded-lg text-sm hover:bg-white/5"
              style={{ color: COLORS.textMuted, border: `1px solid ${COLORS.border}` }}
            >
              {step === 1 ? "取消" : "上一步"}
            </button>
            <button
              disabled={!canNext}
              onClick={() => step === 3 ? completeMigration() : setStep(step + 1)}
              className="px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-40"
              style={{ background: COLORS.primary, color: "white" }}
            >
              {step === 3 ? "确认迁移" : "下一步"}
              {step < 3 && <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>

      {showCreateSpaceDialog && (
        <CreateSpaceDialog onClose={() => setShowCreateSpaceDialog(false)} />
      )}
    </>
  );
}
