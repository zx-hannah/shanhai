import { useState, useRef } from "react";
import { useParams } from "react-router";
import {
  Users, User, TreePalm, Package, Sparkles, Upload,
  Plus, Search, X, Pencil, Trash2,
  Star, Video, Music, Image as LucideImage, ChevronLeft, ChevronDown
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────
type SubjectType = "sd_ip" | "character" | "scene" | "prop";
type ReviewStatus = "pending" | "approved" | "rejected" | "expired";
type ExpiryType = "permanent" | "date_range";
type SubTab = "generate" | "upload" | "subject" | "collect";

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
  // AI generation fields for character/scene/prop
  referenceImage?: string;
  promptText?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────
const INITIAL_SUBJECTS: SubjectItem[] = [
  { id: "sd1", name: "周星驰", type: "sd_ip", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop", updatedAt: "2026-01-12", reviewStatus: "approved", expiryType: "date_range", validFrom: "2024-01-15", validTo: "2025-01-15" },
  { id: "sd2", name: "成龙", type: "sd_ip", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=200&fit=crop", updatedAt: "2026-01-12", reviewStatus: "pending", expiryType: "date_range", validFrom: "2024-01-20", validTo: "2025-07-20" },
  { id: "sd3", name: "古风琴师", type: "sd_ip", image: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=300&h=200&fit=crop", updatedAt: "2026-01-10", reviewStatus: "approved", expiryType: "permanent" },
  { id: "sd4", name: "山神·青帝", type: "sd_ip", image: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=300&h=200&fit=crop", updatedAt: "2026-01-08", reviewStatus: "rejected", expiryType: "date_range", validFrom: "2024-02-10", validTo: "2024-05-10" },
  { id: "sd5", name: "黄渤", type: "sd_ip", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=200&fit=crop", updatedAt: "2026-01-05", reviewStatus: "approved", expiryType: "date_range", validFrom: "2024-03-05", validTo: "2025-03-05" },
  { id: "char1", name: "女主角·林月", type: "character", image: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=300&h=200&fit=crop", updatedAt: "2026-01-11", description: "主角，性格坚毅的修仙女子，擅长剑术与法术。", referenceImage: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=600&fit=crop", promptText: "一位身穿青色长裙的修仙女子，腰佩长剑，站在昆仑山巅，云雾缭绕，仙气飘飘，中国古风，精致面部特征，飘逸长发，背景为仙境般的云海与仙山，电影级光影，8K超高清", episodes: ["第一集","第二集","第三集","第四集","第五集","第六集"] },
  { id: "char2", name: "男主角·风清扬", type: "character", image: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=300&h=200&fit=crop", updatedAt: "2026-01-10", description: "隐世剑客，身怀绝技却不露锋芒。", referenceImage: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=600&fit=crop", promptText: "一位白衣剑客，手持竹剑，站在竹林深处，月光透过竹叶洒下斑驳光影，侠客气质，淡然从容，中国水墨画风格，武侠意境，电影级光影渲染", episodes: ["第一集","第三集","第四集","第五集","第六集"] },
  { id: "char3", name: "反派·墨渊", type: "character", image: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=300&h=200&fit=crop", updatedAt: "2026-01-09", description: "魔尊转世，企图毁灭仙界重建秩序。", referenceImage: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=600&fit=crop", promptText: "暗黑系反派，身穿黑色魔甲，站在深渊边缘，背后是翻腾的魔火与暗黑符文，红色双眼散发邪光，史诗级暗黑奇幻风格，压迫感十足，电影级渲染", episodes: ["第二集","第四集","第五集","第六集"] },
  { id: "char4", name: "配角·小桃", type: "character", image: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=300&h=200&fit=crop", updatedAt: "2026-01-08", description: "灵狐精怪，活泼可爱，林月的贴身伙伴。", referenceImage: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=600&fit=crop", promptText: "活泼可爱的少女形象，粉色系服装，头戴狐耳装饰，站在桃花树下，花瓣飘落，阳光明媚，梦幻氛围，日系动漫融合中国古风风格", episodes: ["第一集","第三集","第五集"] },
  { id: "scene1", name: "仙山·昆仑", type: "scene", image: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=300&h=200&fit=crop", updatedAt: "2026-01-12", description: "昆仑仙山，云雾缭绕，修仙门派圣地。", referenceImage: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=600&fit=crop", promptText: "昆仑仙山全景，云雾缭绕的山峰直插云霄，山顶有仙宫楼阁，飞檐翘角，仙鹤飞翔，金色阳光穿透云层形成丁达尔效应，中国山水画风格，宏大壮丽，8K超高清", episodes: ["第一集","第二集","第三集","第四集","第五集","第六集","第七集"] },
  { id: "scene2", name: "古城镇·青云", type: "scene", image: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=300&h=200&fit=crop", updatedAt: "2026-01-09", description: "青云古镇，青石板路，白墙黑瓦。", referenceImage: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=600&fit=crop", promptText: "古风城镇俯视角，青石板街道蜿蜒，两侧是白墙黑瓦的古典建筑，红色灯笼悬挂，小桥流水，柳树垂枝，阳光温暖，中国江南水乡风格，精致细节", episodes: ["第一集","第二集","第四集"] },
  { id: "scene3", name: "魔域·深渊", type: "scene", image: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=300&h=200&fit=crop", updatedAt: "2026-01-07", description: "魔域深渊，暗黑诡谲，魔尊领地。", referenceImage: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=600&fit=crop", promptText: "暗黑深渊场景，巨大的裂谷中涌出暗红岩浆，上方是扭曲的黑色岩石和锁链，空气中飘浮着暗火，压抑而恐怖的氛围，史诗级暗黑奇幻风格，电影级渲染", episodes: ["第二集","第五集","第六集"] },
  { id: "scene4", name: "秘境·灵谷", type: "scene", image: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=300&h=200&fit=crop", updatedAt: "2026-01-05", description: "灵谷秘境，灵气充裕，珍稀灵草遍布。", referenceImage: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=600&fit=crop", promptText: "灵气弥漫的山谷秘境，翠绿草地，发光灵草散落各处，中央有一汪清泉，蝴蝶飞舞，远处是瀑布和彩虹，梦幻仙境氛围，吉卜力风格融合中国风水墨", episodes: ["第三集","第四集"] },
  { id: "prop1", name: "法宝·流云剑", type: "prop", image: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=300&h=200&fit=crop", updatedAt: "2026-01-10", description: "上古神兵，剑身如流云般飘逸。", referenceImage: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=600&fit=crop", promptText: "一把中国古风宝剑，剑身修长，表面有云纹流转，剑柄镶嵌蓝宝石，剑穗飘逸，散发着淡蓝色光芒，3D渲染，精致金属质感，暗色背景突出主体", episodes: ["第一集","第三集","第五集","第六集"] },
  { id: "prop2", name: "神器·天音琴", type: "prop", image: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=300&h=200&fit=crop", updatedAt: "2026-01-08", description: "天界乐器，琴声可治愈一切伤痛。", referenceImage: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=600&fit=crop", promptText: "一把古朴典雅的七弦琴，木质琴身有精美雕刻，琴弦散发金色光芒，琴面上有仙鹤与祥云图案，悬浮在半空中，周围有音符光效，奇幻风格，精致细节", episodes: ["第二集","第四集","第五集"] },
  { id: "prop3", name: "灵器·护心镜", type: "prop", image: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=300&h=200&fit=crop", updatedAt: "2026-01-06", description: "可抵御一切法术攻击的护心宝镜。", referenceImage: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=600&fit=crop", promptText: "一面圆形铜镜，表面光滑如银，镜框刻有八卦与符文，边缘镶嵌翡翠，镜面散发淡金色防护光晕，古风法器设计，3D渲染，金属与玉石质感对比鲜明", episodes: ["第四集","第六集"] },
];

const SUB_TABS: { key: SubTab; label: string; icon: typeof Sparkles }[] = [
  { key: "generate", label: "生成", icon: Sparkles },
  { key: "upload",   label: "上传", icon: Upload   },
  { key: "subject",  label: "主体", icon: Package  },
  { key: "collect",  label: "收藏", icon: Star     },
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

// ─── Subject Detail Full-Screen Page ────────────────────────────────────────────
interface SubjectDetailProps {
  mode: "create" | "edit" | "view";
  subject?: SubjectItem;
  onClose: () => void;
  onSave: (data: Omit<SubjectItem, "id" | "updatedAt">) => void;
}

function SubjectDetailPage({ mode, subject, onClose, onSave }: SubjectDetailProps) {
  const [name, setName] = useState(subject?.name || "");
  const [description, setDescription] = useState(subject?.description || "");
  const [image, setImage] = useState(subject?.image || "");
  const [referenceImage, setReferenceImage] = useState(subject?.referenceImage || "");
  const [promptText, setPromptText] = useState(subject?.promptText || "");
  const [isEditingDesc, setIsEditingDesc] = useState(mode === "create");
  const [isEditingName, setIsEditingName] = useState(mode === "create");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const refFileInputRef = useRef<HTMLInputElement>(null);

  const totalEpisodes = 8;
  const epCount = subject?.episodes?.length || 0;
  const epPct = epCount > 0 ? ((epCount / totalEpisodes) * 100).toFixed(0) + "%" : "0%";
  const typeConfig = subject ? TYPE_CONFIG[subject.type] : null;
  const isSdIp = subject?.type === "sd_ip";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImage(URL.createObjectURL(file)); toast.success("图片已更新"); }
  };

  const handleRefImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setReferenceImage(URL.createObjectURL(file)); toast.success("参考图已更新"); }
  };

  const handleSave = () => {
    if (!name.trim()) { toast.error("请输入资产名称"); return; }
    onSave({ name: name.trim(), type: subject?.type || "sd_ip", image: image || "", description: description.trim() || undefined, referenceImage: referenceImage || undefined, promptText: promptText.trim() || undefined });
    if (mode === "create") onClose();
  };

  const renderLeftColumn = () => (
    <>
      {/* Name */}
      <div className="mb-6">
        <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>名称</label>
        {isEditingName || mode === "create" ? (
          <input className="w-full px-3 py-2 rounded-lg outline-none"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.85)", fontSize: "15px", fontWeight: 600, border: "1px solid rgba(255,255,255,0.1)" }}
            value={name} onChange={(e) => setName(e.target.value)} onBlur={() => setIsEditingName(false)}
            placeholder="输入主体名称" autoFocus={mode === "create"} />
        ) : (
          <div onClick={() => setIsEditingName(true)} className="cursor-pointer py-2 rounded-lg hover:bg-white/5 transition-colors">
            <span style={{ fontSize: "15px", color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>
              {name || <span style={{ color: "rgba(255,255,255,0.2)" }}>点击设置名称</span>}
            </span>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mb-8">
        <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>描述</label>
        {isEditingDesc || mode === "create" ? (
          <textarea className="w-full px-3 py-2 rounded-lg outline-none resize-none"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", fontSize: "13px", border: "1px solid rgba(255,255,255,0.1)", lineHeight: 1.7 }}
            rows={3} value={description} onChange={(e) => setDescription(e.target.value)} onBlur={() => setIsEditingDesc(false)}
            placeholder="输入主体描述" />
        ) : (
          <div onClick={() => setIsEditingDesc(true)} className="cursor-pointer py-2 rounded-lg hover:bg-white/5 transition-colors min-h-[48px]">
            <p style={{ fontSize: "13px", color: description ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)", lineHeight: 1.7 }}>
              {description || "点击添加描述"}
            </p>
          </div>
        )}
      </div>

      {/* Episode data */}
      {subject?.episodes && subject.episodes.length > 0 && (
        <>
          <div className="mb-8">
            <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "8px" }}>剧集数据</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl p-5 flex flex-col items-center justify-center" style={{ background: "rgba(232,115,34,0.06)", border: "1px solid rgba(232,115,34,0.15)" }}>
                <span style={{ fontSize: "32px", fontWeight: 700, color: "#E87322", lineHeight: 1 }}>{epCount}</span>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>剧集数</span>
              </div>
              <div className="rounded-xl p-5 flex flex-col items-center justify-center" style={{ background: "rgba(123,60,196,0.06)", border: "1px solid rgba(123,60,196,0.15)" }}>
                <span style={{ fontSize: "32px", fontWeight: 700, color: "#7B3FC4", lineHeight: 1 }}>{epPct}</span>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "6px" }}>占比</span>
              </div>
            </div>
          </div>
          <div>
            <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "8px" }}>出现分镜</label>
            <div className="flex flex-wrap gap-2">
              {subject.episodes.map((ep, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-xs"
                  style={{ background: "rgba(232,115,34,0.1)", color: "#E87322", border: "1px solid rgba(232,115,34,0.2)" }}>{ep}</span>
              ))}
            </div>
          </div>
        </>
      )}
      {(!subject?.episodes || subject.episodes.length === 0) && mode !== "create" && (
        <div className="text-center py-8" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>暂无剧集数据</span>
        </div>
      )}
    </>
  );

  const renderRightColumn = () => (
    <>
      {/* 图片 */}
      <div className="mb-6">
        <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>图片</label>
        <div className="relative rounded-lg overflow-hidden" style={{ background: "#1A1510", aspectRatio: "16/10" }}>
          {image ? (
            <img src={image} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: "rgba(255,255,255,0.15)", fontSize: "12px" }}>暂无图片</div>
          )}
          {mode !== "view" && (
            <>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded text-[10px]"
                style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.8)" }}>
                <Upload size={10} />{image ? "替换" : "上传"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* 参考图 */}
      <div className="mb-6">
        <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>参考图</label>
        <div className="relative rounded-lg overflow-hidden" style={{ background: "#1A1510", aspectRatio: "16/10" }}>
          {referenceImage ? (
            <img src={referenceImage} alt="参考图" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: "rgba(255,255,255,0.15)", fontSize: "12px" }}>暂无参考图</div>
          )}
          {mode !== "view" && (
            <>
              <input ref={refFileInputRef} type="file" accept="image/*" onChange={handleRefImageChange} className="hidden" />
              <button onClick={() => refFileInputRef.current?.click()}
                className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded text-[10px]"
                style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.8)" }}>
                <Upload size={10} />{referenceImage ? "替换" : "上传"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* 提示词 */}
      <div className="mb-2">
        <label style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>提示词</label>
        {mode !== "view" ? (
          <textarea className="w-full px-3 py-2 rounded-lg outline-none resize-none"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", fontSize: "12px", border: "1px solid rgba(255,255,255,0.1)", lineHeight: 1.7 }}
            rows={4} value={promptText} onChange={(e) => setPromptText(e.target.value)}
            placeholder="输入AI生成提示词" />
        ) : (
          <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontSize: "12px", color: promptText ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)", lineHeight: 1.7 }}>
              {promptText || "暂无提示词"}
            </p>
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: "#140F09" }}>
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
        {typeConfig && (
          <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: `${typeConfig.color}20`, color: typeConfig.color }}>
            {typeConfig.label}
          </span>
        )}
        <div className="flex-1" />
        {mode !== "view" && (
          <button onClick={handleSave} className="px-5 py-1.5 rounded-lg text-sm font-medium transition-colors" style={{ background: "#E87322", color: "#fff" }}>
            {mode === "create" ? "创建" : "保存"}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {!isSdIp ? (
          /* Two-column layout for character/scene/prop */
          <div className="max-w-5xl mx-auto px-8 py-8 grid grid-cols-2 gap-x-8 gap-y-0">
            <div>
              {/* Image at top for non-sd_ip */}
              <div className="mb-8">
                <div className="relative rounded-xl overflow-hidden" style={{ background: "#1A1510", aspectRatio: "16/9", maxHeight: "360px" }}>
                  {image ? (
                    <img src={image} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ color: "rgba(255,255,255,0.15)", fontSize: "13px" }}>暂无图片</div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  <button onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                    style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.8)" }}>
                    <Upload size={12} />{image ? "替换图片" : "上传图片"}
                  </button>
                </div>
              </div>
              {renderLeftColumn()}
            </div>
            <div>{renderRightColumn()}</div>
          </div>
        ) : (
          /* Single column for SD IP */
          <div className="max-w-3xl mx-auto px-8 py-8">
            {/* Image */}
            <div className="mb-8">
              <div className="relative rounded-xl overflow-hidden" style={{ background: "#1A1510", aspectRatio: "16/9", maxHeight: "400px" }}>
                {image ? (
                  <img src={image} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ color: "rgba(255,255,255,0.15)", fontSize: "13px" }}>暂无图片</div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                  style={{ background: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.8)" }}>
                  <Upload size={12} />{image ? "替换图片" : "上传图片"}
                </button>
              </div>
            </div>
            {renderLeftColumn()}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SD IP Fullscreen Image View ────────────────────────────────────────────
function SdIpFullscreenView({ subject, onClose }: { subject: SubjectItem; onClose: () => void }) {
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
        <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{subject.name}</span>
        <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: `${TYPE_CONFIG.sd_ip.color}20`, color: TYPE_CONFIG.sd_ip.color }}>
          {TYPE_CONFIG.sd_ip.label}
        </span>
      </div>
      {/* Full-screen image */}
      <div className="flex-1 flex items-center justify-center overflow-hidden p-8">
        {subject.image ? (
          <img src={subject.image} alt={subject.name} className="max-w-full max-h-full object-contain rounded-xl" style={{ maxHeight: "calc(100vh - 120px)" }} />
        ) : (
          <div className="flex items-center justify-center w-full h-full rounded-xl" style={{ background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.15)" }}>暂无图片</div>
        )}
      </div>
    </div>
  );
}

// ─── Sidebar Asset Data ─────────────────────────────────────────────────────
type AssetType = "image" | "video" | "audio";
type AssetSubTab = "generate" | "upload" | "subject" | "collect";

interface SidebarAsset {
  id: string; name: string; type: AssetType; src: string; size: string; date: string;
}

const SIDEBAR_ASSETS: Record<AssetSubTab, SidebarAsset[]> = {
  generate: [
    { id: "g1", name: "古风女侠_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=200&q=70", size: "2.3MB", date: "今天" },
    { id: "g2", name: "古城背景_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=200&q=70", size: "1.8MB", date: "今天" },
    { id: "g3", name: "山林场景.mp4", type: "video", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=200&q=70", size: "12MB", date: "今天" },
    { id: "g4", name: "道具宝剑.jpg", type: "image", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=200&q=70", size: "0.9MB", date: "昨天" },
    { id: "g5", name: "云雾山脉.jpg", type: "image", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=200&q=70", size: "4.2MB", date: "昨天" },
    { id: "g6", name: "片头动画.mp4", type: "video", src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?w=200&q=70", size: "28MB", date: "3天前" },
  ],
  upload: [
    { id: "u1", name: "人物参考_古装.jpg", type: "image", src: "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?w=200&q=70", size: "1.5MB", date: "昨天" },
    { id: "u2", name: "角色立绘参考.jpg", type: "image", src: "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?w=200&q=70", size: "2.1MB", date: "3天前" },
  ],
  subject: [
    { id: "s1", name: "女主角·林月.jpg", type: "image", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=200&q=70", size: "1.2MB", date: "今天" },
  ],
  collect: [
    { id: "c1", name: "白发女侠_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=200&q=70", size: "2.3MB", date: "今天" },
    { id: "c2", name: "山林场景.jpg", type: "image", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=200&q=70", size: "3.1MB", date: "今天" },
  ],
};

// ─── Members ────────────────────────────────────────────────────────────────
const PROJECT_MEMBERS = [
  { id: "1", name: "Alice", avatar: "Al", color: "#E87322", role: "主创" },
  { id: "2", name: "Bob", avatar: "Bo", color: "#7B3FC4", role: "背景" },
  { id: "3", name: "Carol", avatar: "Ca", color: "#2A6FC4", role: "角色" },
  { id: "4", name: "Dave", avatar: "Da", color: "#C42A6F", role: "道具" },
];
const CURRENT_USER = PROJECT_MEMBERS[0];

const ASSET_TYPE_CLR: Record<AssetType, string> = { image: "#3b82f6", video: "#a78bfa", audio: "#22c55e" };
const ASSET_TYPE_ICONS: Record<AssetType, typeof LucideImage> = { image: LucideImage, video: Video, audio: Music };

// ─── Main Component ──────────────────────────────────────────────────────
export function ProjectSubjectsPage() {
  const { id } = useParams<{ id: string }>();

  // ── Sidebar state ──────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [assetSubTab, setAssetSubTab] = useState<AssetSubTab>("generate");
  const [assetTypeFilter, setAssetTypeFilter] = useState<AssetType>("image");
  const [assetSearch, setAssetSearch] = useState("");

  // Member filter: default to current user only
  const [memberFilter, setMemberFilter] = useState<string[]>([CURRENT_USER.id]);
  const [showMemberMenu, setShowMemberMenu] = useState(false);

  // ── Subjects state ─────────────────────────────────────────────────────
  const [subjects, setSubjects] = useState<SubjectItem[]>(INITIAL_SUBJECTS);
  const [activeType, setActiveType] = useState<SubjectType>("sd_ip");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [detailSubject, setDetailSubject] = useState<SubjectItem | null>(null);
  const [detailMode, setDetailMode] = useState<"create" | "edit" | "view">("view");
  const [sdIpView, setSdIpView] = useState<SubjectItem | null>(null);

  const filteredSubjects = subjects.filter((subject) => {
    if (subject.type !== activeType) return false;
    if (searchKeyword && !subject.name.toLowerCase().includes(searchKeyword.toLowerCase())) return false;
    return true;
  });

  // Asset filtering
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
    setShowCreateModal(false);
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
  const openCreate = () => { setDetailSubject(null); setDetailMode("create"); };

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
        onClick={() => setShowMemberMenu(false)}
      >
        {/* Collapse toggle */}
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
            {/* Title bar: 资产 */}
            <div className="flex items-center px-3 py-2 flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>资产</span>
            </div>

            {/* Tabs: 生成/上传/主体/收藏 */}
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

            {/* Filter row: search / member / type */}
            <div className="flex items-center gap-1.5 px-2 py-1.5 flex-shrink-0">
              {/* Search mini input */}
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
              {/* Member filter button + dropdown */}
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
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" className="flex-shrink-0">
                              <path d="M1 4L3.5 6.5L9 1" style={{ stroke: member.color }} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              {/* Type select */}
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
            </div>

            {/* Asset grid */}
            <div className="flex-1 overflow-auto px-2 pb-2 pt-1">
                {assetSubTab === "upload" && (
                  <button
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg mb-2 transition-colors"
                    style={{ border: "1px dashed rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)", fontSize: "10px" }}
                    onClick={() => toast.success("请选择文件上传")}
                  >
                    <Upload size={10} />上传资产
                  </button>
                )}

                {filteredAssets.length > 0 ? (
                <div className="grid grid-cols-2 gap-1.5">
                  {filteredAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="relative rounded-md overflow-hidden cursor-pointer group"
                      style={{ aspectRatio: "1", background: "#1A1510" }}
                    >
                      <img
                        src={asset.src}
                        alt={asset.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {(asset.type === "video" || asset.type === "audio") && (
                        <div className="absolute top-1 left-1 px-1 py-0.5 rounded flex items-center"
                          style={{ background: "rgba(0,0,0,0.6)" }}>
                          {asset.type === "video" ? <Video size={7} style={{ color: "rgba(255,255,255,0.7)" }} /> : <Music size={7} style={{ color: "rgba(255,255,255,0.7)" }} />}
                        </div>
                      )}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1"
                        style={{ background: "rgba(0,0,0,0.55)" }}
                      >
                        <button
                          className="w-5 h-5 rounded flex items-center justify-center"
                          style={{ background: "rgba(255,255,255,0.15)" }}
                          onClick={(e) => { e.stopPropagation(); toast.success("已添加到画布"); }}
                        >
                          <Plus size={8} className="text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
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

      {/* ── Main Content (offset for sidebar) ───────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden relative" style={{ background: "#1A1510", marginLeft: sidebarOpen ? "240px" : "0px", transition: "margin-left 0.2s ease" }}>
        {/* Top Bar — clean: type tabs left, search right */}
        <div className="flex items-center gap-4 px-6 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          {/* Type tabs */}
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
          {/* Search — no floating icon */}
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

        {/* Cards Grid */}
        <div className="flex-1 overflow-auto px-6 pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Create Card */}
            <button onClick={openCreate}
              className="rounded-xl flex flex-col items-center justify-center gap-2 transition-all hover:bg-white/5 cursor-pointer group"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)", height: "200px" }}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center transition-colors group-hover:bg-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
                <Plus size={18} style={{ color: "rgba(255,255,255,0.2)" }} />
              </div>
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>创建主体</span>
            </button>

            {/* Subject Cards */}
            {filteredSubjects.map((subject) => {
              const tc = TYPE_CONFIG[subject.type];
              return (
                <div key={subject.id}
                  className="rounded-xl overflow-hidden relative group transition-all cursor-pointer hover:shadow-lg"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  onClick={() => {
                    if (subject.type === "sd_ip") { setSdIpView(subject); } else { openDetail(subject); }
                  }}
                >
                  {/* Type tag top-left */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium"
                      style={{ background: `${tc.color}25`, color: tc.color }}>
                      {tc.label}
                    </span>
                  </div>

                  {/* SD IP status badge */}
                  {subject.type === "sd_ip" && subject.reviewStatus && (
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <span className="px-2 py-0.5 rounded-full text-[10px]"
                        style={{ background: STATUS_CONFIG[subject.reviewStatus].bg, color: STATUS_CONFIG[subject.reviewStatus].text }}>
                        {STATUS_CONFIG[subject.reviewStatus].label}
                      </span>
                    </div>
                  )}

                  {/* Hover actions (non-SD-IP only) */}
                  {subject.type !== "sd_ip" && (
                    <div className="absolute top-2.5 right-2.5 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); openEdit(subject); }}
                        className="w-6 h-6 rounded flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.5)" }}>
                        <Pencil size={10} style={{ color: "rgba(255,255,255,0.7)" }} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteSingle(subject.id); }}
                        className="w-6 h-6 rounded flex items-center justify-center"
                        style={{ background: "rgba(0,0,0,0.5)" }}>
                        <Trash2 size={10} style={{ color: "#ff6b6b" }} />
                      </button>
                    </div>
                  )}

                  {/* Image */}
                  {subject.image ? (
                    <img src={subject.image} alt={subject.name} className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      style={{ height: "160px" }} />
                  ) : (
                    <div className="flex items-center justify-center" style={{ height: "160px", background: "rgba(255,255,255,0.02)" }}>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.15)" }}>暂无图片</span>
                    </div>
                  )}

                  {/* Name below image */}
                  <div className="px-3 py-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)", fontWeight: 500, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {subject.name}
                    </span>
                    {subject.type === "sd_ip" && subject.expiryType === "permanent" && (
                      <span className="text-[10px]" style={{ color: "#E87322", marginTop: "2px", display: "block" }}>永久有效</span>
                    )}
                    {subject.type === "sd_ip" && subject.expiryType === "date_range" && subject.validFrom && subject.validTo && (
                      <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)", marginTop: "2px", display: "block" }}>
                        {subject.validFrom} ~ {subject.validTo}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty state */}
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

        {/* Detail Full-Screen Page */}
        {(detailMode === "create" || detailSubject) && (
          <SubjectDetailPage
            mode={detailMode}
            subject={detailMode === "create" ? undefined : detailSubject || undefined}
            onClose={() => { setDetailSubject(null); setDetailMode("view"); setShowCreateModal(false); }}
            onSave={detailMode === "create" ? handleCreate : handleEdit}
          />
        )}

        {/* SD IP Fullscreen View */}
        {sdIpView && (
          <SdIpFullscreenView subject={sdIpView} onClose={() => setSdIpView(null)} />
        )}
      </div>
      </div>
    </div>
  );
}
