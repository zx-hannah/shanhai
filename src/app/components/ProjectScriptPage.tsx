import { useState, useRef, useEffect, useLayoutEffect, type CSSProperties, type ReactNode } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import {
  Plus, Sparkles, Pencil, X, Check, Settings, Eye,
  Image, ChevronRight, ChevronLeft,
  Film, Trash2, User, MapPin, Package, Search, Sparkles as SparklesIcon, Film as FilmIcon,
} from "lucide-react";
import { toast } from "sonner";

/* ── Types ──────────────────────────────────────────────────────────────────── */

interface Chapter {
  id: string;
  chapterNo: number;
  title: string;
  content: string;
}

type ItemType = "character" | "scene" | "prop";

interface EpisodeItem {
  id: string;
  chapterId: string;
  type: ItemType;
  name: string;
  image?: string;
}

type ExtractScope = "episode" | "global";
type ScriptGuideTarget = "chapter-list" | "sidebar-toggle" | "script-editor" | "extract-subjects" | "linked-subjects";

const SCRIPT_GUIDE_STEPS: { target: ScriptGuideTarget; title: string; body: ReactNode }[] = [
  {
    target: "chapter-list",
    title: "分集目录",
    body: "左侧是剧本分集，支持新增、重命名或删除剧集。",
  },
  {
    target: "sidebar-toggle",
    title: "展开/收起侧边栏",
    body: "点击可以展开或收起左侧边栏。需要专注时可以收起侧边栏，给编辑区留出更多空间。",
  },
  {
    target: "script-editor",
    title: "剧本编辑",
    body: "中间编辑区用于输入剧本正文。",
  },
  {
    target: "linked-subjects",
    title: "剧集关联主体",
    body: "可为每集添加当前剧集关联的人物、场景、道具，进入主体模块后可查看每个主体的出现集数和占比。",
  },
];

/* ── Mock Data ──────────────────────────────────────────────────────────────── */

const MOCK_CHAPTERS: Chapter[] = [
  {
    id: "ch1",
    chapterNo: 1,
    title: "第1集",
    content: `第一集

1-1 山西左权县老屋 日 外
人： 老汉
字幕： 山西左权县 1982 年
△黄土夯筑的老屋墙根处，七十岁的王老汉正用铁锹修补裂缝。
△墙缝里突然露出泛黄纸片的边缘，他颤抖着拂去灰尘，一张地图残片在土墙内若隐若现。
△王老汉眼含热泪轻抚残片，抬眼看向远处的太行山脉。

1-2 冀中平原 日 外
字幕： 1942 年 4 月冀中平原日军铁壁合围
△苍穹被战机撕裂，黑压压的机群俯冲投弹，大地震颤。
△稻田瞬间化作火海。
△许多九四式装甲车碾过焦土，卷起浓烟。

1-3 村庄 日 外
人： 村名若干、日军、婴儿
△男女老少被蒙着眼睛，跪在地上，身后一个日本军官高高扬起刀。
日本军官： 再给你们最后一次机会，八路到底在哪？
△男女老少流着泪，但是无人说话。
△日本军官恶狠狠的挥下刀。
△被烧焦的枯枝上，一只乌鸦蓦地飞走。
△空境 村庄中尸横遍野，一个婴儿坐在废墟中哇哇大哭。

字幕&OS： 1942 年 2 月，扫荡冀中抗日根据地作战列入日本华北方面军《1942 年度肃正作战计划》。5 月 1 日，侵华日军第四十一师团主力，独立混成第九旅团、独立混成第七旅团、二十七师团等各部在华北方面军司令官冈村宁次的直接指挥下，向晋察冀边区冀中抗日根据地发动了规模空前的大扫荡。

1-4 三井秀赖办公室 日 内
人： 三井秀赖、尉官佐藤
△阳光透过窗帘缝隙洒在木质办公桌上，桌上散落着手绘地图和测量工具。
△三井秀赖正喝着咖啡，听着西洋乐。
△尉官佐藤（急促敲门闯入，敬礼汇报）： 三井长官，刚刚抓获一名女八路，身上有一袋破烂绘图工具，和一些没有价值的地图残片。
△尉官佐藤一边说着，一边将地图残片交给三井秀赖。
△三井秀赖深深打量手中的地图碎片，眼神中透露出一丝诧异。`,
  },
  {
    id: "ch2",
    chapterNo: 2,
    title: "第2集",
    content: "",
  },
];

const MOCK_EPISODE_ITEMS: EpisodeItem[] = [
  // ch1 characters
  { id: "ep1c1", chapterId: "ch1", type: "character", name: "老汉", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face" },
  { id: "ep1c2", chapterId: "ch1", type: "character", name: "三井秀赖", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face" },
  { id: "ep1c3", chapterId: "ch1", type: "character", name: "尉官佐藤", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
  // ch1 scenes
  { id: "ep1s1", chapterId: "ch1", type: "scene", name: "山西左权县老屋", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=80&h=80&fit=crop" },
  { id: "ep1s2", chapterId: "ch1", type: "scene", name: "冀中平原", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=80&h=80&fit=crop" },
  { id: "ep1s3", chapterId: "ch1", type: "scene", name: "村庄", image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=80&h=80&fit=crop" },
  { id: "ep1s4", chapterId: "ch1", type: "scene", name: "三井秀赖办公室", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=80&h=80&fit=crop" },
  // ch1 props
  { id: "ep1p1", chapterId: "ch1", type: "prop", name: "地图残片", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=80&h=80&fit=crop" },
  { id: "ep1p2", chapterId: "ch1", type: "prop", name: "九四式装甲车", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop" },
  // ch2
  { id: "ep2c1", chapterId: "ch2", type: "character", name: "女八路", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face" },
  { id: "ep2s1", chapterId: "ch2", type: "scene", name: "日军指挥部", image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=80&h=80&fit=crop" },
];

interface MockSubject {
  id: string;
  name: string;
  type: ItemType;
  image: string;
}

const MOCK_SUBJECTS: MockSubject[] = [
  { id: "s1", name: "老汉", type: "character", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face" },
  { id: "s2", name: "三井秀赖", type: "character", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face" },
  { id: "s3", name: "尉官佐藤", type: "character", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
  { id: "s4", name: "女八路", type: "character", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face" },
  { id: "s5", name: "婴儿", type: "character", image: "https://images.unsplash.com/photo-1555058664-8e971e7e1a6e?w=80&h=80&fit=crop&crop=face" },
  { id: "s6", name: "日本军官", type: "character", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face" },
  { id: "s7", name: "山西左权县老屋", type: "scene", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=80&h=80&fit=crop" },
  { id: "s8", name: "冀中平原", type: "scene", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=80&h=80&fit=crop" },
  { id: "s9", name: "村庄", type: "scene", image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=80&h=80&fit=crop" },
  { id: "s10", name: "三井秀赖办公室", type: "scene", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=80&h=80&fit=crop" },
  { id: "s11", name: "日军指挥部", type: "scene", image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=80&h=80&fit=crop" },
  { id: "s12", name: "太行山脉", type: "scene", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=80&h=80&fit=crop" },
  { id: "s13", name: "地图残片", type: "prop", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=80&h=80&fit=crop" },
  { id: "s14", name: "九四式装甲车", type: "prop", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop" },
  { id: "s15", name: "铁锹", type: "prop", image: "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=80&h=80&fit=crop" },
  { id: "s16", name: "绘图工具", type: "prop", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=80&h=80&fit=crop" },
];

/* ── Right Panel: Global Settings ─────────────────────────────────────────── */

const ITEM_TYPE_CONFIG: Record<ItemType, { label: string; icon: typeof User; color: string }> = {
  character: { label: "人物", icon: User, color: "#9B59B6" },
  scene: { label: "场景", icon: MapPin, color: "#2A6FC4" },
  prop: { label: "道具", icon: Package, color: "#C42A6F" },
};

const WORD_LIMIT = 2000;

const EXTRACT_PREVIEW_IMAGES: Record<ItemType, string> = {
  character: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
  scene: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=80&h=80&fit=crop",
  prop: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=80&h=80&fit=crop",
};

function normalizeSubjectName(value: string) {
  return value
    .replace(/[△◆•]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildEpisodeItemId(chapterId: string, type: ItemType, name: string) {
  return `${chapterId}-${type}-${name}`.replace(/\s+/g, "-");
}

function extractChapterSubjects(chapter: Chapter) {
  const text = chapter.content;
  const result: EpisodeItem[] = [];
  const seen = new Set<string>();
  const addItem = (type: ItemType, name: string) => {
    const cleaned = normalizeSubjectName(name);
    const invalid = !cleaned || cleaned.length < 2 || ["字幕", "字幕&OS", "人", "场景"].includes(cleaned);
    if (invalid) return;
    const id = buildEpisodeItemId(chapter.id, type, cleaned);
    if (seen.has(id)) return;
    seen.add(id);
    result.push({
      id,
      chapterId: chapter.id,
      type,
      name: cleaned,
      image: EXTRACT_PREVIEW_IMAGES[type],
    });
  };

  text.split("\n").forEach((line) => {
    const row = line.trim();
    if (!row) return;

    const sceneMatch = row.match(/^(\d+-\d+)?\s*([^\d]+?)\s+(日|夜)\s+(内|外)$/);
    if (sceneMatch?.[2]) addItem("scene", sceneMatch[2]);

    const castMatch = row.match(/^人[：:]\s*(.+)$/);
    if (castMatch?.[1]) {
      castMatch[1]
        .split(/[、,，\/和]+/)
        .map((item) => item.trim())
        .forEach((item) => addItem("character", item));
    }

    const speakerMatch = row.match(/^([^\s：:]{2,12})[：:]/);
    if (speakerMatch?.[1] && !row.startsWith("字幕") && !row.startsWith("字幕&OS") && !row.startsWith("人：")) {
      addItem("character", speakerMatch[1]);
    }

    [
      ["character", ["老汉", "三井秀赖", "尉官佐藤", "女八路", "婴儿", "日本军官"]],
      ["scene", ["老屋", "冀中平原", "村庄", "三井秀赖办公室", "日军指挥部", "太行山脉"]],
      ["prop", ["地图残片", "装甲车", "铁锹", "绘图工具"]],
    ].forEach(([type, keywords]) => {
      keywords.forEach((keyword) => {
        if (row.includes(keyword)) addItem(type as ItemType, keyword);
      });
    });
  });

  return result;
}

function extractSubjectsFromChapters(chapters: Chapter[], scope: ExtractScope, activeChapterId: string) {
  const targetChapters = scope === "global" ? chapters : chapters.filter((chapter) => chapter.id === activeChapterId);
  const nextItems: EpisodeItem[] = [];
  const existingKeys = new Set<string>();

  targetChapters.forEach((chapter) => {
    extractChapterSubjects(chapter).forEach((item) => {
      const key = `${item.chapterId}:${item.type}:${item.name}`;
      if (existingKeys.has(key)) return;
      existingKeys.add(key);
      nextItems.push(item);
    });
  });

  return nextItems;
}

function ScriptModuleGuide({
  step,
  total,
  current,
  onPrev,
  onNext,
  onClose,
}: {
  step: number;
  total: number;
  current: { target: ScriptGuideTarget; title: string; body: ReactNode };
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}) {
  const [cardPosition, setCardPosition] = useState<CSSProperties>({ right: 24, bottom: 24 });
  const [targetFrame, setTargetFrame] = useState<CSSProperties | null>(null);
  const isLast = step === total - 1;

  useLayoutEffect(() => {
    let frame = 0;
    let tries = 0;
    const updatePosition = () => {
      const target = document.querySelector(`[data-script-guide-target="${current.target}"]`) as HTMLElement | null;
      if (!target) {
        if (tries < 12) {
          tries += 1;
          frame = window.requestAnimationFrame(updatePosition);
        }
        return;
      }
      const rect = target.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        if (tries < 12) {
          tries += 1;
          frame = window.requestAnimationFrame(updatePosition);
        }
        return;
      }

      const margin = 18;
      const gap = 18;
      const pad = 8;
      const cardWidth = 360;
      const cardHeight = 240;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const frameLeft = Math.max(margin, rect.left - pad);
      const frameTop = Math.max(margin, rect.top - pad);
      const frameRight = Math.min(viewportWidth - margin, rect.right + pad);
      const frameBottom = Math.min(viewportHeight - margin, rect.bottom + pad);

      setTargetFrame({
        left: frameLeft,
        top: frameTop,
        width: Math.max(0, frameRight - frameLeft),
        height: Math.max(0, frameBottom - frameTop),
      });

      let left = rect.right + gap;
      let top = rect.top + Math.max(0, (rect.height - cardHeight) / 2);
      if (left + cardWidth + margin > viewportWidth) left = rect.left - cardWidth - gap;
      if (left < margin) {
        left = Math.min(Math.max(rect.left, margin), viewportWidth - cardWidth - margin);
        top = rect.bottom + gap;
      }
      if (top + cardHeight + margin > viewportHeight) top = rect.top - cardHeight - gap;
      if (top < margin) top = Math.min(Math.max(rect.bottom + gap, margin), viewportHeight - cardHeight - margin);

      setCardPosition({ left, top });
    };

    frame = window.requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [current.target]);

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none">
      {targetFrame ? (
        <>
          <div className="absolute left-0 right-0 top-0" style={{ height: targetFrame.top as number, background: "rgba(4,3,2,0.56)" }} />
          <div className="absolute left-0 bottom-0 right-0" style={{ top: ((targetFrame.top as number) + (targetFrame.height as number)), background: "rgba(4,3,2,0.56)" }} />
          <div className="absolute left-0" style={{ top: targetFrame.top as number, width: targetFrame.left as number, height: targetFrame.height as number, background: "rgba(4,3,2,0.56)" }} />
          <div className="absolute right-0" style={{ top: targetFrame.top as number, left: ((targetFrame.left as number) + (targetFrame.width as number)), height: targetFrame.height as number, background: "rgba(4,3,2,0.56)" }} />
          <div className="absolute rounded-[20px]" style={{ ...targetFrame, zIndex: 75, border: "3px solid #F5A623", boxShadow: "0 0 0 6px rgba(245,166,35,0.18), 0 18px 44px rgba(245,166,35,0.24)" }} />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: "rgba(4,3,2,0.56)" }} />
      )}
      <div className="absolute z-[80] w-[360px] rounded-2xl p-4 pointer-events-auto" style={{ ...cardPosition, background: "#1A1510", border: "2px solid #F5A623", boxShadow: "0 28px 70px rgba(0,0,0,0.58), 0 0 0 1px rgba(255,255,255,0.08), 0 0 34px rgba(245,166,35,0.22)" }}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="text-base font-semibold text-white">{current.title}</h3>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ color: "#F5A623", background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.22)" }}
            >
              {step + 1}/{total}
            </span>
          </div>
          <button onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/10" style={{ color: "rgba(255,255,255,0.45)" }} title="关闭新手引导">
            <X size={14} />
          </button>
        </div>
        <p className="mb-4 text-sm leading-6" style={{ color: "rgba(255,255,255,0.68)" }}>{current.body}</p>
        <div className="flex items-center justify-between gap-2">
          <button onClick={onPrev} className="h-8 rounded-lg px-3 text-xs transition-opacity" style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.68)" }}>
            上一步
          </button>
          <button onClick={onNext} className="h-8 rounded-lg px-3 text-xs font-medium transition-opacity hover:opacity-90" style={{ background: "#E87322", color: "#fff" }}>
            {isLast ? "进入主体模块" : "下一步"}
          </button>
        </div>
      </div>
    </div>
  );
}

function GlobalSettings({
  chapters,
  activeChapterId,
  items,
  onUpdateItems,
  subjects,
  onNavigate,
}: {
  chapters: Chapter[];
  activeChapterId: string;
  items: EpisodeItem[];
  onUpdateItems: (items: EpisodeItem[]) => void;
  subjects: MockSubject[];
  onNavigate: (path: string, episode?: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<ItemType>("character");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalWords = chapters.reduce((s, c) => s + c.content.length, 0);
  const totalEpisodes = chapters.length;

  const activeChapter = chapters.find((c) => c.id === activeChapterId);
  const chapterItems = items.filter((i) => i.chapterId === activeChapterId);
  const activeChapterContent = activeChapter?.content ?? "";
  const typeCounts = {
    character: chapterItems.filter((i) => i.type === "character").length,
    scene: chapterItems.filter((i) => i.type === "scene").length,
    prop: chapterItems.filter((i) => i.type === "prop").length,
  };
  const activeItems = chapterItems.filter((i) => i.type === activeTab);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isDropdownOpen]);

  const existingIds = new Set(chapterItems.map((i) => i.id));
  const filteredSubjects = subjects
    .filter((s) => s.type === activeTab && !existingIds.has(s.id))
    .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleSelectSubject = (subject: MockSubject) => {
    const newItem: EpisodeItem = {
      id: subject.id,
      chapterId: activeChapterId,
      type: subject.type,
      name: subject.name,
      image: subject.image,
    };
    onUpdateItems([...items, newItem]);
    setIsDropdownOpen(false);
    setSearchQuery("");
    toast.success(`已添加「${subject.name}」`);
  };

  const handleDeleteItem = (id: string) => {
    onUpdateItems(items.filter((i) => i.id !== id));
    toast.success("已删除");
  };

  return (
    <div className="flex flex-col h-full overflow-auto" style={{ background: "#0F0C08" }}>
      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <h3 className="text-sm text-white mb-0.5" style={{ fontWeight: 600, letterSpacing: "0.02em" }}>
          <span style={{ color: "#E87322" }}>◆</span> 剧集信息
        </h3>
      </div>

      <div className="px-4 pt-4 pb-3 flex-shrink-0">
        {/* Episode header with word count */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <span className="text-[10px] tracking-wider uppercase" style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em" }}>当前剧集</span>
            <div className="text-sm text-white mt-0.5" style={{ fontWeight: 600 }}>
              {activeChapter?.title ?? "未选择"}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>本集字数</span>
            <div className="text-lg font-bold" style={{ color: "#E87322", lineHeight: 1.2 }}>
              {activeChapterContent.length.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Type tabs — merged stat + navigation */}
        <div className="grid grid-cols-3 gap-1.5">
          {(["character", "scene", "prop"] as ItemType[]).map((type) => {
            const cfg = ITEM_TYPE_CONFIG[type];
            const isActive = activeTab === type;
            const Icon = cfg.icon;
            return (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className="flex flex-col items-center gap-0.5 py-2 rounded-lg transition-all relative"
                style={{ background: isActive ? `${cfg.color}12` : "transparent" }}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full" style={{ background: cfg.color }} />
                )}
                <Icon size={13} style={{ color: isActive ? cfg.color : "rgba(255,255,255,0.25)" }} />
                <span className="text-[10px]" style={{ color: isActive ? cfg.color : "rgba(255,255,255,0.35)" }}>
                  {cfg.label}
                </span>
                <span className="text-[9px]" style={{ color: isActive ? cfg.color : "rgba(255,255,255,0.2)" }}>
                  {typeCounts[type]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }} />

      {/* ── Items list ── */}
      <div className="flex-1 overflow-auto px-4 py-3">
        <div className="flex flex-col gap-0.5" style={{ minHeight: "80px" }}>
          {activeItems.length === 0 && !isDropdownOpen && (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ background: "rgba(255,255,255,0.03)" }}>
                {(() => { const T = ITEM_TYPE_CONFIG[activeTab].icon; return <T size={13} style={{ color: "rgba(255,255,255,0.12)" }} />; })()}
              </div>
              <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                暂无{ITEM_TYPE_CONFIG[activeTab].label}
              </span>
            </div>
          )}
          {activeItems.map((item, idx) => (
            <div
              key={item.id}
              className="group/item flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors cursor-default"
              style={{ background: "transparent" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
            >
              <span className="text-[9px] w-4 text-right flex-shrink-0" style={{ color: "rgba(255,255,255,0.1)", fontFamily: "monospace" }}>
                {String(idx + 1).padStart(2, "0")}
              </span>
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="rounded-md flex-shrink-0"
                  style={{ width: "28px", height: "28px", objectFit: "cover", border: "1px solid rgba(255,255,255,0.06)" }}
                />
              ) : (
                <div className="rounded-md flex-shrink-0 flex items-center justify-center" style={{ width: "28px", height: "28px", background: `${ITEM_TYPE_CONFIG[item.type].color}15` }}>
                  {(() => { const T = ITEM_TYPE_CONFIG[item.type].icon; return <T size={12} style={{ color: `${ITEM_TYPE_CONFIG[item.type].color}60` }} />; })()}
                </div>
              )}
              <span className="flex-1 truncate text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                {item.name}
              </span>
              <button
                onClick={() => handleDeleteItem(item.id)}
                className="w-5 h-5 flex items-center justify-center rounded opacity-0 group-hover/item:opacity-100 transition-all hover:bg-red-900/20"
                title="移除"
              >
                <X size={10} style={{ color: "rgba(255,100,100,0.5)" }} />
              </button>
            </div>
          ))}
        </div>

        {/* Add button / searchable dropdown */}
        <div className="relative mt-2" ref={dropdownRef}>
          {isDropdownOpen ? (
            <div className="rounded-lg overflow-hidden" style={{ background: "#1A1510", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
              {/* Search input */}
              <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <Search size={11} style={{ color: "rgba(255,255,255,0.2)" }} />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`搜索${ITEM_TYPE_CONFIG[activeTab].label}…`}
                  className="flex-1 bg-transparent text-xs outline-none text-white"
                  style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px" }}
                />
                <button
                  onClick={() => { setIsDropdownOpen(false); setSearchQuery(""); }}
                  className="w-4 h-4 flex items-center justify-center rounded hover:bg-white/10"
                >
                  <X size={9} style={{ color: "rgba(255,255,255,0.2)" }} />
                </button>
              </div>
              {/* Results */}
              <div className="overflow-auto" style={{ maxHeight: "200px" }}>
                {filteredSubjects.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-6 px-4" style={{ color: "rgba(255,255,255,0.15)" }}>
                    <Search size={14} />
                    <span className="text-[11px]">{searchQuery ? "未找到匹配的主体" : "没有可添加的主体"}</span>
                    <div className="flex flex-col gap-2 w-full">
                      <button
                        onClick={() => onNavigate("subjects", activeChapter?.chapterNo ? `ep${activeChapter.chapterNo}` : undefined)}
                        className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-[11px]"
                        style={{ background: "rgba(232,115,34,0.12)", color: "#E87322" }}
                      >
                        <User size={11} />去主体模块添加
                      </button>
                      <button
                        onClick={() => setShowExtractDialog(true)}
                        className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-[11px]"
                        style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.65)" }}
                      >
                        <Sparkles size={11} />自动提取主体
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-1">
                    <div className="px-2 pt-1 pb-2">
                      <button
                        onClick={() => onNavigate("subjects", `createType=${activeTab}`)}
                        className="w-full rounded-md px-2 py-1.5 text-[10px] transition-colors"
                        style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        新建{ITEM_TYPE_CONFIG[activeTab].label}
                      </button>
                    </div>
                    {filteredSubjects.map((subject) => (
                      <button
                        key={subject.id}
                        onClick={() => handleSelectSubject(subject)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors"
                        style={{ color: "rgba(255,255,255,0.7)" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                      >
                        {subject.image ? (
                          <img src={subject.image} alt="" className="rounded-md flex-shrink-0" style={{ width: "24px", height: "24px", objectFit: "cover", border: "1px solid rgba(255,255,255,0.06)" }} />
                        ) : (
                          <div className="rounded-md flex-shrink-0 flex items-center justify-center" style={{ width: "24px", height: "24px", background: `${ITEM_TYPE_CONFIG[subject.type].color}15` }}>
                            {(() => { const T = ITEM_TYPE_CONFIG[subject.type].icon; return <T size={10} style={{ color: `${ITEM_TYPE_CONFIG[subject.type].color}60` }} />; })()}
                          </div>
                        )}
                        <span className="flex-1 truncate text-xs">{subject.name}</span>
                        <Plus size={9} style={{ color: "rgba(255,255,255,0.15)" }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsDropdownOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs transition-colors"
              style={{ border: "1px dashed rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.2)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.35)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.2)"; }}
            >
              <Plus size={10} />添加{ITEM_TYPE_CONFIG[activeTab].label}
            </button>
          )}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }} />

      {/* ── Quick jump ── */}
      <div className="px-4 pt-3 pb-5 flex-shrink-0">
        <span className="text-[10px] tracking-wider uppercase mb-2.5 block" style={{ color: "rgba(255,255,255,0.25)", letterSpacing: "0.08em" }}>
          快捷跳转
        </span>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => {
              const epNo = activeChapter?.chapterNo;
              onNavigate("generate", epNo ? `ep${epNo}` : undefined);
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group/jump"
            style={{ background: "rgba(255,255,255,0.02)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(232,115,34,0.08)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.02)"; }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors" style={{ background: "rgba(232,115,34,0.1)" }}>
              <SparklesIcon size={13} style={{ color: "#E87322" }} />
            </div>
            <span className="flex-1 text-left text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>前往生成</span>
            <span className="transition-transform group-hover/jump:translate-x-0.5" style={{ color: "rgba(255,255,255,0.15)" }}>›</span>
          </button>
          <button
            onClick={() => onNavigate("storyboard")}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group/jump"
            style={{ background: "rgba(255,255,255,0.02)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(123,60,196,0.08)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.02)"; }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors" style={{ background: "rgba(123,60,196,0.1)" }}>
              <FilmIcon size={13} style={{ color: "#7B3FC4" }} />
            </div>
            <span className="flex-1 text-left text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>查看分镜</span>
            <span className="transition-transform group-hover/jump:translate-x-0.5" style={{ color: "rgba(255,255,255,0.15)" }}>›</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Sidebar Panel ─────────────────────────────────────────────────────────── */

type ScriptSidebarTab = "script" | "assets";

function ScriptSidebarPanel({
  chapters,
  activeChapterId,
  onChapterClick,
  onAddChapter,
  onDeleteChapter,
  onRenameChapter,
}: {
  chapters: Chapter[];
  activeChapterId: string;
  onChapterClick: (id: string) => void;
  onAddChapter: () => void;
  onDeleteChapter: (id: string) => void;
  onRenameChapter: (id: string, newName: string) => void;
}) {
  const [tab, setTab] = useState<ScriptSidebarTab>("script");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const startRename = (ch: Chapter) => {
    setRenamingId(ch.id);
    setRenameValue(ch.title);
  };

  const finishRename = () => {
    if (renamingId && renameValue.trim()) {
      onRenameChapter(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue("");
  };

  return (
    <>
      {/* Tabs */}
      <div className="flex flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        {([
          { key: "script" as const, label: "剧本" },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 py-2.5 text-xs transition-colors"
            style={{
              color: tab === t.key ? "#E87322" : "rgba(255,255,255,0.4)",
              borderBottom: tab === t.key ? "2px solid #E87322" : "2px solid transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "script" && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <div className="flex items-center gap-1.5">
              <Film size={11} style={{ color: "#E87322" }} />
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>剧本</span>
            </div>
            <button title="添加剧集" onClick={onAddChapter}>
              <Plus size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
            </button>
          </div>

          <div className="flex-1 overflow-auto py-1">
            {chapters.map((chapter) => {
              const isActive = activeChapterId === chapter.id;
              const isRenaming = renamingId === chapter.id;
              return (
                <div key={chapter.id} className="mb-0.5 group/ch">
                  <div className="flex items-center gap-1 px-2 py-2 text-left transition-colors"
                    style={{
                      background: isActive ? "rgba(232,115,34,0.1)" : "transparent",
                    }}
                    onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"; }}
                    onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  >
                    <button
                      onClick={() => onChapterClick(chapter.id)}
                      className="flex-1 flex items-center gap-1.5 min-w-0"
                    >
                      <Film size={12} style={{ color: "#E87322", flexShrink: 0 }} />
                      {isRenaming ? (
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={finishRename}
                          onKeyDown={(e) => { if (e.key === "Enter") finishRename(); if (e.key === "Escape") { setRenamingId(null); } }}
                          className="flex-1 bg-transparent text-xs outline-none text-white"
                          style={{ borderBottom: "1px solid #E87322" }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="flex-1 truncate text-xs" style={{
                          color: isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)",
                          fontWeight: isActive ? 600 : "normal",
                        }}>
                          {chapter.title}
                        </span>
                      )}
                    </button>

                    {/* Hover actions */}
                    {!isRenaming && (
                      <div className="flex items-center gap-0.5 opacity-0 group-hover/ch:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() => startRename(chapter)}
                          className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10"
                          title="重命名"
                        >
                          <Pencil size={10} style={{ color: "rgba(255,255,255,0.3)" }} />
                        </button>
                        <button
                          onClick={() => { onDeleteChapter(chapter.id); toast.success("已删除"); }}
                          className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-900/20"
                          title="删除"
                        >
                          <Trash2 size={10} style={{ color: "rgba(255,100,100,0.4)" }} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "assets" && (
        <div className="flex flex-col h-full overflow-hidden flex-1">
          <div className="flex-1 overflow-auto px-3 py-3">
            <div className="flex flex-col items-center justify-center py-12" style={{ color: "rgba(255,255,255,0.2)" }}>
              <Image size={20} className="mb-2" />
              <p className="text-xs">暂无资产</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Script Parse Dialog ───────────────────────────────────────────────────── */

interface ParsedEpisode {
  index: number;
  title: string;
  content: string;
  wordCount: number;
}

function ScriptParseDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (episodes: ParsedEpisode[]) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [episodes, setEpisodes] = useState<ParsedEpisode[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [previewEp, setPreviewEp] = useState<ParsedEpisode | null>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setParsing(true);
    setEpisodes([]);
    setSelectedIds(new Set());

    if (f.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const parts = text.split(/\n\s*\n/).filter(Boolean);
        const result = parts.map((part, idx) => ({
          index: idx,
          title: `第${idx + 1}集`,
          content: part.trim(),
          wordCount: part.trim().length,
        }));
        setEpisodes(result);
        setSelectedIds(new Set(result.map((e) => e.index)));
        setParsing(false);
      };
      reader.readAsText(f);
    } else {
      // Mock parse for doc/docx/pdf
      setTimeout(() => {
        const mock: ParsedEpisode[] = [
          { index: 0, title: "第1集", content: "山西左权县老屋 日 外\n人：老汉\n△黄土夯筑的老屋墙根处，七十岁的王老汉正用铁锹修补裂缝...", wordCount: 320 },
          { index: 1, title: "第2集", content: "冀中平原 日 外\n字幕：1942 年 4 月冀中平原日军铁壁合围\n△苍穹被战机撕裂，黑压压的机群俯冲投弹...", wordCount: 480 },
          { index: 2, title: "第3集", content: "三井秀赖办公室 日 内\n人：三井秀赖、尉官佐藤\n△阳光透过窗帘缝隙洒在木质办公桌上...", wordCount: 260 },
        ];
        setEpisodes(mock);
        setSelectedIds(new Set(mock.map((e) => e.index)));
        setParsing(false);
      }, 1500);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const toggleSelect = (idx: number) => {
    const next = new Set(selectedIds);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelectedIds(next);
  };

  const selectAll = () => setSelectedIds(new Set(episodes.map((e) => e.index)));
  const deselectAll = () => setSelectedIds(new Set());

  const handleConfirm = () => {
    const selected = episodes.filter((e) => selectedIds.has(e.index));
    if (selected.length > 0) onConfirm(selected);
  };

  const reset = () => {
    setFile(null);
    setParsing(false);
    setEpisodes([]);
    setSelectedIds(new Set());
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div
        className="rounded-2xl flex flex-col"
        style={{
          width: "640px",
          maxHeight: "80vh",
          background: "#1A1510",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <Sparkles size={16} style={{ color: "#E87322" }} />
            <span className="text-[15px] text-white font-medium">剧本解析</span>
          </div>
          <button onClick={() => { reset(); onClose(); }} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10">
            <X size={14} style={{ color: "rgba(255,255,255,0.5)" }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-6 py-5">
          {/* Upload area */}
          {!file && !parsing && episodes.length === 0 && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ".txt,.doc,.docx,.pdf";
                input.onchange = (e) => {
                  const f = (e.target as HTMLInputElement).files?.[0];
                  if (f) handleFile(f);
                };
                input.click();
              }}
              className="rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:border-[#E87322]/50 flex flex-col items-center justify-center gap-3"
              style={{ height: "240px", borderColor: "rgba(255,255,255,0.12)" }}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(232,115,34,0.12)" }}>
                <Sparkles size={20} style={{ color: "#E87322" }} />
              </div>
              <div className="text-center">
                <div className="text-[13px]" style={{ color: "rgba(255,255,255,0.7)" }}>点击上传或拖拽文件到此处</div>
                <div className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>支持 .txt / .doc / .docx / .pdf 格式</div>
              </div>
            </div>
          )}

          {/* Parsing state */}
          {parsing && (
            <div className="flex flex-col items-center justify-center gap-4" style={{ height: "240px" }}>
              <div className="w-10 h-10 rounded-full border-2 border-[#E87322] border-t-transparent animate-spin" />
              <div className="text-[13px]" style={{ color: "rgba(255,255,255,0.6)" }}>
                正在解析「{file?.name}」...
              </div>
            </div>
          )}

          {/* Results */}
          {!parsing && episodes.length > 0 && (
            <div className="space-y-4">
              {/* File info + summary */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(232,115,34,0.12)" }}>
                    <Sparkles size={14} style={{ color: "#E87322" }} />
                  </div>
                  <div>
                    <div className="text-[13px] text-white">{file?.name}</div>
                    <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                      解析到 {episodes.length} 集 · 共 {episodes.reduce((s, e) => s + e.wordCount, 0)} 字
                    </div>
                  </div>
                </div>
                <button
                  onClick={reset}
                  className="text-[11px] px-2.5 py-1 rounded-lg transition-colors hover:bg-white/10"
                  style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  重新上传
                </button>
              </div>

              {/* Selection controls */}
              <div className="flex items-center gap-2">
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>选择要导入的集：</span>
                <button onClick={selectAll} className="text-[11px] px-2 py-0.5 rounded transition-colors hover:bg-white/10" style={{ color: "#E87322" }}>全选</button>
                <button onClick={deselectAll} className="text-[11px] px-2 py-0.5 rounded transition-colors hover:bg-white/10" style={{ color: "rgba(255,255,255,0.4)" }}>取消全选</button>
                <span className="text-[11px]" style={{ color: "rgba(255,255,255,0.3)" }}>（已选 {selectedIds.size}/{episodes.length}）</span>
              </div>

              {/* Episode list */}
              <div className="space-y-2">
                {episodes.map((ep) => (
                  <div
                    key={ep.index}
                    onClick={() => toggleSelect(ep.index)}
                    className="rounded-xl p-3 cursor-pointer transition-all"
                    style={{
                      background: selectedIds.has(ep.index) ? "rgba(232,115,34,0.06)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${selectedIds.has(ep.index) ? "rgba(232,115,34,0.25)" : "rgba(255,255,255,0.06)"}`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background: selectedIds.has(ep.index) ? "#E87322" : "rgba(255,255,255,0.08)",
                          border: `1px solid ${selectedIds.has(ep.index) ? "#E87322" : "rgba(255,255,255,0.12)"}`,
                        }}
                      >
                        {selectedIds.has(ep.index) && <Check size={11} style={{ color: "#fff" }} />}
                      </div>
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] text-white font-medium">{ep.title}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>
                              {ep.wordCount} 字
                            </span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); setPreviewEp(ep); }}
                            className="flex items-center gap-1 px-2 py-1 rounded-md transition-colors hover:bg-white/10 flex-shrink-0"
                            style={{ color: "rgba(255,255,255,0.5)" }}
                          >
                            <Eye size={11} />预览
                          </button>
                        </div>
                        <div className="text-[11px] leading-relaxed line-clamp-2" style={{ color: "rgba(255,255,255,0.4)" }}>
                          {ep.content.slice(0, 120)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Episode preview overlay */}
          {previewEp && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setPreviewEp(null)}>
              <div
                className="rounded-2xl flex flex-col mx-4"
                style={{
                  width: "600px",
                  maxHeight: "75vh",
                  background: "#1A1510",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Preview header */}
                <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center gap-3">
                    <span className="text-[15px] text-white font-medium">{previewEp.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}>
                      {previewEp.wordCount} 字
                    </span>
                  </div>
                  <button onClick={() => setPreviewEp(null)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10">
                    <X size={14} style={{ color: "rgba(255,255,255,0.5)" }} />
                  </button>
                </div>
                {/* Preview body */}
                <div className="flex-1 overflow-auto px-6 py-5">
                  <div className="text-[13px] leading-7 whitespace-pre-wrap" style={{ color: "rgba(255,255,255,0.75)" }}>
                    {previewEp.content}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={() => { reset(); onClose(); }}
            className="px-4 py-2 rounded-lg text-[13px] transition-colors hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.06)" }}
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedIds.size === 0}
            className="px-5 py-2 rounded-lg text-[13px] text-white transition-all"
            style={{
              background: selectedIds.size === 0 ? "rgba(255,255,255,0.08)" : "#E87322",
              color: selectedIds.size === 0 ? "rgba(255,255,255,0.2)" : "#fff",
              cursor: selectedIds.size === 0 ? "not-allowed" : "pointer",
            }}
          >
            确认导入 {selectedIds.size > 0 ? `(${selectedIds.size} 集)` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

function SubjectExtractDialog({
  open,
  onClose,
  onConfirm,
  chapterTitle,
  chapterCount,
  totalWords,
  cost,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (scope: ExtractScope) => void;
  chapterTitle: string;
  chapterCount: number;
  totalWords: number;
  cost: number;
}) {
  const [scope, setScope] = useState<ExtractScope>("episode");

  useEffect(() => {
    if (open) setScope("episode");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="rounded-2xl w-[520px] max-w-[calc(100vw-32px)] overflow-hidden" style={{ background: "#1A1510", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <Sparkles size={15} style={{ color: "#E87322" }} />
            <span className="text-sm text-white font-medium">一键提取主体</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10">
            <X size={14} style={{ color: "rgba(255,255,255,0.45)" }} />
          </button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
            从《{chapterTitle}》提取主体，支持按当前剧集或全局范围扫描。
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>剧集集数</div>
              <div className="mt-1 text-2xl font-semibold text-white">{chapterCount}</div>
            </div>
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>总字数</div>
              <div className="mt-1 text-2xl font-semibold text-white">{totalWords}</div>
            </div>
            <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>需消耗生产栗</div>
              <div className="mt-1 text-2xl font-semibold" style={{ color: "#7CFFD0" }}>{cost}</div>
            </div>
          </div>
          <div className="rounded-xl px-4 py-3 text-xs" style={{ background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)" }}>
            提取出的主体将追加到主体库，不会覆盖已有内容。
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "episode" as ExtractScope, title: "分集提取", desc: "只提取当前剧集中的主体", accent: "rgba(232,115,34,0.12)" },
              { key: "global" as ExtractScope, title: "全局提取", desc: "扫描全部剧本，汇总主体", accent: "rgba(123,60,196,0.12)" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setScope(item.key)}
                className="rounded-xl p-4 text-left transition-colors"
                style={{
                  background: scope === item.key ? item.accent : "rgba(255,255,255,0.03)",
                  border: `1px solid ${scope === item.key ? "rgba(232,115,34,0.28)" : "rgba(255,255,255,0.06)"}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white font-medium">{item.title}</span>
                  {scope === item.key && <Check size={12} style={{ color: "#E87322" }} />}
                </div>
                <div className="mt-1 text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>{item.desc}</div>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)" }}>
            取消
          </button>
          <button onClick={() => onConfirm(scope)} className="px-4 py-2 rounded-lg text-xs text-white" style={{ background: "#E87322" }}>
            开始提取
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────────────── */

export function ProjectScriptPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [chapters, setChapters] = useState<Chapter[]>(MOCK_CHAPTERS);
  const [activeChapterId, setActiveChapterId] = useState("ch1");
  const [showSettings, setShowSettings] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [episodeItems, setEpisodeItems] = useState<EpisodeItem[]>(MOCK_EPISODE_ITEMS);
  const [showParseDialog, setShowParseDialog] = useState(false);
  const [showExtractDialog, setShowExtractDialog] = useState(false);
  const [showScriptGuide, setShowScriptGuide] = useState(() => searchParams.get("guide") === "1");
  const [scriptGuideStep, setScriptGuideStep] = useState(0);
  const extractCost = Math.max(1, Math.ceil(chapters.reduce((sum, chapter) => sum + chapter.content.length, 0) / 1000));
  const currentScriptGuideStep = SCRIPT_GUIDE_STEPS[scriptGuideStep];

  const closeScriptGuide = () => {
    setShowScriptGuide(false);
    setScriptGuideStep(0);
    const nextUrl = `${window.location.pathname}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);
  };

  useEffect(() => {
    if (searchParams.get("guide") === "1") {
      setShowScriptGuide(true);
      setScriptGuideStep(searchParams.get("guideStep") === "last" ? SCRIPT_GUIDE_STEPS.length - 1 : 0);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!showScriptGuide) return;
    if (currentScriptGuideStep.target === "chapter-list" || currentScriptGuideStep.target === "sidebar-toggle") {
      setSidebarCollapsed(false);
    }
    if (currentScriptGuideStep.target === "linked-subjects") {
      setShowSettings(true);
    }
  }, [currentScriptGuideStep.target, showScriptGuide]);

  const handleParseConfirm = (parsed: ParsedEpisode[]) => {
    const newChapters = parsed.map((ep, idx) => ({
      id: `ch${idx + 1}`,
      chapterNo: idx + 1,
      title: ep.title,
      content: ep.content,
    }));
    setChapters(newChapters);
    setActiveChapterId(newChapters[0].id);
    setShowParseDialog(false);
    toast.success(`剧本解析完成，已导入 ${newChapters.length} 集`);
  };

  const handleNavigate = (path: string, episode?: string) => {
    const query = episode ? `?ep=${episode}` : "";
    navigate(`/project/${id}/${path}${query}`);
  };

  const activeChapter = chapters.find((c) => c.id === activeChapterId)!;
  const activeContent = editMode ? editContent : activeChapter.content;
  const wordCount = activeContent.length;
  const exceedsLimit = wordCount > WORD_LIMIT;

  const enterEditMode = () => {
    setEditContent(activeChapter.content);
    setEditMode(true);
  };

  const saveEdit = () => {
    setChapters((prev) => prev.map((c) =>
      c.id === activeChapterId ? { ...c, content: editContent } : c
    ));
    setEditMode(false);
    toast.success("已保存");
  };

  const cancelEdit = () => {
    setEditContent(activeChapter.content);
    setEditMode(false);
  };

  const handleAddChapter = () => {
    const nextNo = chapters.length + 1;
    const newCh: Chapter = {
      id: `ch-${Date.now()}`,
      chapterNo: nextNo,
      title: `第${nextNo}集`,
      content: "",
    };
    setChapters((prev) => [...prev, newCh]);
    setActiveChapterId(newCh.id);
    toast.success("已添加新剧集");
  };

  const handleDeleteChapter = (id: string) => {
    if (chapters.length <= 1) {
      toast.error("至少保留一个剧集");
      return;
    }
    const remaining = chapters.filter((c) => c.id !== id);
    setChapters(remaining);
    if (activeChapterId === id) {
      setActiveChapterId(remaining[0].id);
    }
  };

  const handleRenameChapter = (id: string, newName: string) => {
    setChapters((prev) => prev.map((c) =>
      c.id === id ? { ...c, title: newName } : c
    ));
    toast.success("已重命名");
  };

  const handleExtractSubjects = (scope: ExtractScope) => {
    const extracted = extractSubjectsFromChapters(chapters, scope, activeChapterId);
    if (extracted.length === 0) {
      toast.message("没有提取到主体");
      return;
    }
    setEpisodeItems((prev) => {
      const next = [...prev];
      const existing = new Set(next.map((item) => `${item.chapterId}:${item.type}:${item.name}`));
      extracted.forEach((item) => {
        const key = `${item.chapterId}:${item.type}:${item.name}`;
        if (!existing.has(key)) next.push(item);
      });
      return next;
    });
    setShowExtractDialog(false);
    toast.success(scope === "global" ? "已完成全局主体提取" : "已完成分集主体提取");
  };

  return (
    <div className="flex h-full" style={{ background: "#140F09" }}>
      {/* ── Left Sidebar ──────────────────────────────────────────────── */}
      <div
        data-script-guide-target="chapter-list"
        className="flex flex-col flex-shrink-0 relative"
        style={{
          width: sidebarCollapsed ? "28px" : "220px",
          background: "#110E0A",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          transition: "width 0.2s ease",
          overflow: "hidden",
        }}
      >
        {/* Collapse toggle */}
        <button
          data-script-guide-target="sidebar-toggle"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-2 right-1 z-10 w-5 h-5 rounded flex items-center justify-center hover:bg-white/10"
          style={{ color: "rgba(255,255,255,0.35)" }}
          title={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
        >
          {sidebarCollapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
        </button>

        {!sidebarCollapsed && (
          <ScriptSidebarPanel
            chapters={chapters}
            activeChapterId={activeChapterId}
            onChapterClick={setActiveChapterId}
            onAddChapter={handleAddChapter}
            onDeleteChapter={handleDeleteChapter}
            onRenameChapter={handleRenameChapter}
          />
        )}
      </div>

      {/* ── Center: Script Editor ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center gap-4 px-5 py-2.5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: "#0D0A06" }}>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white" style={{ fontWeight: 600 }}>{activeChapter.title}</span>
            <span className="text-xs font-mono" style={{ color: exceedsLimit ? "#ef4444" : "rgba(255,255,255,0.35)" }}>
              {wordCount}/{WORD_LIMIT} 字
            </span>
            {exceedsLimit && (
              <span className="text-xs" style={{ color: "#ef4444" }}>
                字数超过限制，可以拆分为多剧集
              </span>
            )}
          </div>

          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {editMode ? (
              <>
                <button
                  onClick={cancelEdit}
                  className="px-3 py-1.5 rounded-lg text-xs transition-opacity hover:opacity-80"
                  style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}
                >
                  取消
                </button>
                <button
                  onClick={saveEdit}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs text-white transition-opacity hover:opacity-80"
                  style={{ background: "#E87322" }}
                >
                  <Check size={11} />保存
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowParseDialog(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 transition-colors"
                  style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <Sparkles size={11} />剧本解析
                </button>
                <button
                  data-script-guide-target="extract-subjects"
                  onClick={() => setShowExtractDialog(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 transition-colors"
                  style={{ background: "rgba(232,115,34,0.12)", color: "#E87322", border: "1px solid rgba(232,115,34,0.18)" }}
                >
                  <Sparkles size={11} />从剧本提取主体
                </button>
              </>
            )}
          </div>
        </div>

        {/* Editor area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-3xl mx-auto px-8 py-6" data-script-guide-target="script-editor">
            {editMode ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full rounded-xl p-4 text-sm leading-relaxed outline-none resize-none"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(232,115,34,0.3)",
                  color: "rgba(255,255,255,0.8)",
                  minHeight: "calc(100vh - 200px)",
                  lineHeight: 2,
                  fontFamily: "inherit",
                }}
                placeholder="请输入剧本正文…"
                autoFocus
              />
            ) : activeChapter.content ? (
              <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(255,255,255,0.8)", lineHeight: 2 }}>
                {activeChapter.content}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20" style={{ color: "rgba(255,255,255,0.2)" }}>
                <Image size={40} className="mb-4" />
                <p className="text-sm mb-4">暂无内容，点击「编辑」开始编写或「上传」导入剧本</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Right Panel ───────────────────────────────────────────────── */}
      {showSettings && (
        <div
          data-script-guide-target="linked-subjects"
          className="flex-shrink-0 flex flex-col overflow-hidden"
          style={{
            width: "280px",
            background: "#110E0A",
            borderLeft: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <GlobalSettings
            chapters={chapters}
            activeChapterId={activeChapterId}
            items={episodeItems}
            onUpdateItems={setEpisodeItems}
            subjects={MOCK_SUBJECTS}
            onNavigate={handleNavigate}
          />
        </div>
      )}

      <ScriptParseDialog
        open={showParseDialog}
        onClose={() => setShowParseDialog(false)}
        onConfirm={handleParseConfirm}
      />
      <SubjectExtractDialog
        open={showExtractDialog}
        onClose={() => setShowExtractDialog(false)}
        onConfirm={handleExtractSubjects}
        chapterTitle={activeChapter.title}
        chapterCount={chapters.length}
        totalWords={chapters.reduce((sum, chapter) => sum + chapter.content.length, 0)}
        cost={extractCost}
      />
      {showScriptGuide && currentScriptGuideStep && (
        <ScriptModuleGuide
          step={scriptGuideStep}
          total={SCRIPT_GUIDE_STEPS.length}
          current={currentScriptGuideStep}
          onPrev={() => {
            if (scriptGuideStep === 0) {
              closeScriptGuide();
              navigate(`/project/${id}?guide=1&guideStep=last`);
              return;
            }
            setScriptGuideStep((value) => Math.max(0, value - 1));
          }}
          onNext={() => {
            if (scriptGuideStep === SCRIPT_GUIDE_STEPS.length - 1) {
              closeScriptGuide();
              navigate(`/project/${id}/subjects?guide=1`);
              return;
            }
            setScriptGuideStep((value) => Math.min(SCRIPT_GUIDE_STEPS.length - 1, value + 1));
          }}
          onClose={closeScriptGuide}
        />
      )}
    </div>
  );
}
