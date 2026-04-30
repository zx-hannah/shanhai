import { useState, useRef } from "react";
import { X, Image as LucideImage, Coins, Upload } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onClose: () => void;
  onSave: (project: { name: string; tokenTotal: number; cover?: string }) => void;
}

export function CreateProjectDialog({ onClose, onSave }: Props) {
  const [name, setName] = useState("");
  const [tokenTotal, setTokenTotal] = useState("");
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("请选择图片文件"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("图片大小不能超过 5MB"); return; }
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("请输入项目名称");
      return;
    }
    const quota = parseInt(tokenTotal, 10);
    if (!tokenTotal.trim() || isNaN(quota) || quota <= 0) {
      toast.error("请输入有效的配额数量");
      return;
    }
    onSave({
      name: name.trim(),
      tokenTotal: quota,
      cover: coverPreview ?? undefined,
    });
    toast.success("项目已创建");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <div
        className="w-[480px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <h3 className="text-white">新建项目</h3>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.4)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">
          {/* Project Name */}
          <div>
            <label className="text-xs block mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
              项目名称
            </label>
            <input
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none text-white"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                caretColor: "#E87322",
              }}
              placeholder="例如：东方神话·第二季"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Quota */}
          <div>
            <label className="text-xs block mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
              项目额度
            </label>
            <div className="flex items-center gap-2">
              <Coins size={14} style={{ color: "#E87322" }} />
              <input
                type="number"
                className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none text-white"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  caretColor: "#E87322",
                }}
                placeholder="50000"
                value={tokenTotal}
                onChange={(e) => setTokenTotal(e.target.value)}
              />
              <span className="text-xs flex-shrink-0" style={{ color: "rgba(255,255,255,0.35)" }}>颗</span>
            </div>
          </div>

          {/* Cover (optional) */}
          <div>
            <label className="text-xs block mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
              封面 <span style={{ color: "rgba(255,255,255,0.25)" }}>(可选)</span>
            </label>
            <div className="flex items-center gap-3">
              {/* Preview */}
              <div
                className="relative w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden cursor-pointer group"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                onClick={() => fileInputRef.current?.click()}
              >
                {coverPreview ? (
                  <>
                    <img src={coverPreview} alt="cover" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "rgba(0,0,0,0.5)" }}>
                      <Upload size={16} style={{ color: "#fff" }} />
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
                    <LucideImage size={20} style={{ color: "rgba(255,255,255,0.2)" }} />
                    <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)" }}>点击上传</span>
                  </div>
                )}
              </div>
              {/* Upload actions */}
              <div className="flex flex-col gap-2 flex-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-opacity hover:opacity-80"
                  style={{ background: "rgba(232,115,34,0.1)", color: "#E87322", border: "1px solid rgba(232,115,34,0.25)" }}
                >
                  <Upload size={12} />
                  {coverPreview ? "重新上传" : "上传封面图片"}
                </button>
                {coverPreview && (
                  <button
                    type="button"
                    onClick={() => { setCoverPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="text-xs hover:opacity-80 transition-opacity text-left"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    移除封面
                  </button>
                )}
                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>支持 JPG、PNG、WebP，最大 5MB</span>
              </div>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm transition-opacity hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
            取消
          </button>
          <button onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-sm text-white transition-opacity hover:opacity-80"
            style={{ background: "#E87322" }}>
            创建
          </button>
        </div>
      </div>
    </div>
  );
}
