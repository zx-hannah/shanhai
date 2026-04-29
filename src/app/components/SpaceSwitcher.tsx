import { useState, useRef, useEffect } from "react";
import { X, Settings, Plus, Edit2 } from "lucide-react";
import { CreateSpaceDialog } from "./CreateSpaceDialog";
import { toast } from "sonner";

interface Space {
  id: string;
  name: string;
  type: "personal" | "enterprise";
  role?: string;
  avatarColor?: string;
  avatarLetter?: string;
}

const SPACES: Space[] = [
  { id: "personal", name: "我的个人空间", type: "personal", avatarColor: "#4A4A4A", avatarLetter: "我" },
  { id: "ent1", name: "山海科技有限公司", type: "enterprise", role: "所有者", avatarColor: "#C45C1A", avatarLetter: "山" },
  { id: "ent2", name: "未来创意工作室", type: "enterprise", role: "协作者", avatarColor: "#1A5CC4", avatarLetter: "未" },
];

interface SpaceSwitcherProps {
  onClose: () => void;
  currentSpaceId: string;
  onSwitchSpace: (id: string) => void;
  onOpenSettings: () => void;
}

// Inline editable dept field
function DeptBadge({
  spaceId,
  value,
  editingId,
  draftValue,
  onStartEdit,
  onDraftChange,
  onCommit,
  onCancel,
}: {
  spaceId: string;
  value: string;
  editingId: string | null;
  draftValue: string;
  onStartEdit: (id: string, current: string) => void;
  onDraftChange: (v: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isEditing = editingId === spaceId;

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={draftValue}
        onChange={e => onDraftChange(e.target.value)}
        onBlur={onCommit}
        onKeyDown={e => {
          e.stopPropagation();
          if (e.key === "Enter") onCommit();
          if (e.key === "Escape") onCancel();
        }}
        onClick={e => e.stopPropagation()}
        className="text-xs px-1.5 py-0.5 rounded outline-none text-white"
        style={{ background: "rgba(232,115,34,0.15)", border: "1px solid #E87322", maxWidth: "90px" }}
      />
    );
  }

  return (
    <button
      onClick={e => { e.stopPropagation(); onStartEdit(spaceId, value); }}
      className="flex items-center gap-1 group transition-opacity hover:opacity-80"
      title="点击编辑我的部门"
    >
      <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{value}</span>
      <Edit2 size={9} className="opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" style={{ color: "rgba(255,255,255,0.4)" }} />
    </button>
  );
}

export function SpaceSwitcher({ onClose, currentSpaceId, onSwitchSpace, onOpenSettings }: SpaceSwitcherProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Per-enterprise department: { spaceId -> dept }
  const [enterpriseDepts, setEnterpriseDepts] = useState<Record<string, string>>({
    "ent1": "产品部",
    "ent2": "运营部",
  });
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [draftDept, setDraftDept] = useState("");

  const startEditDept = (id: string, current: string) => {
    setDraftDept(current);
    setEditingDeptId(id);
  };

  const commitDept = () => {
    if (!editingDeptId) return;
    const trimmed = draftDept.trim();
    if (trimmed) {
      setEnterpriseDepts(prev => ({ ...prev, [editingDeptId]: trimmed }));
      toast.success("部门信息已更新");
    }
    setEditingDeptId(null);
  };

  const cancelDept = () => {
    setEditingDeptId(null);
  };

  return (
    <>
      <div
        className="fixed left-16 bottom-14 z-50 w-72 rounded-xl overflow-hidden shadow-2xl"
        style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {/* User Info Area */}
        <div className="p-4 flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            <div className="w-full h-full flex items-center justify-center text-white text-sm" style={{ background: "#E87322" }}>
              Bob
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm truncate">Bob</div>
            <div className="text-xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>138****8888</div>
          </div>
          <button
            className="text-xs px-2 py-1 rounded flex-shrink-0 transition-colors hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" }}
          >
            账号设置
          </button>
          <button onClick={onClose} className="ml-1 flex-shrink-0" style={{ color: "rgba(255,255,255,0.4)" }}>
            <X size={14} />
          </button>
        </div>

        {/* Space List */}
        <div className="p-3">
          <div className="text-xs mb-2 px-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            我的空间 ({SPACES.length})
          </div>

          {SPACES.map((space) => (
            <div
              key={space.id}
              onClick={() => { onSwitchSpace(space.id); onClose(); }}
              className="flex items-center gap-3 px-2 rounded-lg cursor-pointer transition-colors mb-1"
              style={{
                background: currentSpaceId === space.id ? "rgba(232,115,34,0.15)" : "transparent",
                paddingTop: space.type === "enterprise" ? "8px" : "8px",
                paddingBottom: space.type === "enterprise" ? "8px" : "8px",
              }}
              onMouseEnter={(e) => {
                if (currentSpaceId !== space.id)
                  (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.06)";
              }}
              onMouseLeave={(e) => {
                if (currentSpaceId !== space.id)
                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
              }}
            >
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs flex-shrink-0"
                style={{ background: space.avatarColor }}
              >
                {space.avatarLetter}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white truncate flex items-center gap-1">
                  {space.name}
                  {space.type === "personal" && (
                    <span className="text-xs px-1 rounded" style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", fontSize: "10px" }}>
                      仅自己可见
                    </span>
                  )}
                </div>

                {/* Enterprise: role + editable dept */}
                {space.type === "enterprise" && (
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {space.role === "所有者" ? "所有者" : "普通成员"}
                    </span>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
                    <DeptBadge
                      spaceId={space.id}
                      value={enterpriseDepts[space.id] ?? "未设置"}
                      editingId={editingDeptId}
                      draftValue={draftDept}
                      onStartEdit={startEditDept}
                      onDraftChange={setDraftDept}
                      onCommit={commitDept}
                      onCancel={cancelDept}
                    />
                  </div>
                )}
              </div>

              {/* Enterprise Settings gear */}
              {space.type === "enterprise" && (space.role === "所有者" || space.role === "管理员") && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSwitchSpace(space.id);
                    onOpenSettings();
                    onClose();
                  }}
                  className="flex-shrink-0 px-2 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors hover:opacity-80"
                  style={{ background: "rgba(232,115,34,0.12)", border: "1px solid rgba(232,115,34,0.25)", color: "#E87322" }}
                  title="团队设置"
                >
                  <Settings size={11} />
                  <span style={{ fontSize: "10px" }}>设置</span>
                </button>
              )}

              {currentSpaceId === space.id && (
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#E87322" }} />
              )}
            </div>
          ))}
        </div>

        {/* Create Space Button */}
        <div className="p-3 pt-0">
          <button
            onClick={() => setShowCreateDialog(true)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors"
            style={{ border: "1px dashed rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(232,115,34,0.5)";
              (e.currentTarget as HTMLButtonElement).style.color = "#E87322";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.15)";
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
            }}
          >
            <Plus size={14} />
            <span className="text-sm">新建空间</span>
          </button>
        </div>
      </div>

      {showCreateDialog && (
        <CreateSpaceDialog onClose={() => setShowCreateDialog(false)} />
      )}
    </>
  );
}
