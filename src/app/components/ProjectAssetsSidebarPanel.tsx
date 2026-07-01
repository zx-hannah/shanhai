// Shared assets sidebar panel - unified style for all project pages
import { useState, useRef, useEffect } from "react";
import type { MouseEvent } from "react";
import {
  ChevronLeft, ChevronDown, Search, Star, Plus, Video, Sparkles,
  Upload, Package, X, Image as LucideImage, Music, Check,
  Film, Cpu, Scan, MoveRight, Clock3, CheckCircle2, AlertCircle,
  Download, Trash2, Pencil, Copy, User, TreePalm, ImagePlus,
  Folder, MoreHorizontal, Grid2X2, List, Layers3, Images,
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";

type SubTab = "generate" | "upload" | "subject" | "collect";
type TypeFilter = "image" | "video" | "audio";
type ReviewStatus = "pending" | "approved" | "rejected";
type SubjectKind = "sd_ip" | "character" | "scene" | "prop";
type AssetSource = "personal" | "shared" | "member" | "community";
type SharedSubSource = "project" | "space" | "organization";
type AssetFolderKey = "all-generate" | "collect" | "uncategorized" | "scene" | "props" | "style" | "sound" | "others";

// ─── Folder data for drag-and-drop ────────────────────────────────────────────
interface FolderData {
  id: string;
  key: string;
  label: string;
  assets: SidebarAsset[];
  preview?: string;
  isCustom?: boolean;
}

// ─── Drag types ───────────────────────────────────────────────────────────────
type DragSourceType = "folder" | "folder-asset" | "external-asset";
interface DragFolderPayload { type: "folder"; folderKey: string }
interface DragFolderAssetPayload { type: "folder-asset"; folderKey: string; assetId: string }
interface DragExternalAssetPayload {
  type: "external-asset";
  src: string;
  name: string;
  assetType: "image" | "video" | "audio";
}
type DragPayload = DragFolderPayload | DragFolderAssetPayload | DragExternalAssetPayload;

// ─── Asset data ──────────────────────────────────────────────────────────────
interface SidebarAsset {
  id: string;
  name: string;
  type: TypeFilter;
  src: string;
  size: string;
  date: string;
  memberId?: string;
  reviewStatus?: ReviewStatus;
}

interface GenerateAsset extends SidebarAsset {
  prompt: string;
  model: string;
  resolution: string;
  ratio: string;
  referenceImages?: string[];
  appliedTo?: { type: "subject" | "storyboard"; label: string; id: string }[];
}

interface SubjectSidebarAsset extends SidebarAsset {
  subjectKind?: SubjectKind;
  displayName?: string;
}

const PROJECT_MEMBERS = [
  { id: "1", name: "Alice", avatar: "Al", color: "#E87322", role: "主创" },
  { id: "2", name: "Bob", avatar: "Bo", color: "#7B3FC4", role: "背景" },
  { id: "3", name: "Carol", avatar: "Ca", color: "#2A6FC4", role: "角色" },
  { id: "4", name: "Dave", avatar: "Da", color: "#C42A6F", role: "道具" },
];

const REVIEW_STATUS_CONFIG: Record<ReviewStatus, { label: string; shortLabel: string; color: string; bg: string; border: string; icon: typeof Clock3 }> = {
  pending: {
    label: "审核中", shortLabel: "审核中",
    color: "rgba(255,255,255,0.78)", bg: "rgba(255,255,255,0.08)", border: "rgba(255,255,255,0.12)",
    icon: Clock3,
  },
  approved: {
    label: "审核通过", shortLabel: "已通过",
    color: "#4AC678", bg: "rgba(74,198,120,0.14)", border: "rgba(74,198,120,0.22)",
    icon: CheckCircle2,
  },
  rejected: {
    label: "审核失败", shortLabel: "未通过",
    color: "#ff6b6b", bg: "rgba(255,107,107,0.14)", border: "rgba(255,107,107,0.22)",
    icon: AlertCircle,
  },
};

const SUBJECT_KIND_CONFIG: Record<SubjectKind, { icon: typeof User; label: string; color: string }> = {
  sd_ip:     { icon: Sparkles, label: "虚拟IP",  color: "#E87322" },
  character: { icon: User,     label: "人物",    color: "#7B3FC4" },
  scene:     { icon: TreePalm, label: "场景",    color: "#2A6FC4" },
  prop:      { icon: Package,  label: "道具",    color: "#C42A6F" },
};

const ASSET_SOURCE_CONFIG: Record<AssetSource, { icon: typeof User; label: string; color: string; subOptions?: SharedSubSource[] }> = {
  personal:   { icon: User,     label: "个人资产", color: "#E87322" },
  shared:     { icon: Package,  label: "共享资产", color: "#4AC678", subOptions: ["project", "space", "organization"] },
  member:     { icon: User,     label: "成员资产", color: "#7B3FC4" },
  community:  { icon: TreePalm, label: "社区资产", color: "#2A6FC4" },
};

const SHARED_SUB_CONFIG: Record<SharedSubSource, { label: string }> = {
  project:      { label: "本项目资产" },
  space:        { label: "空间资产" },
  organization: { label: "组织资产" },
};

const GENERATE_ASSETS: GenerateAsset[] = [
  {
    id: "g1", name: "古风女侠_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=200&q=70",
    size: "2.3MB", date: "今天", memberId: "1",
    prompt: "古风女侠，白发飞扬，身着月白色长袍，腰悬宝剑，气质冷峻仙气，画面风格参考敦煌壁画，高清质感，8K细节",
    model: "Seedream 3.0", resolution: "1024×1024", ratio: "1:1",
    referenceImages: [
      "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?w=100&q=60",
      "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?w=100&q=60",
    ],
    appliedTo: [
      { type: "subject", label: "女主角·林月", id: "s1" },
      { type: "storyboard", label: "分镜 #01", id: "sp1" },
    ],
  },
  {
    id: "g2", name: "古城背景_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=200&q=70",
    size: "1.8MB", date: "今天", memberId: "1",
    prompt: "古城楼全景，夕阳余晖，城墙斑驳，飞檐翘角，远景云雾缭绕，电影级构图，广角镜头",
    model: "Seedream 3.0", resolution: "1920×1080", ratio: "16:9",
    referenceImages: ["https://images.unsplash.com/photo-1551264397-09c6f678a930?w=100&q=60"],
    appliedTo: [{ type: "storyboard", label: "分镜 #03", id: "sp3" }],
  },
  {
    id: "g3", name: "山林场景.mp4", type: "video", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=200&q=70",
    size: "12MB", date: "今天", memberId: "2",
    prompt: "山林云雾缭绕，仙气飘渺，镜头缓慢推进，云海翻涌，光影变化",
    model: "Seedream 3.0 Video", resolution: "1280×720", ratio: "16:9",
    referenceImages: [],
    appliedTo: [{ type: "storyboard", label: "分镜 #01", id: "sp1" }],
  },
  {
    id: "g4", name: "道具宝剑.jpg", type: "image", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=200&q=70",
    size: "0.9MB", date: "昨天", memberId: "3",
    prompt: "古风宝剑，剑身晶莹，剑柄镶嵌宝石，蓝光流转，细节精致，暗色背景，特写镜头",
    model: "Seedream 3.0", resolution: "1024×1024", ratio: "1:1",
    referenceImages: [],
    appliedTo: [{ type: "subject", label: "道具·宝剑", id: "s4" }],
  },
  {
    id: "g5", name: "云雾山脉.jpg", type: "image", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=200&q=70",
    size: "4.2MB", date: "昨天", memberId: "2",
    prompt: "远山层叠，云海翻涌，日出金光，仙境氛围，中国山水画风格，水墨渲染",
    model: "Seedream 3.0", resolution: "2048×1024", ratio: "2:1",
    referenceImages: ["https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=100&q=60"],
    appliedTo: [],
  },
  {
    id: "g6", name: "片头动画.mp4", type: "video", src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?w=200&q=70",
    size: "28MB", date: "3天前", memberId: "1",
    prompt: "片头动画，水墨风转场，山海经异兽剪影，标题浮现，粒子效果",
    model: "Seedream 3.0 Video", resolution: "1920×1080", ratio: "16:9",
    referenceImages: [],
    appliedTo: [],
  },
  { id: "g7", name: "特效转场_粒子_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?w=200&q=70", size: "3.6MB", date: "昨天", memberId: "3", prompt: "瀑布飞流直下，水花四溅，彩虹横跨，仙境氛围", model: "Seedream 3.0 Video", resolution: "1024×768", ratio: "9:16", referenceImages: [], appliedTo: [] },
  { id: "g8", name: "背景云海_仙境_v3.jpg", type: "image", src: "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?w=200&q=70", size: "0.8MB", date: "昨天", memberId: "2", prompt: "月光洒在湖面，倒影如画，宁静祥和，中国风构图", model: "Seedream 3.0 Video", resolution: "1280×720", ratio: "2:1", referenceImages: [], appliedTo: [] },
  { id: "g9", name: "武器设计_长枪_v3.jpg", type: "image", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=200&q=70", size: "3.6MB", date: "今天", memberId: "1", prompt: "战场硝烟弥漫，将军骑马冲锋，气势磅礴，电影感", model: "Seedream 3.0", resolution: "1024×1024", ratio: "16:9", referenceImages: [], appliedTo: [] },
  { id: "g10", name: "服饰细节_披风_v4.jpg", type: "image", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=200&q=70", size: "4.5MB", date: "3天前", memberId: "4", prompt: "仙鹤飞翔在云海之上，姿态优雅，仙气飘飘", model: "Seedream 3.0", resolution: "1280×720", ratio: "2:1", referenceImages: [], appliedTo: [] },
  { id: "g11", name: "光影效果_逆光_v1.mp4", type: "video", src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?w=200&q=70", size: "28MB", date: "昨天", memberId: "4", prompt: "宫殿大殿，金碧辉煌，龙柱盘龙，庄严神圣", model: "Midjourney v7", resolution: "2560×1440", ratio: "3:2", referenceImages: [], appliedTo: [] },
  { id: "g12", name: "建筑残垣_废墟_v4.jpg", type: "image", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=200&q=70", size: "2.7MB", date: "今天", memberId: "2", prompt: "竹林深处，小桥流水，幽静雅致，中国园林风格", model: "Kling 2.0", resolution: "1920×1080", ratio: "3:2", referenceImages: [], appliedTo: [] },
  { id: "g13", name: "自然景观_瀑布_v4.jpg", type: "image", src: "https://images.unsplash.com/photo-1598887145369-84ae664be195?w=200&q=70", size: "3.1MB", date: "上周", memberId: "4", prompt: "沙漠中古城遗迹，风沙侵蚀，沧桑壮美", model: "Midjourney v7 Video", resolution: "2560×1440", ratio: "2:1", referenceImages: [], appliedTo: [] },
  { id: "g14", name: "人物剪影_黄昏_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1612036782134-1a5405e02905?w=200&q=70", size: "2.3MB", date: "昨天", memberId: "2", prompt: "星空璀璨，银河横跨，流星划过，梦幻唯美", model: "Midjourney v7 Video", resolution: "2048×2048", ratio: "1:1", referenceImages: [], appliedTo: [] },
  { id: "g15", name: "法器发光_特效_v1.mp4", type: "video", src: "https://images.unsplash.com/photo-1503431398780-a2e3025d8953?w=200&q=70", size: "35MB", date: "昨天", memberId: "1", prompt: "海底世界，珊瑚礁群，鱼群穿梭，光影斑斓", model: "Kling 2.0", resolution: "4096×2160", ratio: "1:1", referenceImages: [], appliedTo: [] },
  { id: "g16", name: "室内场景_宫殿_v5.mp4", type: "video", src: "https://images.unsplash.com/photo-1533038590840-1cde6b468958?w=200&q=70", size: "35MB", date: "昨天", memberId: "2", prompt: "仙侠场景，古风建筑，飞檐翘角，云雾缭绕，仙气飘渺，电影级构图", model: "Midjourney v7 Video", resolution: "2560×1440", ratio: "9:16", referenceImages: [], appliedTo: [] },
  { id: "g17", name: "动物灵兽_白鹤_v5.jpg", type: "image", src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=70", size: "2.7MB", date: "今天", memberId: "4", prompt: "水墨山水画风格，远山层叠，云海翻涌，日出金光，仙境氛围", model: "Seedream 3.0 Video", resolution: "1280×720", ratio: "4:3", referenceImages: [], appliedTo: [] },
  { id: "g18", name: "天空异象_极光_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&q=70", size: "1.2MB", date: "今天", memberId: "4", prompt: "古风少女，长发飘飘，身着粉色襦裙，手持团扇，温婉可人", model: "Kling 2.0", resolution: "4096×2160", ratio: "9:16", referenceImages: [], appliedTo: [] },
  { id: "g19", name: "水面倒影_月色_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&q=70", size: "2.3MB", date: "3天前", memberId: "2", prompt: "宝剑特写，剑身晶莹剔透，蓝光流转，细节精致，暗色背景", model: "Seedream 3.0 Video", resolution: "4096×2160", ratio: "3:2", referenceImages: [], appliedTo: [] },
  { id: "g20", name: "火焰特效_燃烧_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1507525428093-43194596012e?w=200&q=70", size: "2.7MB", date: "3天前", memberId: "2", prompt: "夕阳余晖，古城楼全景，城墙斑驳，飞檐翘角，远景云雾", model: "Seedream 3.0 Video", resolution: "1024×1024", ratio: "9:16", referenceImages: [], appliedTo: [] },
  { id: "g21", name: "冰霜魔法_冻结_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&q=70", size: "3.6MB", date: "上周", memberId: "1", prompt: "森林深处，古树参天，阳光透过树叶洒下斑驳光影", model: "Midjourney v7 Video", resolution: "4096×2160", ratio: "4:3", referenceImages: [], appliedTo: [] },
  { id: "g22", name: "雷电交加_风暴_v4.jpg", type: "image", src: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=200&q=70", size: "3.1MB", date: "昨天", memberId: "4", prompt: "瀑布飞流直下，水花四溅，彩虹横跨，仙境氛围", model: "Seedream 3.0", resolution: "1920×1080", ratio: "1:1", referenceImages: [], appliedTo: [] },
  { id: "g23", name: "花海场景_飘落_v3.jpg", type: "image", src: "https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=200&q=70", size: "1.2MB", date: "昨天", memberId: "4", prompt: "月光洒在湖面，倒影如画，宁静祥和，中国风构图", model: "Seedream 3.0", resolution: "1280×720", ratio: "16:9", referenceImages: [], appliedTo: [] },
  { id: "g24", name: "沙漠古城_遗迹_v5.jpg", type: "image", src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=200&q=70", size: "3.6MB", date: "上周", memberId: "3", prompt: "战场硝烟弥漫，将军骑马冲锋，气势磅礴，电影感", model: "Kling 2.0", resolution: "1024×768", ratio: "16:9", referenceImages: [], appliedTo: [] },
  { id: "g25", name: "星空银河_璀璨_v4.jpg", type: "image", src: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=200&q=70", size: "0.8MB", date: "3天前", memberId: "1", prompt: "仙鹤飞翔在云海之上，姿态优雅，仙气飘飘", model: "Midjourney v7 Video", resolution: "4096×2160", ratio: "9:16", referenceImages: [], appliedTo: [] },
  { id: "g26", name: "废墟重建_沧桑_v3.jpg", type: "image", src: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&q=70", size: "3.6MB", date: "上周", memberId: "2", prompt: "宫殿大殿，金碧辉煌，龙柱盘龙，庄严神圣", model: "Midjourney v7", resolution: "1536×1024", ratio: "16:9", referenceImages: [], appliedTo: [] },
  { id: "g27", name: "悬崖绝壁_险峻_v4.jpg", type: "image", src: "https://images.unsplash.com/photo-1475924156734-bab9bde6c7e4?w=200&q=70", size: "0.8MB", date: "今天", memberId: "2", prompt: "竹林深处，小桥流水，幽静雅致，中国园林风格", model: "Seedream 3.0", resolution: "1920×1080", ratio: "4:3", referenceImages: [], appliedTo: [] },
  { id: "g28", name: "森林深处_幽暗_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=200&q=70", size: "1.8MB", date: "3天前", memberId: "4", prompt: "沙漠中古城遗迹，风沙侵蚀，沧桑壮美", model: "Midjourney v7", resolution: "1024×1024", ratio: "9:16", referenceImages: [], appliedTo: [] },
  { id: "g29", name: "湖面微光_涟漪_v3.jpg", type: "image", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=200&q=70", size: "1.8MB", date: "今天", memberId: "4", prompt: "星空璀璨，银河横跨，流星划过，梦幻唯美", model: "Midjourney v7", resolution: "1920×1080", ratio: "16:9", referenceImages: [], appliedTo: [] },
  { id: "g30", name: "战场硝烟_弥漫_v3.jpg", type: "image", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=200&q=70", size: "2.3MB", date: "3天前", memberId: "1", prompt: "海底世界，珊瑚礁群，鱼群穿梭，光影斑斓", model: "Seedream 3.0", resolution: "1536×1024", ratio: "4:3", referenceImages: [], appliedTo: [] },
  { id: "g31", name: "仙鹤飞翔_云霄_v3.jpg", type: "image", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=200&q=70", size: "2.3MB", date: "今天", memberId: "4", prompt: "仙侠场景，古风建筑，飞檐翘角，云雾缭绕，仙气飘渺，电影级构图", model: "Seedream 3.0", resolution: "4096×2160", ratio: "1:1", referenceImages: [], appliedTo: [] },
  { id: "g32", name: "宫殿大殿_庄严_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=200&q=70", size: "4.5MB", date: "3天前", memberId: "3", prompt: "水墨山水画风格，远山层叠，云海翻涌，日出金光，仙境氛围", model: "Midjourney v7 Video", resolution: "1536×1024", ratio: "4:3", referenceImages: [], appliedTo: [] },
  { id: "g33", name: "密室机关_精巧_v4.jpg", type: "image", src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?w=200&q=70", size: "1.8MB", date: "今天", memberId: "3", prompt: "古风少女，长发飘飘，身着粉色襦裙，手持团扇，温婉可人", model: "Midjourney v7 Video", resolution: "4096×2160", ratio: "2:1", referenceImages: [], appliedTo: [] },
  { id: "g34", name: "庭院深深_静谧_v3.jpg", type: "image", src: "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?w=200&q=70", size: "3.6MB", date: "昨天", memberId: "1", prompt: "宝剑特写，剑身晶莹剔透，蓝光流转，细节精致，暗色背景", model: "Seedream 3.0", resolution: "1536×1024", ratio: "1:1", referenceImages: [], appliedTo: [] },
  { id: "g35", name: "古桥流水_雅致_v3.jpg", type: "image", src: "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?w=200&q=70", size: "0.8MB", date: "上周", memberId: "4", prompt: "夕阳余晖，古城楼全景，城墙斑驳，飞檐翘角，远景云雾", model: "Midjourney v7 Video", resolution: "2560×1440", ratio: "9:16", referenceImages: [], appliedTo: [] },
  { id: "g36", name: "竹林听风_幽静_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=200&q=70", size: "2.3MB", date: "昨天", memberId: "4", prompt: "森林深处，古树参天，阳光透过树叶洒下斑驳光影", model: "Seedream 3.0", resolution: "2560×1440", ratio: "1:1", referenceImages: [], appliedTo: [] },
  { id: "g37", name: "梅园踏雪_寻梅_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=200&q=70", size: "2.3MB", date: "上周", memberId: "3", prompt: "瀑布飞流直下，水花四溅，彩虹横跨，仙境氛围", model: "Midjourney v7 Video", resolution: "1024×1024", ratio: "16:9", referenceImages: [], appliedTo: [] },
  { id: "g38", name: "荷塘月色_清雅_v4.jpg", type: "image", src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?w=200&q=70", size: "0.8MB", date: "上周", memberId: "2", prompt: "月光洒在湖面，倒影如画，宁静祥和，中国风构图", model: "Seedream 3.0", resolution: "1024×1024", ratio: "1:1", referenceImages: [], appliedTo: [] },
  { id: "g39", name: "松柏长青_苍翠_v5.mp4", type: "video", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=200&q=70", size: "15MB", date: "今天", memberId: "4", prompt: "战场硝烟弥漫，将军骑马冲锋，气势磅礴，电影感", model: "Kling 2.0", resolution: "1536×1024", ratio: "2:1", referenceImages: [], appliedTo: [] },
  { id: "g40", name: "莲花盛开_圣洁_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1598887145369-84ae664be195?w=200&q=70", size: "2.3MB", date: "今天", memberId: "3", prompt: "仙鹤飞翔在云海之上，姿态优雅，仙气飘飘", model: "Midjourney v7", resolution: "2048×2048", ratio: "16:9", referenceImages: [], appliedTo: [] },
  { id: "g41", name: "蛟龙出海_壮阔_v2.mp4", type: "video", src: "https://images.unsplash.com/photo-1612036782134-1a5405e02905?w=200&q=70", size: "8MB", date: "今天", memberId: "1", prompt: "宫殿大殿，金碧辉煌，龙柱盘龙，庄严神圣", model: "Seedream 3.0", resolution: "1920×1080", ratio: "16:9", referenceImages: [], appliedTo: [] },
  { id: "g42", name: "凤凰涅槃_重生_v3.jpg", type: "image", src: "https://images.unsplash.com/photo-1503431398780-a2e3025d8953?w=200&q=70", size: "1.2MB", date: "今天", memberId: "1", prompt: "竹林深处，小桥流水，幽静雅致，中国园林风格", model: "Seedream 3.0", resolution: "1024×768", ratio: "2:1", referenceImages: [], appliedTo: [] },
  { id: "g43", name: "青龙腾空_威武_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1533038590840-1cde6b468958?w=200&q=70", size: "0.8MB", date: "3天前", memberId: "4", prompt: "沙漠中古城遗迹，风沙侵蚀，沧桑壮美", model: "Midjourney v7 Video", resolution: "1024×768", ratio: "1:1", referenceImages: [], appliedTo: [] },
  { id: "g44", name: "白虎啸月_雄壮_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=70", size: "4.5MB", date: "上周", memberId: "1", prompt: "星空璀璨，银河横跨，流星划过，梦幻唯美", model: "Midjourney v7 Video", resolution: "1920×1080", ratio: "4:3", referenceImages: [], appliedTo: [] },
  { id: "g45", name: "玄武镇水_沉稳_v3.jpg", type: "image", src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&q=70", size: "0.8MB", date: "今天", memberId: "1", prompt: "海底世界，珊瑚礁群，鱼群穿梭，光影斑斓", model: "Seedream 3.0", resolution: "1536×1024", ratio: "2:1", referenceImages: [], appliedTo: [] },
  { id: "g46", name: "麒麟献瑞_吉祥_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&q=70", size: "2.3MB", date: "上周", memberId: "4", prompt: "仙侠场景，古风建筑，飞檐翘角，云雾缭绕，仙气飘渺，电影级构图", model: "Seedream 3.0 Video", resolution: "1920×1080", ratio: "9:16", referenceImages: [], appliedTo: [] },
  { id: "g47", name: "鲲鹏展翅_辽阔_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1507525428093-43194596012e?w=200&q=70", size: "2.3MB", date: "今天", memberId: "1", prompt: "水墨山水画风格，远山层叠，云海翻涌，日出金光，仙境氛围", model: "Seedream 3.0", resolution: "1024×768", ratio: "4:3", referenceImages: [], appliedTo: [] },
  { id: "g48", name: "饕餮盛宴_威严_v3.jpg", type: "image", src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&q=70", size: "3.6MB", date: "今天", memberId: "2", prompt: "古风少女，长发飘飘，身着粉色襦裙，手持团扇，温婉可人", model: "Midjourney v7", resolution: "1024×768", ratio: "9:16", referenceImages: [], appliedTo: [] },
  { id: "g49", name: "穷奇出没_诡异_v2.mp4", type: "video", src: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=200&q=70", size: "28MB", date: "今天", memberId: "1", prompt: "宝剑特写，剑身晶莹剔透，蓝光流转，细节精致，暗色背景", model: "Seedream 3.0", resolution: "1280×720", ratio: "16:9", referenceImages: [], appliedTo: [] },
  { id: "g50", name: "混沌初开_鸿蒙_v5.jpg", type: "image", src: "https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=200&q=70", size: "3.6MB", date: "今天", memberId: "3", prompt: "夕阳余晖，古城楼全景，城墙斑驳，飞檐翘角，远景云雾", model: "Kling 2.0 Video", resolution: "2048×2048", ratio: "2:1", referenceImages: [], appliedTo: [] },
  { id: "g51", name: "仙侠人物_飞剑_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=200&q=70", size: "3.6MB", date: "上周", memberId: "1", prompt: "森林深处，古树参天，阳光透过树叶洒下斑驳光影", model: "Midjourney v7", resolution: "1024×1024", ratio: "3:2", referenceImages: [], appliedTo: [] },
  { id: "g52", name: "古风建筑_寺庙_v3.jpg", type: "image", src: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=200&q=70", size: "4.5MB", date: "今天", memberId: "2", prompt: "瀑布飞流直下，水花四溅，彩虹横跨，仙境氛围", model: "Midjourney v7 Video", resolution: "1920×1080", ratio: "9:16", referenceImages: [], appliedTo: [] },
  { id: "g53", name: "山水意境_水墨_v4.mp4", type: "video", src: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&q=70", size: "28MB", date: "3天前", memberId: "3", prompt: "月光洒在湖面，倒影如画，宁静祥和，中国风构图", model: "Seedream 3.0 Video", resolution: "1024×1024", ratio: "2:1", referenceImages: [], appliedTo: [] },
  { id: "g54", name: "角色头像_少女_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1475924156734-bab9bde6c7e4?w=200&q=70", size: "1.2MB", date: "3天前", memberId: "3", prompt: "战场硝烟弥漫，将军骑马冲锋，气势磅礴，电影感", model: "Midjourney v7 Video", resolution: "1280×720", ratio: "3:2", referenceImages: [], appliedTo: [] },
  { id: "g55", name: "场景氛围_日落_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=200&q=70", size: "1.8MB", date: "上周", memberId: "1", prompt: "仙鹤飞翔在云海之上，姿态优雅，仙气飘飘", model: "Seedream 3.0", resolution: "1024×1024", ratio: "3:2", referenceImages: [], appliedTo: [] },
  { id: "g56", name: "道具细节_玉佩_v3.mp4", type: "video", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=200&q=70", size: "8MB", date: "今天", memberId: "2", prompt: "宫殿大殿，金碧辉煌，龙柱盘龙，庄严神圣", model: "Kling 2.0 Video", resolution: "4096×2160", ratio: "16:9", referenceImages: [], appliedTo: [] },
  { id: "g57", name: "特效转场_粒子_v3.jpg", type: "image", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=200&q=70", size: "0.8MB", date: "今天", memberId: "4", prompt: "竹林深处，小桥流水，幽静雅致，中国园林风格", model: "Kling 2.0", resolution: "1280×720", ratio: "1:1", referenceImages: [], appliedTo: [] },
  { id: "g58", name: "背景云海_仙境_v5.mp4", type: "video", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=200&q=70", size: "8MB", date: "今天", memberId: "2", prompt: "沙漠中古城遗迹，风沙侵蚀，沧桑壮美", model: "Kling 2.0 Video", resolution: "1024×768", ratio: "9:16", referenceImages: [], appliedTo: [] },
  { id: "g59", name: "武器设计_长枪_v5.jpg", type: "image", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=200&q=70", size: "4.5MB", date: "今天", memberId: "2", prompt: "星空璀璨，银河横跨，流星划过，梦幻唯美", model: "Seedream 3.0", resolution: "1024×1024", ratio: "2:1", referenceImages: [], appliedTo: [] },
  { id: "g60", name: "服饰细节_披风_v5.jpg", type: "image", src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?w=200&q=70", size: "2.3MB", date: "3天前", memberId: "1", prompt: "海底世界，珊瑚礁群，鱼群穿梭，光影斑斓", model: "Seedream 3.0", resolution: "1920×1080", ratio: "2:1", referenceImages: [], appliedTo: [] },
  { id: "g61", name: "光影效果_逆光_v5.jpg", type: "image", src: "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?w=200&q=70", size: "3.1MB", date: "今天", memberId: "3", prompt: "仙侠场景，古风建筑，飞檐翘角，云雾缭绕，仙气飘渺，电影级构图", model: "Seedream 3.0", resolution: "1024×1024", ratio: "9:16", referenceImages: [], appliedTo: [] },
  { id: "g62", name: "建筑残垣_废墟_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?w=200&q=70", size: "0.8MB", date: "今天", memberId: "3", prompt: "水墨山水画风格，远山层叠，云海翻涌，日出金光，仙境氛围", model: "Midjourney v7 Video", resolution: "1536×1024", ratio: "1:1", referenceImages: [], appliedTo: [] },
  { id: "g63", name: "自然景观_瀑布_v5.jpg", type: "image", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=200&q=70", size: "1.2MB", date: "上周", memberId: "1", prompt: "古风少女，长发飘飘，身着粉色襦裙，手持团扇，温婉可人", model: "Kling 2.0", resolution: "1536×1024", ratio: "16:9", referenceImages: [], appliedTo: [] },
  { id: "g64", name: "人物剪影_黄昏_v1.mp4", type: "video", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=200&q=70", size: "28MB", date: "3天前", memberId: "4", prompt: "宝剑特写，剑身晶莹剔透，蓝光流转，细节精致，暗色背景", model: "Seedream 3.0", resolution: "4096×2160", ratio: "4:3", referenceImages: [], appliedTo: [] },
  { id: "g65", name: "法器发光_特效_v5.jpg", type: "image", src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?w=200&q=70", size: "1.8MB", date: "今天", memberId: "4", prompt: "夕阳余晖，古城楼全景，城墙斑驳，飞檐翘角，远景云雾", model: "Seedream 3.0 Video", resolution: "2048×2048", ratio: "3:2", referenceImages: [], appliedTo: [] },
  { id: "g66", name: "室内场景_宫殿_v3.mp4", type: "video", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=200&q=70", size: "12MB", date: "昨天", memberId: "1", prompt: "森林深处，古树参天，阳光透过树叶洒下斑驳光影", model: "Seedream 3.0", resolution: "2560×1440", ratio: "16:9", referenceImages: [], appliedTo: [] },
  { id: "g67", name: "动物灵兽_白鹤_v5.jpg", type: "image", src: "https://images.unsplash.com/photo-1598887145369-84ae664be195?w=200&q=70", size: "1.8MB", date: "昨天", memberId: "1", prompt: "瀑布飞流直下，水花四溅，彩虹横跨，仙境氛围", model: "Seedream 3.0", resolution: "1536×1024", ratio: "16:9", referenceImages: [], appliedTo: [] },
  { id: "g68", name: "天空异象_极光_v4.jpg", type: "image", src: "https://images.unsplash.com/photo-1612036782134-1a5405e02905?w=200&q=70", size: "2.3MB", date: "上周", memberId: "3", prompt: "月光洒在湖面，倒影如画，宁静祥和，中国风构图", model: "Seedream 3.0 Video", resolution: "2048×2048", ratio: "4:3", referenceImages: [], appliedTo: [] },
  { id: "g69", name: "水面倒影_月色_v4.jpg", type: "image", src: "https://images.unsplash.com/photo-1503431398780-a2e3025d8953?w=200&q=70", size: "1.8MB", date: "今天", memberId: "2", prompt: "战场硝烟弥漫，将军骑马冲锋，气势磅礴，电影感", model: "Midjourney v7 Video", resolution: "2560×1440", ratio: "9:16", referenceImages: [], appliedTo: [] },
  { id: "g70", name: "火焰特效_燃烧_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1533038590840-1cde6b468958?w=200&q=70", size: "4.5MB", date: "今天", memberId: "2", prompt: "仙鹤飞翔在云海之上，姿态优雅，仙气飘飘", model: "Kling 2.0", resolution: "1536×1024", ratio: "2:1", referenceImages: [], appliedTo: [] },
  { id: "g71", name: "冰霜魔法_冻结_v4.jpg", type: "image", src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=70", size: "3.1MB", date: "昨天", memberId: "1", prompt: "宫殿大殿，金碧辉煌，龙柱盘龙，庄严神圣", model: "Kling 2.0 Video", resolution: "2048×2048", ratio: "4:3", referenceImages: [], appliedTo: [] },
  { id: "g72", name: "雷电交加_风暴_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&q=70", size: "3.6MB", date: "昨天", memberId: "2", prompt: "竹林深处，小桥流水，幽静雅致，中国园林风格", model: "Midjourney v7", resolution: "1024×768", ratio: "4:3", referenceImages: [], appliedTo: [] },
  { id: "g73", name: "花海场景_飘落_v4.mp4", type: "video", src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&q=70", size: "15MB", date: "上周", memberId: "4", prompt: "沙漠中古城遗迹，风沙侵蚀，沧桑壮美", model: "Seedream 3.0", resolution: "1280×720", ratio: "2:1", referenceImages: [], appliedTo: [] },
  { id: "g74", name: "沙漠古城_遗迹_v5.jpg", type: "image", src: "https://images.unsplash.com/photo-1507525428093-43194596012e?w=200&q=70", size: "0.8MB", date: "3天前", memberId: "4", prompt: "星空璀璨，银河横跨，流星划过，梦幻唯美", model: "Seedream 3.0", resolution: "1536×1024", ratio: "3:2", referenceImages: [], appliedTo: [] },
  { id: "g75", name: "星空银河_璀璨_v2.mp4", type: "video", src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=200&q=70", size: "8MB", date: "昨天", memberId: "2", prompt: "海底世界，珊瑚礁群，鱼群穿梭，光影斑斓", model: "Midjourney v7 Video", resolution: "2560×1440", ratio: "1:1", referenceImages: [], appliedTo: [] },
  { id: "g76", name: "废墟重建_沧桑_v3.mp4", type: "video", src: "https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=200&q=70", size: "12MB", date: "3天前", memberId: "4", prompt: "仙侠场景，古风建筑，飞檐翘角，云雾缭绕，仙气飘渺，电影级构图", model: "Kling 2.0 Video", resolution: "1920×1080", ratio: "2:1", referenceImages: [], appliedTo: [] },
  { id: "g77", name: "悬崖绝壁_险峻_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=200&q=70", size: "1.2MB", date: "今天", memberId: "3", prompt: "水墨山水画风格，远山层叠，云海翻涌，日出金光，仙境氛围", model: "Midjourney v7 Video", resolution: "1280×720", ratio: "4:3", referenceImages: [], appliedTo: [] },
  { id: "g78", name: "森林深处_幽暗_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=200&q=70", size: "2.7MB", date: "3天前", memberId: "2", prompt: "古风少女，长发飘飘，身着粉色襦裙，手持团扇，温婉可人", model: "Seedream 3.0", resolution: "1280×720", ratio: "1:1", referenceImages: [], appliedTo: [] },
  { id: "g79", name: "湖面微光_涟漪_v1.mp4", type: "video", src: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=200&q=70", size: "15MB", date: "3天前", memberId: "3", prompt: "宝剑特写，剑身晶莹剔透，蓝光流转，细节精致，暗色背景", model: "Kling 2.0 Video", resolution: "1280×720", ratio: "16:9", referenceImages: [], appliedTo: [] },
  { id: "g80", name: "战场硝烟_弥漫_v3.mp4", type: "video", src: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&q=70", size: "15MB", date: "3天前", memberId: "2", prompt: "夕阳余晖，古城楼全景，城墙斑驳，飞檐翘角，远景云雾", model: "Kling 2.0", resolution: "1024×1024", ratio: "1:1", referenceImages: [], appliedTo: [] },
  { id: "g81", name: "仙鹤飞翔_云霄_v3.jpg", type: "image", src: "https://images.unsplash.com/photo-1475924156734-bab9bde6c7e4?w=200&q=70", size: "3.6MB", date: "3天前", memberId: "4", prompt: "森林深处，古树参天，阳光透过树叶洒下斑驳光影", model: "Midjourney v7", resolution: "1280×720", ratio: "9:16", referenceImages: [], appliedTo: [] },
  { id: "g82", name: "宫殿大殿_庄严_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=200&q=70", size: "1.8MB", date: "今天", memberId: "4", prompt: "瀑布飞流直下，水花四溅，彩虹横跨，仙境氛围", model: "Midjourney v7 Video", resolution: "1024×768", ratio: "16:9", referenceImages: [], appliedTo: [] },
  { id: "g83", name: "密室机关_精巧_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=200&q=70", size: "1.8MB", date: "上周", memberId: "2", prompt: "月光洒在湖面，倒影如画，宁静祥和，中国风构图", model: "Seedream 3.0", resolution: "4096×2160", ratio: "1:1", referenceImages: [], appliedTo: [] },
  { id: "g84", name: "庭院深深_静谧_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=200&q=70", size: "2.7MB", date: "3天前", memberId: "3", prompt: "战场硝烟弥漫，将军骑马冲锋，气势磅礴，电影感", model: "Seedream 3.0 Video", resolution: "1024×1024", ratio: "4:3", referenceImages: [], appliedTo: [] },
  { id: "g85", name: "古桥流水_雅致_v5.jpg", type: "image", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=200&q=70", size: "3.6MB", date: "上周", memberId: "1", prompt: "仙鹤飞翔在云海之上，姿态优雅，仙气飘飘", model: "Seedream 3.0", resolution: "2048×2048", ratio: "9:16", referenceImages: [], appliedTo: [] },
  { id: "g86", name: "竹林听风_幽静_v3.mp4", type: "video", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=200&q=70", size: "12MB", date: "今天", memberId: "2", prompt: "宫殿大殿，金碧辉煌，龙柱盘龙，庄严神圣", model: "Kling 2.0", resolution: "1920×1080", ratio: "2:1", referenceImages: [], appliedTo: [] },
  { id: "g87", name: "梅园踏雪_寻梅_v4.jpg", type: "image", src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?w=200&q=70", size: "4.5MB", date: "3天前", memberId: "1", prompt: "竹林深处，小桥流水，幽静雅致，中国园林风格", model: "Midjourney v7 Video", resolution: "1280×720", ratio: "16:9", referenceImages: [], appliedTo: [] },
  { id: "g88", name: "荷塘月色_清雅_v3.mp4", type: "video", src: "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?w=200&q=70", size: "8MB", date: "上周", memberId: "1", prompt: "沙漠中古城遗迹，风沙侵蚀，沧桑壮美", model: "Seedream 3.0", resolution: "1024×1024", ratio: "1:1", referenceImages: [], appliedTo: [] },
  { id: "g89", name: "松柏长青_苍翠_v4.jpg", type: "image", src: "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?w=200&q=70", size: "2.7MB", date: "今天", memberId: "1", prompt: "星空璀璨，银河横跨，流星划过，梦幻唯美", model: "Kling 2.0 Video", resolution: "1920×1080", ratio: "9:16", referenceImages: [], appliedTo: [] },
  { id: "g90", name: "莲花盛开_圣洁_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=200&q=70", size: "1.2MB", date: "今天", memberId: "1", prompt: "海底世界，珊瑚礁群，鱼群穿梭，光影斑斓", model: "Seedream 3.0 Video", resolution: "4096×2160", ratio: "1:1", referenceImages: [], appliedTo: [] },
  { id: "g91", name: "蛟龙出海_壮阔_v1.mp4", type: "video", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=200&q=70", size: "28MB", date: "昨天", memberId: "2", prompt: "仙侠场景，古风建筑，飞檐翘角，云雾缭绕，仙气飘渺，电影级构图", model: "Seedream 3.0", resolution: "1024×1024", ratio: "1:1", referenceImages: [], appliedTo: [] },
  { id: "g92", name: "凤凰涅槃_重生_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?w=200&q=70", size: "4.5MB", date: "今天", memberId: "3", prompt: "水墨山水画风格，远山层叠，云海翻涌，日出金光，仙境氛围", model: "Midjourney v7", resolution: "2560×1440", ratio: "3:2", referenceImages: [], appliedTo: [] },
  { id: "g93", name: "青龙腾空_威武_v5.jpg", type: "image", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=200&q=70", size: "2.3MB", date: "3天前", memberId: "4", prompt: "古风少女，长发飘飘，身着粉色襦裙，手持团扇，温婉可人", model: "Seedream 3.0", resolution: "1536×1024", ratio: "3:2", referenceImages: [], appliedTo: [] },
  { id: "g94", name: "白虎啸月_雄壮_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1598887145369-84ae664be195?w=200&q=70", size: "1.8MB", date: "今天", memberId: "3", prompt: "宝剑特写，剑身晶莹剔透，蓝光流转，细节精致，暗色背景", model: "Seedream 3.0", resolution: "1024×1024", ratio: "16:9", referenceImages: [], appliedTo: [] },
  { id: "g95", name: "玄武镇水_沉稳_v2.jpg", type: "image", src: "https://images.unsplash.com/photo-1612036782134-1a5405e02905?w=200&q=70", size: "2.7MB", date: "昨天", memberId: "1", prompt: "夕阳余晖，古城楼全景，城墙斑驳，飞檐翘角，远景云雾", model: "Seedream 3.0", resolution: "1280×720", ratio: "9:16", referenceImages: [], appliedTo: [] },
  { id: "g96", name: "麒麟献瑞_吉祥_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1503431398780-a2e3025d8953?w=200&q=70", size: "3.6MB", date: "上周", memberId: "1", prompt: "森林深处，古树参天，阳光透过树叶洒下斑驳光影", model: "Kling 2.0", resolution: "4096×2160", ratio: "3:2", referenceImages: [], appliedTo: [] },
  { id: "g97", name: "鲲鹏展翅_辽阔_v3.jpg", type: "image", src: "https://images.unsplash.com/photo-1533038590840-1cde6b468958?w=200&q=70", size: "4.5MB", date: "今天", memberId: "2", prompt: "瀑布飞流直下，水花四溅，彩虹横跨，仙境氛围", model: "Kling 2.0 Video", resolution: "1920×1080", ratio: "1:1", referenceImages: [], appliedTo: [] },
  { id: "g98", name: "饕餮盛宴_威严_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=70", size: "3.1MB", date: "3天前", memberId: "4", prompt: "月光洒在湖面，倒影如画，宁静祥和，中国风构图", model: "Seedream 3.0 Video", resolution: "1536×1024", ratio: "4:3", referenceImages: [], appliedTo: [] },
  { id: "g99", name: "穷奇出没_诡异_v3.jpg", type: "image", src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=200&q=70", size: "2.7MB", date: "3天前", memberId: "2", prompt: "战场硝烟弥漫，将军骑马冲锋，气势磅礴，电影感", model: "Midjourney v7 Video", resolution: "2560×1440", ratio: "2:1", referenceImages: [], appliedTo: [] },
  { id: "g100", name: "混沌初开_鸿蒙_v3.jpg", type: "image", src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&q=70", size: "2.7MB", date: "昨天", memberId: "3", prompt: "仙鹤飞翔在云海之上，姿态优雅，仙气飘飘", model: "Midjourney v7", resolution: "1024×1024", ratio: "4:3", referenceImages: [], appliedTo: [] },
];

const UPLOAD_ASSETS: SidebarAsset[] = [
  { id: "u1", name: "人物参考_古装.jpg", type: "image", src: "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?w=200&q=70", size: "1.5MB", date: "昨天", memberId: "1", reviewStatus: "approved" },
  { id: "u2", name: "角色立绘参考.jpg", type: "image", src: "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?w=200&q=70", size: "2.1MB", date: "3天前", memberId: "2", reviewStatus: "pending" },
];

const SUBJECT_ASSETS: SubjectSidebarAsset[] = [
  { id: "s1", name: "三井秀赖", type: "image", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=320&q=80", size: "1.2MB", date: "今天", memberId: "1", reviewStatus: "approved", subjectKind: "character", displayName: "三井秀赖" },
  { id: "s2", name: "三井", type: "image", src: "", size: "0MB", date: "今天", memberId: "1", reviewStatus: "approved", subjectKind: "character", displayName: "三井" },
  { id: "s3", name: "宋磊", type: "image", src: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=320&q=80", size: "1.8MB", date: "今天", memberId: "2", reviewStatus: "approved", subjectKind: "character", displayName: "宋磊" },
  { id: "s4", name: "日本兵", type: "image", src: "", size: "0MB", date: "今天", memberId: "3", reviewStatus: "approved", subjectKind: "character", displayName: "日本兵" },
  { id: "s5", name: "尉官佐藤", type: "image", src: "", size: "0MB", date: "昨天", memberId: "2", reviewStatus: "approved", subjectKind: "character", displayName: "尉官佐藤" },
  { id: "s6", name: "龟田大佐", type: "image", src: "", size: "0MB", date: "昨天", memberId: "4", reviewStatus: "approved", subjectKind: "character", displayName: "龟田大佐" },
  { id: "s7", name: "日军据点", type: "image", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=320&q=80", size: "1.8MB", date: "今天", memberId: "2", reviewStatus: "approved", subjectKind: "scene", displayName: "日军据点" },
  { id: "s8", name: "山间村落", type: "image", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=320&q=80", size: "1.5MB", date: "今天", memberId: "1", reviewStatus: "approved", subjectKind: "scene", displayName: "山间村落" },
  { id: "s9", name: "古道关口", type: "image", src: "", size: "0MB", date: "今天", memberId: "3", reviewStatus: "approved", subjectKind: "scene", displayName: "古道关口" },
  { id: "s10", name: "军刀", type: "image", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=320&q=80", size: "0.9MB", date: "昨天", memberId: "3", reviewStatus: "approved", subjectKind: "prop", displayName: "军刀" },
  { id: "s11", name: "旧式步枪", type: "image", src: "", size: "0MB", date: "昨天", memberId: "2", reviewStatus: "approved", subjectKind: "prop", displayName: "旧式步枪" },
  { id: "s12", name: "情报地图", type: "image", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=320&q=80", size: "1.1MB", date: "今天", memberId: "4", reviewStatus: "approved", subjectKind: "prop", displayName: "情报地图" },
];

const SUBJECT_LIBRARY_TABS: { key: SubjectKind; label: string }[] = [
  { key: "character", label: "人物" },
  { key: "scene", label: "场景" },
  { key: "prop", label: "道具" },
];

const SIDEBAR_ASSETS: Record<SubTab, SidebarAsset[]> = {
  generate: GENERATE_ASSETS,
  upload: UPLOAD_ASSETS,
  subject: SUBJECT_ASSETS,
  collect: [
    { id: "c1", name: "白发女侠_v1.jpg", type: "image", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=200&q=70", size: "2.3MB", date: "今天", memberId: "1", reviewStatus: "approved" },
    { id: "c2", name: "山林场景.jpg", type: "image", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=200&q=70", size: "3.1MB", date: "今天", memberId: "2", reviewStatus: "approved" },
  ],
};

const ASSET_TYPE_ICONS: Record<TypeFilter, typeof LucideImage> = { image: LucideImage, video: Video, audio: Music };

const ASSET_FOLDER_META: Record<AssetFolderKey, { label: string; assets: SidebarAsset[]; preview?: string }> = {
  "all-generate": { label: "全部生成", assets: GENERATE_ASSETS, preview: GENERATE_ASSETS[0]?.src },
  collect: { label: "收藏夹", assets: [...SIDEBAR_ASSETS.collect, ...GENERATE_ASSETS.slice(0, 4)], preview: SIDEBAR_ASSETS.collect[0]?.src },
  uncategorized: { label: "未分类", assets: [GENERATE_ASSETS[3], GENERATE_ASSETS[4], GENERATE_ASSETS[5], GENERATE_ASSETS[1]].filter(Boolean), preview: GENERATE_ASSETS[4]?.src },
  scene: { label: "场景", assets: [GENERATE_ASSETS[1], GENERATE_ASSETS[2], GENERATE_ASSETS[4], SIDEBAR_ASSETS.collect[1], GENERATE_ASSETS[5]].filter(Boolean), preview: GENERATE_ASSETS[1]?.src },
  props: { label: "道具", assets: [GENERATE_ASSETS[3], SIDEBAR_ASSETS.collect[0], GENERATE_ASSETS[0], GENERATE_ASSETS[2]].filter(Boolean), preview: GENERATE_ASSETS[3]?.src },
  style: { label: "风格", assets: [GENERATE_ASSETS[0], SIDEBAR_ASSETS.collect[1], GENERATE_ASSETS[1], SIDEBAR_ASSETS.collect[0]].filter(Boolean), preview: GENERATE_ASSETS[0]?.src },
  sound: { label: "音效", assets: [GENERATE_ASSETS[5], GENERATE_ASSETS[2]].filter(Boolean), preview: GENERATE_ASSETS[5]?.src },
  others: { label: "Others", assets: [UPLOAD_ASSETS[0], UPLOAD_ASSETS[1], GENERATE_ASSETS[3]].filter(Boolean), preview: UPLOAD_ASSETS[0]?.src },
};

const ROOT_ASSET_FOLDER_KEYS: AssetFolderKey[] = ["all-generate", "collect", "uncategorized"];
const CATEGORY_ASSET_FOLDER_KEYS: AssetFolderKey[] = ["scene", "props", "style", "sound", "others"];
const ASSET_FILTER_MEMBERS = ["全部成员", ...PROJECT_MEMBERS.map((member) => member.name)];
const ASSET_FILTER_MODALITIES = ["全部模态", "图片", "视频", "音频"];

const initFolderList = (): FolderData[] => [
  ...ROOT_ASSET_FOLDER_KEYS.map((key) => ({ id: `root-${key}`, key, label: ASSET_FOLDER_META[key].label, assets: [...ASSET_FOLDER_META[key].assets], preview: ASSET_FOLDER_META[key].preview })),
  ...CATEGORY_ASSET_FOLDER_KEYS.map((key) => ({ id: `cat-${key}`, key, label: ASSET_FOLDER_META[key].label, assets: [...ASSET_FOLDER_META[key].assets], preview: ASSET_FOLDER_META[key].preview })),
];

// ─── Shared member avatar row ─────────────────────────────────────────────────
function MemberRow({ memberId }: { memberId?: string }) {
  const member = PROJECT_MEMBERS.find(m => m.id === memberId);
  if (!member) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-semibold text-white"
        style={{ background: member.color }}>
        {member.avatar}
      </div>
      <span className="text-sm flex-1" style={{ color: "rgba(255,255,255,0.75)" }}>{member.name}</span>
      <span className="text-xs px-1.5 py-0.5 rounded"
        style={{ background: `${member.color}18`, color: member.color }}>
        {member.role}
      </span>
    </div>
  );
}

// ─── Generate Asset Detail Modal ──────────────────────────────────────────────
function GenerateAssetModal({ asset, open, onClose }: { asset: GenerateAsset | null; open: boolean; onClose: () => void }) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (asset && open) {
      setTitle(asset.name);
      setIsRenaming(false);
    }
  }, [asset, open]);

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="p-0 overflow-hidden border-0 gap-0"
        style={{
          background: "#1A1510",
          maxWidth: "820px",
          width: "calc(100vw - 2rem)",
          maxHeight: "90vh",
          borderRadius: "16px",
        }}
      >
        <DialogTitle className="sr-only">{asset.name}</DialogTitle>
        <div className="flex" style={{ minHeight: "520px", maxHeight: "90vh" }}>
          {/* Left: image preview */}
          <div className="flex-[1.3] relative overflow-hidden" style={{ background: "#0D0B08", minWidth: 0 }}>
            <img
              src={asset.src}
              alt={asset.name}
              className="w-full h-full object-cover"
              style={{ minHeight: "100%" }}
            />
            <div className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-medium"
              style={{ background: "rgba(0,0,0,0.65)", color: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)" }}>
              AI 生成
            </div>
          </div>

          {/* Right: info panel */}
          <div className="flex flex-col overflow-hidden"
            style={{ width: "300px", flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.07)" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2">
                <Sparkles size={13} style={{ color: "#E87322" }} />
                {isRenaming ? (
                  <input
                    autoFocus
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    onBlur={() => setIsRenaming(false)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") setIsRenaming(false);
                      if (event.key === "Escape") {
                        setTitle(asset.name);
                        setIsRenaming(false);
                      }
                    }}
                    className="w-[170px] rounded-lg border bg-transparent px-2.5 py-1 text-sm font-semibold outline-none"
                    style={{ borderColor: "rgba(232,115,34,0.28)", color: "rgba(255,255,255,0.9)" }}
                  />
                ) : (
                  <>
                    <span className="truncate text-sm font-semibold" style={{ color: "rgba(255,255,255,0.9)", maxWidth: "170px" }}>
                      {title || asset.name}
                    </span>
                    <button
                      type="button"
                      className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-white/6"
                      style={{ color: "rgba(255,255,255,0.38)" }}
                      onClick={() => setIsRenaming(true)}
                      title="重命名"
                    >
                      <Pencil size={11} />
                    </button>
                  </>
                )}
              </div>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>{asset.date}</span>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
              {/* Prompt */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>提示词</span>
                  <button
                    className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded transition-colors hover:bg-white/8"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                    onClick={() => { navigator.clipboard.writeText(asset.prompt); toast.success("已复制提示词"); }}
                  >
                    <Copy size={9} />复制
                  </button>
                </div>
                <div className="text-xs leading-relaxed rounded-xl p-3"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
                  {asset.prompt}
                </div>
              </div>

              {/* Reference images */}
              {asset.referenceImages && asset.referenceImages.length > 0 && (
                <div>
                  <span className="text-xs font-medium block mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>参考图</span>
                  <div className="flex gap-2 flex-wrap">
                    {asset.referenceImages.map((src, i) => (
                      <div key={i} className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0"
                        style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.08)" }}>
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <span className="text-xs font-medium block mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>标签</span>
                <div className="flex flex-wrap gap-1.5">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
                    style={{ background: "rgba(232,115,34,0.1)", border: "1px solid rgba(232,115,34,0.2)" }}>
                    <Cpu size={9} style={{ color: "#E87322" }} />
                    <span className="text-xs" style={{ color: "#E87322" }}>{asset.model}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
                    style={{ background: "rgba(74,158,224,0.1)", border: "1px solid rgba(74,158,224,0.2)" }}>
                    <Scan size={9} style={{ color: "#4A9EE0" }} />
                    <span className="text-xs" style={{ color: "#4A9EE0" }}>{asset.resolution}</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg"
                    style={{ background: "rgba(74,198,120,0.1)", border: "1px solid rgba(74,198,120,0.2)" }}>
                    <MoveRight size={9} style={{ color: "#4AC678" }} />
                    <span className="text-xs" style={{ color: "#4AC678" }}>{asset.ratio}</span>
                  </div>
                </div>
              </div>

              {/* Creator */}
              {asset.memberId && (
                <div>
                  <span className="text-xs font-medium block mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>创建人员</span>
                  <MemberRow memberId={asset.memberId} />
                </div>
              )}

              {/* Applied scenes */}
              {asset.appliedTo && asset.appliedTo.length > 0 && (
                <div>
                  <span className="text-xs font-medium block mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>已应用于</span>
                  <div className="flex flex-col gap-1.5">
                    {asset.appliedTo.map((applied, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        {applied.type === "subject" ? (
                          <Package size={11} style={{ color: "#4AC678", flexShrink: 0 }} />
                        ) : (
                          <Film size={11} style={{ color: "#a78bfa", flexShrink: 0 }} />
                        )}
                        <span className="text-sm flex-1" style={{ color: "rgba(255,255,255,0.7)" }}>{applied.label}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded-md"
                          style={{
                            background: applied.type === "subject" ? "rgba(74,198,120,0.12)" : "rgba(167,139,250,0.12)",
                            color: applied.type === "subject" ? "#4AC678" : "#a78bfa",
                          }}>
                          {applied.type === "subject" ? "主体" : "分镜"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-colors hover:bg-white/5"
                style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
                onClick={() => toast.success("已收藏")}
              >
                <Star size={12} />收藏
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-colors hover:bg-white/5"
                style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
                onClick={() => toast.success("开始下载")}
              >
                <Download size={12} />下载
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-colors"
                style={{ border: "1px solid rgba(255,107,107,0.18)", color: "rgba(255,107,107,0.65)" }}
                onClick={() => { toast.success("已删除"); onClose(); }}
              >
                <Trash2 size={12} />删除
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Upload Asset Detail Modal ────────────────────────────────────────────────
function UploadAssetModal({ asset, open, onClose }: { asset: SidebarAsset | null; open: boolean; onClose: () => void }) {
  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="p-0 overflow-hidden border-0 gap-0"
        style={{
          background: "#1A1510",
          maxWidth: "680px",
          width: "calc(100vw - 2rem)",
          maxHeight: "90vh",
          borderRadius: "16px",
        }}
      >
        <DialogTitle className="sr-only">{asset.name}</DialogTitle>
        <div className="flex" style={{ minHeight: "460px", maxHeight: "90vh" }}>
          {/* Left: image */}
          <div className="flex-[1.2] relative overflow-hidden" style={{ background: "#0D0B08", minWidth: 0 }}>
            <img src={asset.src} alt={asset.name} className="w-full h-full object-cover" style={{ minHeight: "100%" }} />
            {asset.reviewStatus && (
              <div className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs"
                style={{
                  background: REVIEW_STATUS_CONFIG[asset.reviewStatus].bg,
                  border: `1px solid ${REVIEW_STATUS_CONFIG[asset.reviewStatus].border}`,
                  color: REVIEW_STATUS_CONFIG[asset.reviewStatus].color,
                  backdropFilter: "blur(4px)",
                }}>
                {REVIEW_STATUS_CONFIG[asset.reviewStatus].label}
              </div>
            )}
          </div>

          {/* Right: info panel */}
          <div className="flex flex-col overflow-hidden"
            style={{ width: "280px", flexShrink: 0, borderLeft: "1px solid rgba(255,255,255,0.07)" }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2">
                <Upload size={13} style={{ color: "#3b82f6" }} />
                <span className="text-sm font-semibold truncate" style={{ color: "rgba(255,255,255,0.9)", maxWidth: "160px" }}>{asset.name}</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-4">
              {/* File info */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-3 py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>文件大小</span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>{asset.size}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>上传时间</span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>{asset.date}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>类型</span>
                  <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
                    {asset.type === "image" ? "图片" : asset.type === "video" ? "视频" : "音频"}
                  </span>
                </div>
              </div>

              {/* Creator */}
              {asset.memberId && (
                <div>
                  <span className="text-xs font-medium block mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>上传人员</span>
                  <MemberRow memberId={asset.memberId} />
                </div>
              )}

              {/* Review status */}
              {asset.reviewStatus && (
                <div>
                  <span className="text-xs font-medium block mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>审核状态</span>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{
                      background: REVIEW_STATUS_CONFIG[asset.reviewStatus].bg,
                      border: `1px solid ${REVIEW_STATUS_CONFIG[asset.reviewStatus].border}`,
                    }}>
                    {(() => { const Icon = REVIEW_STATUS_CONFIG[asset.reviewStatus].icon; return <Icon size={12} style={{ color: REVIEW_STATUS_CONFIG[asset.reviewStatus].color }} />; })()}
                    <span className="text-sm" style={{ color: REVIEW_STATUS_CONFIG[asset.reviewStatus].color }}>
                      {REVIEW_STATUS_CONFIG[asset.reviewStatus].label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-colors hover:bg-white/5"
                style={{ border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
                onClick={() => toast.success("开始下载")}
              >
                <Download size={12} />下载
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs transition-colors"
                style={{ border: "1px solid rgba(255,107,107,0.18)", color: "rgba(255,107,107,0.65)" }}
                onClick={() => { toast.success("已删除"); onClose(); }}
              >
                <Trash2 size={12} />删除
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Subject Detail Panel (inline in sidebar) ─────────────────────────────────
function SubjectDetailPanel({
  asset,
  onBack,
  onUpdate,
  resolveDraggedAsset,
  forceEditing = false,
}: {
  asset: SubjectSidebarAsset;
  onBack: () => void;
  onUpdate: (updated: SubjectSidebarAsset) => void;
  resolveDraggedAsset?: (assetId: string) => SidebarAsset | undefined;
  forceEditing?: boolean;
}) {
  const [editingName, setEditingName] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(asset.displayName || asset.name);
  const [imgSrc, setImgSrc] = useState(asset.src);
  const [isImageDragOver, setIsImageDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isVirtualIp = asset.subjectKind === "sd_ip";
  const kindConfig = SUBJECT_KIND_CONFIG[asset.subjectKind ?? "character"];
  const KindIcon = kindConfig.icon;

  useEffect(() => {
    setName(asset.displayName || asset.name);
    setImgSrc(asset.src);
  }, [asset.id, asset.name, asset.displayName, asset.src]);

  useEffect(() => {
    if (forceEditing) setIsEditing(true);
  }, [forceEditing]);

  const handleNameSave = () => {
    setEditingName(false);
    onUpdate({ ...asset, name, displayName: name });
    toast.success("名称已更新");
  };

  const replaceSubjectImage = (url: string) => {
    setImgSrc(url);
    onUpdate({ ...asset, src: url });
    toast.success("图片已替换");
  };

  const handleImageReplace = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    replaceSubjectImage(URL.createObjectURL(file));
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsImageDragOver(false);
    if (!isEditing) {
      toast.error("请先点击编辑，再拖入图片替换");
      return;
    }

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("主体图片只支持图片素材");
        return;
      }
      replaceSubjectImage(URL.createObjectURL(file));
      return;
    }

    const data = e.dataTransfer.getData("text/plain");
    if (!data) {
      toast.error("没有识别到可替换的图片");
      return;
    }

    try {
      const payload = JSON.parse(data) as DragPayload;
      let droppedAsset: { src: string; type: TypeFilter } | null = null;
      if (payload.type === "external-asset") {
        droppedAsset = { src: payload.src, type: payload.assetType };
      }
      if (payload.type === "folder-asset") {
        const assetFromFolder = resolveDraggedAsset?.(payload.assetId);
        if (assetFromFolder) droppedAsset = { src: assetFromFolder.src, type: assetFromFolder.type };
      }
      if (!droppedAsset) {
        toast.error("没有识别到可替换的图片");
        return;
      }
      if (droppedAsset.type !== "image") {
        toast.error("主体图片只支持图片素材");
        return;
      }
      replaceSubjectImage(droppedAsset.src);
    } catch {
      toast.error("没有识别到可替换的图片");
    }
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col" style={{ background: "#110E0A" }}>
      {/* Header */}
        <div className="flex items-center gap-2 px-2.5 py-2.5 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={onBack}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors hover:bg-white/5"
          style={{ color: "rgba(255,255,255,0.5)" }}>
          <ChevronLeft size={11} />返回
        </button>
        <div style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.08)" }} />
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <KindIcon size={10} style={{ color: kindConfig.color, flexShrink: 0 }} />
          <span className="truncate text-xs font-medium" style={{ color: "rgba(255,255,255,0.75)" }}>{name}</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0"
          style={{ background: `${kindConfig.color}18`, color: kindConfig.color }}>
          {kindConfig.label}
        </span>
        <button
          onClick={() => setIsEditing((value) => !value)}
          className="ml-1 rounded-lg px-2 py-1 text-[10px] font-medium"
          style={{
            background: isEditing ? "rgba(232,115,34,0.18)" : "rgba(255,255,255,0.06)",
            color: isEditing ? "#E87322" : "rgba(255,255,255,0.48)",
            border: `1px solid ${isEditing ? "rgba(232,115,34,0.26)" : "rgba(255,255,255,0.07)"}`,
          }}
        >
          {isEditing ? "编辑中" : "编辑"}
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Image area */}
        <div className="px-2.5 pt-2.5 relative group">
          <div
            className="rounded-xl overflow-hidden"
            data-subject-edit-drop="true"
            onDragEnter={(e) => {
              e.preventDefault();
              if (isEditing) setIsImageDragOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = isEditing ? "copy" : "none";
              if (isEditing) setIsImageDragOver(true);
            }}
            onDragLeave={(e) => {
              const nextTarget = e.relatedTarget as Node | null;
              if (nextTarget && e.currentTarget.contains(nextTarget)) return;
              setIsImageDragOver(false);
            }}
            onDrop={handleImageDrop}
            style={{
              background: "#1A1510",
              aspectRatio: "16/9",
              border: isImageDragOver ? "2px dashed #F5A623" : isEditing ? "2px dashed rgba(232,115,34,0.68)" : "1px solid rgba(255,255,255,0.06)",
              boxShadow: isImageDragOver ? "0 0 0 5px rgba(245,166,35,0.18)" : isEditing ? "0 0 0 4px rgba(232,115,34,0.1)" : "none",
            }}
          >
            {imgSrc ? (
              <img src={imgSrc} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2" style={{ color: "rgba(255,255,255,0.32)" }}>
                <LucideImage size={28} strokeWidth={1.5} />
                <span className="text-xs font-medium">暂无图片</span>
              </div>
            )}
            {isImageDragOver && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(13,10,6,0.68)", color: "#F5A623" }}>
                <div className="rounded-xl px-3 py-2 text-xs font-medium" style={{ background: "rgba(26,21,16,0.92)", border: "1px solid rgba(245,166,35,0.38)" }}>
                  松手替换主体图片
                </div>
              </div>
            )}
          </div>
         
          {isVirtualIp && (
            <>
              <button
                className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "rgba(0,0,0,0.7)", color: "rgba(255,255,255,0.8)", backdropFilter: "blur(4px)" }}
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus size={9} />替换图片
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageReplace} />
            </>
          )}
        </div>

        {/* Name section */}
        <div className="px-2.5 py-2.5 flex flex-col gap-2.5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>名称</span>
              {isVirtualIp && !editingName && (
                <button
                  className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded transition-colors hover:bg-white/5"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                  onClick={() => setEditingName(true)}
                >
                  <Pencil size={8} />修改
                </button>
              )}
            </div>
            {editingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  className="flex-1 rounded-lg px-2 py-1.5 text-xs outline-none"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(232,115,34,0.4)",
                    color: "rgba(255,255,255,0.85)",
                    caretColor: "#E87322",
                  }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
                  autoFocus
                />
                <button
                  className="px-2 py-1.5 rounded-lg text-[10px] font-medium"
                  style={{ background: "#E87322", color: "#fff" }}
                  onClick={handleNameSave}
                >
                  确定
                </button>
                <button
                  className="px-2 py-1.5 rounded-lg text-[10px]"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}
                  onClick={() => { setEditingName(false); setName(asset.displayName || asset.name); }}
                >
                  取消
                </button>
              </div>
            ) : (
              <div className="px-2.5 py-2 rounded-xl text-xs"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)" }}>
                {name}
              </div>
            )}
          </div>

          {/* Meta info */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span style={{ color: "rgba(255,255,255,0.35)" }}>大小</span>
              <span style={{ color: "rgba(255,255,255,0.6)" }}>{asset.size}</span>
            </div>
            <div className="flex items-center justify-between text-[10px]">
              <span style={{ color: "rgba(255,255,255,0.35)" }}>更新于</span>
              <span style={{ color: "rgba(255,255,255,0.6)" }}>{asset.date}</span>
            </div>
          </div>

          {/* Creator */}
          {asset.memberId && (
            <div>
              <span className="text-[10px] font-medium block mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>创建人员</span>
              {(() => {
                const member = PROJECT_MEMBERS.find(m => m.id === asset.memberId);
                if (!member) return null;
                return (
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[7px] font-semibold text-white"
                      style={{ background: member.color }}>
                      {member.avatar}
                    </div>
                    <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.65)" }}>{member.name}</span>
                    <span className="text-[9px] px-1 py-0.5 rounded ml-auto"
                      style={{ background: `${member.color}15`, color: member.color }}>{member.role}</span>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Review status */}
          {asset.reviewStatus && (
            <div>
              <span className="text-[10px] font-medium block mb-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>审核状态</span>
              <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg"
                style={{
                  background: REVIEW_STATUS_CONFIG[asset.reviewStatus].bg,
                  border: `1px solid ${REVIEW_STATUS_CONFIG[asset.reviewStatus].border}`,
                }}>
                {(() => { const Icon = REVIEW_STATUS_CONFIG[asset.reviewStatus].icon; return <Icon size={10} style={{ color: REVIEW_STATUS_CONFIG[asset.reviewStatus].color }} />; })()}
                <span className="text-[10px]" style={{ color: REVIEW_STATUS_CONFIG[asset.reviewStatus].color }}>
                  {REVIEW_STATUS_CONFIG[asset.reviewStatus].label}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
interface Props {
  projectId?: string;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  activeSubTab?: SubTab;
  hideSubTabs?: boolean;
  title?: string;
  hideTitle?: boolean;
  hideSourceFilter?: boolean;
  guideSubjectDetailOpen?: boolean;
  guideSubjectEditing?: boolean;
  guideDragAssetReplace?: boolean;
  guideStoryboardVideoDrop?: boolean;
  onSubjectCardClick?: () => void;
}

export function ProjectAssetsSidebarPanel({ sidebarOpen = true, onToggleSidebar, activeSubTab, hideSubTabs = false, title, hideTitle = false, hideSourceFilter = false, guideSubjectDetailOpen = false, guideSubjectEditing = false, guideDragAssetReplace = false, guideStoryboardVideoDrop = false, onSubjectCardClick }: Props) {
  const [assetSubTab, setAssetSubTab] = useState<SubTab>(activeSubTab ?? "subject");
  const [assetTypeFilter, setAssetTypeFilter] = useState<TypeFilter>("image");
  const [assetSearch, setAssetSearch] = useState("");
  const [reviewStatusFilter, setReviewStatusFilter] = useState<"all" | ReviewStatus>("all");
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [assetFolderView, setAssetFolderView] = useState<AssetFolderKey | null>(null);
  const [expandedAssetFolders, setExpandedAssetFolders] = useState<Record<AssetFolderKey, boolean>>({ props: true });
  const [assetListMode, setAssetListMode] = useState<"grid" | "list">("grid");
  const [hoverPreview, setHoverPreview] = useState<{ src: string; name: string; x: number; y: number } | null>(null);
  const [assetMemberFilter, setAssetMemberFilter] = useState("全部成员");
  const [assetModalityFilter, setAssetModalityFilter] = useState("全部模态");
  const [openAssetFilter, setOpenAssetFilter] = useState<"member" | "modality" | null>(null);
  const [assetActionMenuId, setAssetActionMenuId] = useState<string | null>(null);
  const [folderActionMenuKey, setFolderActionMenuKey] = useState<AssetFolderKey | null>(null);
  const [subjectLibraryKind, setSubjectLibraryKind] = useState<SubjectKind>("character");

  // Asset source filter (新增)
  const [assetSourceFilter, setAssetSourceFilter] = useState<AssetSource>("shared");
  const [sharedSubSource, setSharedSubSource] = useState<SharedSubSource>("project"); // 默认选中本项目资产
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [showSharedSubMenu, setShowSharedSubMenu] = useState(false);

  // Modal state for generate / upload
  const [generateModal, setGenerateModal] = useState<GenerateAsset | null>(null);
  const [uploadModal, setUploadModal] = useState<SidebarAsset | null>(null);

  // Inline panel state for subject tab
  const [subjectDetail, setSubjectDetail] = useState<SubjectSidebarAsset | null>(null);

  // Mutable subject list
  const [subjectAssets, setSubjectAssets] = useState<SubjectSidebarAsset[]>(SUBJECT_ASSETS);

  // Folder data (mutable for drag-and-drop and new folders)
  const [folderList, setFolderList] = useState<FolderData[]>(initFolderList);
  const [rootFolderKeys, setRootFolderKeys] = useState<string[]>(ROOT_ASSET_FOLDER_KEYS);
  const [catFolderKeys, setCatFolderKeys] = useState<string[]>(CATEGORY_ASSET_FOLDER_KEYS);

  // Drag and drop state
  const [draggedFolderKey, setDraggedFolderKey] = useState<string | null>(null);
  const [draggedAsset, setDraggedAsset] = useState<{ folderKey: string; assetId: string } | null>(null);
  const [dropTargetFolder, setDropTargetFolder] = useState<string | null>(null);
  const [dropTargetAssetIndex, setDropTargetAssetIndex] = useState<number | null>(null);
  const [dragOverFolderKey, setDragOverFolderKey] = useState<string | null>(null); // for dropping external assets

  // New folder creation
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  useEffect(() => {
    if (!activeSubTab) return;
    setAssetSubTab(activeSubTab);
    setSubjectDetail(null);
  }, [activeSubTab]);

  useEffect(() => {
    if (guideSubjectDetailOpen && assetSubTab === "subject") {
      setSubjectDetail(subjectAssets[0] ?? null);
    }
  }, [guideSubjectDetailOpen, assetSubTab, subjectAssets]);

  useEffect(() => {
    if (guideDragAssetReplace && assetSubTab === "generate" && !assetFolderView) {
      setAssetFolderView("all-generate");
    }
  }, [guideDragAssetReplace, assetSubTab, assetFolderView]);

  useEffect(() => {
    if (guideStoryboardVideoDrop && assetSubTab === "generate") {
      setAssetFolderView("all-generate");
      setAssetTypeFilter("video");
      setAssetModalityFilter("视频");
    }
  }, [guideStoryboardVideoDrop, assetSubTab]);

  // Filter assets
  const currentAssets = assetSubTab === "subject" ? subjectAssets : SIDEBAR_ASSETS[assetSubTab];
  const filteredAssets = currentAssets.filter(a => {
    if (a.type !== assetTypeFilter) return false;
    if (assetSearch && !a.name.toLowerCase().includes(assetSearch.toLowerCase())) return false;
    if (reviewStatusFilter !== "all" && a.reviewStatus !== reviewStatusFilter) return false;
    return true;
  });
  const subjectLibraryAssets = subjectAssets.filter((asset) => {
    if (asset.subjectKind !== subjectLibraryKind) return false;
    if (assetSearch && !asset.name.toLowerCase().includes(assetSearch.toLowerCase())) return false;
    return true;
  });

  // ─── Drag & Drop handlers ────────────────────────────────────────────────────
  const handleDragFolderStart = (folderKey: string) => { setDraggedFolderKey(folderKey); };

  const handleDragOverFolder = (e: React.DragEvent, folderKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTargetFolder(folderKey);
  };

  const handleDropOnFolder = (e: React.DragEvent, targetFolderKey: string) => {
    e.preventDefault();
    setDropTargetFolder(null);
    const data = e.dataTransfer.getData("text/plain");
    if (!data) return;
    try {
      const payload: DragPayload = JSON.parse(data);
      if (payload.type === "folder") return; // folder reorder handled separately
      if (payload.type === "folder-asset") {
        // Move asset from source folder to target folder
        setFolderList((prev) => prev.map((folder) => {
          if (folder.key === payload.folderKey) {
            const assetIdx = folder.assets.findIndex((a) => a.id === payload.assetId);
            if (assetIdx < 0) return folder;
            const asset = folder.assets[assetIdx];
            const newAssets = [...folder.assets];
            newAssets.splice(assetIdx, 1);
            return { ...folder, assets: newAssets };
          }
          if (folder.key === targetFolderKey) {
            const asset = findAssetById(payload.assetId);
            if (asset) return { ...folder, assets: [...folder.assets, asset] };
          }
          return folder;
        }));
      } else if (payload.type === "external-asset") {
        // Add external asset to target folder
        const newAsset: SidebarAsset = {
          id: `ext-${Date.now()}`, name: payload.name, type: payload.assetType,
          src: payload.src, size: "unknown", date: "刚刚", memberId: "1",
        };
        setFolderList((prev) => prev.map((folder) => {
          if (folder.key === targetFolderKey) {
            return { ...folder, assets: [...folder.assets, newAsset] };
          }
          return folder;
        }));
        toast.success(`已添加到「${findFolderLabel(targetFolderKey)}」`);
      }
    } catch { /* ignore parse error */ }
    setDraggedAsset(null);
    setDraggedFolderKey(null);
  };

  const handleDragFolderAssetStart = (folderKey: string, assetId: string) => {
    setDraggedAsset({ folderKey, assetId });
  };

  const handleDropReorderFolder = (e: React.DragEvent, targetIndex: number, type: "root" | "cat") => {
    e.preventDefault();
    const list = type === "root" ? [...rootFolderKeys] : [...catFolderKeys];
    const setList = type === "root" ? setRootFolderKeys : setCatFolderKeys;
    const draggedKey = draggedFolderKey;
    if (!draggedKey || !list.includes(draggedKey)) { setDraggedFolderKey(null); return; }
    const fromIndex = list.indexOf(draggedKey);
    if (fromIndex === targetIndex) { setDraggedFolderKey(null); return; }
    const newList = [...list];
    newList.splice(fromIndex, 1);
    newList.splice(targetIndex, 0, draggedKey);
    setList(newList);
    setDraggedFolderKey(null);
  };

  const handleDropReorderAsset = (e: React.DragEvent, folderKey: string, targetIndex: number) => {
    e.preventDefault();
    const dragged = draggedAsset;
    if (!dragged || dragged.folderKey !== folderKey) { setDraggedAsset(null); return; }
    setFolderList((prev) => prev.map((folder) => {
      if (folder.key !== folderKey) return folder;
      const fromIndex = folder.assets.findIndex((a) => a.id === dragged.assetId);
      if (fromIndex < 0 || fromIndex === targetIndex) return folder;
      const newAssets = [...folder.assets];
      newAssets.splice(fromIndex, 1);
      newAssets.splice(targetIndex, 0, folder.assets[fromIndex]);
      return { ...folder, assets: newAssets };
    }));
    setDraggedAsset(null);
  };

  const handleDragEnd = () => {
    setDraggedFolderKey(null);
    setDraggedAsset(null);
    setDropTargetFolder(null);
    setDropTargetAssetIndex(null);
    setDragOverFolderKey(null);
  };

  // ─── Folder creation ─────────────────────────────────────────────────────────
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) { setIsCreatingFolder(false); return; }
    const key = `custom-${Date.now()}`;
    const newFolder: FolderData = { id: key, key, label: newFolderName.trim(), assets: [], preview: undefined, isCustom: true };
    setFolderList((prev) => [...prev, newFolder]);
    setCatFolderKeys((prev) => [...prev, key]);
    setNewFolderName("");
    setIsCreatingFolder(false);
    toast.success(`文件夹「${newFolderName.trim()}」已创建`);
  };

  const handleDeleteFolder = (folderKey: string) => {
    setFolderList((prev) => prev.filter((f) => f.key !== folderKey));
    setCatFolderKeys((prev) => prev.filter((k) => k !== folderKey));
    if (assetFolderView === folderKey) setAssetFolderView(null);
    toast.success("文件夹已删除");
  };

  const handleRenameFolder = (folderKey: string, newLabel: string) => {
    setFolderList((prev) => prev.map((f) => f.key === folderKey ? { ...f, label: newLabel } : f));
  };

  const findAssetById = (assetId: string): SidebarAsset | undefined => {
    for (const folder of folderList) {
      const found = folder.assets.find((a) => a.id === assetId);
      if (found) return found;
    }
    return undefined;
  };

  const findFolderLabel = (folderKey: string): string => {
    return folderList.find((f) => f.key === folderKey)?.label ?? folderKey;
  };

  const handleAssetClick = (asset: SidebarAsset) => {
    if (assetSubTab === "generate") {
      const genAsset = GENERATE_ASSETS.find(g => g.id === asset.id);
      if (genAsset) setGenerateModal(genAsset);
    } else if (assetSubTab === "upload") {
      setUploadModal(asset);
    } else if (assetSubTab === "subject") {
      const subjectAsset = subjectAssets.find(s => s.id === asset.id);
      if (subjectAsset) setSubjectDetail(subjectAsset);
    }
  };

  const handleSubjectUpdate = (updated: SubjectSidebarAsset) => {
    setSubjectAssets(prev => prev.map(s => s.id === updated.id ? updated : s));
    setSubjectDetail(updated);
  };

  const openAssetFolder = (folderKey: AssetFolderKey) => {
    setAssetFolderView(folderKey);
    setHoverPreview(null);
  };

  const showAssetPreview = (asset: SidebarAsset, event: MouseEvent<HTMLElement>) => {
    setHoverPreview({ src: asset.src, name: asset.name, x: event.clientX, y: event.clientY });
  };

  const assetPassesLibraryFilters = (asset: SidebarAsset) => {
    if (assetSearch && !asset.name.toLowerCase().includes(assetSearch.toLowerCase())) return false;
    if (assetMemberFilter !== "全部成员") {
      const member = PROJECT_MEMBERS.find((item) => item.id === asset.memberId);
      if (member?.name !== assetMemberFilter) return false;
    }
    if (assetModalityFilter !== "全部模态") {
      const typeLabel = asset.type === "image" ? "图片" : asset.type === "video" ? "视频" : "音频";
      if (typeLabel !== assetModalityFilter) return false;
    }
    return true;
  };

  const assetPreviewLabel = (asset: SidebarAsset) => {
    const base = asset.name.includes(".") ? asset.name.split(".").slice(0, -1).join(".") : asset.name;
    return base || "Image";
  };

  const renderAssetFilterDropdown = (
    kind: "member" | "modality",
    label: string,
    options: string[],
    value: string,
    onChange: (next: string) => void,
    icon: typeof User,
  ) => {
    const Icon = icon;
    const opened = openAssetFilter === kind;
    return (
      <div className="relative flex-shrink-0">
        <button
          className="flex h-8 items-center gap-1 rounded-full px-2.5 text-[10px] font-medium transition-colors"
          style={{
            background: opened ? "rgba(232,115,34,0.14)" : "rgba(255,255,255,0.06)",
            border: opened ? "1px solid rgba(232,115,34,0.3)" : "1px solid rgba(255,255,255,0.1)",
            color: opened ? "#F1A66C" : "rgba(255,255,255,0.58)",
          }}
          onClick={(event) => {
            event.stopPropagation();
            setOpenAssetFilter(opened ? null : kind);
          }}
          title={label}
        >
          <Icon size={12} />
          <span>{value === options[0] ? label : value}</span>
          <ChevronDown size={10} />
        </button>
        {opened && (
          <div
            className="absolute right-0 top-full z-40 mt-1 overflow-hidden rounded-xl"
            style={{ width: "132px", background: "#211A14", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 16px 38px rgba(0,0,0,0.5)" }}
            onClick={(event) => event.stopPropagation()}
          >
            {options.map((option) => (
              <button
                key={option}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-white/6"
                style={{ color: value === option ? "#F1A66C" : "rgba(255,255,255,0.66)", background: value === option ? "rgba(232,115,34,0.1)" : "transparent" }}
                onClick={() => {
                  onChange(option);
                  setOpenAssetFilter(null);
                }}
              >
                <span className="truncate">{option}</span>
                {value === option && <Check size={12} />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAssetActions = (asset: SidebarAsset, compact = false) => (
    <div className="absolute right-1.5 top-1.5 z-10 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
      <button
        className="flex items-center justify-center rounded-full"
        style={{ width: compact ? "20px" : "24px", height: compact ? "20px" : "24px", background: "rgba(0,0,0,0.54)", color: "#FFB21A", border: "1px solid rgba(255,255,255,0.16)" }}
        onClick={(event) => {
          event.stopPropagation();
          toast.success("已收藏");
        }}
        title="收藏"
      >
        <Star size={compact ? 12 : 14} fill="currentColor" />
      </button>
      <div className="relative">
        <button
          className="flex items-center justify-center rounded-full"
          style={{ width: compact ? "20px" : "24px", height: compact ? "20px" : "24px", background: "rgba(0,0,0,0.54)", color: "rgba(255,255,255,0.84)", border: "1px solid rgba(255,255,255,0.16)" }}
          onClick={(event) => {
            event.stopPropagation();
            setAssetActionMenuId(assetActionMenuId === asset.id ? null : asset.id);
          }}
          title="更多"
        >
          <MoreHorizontal size={compact ? 12 : 14} />
        </button>
        {assetActionMenuId === asset.id && (
          <div
            className="absolute right-0 top-full z-40 mt-1 overflow-hidden rounded-lg"
            style={{ width: "104px", background: "#211A14", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 14px 34px rgba(0,0,0,0.54)" }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-[11px] hover:bg-white/6"
              style={{ color: "rgba(255,255,255,0.72)" }}
              onClick={() => { setAssetActionMenuId(null); toast.success("进入重命名"); }}
            >
              <Pencil size={12} />重命名
            </button>
            <button
              className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-[11px] hover:bg-white/6"
              style={{ color: "rgba(255,255,255,0.72)" }}
              onClick={() => { setAssetActionMenuId(null); toast.success("开始下载"); }}
            >
              <Download size={12} />下载
            </button>
            <button
              className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-[11px] hover:bg-red-900/20"
              style={{ color: "#ff6b6b" }}
              onClick={() => { setAssetActionMenuId(null); toast.success("已删除"); }}
            >
              <Trash2 size={12} />删除
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderFolderActions = (folderKey: AssetFolderKey) => {
    const opened = folderActionMenuKey === folderKey;
    return (
      <div className="relative flex-shrink-0">
        <button
          className="flex h-6 w-6 items-center justify-center rounded-full opacity-70 transition-colors hover:bg-white/10 group-hover:opacity-100"
          style={{ color: opened ? "#F1A66C" : "rgba(255,255,255,0.42)" }}
          onClick={(event) => {
            event.stopPropagation();
            setFolderActionMenuKey(opened ? null : folderKey);
            setAssetActionMenuId(null);
          }}
          title="更多"
        >
          <MoreHorizontal size={13} />
        </button>
        {opened && (
          <div
            className="absolute right-0 top-full z-40 mt-1 overflow-hidden rounded-lg"
            style={{ width: "94px", background: "#211A14", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 14px 34px rgba(0,0,0,0.54)" }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-[11px] hover:bg-white/6"
              style={{ color: "rgba(255,255,255,0.72)" }}
              onClick={() => { setFolderActionMenuKey(null); handleRenameFolder(folderKey, prompt("重命名文件夹", getFolderByKey(folderKey)?.label ?? "") ?? ""); }}
            >
              <Pencil size={12} />重命名
            </button>
            {getFolderByKey(folderKey)?.isCustom && (
              <button
                className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-[11px] hover:bg-red-900/20"
                style={{ color: "#ff6b6b" }}
                onClick={() => { setFolderActionMenuKey(null); handleDeleteFolder(folderKey); }}
              >
                <Trash2 size={12} />删除
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderAssetTypeGlyph = (asset: SidebarAsset, size = 7) => {
    if (asset.type === "image") return <LucideImage size={size} />;
    if (asset.type === "video") return <Video size={size} />;
    return <Music size={size} />;
  };

  const folderAssetMatchesSearch = (folderKey: string) => {
    if (!assetSearch) return true;
    const keyword = assetSearch.toLowerCase();
    const folder = folderList.find((f) => f.key === folderKey);
    if (!folder) return false;
    return folder.label.toLowerCase().includes(keyword) || folder.assets.some((asset) => asset.name.toLowerCase().includes(keyword));
  };

  const getFolderByKey = (folderKey: string): FolderData | undefined => folderList.find((f) => f.key === folderKey);

  const renderFolderIcon = (folderKey: string, expanded = false) => {
    const folder = getFolderByKey(folderKey);
    const preview = folder?.preview;
    return (
      <div className="relative h-7 w-8 flex-shrink-0">
        <Folder
          size={30}
          strokeWidth={1.4}
          fill="url(#asset-folder-gradient)"
          style={{ color: "rgba(255,255,255,0.72)", filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.45))" }}
        />
        {preview && (
          <img
            src={preview}
            alt=""
            className="absolute left-[7px] top-[7px] h-4 w-5 rounded-sm object-cover"
            style={{ opacity: expanded ? 0.92 : 0.68 }}
          />
        )}
      </div>
    );
  };

  const renderAssetFolderItem = (folderKey: string, showDisclosure = true) => {
    const folder = getFolderByKey(folderKey);
    if (!folder) return null;
    const expanded = !!expandedAssetFolders[folderKey];
    const isDragged = draggedFolderKey === folderKey;
    const isDragOver = dragOverFolderKey === folderKey && draggedAsset !== null;
    return (
      <div key={folderKey}>
        <div
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("text/plain", JSON.stringify({ type: "folder", folderKey } as DragFolderPayload));
            e.dataTransfer.effectAllowed = "move";
            handleDragFolderStart(folderKey);
          }}
          onDragEnd={handleDragEnd}
        >
          <button
            className="group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-white/5"
            style={{
              background: expanded ? "rgba(255,255,255,0.12)" : "transparent",
              opacity: isDragged ? 0.4 : 1,
              border: isDragOver ? "1px dashed rgba(232,115,34,0.5)" : showDisclosure && folder.isCustom ? "1px solid transparent" : "1px solid transparent",
              borderColor: isDragOver ? "rgba(232,115,34,0.5)" : undefined,
            }}
            onClick={() => {
              if (showDisclosure) {
                setExpandedAssetFolders((current) => ({ ...current, [folderKey]: !current[folderKey] }));
                if (!expanded && folder.assets.length > 0) return;
              } else {
                openAssetFolder(folderKey);
                return;
              }
              if (folder.assets.length > 0) {
                handleAssetClick(folder.assets[0]);
              }
            }}
            onDoubleClick={showDisclosure ? undefined : () => openAssetFolder(folderKey)}
            onDragOver={(e) => handleDragOverFolder(e, folderKey)}
            onDrop={(e) => handleDropOnFolder(e, folderKey)}
          >
            {showDisclosure ? (
              <ChevronDown
                size={13}
                style={{
                  color: "rgba(255,255,255,0.5)",
                  transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
                  transition: "transform 0.15s",
                  flexShrink: 0,
                }}
              />
            ) : (
              <span className="w-[13px]" />
            )}
            {folderKey === "collect" ? (
              <Star size={20} fill="currentColor" style={{ color: "rgba(255,255,255,0.76)", flexShrink: 0 }} />
            ) : folderKey === "all-generate" ? (
              <Images size={20} style={{ color: "rgba(255,255,255,0.76)", flexShrink: 0 }} />
            ) : folderKey === "uncategorized" ? (
              <Layers3 size={20} style={{ color: "rgba(255,255,255,0.76)", flexShrink: 0 }} />
            ) : renderFolderIcon(folderKey, expanded)}
            <span className="min-w-0 flex-1 truncate text-sm font-semibold" style={{ color: "rgba(255,255,255,0.72)" }}>{folder.label}</span>
            {showDisclosure && renderFolderActions(folderKey)}
          </button>
        </div>
        {expanded && folder.assets.length > 0 && (
          <div className="ml-6 mt-1 space-y-0.5 px-1">
            {folder.assets.map((asset, index) => (
              <div
                key={asset.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", JSON.stringify({ type: "folder-asset", folderKey, assetId: asset.id } as DragFolderAssetPayload));
                  e.dataTransfer.effectAllowed = "move";
                  handleDragFolderAssetStart(folderKey, asset.id);
                }}
                onDragEnd={handleDragEnd}
              >
                <button
                  className="group relative flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left transition-colors hover:bg-white/5"
                  style={{ opacity: draggedAsset?.assetId === asset.id ? 0.4 : 1 }}
                  data-asset-prop-guide-item={folderKey === "props" && index === 0 ? "true" : undefined}
                  data-asset-quick-guide-item={folderKey === "props" && index === 0 ? "true" : undefined}
                  onClick={() => {
                    handleAssetClick(asset);
                  }}
                  onMouseMove={(event) => showAssetPreview(asset, event)}
                  onMouseLeave={() => setHoverPreview(null)}
                  onDragOver={(e) => { e.preventDefault(); setDropTargetAssetIndex(index); }}
                  onDrop={(e) => handleDropReorderAsset(e, folderKey, index)}
                >
                  <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-md" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                    <img src={asset.src} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex min-w-0 flex-1 items-center gap-1.5">
                    <div className="flex h-4 w-4 items-center justify-center rounded flex-shrink-0" style={{ background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.75)" }}>
                      {renderAssetTypeGlyph(asset, 9)}
                    </div>
                    <span className="truncate text-xs font-medium" style={{ color: "rgba(255,255,255,0.62)" }}>{asset.name.replace(/古风女侠_v1|道具宝剑/, "01")}</span>
                  </div>
                  {/* 收藏 - always visible */}
                  <button
                    className="flex items-center justify-center rounded-full flex-shrink-0"
                    style={{ width: "20px", height: "20px", background: "rgba(0,0,0,0.45)", color: "#FFB21A", border: "1px solid rgba(255,255,255,0.12)" }}
                    onClick={(event) => { event.stopPropagation(); toast.success("已收藏"); }}
                    title="收藏"
                  >
                    <Star size={10} fill="currentColor" />
                  </button>
                  {/* 更多 - hover only */}
                  <div className="relative invisible group-hover:visible">
                    <button
                      className="flex items-center justify-center rounded-full"
                      style={{ width: "20px", height: "20px", background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.12)" }}
                      onClick={(event) => { event.stopPropagation(); setAssetActionMenuId(assetActionMenuId === asset.id ? null : asset.id); }}
                      title="更多"
                    >
                      <MoreHorizontal size={10} />
                    </button>
                    {assetActionMenuId === asset.id && (
                      <div
                        className="absolute right-0 top-full z-40 mt-1 overflow-hidden rounded-lg"
                        style={{ width: "94px", background: "#211A14", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 14px 34px rgba(0,0,0,0.54)" }}
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-[11px] hover:bg-white/6"
                          style={{ color: "rgba(255,255,255,0.72)" }}
                          onClick={() => { setAssetActionMenuId(null); toast.success("开始下载"); }}
                        >
                          <Download size={12} />下载
                        </button>
                        <button
                          className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-[11px] hover:bg-red-900/20"
                          style={{ color: "#ff6b6b" }}
                          onClick={() => { setAssetActionMenuId(null); toast.success("已删除"); }}
                        >
                          <Trash2 size={12} />删除
                        </button>
                      </div>
                    )}
                  </div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAssetFolderHome = () => (
    <div className="flex h-full flex-col">
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="asset-folder-gradient" x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="#F1F1F1" offset="0%" />
            <stop stopColor="#A7A7A7" offset="55%" />
            <stop stopColor="#6A6A6A" offset="100%" />
          </linearGradient>
        </defs>
      </svg>
      <div className="px-2 py-2">
        <div className="flex items-center gap-1.5">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full px-3 py-2" style={{ background: "#0E0E0E", border: "1px solid rgba(255,255,255,0.13)" }}>
            <Search size={16} style={{ color: "rgba(255,255,255,0.46)" }} />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
              style={{ color: "rgba(255,255,255,0.7)", caretColor: "#E87322" }}
              placeholder="搜索"
              value={assetSearch}
              onChange={(event) => setAssetSearch(event.target.value)}
            />
            {assetSearch && (
              <button onClick={() => setAssetSearch("")}>
                <X size={12} style={{ color: "rgba(255,255,255,0.36)" }} />
              </button>
            )}
          </div>
          {renderAssetFilterDropdown("member", "成员", ASSET_FILTER_MEMBERS, assetMemberFilter, setAssetMemberFilter, User)}
          {renderAssetFilterDropdown("modality", "模态", ASSET_FILTER_MODALITIES, assetModalityFilter, setAssetModalityFilter, Layers3)}
        </div>
      </div>
      <div className="flex-1 overflow-auto px-2 pb-4 pt-2">
        {/* Root folders */}
        <div className="space-y-1">
          {rootFolderKeys.filter(folderAssetMatchesSearch).map((folderKey, index) => (
            <div key={folderKey} onDragOver={(e) => handleDragOverFolder(e, folderKey)} onDrop={(e) => handleDropReorderFolder(e, index, "root")}>
              {renderAssetFolderItem(folderKey, false)}
              {dropTargetFolder === folderKey && draggedFolderKey && (
                <div className="h-0.5 mx-2 rounded-full" style={{ background: "#E87322" }} />
              )}
            </div>
          ))}
        </div>
        <div className="my-4 h-px" style={{ background: "rgba(255,255,255,0.12)" }} />
        {/* Category folders */}
        <div className="mb-2 flex items-center justify-between px-1">
          <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.48)" }}>文件夹</span>
          <button
            className="group/new-folder relative flex h-7 w-7 items-center justify-center rounded-full transition-transform hover:scale-105"
            style={{
              background: "rgba(232,115,34,0.2)",
              border: "1px solid rgba(232,115,34,0.46)",
              color: "#FF9A5F",
              boxShadow: "0 0 0 3px rgba(232,115,34,0.08)",
            }}
            title="新建文件夹"
            onClick={() => { setIsCreatingFolder(true); setNewFolderName(""); }}
          >
            <Plus size={17} strokeWidth={2.4} />
            <span
              className="pointer-events-none absolute right-0 top-full z-40 mt-2 whitespace-nowrap rounded-lg px-2 py-1 text-[11px] font-medium opacity-0 transition-opacity group-hover/new-folder:opacity-100"
              style={{ background: "#211A14", border: "1px solid rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.82)", boxShadow: "0 12px 28px rgba(0,0,0,0.42)" }}
            >
              新建文件夹
            </span>
          </button>
        </div>
        <div className="space-y-1">
          {catFolderKeys.filter(folderAssetMatchesSearch).map((folderKey, index) => (
            <div key={folderKey} onDragOver={(e) => handleDragOverFolder(e, folderKey)} onDrop={(e) => handleDropReorderFolder(e, index, "cat")}>
              {renderAssetFolderItem(folderKey)}
              {dropTargetFolder === folderKey && draggedFolderKey && (
                <div className="h-0.5 mx-2 rounded-full" style={{ background: "#E87322" }} />
              )}
            </div>
          ))}
        </div>
        {isCreatingFolder ? (
          <div className="mt-2 flex items-center gap-1.5 px-1">
            <input
              autoFocus
              className="flex-1 rounded-lg border bg-transparent px-2 py-1.5 text-xs outline-none"
              style={{ borderColor: "rgba(232,115,34,0.3)", color: "rgba(255,255,255,0.8)" }}
              placeholder="文件夹名称"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreateFolder(); if (e.key === "Escape") { setIsCreatingFolder(false); setNewFolderName(""); } }}
              onBlur={() => { if (!newFolderName.trim()) { setIsCreatingFolder(false); } }}
            />
            <button className="text-xs px-2 py-1.5 rounded-lg" style={{ background: "#E87322", color: "#fff" }} onClick={handleCreateFolder}>确定</button>
            <button className="text-xs px-2 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }} onClick={() => { setIsCreatingFolder(false); setNewFolderName(""); }}>取消</button>
          </div>
        ) : null}
      </div>
    </div>
  );

  const renderAssetFolderDetail = () => {
    const folder = getFolderByKey(assetFolderView ?? "collect");
    if (!folder) return null;
    const visibleAssets = folder.assets.filter(assetPassesLibraryFilters);
    const isGuideDragFolder = guideDragAssetReplace && assetSubTab === "generate" && assetFolderView === "all-generate";
    return (
      <div className="flex h-full flex-col" data-subject-drag-sidebar={isGuideDragFolder ? "true" : undefined}>
        <div className="flex items-center gap-1.5 px-3 py-2">
          <button
            className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-white/8"
            onClick={() => { setAssetFolderView(null); setHoverPreview(null); }}
            title="返回"
          >
            <ChevronLeft size={16} style={{ color: "rgba(255,255,255,0.62)" }} />
          </button>
          <span className="min-w-0 flex-1 truncate text-sm font-bold" style={{ color: "rgba(255,255,255,0.88)" }}>{folder.label}</span>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
            style={{ background: assetListMode === "grid" ? "rgba(255,255,255,0.14)" : "transparent", color: "rgba(255,255,255,0.74)" }}
            onClick={() => setAssetListMode("grid")}
            title="宫格"
          >
            <Grid2X2 size={18} />
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors"
            style={{ background: assetListMode === "list" ? "rgba(255,255,255,0.14)" : "transparent", color: "rgba(255,255,255,0.62)" }}
            onClick={() => setAssetListMode("list")}
            title="列表"
          >
            <List size={18} />
          </button>
        </div>
        <div className="flex items-center gap-1.5 px-2 pb-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-full px-2.5 py-1.5" style={{ background: "#0E0E0E", border: "1px solid rgba(255,255,255,0.12)" }}>
            <Search size={12} style={{ color: "rgba(255,255,255,0.42)" }} />
            <input
              className="min-w-0 flex-1 bg-transparent text-xs outline-none"
              style={{ color: "rgba(255,255,255,0.66)", caretColor: "#E87322" }}
              placeholder="搜索"
              value={assetSearch}
              onChange={(event) => setAssetSearch(event.target.value)}
            />
          </div>
          {renderAssetFilterDropdown("member", "成员", ASSET_FILTER_MEMBERS, assetMemberFilter, setAssetMemberFilter, User)}
          {renderAssetFilterDropdown("modality", "模态", ASSET_FILTER_MODALITIES, assetModalityFilter, setAssetModalityFilter, Layers3)}
        </div>
        <div className="flex-1 overflow-auto px-0 pb-4">
          {visibleAssets.length > 0 ? (
            assetListMode === "grid" ? (
              <div className="grid grid-cols-4 gap-[2px] px-0">
                {visibleAssets.map((asset, index) => (
                  <div
                    key={asset.id}
                    className="group relative overflow-hidden cursor-pointer"
                    data-asset-guide-item={index === 0 ? "true" : undefined}
                    data-subject-drag-source={isGuideDragFolder && index === 0 ? "true" : undefined}
                    data-storyboard-guide-target={index === 0 ? "story-asset-item" : undefined}
                    data-storyboard-video-guide-source={guideStoryboardVideoDrop && asset.type === "video" && index === 0 ? "true" : undefined}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/plain", JSON.stringify({
                        type: "external-asset",
                        src: asset.src,
                        name: asset.name,
                        assetType: asset.type,
                      } as DragExternalAssetPayload));
                      event.dataTransfer.effectAllowed = "copy";
                    }}
                    onMouseMove={(event) => showAssetPreview(asset, event)}
                    onMouseLeave={() => setHoverPreview(null)}
                    style={{ aspectRatio: "1", background: "#1A1510" }}
                  >
                    <button className="h-full w-full" onClick={() => handleAssetClick(asset)}>
                      <img src={asset.src} alt={asset.name} className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
                    </button>
                    {/* Type badge - bottom left */}
                    <div className="pointer-events-none absolute bottom-1 left-1 flex items-center gap-1 rounded px-1 py-0.5 text-[7px]" style={{ background: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.5)" }}>
                      {renderAssetTypeGlyph(asset, 7)}
                      {asset.type === "image" ? "图片" : asset.type === "video" ? "视频" : "音频"}
                    </div>
                    {/* 收藏 - always visible, top right */}
                    <button
                      className="absolute top-1 right-1 z-10 flex items-center justify-center rounded-full"
                      style={{ width: "18px", height: "18px", background: "rgba(0,0,0,0.54)", color: "#FFB21A", border: "1px solid rgba(255,255,255,0.12)" }}
                      onClick={(event) => { event.stopPropagation(); toast.success("已收藏"); }}
                      title="收藏"
                    >
                      <Star size={10} fill="currentColor" />
                    </button>
                    {/* 更多 - top left, hover only */}
                    <div className="absolute top-1 left-1 z-10 invisible group-hover:visible transition-opacity">
                      <div className="relative">
                        <button
                          className="flex items-center justify-center rounded-full"
                          style={{ width: "18px", height: "18px", background: "rgba(0,0,0,0.54)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.12)" }}
                          onClick={(event) => { event.stopPropagation(); setAssetActionMenuId(assetActionMenuId === asset.id ? null : asset.id); }}
                          title="更多"
                        >
                          <MoreHorizontal size={10} />
                        </button>
                        {assetActionMenuId === asset.id && (
                          <div
                            className="absolute left-0 top-full z-40 mt-1 overflow-hidden rounded-lg"
                            style={{ width: "94px", background: "#211A14", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 14px 34px rgba(0,0,0,0.54)" }}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <button
                              className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-[11px] hover:bg-white/6"
                              style={{ color: "rgba(255,255,255,0.72)" }}
                              onClick={() => { setAssetActionMenuId(null); toast.success("开始下载"); }}
                            >
                              <Download size={12} />下载
                            </button>
                            <button
                              className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-[11px] hover:bg-red-900/20"
                              style={{ color: "#ff6b6b" }}
                              onClick={() => { setAssetActionMenuId(null); toast.success("已删除"); }}
                            >
                              <Trash2 size={12} />删除
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-0.5 px-2">
                {visibleAssets.map((asset, index) => (
                  <div
                    key={asset.id}
                    className="group relative flex w-full items-center gap-2 rounded-lg px-2 py-0.5 text-left transition-colors hover:bg-white/6"
                    data-asset-guide-item={index === 0 ? "true" : undefined}
                    data-subject-drag-source={isGuideDragFolder && index === 0 ? "true" : undefined}
                    data-storyboard-video-guide-source={guideStoryboardVideoDrop && asset.type === "video" && index === 0 ? "true" : undefined}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/plain", JSON.stringify({
                        type: "external-asset",
                        src: asset.src,
                        name: asset.name,
                        assetType: asset.type,
                      } as DragExternalAssetPayload));
                      event.dataTransfer.effectAllowed = "copy";
                    }}
                    onMouseMove={(event) => showAssetPreview(asset, event)}
                    onMouseLeave={() => setHoverPreview(null)}
                  >
                    <button className="flex min-w-0 flex-1 items-center gap-2 text-left" onClick={() => handleAssetClick(asset)}>
                    <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-md">
                      <img src={asset.src} alt={asset.name} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[3px]" style={{ background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.7)" }}>
                      {renderAssetTypeGlyph(asset, 9)}
                    </div>
                    <span className="min-w-0 flex-1 truncate text-xs font-medium" style={{ color: "rgba(255,255,255,0.68)" }}>{asset.name}</span>
                    </button>
                    <button
                      className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-white/10"
                      style={{ color: "#FFB21A", background: "rgba(255,255,255,0.06)" }}
                      onClick={(event) => { event.stopPropagation(); toast.success("已收藏"); }}
                      title="收藏"
                    >
                      <Star size={13} fill="currentColor" />
                    </button>
                    <div className="relative">
                      <button
                        className="flex h-6 w-6 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ color: "rgba(255,255,255,0.64)", background: "rgba(255,255,255,0.06)" }}
                        onClick={(event) => { event.stopPropagation(); setAssetActionMenuId(assetActionMenuId === asset.id ? null : asset.id); }}
                        title="更多"
                      >
                        <MoreHorizontal size={13} />
                      </button>
                      {assetActionMenuId === asset.id && (
                        <div
                          className="absolute right-0 top-full z-40 mt-1 overflow-hidden rounded-lg"
                          style={{ width: "94px", background: "#211A14", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 14px 34px rgba(0,0,0,0.54)" }}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-[11px] hover:bg-white/6" style={{ color: "rgba(255,255,255,0.72)" }} onClick={() => { setAssetActionMenuId(null); toast.success("开始下载"); }}>
                            <Download size={12} />下载
                          </button>
                          <button className="flex w-full items-center gap-2 px-2.5 py-2 text-left text-[11px] hover:bg-red-900/20" style={{ color: "#ff6b6b" }} onClick={() => { setAssetActionMenuId(null); toast.success("已删除"); }}>
                            <Trash2 size={12} />删除
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="flex h-24 items-center justify-center rounded-lg" style={{ border: "1px dashed rgba(255,255,255,0.1)" }}>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>暂无内容</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSubjectLibrary = () => (
    <div className="flex h-full flex-col overflow-hidden" style={{ background: "#2B1B12" }}>
      {assetSubTab === "subject" && subjectDetail && (
        <SubjectDetailPanel
          asset={subjectDetail}
          onBack={() => setSubjectDetail(null)}
          onUpdate={handleSubjectUpdate}
          resolveDraggedAsset={findAssetById}
          forceEditing={guideSubjectEditing}
        />
      )}

      <div className="px-3 pt-2.5">
        <div
          className="grid grid-cols-3 gap-1 rounded-[16px] p-1"
          style={{ background: "rgba(30,19,13,0.88)", border: "1px solid rgba(255,255,255,0.17)" }}
        >
          {SUBJECT_LIBRARY_TABS.map((tab) => {
            const active = subjectLibraryKind === tab.key;
            return (
              <button
                key={tab.key}
                className="h-11 rounded-[10px] text-sm font-bold transition-colors"
                style={{
                  background: active ? "rgba(232,115,34,0.24)" : "transparent",
                  border: active ? "1px solid rgba(232,115,34,0.34)" : "1px solid transparent",
                  color: active ? "#FF8F58" : "rgba(255,255,255,0.66)",
                  boxShadow: active ? "inset 0 0 18px rgba(232,115,34,0.08)" : "none",
                }}
                onClick={() => {
                  setSubjectLibraryKind(tab.key);
                  setSubjectDetail(null);
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-3 pt-5">
        <div
          className="flex h-[58px] items-center gap-3 rounded-[9px] px-5"
          style={{ background: "rgba(55,36,25,0.84)", border: "1px solid rgba(255,255,255,0.17)" }}
        >
          <Search size={24} strokeWidth={1.45} style={{ color: "rgba(210,215,222,0.78)" }} />
          <input
            className="min-w-0 flex-1 bg-transparent text-[22px] font-bold outline-none"
            style={{ color: "rgba(230,232,238,0.86)", caretColor: "#E87322" }}
            placeholder="搜索主体"
            value={assetSearch}
            onChange={(event) => setAssetSearch(event.target.value)}
          />
          {assetSearch && (
            <button onClick={() => setAssetSearch("")} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10">
              <X size={16} style={{ color: "rgba(255,255,255,0.46)" }} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-3 pb-5 pt-5">
        {subjectLibraryAssets.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-[22px] gap-y-[22px]">
            {subjectLibraryAssets.map((asset, index) => {
              const hasImage = Boolean(asset.src);
              return (
                <button
                  key={asset.id}
                  className="group relative overflow-hidden rounded-[16px] text-left transition-transform hover:-translate-y-0.5"
                  style={{ aspectRatio: "1.02", background: "#37322E" }}
                  data-subject-guide-item={index === 0 ? "true" : undefined}
                  onClick={() => {
                    handleAssetClick(asset);
                    onSubjectCardClick?.();
                  }}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", JSON.stringify({
                      type: "external-asset",
                      src: asset.src,
                      name: asset.name,
                      assetType: asset.type,
                    } as DragExternalAssetPayload));
                    event.dataTransfer.effectAllowed = "copy";
                  }}
                >
                  {hasImage ? (
                    <img
                      src={asset.src}
                      alt={asset.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-3" style={{ color: "rgba(255,255,255,0.34)" }}>
                      <LucideImage size={32} strokeWidth={1.6} />
                      <span className="text-base font-bold">暂无图片</span>
                    </div>
                  )}

                  <div className="absolute left-3 top-3 flex h-11 w-11 items-center justify-center rounded-[10px]"
                    style={{ background: "rgba(28,28,28,0.54)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.74)" }}>
                    <LucideImage size={22} strokeWidth={1.55} />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-12" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.72) 100%)" }}>
                    <span className="block truncate text-lg font-black leading-none" style={{ color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
                      {asset.displayName || asset.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex h-28 items-center justify-center rounded-xl" style={{ border: "1px dashed rgba(255,255,255,0.16)" }}>
            <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.34)" }}>暂无主体</span>
          </div>
        )}
      </div>
    </div>
  );

  if (!sidebarOpen) {
    return (
      <button
        onClick={onToggleSidebar}
        className="absolute top-2.5 left-1 z-10 w-5 h-5 rounded flex items-center justify-center hover:bg-white/10"
        style={{ color: "rgba(255,255,255,0.35)" }}
        title="展开侧边栏"
      >
        <ChevronLeft size={11} style={{ transform: "rotate(180deg)" }} />
      </button>
    );
  }

  return (
    <>
      {/* Modals (portal-rendered, outside sidebar) */}
      <GenerateAssetModal
        asset={generateModal}
        open={!!generateModal}
        onClose={() => setGenerateModal(null)}
      />
      <UploadAssetModal
        asset={uploadModal}
        open={!!uploadModal}
        onClose={() => setUploadModal(null)}
      />

      <div className="flex flex-col h-full relative" onClick={() => { setShowStatusMenu(false); setShowSourceMenu(false); setShowSharedSubMenu(false); setOpenAssetFilter(null); setAssetActionMenuId(null); }}>
        {hoverPreview && (
          <div
            className="pointer-events-none fixed z-[120] overflow-hidden rounded-2xl"
            style={{
              left: Math.min(hoverPreview.x + 18, window.innerWidth - 300),
              top: Math.min(hoverPreview.y + 18, window.innerHeight - 260),
              width: "260px",
              height: "220px",
              background: "#0D0D0D",
              border: "1px solid rgba(255,255,255,0.16)",
              boxShadow: "0 24px 70px rgba(0,0,0,0.58)",
            }}
          >
            <img src={hoverPreview.src} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 px-3 py-2" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.78) 100%)" }}>
              <span className="block truncate text-xs font-semibold" style={{ color: "rgba(255,255,255,0.84)" }}>{hoverPreview.name}</span>
            </div>
          </div>
        )}
        {/* Collapse toggle */}
        {onToggleSidebar && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSidebar(); }}
            className="absolute top-2.5 -right-5 z-10 w-5 h-5 rounded flex items-center justify-center hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.35)" }}
            title="收起侧边栏"
          >
            <ChevronLeft size={11} />
          </button>
        )}

        {!hideTitle && (
          <div className="flex items-center px-3 py-2 flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>
              {title ?? (assetSubTab === "subject" ? "主体" : "资产")}
            </span>
          </div>
        )}

        {assetSubTab === "subject" && hideSubTabs ? (
          <div className="flex-1 overflow-hidden">
            {renderSubjectLibrary()}
          </div>
        ) : assetSubTab === "generate" && hideSubTabs ? (
          <div className="flex-1 overflow-hidden">
            {assetFolderView ? renderAssetFolderDetail() : renderAssetFolderHome()}
          </div>
        ) : (
        <>
        {/* 资产来源筛选器 - 放在 Tabs 上方 */}
        {!hideSourceFilter && (
        <div className="flex items-center gap-1.5 px-2 py-2 flex-shrink-0 relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => {
              setShowSourceMenu(!showSourceMenu);
              setShowSharedSubMenu(false);
              setShowStatusMenu(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors flex-shrink-0"
            style={{
              background: `${ASSET_SOURCE_CONFIG[assetSourceFilter].color}15`,
              border: `1px solid ${ASSET_SOURCE_CONFIG[assetSourceFilter].color}30`,
              color: ASSET_SOURCE_CONFIG[assetSourceFilter].color,
            }}
          >
            {(() => { const Icon = ASSET_SOURCE_CONFIG[assetSourceFilter].icon; return <Icon size={12} />; })()}
            <span className="font-medium">{ASSET_SOURCE_CONFIG[assetSourceFilter].label}</span>
            {assetSourceFilter === "shared" && (
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>·{SHARED_SUB_CONFIG[sharedSubSource].label}</span>
            )}
            <ChevronDown size={10} style={{ marginLeft: "2px" }} />
          </button>

          {/* 来源下拉菜单 */}
          {showSourceMenu && (
            <div className="absolute left-2 top-full mt-1 rounded-xl overflow-hidden z-30 shadow-2xl"
              style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)", minWidth: "160px" }}>
              {(Object.entries(ASSET_SOURCE_CONFIG) as [AssetSource, typeof ASSET_SOURCE_CONFIG[AssetSource]][]).map(([source, config]) => {
                const selected = assetSourceFilter === source;
                const Icon = config.icon;
                return (
                  <div key={source} className="relative">
                    <button
                      onClick={() => {
                        setAssetSourceFilter(source);
                        if (source !== "shared") {
                          setShowSourceMenu(false);
                          setShowSharedSubMenu(false);
                        } else {
                          setShowSharedSubMenu(true);
                        }
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors"
                      style={{
                        background: selected ? `${config.color}15` : "transparent",
                        color: selected ? config.color : "rgba(255,255,255,0.6)",
                      }}
                    >
                      <Icon size={14} />
                      <span className="flex-1 font-medium">{config.label}</span>
                      {selected && <Check size={12} style={{ color: config.color }} />}
                      {source === "shared" && <ChevronDown size={10} style={{ marginLeft: "auto", transform: showSharedSubMenu ? "rotate(180deg)" : "rotate(0deg)" }} />}
                    </button>

                    {/* 共享资产子选项 */}
                    {source === "shared" && selected && showSharedSubMenu && (
                      <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                        {(config.subOptions ?? []).map((subSource) => {
                          const subSelected = sharedSubSource === subSource;
                          const subConfig = SHARED_SUB_CONFIG[subSource];
                          return (
                            <button
                              key={subSource}
                              onClick={() => {
                                setSharedSubSource(subSource);
                                setShowSourceMenu(false);
                                setShowSharedSubMenu(false);
                              }}
                              className="w-full flex items-center justify-between pl-10 pr-3 py-2 text-xs text-left transition-colors"
                              style={{
                                background: subSelected ? "rgba(74,198,120,0.08)" : "transparent",
                                color: subSelected ? "#4AC678" : "rgba(255,255,255,0.55)",
                              }}
                            >
                              <span>{subConfig.label}</span>
                              {subSelected && <Check size={12} style={{ color: "#4AC678" }} />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        )}

        {/* Tabs - 根据来源显示不同的分类 */}
        {!hideSubTabs && (assetSourceFilter !== "community" ? (
          /* 个人/共享/成员资产：显示原来的 tabs */
          <div className="flex items-center gap-1 px-2 py-1.5 flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {[
              { key: "generate" as const, label: "生成", icon: Sparkles, color: "#E87322" },
              { key: "upload" as const, label: "上传", icon: Upload, color: "#3b82f6" },
              { key: "subject" as const, label: "主体", icon: Package, color: "#4AC678" },
              { key: "collect" as const, label: "收藏", icon: Star, color: "#a78bfa" },
            ].map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => { setAssetSubTab(key); setSubjectDetail(null); }}
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
        ) : (
          /* 社区资产：显示服装/道具/配饰类别 */
          <div className="flex items-center gap-1 px-2 py-1.5 flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            {[
              { key: "clothing" as const, label: "服装", icon: User, color: "#E87322" },
              { key: "prop" as const, label: "道具", icon: Package, color: "#4AC678" },
              { key: "accessory" as const, label: "配饰", icon: Star, color: "#7B3FC4" },
            ].map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => { setAssetSubTab(key as SubTab); setSubjectDetail(null); }}
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
        ))}

        {/* Filter row */}
        <div className="flex items-center gap-1.5 px-2 py-1.5 flex-shrink-0">
          {/* 搜索 */}
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

          {/* Review status filter */}
          <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors"
              style={{
                background: reviewStatusFilter === "all" ? "rgba(255,255,255,0.04)" : REVIEW_STATUS_CONFIG[reviewStatusFilter].bg,
                border: reviewStatusFilter === "all" ? "1px solid rgba(255,255,255,0.07)" : `1px solid ${REVIEW_STATUS_CONFIG[reviewStatusFilter].border}`,
                color: reviewStatusFilter === "all" ? "rgba(255,255,255,0.4)" : REVIEW_STATUS_CONFIG[reviewStatusFilter].color,
              }}
            >
              {reviewStatusFilter === "all"
                ? <Clock3 size={8} />
                : (() => { const Icon = REVIEW_STATUS_CONFIG[reviewStatusFilter].icon; return <Icon size={8} />; })()}
              {reviewStatusFilter === "all" ? "全部状态" : REVIEW_STATUS_CONFIG[reviewStatusFilter].shortLabel}
              <ChevronDown size={6} style={{ marginLeft: "1px" }} />
            </button>
            {showStatusMenu && (
              <div className="absolute left-0 top-full mt-1 rounded-xl overflow-hidden z-30 shadow-2xl"
                style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)", width: "150px" }}>
                <button
                  onClick={() => setReviewStatusFilter("all")}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors"
                  style={{
                    background: reviewStatusFilter === "all" ? "rgba(255,255,255,0.08)" : "transparent",
                    color: reviewStatusFilter === "all" ? "#fff" : "rgba(255,255,255,0.6)",
                  }}
                >
                  <span>全部状态</span>
                  {reviewStatusFilter === "all" && <Check size={10} style={{ color: "#fff" }} />}
                </button>
                <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
                {(Object.entries(REVIEW_STATUS_CONFIG) as [ReviewStatus, typeof REVIEW_STATUS_CONFIG[ReviewStatus]][]).map(([status, config]) => {
                  const selected = reviewStatusFilter === status;
                  const Icon = config.icon;
                  return (
                    <button
                      key={status}
                      onClick={() => setReviewStatusFilter(status)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors"
                      style={{
                        background: selected ? config.bg : "transparent",
                        color: selected ? config.color : "rgba(255,255,255,0.6)",
                      }}
                    >
                      <Icon size={12} />
                      <span className="flex-1">{config.label}</span>
                      {selected && <Check size={10} style={{ color: config.color }} />}
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
            onChange={(e) => setAssetTypeFilter(e.target.value as TypeFilter)}
          >
            <option value="image" style={{ background: "#2A2018" }}>图片</option>
            <option value="video" style={{ background: "#2A2018" }}>视频</option>
            <option value="audio" style={{ background: "#2A2018" }}>音频</option>
          </select>
        </div>

        {/* Asset grid + subject detail overlay */}
        <div className="flex-1 overflow-hidden relative">
          {/* Subject detail inline overlay */}
          {assetSubTab === "subject" && subjectDetail && (
              <SubjectDetailPanel
                asset={subjectDetail}
                onBack={() => setSubjectDetail(null)}
                onUpdate={handleSubjectUpdate}
                resolveDraggedAsset={findAssetById}
                forceEditing={guideSubjectEditing}
              />
          )}

          {/* Grid */}
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
                {filteredAssets.map((asset, index) => {
                  const Icon = ASSET_TYPE_ICONS[asset.type];
                  const subjectAsset = asset as SubjectSidebarAsset;
                  const isSubjectTab = assetSubTab === "subject";
                  const kindConfig = isSubjectTab && subjectAsset.subjectKind ? SUBJECT_KIND_CONFIG[subjectAsset.subjectKind] : null;
                  return (
                    <div
                      key={asset.id}
                      className="relative rounded-md overflow-hidden cursor-pointer group"
                      style={{ aspectRatio: "1", background: "#1A1510" }}
                      data-asset-guide-item={!isSubjectTab && index === 0 ? "true" : undefined}
                      data-subject-guide-item={isSubjectTab && index === 0 ? "true" : undefined}
                      data-storyboard-guide-target={assetSubTab === "generate" && index === 0 ? "story-asset-item" : undefined}
                      onClick={() => handleAssetClick(asset)}
                    >
                      <img
                        src={asset.src}
                        alt={asset.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Type badge — for subject tab show kind instead */}
                      {isSubjectTab && kindConfig ? (
                        <div className="absolute top-1 left-1 px-1 py-0.5 rounded flex items-center gap-1"
                          style={{ background: "rgba(0,0,0,0.62)" }}>
                          <kindConfig.icon size={7} style={{ color: kindConfig.color }} />
                          <span style={{ fontSize: "8px", color: kindConfig.color, lineHeight: 1 }}>{kindConfig.label}</span>
                        </div>
                      ) : (
                        <div className="absolute top-1 left-1 px-1 py-0.5 rounded flex items-center gap-1"
                          style={{ background: "rgba(0,0,0,0.62)" }}>
                          <Icon size={7} style={{ color: "rgba(255,255,255,0.78)" }} />
                          <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.78)", lineHeight: 1 }}>
                            {asset.type === "image" ? "图片" : asset.type === "video" ? "视频" : "音频"}
                          </span>
                        </div>
                      )}
                      {/* Click indicator for generate tab */}
                      {assetSubTab === "generate" && (
                        <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ background: "rgba(232,115,34,0.7)" }}>
                          <ChevronLeft size={8} className="text-white" style={{ transform: "rotate(180deg)" }} />
                        </div>
                      )}
                      {asset.reviewStatus && (
                        <div
                          className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full"
                          style={{
                            background: REVIEW_STATUS_CONFIG[asset.reviewStatus].bg,
                            border: `1px solid ${REVIEW_STATUS_CONFIG[asset.reviewStatus].border}`,
                          }}
                        >
                          <span style={{ fontSize: "8px", color: REVIEW_STATUS_CONFIG[asset.reviewStatus].color, lineHeight: 1 }}>
                            {REVIEW_STATUS_CONFIG[asset.reviewStatus].shortLabel}
                          </span>
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
        </>
        )}
      </div>
    </>
  );
}
