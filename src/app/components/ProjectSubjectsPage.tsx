import { useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Users, User, TreePalm, Package, Sparkles, Upload,
  Search, X, Pencil, Trash2, Star,
  ChevronLeft, ChevronDown, FileImage, Copy, Check,
  Video, Music, Image as LucideImage, MoreVertical, Download,
  Film, Wand2, Maximize2, RefreshCw, Send, Compass, ImagePlus,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";

// ─── Types ────────────────────────────────────────────────────────────────
type SubjectType = "sd_ip" | "character" | "scene" | "prop";
type ReviewStatus = "pending" | "approved" | "rejected" | "expired";
type ReviewStatusFilter = "all" | ReviewStatus;
type ExpiryType = "permanent" | "date_range";
type SubTab = "generate" | "upload" | "subject" | "collect";
type VirtualIpAssetType = "image" | "video" | "audio";

interface SubjectItem {
  id: string;
  name: string;
  type: SubjectType;
  image: string;
  updatedAt: string;
  description?: string;
  reviewStatus?: ReviewStatus;
  expiryType?: ExpiryType;
  validFrom?: string;
  validTo?: string;
  episodes?: string[];
  shotCount?: number;
  referenceImage?: string;
  promptText?: string;
  imageSource?: "local" | "ai";
  modelName?: string;
  imageRatio?: string;
  assetType?: VirtualIpAssetType;
}

// ─── Mock Data ────────────────────────────────────────────────────────────
const INITIAL_SUBJECTS: SubjectItem[] = [
  { id: "sd1", name: "周星驰", type: "sd_ip", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop", updatedAt: "2026-01-12", reviewStatus: "approved", expiryType: "date_range", validFrom: "2024-01-15", validTo: "2025-01-15", assetType: "image" },
  { id: "sd2", name: "成龙", type: "sd_ip", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=200&fit=crop", updatedAt: "2026-01-12", reviewStatus: "pending", expiryType: "date_range", validFrom: "2024-01-20", validTo: "2025-07-20", assetType: "video" },
  { id: "sd3", name: "古风琴师", type: "sd_ip", image: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=300&h=200&fit=crop", updatedAt: "2026-01-10", reviewStatus: "approved", expiryType: "permanent", assetType: "audio" },
  { id: "sd4", name: "山神·青帝", type: "sd_ip", image: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=300&h=200&fit=crop", updatedAt: "2026-01-08", reviewStatus: "rejected", expiryType: "date_range", validFrom: "2024-02-10", validTo: "2024-05-10", assetType: "image" },
  { id: "sd5", name: "黄渤", type: "sd_ip", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=200&fit=crop", updatedAt: "2026-01-05", reviewStatus: "approved", expiryType: "date_range", validFrom: "2024-03-05", validTo: "2025-03-05", assetType: "video" },
  { id: "char1", name: "女主角·林月", type: "character", image: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=300&h=200&fit=crop", updatedAt: "2026-01-11", description: "主角，性格坚毅的修仙女子，擅长剑术与法术。", imageSource: "ai", referenceImage: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=600&fit=crop", promptText: "一位身穿青色长裙的修仙女子，腰佩长剑，站在昆仑山巅，云雾缭绕，仙气飘飘，中国古风，精致面部特征，飘逸长发，背景为仙境般的云海与仙山，电影级光影，8K超高清", modelName: "Seedream 3.0", imageRatio: "16:9", episodes: ["第一集","第二集","第三集","第四集","第五集","第六集"], shotCount: 48 },
  { id: "char2", name: "男主角·风清扬", type: "character", image: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=300&h=200&fit=crop", updatedAt: "2026-01-10", description: "隐世剑客，身怀绝技却不露锋芒。", imageSource: "ai", referenceImage: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=600&fit=crop", promptText: "一位白衣剑客，手持竹剑，站在竹林深处，月光透过竹叶洒下斑驳光影，侠客气质，淡然从容，中国水墨画风格，武侠意境，电影级光影渲染", modelName: "Seedream 3.0", imageRatio: "16:9", episodes: ["第一集","第三集","第四集","第五集","第六集"], shotCount: 36 },
  { id: "char3", name: "反派·墨渊", type: "character", image: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=300&h=200&fit=crop", updatedAt: "2026-01-09", description: "魔尊转世，企图毁灭仙界重建秩序。", imageSource: "ai", referenceImage: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=600&fit=crop", promptText: "暗黑系反派，身穿黑色魔甲，站在深渊边缘，背后是翻腾的魔火与暗黑符文，红色双眼散发邪光，史诗级暗黑奇幻风格，压迫感十足，电影级渲染", modelName: "Seedream 3.0 Video", imageRatio: "9:16", episodes: ["第二集","第四集","第五集","第六集"], shotCount: 24 },
  { id: "char4", name: "配角·小桃", type: "character", image: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=300&h=200&fit=crop", updatedAt: "2026-01-08", description: "灵狐精怪，活泼可爱，林月的贴身伙伴。", imageSource: "local", referenceImage: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=600&fit=crop", promptText: "活泼可爱的少女形象，粉色系服装，头戴狐耳装饰，站在桃花树下，花瓣飘落，阳光明媚，梦幻氛围，日系动漫融合中国古风风格", episodes: ["第一集","第三集","第五集"], shotCount: 12 },
  { id: "scene1", name: "仙山·昆仑", type: "scene", image: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=300&h=200&fit=crop", updatedAt: "2026-01-12", description: "昆仑仙山，云雾缭绕，修仙门派圣地。", imageSource: "ai", referenceImage: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=600&fit=crop", promptText: "昆仑仙山全景，云雾缭绕的山峰直插云霄，山顶有仙宫楼阁，飞檐翘角，仙鹤飞翔，金色阳光穿透云层形成丁达尔效应，中国山水画风格，宏大壮丽，8K超高清", modelName: "Seedream 3.0", imageRatio: "16:9", episodes: ["第一集","第二集","第三集","第四集","第五集","第六集","第七集"], shotCount: 56 },
  { id: "scene2", name: "古城镇·青云", type: "scene", image: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=300&h=200&fit=crop", updatedAt: "2026-01-09", description: "青云古镇，青石板路，白墙黑瓦。", imageSource: "local", referenceImage: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=600&fit=crop", promptText: "古风城镇俯视角，青石板街道蜿蜒，两侧是白墙黑瓦的古典建筑，红色灯笼悬挂，小桥流水，柳树垂枝，阳光温暖，中国江南水乡风格，精致细节", episodes: ["第一集","第二集","第四集"], shotCount: 18 },
  { id: "scene3", name: "魔域·深渊", type: "scene", image: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=300&h=200&fit=crop", updatedAt: "2026-01-07", description: "魔域深渊，暗黑诡谲，魔尊领地。", imageSource: "ai", referenceImage: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=600&fit=crop", promptText: "暗黑深渊场景，巨大的裂谷中涌出暗红岩浆，上方是扭曲的黑色岩石和锁链，空气中飘浮着暗火，压抑而恐怖的氛围，史诗级暗黑奇幻风格，电影级渲染", modelName: "Seedream 3.0", imageRatio: "4:3", episodes: ["第二集","第五集","第六集"], shotCount: 21 },
  { id: "scene4", name: "秘境·灵谷", type: "scene", image: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=300&h=200&fit=crop", updatedAt: "2026-01-05", description: "灵谷秘境，灵气充裕，珍稀灵草遍布。", imageSource: "local", referenceImage: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=600&fit=crop", promptText: "灵气弥漫的山谷秘境，翠绿草地，发光灵草散落各处，中央有一汪清泉，蝴蝶飞舞，远处是瀑布和彩虹，梦幻仙境氛围，吉卜力风格融合中国风水墨", episodes: ["第三集","第四集"], shotCount: 8 },
  { id: "prop1", name: "法宝·流云剑", type: "prop", image: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=300&h=200&fit=crop", updatedAt: "2026-01-10", description: "上古神兵，剑身如流云般飘逸。", imageSource: "ai", referenceImage: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=600&fit=crop", promptText: "一把中国古风宝剑，剑身修长，表面有云纹流转，剑柄镶嵌蓝宝石，剑穗飘逸，散发着淡蓝色光芒，3D渲染，精致金属质感，暗色背景突出主体", modelName: "Seedream 3.0", imageRatio: "3:4", episodes: ["第一集","第三集","第五集","第六集"], shotCount: 32 },
  { id: "prop2", name: "神器·天音琴", type: "prop", image: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=300&h=200&fit=crop", updatedAt: "2026-01-08", description: "天界乐器，琴声可治愈一切伤痛。", imageSource: "local", referenceImage: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=600&fit=crop", promptText: "一把古朴典雅的七弦琴，木质琴身有精美雕刻，琴弦散发金色光芒，琴面上有仙鹤与祥云图案，悬浮在半空中，周围有音符光效，奇幻风格，精致细节", episodes: ["第二集","第四集","第五集"], shotCount: 16 },
  { id: "prop3", name: "灵器·护心镜", type: "prop", image: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=300&h=200&fit=crop", updatedAt: "2026-01-06", description: "可抵御一切法术攻击的护心宝镜。", imageSource: "ai", referenceImage: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=600&fit=crop", promptText: "一面圆形铜镜，表面光滑如银，镜框刻有八卦与符文，边缘镶嵌翡翠，镜面散发淡金色防护光晕，古风法器设计，3D渲染，金属与玉石质感对比鲜明", modelName: "Seedream 3.0", imageRatio: "1:1", episodes: ["第四集","第六集"], shotCount: 10 },
];

const STATUS_CONFIG: Record<ReviewStatus, { bg: string; text: string; label: string }> = {
  pending: { bg: "rgba(255,255,255,0.08)", text: "rgba(255,255,255,0.5)", label: "审核中" },
  approved: { bg: "rgba(74,198,120,0.15)", text: "#4AC678", label: "审核通过" },
  rejected: { bg: "rgba(255,107,107,0.15)", text: "#ff6b6b", label: "审核失败" },
  expired: { bg: "rgba(255,255,255,0.08)", text: "rgba(255,255,255,0.35)", label: "已过期" },
};

const TYPE_CONFIG: Record<SubjectType, { icon: typeof Users; label: string; color: string }> = {
  character: { icon: User, label: "人物", color: "#7B3FC4" },
  scene: { icon: TreePalm, label: "场景", color: "#2A6FC4" },
  prop: { icon: Package, label: "道具", color: "#C42A6F" },
    sd_ip: { icon: Sparkles, label: "SD虚拟IP", color: "#E87322" },

};

// ─── Helpers ──────────────────────────────────────────────────────────────
function extractFilename(src: string): string {
  const parts = src.split("/");
  const last = parts[parts.length - 1] || "";
  const cleaned = last.split("?")[0].split("#")[0];
  return cleaned.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ").trim() || "未命名主体";
}

function createVirtualIpPlaceholder(type: VirtualIpAssetType, fileName: string) {
  const title = type === "audio" ? "音频虚拟IP" : type === "video" ? "视频虚拟IP" : "图片虚拟IP";
  const subtitle = fileName || "待上传文件";
  const icon = type === "audio" ? "AUDIO" : type === "video" ? "VIDEO" : "IMAGE";
  const bg = type === "audio" ? "#2F241D" : type === "video" ? "#1F2430" : "#2C2318";
  const accent = type === "audio" ? "#E87322" : type === "video" ? "#4A9EE0" : "#D4A373";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520">
      <rect width="800" height="520" rx="32" fill="${bg}"/>
      <rect x="36" y="36" width="728" height="448" rx="24" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
      <text x="400" y="220" text-anchor="middle" fill="${accent}" font-family="Arial, sans-serif" font-size="52" font-weight="700">${icon}</text>
      <text x="400" y="284" text-anchor="middle" fill="#F4F1ED" font-family="Arial, sans-serif" font-size="34" font-weight="600">${title}</text>
      <text x="400" y="334" text-anchor="middle" fill="rgba(255,255,255,0.55)" font-family="Arial, sans-serif" font-size="24">${subtitle}</text>
    </svg>
  `.trim();
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// ─── Subject Detail Full-Screen Page ────────────────────────────────────────────
interface SubjectDetailProps {
  mode: "create" | "edit" | "view";
  defaultType?: SubjectType;
  subject?: SubjectItem;
  onClose: () => void;
  onSave: (data: Omit<SubjectItem, "id" | "updatedAt">) => void;
}

function SubjectDetailPage({ mode, defaultType, subject, onClose, onSave }: SubjectDetailProps) {
  const navigate = useNavigate();
  const { id: projectId } = useParams<{ id: string }>();
  const targetType = subject?.type ?? defaultType ?? "sd_ip";
  const isCreatingSdIp = mode === "create" && targetType === "sd_ip";

  const [name, setName] = useState(subject?.name || "");
  const [description, setDescription] = useState(subject?.description || "");
  const [image, setImage] = useState(subject?.image || "");
  const [isDragOverImage, setIsDragOverImage] = useState(false);
  const [virtualIpAssetType, setVirtualIpAssetType] = useState<VirtualIpAssetType>("audio");
  const [virtualIpFileName, setVirtualIpFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const typeConfig = TYPE_CONFIG[targetType];
  const isSdIp = targetType === "sd_ip";

  const handleFileImage = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setImage(url);
    if (isCreatingSdIp) {
      setName(extractFilename(file.name));
    }
    toast.success("图片已更新");
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileImage(file);
  };

  const handleVirtualIpFile = useCallback((file: File) => {
    const nextName = extractFilename(file.name);
    const nextPreview = virtualIpAssetType === "image"
      ? URL.createObjectURL(file)
      : createVirtualIpPlaceholder(virtualIpAssetType, file.name);
    setImage(nextPreview);
    setVirtualIpFileName(file.name);
    setName((prev) => prev.trim() ? prev : nextName);
    toast.success(`${virtualIpAssetType === "audio" ? "音频" : virtualIpAssetType === "video" ? "视频" : "图片"}已上传`);
  }, [virtualIpAssetType]);

  const handleVirtualIpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleVirtualIpFile(file);
  };

  // Drag handlers for main image area
  const handleImageDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragOverImage(true);
  }, []);

  const handleImageDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragOverImage(false);
  }, []);

  const handleImageDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragOverImage(false);
    const data = e.dataTransfer.getData("text/plain");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.src) {
          setImage(parsed.src);
          if (isCreatingSdIp && parsed.name) setName(extractFilename(parsed.name));
          toast.success("已使用拖拽的图片");
          return;
        }
      } catch { /* not JSON, try as file */ }
    }
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) handleFileImage(file);
    }
  }, [handleFileImage]);

  const handleSave = () => {
    if (isCreatingSdIp) {
      if (!name.trim()) { toast.error("请输入虚拟IP名称"); return; }
      if (!image) { toast.error(`请上传${virtualIpAssetType === "audio" ? "音频" : virtualIpAssetType === "video" ? "视频" : "图片"}文件`); return; }
      onSave({
        name: name.trim(),
        type: targetType,
        image,
        description: description.trim() || `虚拟IP类型：${virtualIpAssetType === "audio" ? "音频" : virtualIpAssetType === "video" ? "视频" : "图片"}${virtualIpFileName ? `｜文件：${virtualIpFileName}` : ""}`,
      });
      onClose();
      return;
    }

    if (!name.trim()) { toast.error("请输入主体名称"); return; }
    if (!image) { toast.error("请上传图片"); return; }
    onSave({ name: name.trim(), type: targetType, image, description: description.trim() || undefined });
    if (mode === "create") onClose();
  };

  /* ─── SD IP creation: minimal single-photo flow ─── */
  if (isCreatingSdIp) {
    const acceptMap: Record<VirtualIpAssetType, string> = {
      image: "image/png,image/jpeg,image/jpg",
      video: "video/mp4,video/quicktime,.mp4,.mov",
      audio: "audio/wav,audio/mpeg,.wav,.mp3",
    };
    const uploadTextMap: Record<VirtualIpAssetType, string> = {
      image: "点击上传本地图片",
      video: "点击上传本地视频",
      audio: "点击上传本地音频",
    };

    const assetTypeIcon: Record<VirtualIpAssetType, typeof LucideImage> = {
      image: LucideImage,
      video: Video,
      audio: Music,
    };
    const AssetIcon = assetTypeIcon[virtualIpAssetType];

    return (
      <div className="absolute inset-0 z-30 flex flex-col" style={{ background: "#140F09" }}>
        {/* Top bar */}
        <div className="flex items-center gap-3 px-6 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-white/5"
            style={{ color: "rgba(255,255,255,0.6)" }}>
            <ChevronLeft size={16} />返回
          </button>
          <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>新建虚拟IP</span>
          <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: typeConfig.color + "20", color: typeConfig.color }}>{typeConfig.label}</span>
          <div className="flex-1" />
          <button onClick={handleSave} className="px-5 py-1.5 rounded-lg text-sm font-medium transition-colors" style={{ background: "#E87322", color: "#fff" }}>创建</button>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="flex justify-center p-8">
            <div style={{ maxWidth: "560px", width: "100%" }}>
              {/* Asset type selector */}
              <div className="mb-5">
                <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>资产类型</label>
                <div className="flex gap-2">
                  {(["image", "video", "audio"] as VirtualIpAssetType[]).map((t) => {
                    const isActive = virtualIpAssetType === t;
                    const Icon = assetTypeIcon[t];
                    return (
                      <button
                        key={t}
                        onClick={() => { setVirtualIpAssetType(t); setImage(""); setVirtualIpFileName(""); }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-colors"
                        style={{
                          background: isActive ? "rgba(232,115,34,0.12)" : "rgba(255,255,255,0.06)",
                          border: isActive ? "1px solid rgba(232,115,34,0.3)" : "1px solid rgba(255,255,255,0.08)",
                          color: isActive ? "#E87322" : "rgba(255,255,255,0.5)",
                        }}>
                        <Icon size={12} />
                        {t === "image" ? "图片" : t === "video" ? "视频" : "音频"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* File upload area */}
              <div className="mb-6">
                <div
                  className="relative rounded-xl overflow-hidden"
                  style={{ background: "#1A1510", aspectRatio: "16/10", border: isDragOverImage ? "2px dashed #E87322" : "2px dashed rgba(255,255,255,0.1)", transition: "border-color 0.2s" }}
                  onDragOver={handleImageDragOver}
                  onDragLeave={handleImageDragLeave}
                  onDrop={(e) => {
                    e.preventDefault(); e.stopPropagation();
                    setIsDragOverImage(false);
                    const files = e.dataTransfer.files;
                    if (files.length > 0) handleVirtualIpFile(files[0]);
                  }}
                >
                  {image ? (
                    virtualIpAssetType === "image" ? (
                      <img src={image} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-3 text-center">
                        <div style={{ color: "rgba(255,255,255,0.5)" }}><AssetIcon size={36} /></div>
                        <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{virtualIpFileName || "已上传文件"}</div>
                      </div>
                    )
                  ) : (
                    <div
                      className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div style={{ fontSize: "32px", color: "rgba(255,255,255,0.15)", marginBottom: "8px" }}>+</div>
                      <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)" }}>{uploadTextMap[virtualIpAssetType]}</div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptMap[virtualIpAssetType]}
                    onChange={handleVirtualIpChange}
                    className="hidden"
                  />
                  {/* Bottom-right button */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1">
                    <button onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                      style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.8)" }}>
                      <Upload size={12} />{image ? "替换" : "上传"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="mb-5">
                <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>名称</label>
                <input className="w-full px-3 py-2.5 rounded-lg outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.85)", fontSize: "14px", border: "1px solid rgba(255,255,255,0.1)" }}
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="输入虚拟IP名称" autoFocus />
              </div>
              {/* Description */}
              <div className="mb-5">
                <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>描述</label>
                <textarea className="w-full px-3 py-2.5 rounded-lg outline-none resize-none"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", fontSize: "14px", border: "1px solid rgba(255,255,255,0.1)", lineHeight: 1.7 }}
                  rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="输入描述（可选）" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── View mode for character / scene / prop ─── */
  if (mode === "view" && !isCreatingSdIp && !isSdIp) {
    const epCount = subject?.episodes?.length ?? 0;
    const isAi = subject?.imageSource === "ai";
    return (
      <div className="absolute inset-0 z-30 flex flex-col" style={{ background: "#140F09" }}>
        <div className="flex items-center gap-3 px-6 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-white/5"
            style={{ color: "rgba(255,255,255,0.6)" }}>
            <ChevronLeft size={16} />返回
          </button>
          <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{subject?.name}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: typeConfig.color + "20", color: typeConfig.color }}>{typeConfig.label}</span>
          <div className="flex-1" />
          <button onClick={() => { setDetailMode("edit"); }} className="px-4 py-1.5 rounded-lg text-sm transition-colors" style={{ background: "rgba(232,115,34,0.15)", color: "#E87322" }}>编辑</button>
        </div>
        <div className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-8 py-8 grid grid-cols-5 gap-x-8">
            {/* Left: image */}
            <div className="col-span-2">
              <div className="rounded-xl overflow-hidden" style={{ background: "#1A1510", aspectRatio: "3/4" }}>
                {subject?.image ? (
                  <img src={subject.image} alt={subject.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ color: "rgba(255,255,255,0.15)", fontSize: "13px" }}>暂无图片</div>
                )}
              </div>
            </div>
            {/* Right: info */}
            <div className="col-span-3 flex flex-col">
              {/* Name */}
              <div className="mb-6">
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "4px" }}>名称</span>
                <div onClick={() => { setDetailMode("edit"); }} className="cursor-pointer py-1 rounded-lg hover:bg-white/5 transition-colors">
                  <span style={{ fontSize: "18px", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>{subject?.name}</span>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", marginLeft: "8px" }}>点击编辑</span>
                </div>
              </div>
              {/* Description */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em" }}>描述</span>
                  {subject?.description && (
                    <button
                      onClick={() => { navigator.clipboard.writeText(subject.description ?? "").catch(() => {}); toast.success("已复制"); }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors hover:opacity-80"
                      style={{ color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.05)" }}>
                      <Copy size={10} />复制
                    </button>
                  )}
                </div>
                <div onClick={() => { setDetailMode("edit"); }} className="cursor-pointer py-1 rounded-lg hover:bg-white/5 transition-colors min-h-[40px]">
                  <p style={{ fontSize: "13px", color: subject?.description ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)", lineHeight: 1.7 }}>
                    {subject?.description || "暂无描述"}
                  </p>
                </div>
              </div>
              {/* Episodes */}
              <div className="mb-6">
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "10px" }}>剧集数据</span>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {/* Donut chart */}
                  <div className="flex flex-col items-center rounded-xl p-3" style={{ background: "rgba(232,115,34,0.04)", border: "1px solid rgba(232,115,34,0.1)" }}>
                    <div style={{ width: "76px", height: "76px" }}>
                      <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                        <circle
                          cx="50" cy="50" r="36" fill="none"
                          stroke="url(#donutGrad)" strokeWidth="10" strokeLinecap="round"
                          strokeDasharray={226.2}
                          strokeDashoffset={226.2 * (1 - epCount / 8)}
                          style={{ transition: "stroke-dashoffset 0.5s ease" }}
                        />
                        <defs>
                          <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#E87322" />
                            <stop offset="100%" stopColor="#7B3FC4" />
                          </linearGradient>
                        </defs>
                        <text x="50" y="46" textAnchor="middle" dominantBaseline="central"
                          style={{ fontSize: "15px", fontWeight: 700, fill: "rgba(255,255,255,0.9)", transform: "rotate(90deg)", transformOrigin: "50px 50px" }}>
                          {epCount}
                        </text>
                        <text x="50" y="59" textAnchor="middle" dominantBaseline="central"
                          style={{ fontSize: "8px", fill: "rgba(255,255,255,0.35)", transform: "rotate(90deg)", transformOrigin: "50px 50px" }}>
                          / {8} 集
                        </text>
                      </svg>
                    </div>
                    <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", marginTop: "5px" }}>出现集数</span>
                  </div>
                  {/* Episode count */}
                  <div className="flex flex-col items-center justify-center rounded-xl p-3" style={{ background: "rgba(232,115,34,0.04)", border: "1px solid rgba(232,115,34,0.1)" }}>
                    <span style={{ fontSize: "32px", fontWeight: 700, color: "#E87322", lineHeight: 1 }}>{epCount}</span>
                    <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", marginTop: "5px" }}>出现剧集数</span>
                  </div>
                  {/* Shot count */}
                  <div className="flex flex-col items-center justify-center rounded-xl p-3" style={{ background: "rgba(123,60,196,0.04)", border: "1px solid rgba(123,60,196,0.1)" }}>
                    <span style={{ fontSize: "32px", fontWeight: 700, color: "#7B3FC4", lineHeight: 1 }}>{subject?.shotCount ?? 0}</span>
                    <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", marginTop: "5px" }}>出现分镜数</span>
                  </div>
                </div>
                {/* Episode tags */}
                {subject?.episodes && subject.episodes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {subject.episodes.map((ep, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full text-xs"
                        style={{ background: "rgba(232,115,34,0.08)", color: "#E87322", border: "1px solid rgba(232,115,34,0.15)" }}>{ep}</span>
                    ))}
                  </div>
                )}
              </div>
              {/* Image Info */}
              <div className="flex-1">
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "8px" }}>图片信息</span>
                <div className="rounded-xl overflow-hidden" style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {isAi ? (
                    <>
                      {/* Preview area: reference + generated */}
                      <div className="flex items-stretch gap-2 p-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        {/* Reference image */}
                        <div className="flex-1">
                          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", display: "block", marginBottom: "4px" }}>参考图</span>
                          {subject?.referenceImage ? (
                            <div className="rounded-lg overflow-hidden" style={{ background: "#1A1510", aspectRatio: "1" }}>
                              <img src={subject.referenceImage} alt="参考图" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="rounded-lg flex items-center justify-center" style={{ background: "#1A1510", aspectRatio: "1", color: "rgba(255,255,255,0.15)", fontSize: "10px" }}>暂无</div>
                          )}
                        </div>
                        {/* Generated result */}
                        <div className="flex-1">
                          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", display: "block", marginBottom: "4px" }}>生成结果</span>
                          <div className="rounded-lg overflow-hidden" style={{ background: "#1A1510", aspectRatio: "1" }}>
                            {subject?.image ? (
                              <img src={subject.image} alt="生成结果" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ color: "rgba(255,255,255,0.15)", fontSize: "10px" }}>暂无</div>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Bottom tags */}
                      <div className="flex items-center gap-1.5 px-3 py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px]" style={{ background: "rgba(155,89,182,0.15)", color: "#9B59B6", border: "1px solid rgba(155,89,182,0.2)" }}>
                          {subject?.modelName ?? "—"}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px]" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.08)" }}>
                          {subject?.imageRatio ?? "—"}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px]" style={{ background: "rgba(232,115,34,0.12)", color: "#E87322", border: "1px solid rgba(232,115,34,0.2)" }}>
                          <Sparkles size={8} style={{ marginRight: "3px", verticalAlign: "middle" }} />AI生成
                        </span>
                      </div>
                      {/* Prompt text */}
                      {subject?.promptText && (
                        <div className="px-3 pb-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                          <div className="flex items-center justify-between mt-2 mb-1.5">
                            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>生图提示词</span>
                            <button
                              onClick={() => { navigator.clipboard.writeText(subject.promptText ?? "").catch(() => {}); toast.success("提示词已复制"); }}
                              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition-colors hover:opacity-80"
                              style={{ color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.05)" }}>
                              <Copy size={9} />复制
                            </button>
                          </div>
                          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                            {subject.promptText}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5 px-3 py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px]" style={{ background: "rgba(74,198,120,0.12)", color: "#4AC678", border: "1px solid rgba(74,198,120,0.2)" }}>
                        <Upload size={8} style={{ marginRight: "3px", verticalAlign: "middle" }} />本地上传
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col" style={{ background: "#140F09" }}>
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-white/5"
          style={{ color: "rgba(255,255,255,0.6)" }}>
          <ChevronLeft size={16} />返回
        </button>
        <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.1)" }} />
        <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
          {mode === "create" ? "新建主体" : subject?.name}
        </span>
        <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: typeConfig.color + "20", color: typeConfig.color }}>
          {typeConfig.label}
        </span>
        <div className="flex-1" />
        {mode !== "view" && (
          <button onClick={handleSave} className="px-5 py-1.5 rounded-lg text-sm font-medium transition-colors" style={{ background: "#E87322", color: "#fff" }}>
            {mode === "create" ? "创建" : "保存"}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex justify-center p-8">
          <div style={{ maxWidth: "560px", width: "100%" }}>
            {/* Image upload area */}
            <div className="mb-6">
              <div
                className="relative rounded-xl overflow-hidden"
                style={{ background: "#1A1510", aspectRatio: "16/10", border: isDragOverImage ? "2px dashed #E87322" : "2px dashed rgba(255,255,255,0.1)", transition: "border-color 0.2s" }}
                onDragOver={handleImageDragOver}
                onDragLeave={handleImageDragLeave}
                onDrop={handleImageDrop}
              >
                {image ? (
                  <img src={image} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ color: "rgba(255,255,255,0.15)", fontSize: "13px" }}>暂无图片</div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <div className="absolute bottom-3 right-3 flex items-center gap-1">
                  <button onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                    style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.8)" }}>
                    <Upload size={12} />{image ? "替换" : "上传"}
                  </button>
                  <button
                    onClick={() => navigate(`/project/${projectId}/generate`)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors hover:opacity-80"
                    style={{ background: "#E87322", color: "#fff" }}>
                    <Sparkles size={12} />前往生成
                  </button>
                </div>
              </div>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)", marginTop: "6px" }}>
                支持上传 / 拖拽左侧资产 / 前往生成模块创建
              </p>
            </div>
            {/* Name */}
            <div className="mb-5">
              <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>名称</label>
              <input className="w-full px-3 py-2.5 rounded-lg outline-none"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.85)", fontSize: "14px", border: "1px solid rgba(255,255,255,0.1)" }}
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="输入主体名称" autoFocus />
            </div>
            {/* Description */}
            <div className="mb-5">
              <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>描述</label>
              <textarea className="w-full px-3 py-2.5 rounded-lg outline-none resize-none"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", fontSize: "14px", border: "1px solid rgba(255,255,255,0.1)", lineHeight: 1.7 }}
                rows={3} value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="输入主体描述" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Subject Sidebar Detail (character/scene/prop) ───────────────────────────
function SubjectSidebarDetail({
  subject, onBack, onUpdate,
}: {
  subject: SubjectItem;
  onBack: () => void;
  onUpdate: (updates: Partial<SubjectItem>) => void;
}) {
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(subject.name);
  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState(subject.description ?? "");
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [promptValue, setPromptValue] = useState(subject.promptText ?? "");
  const [imgSrc, setImgSrc] = useState(subject.image);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyNewImage = (url: string) => {
    setImgSrc(url);
    onUpdate({ image: url });
    toast.success("图片已替换");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyNewImage(URL.createObjectURL(file));
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragOver(false);
    const data = e.dataTransfer.getData("text/plain");
    if (data) {
      try { const p = JSON.parse(data); if (p.src) { applyNewImage(p.src); return; } } catch { /* not JSON */ }
    }
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith("image/")) applyNewImage(URL.createObjectURL(file));
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = imgSrc;
    a.download = subject.name;
    a.click();
    toast.success("开始下载");
  };

  const TypeIcon = TYPE_CONFIG[subject.type].icon;
  const typeColor = TYPE_CONFIG[subject.type].color;
  const totalEpisodes = 6;
  const episodeCount = subject.episodes?.length ?? 0;
  const shotCount = subject.shotCount ?? 0;
  const episodeRatio = totalEpisodes > 0 ? Math.round((episodeCount / totalEpisodes) * 100) : 0;

  const handleNameSave = () => {
    if (nameValue.trim()) onUpdate({ name: nameValue.trim() });
    else setNameValue(subject.name);
    setEditingName(false);
  };
  const handleDescSave = () => {
    onUpdate({ description: descValue });
    setEditingDesc(false);
  };
  const handlePromptSave = () => {
    onUpdate({ promptText: promptValue });
    setEditingPrompt(false);
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col" style={{ background: "#110E0A" }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-2 py-2 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors hover:bg-white/5"
          style={{ color: "rgba(255,255,255,0.5)" }}>
          <ChevronLeft size={11} />返回
        </button>
        <div style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.08)" }} />
        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{subject.name}</span>
        <span className="px-1 py-0.5 rounded text-[8px]" style={{ background: typeColor + "20", color: typeColor }}>{TYPE_CONFIG[subject.type].label}</span>
      </div>

      <div className="flex-1 overflow-auto px-2 py-2 flex flex-col gap-2.5">
        {/* Image — replace + download + drag-and-drop */}
        <div className="relative rounded-lg overflow-hidden group cursor-pointer"
          style={{
            background: "#1A1510",
            aspectRatio: "16/9",
            outline: isDragOver ? "2px dashed #E87322" : "2px dashed transparent",
            outlineOffset: "-2px",
            transition: "outline-color 0.15s",
          }}
          onClick={() => !isDragOver && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <img src={imgSrc} alt={subject.name}
            className="w-full h-full object-cover transition-opacity"
            style={{ opacity: isDragOver ? 0.35 : 1 }} />
          {isDragOver ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5"
              style={{ background: "rgba(232,115,34,0.1)" }}>
              <ImagePlus size={18} style={{ color: "#E87322" }} />
              <span style={{ fontSize: "10px", color: "#E87322", fontWeight: 500 }}>松开以替换</span>
            </div>
          ) : (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-end justify-end p-1.5 gap-1">
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-lg text-[9px]"
                style={{ background: "rgba(0,0,0,0.65)", color: "rgba(255,255,255,0.85)" }}
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                <ImagePlus size={9} />替换
              </button>
              <button
                className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 rounded-lg text-[9px]"
                style={{ background: "rgba(0,0,0,0.65)", color: "rgba(255,255,255,0.85)" }}
                onClick={(e) => { e.stopPropagation(); handleDownload(); }}
              >
                <Download size={9} />下载
              </button>
            </div>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

        {/* Name — click to edit */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>主体名称</span>
            {!editingName && (
              <button onClick={() => setEditingName(true)}
                className="flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] hover:bg-white/5 transition-colors"
                style={{ color: "rgba(255,255,255,0.25)" }}>
                <Pencil size={7} />修改
              </button>
            )}
          </div>
          {editingName ? (
            <div className="flex gap-1">
              <input autoFocus className="flex-1 px-2 py-1.5 rounded-lg outline-none"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.85)", fontSize: "10px", border: "1px solid rgba(232,115,34,0.5)" }}
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleNameSave(); if (e.key === "Escape") { setNameValue(subject.name); setEditingName(false); } }} />
              <button onClick={handleNameSave} className="px-2 py-1 rounded-lg text-[9px] font-medium"
                style={{ background: "#E87322", color: "#fff" }}>确定</button>
            </div>
          ) : (
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{subject.name}</div>
          )}
        </div>

        {/* Description — click to edit, copy */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>描述</span>
            <div className="flex items-center gap-1">
              {subject.description && !editingDesc && (
                <button onClick={() => { navigator.clipboard.writeText(subject.description ?? "").catch(() => {}); toast.success("描述已复制"); }}
                  className="flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] hover:bg-white/5 transition-colors"
                  style={{ color: "rgba(255,255,255,0.25)" }}>
                  <Copy size={7} />复制
                </button>
              )}
              {!editingDesc && (
                <button onClick={() => setEditingDesc(true)}
                  className="flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] hover:bg-white/5 transition-colors"
                  style={{ color: "rgba(255,255,255,0.25)" }}>
                  <Pencil size={7} />修改
                </button>
              )}
            </div>
          </div>
          {editingDesc ? (
            <div className="flex flex-col gap-1">
              <textarea className="w-full px-2 py-1.5 rounded-lg outline-none resize-none"
                style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.8)", fontSize: "9px", border: "1px solid rgba(232,115,34,0.5)", lineHeight: 1.5, minHeight: "60px" }}
                value={descValue}
                onChange={(e) => setDescValue(e.target.value)} />
              <div className="flex gap-1 justify-end">
                <button onClick={() => { setDescValue(subject.description ?? ""); setEditingDesc(false); }}
                  className="px-2 py-0.5 rounded text-[8px]"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>取消</button>
                <button onClick={handleDescSave} className="px-2 py-0.5 rounded text-[8px] font-medium"
                  style={{ background: "#E87322", color: "#fff" }}>保存</button>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: "9px", color: subject.description ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)", lineHeight: 1.5 }}>
              {subject.description || "暂无描述"}
            </div>
          )}
        </div>

        {/* Episode data */}
        {episodeCount > 0 && (
          <div>
            <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", fontWeight: 500, display: "block", marginBottom: "6px" }}>剧集数据</span>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-1 mb-2">
              <div className="flex flex-col items-center py-1.5 rounded-lg"
                style={{ background: "rgba(232,115,34,0.08)", border: "1px solid rgba(232,115,34,0.12)" }}>
                <span style={{ fontSize: "12px", color: "#E87322", fontWeight: 700 }}>{episodeRatio}%</span>
                <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.3)", marginTop: "1px" }}>集数占比</span>
              </div>
              <div className="flex flex-col items-center py-1.5 rounded-lg"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>{episodeCount}</span>
                <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.3)", marginTop: "1px" }}>出现剧集</span>
              </div>
              <div className="flex flex-col items-center py-1.5 rounded-lg"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 700 }}>{shotCount}</span>
                <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.3)", marginTop: "1px" }}>出现分镜</span>
              </div>
            </div>
            {/* Episode tags */}
            <div className="flex flex-wrap gap-1">
              {subject.episodes!.map((ep, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded text-[8px]"
                  style={{ background: "rgba(232,115,34,0.08)", color: "#E87322", border: "1px solid rgba(232,115,34,0.15)" }}>{ep}</span>
              ))}
            </div>
          </div>
        )}

        {/* Image info */}
        <div>
          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", fontWeight: 500, display: "block", marginBottom: "6px" }}>图片信息</span>
          {/* Source badge */}
          <div className="flex items-center gap-1 mb-2">
            {subject.imageSource === "ai" ? (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px]"
                style={{ background: "rgba(232,115,34,0.12)", color: "#E87322", border: "1px solid rgba(232,115,34,0.2)" }}>
                <Sparkles size={7} />AI生成
              </span>
            ) : (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px]"
                style={{ background: "rgba(74,198,120,0.12)", color: "#4AC678", border: "1px solid rgba(74,198,120,0.2)" }}>
                <Upload size={7} />手动上传
              </span>
            )}
          </div>

          {/* AI generation info */}
          {subject.imageSource === "ai" && (
            <div className="flex flex-col gap-2">
              {subject.promptText && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.3)" }}>提示词</span>
                    <button onClick={() => { navigator.clipboard.writeText(subject.promptText ?? "").catch(() => {}); toast.success("提示词已复制"); }}
                      className="flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] hover:bg-white/5"
                      style={{ color: "rgba(255,255,255,0.25)" }}>
                      <Copy size={7} />复制
                    </button>
                  </div>
                  <p style={{ fontSize: "8px", color: "rgba(255,255,255,0.45)", lineHeight: 1.55 }}>{subject.promptText}</p>
                </div>
              )}
              {subject.referenceImage && (
                <div>
                  <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.3)", display: "block", marginBottom: "3px" }}>参考图</span>
                  <div className="w-12 h-12 rounded overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                    <img src={subject.referenceImage} alt="参考图" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
              {(subject.modelName || subject.imageRatio) && (
                <div className="flex flex-wrap gap-1">
                  {subject.modelName && (
                    <span className="px-1.5 py-0.5 rounded text-[8px]"
                      style={{ background: "rgba(155,89,182,0.12)", color: "#9B59B6", border: "1px solid rgba(155,89,182,0.18)" }}>{subject.modelName}</span>
                  )}
                  {subject.imageRatio && (
                    <span className="px-1.5 py-0.5 rounded text-[8px]"
                      style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)" }}>{subject.imageRatio}</span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Upload: editable prompt archive */}
          {subject.imageSource === "local" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.3)" }}>提示词归档</span>
                {!editingPrompt && (
                  <button onClick={() => setEditingPrompt(true)}
                    className="flex items-center gap-0.5 px-1 py-0.5 rounded text-[8px] hover:bg-white/5"
                    style={{ color: "rgba(255,255,255,0.25)" }}>
                    <Pencil size={7} />{subject.promptText ? "修改" : "添加"}
                  </button>
                )}
              </div>
              {editingPrompt ? (
                <div className="flex flex-col gap-1">
                  <textarea className="w-full px-2 py-1.5 rounded-lg outline-none resize-none"
                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.75)", fontSize: "8px", border: "1px solid rgba(232,115,34,0.4)", lineHeight: 1.5, minHeight: "48px" }}
                    placeholder="输入关联的提示词..."
                    value={promptValue}
                    onChange={(e) => setPromptValue(e.target.value)} />
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => { setPromptValue(subject.promptText ?? ""); setEditingPrompt(false); }}
                      className="px-2 py-0.5 rounded text-[8px]"
                      style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>取消</button>
                    <button onClick={handlePromptSave} className="px-2 py-0.5 rounded text-[8px] font-medium"
                      style={{ background: "#E87322", color: "#fff" }}>保存</button>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: "8px", color: subject.promptText ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.2)", lineHeight: 1.55 }}>
                  {subject.promptText || "点击“添加”录入提示词归档"}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Shared section-button row used in generate detail ───────────────────────
function ActionRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "0 0 10px" }} />
      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", fontWeight: 500, display: "block", marginBottom: "6px" }}>{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function ActionBtn({ icon: Icon, label, disabled }: { icon: React.ElementType; label: string; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: disabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.55)",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      onClick={() => !disabled && toast.success(`${label}...`)}
    >
      <Icon size={11} />
      {label}
    </button>
  );
}

// ─── Generate Asset Detail Modal ──────────────────────────────────────────────
function GenerateAssetDetail({ asset, open, onClose }: { asset: SidebarAsset; open: boolean; onClose: () => void }) {
  const member = PROJECT_MEMBERS.find(m => m.name === asset.creator);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="p-0 overflow-hidden border-0 gap-0"
        style={{
          background: "#1A1510",
          maxWidth: "860px",
          width: "calc(100vw - 2rem)",
          maxHeight: "92vh",
          borderRadius: "16px",
        }}
      >
        <DialogTitle className="sr-only">{asset.name}</DialogTitle>
        <div className="flex" style={{ minHeight: "540px", maxHeight: "92vh" }}>
          {/* Left: image */}
          <div className="flex-[1.4] relative overflow-hidden" style={{ background: "#0D0B08", minWidth: 0 }}>
            <img src={asset.src} alt={asset.name} className="w-full h-full object-cover" style={{ minHeight: "100%" }} />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-sm font-semibold"
              style={{ background: "rgba(0,0,0,0.55)", color: "rgba(255,255,255,0.9)", backdropFilter: "blur(6px)" }}>
              AI 生成
            </div>
          </div>

          {/* Right: info panel */}
          <div className="flex flex-col overflow-hidden"
            style={{ width: "300px", flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.07)" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <LucideImage size={14} style={{ color: "#E87322" }} />
                <span className="font-semibold" style={{ fontSize: "14px", color: "rgba(255,255,255,0.9)" }}>图片生成</span>
              </div>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{asset.date}</span>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-4 pb-4">
              {/* Prompt */}
              {asset.promptText && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)" }}>提示词</span>
                    <button
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-opacity hover:opacity-70"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                      onClick={() => { navigator.clipboard.writeText(asset.promptText ?? "").catch(() => {}); toast.success("提示词已复制"); }}
                    >
                      <Copy size={10} />复制
                    </button>
                  </div>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.65)", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{asset.promptText}</p>
                </div>
              )}

              {/* Reference image */}
              {asset.referenceImage && (
                <div>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", display: "block", marginBottom: "8px" }}>参考图</span>
                  <div className="w-16 h-16 rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                    <img src={asset.referenceImage} alt="参考图" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* Tags */}
              {asset.modelName && (
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg text-xs"
                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {asset.modelName}
                  </span>
                  {asset.imageRatio && (
                    <span className="px-2.5 py-1 rounded-lg text-xs"
                      style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      {asset.imageRatio}
                    </span>
                  )}
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs"
                    style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    <Maximize2 size={9} />智能比例
                  </span>
                </div>
              )}

              {/* Creator */}
              {member && (
                <div>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", display: "block", marginBottom: "8px" }}>创建人员</span>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-semibold text-white"
                      style={{ background: member.color }}>{member.avatar}</div>
                    <span className="flex-1 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>{member.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: `${member.color}18`, color: member.color }}>{member.role}</span>
                  </div>
                </div>
              )}

              {/* Applied scenes */}
              {asset.appliedTo && asset.appliedTo.length > 0 && (() => {
                const subjectItems = asset.appliedTo!.filter(a => a.type === "subject");
                const shotItems = asset.appliedTo!.filter(a => a.type === "shot");
                return (
                  <div>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", display: "block", marginBottom: "8px" }}>已应用于</span>
                    <div className="flex flex-col gap-1.5">
                      {subjectItems.map((a, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <Package size={11} style={{ color: "#4AC678", flexShrink: 0 }} />
                          <span className="flex-1 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{a.name}</span>
                          {a.category && (
                            <span className="text-xs px-1.5 py-0.5 rounded"
                              style={{ background: "rgba(74,198,120,0.12)", color: "#4AC678" }}>{a.category}</span>
                          )}
                        </div>
                      ))}
                      {shotItems.length > 0 && (
                        <div className="px-3 py-2.5 rounded-xl"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Film size={11} style={{ color: "#a78bfa" }} />
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>分镜</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {shotItems.map((a, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded-md"
                                style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.18)" }}>
                                {a.name}{a.shotNo ? ` · ${a.shotNo}` : ""}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-colors hover:bg-white/5"
                  style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
                  onClick={() => toast.success("已收藏")}>
                  <Star size={13} />收藏
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-colors hover:bg-white/5"
                  style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
                  onClick={() => toast.success("开始下载")}>
                  <Download size={13} />下载
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-colors"
                  style={{ border: "1px solid rgba(255,107,107,0.18)", color: "rgba(255,107,107,0.65)" }}
                  onClick={() => { toast.success("已删除"); onClose(); }}>
                  <Trash2 size={13} />删除
                </button>
              </div>

              {/* 生成 */}
              <ActionRow label="生成">
                <ActionBtn icon={Video} label="图生视频" />
                <ActionBtn icon={Send} label="发送到画布" />
              </ActionRow>

              {/* 编辑 */}
              <ActionRow label="编辑">
                <ActionBtn icon={Wand2} label="局部重绘" />
                <ActionBtn icon={Compass} label="视角变换" disabled />
                <ActionBtn icon={Maximize2} label="图片超清" />
              </ActionRow>

              {/* 更多 */}
              <ActionRow label="更多">
                <ActionBtn icon={RefreshCw} label="再次生成" />
                <ActionBtn icon={Pencil} label="重新编辑" />
              </ActionRow>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Upload Asset Detail Modal ────────────────────────────────────────────────
function UploadAssetDetail({ asset, open, onClose }: { asset: SidebarAsset; open: boolean; onClose: () => void }) {
  const member = PROJECT_MEMBERS.find(m => m.name === asset.creator);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="p-0 overflow-hidden border-0 gap-0"
        style={{
          background: "#1A1510",
          maxWidth: "720px",
          width: "calc(100vw - 2rem)",
          maxHeight: "92vh",
          borderRadius: "16px",
        }}
      >
        <DialogTitle className="sr-only">{asset.name}</DialogTitle>
        <div className="flex" style={{ minHeight: "480px", maxHeight: "92vh" }}>
          {/* Left: image */}
          <div className="flex-[1.3] relative overflow-hidden" style={{ background: "#0D0B08", minWidth: 0 }}>
            <img src={asset.src} alt={asset.name} className="w-full h-full object-cover" style={{ minHeight: "100%" }} />
          </div>

          {/* Right: info panel */}
          <div className="flex flex-col overflow-hidden"
            style={{ width: "280px", flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.07)" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Upload size={14} style={{ color: "#3b82f6" }} />
                <span className="font-semibold truncate" style={{ fontSize: "14px", color: "rgba(255,255,255,0.9)", maxWidth: "160px" }}>{asset.name}</span>
              </div>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{asset.date}</span>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-4 pb-4">
              {/* Creator */}
              {member && (
                <div>
                  <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", display: "block", marginBottom: "8px" }}>创建人员</span>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-semibold text-white"
                      style={{ background: member.color }}>{member.avatar}</div>
                    <span className="flex-1 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>{member.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: `${member.color}18`, color: member.color }}>{member.role}</span>
                  </div>
                </div>
              )}

              {/* Applied scenes */}
              {asset.appliedTo && asset.appliedTo.length > 0 && (() => {
                const subjectItems = asset.appliedTo!.filter(a => a.type === "subject");
                const shotItems = asset.appliedTo!.filter(a => a.type === "shot");
                return (
                  <div>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", display: "block", marginBottom: "8px" }}>已应用于</span>
                    <div className="flex flex-col gap-1.5">
                      {subjectItems.map((a, i) => (
                        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <Package size={11} style={{ color: "#4AC678", flexShrink: 0 }} />
                          <span className="flex-1 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{a.name}</span>
                          {a.category && (
                            <span className="text-xs px-1.5 py-0.5 rounded"
                              style={{ background: "rgba(74,198,120,0.12)", color: "#4AC678" }}>{a.category}</span>
                          )}
                        </div>
                      ))}
                      {shotItems.length > 0 && (
                        <div className="px-3 py-2.5 rounded-xl"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Film size={11} style={{ color: "#a78bfa" }} />
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>分镜</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {shotItems.map((a, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded-md"
                                style={{ background: "rgba(167,139,250,0.12)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.18)" }}>
                                {a.name}{a.shotNo ? ` · ${a.shotNo}` : ""}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-colors hover:bg-white/5"
                  style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
                  onClick={() => toast.success("开始下载")}>
                  <Download size={13} />下载
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-colors"
                  style={{ border: "1px solid rgba(255,107,107,0.18)", color: "rgba(255,107,107,0.65)" }}
                  onClick={() => { toast.success("已删除"); onClose(); }}>
                  <Trash2 size={13} />删除
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Sidebar SD-IP Inline Detail ────────────────────────────────────────────
function SidebarSdIpDetail({ subject, onBack, onUpdate }: {
  subject: SubjectItem;
  onBack: () => void;
  onUpdate: (updates: Partial<SubjectItem>) => void;
}) {
  const [nameValue, setNameValue] = useState(subject.name);
  const [editingName, setEditingName] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUpdate({ image: url });
      toast.success("图片已替换");
    }
  };

  const handleNameSave = () => {
    if (nameValue.trim()) {
      onUpdate({ name: nameValue.trim() });
    } else {
      setNameValue(subject.name);
    }
    setEditingName(false);
  };

  const assetType = subject.assetType ?? "image";
  const TypeIcon = assetType === "image" ? LucideImage : assetType === "video" ? Video : Music;
  const statusCfg = subject.reviewStatus ? STATUS_CONFIG[subject.reviewStatus] : null;

  return (
    <div className="absolute inset-0 z-40 flex flex-col" style={{ background: "#110E0A" }}>
      <div className="flex items-center gap-2 px-2 py-2 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors hover:bg-white/5"
          style={{ color: "rgba(255,255,255,0.5)" }}>
          <ChevronLeft size={11} />返回
        </button>
        <div style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.08)" }} />
        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{subject.name}</span>
        <span className="px-1 py-0.5 rounded text-[8px]" style={{ background: "#E8732220", color: "#E87322" }}>虚拟IP</span>
      </div>
      <div className="flex-1 overflow-auto px-2 py-2">
        {/* Image with click-to-replace */}
        <div
          className="relative rounded-lg overflow-hidden mb-2 cursor-pointer group"
          style={{ background: "#1A1510", aspectRatio: "1" }}
          onClick={() => fileInputRef.current?.click()}
        >
          <img src={subject.image} alt={subject.name} className="w-full h-full object-cover" />
          {/* Asset type icon — top-left, icon only */}
          <div className="absolute top-1 left-1 z-10 w-5 h-5 rounded flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.55)" }}>
            <TypeIcon size={9} style={{ color: "rgba(255,255,255,0.75)" }} />
          </div>
          {statusCfg && (
            <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full text-[8px]"
              style={{ background: statusCfg.bg, color: statusCfg.text }}>
              {statusCfg.label}
            </span>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] px-3 py-1.5 rounded-lg" style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.8)" }}>
              替换图片
            </span>
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        {/* Name */}
        <div className="mb-2">
          <label style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", display: "block", marginBottom: "3px" }}>名称</label>
          {editingName ? (
            <input
              autoFocus
              className="w-full px-2 py-1.5 rounded-lg outline-none"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.85)", fontSize: "10px", border: "1px solid rgba(232,115,34,0.5)" }}
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => { if (e.key === "Enter") handleNameSave(); if (e.key === "Escape") { setNameValue(subject.name); setEditingName(false); } }}
            />
          ) : (
            <div onClick={() => setEditingName(true)} className="cursor-pointer px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
              style={{ fontSize: "10px", color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>
              {subject.name}
              <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.2)", marginLeft: "4px" }}>点击编辑</span>
            </div>
          )}
        </div>
        {subject.description && (
          <div className="mb-2">
            <label style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", display: "block", marginBottom: "3px" }}>描述</label>
            <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{subject.description}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SD IP Fullscreen Image View ────────────────────────────────────────────
function SdIpFullscreenView({ subject, onClose, onReplaceImage }: {
  subject: SubjectItem;
  onClose: () => void;
  onReplaceImage: (newImage: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [nameValue, setNameValue] = useState(subject.name);
  const [imageValue, setImageValue] = useState(subject.image);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusCfg = subject.reviewStatus ? STATUS_CONFIG[subject.reviewStatus] : null;

  const handleFileImage = (file: File) => {
    const url = URL.createObjectURL(file);
    setImageValue(url);
    onReplaceImage(url);
    toast.success("图片已替换");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileImage(file);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragOver(false);
    const data = e.dataTransfer.getData("text/plain");
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.src) { setImageValue(parsed.src); onReplaceImage(parsed.src); toast.success("图片已替换"); return; }
      } catch { /* not JSON */ }
    }
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith("image/")) handleFileImage(files[0]);
  };

  return (
    <div className="absolute inset-0 z-30 flex flex-col" style={{ background: "#140F09" }}>
      <div className="flex items-center gap-3 px-6 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-white/5"
          style={{ color: "rgba(255,255,255,0.6)" }}>
          <ChevronLeft size={16} />返回
        </button>
        <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.1)" }} />
        {isEditing ? (
          <input autoFocus
            className="px-2 py-0.5 rounded-lg outline-none"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.85)", fontSize: "14px", fontWeight: 500, border: "1px solid rgba(232,115,34,0.5)" }}
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => { if (e.key === "Enter") setIsEditing(false); if (e.key === "Escape") { setNameValue(subject.name); setIsEditing(false); } }}
          />
        ) : (
          <div onClick={() => setIsEditing(true)} className="cursor-pointer py-0.5 rounded-lg hover:bg-white/5 transition-colors">
            <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{nameValue}</span>
          </div>
        )}
        {statusCfg && (
          <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: statusCfg.bg, color: statusCfg.text }}>
            {statusCfg.label}
          </span>
        )}
      </div>
      <div className="flex-1 flex items-center justify-center overflow-hidden p-8">
        <div
          className="relative flex items-center justify-center rounded-xl"
          style={{
            maxWidth: "100%",
            maxHeight: "calc(100vh - 120px)",
            border: isDragOver ? "2px dashed #E87322" : "2px dashed transparent",
            transition: "border-color 0.2s",
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {imageValue ? (
            <img src={imageValue} alt={subject.name} className="max-w-full max-h-full object-contain rounded-xl" />
          ) : (
            <div className="flex items-center justify-center w-full h-full rounded-xl" style={{ background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.15)", minHeight: "200px" }}>暂无图片</div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
            style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.8)" }}>
            <Upload size={12} />替换图片
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar Asset Data ─────────────────────────────────────────────────────
type AssetType = "image" | "video" | "audio";
type AssetSubTab = "generate" | "upload" | "subject" | "collect";

interface SidebarAsset {
  id: string; name: string; type: AssetType; src: string; size: string; date: string;
  creator?: string;
  source?: "ai" | "local";
  promptText?: string;
  referenceImage?: string;
  modelName?: string;
  imageRatio?: string;
  appliedTo?: { type: "subject" | "shot"; name: string; shotNo?: string; category?: string }[];
}

const SIDEBAR_ASSETS: Record<AssetSubTab, SidebarAsset[]> = {
  generate: [
    { id: "g1", name: "古风女侠_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=200&q=70", size: "2.3MB", date: "今天", creator: "Alice", source: "ai", promptText: "一位身穿青色长裙的修仙女子，腰佩长剑，站在昆仑山巅，云雾缭绕，仙气飘飘，中国古风，电影级光影，8K超高清", referenceImage: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=600&fit=crop", modelName: "Seedream 3.0", imageRatio: "16:9", appliedTo: [{ type: "subject", name: "女主角·林月", category: "人物" }, { type: "shot", name: "第一集", shotNo: "镜号 3" }, { type: "shot", name: "第三集", shotNo: "镜号 7" }] },
    { id: "g2", name: "古城背景_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=200&q=70", size: "1.8MB", date: "今天", creator: "Bob", source: "ai", promptText: "古风城镇俯视角，青石板街道，两侧白墙黑瓦的古典建筑，红色灯笼，小桥流水，中国江南水乡风格", referenceImage: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=600&fit=crop", modelName: "Seedream 3.0", imageRatio: "16:9", appliedTo: [{ type: "subject", name: "古城镇·青云镇" }] },
    { id: "g3", name: "山林场景.mp4", type: "video", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=200&q=70", size: "12MB", date: "今天", creator: "Alice", source: "ai", promptText: "山林深处，阳光透过树叶洒下斑驳光影，雾气弥漫，仙侠氛围，电影级光影渲染", referenceImage: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=600&fit=crop", modelName: "Seedream 3.0 Video", imageRatio: "16:9", appliedTo: [] },
    { id: "g4", name: "道具宝剑.jpg", type: "image", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=200&q=70", size: "0.9MB", date: "昨天", creator: "Dave", source: "ai", promptText: "一把中国古风宝剑，剑身修长，表面有云纹流转，剑柄镶嵌蓝宝石，剑穗飘逸，3D渲染，精致金属质感", referenceImage: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=600&fit=crop", modelName: "Seedream 3.0", imageRatio: "3:4", appliedTo: [{ type: "subject", name: "法宝·流云剑", category: "道具" }, { type: "shot", name: "第三集", shotNo: "镜号 12" }, { type: "shot", name: "第五集", shotNo: "镜号 4" }] },
    { id: "g5", name: "云雾山脉.jpg", type: "image", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=200&q=70", size: "4.2MB", date: "昨天", creator: "Bob", source: "ai", promptText: "云雾缭绕的群山，山峰高耸入云，远处有仙山楼阁，中国山水画风格，宏大壮丽，8K超高清", referenceImage: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=600&fit=crop", modelName: "Seedream 3.0", imageRatio: "16:9", appliedTo: [] },
    { id: "g6", name: "片头动画.mp4", type: "video", src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?w=200&q=70", size: "28MB", date: "3天前", creator: "Alice", source: "ai", modelName: "Seedream 3.0 Video", imageRatio: "16:9", appliedTo: [] },
  ],
  upload: [
    { id: "u1", name: "人物参考_古装.jpg", type: "image", src: "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?w=200&q=70", size: "1.5MB", date: "昨天", creator: "Alice", source: "local", appliedTo: [{ type: "subject", name: "女主角·林月", category: "人物" }] },
    { id: "u2", name: "人物立绘参考.jpg", type: "image", src: "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?w=200&q=70", size: "2.1MB", date: "3天前", creator: "Carol", source: "local", appliedTo: [] },
  ],
  subject: [
    { id: "s1", name: "女主角·林月.jpg", type: "image", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=200&q=70", size: "1.2MB", date: "今天", creator: "Carol", source: "local", appliedTo: [{ type: "subject", name: "女主角·林月" }] },
  ],
  collect: [
    { id: "c1", name: "白发女侠_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=200&q=70", size: "2.3MB", date: "今天", creator: "Carol", source: "ai", promptText: "白发女侠，一袭白衣，手持长剑，站在雪山顶上，背景是壮丽的雪山和云海，中国武侠风格，电影级光影", referenceImage: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=600&fit=crop", modelName: "Seedream 3.0", imageRatio: "16:9", appliedTo: [] },
    { id: "c2", name: "山林场景.jpg", type: "image", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=200&q=70", size: "3.1MB", date: "今天", creator: "Alice", source: "ai", promptText: "山林深处，阳光透过树叶洒下斑驳光影，雾气弥漫", referenceImage: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=600&fit=crop", modelName: "Seedream 3.0", imageRatio: "16:9", appliedTo: [] },
  ],
};

// ─── Members ────────────────────────────────────────────────────────────────
const PROJECT_MEMBERS = [
  { id: "1", name: "Alice", avatar: "Al", color: "#E87322"},
  { id: "2", name: "Bob", avatar: "Bo", color: "#7B3FC4", role: "背景" },
  { id: "3", name: "Carol", avatar: "Ca", color: "#2A6FC4", role: "人物" },
  { id: "4", name: "Dave", avatar: "Da", color: "#C42A6F", role: "道具" },
];
const CURRENT_USER = PROJECT_MEMBERS[0];


export function ProjectSubjectsPage() {
  const { id } = useParams<{ id: string }>();

  // ── Sidebar state ──────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [assetSubTab, setAssetSubTab] = useState<AssetSubTab>("generate");
  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetType>("image");
  const [assetSearch, setAssetSearch] = useState("");
  const [subjectReviewFilter, setSubjectReviewFilter] = useState<ReviewStatusFilter>("all");

  const [memberFilter, setMemberFilter] = useState<string[]>([CURRENT_USER.id]);
  const [showMemberMenu, setShowMemberMenu] = useState(false);
  const [sidebarMoreId, setSidebarMoreId] = useState<string | null>(null);
  const [sidebarCollectIds, setSidebarCollectIds] = useState<Set<string>>(new Set(["g2", "g4"]));
  const [sidebarSubjectExpanded, setSidebarSubjectExpanded] = useState<Record<SubjectType, boolean>>({
    sd_ip: true, character: true, scene: true, prop: true,
  });
  const [sidebarDetailAsset, setSidebarDetailAsset] = useState<SidebarAsset | SubjectItem | null>(null);

  // ── Subjects state ─────────────────────────────────────────────────────
  const [subjects, setSubjects] = useState<SubjectItem[]>(INITIAL_SUBJECTS);
  const [activeType, setActiveType] = useState<SubjectType>("sd_ip");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [detailSubject, setDetailSubject] = useState<SubjectItem | null>(null);
  const [detailMode, setDetailMode] = useState<"create" | "edit" | "view">("view");
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineEditValue, setInlineEditValue] = useState("");
  const [createType, setCreateType] = useState<SubjectType>("sd_ip");
  const [sdIpView, setSdIpView] = useState<SubjectItem | null>(null);

  const filteredSubjects = subjects.filter((subject) => {
    if (subject.type !== activeType) return false;
    if (searchKeyword && !subject.name.toLowerCase().includes(searchKeyword.toLowerCase())) return false;
    return true;
  });

  const filteredAssets = SIDEBAR_ASSETS[assetSubTab].filter(a => {
    if (a.type !== assetTypeFilter) return false;
    if (assetSearch && !a.name.toLowerCase().includes(assetSearch.toLowerCase())) return false;
    return true;
  });

  const totalByType = {
    sd_ip: subjects.filter(s => s.type === "sd_ip").length,
    character: subjects.filter(s => s.type === "character").length,
    scene: subjects.filter(s => s.type === "scene").length,
    prop: subjects.filter(s => s.type === "prop").length,
  };

  const handleCreate = (data: Omit<SubjectItem, "id" | "updatedAt">) => {
    const newSubject: SubjectItem = { ...data, id: `subject_${Date.now()}`, updatedAt: new Date().toISOString().split("T")[0] };
    setSubjects(prev => [...prev, newSubject]);
    setDetailSubject(null);
    toast.success("主体创建成功");
  };

  const handleEdit = (data: Omit<SubjectItem, "id" | "updatedAt">) => {
    if (!detailSubject) return;
    setSubjects(prev => prev.map(s => s.id === detailSubject.id ? { ...s, ...data, updatedAt: new Date().toISOString().split("T")[0] } : s));
    setDetailSubject({ ...detailSubject, ...data });
    toast.success("主体已更新");
  };

  const openDetail = (subject: SubjectItem) => { setDetailSubject(subject); setDetailMode("view"); };
  const openEdit = (subject: SubjectItem) => { setDetailSubject(subject); setDetailMode("edit"); };
  const openCreate = (type: SubjectType) => { setCreateType(type); setDetailSubject(null); setDetailMode("create"); };

  const handleDeleteSingle = (subjectId: string) => {
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
    setDetailSubject(null);
    toast.success("主体已删除");
  };

  return (
    <div className="flex h-full overflow-hidden relative" style={{ background: "#140F09" }}>
      {/* ── Left Sidebar (absolute, full height to top) ──────────────────── */}
      <div
        className="flex flex-col flex-shrink-0 relative"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: sidebarOpen ? "240px" : "0px",
          background: "#110E0A",
          borderRight: sidebarOpen ? "1px solid rgba(255,255,255,0.05)" : "none",
          transition: "width 0.2s ease",
          overflow: "visible",
          zIndex: 20,
        }}
        onClick={() => { setShowMemberMenu(false); setSidebarMoreId(null); }}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setSidebarOpen(!sidebarOpen); }}
          className="absolute top-2.5 -right-5 z-10 w-5 h-5 rounded flex items-center justify-center hover:bg-white/10"
          style={{ color: "rgba(255,255,255,0.35)" }}
          title={sidebarOpen ? "收起侧边栏" : "展开侧边栏"}
        >
          <ChevronLeft size={11} style={{ transform: sidebarOpen ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.2s" }} />
        </button>

        {sidebarOpen && (
          <div className="flex flex-col h-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center px-3 py-2 flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>资产</span>
            </div>

            <div className="flex items-center gap-1 px-2 py-1.5 flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              {[
                { key: "generate" as const, label: "生成", icon: Sparkles, color: "#E87322" },
                { key: "upload" as const, label: "上传", icon: Upload, color: "#3b82f6" },
                { key: "subject" as const, label: "主体", icon: Package, color: "#4AC678" },
                { key: "collect" as const, label: "收藏", icon: Star, color: "#a78bfa" },
              ].map(({ key, label, icon: Icon, color }) => (
                <button
                  key={key}
                  onClick={() => setAssetSubTab(key)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs transition-colors"
                  style={{
                    background: assetSubTab === key ? `${color}18` : "transparent",
                    color: assetSubTab === key ? color : "rgba(255,255,255,0.35)",
                  }}
                >
                  <Icon size={10} />
                  <span style={{ fontSize: "10px" }}>{label}</span>
                </button>
              ))}
            </div>

            {!(assetSubTab === "subject" && sidebarDetailAsset && "type" in sidebarDetailAsset && !("size" in sidebarDetailAsset)) && (
            <div className="flex items-center gap-1.5 px-2 py-1.5 flex-shrink-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 rounded px-1.5 py-1" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <Search size={8} style={{ color: "rgba(255,255,255,0.25)" }} />
                  <input
                    className="bg-transparent flex-1 outline-none min-w-0"
                    style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", caretColor: "#E87322", padding: 0 }}
                    placeholder="搜索..."
                    value={assetSearch}
                    onChange={(e) => setAssetSearch(e.target.value)}
                  />
                  {assetSearch && (
                    <button onClick={() => setAssetSearch("")}>
                      <X size={8} style={{ color: "rgba(255,255,255,0.25)" }} />
                    </button>
                  )}
                </div>
              </div>
              {/* Subject tab: no member filter, but has asset type + review status */}
              {assetSubTab === "subject" ? (
                <>
              <select
                className="flex-shrink-0 rounded cursor-pointer outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "10px",
                  padding: "2px 4px",
                  maxWidth: "60px",
                }}
                value={assetTypeFilter}
                onChange={(e) => setAssetTypeFilter(e.target.value as AssetType)}
              >
                <option value="image" style={{ background: "#2A2018" }}>图片</option>
                <option value="video" style={{ background: "#2A2018" }}>视频</option>
                <option value="audio" style={{ background: "#2A2018" }}>音频</option>
              </select>
              <select
                className="flex-shrink-0 rounded cursor-pointer outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "10px",
                  padding: "2px 4px",
                  maxWidth: "65px",
                }}
                value={subjectReviewFilter}
                onChange={(e) => setSubjectReviewFilter(e.target.value as ReviewStatusFilter)}
              >
                <option value="all" style={{ background: "#2A2018" }}>全部</option>
                <option value="approved" style={{ background: "#2A2018" }}>通过</option>
                <option value="pending" style={{ background: "#2A2018" }}>审核中</option>
                <option value="rejected" style={{ background: "#2A2018" }}>失败</option>
              </select>
                </>
              ) : (
                /* Other tabs: member filter + asset type select */
                <>
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setShowMemberMenu(!showMemberMenu)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors"
                  style={{
                    background: (memberFilter.length >= PROJECT_MEMBERS.length) ? "rgba(255,255,255,0.04)" : "rgba(232,115,34,0.12)",
                    border: (memberFilter.length >= PROJECT_MEMBERS.length) ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(232,115,34,0.25)",
                    color: (memberFilter.length >= PROJECT_MEMBERS.length) ? "rgba(255,255,255,0.4)" : "#E87322",
                  }}
                >
                  <Users size={8} />
                  {memberFilter.length === PROJECT_MEMBERS.length ? "全部" : `${memberFilter.length}人`}
                  <ChevronDown size={6} style={{ marginLeft: "1px" }} />
                </button>
                {showMemberMenu && (
                  <div className="absolute left-0 top-full mt-1 rounded-xl overflow-hidden z-30 shadow-2xl"
                    style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)", width: "150px" }}>
                    {PROJECT_MEMBERS.map(member => {
                      const selected = memberFilter.includes(member.id);
                      return (
                        <button
                          key={member.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (selected) {
                              setMemberFilter(prev => prev.filter(id => id !== member.id));
                            } else {
                              setMemberFilter(prev => [...prev, member.id]);
                            }
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors"
                          style={{
                            background: selected ? `${member.color}15` : "transparent",
                            color: selected ? member.color : "rgba(255,255,255,0.6)",
                          }}
                        >
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: member.color, fontSize: "8px", color: "#fff" }}>{member.avatar}</div>
                          <span className="flex-1">{member.name}</span>
                          {selected && (
                            <Check size={10} style={{ color: member.color }} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <select
                className="flex-shrink-0 rounded cursor-pointer outline-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "10px",
                  padding: "2px 4px",
                  maxWidth: "60px",
                }}
                value={assetTypeFilter}
                onChange={(e) => setAssetTypeFilter(e.target.value as AssetType)}
              >
                <option value="image" style={{ background: "#2A2018" }}>图片</option>
                <option value="video" style={{ background: "#2A2018" }}>视频</option>
                <option value="audio" style={{ background: "#2A2018" }}>音频</option>
              </select>
              </>
              )}
            </div>
            )}

            {/* Asset grid — with drag support */}
            <div className="flex-1 overflow-auto px-2 pb-2 pt-1 relative">
              {assetSubTab === "upload" && (
                <button
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg mb-2 transition-colors"
                  style={{ border: "1px dashed rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)", fontSize: "10px" }}
                  onClick={() => toast.success("请选择文件上传")}
                >
                  <Upload size={10} />上传资产
                </button>
              )}

              {/* Subject tab: grouped by type with expand/collapse */}
              {assetSubTab === "subject" ? (
                sidebarDetailAsset && "type" in sidebarDetailAsset && !("size" in sidebarDetailAsset) ? (
                  sidebarDetailAsset.type === "sd_ip" ? (
                    <SidebarSdIpDetail
                      subject={sidebarDetailAsset as SubjectItem}
                      onBack={() => setSidebarDetailAsset(null)}
                      onUpdate={(updates) => {
                        setSubjects(prev => prev.map(s => s.id === sidebarDetailAsset.id ? { ...s, ...updates } : s));
                        setSidebarDetailAsset(prev => prev && "type" in prev ? { ...prev, ...updates } as SubjectItem : prev);
                      }}
                    />
                  ) : (
                    <SubjectSidebarDetail
                      subject={sidebarDetailAsset as SubjectItem}
                      onBack={() => setSidebarDetailAsset(null)}
                      onUpdate={(updates) => {
                        setSubjects(prev => prev.map(s => s.id === (sidebarDetailAsset as SubjectItem).id ? { ...s, ...updates } : s));
                        setSidebarDetailAsset(prev => prev && "type" in prev ? { ...prev, ...updates } as SubjectItem : prev);
                      }}
                    />
                  )
                ) : (
                <div className="flex flex-col gap-2">
                  {(Object.entries(TYPE_CONFIG) as [SubjectType, typeof TYPE_CONFIG[SubjectType]][]).map(([type, tConfig]) => {
                    const typeSubjects = subjects.filter(s => {
                      if (s.type !== type) return false;
                      if (s.type === "sd_ip" && subjectReviewFilter !== "all" && s.reviewStatus !== subjectReviewFilter) return false;
                      return true;
                    });
                    if (typeSubjects.length === 0) return null;
                    const TypeIcon = tConfig.icon;
                    const expanded = sidebarSubjectExpanded[type];
                    return (
                      <div key={type}>
                        <button
                          className="w-full flex items-center gap-1.5 px-1 py-1 rounded transition-colors hover:bg-white/5"
                          onClick={() => setSidebarSubjectExpanded(prev => ({ ...prev, [type]: !prev[type] }))}
                        >
                          <ChevronDown size={9} style={{ color: "rgba(255,255,255,0.3)", transform: expanded ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.15s" }} />
                          <TypeIcon size={9} style={{ color: tConfig.color }} />
                          <span style={{ fontSize: "9px", color: tConfig.color, fontWeight: 600, letterSpacing: "0.03em" }}>{tConfig.label}</span>
                          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)" }}>{typeSubjects.length}</span>
                        </button>
                        {expanded && (
                          <div className="grid grid-cols-2 gap-1.5 mt-1">
                            {typeSubjects.map((subject) => {
                              const showOverlay = subject.type === "sd_ip" && (subject.reviewStatus === "pending" || subject.reviewStatus === "rejected");
                              const statusCfg = subject.reviewStatus ? STATUS_CONFIG[subject.reviewStatus] : null;
                              const assetType = subject.type === "sd_ip" ? (subject.assetType ?? "image") : "image";
                              const ASSET_ICON_MAP: Record<VirtualIpAssetType, { icon: typeof LucideImage; color: string }> = {
                                image: { icon: LucideImage, color: "rgba(255,255,255,0.7)" },
                                video: { icon: Video, color: "rgba(255,255,255,0.7)" },
                                audio: { icon: Music, color: "rgba(255,255,255,0.7)" },
                              };
                              const assetInfo = ASSET_ICON_MAP[assetType];
                              const AssetIcon = assetInfo.icon;
                              return (
                                <div
                                  key={subject.id}
                                  className="relative rounded-md overflow-hidden cursor-pointer group"
                                  style={{ aspectRatio: "1", background: "#1A1510" }}
                                  draggable
                                  onDragStart={(e) => {
                                    e.dataTransfer.setData("text/plain", JSON.stringify({ src: subject.image, name: subject.name }));
                                    e.dataTransfer.effectAllowed = "copy";
                                  }}
                                  onClick={() => setSidebarDetailAsset(subject)}
                                >
                                  {/* Top-left: asset type icon + status badge */}
                                  <div className="absolute top-1 left-1 z-10 flex items-center gap-0.5">
                                    <div className="px-1 py-0.5 rounded flex items-center" style={{ background: "rgba(0,0,0,0.6)" }}>
                                      <AssetIcon size={7} style={{ color: assetInfo.color }} />
                                    </div>
                                    {subject.type === "sd_ip" && statusCfg && (
                                      <span className="px-1 py-0.5 rounded-full text-[8px]"
                                        style={{ background: statusCfg.bg, color: statusCfg.text }}>
                                        {statusCfg.label}
                                      </span>
                                    )}
                                  </div>
                                  {showOverlay && statusCfg && (
                                    <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center" style={{ background: "rgba(0,0,0,0.65)" }}>
                                      <div className="text-lg mb-0.5">{subject.reviewStatus === "pending" ? "⏳" : "❌"}</div>
                                      <span className="text-[8px] font-medium" style={{ color: statusCfg.text }}>
                                        {statusCfg.label}
                                      </span>
                                    </div>
                                  )}
                                  <img
                                    src={subject.image}
                                    alt={subject.name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                  <div
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                    style={{ background: "rgba(0,0,0,0.45)" }}
                                  >
                                    <div className="absolute top-1 right-1 flex items-center gap-0.5">
                                      <div className="relative">
                                        <button
                                          className="w-4 h-4 rounded flex items-center justify-center"
                                          style={{ background: "rgba(255,255,255,0.15)" }}
                                          onClick={(e) => { e.stopPropagation(); setSidebarMoreId(sidebarMoreId === subject.id ? null : subject.id); }}
                                        >
                                          <MoreVertical size={7} style={{ color: "rgba(255,255,255,0.8)" }} />
                                        </button>
                                        {sidebarMoreId === subject.id && (
                                          <div className="absolute right-0 top-full mt-0.5 rounded-lg overflow-hidden z-30 shadow-xl"
                                            style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)", minWidth: "70px" }}
                                            onClick={(e) => e.stopPropagation()}>
                                            <button className="w-full flex items-center gap-1.5 px-2 py-1 text-left text-xs transition-colors hover:bg-white/5"
                                              style={{ color: "rgba(255,255,255,0.6)", fontSize: "9px" }}
                                              onClick={() => { toast.success("已下载"); setSidebarMoreId(null); }}>
                                              <Download size={7} />下载
                                            </button>
                                            <button className="w-full flex items-center gap-1.5 px-2 py-1 text-left text-xs transition-colors hover:bg-white/5"
                                              style={{ color: "#ff6b6b", fontSize: "9px" }}
                                              onClick={() => { setSubjects(prev => prev.filter(s => s.id !== subject.id)); setSidebarMoreId(null); toast.success("已删除"); }}>
                                              <Trash2 size={7} />删除
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="absolute bottom-0 inset-x-0 px-1 py-0.5" style={{ background: "linear-gradient(transparent, rgba(0,0,0,0.7))" }}>
                                    <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.85)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{subject.name}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                )
              ) : filteredAssets.length > 0 ? (
                <div className="grid grid-cols-2 gap-1.5">
                  {filteredAssets.map((asset) => {
                    const dragPayload = JSON.stringify({ src: asset.src, name: asset.name });
                    const isCollected = sidebarCollectIds.has(asset.id);
                    const TYPE_ICON_MAP: Record<AssetType, { icon: typeof LucideImage; color: string }> = {
                      image: { icon: LucideImage, color: "rgba(255,255,255,0.7)" },
                      video: { icon: Video, color: "rgba(255,255,255,0.7)" },
                      audio: { icon: Music, color: "rgba(255,255,255,0.7)" },
                    };
                    const typeInfo = TYPE_ICON_MAP[asset.type];
                    const TypeIco = typeInfo.icon;
                    const appliedIds = new Set(["g1", "g4", "s1", "u1"]);
                    const isApplied = appliedIds.has(asset.id);
                    return (
                      <div
                        key={asset.id}
                        className="relative rounded-md overflow-hidden cursor-pointer group"
                        style={{ aspectRatio: "1", background: "#1A1510" }}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", dragPayload);
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        onClick={() => setSidebarDetailAsset(asset)}
                      >
                        <img
                          src={asset.src}
                          alt={asset.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* Top-left: type icon + applied tag */}
                        <div className="absolute top-1 left-1 flex items-center gap-0.5">
                          <div className="px-1 py-0.5 rounded flex items-center" style={{ background: "rgba(0,0,0,0.6)" }}>
                            <TypeIco size={7} style={{ color: typeInfo.color }} />
                          </div>
                          {isApplied && (
                            <span className="px-1 py-0.5 rounded text-[7px]" style={{ background: "rgba(74,198,120,0.2)", color: "#4AC678" }}>已应用</span>
                          )}
                        </div>
                        {/* Hover overlay with collect + more */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: "rgba(0,0,0,0.45)" }}
                        >
                          <div className="absolute top-1 right-1 flex items-center gap-0.5">
                            <button
                              className="w-4 h-4 rounded flex items-center justify-center"
                              style={{ background: isCollected ? "rgba(255,200,50,0.25)" : "rgba(255,255,255,0.15)" }}
                              onClick={(e) => { e.stopPropagation(); setSidebarCollectIds(prev => { const next = new Set(prev); isCollected ? next.delete(asset.id) : next.add(asset.id); return next; }); }}
                            >
                              <Star size={7} style={{ color: isCollected ? "#ffc832" : "rgba(255,255,255,0.8)" }} fill={isCollected ? "#ffc832" : "none"} />
                            </button>
                            <div className="relative">
                              <button
                                className="w-4 h-4 rounded flex items-center justify-center"
                                style={{ background: "rgba(255,255,255,0.15)" }}
                                onClick={(e) => { e.stopPropagation(); setSidebarMoreId(sidebarMoreId === asset.id ? null : asset.id); }}
                              >
                                <MoreVertical size={7} style={{ color: "rgba(255,255,255,0.8)" }} />
                              </button>
                              {sidebarMoreId === asset.id && (
                                <div className="absolute right-0 top-full mt-0.5 rounded-lg overflow-hidden z-30 shadow-xl"
                                  style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)", minWidth: "70px" }}
                                  onClick={(e) => e.stopPropagation()}>
                                  <button className="w-full flex items-center gap-1.5 px-2 py-1 text-left text-xs transition-colors hover:bg-white/5"
                                    style={{ color: "rgba(255,255,255,0.6)", fontSize: "9px" }}
                                    onClick={() => { toast.success("已下载"); setSidebarMoreId(null); }}>
                                    <Download size={7} />下载
                                  </button>
                                  <button className="w-full flex items-center gap-1.5 px-2 py-1 text-left text-xs transition-colors hover:bg-white/5"
                                    style={{ color: "#ff6b6b", fontSize: "9px" }}
                                    onClick={() => { toast.success("已删除"); setSidebarMoreId(null); }}>
                                    <Trash2 size={7} />删除
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center rounded-lg"
                  style={{ height: "80px", border: "1px dashed rgba(255,255,255,0.1)" }}
                >
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>暂无内容</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden relative" style={{ background: "#1A1510", marginLeft: sidebarOpen ? "240px" : "0px", transition: "margin-left 0.2s ease" }}>
        {/* Top Bar */}
        <div className="flex items-center gap-4 px-6 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-1 flex-shrink-0">
            {(Object.entries(TYPE_CONFIG) as [SubjectType, typeof TYPE_CONFIG[SubjectType]][]).map(([type, config]) => {
              const isActive = activeType === type;
              const count = totalByType[type];
              return (
                <button key={type} onClick={() => setActiveType(type)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                  style={{
                    background: isActive ? `${config.color}20` : "transparent",
                    color: isActive ? config.color : "rgba(255,255,255,0.4)",
                    border: isActive ? `1px solid ${config.color}40` : "1px solid transparent",
                  }}>
                  <span>{config.label}</span>
                  <span style={{ fontSize: "10px", opacity: 0.6 }}>{count}</span>
                </button>
              );
            })}
          </div>
          <div className="flex-1" />
          <div className="flex items-center">
            <input type="text" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} placeholder="搜索主体..."
              className="px-3 py-1.5 rounded-lg outline-none w-40 text-xs transition-all focus:w-56"
              style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.85)", border: searchKeyword ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.08)" }}
            />
            {searchKeyword && (
              <button onClick={() => setSearchKeyword("")} className="ml-1 p-1 rounded hover:bg-white/5" style={{ color: "rgba(255,255,255,0.4)" }}>
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto px-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* ── Creation card for current type ─── */}
            {(() => {
              const config = TYPE_CONFIG[activeType];
              const TypeIcon = config.icon;
              const isSd = activeType === "sd_ip";
              return (
                <button
                  onClick={() => openCreate(activeType)}
                  className="rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  style={{
                    background: `${config.color}08`,
                    border: `1px dashed ${config.color}30`,
                    height: "200px",
                  }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: `${config.color}18` }}>
                    <TypeIcon size={20} style={{ color: config.color }} />
                  </div>
                  <span style={{ fontSize: "13px", color: config.color, fontWeight: 500 }}>新建{config.label}</span>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                    {isSd ? "上传照片即可创建" : "上传 + 详细信息"}
                  </span>
                </button>
              );
            })()}

            {filteredSubjects.map((subject) => {
              const tc = TYPE_CONFIG[subject.type];
              const showOverlay = subject.type === "sd_ip" && subject.reviewStatus && (subject.reviewStatus === "pending" || subject.reviewStatus === "rejected");
              return (
                <div key={subject.id} className="rounded-xl overflow-hidden relative group"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  onClick={() => {
                    if (subject.type === "sd_ip") { setSdIpView(subject); } else { openDetail(subject); }
                  }}>
                  {subject.type === "sd_ip" && subject.reviewStatus && (
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="px-2 py-0.5 rounded-full text-[10px]"
                        style={{ background: STATUS_CONFIG[subject.reviewStatus].bg, color: STATUS_CONFIG[subject.reviewStatus].text }}>
                        {STATUS_CONFIG[subject.reviewStatus].label}
                      </span>
                    </div>
                  )}
                  {subject.type === "sd_ip" && (
                    <div className="absolute top-2.5 right-2.5 z-[10] flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteSingle(subject.id); }}
                        className="w-6 h-6 rounded flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.5)" }}>
                        <Trash2 size={10} style={{ color: "#ff6b6b" }} />
                      </button>
                    </div>
                  )}
                  {/* Overlay for pending/rejected SD IP cards */}
                  {showOverlay && subject.reviewStatus && (
                    <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center" style={{ background: "rgba(0,0,0,0.65)" }}>
                      <div className="text-3xl mb-2">{subject.reviewStatus === "pending" ? "⏳" : "❌"}</div>
                      <span className="text-sm font-medium" style={{ color: STATUS_CONFIG[subject.reviewStatus].text }}>
                        {STATUS_CONFIG[subject.reviewStatus].label}
                      </span>
                      {subject.reviewStatus === "rejected" && (
                        <span className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>请重新提交审核</span>
                      )}
                    </div>
                  )}
                  {subject.type !== "sd_ip" && (
                    <div className="absolute top-2.5 right-2.5 z-10 flex gap-1 opacity-0 group-hover:opacity-100">
                   
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteSingle(subject.id); }}
                        className="w-6 h-6 rounded flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.5)" }}>
                        <Trash2 size={10} style={{ color: "#ff6b6b" }} />
                      </button>
                    </div>
                  )}
                  {subject.image ? (
                    <img src={subject.image} alt={subject.name} className="w-full object-cover" style={{ height: "160px" }} />
                  ) : (
                    <div className="flex items-center justify-center" style={{ height: "160px", background: "rgba(255,255,255,0.02)" }}>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)" }}>暂无图片</span>
                    </div>
                  )}
                  <div className="px-3 py-2.5 flex items-center gap-1.5 relative group/name"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    {inlineEditId === subject.id ? (
                      <input autoFocus
                        className="flex-1 bg-transparent text-xs outline-none px-1 py-0.5 rounded"
                        style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)", fontWeight: 500, border: "1px solid rgba(232,115,34,0.5)", caretColor: "#E87322" }}
                        value={inlineEditValue}
                        onChange={(e) => setInlineEditValue(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={() => {
                          if (inlineEditValue.trim() && inlineEditValue.trim() !== subject.name) {
                            setSubjects(prev => prev.map(s => s.id === subject.id ? { ...s, name: inlineEditValue.trim() } : s));
                            toast.success("名称已更新");
                          }
                          setInlineEditId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (inlineEditValue.trim()) {
                              setSubjects(prev => prev.map(s => s.id === subject.id ? { ...s, name: inlineEditValue.trim() } : s));
                              toast.success("名称已更新");
                            }
                            setInlineEditId(null);
                          }
                          if (e.key === "Escape") setInlineEditId(null);
                        }}
                      />
                    ) : (
                      <>
                        <span className="truncate flex-1" style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{subject.name}</span>
                        <button
                          className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover/name:opacity-100 transition-opacity"
                          style={{ background: "rgba(255,255,255,0.08)" }}
                          title="修改名称"
                          onClick={(e) => {
                            e.stopPropagation();
                            setInlineEditId(subject.id);
                            setInlineEditValue(subject.name);
                          }}
                        >
                          <Pencil size={9} style={{ color: "rgba(255,255,255,0.5)" }} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredSubjects.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(255,255,255,0.03)" }}>
                <Users size={24} style={{ color: "rgba(255,255,255,0.1)" }} />
              </div>
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>
                {searchKeyword ? "未找到匹配的主体" : "暂无主体，点击上方卡片创建"}
              </span>
            </div>
          )}
        </div>

        {(detailMode === "create" || detailSubject) && (
          <SubjectDetailPage
            mode={detailMode}
            defaultType={detailMode === "create" ? createType : undefined}
            subject={detailMode === "create" ? undefined : detailSubject || undefined}
            onClose={() => { setDetailSubject(null); setDetailMode("view"); }}
            onSave={detailMode === "create" ? handleCreate : handleEdit}
          />
        )}

        {sdIpView && (
          <SdIpFullscreenView
            subject={sdIpView}
            onClose={() => setSdIpView(null)}
            onReplaceImage={(newImg) => {
              setSubjects(prev => prev.map(s => s.id === sdIpView.id ? { ...s, image: newImg } : s));
              setSdIpView(prev => prev ? { ...prev, image: newImg } : null);
            }}
          />
        )}
      </div>

      {/* Asset detail dialogs — rendered at page level so they overlay everything */}
      {sidebarDetailAsset && "size" in sidebarDetailAsset && sidebarDetailAsset.source === "ai" && (
        <GenerateAssetDetail
          asset={sidebarDetailAsset as SidebarAsset}
          open={true}
          onClose={() => setSidebarDetailAsset(null)}
        />
      )}
      {sidebarDetailAsset && "size" in sidebarDetailAsset && sidebarDetailAsset.source !== "ai" && (
        <UploadAssetDetail
          asset={sidebarDetailAsset as SidebarAsset}
          open={true}
          onClose={() => setSidebarDetailAsset(null)}
        />
      )}
    </div>
  );
}
