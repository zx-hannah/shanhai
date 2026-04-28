import { useState } from "react";
import { X, Search, Plus, ChevronDown, Trash2, Shield, Check } from "lucide-react";
import { toast } from "sonner";

type ProjectPermission = "管理" | "编辑" | "阅读";

export interface DialogMember {
  id: string;
  name: string;
  role?: string;
  avatarColor: string;
  letter: string;
  projectPermission?: ProjectPermission;
}

const ALL_ENTERPRISE_MEMBERS: DialogMember[] = [
  { id: "1", name: "Bob",     role: "所有者",   avatarColor: "#E87322", letter: "B" },
  { id: "2", name: "Alice",   role: "管理员",   avatarColor: "#7B3FC4", letter: "A" },
  { id: "3", name: "Charlie", role: "普通成员", avatarColor: "#2A6FC4", letter: "C" },
  { id: "4", name: "Diana",   role: "普通成员", avatarColor: "#C42A6F", letter: "D" },
  { id: "5", name: "Eve",     role: "普通成员", avatarColor: "#2AC4A2", letter: "E" },
];

const PERMISSION_OPTIONS: { key: ProjectPermission; label: string; desc: string; color: string }[] = [
  { key: "管理", label: "管理", desc: "可管理项目成员及设置", color: "#E87322" },
  { key: "编辑", label: "编辑", desc: "可编辑项目内容",       color: "#7B3FC4" },
  { key: "阅读", label: "阅读", desc: "只读权限",             color: "#2A6FC4" },
];

interface Props {
  projectName: string;
  initialMembers: DialogMember[];
  onClose: () => void;
  onSave?: (members: DialogMember[]) => void;
}

export function EditProjectMembersDialog({ projectName, initialMembers, onClose, onSave }: Props) {
  const [members, setMembers] = useState<DialogMember[]>(
    initialMembers.map((m) => ({ ...m, projectPermission: m.projectPermission ?? "编辑" }))
  );
  const [search, setSearch] = useState("");
  const [permDropdownId, setPermDropdownId] = useState<string | null>(null);

  const memberIds = new Set(members.map((m) => m.id));
  const available = ALL_ENTERPRISE_MEMBERS.filter(
    (m) => !memberIds.has(m.id) && m.name.toLowerCase().includes(search.toLowerCase())
  );

  const addMember = (m: DialogMember) => {
    setMembers((prev) => [...prev, { ...m, projectPermission: "编辑" }]);
    setSearch("");
  };

  const removeMember = (id: string) =>
    setMembers((prev) => prev.filter((m) => m.id !== id));

  const setPermission = (id: string, perm: ProjectPermission) => {
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, projectPermission: perm } : m));
    setPermDropdownId(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={() => { setPermDropdownId(null); onClose(); }}
    >
      <div
        className="w-[520px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)", maxHeight: "85vh", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div>
            <h3 className="text-white">编辑项目成员</h3>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
              {projectName} · {members.length} 人
            </p>
          </div>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.4)" }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5 overflow-auto flex-1">
          {/* Current Members */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                当前成员（{members.length} 人）
              </div>
              <div className="flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                <Shield size={10} /><span>项目权限</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 max-h-52 overflow-auto">
              {members.map((m) => {
                const perm = m.projectPermission ?? "编辑";
                const permInfo = PERMISSION_OPTIONS.find((p) => p.key === perm)!;
                return (
                  <div key={m.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                        style={{ background: m.avatarColor }}>
                        {m.letter}
                      </div>
                      <div>
                        <div className="text-sm text-white">{m.name}</div>
                        {m.role && null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setPermDropdownId(permDropdownId === m.id ? null : m.id); }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-colors"
                          style={{
                            background: `${permInfo.color}18`,
                            color: permInfo.color,
                            border: `1px solid ${permInfo.color}30`,
                          }}>
                          <Shield size={10} />{perm}<ChevronDown size={9} />
                        </button>
                        {permDropdownId === m.id && (
                          <div className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-30 shadow-2xl"
                            style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)", minWidth: "160px" }}
                            onClick={(e) => e.stopPropagation()}>
                            {PERMISSION_OPTIONS.map((opt) => (
                              <button key={opt.key} onClick={() => setPermission(m.id, opt.key)}
                                className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-white/5">
                                <div className="w-4 h-4 rounded flex items-center justify-center mt-0.5 flex-shrink-0"
                                  style={{
                                    background: perm === opt.key ? opt.color : "transparent",
                                    border: `1px solid ${perm === opt.key ? opt.color : "rgba(255,255,255,0.2)"}`,
                                  }}>
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
                      <button onClick={() => removeMember(m.id)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-red-900/20"
                        style={{ color: "rgba(239,68,68,0.6)" }}>
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
            <div className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>添加成员</div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-2"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Search size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
              <input className="bg-transparent text-xs flex-1 outline-none text-white"
                placeholder="搜索企业成员..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ caretColor: "#E87322" }} />
            </div>
            {available.length === 0 ? (
              <div className="text-xs text-center py-3" style={{ color: "rgba(255,255,255,0.25)" }}>
                {search ? "未找到匹配成员" : "所有成员已加入"}
              </div>
            ) : (
              <div className="flex flex-col gap-1 max-h-32 overflow-auto">
                {available.map((m) => (
                  <button key={m.id} onClick={() => addMember(m)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors hover:bg-white/5"
                    style={{ border: "1px solid transparent" }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                        style={{ background: m.avatarColor }}>{m.letter}</div>
                      <div>
                        <div className="text-sm text-white">{m.name}</div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{m.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                      style={{ color: "#E87322", background: "rgba(232,115,34,0.1)" }}>
                      <Plus size={10} /> 添加
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
              取消
            </button>
            <button
              onClick={() => { onSave?.(members); onClose(); toast.success("项目成员已更新"); }}
              className="flex-1 py-2.5 rounded-xl text-sm text-white transition-opacity hover:opacity-80"
              style={{ background: "#E87322" }}>
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
