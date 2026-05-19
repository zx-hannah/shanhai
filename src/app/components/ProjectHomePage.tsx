import { useState, useEffect, Fragment, type ReactNode, type CSSProperties, type ComponentType } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ChevronRight, ChevronDown, Check, Plus,
  Users, Film, AlertTriangle, TrendingDown, Coins,
  Clock, Edit2, BarChart2,
  CheckCircle2, Circle, Loader2,
  Info,
  Monitor, Zap, Layers, Video,
  Shield, Eye, Droplets, Trash2, X,
  RefreshCw, FolderOpen, MessageCircle, Search,
  Image as LucideImage,
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, BarChart, Bar,
  Tooltip as ReTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
} from "recharts";
import { getProjectById } from "../data/projectsData";
import { toast } from "sonner";
import { EditProjectMembersDialog, type DialogMember } from "./EditProjectMembersDialog";
import { AllocateMemberTokenDialog } from "./AllocateMemberTokenDialog";

// ─── Types ────────────────────────────────────────────────────────────────────
type ProjectPermission = "管理" | "编辑" | "阅读";
type PeriodKey = "today" | "week" | "month" | "quarter" | "custom";
type QuotaType = "unlimited" | "periodic" | "fixed";

interface MemberWithPerm {
  name: string;
  avatar: string;
  role: string;
  generated: number;
  tokenUsed: number;
  contribution: number;
  permission: ProjectPermission;
  // Image generation
  imageGenerated: number;
  imageTokenUsed: number;
  // Video generation
  videoGenerated: number;
  videoDuration: string; // e.g. "12:30"
  videoTokenUsed: number;
  // Episodes
  episodesGenerated: number;
  // Gacha
  avgGachaRate: number; // percentage
  gachaRate: number; // percentage
}

interface MemberQuota {
  type: QuotaType;
  total: number;
  remaining: number;
  period?: string;
}

const STATUS_OPTIONS = ["进行中", "已完成", "暂停"] as const;
const STATUS_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  进行中: { bg: "rgba(232,115,34,0.15)", text: "#E87322", border: "rgba(232,115,34,0.3)" },
  已完成: { bg: "rgba(74,198,120,0.15)", text: "#4AC678", border: "rgba(74,198,120,0.3)" },
  暂停:   { bg: "rgba(255,255,255,0.07)", text: "rgba(255,255,255,0.45)", border: "rgba(255,255,255,0.1)" },
};
const MEMBER_COLORS = ["#E87322", "#4AC678", "#4A9EE0", "#9B59B6", "#F5A623", "#E74C3C"];
const PERM_COLORS: Record<ProjectPermission, string> = {
  管理: "#E87322", 编辑: "#7B3FC4", 阅读: "#2A6FC4",
};
const PERIOD_LABELS: { key: PeriodKey; label: string }[] = [
  { key: "today", label: "到今天" },
  { key: "week", label: "近7天" },
  { key: "month", label: "近一个月" },
  { key: "quarter", label: "近三个月" },
  { key: "custom", label: "起止时间" },
];

const BASIC_INFO_OPTIONS = {
  aspectRatio: [
    { key: "16:9", label: "16:9（横屏）" },
    { key: "9:16", label: "9:16（竖屏）" },
    { key: "1:1", label: "1:1（方形）" },
    { key: "4:3", label: "4:3（标准）" },
    { key: "21:9", label: "21:9（超宽）" },
  ],
  resolution: [
    { key: "1920×1080", label: "1920×1080（1080p）" },
    { key: "3840×2160", label: "3840×2160（4K）" },
    { key: "1280×720", label: "1280×720（720p）" },
    { key: "2560×1440", label: "2560×1440（2K）" },
    { key: "7680×4320", label: "7680×4320（8K）" },
  ],
  frameRate: [
    { key: "24", label: "24 fps（电影）" },
    { key: "25", label: "25 fps（PAL）" },
    { key: "30", label: "30 fps（标准）" },
    { key: "60", label: "60 fps（高帧率）" },
    { key: "120", label: "120 fps（超高帧率）" },
  ],
} as const;

// ─── Tab Types ────────────────────────────────────────────────────────────────
type ProjectTab = "cost" | "members" | "progress" | "warnings";

const TAB_CONFIG: { key: ProjectTab; label: string; icon: typeof Users }[] = [
  { key: "members", label: "成员管理", icon: Users },
  { key: "cost", label: "项目成本", icon: Coins },
  { key: "progress", label: "项目进度", icon: Film },
  { key: "warnings", label: "生成预警", icon: AlertTriangle },
];


// Stacked trend data per metric — categories are "主体" | "第1集" | "第2集"
const STACKED_TREND_DATA: Record<string, Record<PeriodKey, Array<{ date: string; cat1: number; cat2: number; cat3: number }>>> = {
  img_count: {
    week: [
      { date: "4/10", cat1: 40, cat2: 28, cat3: 17 },
      { date: "4/11", cat1: 55, cat2: 38, cat3: 27 },
      { date: "4/12", cat1: 42, cat2: 30, cat3: 23 },
      { date: "4/13", cat1: 80, cat2: 60, cat3: 40 },
      { date: "4/14", cat1: 65, cat2: 48, cat3: 32 },
      { date: "4/15", cat1: 95, cat2: 70, cat3: 45 },
      { date: "4/16", cat1: 72, cat2: 52, cat3: 36 },
    ],
    month: [
      { date: "3/18", cat1: 36, cat2: 25, cat3: 19 },
      { date: "3/21", cat1: 55, cat2: 38, cat3: 27 },
      { date: "3/24", cat1: 43, cat2: 30, cat3: 22 },
      { date: "3/27", cat1: 80, cat2: 55, cat3: 40 },
      { date: "3/30", cat1: 65, cat2: 47, cat3: 33 },
      { date: "4/2",  cat1: 95, cat2: 68, cat3: 47 },
      { date: "4/5",  cat1: 73, cat2: 52, cat3: 35 },
      { date: "4/8",  cat1: 88, cat2: 62, cat3: 45 },
      { date: "4/11", cat1: 110, cat2: 78, cat3: 52 },
      { date: "4/14", cat1: 84, cat2: 60, cat3: 41 },
      { date: "4/16", cat1: 100, cat2: 72, cat3: 48 },
    ],
    year: [
      { date: "5月",  cat1: 440, cat2: 320, cat3: 220 },
      { date: "6月",  cat1: 540, cat2: 395, cat3: 265 },
      { date: "7月",  cat1: 385, cat2: 278, cat3: 187 },
      { date: "8月",  cat1: 655, cat2: 472, cat3: 323 },
      { date: "9月",  cat1: 495, cat2: 357, cat3: 248 },
      { date: "10月", cat1: 758, cat2: 545, cat3: 377 },
      { date: "11月", cat1: 594, cat2: 428, cat3: 298 },
      { date: "12月", cat1: 833, cat2: 598, cat3: 419 },
      { date: "1月",  cat1: 675, cat2: 487, cat3: 338 },
      { date: "2月",  cat1: 405, cat2: 292, cat3: 203 },
      { date: "3月",  cat1: 788, cat2: 567, cat3: 395 },
      { date: "4月",  cat1: 639, cat2: 462, cat3: 319 },
    ],
    custom: [
      { date: "4/1",  cat1: 54, cat2: 39, cat3: 27 },
      { date: "4/3",  cat1: 38, cat2: 28, cat3: 19 },
      { date: "4/5",  cat1: 86, cat2: 62, cat3: 42 },
      { date: "4/7",  cat1: 65, cat2: 47, cat3: 33 },
      { date: "4/9",  cat1: 95, cat2: 68, cat3: 47 },
      { date: "4/11", cat1: 74, cat2: 54, cat3: 37 },
      { date: "4/13", cat1: 59, cat2: 42, cat3: 29 },
      { date: "4/16", cat1: 83, cat2: 60, cat3: 42 },
    ],
    all: [
      { date: "1月",  cat1: 540, cat2: 389, cat3: 271 },
      { date: "2月",  cat1: 441, cat2: 319, cat3: 220 },
      { date: "3月",  cat1: 743, cat2: 534, cat3: 373 },
      { date: "4月",  cat1: 639, cat2: 461, cat3: 320 },
      { date: "5月",  cat1: 810, cat2: 583, cat3: 407 },
      { date: "6月",  cat1: 945, cat2: 682, cat3: 473 },
      { date: "7月",  cat1: 855, cat2: 617, cat3: 428 },
      { date: "8月",  cat1: 1080, cat2: 778, cat3: 542 },
      { date: "9月",  cat1: 990, cat2: 714, cat3: 496 },
      { date: "10月", cat1: 1193, cat2: 860, cat3: 597 },
      { date: "11月", cat1: 1305, cat2: 941, cat3: 654 },
      { date: "12月", cat1: 1440, cat2: 1038, cat3: 722 },
    ],
  },
  img_tokens: {
    week: [
      { date: "4/10", cat1: 340, cat2: 238, cat3: 147 },
      { date: "4/11", cat1: 480, cat2: 336, cat3: 224 },
      { date: "4/12", cat1: 380, cat2: 266, cat3: 214 },
      { date: "4/13", cat1: 720, cat2: 504, cat3: 396 },
      { date: "4/14", cat1: 580, cat2: 406, cat3: 334 },
      { date: "4/15", cat1: 840, cat2: 588, cat3: 492 },
      { date: "4/16", cat1: 640, cat2: 448, cat3: 352 },
    ],
    month: [
      { date: "3/18", cat1: 320, cat2: 224, cat3: 156 },
      { date: "3/21", cat1: 480, cat2: 336, cat3: 224 },
      { date: "3/24", cat1: 380, cat2: 266, cat3: 174 },
      { date: "3/27", cat1: 700, cat2: 490, cat3: 410 },
      { date: "3/30", cat1: 580, cat2: 406, cat3: 314 },
      { date: "4/2",  cat1: 840, cat2: 588, cat3: 452 },
      { date: "4/5",  cat1: 640, cat2: 448, cat3: 352 },
      { date: "4/8",  cat1: 780, cat2: 546, cat3: 374 },
      { date: "4/11", cat1: 960, cat2: 672, cat3: 508 },
      { date: "4/14", cat1: 740, cat2: 518, cat3: 402 },
      { date: "4/16", cat1: 880, cat2: 616, cat3: 444 },
    ],
    year: [
      { date: "5月",  cat1: 3920, cat2: 2744, cat3: 2116 },
      { date: "6月",  cat1: 4800, cat2: 3360, cat3: 2240 },
      { date: "7月",  cat1: 3400, cat2: 2380, cat3: 1720 },
      { date: "8月",  cat1: 5800, cat2: 4060, cat3: 2940 },
      { date: "9月",  cat1: 4400, cat2: 3080, cat3: 2220 },
      { date: "10月", cat1: 6720, cat2: 4704, cat3: 3476 },
      { date: "11月", cat1: 5280, cat2: 3696, cat3: 2824 },
      { date: "12月", cat1: 7400, cat2: 5180, cat3: 3820 },
      { date: "1月",  cat1: 6000, cat2: 4200, cat3: 3000 },
      { date: "2月",  cat1: 3600, cat2: 2520, cat3: 1780 },
      { date: "3月",  cat1: 7000, cat2: 4900, cat3: 3500 },
      { date: "4月",  cat1: 5680, cat2: 3976, cat3: 2844 },
    ],
    custom: [
      { date: "4/1",  cat1: 480, cat2: 336, cat3: 224 },
      { date: "4/3",  cat1: 340, cat2: 238, cat3: 162 },
      { date: "4/5",  cat1: 760, cat2: 532, cat3: 368 },
      { date: "4/7",  cat1: 580, cat2: 406, cat3: 294 },
      { date: "4/9",  cat1: 840, cat2: 588, cat3: 392 },
      { date: "4/11", cat1: 660, cat2: 462, cat3: 318 },
      { date: "4/13", cat1: 520, cat2: 364, cat3: 256 },
      { date: "4/16", cat1: 740, cat2: 518, cat3: 362 },
    ],
    all: [
      { date: "1月",  cat1: 4800, cat2: 3360, cat3: 2240 },
      { date: "2月",  cat1: 3920, cat2: 2744, cat3: 1836 },
      { date: "3月",  cat1: 6600, cat2: 4620, cat3: 3080 },
      { date: "4月",  cat1: 5680, cat2: 3976, cat3: 2544 },
      { date: "5月",  cat1: 7200, cat2: 5040, cat3: 3360 },
      { date: "6月",  cat1: 8400, cat2: 5880, cat3: 3920 },
      { date: "7月",  cat1: 7600, cat2: 5320, cat3: 3480 },
      { date: "8月",  cat1: 9600, cat2: 6720, cat3: 4480 },
      { date: "9月",  cat1: 8800, cat2: 6160, cat3: 4040 },
      { date: "10月", cat1: 10600, cat2: 7420, cat3: 4980 },
      { date: "11月", cat1: 11600, cat2: 8120, cat3: 5480 },
      { date: "12月", cat1: 12800, cat2: 8960, cat3: 5840 },
    ],
  },
  vid_count: {
    week: [
      { date: "4/10", cat1: 8, cat2: 5, cat3: 3 },
      { date: "4/11", cat1: 12, cat2: 8, cat3: 6 },
      { date: "4/12", cat1: 9, cat2: 6, cat3: 4 },
      { date: "4/13", cat1: 18, cat2: 12, cat3: 9 },
      { date: "4/14", cat1: 14, cat2: 9, cat3: 7 },
      { date: "4/15", cat1: 21, cat2: 14, cat3: 10 },
      { date: "4/16", cat1: 16, cat2: 11, cat3: 7 },
    ],
    month: [
      { date: "3/18", cat1: 8, cat2: 5, cat3: 3 },
      { date: "3/21", cat1: 12, cat2: 8, cat3: 6 },
      { date: "3/24", cat1: 9, cat2: 6, cat3: 4 },
      { date: "3/27", cat1: 17, cat2: 11, cat3: 8 },
      { date: "3/30", cat1: 14, cat2: 9, cat3: 7 },
      { date: "4/2",  cat1: 21, cat2: 14, cat3: 10 },
      { date: "4/5",  cat1: 16, cat2: 10, cat3: 8 },
      { date: "4/8",  cat1: 19, cat2: 13, cat3: 9 },
      { date: "4/11", cat1: 24, cat2: 16, cat3: 12 },
      { date: "4/14", cat1: 18, cat2: 12, cat3: 9 },
      { date: "4/16", cat1: 22, cat2: 15, cat3: 11 },
    ],
    year: [
      { date: "5月",  cat1: 98, cat2: 66, cat3: 46 },
      { date: "6月",  cat1: 120, cat2: 81, cat3: 57 },
      { date: "7月",  cat1: 85, cat2: 58, cat3: 40 },
      { date: "8月",  cat1: 145, cat2: 98, cat3: 68 },
      { date: "9月",  cat1: 110, cat2: 75, cat3: 52 },
      { date: "10月", cat1: 168, cat2: 114, cat3: 79 },
      { date: "11月", cat1: 132, cat2: 90, cat3: 62 },
      { date: "12月", cat1: 185, cat2: 126, cat3: 87 },
      { date: "1月",  cat1: 150, cat2: 102, cat3: 71 },
      { date: "2月",  cat1: 90, cat2: 61, cat3: 43 },
      { date: "3月",  cat1: 175, cat2: 119, cat3: 83 },
      { date: "4月",  cat1: 142, cat2: 97, cat3: 67 },
    ],
    custom: [
      { date: "4/1",  cat1: 12, cat2: 8, cat3: 5 },
      { date: "4/3",  cat1: 9, cat2: 6, cat3: 4 },
      { date: "4/5",  cat1: 19, cat2: 13, cat3: 9 },
      { date: "4/7",  cat1: 14, cat2: 10, cat3: 7 },
      { date: "4/9",  cat1: 21, cat2: 14, cat3: 10 },
      { date: "4/11", cat1: 16, cat2: 11, cat3: 8 },
      { date: "4/13", cat1: 13, cat2: 9, cat3: 6 },
      { date: "4/16", cat1: 18, cat2: 12, cat3: 9 },
    ],
    all: [
      { date: "1月",  cat1: 120, cat2: 82, cat3: 58 },
      { date: "2月",  cat1: 98, cat2: 67, cat3: 47 },
      { date: "3月",  cat1: 165, cat2: 113, cat3: 79 },
      { date: "4月",  cat1: 142, cat2: 97, cat3: 68 },
      { date: "5月",  cat1: 180, cat2: 123, cat3: 87 },
      { date: "6月",  cat1: 210, cat2: 144, cat3: 100 },
      { date: "7月",  cat1: 190, cat2: 130, cat3: 90 },
      { date: "8月",  cat1: 240, cat2: 164, cat3: 116 },
      { date: "9月",  cat1: 220, cat2: 151, cat3: 105 },
      { date: "10月", cat1: 265, cat2: 181, cat3: 127 },
      { date: "11月", cat1: 290, cat2: 198, cat3: 140 },
      { date: "12月", cat1: 320, cat2: 219, cat3: 153 },
    ],
  },
  vid_tokens: {
    week: [
      { date: "4/10", cat1: 380, cat2: 266, cat3: 174 },
      { date: "4/11", cat1: 560, cat2: 392, cat3: 288 },
      { date: "4/12", cat1: 420, cat2: 294, cat3: 226 },
      { date: "4/13", cat1: 840, cat2: 588, cat3: 492 },
      { date: "4/14", cat1: 660, cat2: 462, cat3: 378 },
      { date: "4/15", cat1: 980, cat2: 686, cat3: 574 },
      { date: "4/16", cat1: 740, cat2: 518, cat3: 382 },
    ],
    month: [
      { date: "3/18", cat1: 360, cat2: 252, cat3: 188 },
      { date: "3/21", cat1: 560, cat2: 392, cat3: 288 },
      { date: "3/24", cat1: 420, cat2: 294, cat3: 236 },
      { date: "3/27", cat1: 820, cat2: 574, cat3: 506 },
      { date: "3/30", cat1: 640, cat2: 448, cat3: 352 },
      { date: "4/2",  cat1: 980, cat2: 686, cat3: 574 },
      { date: "4/5",  cat1: 740, cat2: 518, cat3: 422 },
      { date: "4/8",  cat1: 900, cat2: 630, cat3: 470 },
      { date: "4/11", cat1: 1120, cat2: 784, cat3: 616 },
      { date: "4/14", cat1: 860, cat2: 602, cat3: 478 },
      { date: "4/16", cat1: 1020, cat2: 714, cat3: 526 },
    ],
    year: [
      { date: "5月",  cat1: 4560, cat2: 3192, cat3: 2548 },
      { date: "6月",  cat1: 5600, cat2: 3920, cat3: 2880 },
      { date: "7月",  cat1: 3960, cat2: 2772, cat3: 2068 },
      { date: "8月",  cat1: 6760, cat2: 4732, cat3: 3508 },
      { date: "9月",  cat1: 5120, cat2: 3584, cat3: 2696 },
      { date: "10月", cat1: 7840, cat2: 5488, cat3: 4172 },
      { date: "11月", cat1: 6160, cat2: 4312, cat3: 3328 },
      { date: "12月", cat1: 8640, cat2: 6048, cat3: 4612 },
      { date: "1月",  cat1: 7000, cat2: 4900, cat3: 3600 },
      { date: "2月",  cat1: 4200, cat2: 2940, cat3: 2160 },
      { date: "3月",  cat1: 8160, cat2: 5712, cat3: 4228 },
      { date: "4月",  cat1: 6624, cat2: 4637, cat3: 3439 },
    ],
    custom: [
      { date: "4/1",  cat1: 560, cat2: 392, cat3: 288 },
      { date: "4/3",  cat1: 400, cat2: 280, cat3: 200 },
      { date: "4/5",  cat1: 880, cat2: 616, cat3: 424 },
      { date: "4/7",  cat1: 680, cat2: 476, cat3: 344 },
      { date: "4/9",  cat1: 980, cat2: 686, cat3: 434 },
      { date: "4/11", cat1: 760, cat2: 532, cat3: 358 },
      { date: "4/13", cat1: 600, cat2: 420, cat3: 280 },
      { date: "4/16", cat1: 860, cat2: 602, cat3: 418 },
    ],
    all: [
      { date: "1月",  cat1: 5600, cat2: 3920, cat3: 2480 },
      { date: "2月",  cat1: 4560, cat2: 3192, cat3: 2048 },
      { date: "3月",  cat1: 7700, cat2: 5390, cat3: 3410 },
      { date: "4月",  cat1: 6624, cat2: 4637, cat3: 2839 },
      { date: "5月",  cat1: 8400, cat2: 5880, cat3: 3720 },
      { date: "6月",  cat1: 9800, cat2: 6860, cat3: 4340 },
      { date: "7月",  cat1: 8860, cat2: 6202, cat3: 3938 },
      { date: "8月",  cat1: 11200, cat2: 7840, cat3: 4960 },
      { date: "9月",  cat1: 10260, cat2: 7182, cat3: 4558 },
      { date: "10月", cat1: 12380, cat2: 8666, cat3: 5554 },
      { date: "11月", cat1: 13530, cat2: 9471, cat3: 5999 },
      { date: "12月", cat1: 14940, cat2: 10458, cat3: 6602 },
    ],
  },
  vid_duration: {
    week: [
      { date: "4/10", cat1: 42, cat2: 28, cat3: 15 },
      { date: "4/11", cat1: 63, cat2: 42, cat3: 25 },
      { date: "4/12", cat1: 47, cat2: 31, cat3: 17 },
      { date: "4/13", cat1: 94, cat2: 62, cat3: 34 },
      { date: "4/14", cat1: 74, cat2: 49, cat3: 27 },
      { date: "4/15", cat1: 110, cat2: 73, cat3: 42 },
      { date: "4/16", cat1: 83, cat2: 55, cat3: 32 },
    ],
    month: [
      { date: "3/18", cat1: 40, cat2: 27, cat3: 13 },
      { date: "3/21", cat1: 63, cat2: 42, cat3: 25 },
      { date: "3/24", cat1: 47, cat2: 31, cat3: 17 },
      { date: "3/27", cat1: 91, cat2: 60, cat3: 34 },
      { date: "3/30", cat1: 74, cat2: 49, cat3: 27 },
      { date: "4/2",  cat1: 110, cat2: 73, cat3: 42 },
      { date: "4/5",  cat1: 83, cat2: 55, cat3: 32 },
      { date: "4/8",  cat1: 101, cat2: 67, cat3: 37 },
      { date: "4/11", cat1: 124, cat2: 82, cat3: 44 },
      { date: "4/14", cat1: 96, cat2: 64, cat3: 35 },
      { date: "4/16", cat1: 114, cat2: 76, cat3: 40 },
    ],
    year: [
      { date: "5月",  cat1: 510, cat2: 340, cat3: 190 },
      { date: "6月",  cat1: 620, cat2: 413, cat3: 247 },
      { date: "7月",  cat1: 440, cat2: 293, cat3: 167 },
      { date: "8月",  cat1: 750, cat2: 500, cat3: 280 },
      { date: "9月",  cat1: 572, cat2: 381, cat3: 207 },
      { date: "10月", cat1: 873, cat2: 582, cat3: 325 },
      { date: "11月", cat1: 685, cat2: 457, cat3: 258 },
      { date: "12月", cat1: 960, cat2: 640, cat3: 355 },
      { date: "1月",  cat1: 780, cat2: 520, cat3: 290 },
      { date: "2月",  cat1: 468, cat2: 312, cat3: 170 },
      { date: "3月",  cat1: 910, cat2: 607, cat3: 333 },
      { date: "4月",  cat1: 738, cat2: 492, cat3: 270 },
    ],
    custom: [
      { date: "4/1",  cat1: 63, cat2: 42, cat3: 25 },
      { date: "4/3",  cat1: 44, cat2: 29, cat3: 12 },
      { date: "4/5",  cat1: 98, cat2: 65, cat3: 37 },
      { date: "4/7",  cat1: 74, cat2: 50, cat3: 26 },
      { date: "4/9",  cat1: 110, cat2: 73, cat3: 38 },
      { date: "4/11", cat1: 84, cat2: 56, cat3: 30 },
      { date: "4/13", cat1: 67, cat2: 45, cat3: 18 },
      { date: "4/16", cat1: 96, cat2: 64, cat3: 30 },
    ],
    all: [
      { date: "1月",  cat1: 624, cat2: 416, cat3: 220 },
      { date: "2月",  cat1: 508, cat2: 339, cat3: 133 },
      { date: "3月",  cat1: 858, cat2: 572, cat3: 320 },
      { date: "4月",  cat1: 738, cat2: 492, cat3: 270 },
      { date: "5月",  cat1: 936, cat2: 624, cat3: 340 },
      { date: "6月",  cat1: 1092, cat2: 728, cat3: 380 },
      { date: "7月",  cat1: 988, cat2: 659, cat3: 353 },
      { date: "8月",  cat1: 1248, cat2: 832, cat3: 440 },
      { date: "9月",  cat1: 1144, cat2: 763, cat3: 393 },
      { date: "10月", cat1: 1378, cat2: 919, cat3: 453 },
      { date: "11月", cat1: 1508, cat2: 1005, cat3: 487 },
      { date: "12月", cat1: 1664, cat2: 1109, cat3: 527 },
    ],
  },
};

// Rate trend data (line chart only)
const RATE_TREND_DATA: Record<string, Record<PeriodKey, Array<{ date: string; value: number }>>> = {
  gacha_rate: {
    week:   [{ date: "4/10", value: 3.1 }, { date: "4/11", value: 2.9 }, { date: "4/12", value: 3.4 }, { date: "4/13", value: 2.7 }, { date: "4/14", value: 3.2 }, { date: "4/15", value: 3.8 }, { date: "4/16", value: 3.0 }],
    month:  [{ date: "3/18", value: 3.0 }, { date: "3/21", value: 2.8 }, { date: "3/24", value: 3.2 }, { date: "3/27", value: 3.5 }, { date: "3/30", value: 2.9 }, { date: "4/2",  value: 3.4 }, { date: "4/5",  value: 3.1 }, { date: "4/8",  value: 3.6 }, { date: "4/11", value: 2.8 }, { date: "4/14", value: 3.3 }, { date: "4/16", value: 3.0 }],
    year:   [{ date: "5月", value: 3.2 }, { date: "6月", value: 3.0 }, { date: "7月", value: 3.5 }, { date: "8月", value: 2.9 }, { date: "9月", value: 3.4 }, { date: "10月", value: 2.8 }, { date: "11月", value: 3.1 }, { date: "12月", value: 3.3 }, { date: "1月", value: 2.7 }, { date: "2月", value: 3.6 }, { date: "3月", value: 3.0 }, { date: "4月", value: 3.2 }],
    custom: [{ date: "4/1", value: 3.1 }, { date: "4/3", value: 2.9 }, { date: "4/5", value: 3.3 }, { date: "4/7", value: 3.5 }, { date: "4/9", value: 2.8 }, { date: "4/11", value: 3.0 }, { date: "4/13", value: 3.4 }, { date: "4/16", value: 3.2 }],
    all:    [{ date: "1月", value: 3.0 }, { date: "2月", value: 3.2 }, { date: "3月", value: 2.8 }, { date: "4月", value: 3.4 }, { date: "5月", value: 3.1 }, { date: "6月", value: 2.9 }, { date: "7月", value: 3.5 }, { date: "8月", value: 3.0 }, { date: "9月", value: 3.3 }, { date: "10月", value: 2.7 }, { date: "11月", value: 3.6 }, { date: "12月", value: 3.2 }],
  },
  img_gacha_rate: {
    week:   [{ date: "4/10", value: 2.8 }, { date: "4/11", value: 2.6 }, { date: "4/12", value: 3.1 }, { date: "4/13", value: 2.4 }, { date: "4/14", value: 2.9 }, { date: "4/15", value: 3.4 }, { date: "4/16", value: 2.7 }],
    month:  [{ date: "3/18", value: 2.7 }, { date: "3/21", value: 2.5 }, { date: "3/24", value: 2.9 }, { date: "3/27", value: 3.2 }, { date: "3/30", value: 2.6 }, { date: "4/2",  value: 3.1 }, { date: "4/5",  value: 2.8 }, { date: "4/8",  value: 3.3 }, { date: "4/11", value: 2.5 }, { date: "4/14", value: 3.0 }, { date: "4/16", value: 2.7 }],
    year:   [{ date: "5月", value: 2.9 }, { date: "6月", value: 2.7 }, { date: "7月", value: 3.2 }, { date: "8月", value: 2.6 }, { date: "9月", value: 3.1 }, { date: "10月", value: 2.5 }, { date: "11月", value: 2.8 }, { date: "12月", value: 3.0 }, { date: "1月", value: 2.4 }, { date: "2月", value: 3.3 }, { date: "3月", value: 2.7 }, { date: "4月", value: 2.9 }],
    custom: [{ date: "4/1", value: 2.8 }, { date: "4/3", value: 2.6 }, { date: "4/5", value: 3.0 }, { date: "4/7", value: 3.2 }, { date: "4/9", value: 2.5 }, { date: "4/11", value: 2.7 }, { date: "4/13", value: 3.1 }, { date: "4/16", value: 2.9 }],
    all:    [{ date: "1月", value: 2.7 }, { date: "2月", value: 2.9 }, { date: "3月", value: 2.5 }, { date: "4月", value: 3.1 }, { date: "5月", value: 2.8 }, { date: "6月", value: 2.6 }, { date: "7月", value: 3.2 }, { date: "8月", value: 2.7 }, { date: "9月", value: 3.0 }, { date: "10月", value: 2.4 }, { date: "11月", value: 3.3 }, { date: "12月", value: 2.9 }],
  },
  vid_gacha_rate: {
    week:   [{ date: "4/10", value: 3.5 }, { date: "4/11", value: 3.2 }, { date: "4/12", value: 3.8 }, { date: "4/13", value: 3.1 }, { date: "4/14", value: 3.6 }, { date: "4/15", value: 4.2 }, { date: "4/16", value: 3.4 }],
    month:  [{ date: "3/18", value: 3.4 }, { date: "3/21", value: 3.2 }, { date: "3/24", value: 3.6 }, { date: "3/27", value: 3.9 }, { date: "3/30", value: 3.3 }, { date: "4/2",  value: 3.8 }, { date: "4/5",  value: 3.5 }, { date: "4/8",  value: 4.0 }, { date: "4/11", value: 3.2 }, { date: "4/14", value: 3.7 }, { date: "4/16", value: 3.4 }],
    year:   [{ date: "5月", value: 3.6 }, { date: "6月", value: 3.4 }, { date: "7月", value: 3.9 }, { date: "8月", value: 3.3 }, { date: "9月", value: 3.8 }, { date: "10月", value: 3.2 }, { date: "11月", value: 3.5 }, { date: "12月", value: 3.7 }, { date: "1月", value: 3.1 }, { date: "2月", value: 4.1 }, { date: "3月", value: 3.4 }, { date: "4月", value: 3.6 }],
    custom: [{ date: "4/1", value: 3.5 }, { date: "4/3", value: 3.3 }, { date: "4/5", value: 3.7 }, { date: "4/7", value: 3.9 }, { date: "4/9", value: 3.2 }, { date: "4/11", value: 3.4 }, { date: "4/13", value: 3.8 }, { date: "4/16", value: 3.6 }],
    all:    [{ date: "1月", value: 3.4 }, { date: "2月", value: 3.6 }, { date: "3月", value: 3.2 }, { date: "4月", value: 3.8 }, { date: "5月", value: 3.5 }, { date: "6月", value: 3.3 }, { date: "7月", value: 3.9 }, { date: "8月", value: 3.4 }, { date: "9月", value: 3.7 }, { date: "10月", value: 3.1 }, { date: "11月", value: 4.0 }, { date: "12月", value: 3.6 }],
  },
};

const PERIOD_CONSUMED: Record<PeriodKey, number> = {
  today: 240, week: 820, month: 3200, quarter: 7600, custom: 1600,
};
const MEMBER_PERIOD_CONSUMED: Record<PeriodKey, number[]> = {
  today:  [90, 60, 50, 40],
  week:   [320, 220, 180, 100],
  month:  [1280, 860, 720, 340],
  quarter:[2900, 2100, 1700, 900],
  custom: [560, 420, 380, 240],
};

const INITIAL_MEMBER_QUOTAS: MemberQuota[] = [
  { type: "unlimited", total: 0,     remaining: 0 },
  { type: "periodic",  total: 10000, remaining: 6800, period: "月" },
  { type: "fixed",     total: 5000,  remaining: 2100 },
  { type: "unlimited", total: 0,     remaining: 0 },
  { type: "fixed",     total: 3000,  remaining: 1400 },
  { type: "periodic",  total: 8000,  remaining: 4500, period: "月" },
];

// ─── Member Detail Stats (per-member breakdown) ──────────────────────────────
interface MemberDetailStats {
  imageGenerated: number;
  imageTokenUsed: number;
  videoGenerated: number;
  videoDuration: string;
  videoTokenUsed: number;
  episodesGenerated: number;
  avgGachaRate: number;
  gachaRate: number;
}

const MEMBER_DETAIL_STATS: MemberDetailStats[] = [
  { imageGenerated: 320, imageTokenUsed: 2800, videoGenerated: 18, videoDuration: "6分42秒", videoTokenUsed: 2000, episodesGenerated: 5, avgGachaRate: 3.2, gachaRate: 2.8 },
  { imageGenerated: 210, imageTokenUsed: 1900, videoGenerated: 12, videoDuration: "4分18秒", videoTokenUsed: 1600, episodesGenerated: 4, avgGachaRate: 2.8, gachaRate: 2.5 },
  { imageGenerated: 185, imageTokenUsed: 1600, videoGenerated: 10, videoDuration: "3分35秒", videoTokenUsed: 1300, episodesGenerated: 3, avgGachaRate: 3.5, gachaRate: 3.1 },
  { imageGenerated: 90,  imageTokenUsed: 720,  videoGenerated: 6,  videoDuration: "2分10秒", videoTokenUsed: 580,  episodesGenerated: 2, avgGachaRate: 4.1, gachaRate: 3.8 },
];

// ─── Member Transaction Data ──────────────────────────────────────────────────
interface MemberTransaction {
  time: string;
  type: "消费" | "退款";
  description: string;
  amount: number;
  memberName: string;
}

const MEMBER_TRANSACTIONS: MemberTransaction[] = [
  { time: "2026/04/16 14:32", type: "消费", description: "生成角色设计 — 主角组 第45张", amount: -120, memberName: "Alice" },
  { time: "2026/04/16 11:20", type: "消费", description: "生成场景背景 — 山林雾景 第12张", amount: -85, memberName: "Alice" },
  { time: "2026/04/15 16:45", type: "退款", description: "重复生成退款 — 角色设计 第38张", amount: 60, memberName: "Alice" },
  { time: "2026/04/15 09:10", type: "消费", description: "生成分镜画面 — 第三集 分镜7", amount: -95, memberName: "Alice" },
  { time: "2026/04/14 20:30", type: "消费", description: "生成角色设计 — 配角组 第22张", amount: -110, memberName: "Alice" },
  { time: "2026/04/16 13:15", type: "消费", description: "生成场景背景 — 室内场景 第8张", amount: -75, memberName: "Bob" },
  { time: "2026/04/15 18:40", type: "消费", description: "生成角色设计 — 反派组 第15张", amount: -130, memberName: "Bob" },
  { time: "2026/04/15 10:22", type: "退款", description: "质量不达标退款 — 场景背景 第5张", amount: 45, memberName: "Bob" },
  { time: "2026/04/14 15:50", type: "消费", description: "生成分镜画面 — 第二集 分镜3", amount: -88, memberName: "Bob" },
  { time: "2026/04/16 09:30", type: "消费", description: "生成角色设计 — 主角组 第30张", amount: -105, memberName: "Carol" },
  { time: "2026/04/15 14:18", type: "消费", description: "生成特效素材 — 剑气特效 第4张", amount: -140, memberName: "Carol" },
  { time: "2026/04/14 11:05", type: "消费", description: "生成分镜画面 — 第一集 分镜12", amount: -78, memberName: "Carol" },
  { time: "2026/04/16 16:00", type: "消费", description: "生成场景背景 — 夜空星河 第3张", amount: -92, memberName: "Dave" },
  { time: "2026/04/15 21:30", type: "消费", description: "生成角色设计 — 配角组 第18张", amount: -115, memberName: "Dave" },
  { time: "2026/04/14 08:45", type: "退款", description: "系统异常退款 — 批量生成", amount: 200, memberName: "Dave" },
];

// ─── Duplicate Prompts Data ───────────────────────────────────────────────────
const DUPLICATE_PROMPTS = [
  { prompt: "古风女侠，白发飞扬，身着月白色长袍，腰悬宝剑，敦煌壁画风格", count: 8, similarity: 94, person: "Alice", episode: "第一集", shots: ["分镜3", "分镜7", "分镜12"] },
  { prompt: "山林背景，云雾缭绕，仙气飘渺，光线柔和，写实风格", count: 5, similarity: 89, person: "Bob", episode: "第二集", shots: ["分镜2", "分镜5"] },
  { prompt: "剑气特效，光芒四射，蓝紫色能量，动态模糊效果", count: 4, similarity: 86, person: "Carol", episode: "第三集", shots: ["分镜4", "分镜9"] },
  { prompt: "近景人物特写，眼神凌厉，侧脸构图，景深虚化背景", count: 3, similarity: 82, person: "Dave", episode: "第四集", shots: ["分镜1", "分镜6"] },
];

// ─── Category Consumption Data (Multi-metric with drill-down) ─────────────────────
interface CategoryLeaf {
  name: string;
  totalTokens: number;
  imageCount: number;
  imageTokens: number;
  videoCount: number;
  videoDurationSec: number;
  videoTokens: number;
}

interface CategoryFolder {
  type: "folder";
  name: string;
  children: (CategoryFolder | CategoryLeaf)[];
}

type CategoryNode = CategoryFolder | CategoryLeaf;

function sumCat(nodes: CategoryNode[], field: keyof CategoryLeaf | "totalTokens"): number {
  return nodes.reduce((s, n) => s + ("type" in n ? sumCat(n.children, field) : Number((n as CategoryLeaf)[field as keyof CategoryLeaf] ?? 0)), 0);
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}分${String(s).padStart(2, "0")}秒`;
}

function deriveCategoryRates(node: {
  imageCount: number;
  imageTokens: number;
  videoCount: number;
  videoTokens: number;
}) {
  const imageRate = Number((2 + (node.imageTokens / Math.max(node.imageCount, 1)) / 120).toFixed(1));
  const videoRate = Number((2.2 + (node.videoTokens / Math.max(node.videoCount, 1)) / 450).toFixed(1));
  const totalCount = node.imageCount + node.videoCount;
  const totalRate = Number((((imageRate * node.imageCount) + (videoRate * node.videoCount)) / Math.max(totalCount, 1)).toFixed(1));
  return { totalRate, imageRate, videoRate };
}

function scaleStackedSeries(
  series: Record<PeriodKey, Array<{ date: string; cat1: number; cat2: number; cat3: number }>>,
  factor: number,
) {
  return Object.fromEntries(
    Object.entries(series).map(([periodKey, rows]) => [
      periodKey,
      rows.map((row) => ({
        date: row.date,
        cat1: Math.round(row.cat1 * factor),
        cat2: Math.round(row.cat2 * factor),
        cat3: Math.round(row.cat3 * factor),
      })),
    ]),
  ) as Record<PeriodKey, Array<{ date: string; cat1: number; cat2: number; cat3: number }>>;
}

function shiftRateSeries(
  series: Record<PeriodKey, Array<{ date: string; value: number }>>,
  targetAverage: number,
) {
  const baseWeek = series.week ?? [];
  const baseAverage = baseWeek.length > 0
    ? baseWeek.reduce((sum, row) => sum + row.value, 0) / baseWeek.length
    : targetAverage;
  const delta = targetAverage - baseAverage;
  return Object.fromEntries(
    Object.entries(series).map(([periodKey, rows]) => [
      periodKey,
      rows.map((row) => ({
        date: row.date,
        value: Number(Math.max(0.5, row.value + delta).toFixed(1)),
      })),
    ]),
  ) as Record<PeriodKey, Array<{ date: string; value: number }>>;
}

function scaleCategoryNode(node: CategoryNode, factor: number): CategoryNode {
  if ("type" in node) {
    return {
      ...node,
      children: node.children.map((child) => scaleCategoryNode(child, factor)),
    };
  }
  return {
    ...node,
    totalTokens: Math.round(node.totalTokens * factor),
    imageCount: Math.round(node.imageCount * factor),
    imageTokens: Math.round(node.imageTokens * factor),
    videoCount: Math.round(node.videoCount * factor),
    videoDurationSec: Math.round(node.videoDurationSec * factor),
    videoTokens: Math.round(node.videoTokens * factor),
  };
}

// ─── Animated Number (count-up effect) ────────────────────────────────────────────
function AnimatedNumber({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const start = display;
    const end = value;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);
  return <span>{display.toLocaleString()}</span>;
}

// ─── Pulse Indicator (for critical states) ───────────────────────────────────────────
function PulseIndicator({ color = "#E87322", size = 8 }: { color?: string; size?: number }) {
  return (
    <span
      className="inline-block rounded-full"
      style={{
        width: size,
        height: size,
        background: color,
        animation: "pulse 1.5s ease-in-out infinite",
        boxShadow: `0 0 ${size * 2}px ${color}40`,
      }}
    />
  );
}

// ─── Hover Card Wrapper ─────────────────────────────────────────────────────────────
function HoverCard({
  children,
  className = "",
  style = {},
  onClick,
  glowColor = "rgba(232,115,34,0.15)",
}: {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  glowColor?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      className={className}
      style={{
        ...style,
        transition: "all 0.25s ease",
        boxShadow: isHovered ? `0 0 20px ${glowColor}, 0 4px 12px rgba(0,0,0,0.2)` : "none",
        borderColor: isHovered ? "rgba(232,115,34,0.2)" : style.border?.toString() || "rgba(255,255,255,0.06)",
        cursor: onClick ? "pointer" : "default",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

const CATEGORY_CONSUMPTION: CategoryNode[] = [
  { type: "folder", name: "主体", children: [
    { name: "人物", totalTokens: 4800, imageCount: 98, imageTokens: 3200, videoCount: 12, videoDurationSec: 240, videoTokens: 1600 },
    { name: "场景", totalTokens: 3200, imageCount: 72, imageTokens: 2100, videoCount: 8, videoDurationSec: 180, videoTokens: 1100 },
    { name: "道具", totalTokens: 1800, imageCount: 38, imageTokens: 1200, videoCount: 5, videoDurationSec: 90, videoTokens: 600 },
  ] },
  { type: "folder", name: "第一集", children: [
    { name: "分镜1-5", totalTokens: 2800, imageCount: 60, imageTokens: 1800, videoCount: 15, videoDurationSec: 360, videoTokens: 1000 },
    { name: "分镜6-10", totalTokens: 2200, imageCount: 45, imageTokens: 1400, videoCount: 10, videoDurationSec: 240, videoTokens: 800 },
  ] },
  { type: "folder", name: "第二集", children: [
    { name: "静帧", totalTokens: 1500, imageCount: 40, imageTokens: 1200, videoCount: 3, videoDurationSec: 60, videoTokens: 300 },
    { name: "动态", totalTokens: 1800, imageCount: 15, imageTokens: 600, videoCount: 20, videoDurationSec: 480, videoTokens: 1200 },
  ] },
  { name: "未命名", totalTokens: 650, imageCount: 15, imageTokens: 400, videoCount: 3, videoDurationSec: 45, videoTokens: 250 },
];


// ─── Episode progress derivation ──────────────────────────────────────────────
function deriveEpisodeMediaProgress(epProgress: number) {
  const imageProgress = Math.min(100, Math.round(epProgress * 1.25));
  const videoProgress = epProgress <= 20 ? 0 : Math.min(100, Math.round((epProgress - 20) * 1.25));
  return [
    { label: "图片进度", progress: imageProgress, color: "#4A9EE0" },
    { label: "视频进度", progress: videoProgress, color: "#9B59B6" },
  ];
}

// ─── Mini Progress Ring ───────────────────────────────────────────────────────
function MiniRing({ pct, size = 36, stroke = 3, color = "#E87322" }: { pct: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
    </svg>
  );
}

// ─── Stat Tooltip ─────────────────────────────────────────────────────────────
function StatTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}>
      <Info size={11} style={{ color: "rgba(255,255,255,0.25)", cursor: "help" }} />
      {show && (
        <div className="absolute z-30 w-52 px-3 py-2 rounded-lg text-xs"
          style={{
            bottom: "calc(100% + 6px)", left: "50%", transform: "translateX(-50%)",
            background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.7)", lineHeight: 1.6,
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)", whiteSpace: "normal",
          }}>
          {text}
          <div className="absolute border-4 border-transparent"
            style={{ top: "100%", left: "50%", transform: "translateX(-50%)", borderTopColor: "#2A2018" }} />
        </div>
      )}
    </div>
  );
}


// ─── Quota Tag (read-only display) ──────────────────────────────────────────────
function QuotaTag({ qd }: { qd: MemberQuota }) {
  if (qd.type === "unlimited") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(74,198,120,0.1)", color: "#4AC678", border: "1px solid rgba(74,198,120,0.2)", fontSize: "11px" }}>
          无额度限制
        </span>
        <span style={{ color: "#4AC678", fontSize: "14px" }}>∞</span>
      </div>
    );
  }
  const pct = Math.round((qd.remaining / qd.total) * 100);
  const lowBalance = pct < 20;
  return (
    <div className="flex flex-col gap-1 min-w-0" style={{ width: "160px" }}>
      <div className="flex items-center justify-between">
        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: qd.type === "periodic" ? "rgba(74,158,224,0.1)" : "rgba(155,89,182,0.1)", color: qd.type === "periodic" ? "#4A9EE0" : "#9B59B6", fontSize: "10px" }}>
          {qd.type === "periodic" ? `周期/${qd.period}` : "固定"}
        </span>
        <span style={{ fontSize: "11px", color: lowBalance ? "#ff6b6b" : "rgba(255,255,255,0.55)" }}>
          {qd.remaining.toLocaleString()}<span style={{ color: "rgba(255,255,255,0.3)" }}>/{qd.total.toLocaleString()}</span>
        </span>
      </div>
      <div className="w-full rounded-full overflow-hidden" style={{ height: "3px", background: "rgba(255,255,255,0.07)" }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: lowBalance ? "#ff6b6b" : qd.type === "periodic" ? "#4A9EE0" : "#9B59B6" }} />
      </div>
    </div>
  );
}

// ─── Inline Edit Badge (for basic info) ───────────────────────────────────────
function InlineEditBadge({
  label,
  value,
  icon: Icon,
  suffix,
  onSave,
  readOnly,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ size?: number; style?: CSSProperties }>;
  suffix?: string;
  onSave: (v: string) => void;
  readOnly?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  useEffect(() => { setVal(value); }, [value]);

  const handleSave = () => {
    const trimmed = val.trim();
    if (trimmed) { onSave(trimmed); toast.success(`${label}已更新`); }
    else setVal(value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
        style={{ background: "rgba(232,115,34,0.08)", border: "1px solid rgba(232,115,34,0.35)" }}>
        <Icon size={11} style={{ color: "#E87322" }} />
        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>{label}:</span>
        <input
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") { setVal(value); setEditing(false); }
          }}
          className="bg-transparent outline-none text-white"
          style={{ fontSize: "11px", width: "64px", caretColor: "#E87322", borderBottom: "1px solid rgba(232,115,34,0.5)" }}
        />
        {suffix && <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>{suffix}</span>}
      </div>
    );
  }

  return (
    readOnly ? (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
    >
      <Icon size={11} style={{ color: "rgba(255,255,255,0.35)" }} />
      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{label}:</span>
      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)" }}>{value}{suffix ? ` ${suffix}` : ""}</span>
    </div>
    ) : (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all group hover:border-orange-500/30"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
      title={`点击编辑${label}`}
    >
      <Icon size={11} style={{ color: "rgba(255,255,255,0.35)" }} />
      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{label}:</span>
      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)" }}>{value}{suffix ? ` ${suffix}` : ""}</span>
      <Edit2 size={9} className="opacity-0 group-hover:opacity-60 transition-opacity" />
    </button>
    )
  );
}

function InlineSelectBadge({
  label,
  value,
  icon: Icon,
  options,
  suffix,
  onSave,
  readOnly,
}: {
  label: string;
  value: string;
  icon: ComponentType<{ size?: number; style?: CSSProperties }>;
  options: readonly { key: string; label: string }[];
  suffix?: string;
  onSave: (v: string) => void;
  readOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((opt) => opt.key === value);

  useEffect(() => {
    setOpen(false);
  }, [value]);

  if (readOnly) {
    return (
      <div
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
      >
        <Icon size={11} style={{ color: "rgba(255,255,255,0.35)" }} />
        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{label}:</span>
        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)" }}>
          {current?.key ?? value}{suffix ? ` ${suffix}` : ""}
        </span>
      </div>
    );
  }

  return (
    <div className="relative" onBlur={(e) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
    }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all group hover:border-orange-500/30"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
        title={`点击选择${label}`}
      >
        <Icon size={11} style={{ color: "rgba(255,255,255,0.35)" }} />
        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{label}:</span>
        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.75)" }}>
          {current?.key ?? value}{suffix ? ` ${suffix}` : ""}
        </span>
        <ChevronDown size={10} className="opacity-70" />
      </button>
      {open && (
        <div
          className="absolute left-0 top-full mt-1 rounded-xl overflow-hidden z-30 shadow-2xl min-w-[168px]"
          style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          {options.map((opt) => (
            <button
              key={opt.key}
              onClick={() => {
                onSave(opt.key);
                setOpen(false);
                toast.success(`${label}已更新`);
              }}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-left hover:bg-white/5"
              style={{ color: value === opt.key ? "#E87322" : "rgba(255,255,255,0.72)" }}
            >
              <span>{opt.label}</span>
              {value === opt.key && <Check size={12} style={{ color: "#E87322" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Member Quota Editor Modal ─────────────────────────────────────────────────
function MemberQuotaEditorModal({
  member,
  quota,
  memberTokenUsed,
  onClose,
  onSave,
}: {
  member: { name: string; avatar: string; avatarColor: string };
  quota: MemberQuota;
  memberTokenUsed: number;
  onClose: () => void;
  onSave: (q: MemberQuota) => void;
}) {
  const [mode, setMode] = useState<QuotaType>(quota.type);
  const [amount, setAmount] = useState(quota.total > 0 ? String(quota.total) : "10000");
  const [period, setPeriod] = useState(quota.period ?? "月");

  const numAmount = Number(amount.replace(/,/g, "")) || 0;
  const tooLow = mode !== "unlimited" && numAmount < memberTokenUsed;

  const handleSave = () => {
    if (tooLow) return;
    const newQuota: MemberQuota = {
      type: mode,
      total: mode === "unlimited" ? 0 : numAmount,
      remaining: mode === "unlimited" ? 0 : Math.max(0, numAmount - memberTokenUsed),
      period: mode === "periodic" ? period : undefined,
    };
    onSave(newQuota);
    onClose();
    toast.success(`${member.name} 的配额已更新`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose}>
      <div className="rounded-2xl w-80 overflow-hidden shadow-2xl" style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: member.avatarColor, fontSize: "11px", fontWeight: 600, color: "#fff" }}>
              {member.avatar}
            </div>
            <div>
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{member.name}</div>
              <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>编辑配额分配模式</div>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-4">
          {/* Mode Selection */}
          <div className="mb-4">
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>分配模式</div>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { key: "unlimited", label: "无限制", color: "#4AC678" },
                { key: "periodic",  label: "周期额度", color: "#4A9EE0" },
                { key: "fixed",     label: "固定额度", color: "#9B59B6" },
              ] as const).map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => setMode(key)}
                  className="py-2 rounded-lg text-xs transition-all"
                  style={{
                    background: mode === key ? `${color}20` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${mode === key ? `${color}50` : "rgba(255,255,255,0.07)"}`,
                    color: mode === key ? color : "rgba(255,255,255,0.45)",
                    fontWeight: mode === key ? 600 : 400,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount input (if not unlimited) */}
          {mode !== "unlimited" && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                  {mode === "periodic" ? "每期额度（颗）" : "固定总额（颗）"}
                </span>
                {mode === "periodic" && (
                  <div className="flex gap-1">
                    {["日", "周", "月"].map((p) => (
                      <button key={p} onClick={() => setPeriod(p)}
                        className="px-2 py-0.5 rounded text-xs"
                        style={{
                          background: period === p ? "rgba(74,158,224,0.2)" : "rgba(255,255,255,0.04)",
                          color: period === p ? "#4A9EE0" : "rgba(255,255,255,0.35)",
                          border: `1px solid ${period === p ? "rgba(74,158,224,0.3)" : "rgba(255,255,255,0.06)"}`,
                          fontSize: "10px",
                        }}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 rounded-lg outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${tooLow ? "rgba(255,100,100,0.4)" : "rgba(255,255,255,0.1)"}`,
                  color: "rgba(255,255,255,0.85)",
                  fontSize: "14px",
                }}
                placeholder="输入额度数量"
              />

              {/* Visual constraint */}
              <div className="mt-3 rounded-lg p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>当前额度</span>
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>
                    已消耗 {memberTokenUsed.toLocaleString()} 颗
                  </span>
                </div>
                {/* Bar */}
                <div className="relative w-full rounded-full overflow-hidden" style={{ height: "8px", background: "rgba(255,255,255,0.06)" }}>
                  {/* New quota fill background */}
                  {numAmount > 0 && (
                    <div className="absolute left-0 top-0 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (numAmount / Math.max(numAmount, memberTokenUsed, 1)) * 100)}%`,
                        background: tooLow ? "rgba(255,100,100,0.15)" : "rgba(232,115,34,0.15)",
                        transition: "width 0.3s",
                      }} />
                  )}
                  {/* Consumed fill */}
                  <div className="absolute left-0 top-0 h-full rounded-full"
                    style={{
                      width: `${numAmount > 0 ? Math.min(100, (memberTokenUsed / Math.max(numAmount, memberTokenUsed, 1)) * 100) : 0}%`,
                      background: tooLow ? "linear-gradient(90deg,#ff6b6b,#ff9b9b)" : "linear-gradient(90deg,#E87322,#F5A623)",
                      transition: "width 0.3s",
                    }} />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span style={{ fontSize: "9px", color: tooLow ? "#ff6b6b" : "rgba(255,255,255,0.3)" }}>
                    已消耗 {memberTokenUsed.toLocaleString()}
                  </span>
                  {numAmount > 0 && (
                    <span style={{ fontSize: "9px", color: tooLow ? "#ff6b6b" : "rgba(255,255,255,0.3)" }}>
                      设定 {numAmount.toLocaleString()}
                    </span>
                  )}
                </div>
                {tooLow && (
                  <div className="flex items-center gap-1.5 mt-2 px-2 py-1.5 rounded-lg" style={{ background: "rgba(255,100,100,0.1)", border: "1px solid rgba(255,100,100,0.2)" }}>
                    <AlertTriangle size={11} style={{ color: "#ff6b6b", flexShrink: 0 }} />
                    <span style={{ fontSize: "10px", color: "#ff9b9b", lineHeight: 1.4 }}>
                      配额不能小于已消耗的 <strong>{memberTokenUsed.toLocaleString()}</strong> 颗
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {mode === "unlimited" && (
            <div className="mb-4 px-3 py-2.5 rounded-lg flex items-center gap-2" style={{ background: "rgba(74,198,120,0.06)", border: "1px solid rgba(74,198,120,0.15)" }}>
              <span style={{ fontSize: "18px", color: "#4AC678" }}>∞</span>
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>成员将不受生产栗配额限制</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm hover:opacity-80 transition-opacity"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={tooLow}
              className="flex-1 py-2 rounded-lg text-sm transition-all"
              style={{
                background: tooLow ? "rgba(255,100,100,0.1)" : "rgba(232,115,34,0.85)",
                border: `1px solid ${tooLow ? "rgba(255,100,100,0.2)" : "rgba(232,115,34,0.4)"}`,
                color: tooLow ? "#ff6b6b" : "#fff",
                cursor: tooLow ? "not-allowed" : "pointer",
                fontWeight: 500,
              }}>
              {tooLow ? "不可保存" : "保存配额"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Remove Member Confirm ─────────────────────────────────────────────────────
function RemoveMemberConfirm({
  member,
  onClose,
  onConfirm,
}: {
  member: { name: string; avatar: string; avatarColor: string; role: string };
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.65)" }} onClick={onClose}>
      <div className="rounded-2xl w-80 overflow-hidden shadow-2xl" style={{ background: "#1E1A14", border: "1px solid rgba(255,100,100,0.2)" }} onClick={(e) => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: member.avatarColor, fontSize: "12px", fontWeight: 600, color: "#fff" }}>
              {member.avatar}
            </div>
            <div>
              <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>移除 {member.name}？</div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>{member.role}</div>
            </div>
          </div>

          <div className="rounded-xl p-3.5 mb-4" style={{ background: "rgba(255,100,100,0.06)", border: "1px solid rgba(255,100,100,0.15)" }}>
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(255,100,100,0.15)" }}>
                  <span style={{ fontSize: "9px", color: "#ff6b6b" }}>!</span>
                </div>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
                  <strong style={{ color: "rgba(255,255,255,0.75)" }}>资产归属</strong>：{member.name} 名下所有资产将归当前操作人所有。
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(74,198,120,0.15)" }}>
                  <span style={{ fontSize: "9px", color: "#4AC678" }}>↑</span>
                </div>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
                  <strong style={{ color: "rgba(255,255,255,0.75)" }}>配额释放</strong>：剩余生产栗配额将自动释放回项目预算池。
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm hover:opacity-80 transition-opacity"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
              取消
            </button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className="flex-1 py-2 rounded-lg text-sm transition-all hover:opacity-90"
              style={{ background: "rgba(255,80,80,0.15)", border: "1px solid rgba(255,80,80,0.3)", color: "#ff6b6b", fontWeight: 500 }}>
              确认移除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Member Quota Editor Modal ────────────────────────────────────────────────
function MemberQuotaEditor({
  member,
  currentQuota,
  currentConsumed,
  onSave,
  onCancel,
}: {
  member: { name: string; avatar: string; avatarColor: string; role: string };
  currentQuota: MemberQuota;
  currentConsumed: number;
  onSave: (q: MemberQuota) => void;
  onCancel: () => void;
}) {
  const [mode, setMode] = useState<QuotaType>(currentQuota.type === "unlimited" ? "unlimited" : "fixed");
  const [val, setVal] = useState(String(currentQuota.type === "fixed" ? currentQuota.total : 0));
  const numVal = Number(val.replace(/,/g, "")) || 0;
  const tooLow = mode === "fixed" && numVal < currentConsumed;
  const pct = mode === "fixed" && numVal > 0 ? Math.min(100, (currentConsumed / numVal) * 100) : 100;

  const handleSave = () => {
    if (mode === "unlimited") {
      onSave({ type: "unlimited", total: 0, remaining: 0 });
    } else if (!tooLow) {
      onSave({ type: "fixed", total: numVal, remaining: Math.max(0, numVal - currentConsumed) });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.65)" }} onClick={onCancel}>
      <div className="rounded-2xl w-96 overflow-hidden shadow-2xl" style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>编辑额度</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>{member.name} · {member.role}</div>
          </div>
          <button onClick={onCancel} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-4">
          {/* Mode selector */}
          <div className="flex gap-2 mb-4">
            <button onClick={() => setMode("unlimited")}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: mode === "unlimited" ? "rgba(74,198,120,0.12)" : "rgba(255,255,255,0.03)",
                border: `1.5px solid ${mode === "unlimited" ? "rgba(74,198,120,0.3)" : "rgba(255,255,255,0.06)"}`,
                color: mode === "unlimited" ? "#4AC678" : "rgba(255,255,255,0.45)",
              }}>
              无限制
            </button>
            <button onClick={() => setMode("fixed")}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: mode === "fixed" ? "rgba(155,89,182,0.12)" : "rgba(255,255,255,0.03)",
                border: `1.5px solid ${mode === "fixed" ? "rgba(155,89,182,0.3)" : "rgba(255,255,255,0.06)"}`,
                color: mode === "fixed" ? "#9B59B6" : "rgba(255,255,255,0.45)",
              }}>
              固定额度
            </button>
          </div>

          {mode === "fixed" && (
            <>
              <div className="flex items-center gap-2 mb-4">
                <input
                  autoFocus
                  type="number"
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !tooLow) handleSave(); if (e.key === "Escape") onCancel(); }}
                  className="flex-1 px-3 py-2 rounded-lg outline-none"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${tooLow ? "rgba(255,100,100,0.4)" : "rgba(155,89,182,0.35)"}`,
                    color: "rgba(255,255,255,0.85)",
                    fontSize: "14px",
                    caretColor: "#9B59B6",
                  }}
                  placeholder="输入额度"
                />
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>颗</span>
              </div>

              {/* Visual bar */}
              <div className="rounded-lg p-3 mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>额度使用</span>
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>
                    已消耗 {currentConsumed.toLocaleString()} 颗
                  </span>
                </div>
                <div className="w-full rounded-full overflow-hidden" style={{ height: "5px", background: "rgba(255,255,255,0.07)" }}>
                  <div className="h-full rounded-full transition-all" style={{
                    width: `${pct}%`,
                    background: pct > 90 ? "#ff6b6b" : "#9B59B6",
                  }} />
                </div>
              </div>

              {tooLow && (
                <div className="rounded-lg px-3 py-2 mb-3" style={{ background: "rgba(255,100,100,0.06)", border: "1px solid rgba(255,100,100,0.15)" }}>
                  <span style={{ fontSize: "10px", color: "#ff6b6b" }}>额度不能低于已消耗量</span>
                </div>
              )}
            </>
          )}

          {mode === "unlimited" && (
            <div className="rounded-lg p-4 mb-4" style={{ background: "rgba(74,198,120,0.06)", border: "1px solid rgba(74,198,120,0.15)" }}>
              <div className="flex items-center justify-between">
                <div>
                  <span style={{ fontSize: "12px", color: "#4AC678", fontWeight: 500 }}>无额度限制</span>
                  <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)", marginTop: "2px" }}>不限制该成员的生产栗使用</div>
                </div>
                <span style={{ fontSize: "18px", color: "#4AC678" }}>∞</span>
              </div>
              <div className="w-full rounded-full overflow-hidden mt-3" style={{ height: "5px", background: "rgba(74,198,120,0.15)" }}>
                <div className="h-full rounded-full" style={{ width: "100%", background: "#4AC678" }} />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={onCancel} className="flex-1 py-2 rounded-lg text-sm hover:opacity-80 transition-opacity"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
              取消
            </button>
            <button onClick={handleSave} disabled={tooLow}
              className="flex-1 py-2 rounded-lg text-sm transition-all hover:opacity-90 disabled:opacity-30"
              style={{
                background: "rgba(232,115,34,0.15)",
                border: "1px solid rgba(232,115,34,0.3)",
                color: "#E87322",
                fontWeight: 500,
              }}>
              确认
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Inline Total Quota Editor (inside card) ───────────────────────────────────
function InlineTotalQuotaEditor({
  currentConsumed,
  currentTotal,
  onSave,
  onCancel,
}: {
  currentConsumed: number;
  currentTotal: number;
  onSave: (v: number) => void;
  onCancel: () => void;
}) {
  const [val, setVal] = useState(String(currentTotal));
  const numVal = Number(val.replace(/,/g, "")) || 0;
  const tooLow = numVal < currentConsumed;
  const pctConsumed = numVal > 0 ? Math.min(100, (currentConsumed / Math.max(numVal, currentConsumed)) * 100) : 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onCancel}>
      <div className="rounded-2xl w-96 overflow-hidden shadow-2xl" style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>修改项目总配额</div>
            <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>当前总配额 {currentTotal.toLocaleString()} 颗</div>
          </div>
          <button onClick={onCancel} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-center gap-2 mb-4">
            <input
              autoFocus
              type="number"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !tooLow) { onSave(numVal); toast.success("项目总配额已更新"); }
                if (e.key === "Escape") onCancel();
              }}
              className="flex-1 px-3 py-2 rounded-lg outline-none"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${tooLow ? "rgba(255,100,100,0.4)" : "rgba(232,115,34,0.35)"}`,
                color: "rgba(255,255,255,0.85)",
                fontSize: "14px",
                caretColor: "#E87322",
              }}
              placeholder="输入总配额"
            />
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>颗</span>
          </div>

          {/* Visual bar */}
          <div className="rounded-lg p-3 mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="flex items-center justify-between mb-1.5">
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>配额约束</span>
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>
                已消耗 {currentConsumed.toLocaleString()} 颗（最低限额）
              </span>
            </div>
            <div className="relative w-full rounded-full overflow-hidden" style={{ height: "8px", background: "rgba(255,255,255,0.06)" }}>
              {numVal > 0 && (
                <div className="absolute left-0 top-0 h-full rounded-full"
                  style={{
                    width: `${Math.min(100, (numVal / Math.max(numVal, currentConsumed)) * 100)}%`,
                    background: tooLow ? "rgba(255,100,100,0.12)" : "rgba(232,115,34,0.12)",
                    transition: "width 0.25s",
                  }} />
              )}
              <div className="absolute left-0 top-0 h-full rounded-full"
                style={{
                  width: `${pctConsumed}%`,
                  background: tooLow ? "linear-gradient(90deg,#ff6b6b,#ff9b9b)" : "linear-gradient(90deg,#E87322,#F5A623)",
                  transition: "width 0.25s",
                }} />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span style={{ fontSize: "9px", color: tooLow ? "#ff6b6b" : "rgba(255,255,255,0.25)" }}>
                已消耗 {currentConsumed.toLocaleString()}
              </span>
              {numVal > 0 && (
                <span style={{ fontSize: "9px", color: tooLow ? "#ff6b6b" : "rgba(255,255,255,0.25)" }}>
                  → 新总额 {numVal.toLocaleString()}
                </span>
              )}
            </div>
            {tooLow && (
              <div className="flex items-center gap-1.5 mt-2 px-2.5 py-2 rounded-lg" style={{ background: "rgba(255,100,100,0.1)", border: "1px solid rgba(255,100,100,0.2)" }}>
                <AlertTriangle size={11} style={{ color: "#ff6b6b", flexShrink: 0 }} />
                <span style={{ fontSize: "10px", color: "#ff9b9b", lineHeight: 1.5 }}>
                  配额不能小于已消耗的 <strong>{currentConsumed.toLocaleString()}</strong> 颗，请输入更大的数值
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={onCancel} className="flex-1 py-2 rounded-lg text-sm hover:opacity-80 transition-opacity"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
              取消
            </button>
            <button
              onClick={() => { if (!tooLow) { onSave(numVal); toast.success("项目总配额已更新"); } }}
              disabled={tooLow}
              className="flex-1 py-2 rounded-lg text-sm transition-all"
              style={{
                background: tooLow ? "rgba(255,100,100,0.1)" : "rgba(232,115,34,0.85)",
                border: `1px solid ${tooLow ? "rgba(255,100,100,0.2)" : "rgba(232,115,34,0.4)"}`,
                color: tooLow ? "#ff6b6b" : "#fff",
                cursor: tooLow ? "not-allowed" : "pointer",
                fontWeight: 500,
              }}>
              {tooLow ? "不可保存" : "保存配额"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helper Components for Member Table ──────────────────────────────────────────
function MetricHeader({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <div className="relative group/header cursor-help flex items-center justify-end gap-1" style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>
      <span>{label}</span>
      <Info size={10} style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0 }} />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover/header:opacity-100 transition-opacity z-10"
        style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", boxShadow: "0 4px 12px rgba(0,0,0,0.4)", fontSize: "10px" }}>
        {tooltip}
      </div>
    </div>
  );
}

function MetricCell({ value, tooltip, subValue, subTooltip, progressPct, progressColor }: {
  value: string;
  tooltip: string;
  subValue?: string;
  subTooltip?: string;
  progressPct?: number;
  progressColor?: string;
}) {
  return (
    <div className="relative group/metric flex flex-col items-center gap-0.5 cursor-help">
      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{value}</span>
      {progressPct !== undefined && progressColor && (
        <div className="w-full rounded-full overflow-hidden" style={{ height: "3px", background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full" style={{ width: `${Math.min(100, progressPct)}%`, background: progressColor, transition: "width 0.3s" }} />
        </div>
      )}
      {subValue && <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{subValue}</span>}
      {/* Hover tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover/metric:opacity-100 transition-opacity z-10"
        style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", boxShadow: "0 4px 12px rgba(0,0,0,0.4)", fontSize: "10px" }}>
        {tooltip}
        {subTooltip && <><br />{subTooltip}</>}
      </div>
    </div>
  );
}

function FilterDropdown({ label, options, selected, onChange }: {
  label: string;
  options: string[];
  selected: Set<string>;
  onChange: (s: Set<string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const count = selected.size;
  const toggle = (name: string) => {
    const next = new Set(selected);
    if (next.has(name)) next.delete(name); else next.add(name);
    onChange(next);
  };
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all"
        style={{
          background: count > 0 ? "rgba(232,115,34,0.12)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${count > 0 ? "rgba(232,115,34,0.25)" : "rgba(255,255,255,0.08)"}`,
          color: count > 0 ? "#E87322" : "rgba(255,255,255,0.45)",
          fontSize: "10px",
        }}>
        {label}{count > 0 ? ` (${count})` : ""}
        <ChevronDown size={8} style={{ marginLeft: "1px", opacity: 0.5 }} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 rounded-xl overflow-hidden z-20 shadow-2xl min-w-[140px]"
          style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>{label}</span>
            {count > 0 && (
              <button onClick={() => onChange(new Set())} style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>清空</button>
            )}
          </div>
          {options.map(name => (
            <button key={name} onClick={() => toggle(name)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left hover:bg-white/5 transition-colors"
              style={{ color: "rgba(255,255,255,0.65)" }}>
              <div className="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0"
                style={{ border: `1.5px solid ${selected.has(name) ? "#E87322" : "rgba(255,255,255,0.2)"}`, background: selected.has(name) ? "rgba(232,115,34,0.2)" : "transparent" }}>
                {selected.has(name) && <Check size={8} style={{ color: "#E87322" }} />}
              </div>
              <span style={{ fontSize: "11px" }}>{name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PermFilterDropdown({ value, onChange }: {
  value: ProjectPermission | "all";
  onChange: (v: ProjectPermission | "all") => void;
}) {
  const [open, setOpen] = useState(false);
  const label = value === "all" ? "全部权限" : value;
  const options: (ProjectPermission | "all")[] = ["all", "管理", "编辑", "阅读"];
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all"
        style={{
          background: value !== "all" ? "rgba(74,158,224,0.12)" : "rgba(255,255,255,0.04)",
          border: `1px solid ${value !== "all" ? "rgba(74,158,224,0.25)" : "rgba(255,255,255,0.08)"}`,
          color: value !== "all" ? "#4A9EE0" : "rgba(255,255,255,0.45)",
          fontSize: "10px",
        }}>
        {label}
        <ChevronDown size={8} style={{ marginLeft: "1px", opacity: 0.5 }} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 rounded-xl overflow-hidden z-20 shadow-2xl min-w-[120px]"
          style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)" }}>
          {options.map(opt => (
            <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-left hover:bg-white/5 transition-colors"
              style={{ color: value === opt ? "#4A9EE0" : "rgba(255,255,255,0.65)" }}>
              <span style={{ fontSize: "11px" }}>{opt === "all" ? "全部权限" : opt}</span>
              {value === opt && <Check size={10} style={{ color: "#4A9EE0" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DownloadIcon(props: { size?: number }) {
  return (
    <svg width={props.size || 10} height={props.size || 10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ProjectHomePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const project = getProjectById(id ?? "");

  const [projectName, setProjectName] = useState(project?.name ?? "");
  const [editingName, setEditingName] = useState(false);
  const [status, setStatus] = useState(project?.status ?? "进行中");
  const [showStatusDrop, setShowStatusDrop] = useState(false);
  const [period, setPeriod] = useState<PeriodKey>("custom");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showAllocateDialog, setShowAllocateDialog] = useState(false);

  // Basic info inline state
  const [basicInfo, setBasicInfo] = useState({
    aspectRatio: "16:9",
    resolution: "1920×1080",
    frameRate: "24",
  });

  // Total quota for the project (used in consumption section)
  const [localTokenTotal, setLocalTokenTotal] = useState(project?.tokenTotal ?? 50000);
  const [editingTotalQuota, setEditingTotalQuota] = useState(false);
  const [showProjectStats, setShowProjectStats] = useState(true);

  // Watermark state
  const [watermarkEnabled, setWatermarkEnabled] = useState(false);

  // Member state
  const [memberPermissions, setMemberPermissions] = useState<Record<number, ProjectPermission>>({});
    const [quotaEditorIndex, setQuotaEditorIndex] = useState<number | null>(null);
  const [editQuotaIndex, setEditQuotaIndex] = useState<number | null>(null); // member quota editor
  const [removeConfirmIndex, setRemoveConfirmIndex] = useState<number | null>(null);
  const [removedMembers, setRemovedMembers] = useState<Set<number>>(new Set());
  const [memberQuotas, setMemberQuotas] = useState<MemberQuota[]>(INITIAL_MEMBER_QUOTAS);
  const [openPermDropdown, setOpenPermDropdown] = useState<number | null>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<ProjectTab>("cost");
  const [selectedMetric, setSelectedMetric] = useState<string>("img_count");

  // Episode progress collapse state
  const [expandedEpisodes, setExpandedEpisodes] = useState<Set<number>>(new Set());

  // Category drill-down expand state
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Transaction detail inline expand
  const [expandedDetailMember, setExpandedDetailMember] = useState<string | null>(null);

  // Filter states
  const [filterMembers, setFilterMembers] = useState<Set<string>>(new Set());
  const [filterPerm, setFilterPerm] = useState<ProjectPermission | "all">("all");
  
  if (!project) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: "rgba(255,255,255,0.4)" }}>项目不存在</div>
    );
  }

  const projectPerm = project.permission;
  const isManager = projectPerm === "管理";
  const isEditor = projectPerm === "编辑";

  const membersWithPerm: MemberWithPerm[] = project.members.map((m, i) => {
    const detail = MEMBER_DETAIL_STATS[i] ?? MEMBER_DETAIL_STATS[0];
    return {
      ...m,
      permission: (memberPermissions[i] ?? (["管理", "编辑", "编辑", "阅读"] as ProjectPermission[])[i]) ?? "编辑",
      ...detail,
    };
  });

  // Filter out removed members (keep original index for key)
  const activeMembersIndexed = membersWithPerm
    .map((m, i) => ({ m, i }))
    .filter(({ i }) => !removedMembers.has(i));

  const activeMembers = activeMembersIndexed.map(({ m }) => m);
  const currentMemberEntry = activeMembersIndexed[0] ?? { m: membersWithPerm[0], i: 0 };
  const currentMember = currentMemberEntry.m;
  const currentMemberIndex = currentMemberEntry.i;

  const permCounts = {
    管理: activeMembers.filter(m => m.permission === "管理").length,
    编辑: activeMembers.filter(m => m.permission === "编辑").length,
    阅读: activeMembers.filter(m => m.permission === "阅读").length,
  };

  // Stats data for project statistics (no filtering)
  const statsMembers = isEditor ? [currentMember] : membersWithPerm;

  const imageGenerated = statsMembers.reduce((s, m) => s + m.imageGenerated, 0);
  const videoGenerated = statsMembers.reduce((s, m) => s + m.videoGenerated, 0);
  const imageTokenUsed = statsMembers.reduce((s, m) => s + m.imageTokenUsed, 0);
  const videoTokenUsed = statsMembers.reduce((s, m) => s + m.videoTokenUsed, 0);
  const totalGenerated = imageGenerated + videoGenerated;
  const totalTokenUsed = imageTokenUsed + videoTokenUsed;
  const videoDurationSec = statsMembers.reduce((s, m) => {
    const parts = m.videoDuration.match(/(\d+)分(\d+)秒/);
    return s + (parts ? parseInt(parts[1]) * 60 + parseInt(parts[2]) : 0);
  }, 0);

  // Calculate gacha rates
  const imgRates = statsMembers.map(m => m.gachaRate).filter(Boolean);
  const vidRates = statsMembers.map(m => m.avgGachaRate).filter(Boolean);
  const imgGachaAvg = imgRates.length > 0 ? (imgRates.reduce((a, b) => a + b, 0) / imgRates.length).toFixed(1) : "-";
  const vidGachaAvg = vidRates.length > 0 ? (vidRates.reduce((a, b) => a + b, 0) / vidRates.length).toFixed(1) : "-";
  const allRates = [...imgRates, ...vidRates];
  const totalGachaAvg = allRates.length > 0 ? (allRates.reduce((a, b) => a + b, 0) / allRates.length).toFixed(1) : "-";

  const memberPeriodConsumed: number[] = MEMBER_PERIOD_CONSUMED[period] ?? [];
  const currentMemberQuota = memberQuotas[currentMemberIndex] ?? memberQuotas[0];
  const currentMemberConsumed = memberPeriodConsumed[currentMemberIndex] ?? currentMember.tokenUsed;
  const editorQuotaTotal = currentMemberQuota.type === "unlimited" ? currentMemberConsumed : currentMemberQuota.total;
  const editorQuotaPercent = editorQuotaTotal > 0 ? Math.round((currentMemberConsumed / editorQuotaTotal) * 100) : 0;
  const displayedQuotaTotal = isEditor ? editorQuotaTotal : localTokenTotal;
  const displayedTokenUsed = isEditor ? currentMemberConsumed : project.tokenUsed;
  const tokenPercent = displayedQuotaTotal > 0 ? Math.round((displayedTokenUsed / displayedQuotaTotal) * 100) : 0;
  const projectBalance = localTokenTotal - project.tokenUsed;
  const memberTotalBalance = Math.round(localTokenTotal * 0.12);
  const periodConsumed = PERIOD_CONSUMED[period] ?? 0;
  const contentProgress = project.progress;
  const statusStyle = STATUS_STYLE[status] ?? STATUS_STYLE["暂停"];
  const editorConsumptionFactor = totalTokenUsed > 0 ? currentMember.tokenUsed / totalTokenUsed : 0.25;
  const visibleTabs = TAB_CONFIG.filter((tab) => {
    if (isManager) return true;
    return tab.key === "cost" || tab.key === "progress";
  });

  useEffect(() => {
    const nextDefaultTab: ProjectTab = isManager ? "members" : "cost";
    const hasActiveTab = visibleTabs.some((tab) => tab.key === activeTab);
    if (!hasActiveTab) {
      setActiveTab(nextDefaultTab);
    }
  }, [activeTab, isManager, visibleTabs]);

  // Convert to DialogMember format
  const dialogMembers: DialogMember[] = activeMembers.map((m, i) => ({
    id: String(i + 1),
    name: m.name,
    role: m.role,
    avatarColor: MEMBER_COLORS[i % MEMBER_COLORS.length],
    letter: m.avatar,
    projectPermission: m.permission,
  }));

  const handleRemoveMember = (originalIndex: number) => {
    setRemovedMembers(prev => new Set([...prev, originalIndex]));
    const releasedQuota = memberQuotas[originalIndex];
    const released = releasedQuota?.type !== "unlimited" ? releasedQuota?.remaining ?? 0 : 0;
    toast.success(`成员已移除，${released > 0 ? `${released.toLocaleString()} 颗生产栗已释放至项目预算` : "配额已释放至项目预算"}`);
  };

  const handlePermChange = (originalIndex: number, perm: ProjectPermission) => {
    setMemberPermissions(prev => ({ ...prev, [originalIndex]: perm }));
    setOpenPermDropdown(null);
    toast.success(`权限已更新为「${perm}」`);
  };

  const toggleDetailMember = (name: string) => {
    setExpandedDetailMember(prev => prev === name ? null : name);
  };

  const handleDownloadCSV = () => {
    const visible = filteredMembersIndexed;
    const headers = ["成员", "角色", "消耗", "配额类型", "配额总额", "剩余", "图片生成", "图片消耗", "视频生成", "视频消耗", "视频时长"];
    const rows = visible.map(({ m, i }) => {
      const qd = memberQuotas[i] ?? memberQuotas[0];
      const qLabel = qd.type === "unlimited" ? "无限制" : "固定额度";
      const qTotal = qd.type === "unlimited" ? "-" : qd.total.toLocaleString();
      const qRemaining = qd.type === "unlimited" ? "-" : qd.remaining.toLocaleString();
      return [m.name, m.role, m.tokenUsed.toLocaleString(), qLabel, qTotal, qRemaining, m.imageGenerated, m.imageTokenUsed, m.videoGenerated, m.videoTokenUsed, m.videoDuration];
    });
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `成员消耗_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCategoryCSV = () => {
    const headers = ["分类", "总消耗", "图片生成", "图片消耗", "视频生成", "视频时长", "视频消耗", "抽卡率", "图片抽卡率", "视频抽卡率"];
    const rows: string[][] = [];
    categorySummary.forEach((item) => {
      rows.push([
        item.name,
        item.totalTokens.toLocaleString(),
        String(item.imageCount),
        item.imageTokens.toLocaleString(),
        String(item.videoCount),
        formatDuration(item.videoDurationSec),
        item.videoTokens.toLocaleString(),
        `${item.totalRate}%`,
        `${item.imageRate}%`,
        `${item.videoRate}%`,
      ]);
      item.children?.forEach((child) => {
        if ("type" in child) return;
        const rates = deriveCategoryRates(child);
        rows.push([
          `  - ${child.name}`,
          child.totalTokens.toLocaleString(),
          String(child.imageCount),
          child.imageTokens.toLocaleString(),
          String(child.videoCount),
          formatDuration(child.videoDurationSec),
          child.videoTokens.toLocaleString(),
          `${rates.totalRate}%`,
          `${rates.imageRate}%`,
          `${rates.videoRate}%`,
        ]);
      });
    });
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `分类消耗_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered members
  const filteredMembersIndexed = activeMembersIndexed.filter(({ m, i }) => {
    if (filterMembers.size > 0 && !filterMembers.has(m.name)) return false;
    if (filterPerm !== "all" && m.permission !== filterPerm) return false;
    return true;
  });

  // Pre-compute modal data to avoid IIFE blocks in JSX
  const quotaEditorEntry = quotaEditorIndex !== null
    ? (activeMembersIndexed.find(x => x.i === quotaEditorIndex) ?? null)
    : null;
  const editQuotaEntry = editQuotaIndex !== null
    ? activeMembersIndexed.find(x => x.i === editQuotaIndex)
    : null;
  const handleMemberQuotaSave = (i: number, q: MemberQuota) => {
    setMemberQuotas(prev => prev.map((m, idx) => idx === i ? q : m));
    setEditQuotaIndex(null);
  };
  const removeConfirmEntry = removeConfirmIndex !== null
    ? (activeMembersIndexed.find(x => x.i === removeConfirmIndex) ?? null)
    : null;
  const scopedCategoryConsumption = (isEditor
    ? CATEGORY_CONSUMPTION.map((node) => scaleCategoryNode(node, editorConsumptionFactor))
    : CATEGORY_CONSUMPTION) as CategoryNode[];

  const categorySummary = scopedCategoryConsumption.map((node) => {
    if ("type" in node) {
      const summary = {
        totalTokens: sumCat(node.children, "totalTokens"),
        imageCount: sumCat(node.children, "imageCount"),
        imageTokens: sumCat(node.children, "imageTokens"),
        videoCount: sumCat(node.children, "videoCount"),
        videoDurationSec: sumCat(node.children, "videoDurationSec"),
        videoTokens: sumCat(node.children, "videoTokens"),
      };
      return {
        name: node.name,
        ...summary,
        ...deriveCategoryRates(summary),
        children: node.children,
      };
    }
    return {
      name: node.name,
      totalTokens: node.totalTokens,
      imageCount: node.imageCount,
      imageTokens: node.imageTokens,
      videoCount: node.videoCount,
      videoDurationSec: node.videoDurationSec,
      videoTokens: node.videoTokens,
      ...deriveCategoryRates(node),
      children: null,
    };
  });

  return (
    <div
      className="h-full overflow-auto"
      style={{ background: "radial-gradient(ellipse 70% 35% at 50% 0%, rgba(140,70,20,0.18) 0%, rgba(20,15,9,0) 55%), #140F09" }}
      onClick={() => setShowStatusDrop(false)}
    >
      <div className="max-w-[1760px] mx-auto px-4 py-7 lg:px-6">

     

        {/* ── Header ── */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            {editingName ? (
              <input
                autoFocus
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={() => { setEditingName(false); toast.success("项目名称已更新"); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { setEditingName(false); toast.success("项目名称已更新"); }
                  if (e.key === "Escape") { setProjectName(project.name); setEditingName(false); }
                }}
                className="bg-transparent outline-none text-white rounded-lg px-2 py-0.5"
                style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em", border: "1px solid rgba(232,115,34,0.5)", caretColor: "#E87322", minWidth: "200px" }}
              />
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-white" style={{ fontSize: "24px", fontWeight: 600, letterSpacing: "-0.02em" }}>{projectName}</h1>
                <button onClick={() => projectPerm === "管理" && setEditingName(true)}
                  className={`transition-opacity w-6 h-6 rounded-lg flex items-center justify-center ${projectPerm === "管理" ? "opacity-0 group-hover:opacity-100 hover:bg-white/10" : "opacity-0 pointer-events-none"}`}
                  style={{ color: "rgba(255,255,255,0.4)" }}>
                  <Edit2 size={12} />
                </button>
              </div>
            )}

            {/* Status dropdown / badge */}
            {projectPerm === "阅读" ? (
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
                style={{ background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}`, fontSize: "12px" }}>
                {status}
              </span>
            ) : (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowStatusDrop(!showStatusDrop)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0 transition-colors"
                style={{ background: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}`, fontSize: "12px" }}>
                {status}<ChevronDown size={10} />
              </button>
              {showStatusDrop && (
                <div className="absolute left-0 top-full mt-1 rounded-xl overflow-hidden z-30 shadow-2xl"
                  style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.1)", minWidth: "120px" }}>
                  {STATUS_OPTIONS.map((s) => {
                    const st = STATUS_STYLE[s];
                    return (
                      <button key={s} onClick={() => { setStatus(s); setShowStatusDrop(false); toast.success(`状态已更新为「${s}」`); }}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-left hover:bg-white/5"
                        style={{ color: status === s ? st.text : "rgba(255,255,255,0.7)" }}>
                        <span>{s}</span>
                        {status === s && <Check size={12} style={{ color: st.text }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            )}

            <div className="flex items-center gap-1 ml-2" style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)" }}>
              <Clock size={11} /><span>始于 {project.startDate}</span>
              <span className="mx-2">·</span>
              <Clock size={11} /><span>最近 {project.lastEdit}</span>
            </div>
          </div>

          {/* ── Basic Info inline-edit badges ── */}
          <div className="flex items-center gap-2 flex-wrap">
            <InlineSelectBadge
              label="比例"
              value={basicInfo.aspectRatio}
              icon={Monitor}
              options={BASIC_INFO_OPTIONS.aspectRatio}
              onSave={(v) => setBasicInfo(prev => ({ ...prev, aspectRatio: v }))}
              readOnly={projectPerm === "阅读"}
            />
            <InlineSelectBadge
              label="分辨率"
              value={basicInfo.resolution}
              icon={Layers}
              options={BASIC_INFO_OPTIONS.resolution}
              onSave={(v) => setBasicInfo(prev => ({ ...prev, resolution: v }))}
              readOnly={projectPerm === "阅读"}
            />
            <InlineSelectBadge
              label="帧率"
              value={basicInfo.frameRate}
              icon={Zap}
              options={BASIC_INFO_OPTIONS.frameRate}
              suffix="fps"
              onSave={(v) => setBasicInfo(prev => ({ ...prev, frameRate: v }))}
              readOnly={projectPerm === "阅读"}
            />

            {/* Watermark indicator */}
            {watermarkEnabled && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
                style={{ background: "rgba(155,89,182,0.1)", border: "1px solid rgba(155,89,182,0.25)", color: "#9B59B6" }}>
                <Droplets size={11} />
                <span style={{ fontSize: "11px" }}>水印已启用</span>
              </div>
            )}
          </div>
        </div>

      {/* ── Dashboard ── */}

        <div className="mb-6">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 mb-4">
              <button
              onClick={() => isManager && setShowMemberModal(true)}
              className="text-left rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: "linear-gradient(145deg, rgba(74,158,224,0.12) 0%, rgba(74,158,224,0.04) 100%)", border: "1px solid rgba(74,158,224,0.14)", minHeight: "128px" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(74,158,224,0.16)" }}>
                  <Users size={14} style={{ color: "#4A9EE0" }} />
                </div>
                {isManager && <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>点击管理成员</span>}
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>项目成员</div>
              <div className="mt-2 flex items-end gap-2">
                <span style={{ fontSize: "30px", lineHeight: 1, fontWeight: 700, color: "#fff" }}>{activeMembers.length}</span>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>人</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(Object.entries(permCounts) as [ProjectPermission, number][]).map(([perm, cnt]) => cnt > 0 && (
                  <span key={perm} className="px-2 py-0.5 rounded-full" style={{ background: `${PERM_COLORS[perm]}20`, color: PERM_COLORS[perm], fontSize: "10px" }}>
                    {perm} {cnt}
                  </span>
                ))}
              </div>
            </button>
            <div
              className="text-left rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: "linear-gradient(145deg, rgba(232,115,34,0.18) 0%, rgba(232,115,34,0.08) 100%)", border: "1px solid rgba(232,115,34,0.18)", minHeight: "128px" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(232,115,34,0.18)" }}>
                  <Coins size={14} style={{ color: "#E87322" }} />
                </div>
                <div className="flex items-center gap-2">
                  {isManager && (
                    <button
                      onClick={() => setEditingTotalQuota(v => !v)}
                      className="px-2.5 py-1 rounded-lg transition-colors hover:opacity-90"
                      style={{ background: "rgba(232,115,34,0.14)", color: "#E87322", border: "1px solid rgba(232,115,34,0.2)", fontSize: "11px", fontWeight: 500 }}
                    >
                      {editingTotalQuota ? "收起" : "编辑"}
                    </button>
                  )}
                </div>
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>项目配额</div>
              <div className="mt-2 flex items-end gap-2">
                <span style={{ fontSize: "30px", lineHeight: 1, fontWeight: 700, color: "#fff" }}>{displayedQuotaTotal.toLocaleString()}</span>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)" }}>颗</span>
              </div>
            
              <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div style={{ width: `${Math.min(100, tokenPercent)}%`, height: "100%", background: tokenPercent > 80 ? "linear-gradient(90deg, #ff6b6b, #ff9b9b)" : "linear-gradient(90deg, #E87322, #F5A623)" }} />
              </div>
              <div className="mt-2 flex items-center justify-between" style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                <span>已用 {displayedTokenUsed.toLocaleString()}</span>
                <span>{Math.min(100, tokenPercent)}%</span>
              </div>
              
            </div>

          
          
            <div
              className="text-left rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: "linear-gradient(145deg, rgba(74,198,120,0.12) 0%, rgba(74,198,120,0.04) 100%)", border: "1px solid rgba(74,198,120,0.14)", minHeight: "128px" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(74,198,120,0.16)" }}>
                  <Layers size={14} style={{ color: "#4AC678" }} />
                </div>
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>资产总量</div>
              <div className="mt-2 flex items-end gap-2">
                <span style={{ fontSize: "30px", lineHeight: 1, fontWeight: 700, color: "#fff" }}>{totalGenerated}</span>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>个</span>
              </div>
              <div className="mt-2 flex items-center gap-2" style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                <span>图片 {imageGenerated}</span>
                <span>视频 {videoGenerated}</span>
              </div>
            </div>
              <button
              onClick={() => setActiveTab("progress")}
              className="text-left rounded-2xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{ background: "linear-gradient(145deg, rgba(232,115,34,0.12) 0%, rgba(232,115,34,0.04) 100%)", border: "1px solid rgba(232,115,34,0.14)", minHeight: "128px" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(232,115,34,0.16)" }}>
                  <Film size={14} style={{ color: "#E87322" }} />
                </div>
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>项目进度</div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span style={{ fontSize: "30px", lineHeight: 1, fontWeight: 700, color: "#fff" }}>{project.completedEpisodes}</span>
                <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>/{project.episodes} 集</span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div style={{ width: `${contentProgress}%`, height: "100%", background: contentProgress === 100 ? "linear-gradient(90deg, #4AC678, #6EE7A0)" : "linear-gradient(90deg, #E87322, #F5A623)" }} />
                </div>
                <span style={{ fontSize: "11px", color: contentProgress === 100 ? "#4AC678" : "#E87322", fontWeight: 600 }}>{contentProgress}%</span>
              </div>
              {/*
              <div className="mt-2" style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                {contentProgress === 100 ? "已完结" : `还差 ${Math.max(0, project.episodes - project.completedEpisodes)} 集`}
              </div>
              */}
            </button>

          </div>

          {isManager && editingTotalQuota && (
            <div
              className="rounded-2xl p-4 mb-4"
              style={{ background: "#1A1510", border: "1px solid rgba(232,115,34,0.16)" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(232,115,34,0.16)" }}>
                    <Edit2 size={13} style={{ color: "#E87322" }} />
                  </div>
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.72)", fontWeight: 500 }}>编辑项目配额</span>
                </div>
              </div>
              <InlineTotalQuotaEditor
                currentConsumed={project.tokenUsed}
                currentTotal={localTokenTotal}
                onSave={(v) => { setLocalTokenTotal(v); setEditingTotalQuota(false); }}
                onCancel={() => setEditingTotalQuota(false)}
              />
            </div>
          )}

        </div>
        {/* ══════════════════════════════════════════════════════════════════════
            ── Tab Container ──
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="rounded-xl overflow-hidden mb-5" style={{ background: "#1A1510", border: "1px solid rgba(255,255,255,0.06)" }}>
          {/* Tab Header */}
          <div className="flex items-center gap-1 px-4 py-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            {visibleTabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{
                  background: activeTab === key ? "rgba(232,115,34,0.15)" : "transparent",
                  color: activeTab === key ? "#E87322" : "rgba(255,255,255,0.45)",
                  border: activeTab === key ? "1px solid rgba(232,115,34,0.3)" : "1px solid transparent",
                  fontWeight: activeTab === key ? 500 : 400,
                }}
              >
                <Icon size={12} />
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-5">
            {/* ── 项目成本 Tab ── */}
            {activeTab === "cost" && (() => {
              const STACKED_METRICS = new Set(["img_count", "img_tokens", "vid_count", "vid_duration", "vid_tokens"]);
              const isStacked = STACKED_METRICS.has(selectedMetric);
              const scopedStackedTrendData = isEditor
                ? scaleStackedSeries(STACKED_TREND_DATA[selectedMetric] ?? STACKED_TREND_DATA.img_count, editorConsumptionFactor)
                : STACKED_TREND_DATA[selectedMetric];
              const scopedRateTrendData = isEditor
                ? shiftRateSeries(
                    RATE_TREND_DATA[selectedMetric] ?? RATE_TREND_DATA.gacha_rate,
                    Number(
                      selectedMetric === "img_gacha_rate"
                        ? imgGachaAvg
                        : selectedMetric === "vid_gacha_rate"
                          ? vidGachaAvg
                          : totalGachaAvg,
                    ),
                  )
                : RATE_TREND_DATA[selectedMetric];
              const stackedData = isStacked ? (scopedStackedTrendData?.[period] ?? []) : [];
              const rateData = !isStacked ? (scopedRateTrendData?.[period] ?? []) : [];
              const categoryLegend = [
                { k: "cat1", label: "主体", color: "#E87322" },
                { k: "cat2", label: "第1集", color: "#4A9EE0" },
                { k: "cat3", label: "第2集", color: "#4AC678" },
              ];
              const metricCards = [
                { key: "img_count",      label: "图片生成数",    value: imageGenerated.toLocaleString(),         tooltip: "统计周期内项目所有成员生成的图片总数量（含人物/场景/道具等各分类）",  unit: "张" },
                { key: "img_tokens",     label: "图片消耗生产栗", value: imageTokenUsed.toLocaleString(),          tooltip: "统计周期内生成图片所消耗的生产栗总量，按生成成本累计",             unit: "颗" },
                { key: "vid_count",      label: "视频生成数",    value: videoGenerated.toLocaleString(),          tooltip: "统计周期内生成的视频片段总数量（含各集各分镜）",                  unit: "个" },
                { key: "vid_duration",   label: "视频生成时长",  value: formatDuration(videoDurationSec),         tooltip: "统计周期内所有视频的累计生成时长",                              unit: ""  },
                { key: "vid_tokens",     label: "视频消耗生产栗", value: videoTokenUsed.toLocaleString(),          tooltip: "统计周期内生成视频所消耗的生产栗总量",                          unit: "颗" },
                { key: "gacha_rate",     label: "抽卡率",        value: `${totalGachaAvg}%`,                     tooltip: "平均抽卡率，按保留资产对应的生成成功率换算为百分比展示",          unit: ""  },
                { key: "img_gacha_rate", label: "图片抽卡率",    value: `${imgGachaAvg}%`,                       tooltip: "图片资产抽卡率，按图片生成成功率换算为百分比展示",                unit: ""  },
                { key: "vid_gacha_rate", label: "视频抽卡率",    value: `${vidGachaAvg}%`,                       tooltip: "视频资产抽卡率，按视频生成成功率换算为百分比展示",                unit: ""  },
              ];
              const metricMeta: Record<string, string> = {
                img_count: "图片生成数", img_tokens: "图片消耗生产栗", vid_count: "视频生成数",
                vid_duration: "视频生成时长", vid_tokens: "视频消耗生产栗",
                gacha_rate: "抽卡率", img_gacha_rate: "图片抽卡率", vid_gacha_rate: "视频抽卡率",
              };
              return (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                  
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5 p-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        {PERIOD_LABELS.map(({ key, label }) => (
                          <button key={key} onClick={() => setPeriod(key)}
                            className="px-2 py-1 rounded-md text-xs transition-colors"
                            style={{ background: period === key ? "rgba(232,115,34,0.7)" : "transparent", color: period === key ? "#fff" : "rgba(255,255,255,0.45)" }}>
                            {label}
                          </button>
                        ))}
                      </div>
                      {period === "custom" && (
                        <div className="flex items-center gap-1.5">
                          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                            className="px-2 py-1 rounded-lg text-xs outline-none"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", colorScheme: "dark", fontSize: "10px" }} />
                          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>~</span>
                          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                            className="px-2 py-1 rounded-lg text-xs outline-none"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", colorScheme: "dark", fontSize: "10px" }} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Stats Grid ── */}
                  <div>
                    <div className="grid grid-cols-4 gap-2.5">
                      {metricCards.map(({ key, label, value, tooltip, unit }) => (
                        <button
                          key={key}
                          onClick={() => setSelectedMetric(key)}
                          className="flex flex-col gap-1.5 p-3 rounded-xl text-left transition-all"
                          style={{
                            background: selectedMetric === key ? "rgba(232,115,34,0.12)" : "rgba(255,255,255,0.03)",
                            border: `1px solid ${selectedMetric === key ? "rgba(232,115,34,0.3)" : "rgba(255,255,255,0.06)"}`,
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            <span style={{ fontSize: "10px", color: selectedMetric === key ? "#E87322" : "rgba(255,255,255,0.4)" }}>{label}</span>
                            <StatTooltip text={tooltip} />
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span style={{ fontSize: "18px", fontWeight: 700, color: selectedMetric === key ? "#E87322" : "rgba(255,255,255,0.8)", lineHeight: 1 }}>{value}</span>
                            {unit && <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>{unit}</span>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Period Selector + Dynamic Chart ── */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                        {metricMeta[selectedMetric]} 趋势
                      </span>
                      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>按所选时间范围展示</span>
                    </div>

                    <div className="rounded-lg px-1 pt-2 pb-1" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      {isStacked && (
                        <div className="flex items-center gap-4 px-3 mb-2">
                          {categoryLegend.map(({ label, color }) => (
                            <div key={label} className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: color }} /><span style={{ fontSize: "10px", color: "rgba(255,255,255,0.4)" }}>{label}</span></div>
                          ))}
                        </div>
                      )}
                      <ResponsiveContainer width="100%" height={130}>
                        {isStacked ? (
                          <BarChart data={stackedData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                            <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)} />
                            <ReTooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={({ active, payload, label: lbl }) => {
                              if (!active || !payload?.length) return null;
                              const total = payload.reduce((sum, item) => sum + Number(item.value ?? 0), 0);
                              return (
                                <div className="px-3 py-2 rounded-lg shadow-2xl" style={{ background: "#1E1A14", border: "1px solid rgba(232,115,34,0.3)", minWidth: "110px" }}>
                                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginBottom: "4px" }}>{lbl}</p>
                                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.72)", marginBottom: "4px" }}>总量 {total.toLocaleString()}</p>
                                  {categoryLegend.map(({ k, label: l, color }) => {
                                    const p = payload.find(x => x.dataKey === k);
                                    return p ? <p key={k} style={{ fontSize: "11px", color }}>{l} {p.value?.toLocaleString()}</p> : null;
                                  })}
                                </div>
                              );
                            }} />
                            <Bar dataKey="cat1" stackId="s" fill="#E87322" fillOpacity={0.85} radius={[0, 0, 0, 0]} />
                            <Bar dataKey="cat2" stackId="s" fill="#4A9EE0" fillOpacity={0.85} radius={[0, 0, 0, 0]} />
                            <Bar dataKey="cat3" stackId="s" fill="#4AC678" fillOpacity={0.85} radius={[3, 3, 0, 0]} />
                          </BarChart>
                        ) : (
                          <LineChart data={rateData} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                            <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                            <YAxis tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9 }} axisLine={false} tickLine={false} />
                            <ReTooltip content={({ active, payload, label: lbl }) => {
                              if (!active || !payload?.length) return null;
                              return (
                                <div className="px-3 py-2 rounded-lg shadow-2xl" style={{ background: "#1E1A14", border: "1px solid rgba(232,115,34,0.3)", minWidth: "100px" }}>
                                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", marginBottom: "4px" }}>{lbl}</p>
                                  <p style={{ fontSize: "14px", fontWeight: 600, color: "#E87322" }}>{payload[0].value}<span style={{ fontSize: "10px", fontWeight: 400, color: "rgba(255,255,255,0.4)", marginLeft: "2px" }}>%</span></p>
                                </div>
                              );
                            }} cursor={{ stroke: "rgba(232,115,34,0.3)", strokeWidth: 1, strokeDasharray: "4 3" }} />
                            <Line type="monotone" dataKey="value" stroke="#E87322" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: "#E87322", stroke: "#140F09", strokeWidth: 2 }} />
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{isEditor ? "我的生成消耗" : "生成消耗"}</span>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>点击分类行查看明细</span>
                        <button onClick={handleDownloadCategoryCSV}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all hover:opacity-80"
                          style={{ background: "rgba(74,198,120,0.1)", color: "#4AC678", border: "1px solid rgba(74,198,120,0.2)", fontSize: "10px" }}>
                          <DownloadIcon size={10} />下载表格
                        </button>
                      </div>
                    </div>
                    <div className="grid px-4 py-2.5 rounded-lg"
                      style={{ gridTemplateColumns: "140px 90px 90px 90px 90px 100px 100px 90px 100px 100px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>分类</span>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", textAlign: "right" }}>总消耗</span>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", textAlign: "right" }}>图片生成</span>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", textAlign: "right" }}>图片消耗</span>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", textAlign: "right" }}>视频生成</span>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", textAlign: "right" }}>视频时长</span>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", textAlign: "right" }}>视频消耗</span>
                      <div className="flex justify-end"><MetricHeader label="抽卡率" tooltip="分类下全部资产的综合抽卡率，按图片和视频抽卡率加权计算" /></div>
                      <div className="flex justify-end"><MetricHeader label="图片抽卡率" tooltip="分类下图片资产抽卡率，按图片生成效率换算为百分比展示" /></div>
                      <div className="flex justify-end"><MetricHeader label="视频抽卡率" tooltip="分类下视频资产抽卡率，按视频生成效率换算为百分比展示" /></div>
                    </div>
                    <div className="flex flex-col gap-1 mt-2">
                      {categorySummary.map((item) => {
                        const expanded = expandedCategories.has(item.name);
                        return (
                          <div key={item.name} className="rounded-lg overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                            <button
                              onClick={() => setExpandedCategories((prev) => {
                                const next = new Set(prev);
                                next.has(item.name) ? next.delete(item.name) : next.add(item.name);
                                return next;
                              })}
                              className="w-full grid px-4 py-3 text-left items-center transition-colors hover:bg-white/[0.02]"
                              style={{ gridTemplateColumns: "140px 90px 90px 90px 90px 100px 100px 90px 100px 100px" }}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {item.children ? (expanded ? <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }} /> : <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0 }} />) : <span style={{ width: 14, flexShrink: 0 }} />}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.78)", fontWeight: 600 }}>{item.name}</span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ fontSize: "12px", color: "#fff", fontWeight: 600, textAlign: "right" }}>{item.totalTokens.toLocaleString()}</div>
                              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.72)", textAlign: "right" }}>{item.imageCount}</div>
                              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.72)", textAlign: "right" }}>{item.imageTokens.toLocaleString()}</div>
                              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.72)", textAlign: "right" }}>{item.videoCount}</div>
                              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.72)", textAlign: "right" }}>{formatDuration(item.videoDurationSec)}</div>
                              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.72)", textAlign: "right" }}>{item.videoTokens.toLocaleString()}</div>
                              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.72)", textAlign: "right" }}>{item.totalRate}%</div>
                              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.72)", textAlign: "right" }}>{item.imageRate}%</div>
                              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.72)", textAlign: "right" }}>{item.videoRate}%</div>
                            </button>
                            {expanded && item.children && (
                              <div className="px-3 pb-3 flex flex-col gap-1" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                                {item.children.map((child) => {
                                  if ("type" in child) return null;
                                  const childRates = deriveCategoryRates(child);
                                  return (
                                    <div key={child.name} className="grid px-4 py-2 rounded-lg" style={{ gridTemplateColumns: "140px 90px 90px 90px 90px 100px 100px 90px 100px 100px", background: "rgba(255,255,255,0.025)" }}>
                                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.62)", paddingLeft: "22px" }}>{child.name}</span>
                                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.52)", textAlign: "right" }}>{child.totalTokens.toLocaleString()}</span>
                                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.52)", textAlign: "right" }}>{child.imageCount}</span>
                                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.52)", textAlign: "right" }}>{child.imageTokens.toLocaleString()}</span>
                                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.52)", textAlign: "right" }}>{child.videoCount}</span>
                                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.52)", textAlign: "right" }}>{formatDuration(child.videoDurationSec)}</span>
                                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.52)", textAlign: "right" }}>{child.videoTokens.toLocaleString()}</span>
                                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.52)", textAlign: "right" }}>{childRates.totalRate}%</span>
                                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.52)", textAlign: "right" }}>{childRates.imageRate}%</span>
                                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.52)", textAlign: "right" }}>{childRates.videoRate}%</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── 成员管理 Tab ── */}
            {activeTab === "members" && isManager && (
              <div className="flex flex-col gap-6">
                {/* ── 成员管理 ── */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }} />
                  </div>

                  {/* Filter Bar (only 管理) */}
                  {isManager && (
                  <div className="flex items-center gap-3 mb-3 px-1">
                    <FilterDropdown
                      label="成员"
                      options={activeMembers.map(m => m.name)}
                      selected={filterMembers}
                      onChange={setFilterMembers}
                    />
                    <PermFilterDropdown value={filterPerm} onChange={setFilterPerm} />
                    <div className="ml-auto flex items-center gap-2">
                      <div className="flex gap-0.5 p-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        {PERIOD_LABELS.map(({ key, label }) => (
                          <button key={key} onClick={() => setPeriod(key)}
                            className="px-2 py-1 rounded-md text-xs transition-colors"
                            style={{ background: period === key ? "rgba(232,115,34,0.7)" : "transparent", color: period === key ? "#fff" : "rgba(255,255,255,0.45)" }}>
                            {label}
                          </button>
                        ))}
                      </div>
                      {period === "custom" && (
                        <div className="flex items-center gap-1.5">
                          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                            className="px-2 py-1 rounded-lg text-xs outline-none"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", colorScheme: "dark", fontSize: "10px" }} />
                          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>~</span>
                          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                            className="px-2 py-1 rounded-lg text-xs outline-none"
                            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", colorScheme: "dark", fontSize: "10px" }} />
                        </div>
                      )}
                    </div>
                    <button onClick={handleDownloadCSV}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all hover:opacity-80"
                      style={{ background: "rgba(74,198,120,0.1)", color: "#4AC678", border: "1px solid rgba(74,198,120,0.2)", fontSize: "10px" }}>
                      <DownloadIcon size={10} />下载表格
                    </button>
                  </div>
                  )}

                  <div className="overflow-x-auto pb-2">
                    <div style={{ minWidth: "1030px" }}>
                      {/* Table Header */}
                      <div className="grid px-4 py-2.5 rounded-lg"
                        style={{ gridTemplateColumns: "120px 140px 78px 82px 78px 82px 80px 70px 80px 80px 90px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>成员</span>
                        <MetricHeader label="消耗/配额" tooltip="点击可修改配额模式（无限制/固定额度）" />
                        <MetricHeader label="图片生成" tooltip="生成的图片数量" />
                        <MetricHeader label="图片消耗" tooltip="生成图片消耗的生产栗" />
                        <MetricHeader label="视频生成" tooltip="生成的视频数量" />
                        <MetricHeader label="视频消耗" tooltip="生成视频消耗的生产栗" />
                        <MetricHeader label="视频时长" tooltip="累计生成的视频总时长" />
                        <MetricHeader label="抽卡率" tooltip="成员维度综合抽卡率，按图片和视频抽卡率加权展示" />
                        <MetricHeader label="图片抽卡率" tooltip="成员维度图片资产抽卡率" />
                        <MetricHeader label="视频抽卡率" tooltip="成员维度视频资产抽卡率" />
                        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>操作</span>
                      </div>

                      {/* Member Rows */}
                      <div className="flex flex-col gap-1 mt-2">
                    {/* ── 总计 Row ── */}
                    {/*
                    {(() => {
                      const ti = filteredMembersIndexed;
                      const totalConsumed = ti.reduce((s, { i }) => s + (memberPeriodConsumed[i] ?? 0), 0);
                      const totalImageGen = ti.reduce((s, { m }) => s + m.imageGenerated, 0);
                      const totalImageTok = ti.reduce((s, { m }) => s + m.imageTokenUsed, 0);
                      const totalVidGen = ti.reduce((s, { m }) => s + m.videoGenerated, 0);
                      const totalVidTok = ti.reduce((s, { m }) => s + m.videoTokenUsed, 0);
                      const totalDuration = ti.reduce((s, { m }) => {
                        const parts = m.videoDuration.match(/(\d+)分(\d+)秒/);
                        return s + (parts ? parseInt(parts[1]) * 60 + parseInt(parts[2]) : 0);
                      }, 0);
                      return (
                        <div className="grid px-5 py-2.5 rounded-lg"
                          style={{ gridTemplateColumns: "120px 140px 85px 85px 85px 75px 70px 90px", alignItems: "center", background: "rgba(232,115,34,0.04)", border: "1px solid rgba(232,115,34,0.1)" }}>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(232,115,34,0.2)", fontSize: "10px", fontWeight: 700, color: "#E87322" }}>Σ</div>
                            <span style={{ fontSize: "12px", color: "#E87322", fontWeight: 600 }}>总计</span>
                          </div>
                          <button
                            className="text-left rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors relative group/edit-total"
                            onClick={() => setQuotaEditorIndex(-1)}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-full rounded-full overflow-hidden" style={{ height: "5px", background: "rgba(255,255,255,0.07)", flex: 1 }}>
                                <div className="h-full rounded-full" style={{ width: `${tokenPercent}%`, background: tokenPercent > 80 ? "linear-gradient(90deg,#ff6b6b,#ff9b9b)" : "linear-gradient(90deg,#E87322,#F5A623)" }} />
                              </div>
                              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>
                                {tokenPercent}%
                              </span>
                            </div>
                            <span style={{ fontSize: "10px", color: "#E87322" }} onClick={() => setEditingTotalQuota(!editingTotalQuota)}>编辑配额</span>
                          </button>
                          <div className="text-right" style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{totalImageGen}</div>
                          <div className="text-right" style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{totalImageTok.toLocaleString()}</div>
                          <div className="text-right" style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{totalVidGen}</div>
                          <div className="text-right" style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{totalVidTok.toLocaleString()}</div>
                          <div className="text-right" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{formatDuration(totalDuration)}</div>
                          <div />
                        </div>
                      );
                    })()}
*/}
                    {/* Member Rows */}
                    {filteredMembersIndexed.map(({ m, i }) => {
                      const qd = memberQuotas[i] ?? memberQuotas[0];
                      const totalTok = memberPeriodConsumed[i] ?? 0;
                      const quotaPct = qd.type === "fixed" && qd.total > 0 ? Math.min(100, (totalTok / qd.total) * 100) : 0;
                      const isExpanded = expandedDetailMember === m.name;
                      const memberTxns = MEMBER_TRANSACTIONS.filter(t => t.memberName === m.name);

                      return (
                        <Fragment key={i}>
                          <div
                            className="grid px-5 py-3 hover:bg-white/[0.02] transition-colors group/row"
                            style={{ gridTemplateColumns: "120px 140px 78px 82px 78px 82px 80px 70px 80px 80px 90px", alignItems: "center" }}
                          >
                            {/* Member Info */}
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: MEMBER_COLORS[i % MEMBER_COLORS.length], fontSize: "10px", fontWeight: 600, color: "#fff" }}>
                                {m.avatar}
                              </div>
                              <div className="min-w-0">
                              
                                <div className="flex items-center gap-1.5">
                                  <span className="truncate" style={{ fontSize: "12px", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{m.name}</span>
                                  {i === 0 && (
                                    <span className="px-1 py-0.5 rounded flex-shrink-0" style={{ background: "rgba(232,115,34,0.1)", color: "#E87322", fontSize: "9px" }}>你</span>
                                  )}
                                </div>
                             
                              </div>
                            </div>

                            {/* Quota — progress bar + edit额度 */}
                            <div className="flex flex-col gap-0.2">
                              <div className="w-full rounded-full overflow-hidden" style={{ height: "4px", background: "rgba(255,255,255,0.07)" }}>
                                <div className="h-full rounded-full transition-all" style={{
                                  width: qd.type === "unlimited" ? "100%" : `${Math.min(100, quotaPct)}%`,
                                  background: qd.type === "unlimited" ? "#4AC678" : quotaPct > 90 ? "#ff6b6b" : "#9B59B6",
                                }} />
                              </div>
                              <div className="flex items-center justify-between">
                                <button
                                  className="text-xs transition-all hover:opacity-80"
                                  style={{
                                    color: qd.type === "unlimited" ? "#4AC678" : "rgba(255,255,255,0.55)",
                                    fontSize: "10px",
                                  }}
                                  onClick={() => setEditQuotaIndex(i)}
                                >
                                  {qd.type === "unlimited" ? "无额度限制" : "固定"}
                                </button>
                                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)", flexShrink: 0 }}>
                                  {qd.type === "unlimited" ? "∞" : `${totalTok.toLocaleString()} / ${qd.total.toLocaleString()}`}
                                </span>
                              </div>
                            </div>

                            {/* Image count */}
                            <div className="text-right" style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{m.imageGenerated}张</div>

                            {/* Image tokens */}
                            <div className="text-right" style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{m.imageTokenUsed}颗</div>

                            {/* Video count */}
                            <div className="text-right" style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{m.videoGenerated}个</div>

                            {/* Video tokens */}
                            <div className="text-right" style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{m.videoTokenUsed}颗</div>

                            {/* Video duration */}
                            <div className="text-right" style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{m.videoDuration}</div>
                            <div className="text-right" style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{Number((((m.gachaRate * m.imageGenerated) + (m.avgGachaRate * m.videoGenerated)) / Math.max(m.imageGenerated + m.videoGenerated, 1)).toFixed(1))}%</div>
                            <div className="text-right" style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{m.gachaRate}%</div>
                            <div className="text-right" style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{m.avgGachaRate}%</div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 justify-end">
                              <button
                                onClick={() => toggleDetailMember(m.name)}
                                className="px-1.5 py-0.5 rounded text-xs transition-all"
                                style={{
                                  color: isExpanded ? "#E87322" : "rgba(255,255,255,0.4)",
                                  fontSize: "10px",
                                }}
                              >
                                明细
                              </button>
                              <span style={{ color: "rgba(255,255,255,0.1)" }}>|</span>
                              <button
                                onClick={() => setRemoveConfirmIndex(i)}
                                className="px-1.5 py-0.5 rounded text-xs transition-all hover:text-red-400"
                                style={{ color: "rgba(255,100,100,0.5)", fontSize: "10px" }}
                              >
                                删除
                              </button>
                            </div>
                          </div>

                          {/* ── Inline Detail Dropdown ── */}
                          {isExpanded && (
                            <div className="mx-5 my-1 rounded-lg overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                              <div className="px-4 py-2 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>{m.name} — 消耗明细</span>
                                <button onClick={() => setExpandedDetailMember(null)} className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/10" style={{ color: "rgba(255,255,255,0.3)" }}>
                                  <X size={10} />
                                </button>
                              </div>
                              {memberTxns.length === 0 ? (
                                <div className="px-4 py-6 text-center" style={{ color: "rgba(255,255,255,0.25)", fontSize: "12px" }}>暂无交易记录</div>
                              ) : (
                                <div className="max-h-48 overflow-auto">
                                  <div className="grid grid-cols-12 gap-2 px-4 py-1.5 text-xs" style={{ color: "rgba(255,255,255,0.3)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                    <span className="col-span-3">时间</span>
                                    <span className="col-span-1 text-center">类型</span>
                                    <span className="col-span-5">描述</span>
                                    <span className="col-span-3 text-right">金额</span>
                                  </div>
                                  {memberTxns.map((t, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 px-4 py-2 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                                      <span className="col-span-3 truncate" style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>{t.time}</span>
                                      <span className="col-span-1 flex items-center justify-center">
                                        <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: t.type === "消费" ? "rgba(232,115,34,0.12)" : "rgba(74,198,120,0.12)", color: t.type === "消费" ? "#E87322" : "#4AC678", fontSize: "10px" }}>{t.type}</span>
                                      </span>
                                      <span className="col-span-5 truncate" title={t.description}>{t.description}</span>
                                      <span className="col-span-3 text-right font-mono" style={{ color: t.type === "消费" ? "rgba(255,255,255,0.7)" : "#4AC678", fontSize: "11px" }}>
                                        {t.type === "消费" ? `-${Math.abs(t.amount)}` : `+${t.amount}`}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </Fragment>
                      );
                    })}

                    {activeMembers.length === 0 && (
                      <div className="px-4 py-8 text-center rounded-lg" style={{ background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.25)", fontSize: "13px" }}>
                        暂无成员
                      </div>
                    )}
                      </div>
                    </div>
                  </div>


                
                </div>

              </div>
            )}

            {/* ── 分镜进度 Tab ── */}
            {activeTab === "progress" && (
              <div className="flex flex-col gap-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {project.episodeStats.map((ep, idx) => {
                  const mediaProgress = deriveEpisodeMediaProgress(ep.progress);
                  const statusColor = ep.progress === 100 ? "#4AC678" : ep.progress > 0 ? "#E87322" : "rgba(255,255,255,0.2)";
                  const StatusIcon = ep.progress === 100 ? CheckCircle2 : ep.progress > 0 ? Loader2 : Circle;
                  const statusLabel = ep.progress === 100 ? "已完成" : ep.progress > 0 ? "进行中" : "未开始";

                  return (
                    <div key={idx} className="rounded-[20px] p-4 transition-all"
                      style={{
                        background: "rgba(255,255,255,0.025)",
                        border: `1px solid ${ep.progress > 0 ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.05)"}`,
                        boxShadow: ep.progress > 0 ? `0 12px 24px ${statusColor}08` : "none",
                      }}>
                      <div className="flex items-center justify-between">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <StatusIcon size={14} style={{ color: statusColor }} />
                          <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.84)", fontWeight: 600 }}>{ep.name}</span>
                          <span className="px-2 py-0.5 rounded-full" style={{ fontSize: "10px", color: statusColor, background: `${statusColor}14` }}>
                            {statusLabel}
                          </span>
                        </div>
                        <span style={{ fontSize: "18px", color: statusColor, fontWeight: 700 }}>{ep.progress}%</span>
                      </div>
                      <div className="mt-4 flex flex-col gap-2.5">
                        {mediaProgress.map((stage) => {
                          const StageIcon = stage.label === "图片进度" ? LucideImage : Video;
                          return (
                            <div key={stage.label} className="flex items-center gap-3">
                              <div className="flex items-center gap-2 min-w-0 shrink-0">
                                <StageIcon size={12} style={{ color: stage.progress > 0 ? stage.color : "rgba(255,255,255,0.25)", flexShrink: 0 }} />
                                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)" }}>{stage.label}</span>
                              </div>
                              <div className="flex-1 rounded-full overflow-hidden" style={{ height: "6px", background: "rgba(255,255,255,0.06)" }}>
                                <div className="h-full rounded-full"
                                  style={{
                                    width: `${stage.progress}%`,
                                    background: stage.progress > 0 ? stage.color : "rgba(255,255,255,0.04)",
                                    transition: "width 0.5s",
                                  }} />
                              </div>
                              <span style={{ fontSize: "11px", color: stage.progress > 0 ? stage.color : "rgba(255,255,255,0.22)", fontWeight: 600, flexShrink: 0 }}>{stage.progress}%</span>
                            </div>
                          );
                        })}
                        <div className="mt-1 flex items-center justify-between gap-3">
                          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.25)" }}>快捷跳转</span>
                          <div className="flex items-center gap-2 flex-wrap justify-end">
                          <button
                            onClick={() => navigate(`/project/${id}/script`)}
                            className="transition-colors"
                            style={{ fontSize: "10px", color: "rgba(255,255,255,0.46)", fontWeight: 500 }}
                          >
                            查看剧本
                          </button>
                          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.14)" }}>/</span>
                          <button
                            onClick={() => navigate(`/project/${id}/generate`)}
                            className="transition-colors"
                            style={{ fontSize: "10px", color: "rgba(255,255,255,0.46)", fontWeight: 500 }}
                          >
                            跳转生成
                          </button>
                          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.14)" }}>/</span>
                          <button
                            onClick={() => navigate(`/project/${id}/storyboard`, { state: { episode: ep.name } })}
                            className="transition-colors"
                            style={{ fontSize: "10px", color: "#E87322", fontWeight: 700 }}
                          >
                            查看分镜 →
                          </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            )}

            {/* ── 生成预警 Tab ── */}
                   {/* ── 生成预警 Tab ── */}
            {activeTab === "warnings" && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-4 py-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={13} style={{ color: "#ff6b6b" }} />
                    <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>
                      共 <span style={{ color: "#ff6b6b", fontWeight: 600 }}>{DUPLICATE_PROMPTS.length}</span> 组重复 Prompt
                    </span>
                  </div>
                  <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)" }}>
                    预估浪费 <span style={{ color: "#E87322", fontWeight: 600 }}>{DUPLICATE_PROMPTS.reduce((s, i) => s + (i.count - 1) * 50, 0).toLocaleString()}</span> 颗
                  </span>
                </div>

                {DUPLICATE_PROMPTS.map((item, idx) => {
                  const isHigh = item.similarity > 90;
                  return (
                    <div key={idx} className="flex items-center gap-3 px-4 py-3 rounded-lg"
                      style={{
                        background: isHigh ? "rgba(255,100,100,0.04)" : "rgba(255,255,255,0.02)",
                        border: `1px solid ${isHigh ? "rgba(255,100,100,0.15)" : "rgba(255,255,255,0.04)"}`,
                      }}>
                      {/* Similarity badge */}
                      <div className="flex flex-col items-center justify-center flex-shrink-0 w-12" style={{ gap: "2px" }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: isHigh ? "rgba(255,100,100,0.12)" : "rgba(232,115,34,0.1)" }}>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: isHigh ? "#ff6b6b" : "#E87322" }}>
                            {item.similarity}%
                          </span>
                        </div>
                       
                      </div>

                      {/* Prompt + person + episode */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>{item.prompt}</p>
                        <div className="flex items-center gap-2 flex-wrap mt-1.5">
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                              style={{ background: MEMBER_COLORS[idx % MEMBER_COLORS.length], fontSize: "8px", fontWeight: 600 }}>
                              {item.person.charAt(0)}
                            </div>
                            <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)" }}>{item.person}</span>
                          </div>
                          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.15)" }}>·</span>
                          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.45)" }}>
                            {item.episode} · {item.shots.join("、")}
                          </span>
                        </div>
                      </div>

                      {/* Right side: count + waste */}
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>出现</span>
                          <span style={{ fontSize: "16px", fontWeight: 700, color: isHigh ? "#ff6b6b" : "#E87322" }}>
                            {item.count}
                          </span>
                          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>次</span>
                        </div>
                        <span
                          className="px-2 py-0.5 rounded text-xs"
                          style={{ background: "rgba(232,115,34,0.1)", color: "#E87322", fontWeight: 500, fontSize: "11px" }}
                        >
                          浪费 ~{(item.count - 1) * 50} 颗
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
           
          </div>
        </div>

      </div>

      {/* ── Member Management Modal ── */}
      {isManager && showMemberModal && (
        <EditProjectMembersDialog
          projectName={projectName}
          initialMembers={dialogMembers}
          onClose={() => setShowMemberModal(false)}
          onSave={() => { toast.success("项目成员已更新"); }}
        />
      )}

      {/* ── Allocate Member Token Dialog ── */}
      {isManager && showAllocateDialog && (
        <AllocateMemberTokenDialog
          projectName={projectName}
          members={activeMembers.map((m, i) => ({
            id: String(i + 1),
            name: m.name,
            avatar: m.avatar,
            avatarColor: MEMBER_COLORS[i % MEMBER_COLORS.length],
            role: m.role,
            currentBalance: memberTotalBalance / activeMembers.length,
          }))}
          projectBalance={projectBalance}
          onClose={() => setShowAllocateDialog(false)}
          onAllocate={() => { toast.success("批量分配已完成"); }}
        />
      )}

      {/* ── Member Quota Editor Modal (totals row) ── */}
      {quotaEditorEntry && (
        <MemberQuotaEditorModal
          member={{ name: quotaEditorEntry.m.name, avatar: quotaEditorEntry.m.avatar, avatarColor: MEMBER_COLORS[quotaEditorEntry.i % MEMBER_COLORS.length] }}
          quota={memberQuotas[quotaEditorEntry.i] ?? INITIAL_MEMBER_QUOTAS[0]}
          memberTokenUsed={quotaEditorEntry.m.tokenUsed}
          onClose={() => setQuotaEditorIndex(null)}
          onSave={(q) => {
            const idx = quotaEditorEntry.i;
            setMemberQuotas(prev => {
              const next = [...prev];
              next[idx] = q;
              return next;
            });
          }}
        />
      )}

      {/* ── Member Quota Editor (individual member) ── */}
      {editQuotaEntry && (
        <MemberQuotaEditor
          member={{ name: editQuotaEntry.m.name, avatar: editQuotaEntry.m.avatar, avatarColor: MEMBER_COLORS[editQuotaEntry.i % MEMBER_COLORS.length], role: editQuotaEntry.m.role }}
          currentQuota={memberQuotas[editQuotaEntry.i]}
          currentConsumed={memberPeriodConsumed[editQuotaEntry.i] ?? 0}
          onSave={(q) => handleMemberQuotaSave(editQuotaEntry.i, q)}
          onCancel={() => setEditQuotaIndex(null)}
        />
      )}

      {/* ── Remove Member Confirm ── */}
      {removeConfirmEntry && (
        <RemoveMemberConfirm
          member={{ name: removeConfirmEntry.m.name, avatar: removeConfirmEntry.m.avatar, avatarColor: MEMBER_COLORS[removeConfirmEntry.i % MEMBER_COLORS.length], role: removeConfirmEntry.m.role }}
          onClose={() => setRemoveConfirmIndex(null)}
          onConfirm={() => handleRemoveMember(removeConfirmEntry.i)}
        />
      )}

      {/* ── Shimmer Animation CSS ── */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

    </div>
  );
}
