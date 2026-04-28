import { useState } from "react";
import { X, Info, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface ProjectBasicInfo {
  aspectRatio: string;
  resolution: string;
  frameRate: string;
}

interface EditProjectBasicInfoDialogProps {
  projectName: string;
  currentInfo: ProjectBasicInfo;
  onClose: () => void;
  onSave: (info: ProjectBasicInfo) => void;
}

const ASPECT_RATIO_OPTIONS = [
  { key: "16:9", label: "16:9（横屏）" },
  { key: "9:16", label: "9:16（竖屏）" },
  { key: "1:1", label: "1:1（方形）" },
  { key: "4:3", label: "4:3（标准）" },
  { key: "21:9", label: "21:9（超宽）" },
];

const RESOLUTION_OPTIONS = [
  { key: "1920x1080", label: "1920×1080（1080p）" },
  { key: "3840x2160", label: "3840×2160（4K）" },
  { key: "1280x720", label: "1280×720（720p）" },
  { key: "2560x1440", label: "2560×1440（2K）" },
  { key: "7680x4320", label: "7680×4320（8K）" },
];

const FRAME_RATE_OPTIONS = [
  { key: "24", label: "24 fps（电影）" },
  { key: "25", label: "25 fps（PAL）" },
  { key: "30", label: "30 fps（标准）" },
  { key: "60", label: "60 fps（高帧率）" },
  { key: "120", label: "120 fps（超高帧率）" },
];

export function EditProjectBasicInfoDialog({
  projectName,
  currentInfo,
  onClose,
  onSave,
}: EditProjectBasicInfoDialogProps) {
  const [aspectRatio, setAspectRatio] = useState(currentInfo.aspectRatio);
  const [resolution, setResolution] = useState(currentInfo.resolution);
  const [frameRate, setFrameRate] = useState(currentInfo.frameRate);
  const [showAspectRatioDrop, setShowAspectRatioDrop] = useState(false);
  const [showResolutionDrop, setShowResolutionDrop] = useState(false);
  const [showFrameRateDrop, setShowFrameRateDrop] = useState(false);

  const handleSave = () => {
    onSave({ aspectRatio, resolution, frameRate });
    toast.success("项目基本信息已更新");
    onClose();
  };

  const getLabel = (options: typeof ASPECT_RATIO_OPTIONS, key: string) => {
    return options.find((opt) => opt.key === key)?.label || key;
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="w-[520px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={() => {
          setShowAspectRatioDrop(false);
          setShowResolutionDrop(false);
          setShowFrameRateDrop(false);
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex items-center gap-2">
            <Info size={16} style={{ color: "#E87322" }} />
            <div>
              <h3 className="text-white">项目基本信息</h3>
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
          <div className="flex flex-col gap-4 mb-6">
            {/* Aspect Ratio */}
            <div>
              <div className="text-sm mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                画幅比例
              </div>
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => {
                    setShowResolutionDrop(false);
                    setShowFrameRateDrop(false);
                    setShowAspectRatioDrop(!showAspectRatioDrop);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}
                >
                  <span>{getLabel(ASPECT_RATIO_OPTIONS, aspectRatio)}</span>
                  <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
                </button>
                {showAspectRatioDrop && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-30 shadow-2xl"
                    style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {ASPECT_RATIO_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={(e) => {
                          e.stopPropagation();
                          setAspectRatio(opt.key);
                          setShowAspectRatioDrop(false);
                        }}
                        className="w-full px-4 py-3 text-sm text-left transition-colors hover:bg-white/5"
                        style={{ color: aspectRatio === opt.key ? "#E87322" : "rgba(255,255,255,0.7)" }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Resolution */}
            <div>
              <div className="text-sm mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                分辨率
              </div>
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => {
                    setShowAspectRatioDrop(false);
                    setShowFrameRateDrop(false);
                    setShowResolutionDrop(!showResolutionDrop);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}
                >
                  <span>{getLabel(RESOLUTION_OPTIONS, resolution)}</span>
                  <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
                </button>
                {showResolutionDrop && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-30 shadow-2xl"
                    style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {RESOLUTION_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={(e) => {
                          e.stopPropagation();
                          setResolution(opt.key);
                          setShowResolutionDrop(false);
                        }}
                        className="w-full px-4 py-3 text-sm text-left transition-colors hover:bg-white/5"
                        style={{ color: resolution === opt.key ? "#E87322" : "rgba(255,255,255,0.7)" }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Frame Rate */}
            <div>
              <div className="text-sm mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                帧率
              </div>
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => {
                    setShowAspectRatioDrop(false);
                    setShowResolutionDrop(false);
                    setShowFrameRateDrop(!showFrameRateDrop);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" }}
                >
                  <span>{getLabel(FRAME_RATE_OPTIONS, frameRate)}</span>
                  <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
                </button>
                {showFrameRateDrop && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-30 shadow-2xl"
                    style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {FRAME_RATE_OPTIONS.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFrameRate(opt.key);
                          setShowFrameRateDrop(false);
                        }}
                        className="w-full px-4 py-3 text-sm text-left transition-colors hover:bg-white/5"
                        style={{ color: frameRate === opt.key ? "#E87322" : "rgba(255,255,255,0.7)" }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-xs px-3 py-2 rounded-lg mb-6"
            style={{ background: "rgba(74,158,224,0.08)", color: "rgba(255,255,255,0.5)" }}>
            这些设置将影响项目中生成内容的默认参数
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
