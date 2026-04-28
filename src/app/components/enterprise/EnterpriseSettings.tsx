import { useState } from "react";
import { X, Users, Coins, ClipboardCheck, FolderOpen, Building2 } from "lucide-react";
import { MemberManagement } from "./MemberManagement";
import { ConsumptionManagement } from "./ConsumptionManagement";
import { ApprovalManagement } from "./ApprovalManagement";
import { ProjectManagement } from "./ProjectManagement";
import { EnterpriseInfo } from "./EnterpriseInfo";

type TabKey = "info" | "members" | "projects" | "consumption" | "approval";

const PENDING_APPROVAL_COUNT = 2;

interface EnterpriseSettingsProps {
  onClose: () => void;
}

export function EnterpriseSettings({ onClose }: EnterpriseSettingsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("info");

  const TABS: { key: TabKey; label: string; icon: any; badge?: number }[] = [
    { key: "info",        label: "团队信息", icon: Building2 },
    { key: "members",     label: "成员管理", icon: Users },
    { key: "projects",    label: "项目管理", icon: FolderOpen },
    { key: "consumption", label: "成本管理", icon: Coins },
    { key: "approval",    label: "审批管理", icon: ClipboardCheck, badge: PENDING_APPROVAL_COUNT },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div
        className="flex rounded-2xl overflow-hidden shadow-2xl"
        style={{
          width: "min(96vw, 1100px)",
          height: "min(90vh, 740px)",
          background: "#12100D",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Left Sidebar */}
        <div
          className="flex-shrink-0 flex flex-col py-6 px-3"
          style={{ width: "196px", background: "rgba(20,16,12,0.8)", borderRight: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Enterprise Identity */}
          <div className="flex items-center gap-2 px-3 mb-6">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm flex-shrink-0"
              style={{ background: "#C45C1A" }}
            >
              山
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm truncate">山海科技</div>
              <div className="text-xs truncate" style={{ color: "rgba(255,255,255,0.35)" }}>团队空间</div>
            </div>
          </div>

          {/* Tabs */}
          {TABS.map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1 text-sm text-left w-full transition-colors"
              style={{
                background: activeTab === key ? "rgba(232,115,34,0.15)" : "transparent",
                color: activeTab === key ? "#E87322" : "rgba(255,255,255,0.5)",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== key) {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.8)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== key) {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
                }
              }}
            >
              <Icon size={15} />
              <span className="flex-1">{label}</span>
              {badge != null && badge > 0 && (
                <span
                  className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded-full text-white min-w-[18px] text-center"
                  style={{ background: "#E87322", fontSize: "10px", lineHeight: "14px" }}
                >
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)";
              (e.currentTarget as HTMLButtonElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
            }}
          >
            <X size={16} />
          </button>

          <div className="p-6 pr-14">
            {activeTab === "info"        && <EnterpriseInfo />}
            {activeTab === "members"     && <MemberManagement />}
            {activeTab === "projects"    && <ProjectManagement />}
            {activeTab === "consumption" && <ConsumptionManagement />}
            {activeTab === "approval"    && <ApprovalManagement />}
          </div>
        </div>
      </div>
    </div>
  );
}