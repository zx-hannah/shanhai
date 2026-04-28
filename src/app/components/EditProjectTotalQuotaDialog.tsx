import { useState } from "react";
import { X, Coins } from "lucide-react";
import { toast } from "sonner";

interface EditProjectTotalQuotaDialogProps {
  projectName: string;
  currentQuota: number;
  onClose: () => void;
  onSave: (quota: number) => void;
}

export function EditProjectTotalQuotaDialog({ projectName, currentQuota, onClose, onSave }: EditProjectTotalQuotaDialogProps) {
  const [quota, setQuota] = useState(currentQuota.toString());

  const handleSave = () => {
    const parsedQuota = parseInt(quota);
    if (!parsedQuota || parsedQuota <= 0) {
      toast.error("请输入有效的配额数量");
      return;
    }

    onSave(parsedQuota);
    toast.success("项目总配额已更新");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-[480px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-2">
            <Coins size={16} style={{ color: "#E87322" }} />
            <div>
              <h3 className="text-white">项目总配额</h3>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                {projectName}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ color: "rgba(255,255,255,0.4)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="text-sm mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
              配额数量（Tapies）
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <input
                type="number"
                value={quota}
                onChange={(e) => setQuota(e.target.value)}
                className="flex-1 bg-transparent outline-none text-white text-lg"
                placeholder="50000"
                autoFocus
              />
              <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>颗</span>
            </div>
          </div>

          <div className="text-xs px-3 py-2 rounded-lg mb-6"
            style={{ background: "rgba(232,115,34,0.08)", color: "rgba(255,255,255,0.5)" }}>
            此配额为项目级总预算，可分配给项目成员使用
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm transition-colors"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)" }}
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 rounded-xl text-white text-sm transition-opacity hover:opacity-90"
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
