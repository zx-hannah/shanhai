import { useState } from "react";
import {
  ArrowRightLeft,
  CheckCircle2,
  KeyRound,
  ShieldQuestion,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

type AccessCaseId = "switch-view" | "switch-apply" | "join-team" | "apply-project";

interface AccessCase {
  id: AccessCaseId;
  number: string;
  title: string;
  condition: string;
  currentTeam: string;
  projectTeam: string;
  projectName: string;
  accountName: string;
  accountRole: string;
  notice: string;
  panelTitle: string;
  primaryAction: string;
  icon: LucideIcon;
}

const ACCESS_CASES: AccessCase[] = [
  {
    id: "switch-view",
    number: "1",
    title: "切换空间并查看",
    condition: "当前不在项目所在团队 · 有团队 · 在项目成员中",
    currentTeam: "快乐阳光",
    projectTeam: "芒果灵创",
    projectName: "山海奇谭 · 第一季",
    accountName: "芒果灵创",
    accountRole: "可访问",
    notice: "可切换到项目所在团队后直接访问。",
    panelTitle: "切换账号直接访问",
    primaryAction: "切换并访问",
    icon: ArrowRightLeft,
  },
  {
    id: "switch-apply",
    number: "2",
    title: "切换空间并申请项目权限",
    condition: "当前不在项目所在团队 · 有团队 · 不在项目成员中",
    currentTeam: "快乐阳光",
    projectTeam: "芒果灵创",
    projectName: "山海奇谭 · 第一季",
    accountName: "芒果灵创",
    accountRole: "需申请",
    notice: "可切换到项目所在团队后申请项目权限。",
    panelTitle: "切换团队后申请项目权限",
    primaryAction: "切换并申请权限",
    icon: ShieldQuestion,
  },
  {
    id: "join-team",
    number: "3",
    title: "申请加入团队",
    condition: "当前不在项目所在团队 · 没有团队 · 不在项目成员中",
    currentTeam: "快乐阳光",
    projectTeam: "芒果灵创",
    projectName: "山海奇谭 · 第一季",
    accountName: "芒果灵创",
    accountRole: "未加入",
    notice: "审批通过后再申请项目权限。",
    panelTitle: "申请加入项目所在团队",
    primaryAction: "申请加入团队",
    icon: UserPlus,
  },
  {
    id: "apply-project",
    number: "4",
    title: "申请项目权限",
    condition: "当前在项目所在团队 · 不在项目成员中",
    currentTeam: "芒果灵创",
    projectTeam: "芒果灵创",
    projectName: "山海奇谭 · 第一季",
    accountName: "芒果灵创",
    accountRole: "需申请",
    notice: "你还不是该项目成员，可以直接申请项目权限。",
    panelTitle: "申请项目访问权限",
    primaryAction: "申请项目权限",
    icon: KeyRound,
  },
];

function CaseTabs({
  activeId,
  onChange,
}: {
  activeId: AccessCaseId;
  onChange: (id: AccessCaseId) => void;
}) {
  return (
    <div
      className="mx-auto grid w-full max-w-[860px] grid-cols-2 gap-1.5 rounded-xl p-1.5 md:grid-cols-4"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {ACCESS_CASES.map((item) => {
        const active = item.id === activeId;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className="flex h-9 items-center justify-center gap-1.5 rounded-lg px-2 text-center transition-all"
            style={{
              background: active ? "rgba(232,115,34,0.16)" : "rgba(255,255,255,0.025)",
              border: active ? "1px solid rgba(232,115,34,0.36)" : "1px solid rgba(255,255,255,0.055)",
            }}
          >
            <Icon size={12} style={{ color: active ? "#E87322" : "rgba(255,255,255,0.42)", flexShrink: 0 }} />
            <span className="truncate text-[11px] font-semibold" style={{ color: active ? "#fff" : "rgba(255,255,255,0.62)" }}>
              {item.number}. {item.title}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function LockIllustration() {
  return (
    <div className="relative mx-auto h-[118px] w-[168px]">
      <div
        className="absolute left-[51px] top-0 h-[70px] w-[66px] rounded-t-[38px]"
        style={{ border: "10px solid rgba(255,255,255,0.34)", borderBottom: 0 }}
      />
      <div className="absolute left-[38px] top-[48px] h-[68px] w-[94px] rounded-xl shadow-[0_16px_34px_rgba(0,0,0,0.28)]" style={{ background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.08)" }} />
      <div className="absolute left-[76px] top-[72px] h-5 w-5 rounded-full" style={{ background: "rgba(255,255,255,0.36)" }} />
      <div
        className="absolute left-[73px] top-[89px] h-8 w-6"
        style={{ background: "rgba(255,255,255,0.36)", clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)" }}
      />
      <div
        className="absolute left-[19px] top-[77px] h-[40px] w-[70px] rounded-[50%]"
        style={{ border: "8px solid #E87322", borderTopColor: "transparent", borderRightColor: "transparent", transform: "rotate(12deg)" }}
      />
      <div
        className="absolute left-[16px] top-[38px] h-[38px] w-[62px] rounded-[50%]"
        style={{ border: "6px solid #F5A623", borderTopColor: "transparent", borderRightColor: "transparent", transform: "rotate(14deg)" }}
      />
      <div
        className="absolute right-[8px] top-[66px] h-[40px] w-[64px] rounded-[50%]"
        style={{ border: "6px solid #E87322", borderTopColor: "transparent", borderLeftColor: "transparent", transform: "rotate(-12deg)" }}
      />
      <div
        className="absolute right-[5px] top-[50px] h-[34px] w-[52px] rounded-[50%]"
        style={{ border: "4px solid rgba(255,255,255,0.28)", borderTopColor: "transparent", borderLeftColor: "transparent", transform: "rotate(-10deg)" }}
      />
    </div>
  );
}

type PermissionLevel = "管理" | "编辑";

function PermissionApplyForm({
  permission,
  onPermissionChange,
  onSubmit,
}: {
  permission: PermissionLevel;
  onPermissionChange: (permission: PermissionLevel) => void;
  onSubmit: () => void;
}) {
  return (
    <div
      className="mx-auto mt-5 w-full max-w-[620px] overflow-hidden rounded-xl p-5"
      style={{ background: "#1A1510", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 18px 48px rgba(0,0,0,0.2)" }}
    >
      <div className="flex items-center gap-2 text-sm text-white">
        <span>申请</span>
        <select
          value={permission}
          onChange={(event) => onPermissionChange(event.target.value as PermissionLevel)}
          className="rounded-md bg-transparent font-semibold outline-none"
          style={{ color: "#E87322" }}
        >
          <option value="管理">管理</option>
          <option value="编辑">编辑</option>
        </select>
      </div>

      <textarea
        className="mt-4 h-[76px] w-full resize-none rounded-lg px-3 py-2 text-xs outline-none"
        placeholder="添加备注（选填）"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff" }}
      />

      <button
        type="button"
        onClick={onSubmit}
        className="mt-4 h-9 w-full rounded-lg text-xs font-semibold transition-opacity hover:opacity-90"
        style={{ background: "#E87322", color: "#1A1208", boxShadow: "0 10px 22px rgba(232,115,34,0.16)" }}
      >
        申请
      </button>
    </div>
  );
}

function SubmittedPanel({ message }: { message: string }) {
  return (
    <div
      className="mx-auto mt-5 flex w-full max-w-[620px] items-center gap-3 rounded-xl px-5 py-4"
      style={{ background: "#1A1510", border: "1px solid rgba(74,198,120,0.24)", boxShadow: "0 18px 48px rgba(0,0,0,0.2)" }}
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(74,198,120,0.12)", color: "#4AC678" }}>
        <CheckCircle2 size={17} />
      </div>
      <span className="text-sm font-semibold" style={{ color: "#4AC678" }}>{message}</span>
    </div>
  );
}

function AccountAccessPanel({ item, onSwitch }: { item: AccessCase; onSwitch?: () => void }) {
  const isJoinTeam = item.id === "join-team";
  const isApply = item.id === "switch-apply" || item.id === "apply-project";
  const buttonLabel = item.id === "switch-apply" ? "切换" : item.primaryAction;

  return (
    <div
      className="mx-auto mt-5 w-full max-w-[620px] overflow-hidden rounded-xl"
      style={{ background: "#1A1510", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 18px 48px rgba(0,0,0,0.2)" }}
    >
      <div className="px-5 py-3.5">
        <h3 className="text-xs font-semibold text-white">{item.panelTitle}</h3>
      </div>
      <div className="mx-5 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />

      <div className="flex items-center gap-3 px-5 py-4">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-lg font-semibold"
          style={{ background: "rgba(232,115,34,0.14)", color: "#E87322", border: "1px solid rgba(232,115,34,0.24)" }}>
          H
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-white">{item.accountName}</span>
            <span
              className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
              style={{ background: isJoinTeam ? "rgba(245,166,35,0.14)" : isApply ? "rgba(232,115,34,0.14)" : "rgba(74,198,120,0.12)", color: isJoinTeam ? "#F5A623" : isApply ? "#E87322" : "#4AC678" }}
            >
              {item.accountRole}
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px]" style={{ color: "rgba(255,255,255,0.42)" }}>
            <span>项目：{item.projectName}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onSwitch}
          className="h-8 flex-shrink-0 rounded-lg px-4 text-[11px] font-semibold transition-opacity hover:opacity-90"
          style={{ background: "#E87322", color: "#1A1208", boxShadow: "0 10px 22px rgba(232,115,34,0.16)" }}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}

export function ProjectLinkAccessPage() {
  const [activeId, setActiveId] = useState<AccessCaseId>("switch-view");
  const [switchedForApply, setSwitchedForApply] = useState(false);
  const [permission, setPermission] = useState<PermissionLevel>("编辑");
  const [submittedCaseIds, setSubmittedCaseIds] = useState<Set<AccessCaseId>>(new Set());
  const activeCase = ACCESS_CASES.find((item) => item.id === activeId) ?? ACCESS_CASES[0];
  const visibleCurrentTeam = activeCase.id === "switch-apply" && switchedForApply ? activeCase.projectTeam : activeCase.currentTeam;
  const submitted = submittedCaseIds.has(activeCase.id);
  const handleCaseChange = (id: AccessCaseId) => {
    setActiveId(id);
    setSwitchedForApply(false);
    setPermission("编辑");
  };
  const submitCurrentCase = () => {
    setSubmittedCaseIds((prev) => new Set([...prev, activeCase.id]));
  };

  return (
    <div className="h-full overflow-auto" style={{ background: "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(140,70,20,0.25) 0%, rgba(20,15,9,0) 60%), #140F09" }}>
      <div className="mx-auto flex min-h-full max-w-[1100px] flex-col gap-4 px-8 py-7">
        <CaseTabs activeId={activeId} onChange={handleCaseChange} />

        <main className="flex-1 rounded-2xl px-6 py-8" style={{ background: "#1A1510", border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 24px 60px rgba(0,0,0,0.24)" }}>
          <LockIllustration />
          <div className="mt-5 text-center">
            <h2 className="text-xl font-semibold tracking-normal text-white">没有权限访问：{activeCase.projectName}</h2>
            <div className="mx-auto mt-4 flex max-w-[720px] flex-wrap items-center justify-center gap-x-1.5 gap-y-1.5 text-sm leading-6" style={{ color: "rgba(255,255,255,0.48)" }}>
              <span>当前所在团队为</span>
              <span className="font-semibold" style={{ color: "#E87322" }}>{visibleCurrentTeam}</span>
              <span>，项目所在团队为</span>
              <span className="font-semibold" style={{ color: "#E87322" }}>{activeCase.projectTeam}</span>
              <span>，你可以</span>
            </div>
            <p className="mx-auto mt-2 max-w-[620px] text-xs leading-5" style={{ color: "rgba(255,255,255,0.42)" }}>
              {activeCase.notice}
            </p>
          </div>

          {submitted ? (
            <SubmittedPanel message={activeCase.id === "join-team" ? "已申请加入该团队，等待审批" : "已提交申请，等待审批"} />
          ) : activeCase.id === "switch-apply" && switchedForApply ? (
            <PermissionApplyForm permission={permission} onPermissionChange={setPermission} onSubmit={submitCurrentCase} />
          ) : activeCase.id === "apply-project" ? (
            <PermissionApplyForm permission={permission} onPermissionChange={setPermission} onSubmit={submitCurrentCase} />
          ) : (
            <AccountAccessPanel
              item={activeCase}
              onSwitch={activeCase.id === "switch-apply" ? () => setSwitchedForApply(true) : activeCase.id === "join-team" ? submitCurrentCase : undefined}
            />
          )}
        </main>
      </div>
    </div>
  );
}
