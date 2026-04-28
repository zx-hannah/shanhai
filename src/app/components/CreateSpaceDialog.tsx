import { useState, useRef } from "react";
import { X, Camera } from "lucide-react";
import { toast } from "sonner";

interface CreateSpaceDialogProps {
  onClose: () => void;
}

export function CreateSpaceDialog({ onClose }: CreateSpaceDialogProps) {
  const [teamName, setTeamName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = () => {
    if (!teamName.trim()) {
      toast.error("请输入团队名称");
      return;
    }
    toast.success(`团队空间「${teamName}」创建成功`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      
      <div className="w-[460px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <h2 className="text-white">新建团队空间</h2>
          <button onClick={onClose} className="transition-opacity hover:opacity-70"
            style={{ color: "rgba(255,255,255,0.4)" }}>
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Notice */}
          <div className="flex gap-3 p-3 rounded-xl mb-6"
            style={{ background: "rgba(232,115,34,0.1)", border: "1px solid rgba(232,115,34,0.2)" }}>
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center text-xs"
                style={{ background: "#E87322", color: "#fff" }}>
                !
              </div>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
              新团队将拥有独立的工作空间和计费账户，初始生产栗为0。<br />
              原有权益无法继承至新团队。
            </p>
          </div>

          {/* Team Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden relative group"
                style={{ background: avatarPreview ? "transparent" : "#1A1A1A", border: "1px solid rgba(255,255,255,0.1)" }}>
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl text-white" style={{ fontFamily: "monospace" }}>T</span>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(0,0,0,0.5)" }}>
                  <Camera size={16} style={{ color: "rgba(255,255,255,0.8)" }} />
                </div>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: "#E87322", border: "2px solid #1E1A14" }}>
                <Camera size={9} className="text-white" />
              </button>
            </div>
            <div>
              <div className="text-sm text-white mb-1">团队头像</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>支持 JPG、PNG 格式，建议尺寸 200×200</div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>

          {/* Team Name */}
          <div className="mb-6">
            <div className="flex items-center gap-1 mb-2">
              <span className="text-red-500 text-sm">*</span>
              <label className="text-sm text-white">团队名称</label>
            </div>
            <div className="relative">
              <input
                type="text"
                value={teamName}
                onChange={(e) => e.target.value.length <= 50 && setTeamName(e.target.value)}
                placeholder="请输入团队名称"
                maxLength={50}
                className="w-full px-4 py-3 rounded-xl outline-none transition-all text-sm"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                }}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = "#E87322";
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)";
                }}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                style={{ color: "rgba(255,255,255,0.3)" }}>
                {teamName.length}/50
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
              取消
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-80 text-white"
              style={{ background: teamName.trim() ? "#E87322" : "rgba(232,115,34,0.4)" }}>
              创建空间
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
