import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, ArrowUp, Check, ChevronDown, Clapperboard, Copy, Download, Heart, Image as ImageIcon,
  Folder, ImagePlus, Layers, LayoutGrid, List, Maximize2, Mic2, MonitorPlay, Play, Plus, RotateCcw, Search,
  SlidersHorizontal, Sparkles, Square, Trash2, Wand2, X,
} from "lucide-react";
import { toast } from "sonner";

type PresetType = "image" | "video";
type ReferenceAsset = {
  name: string;
  type: "image" | "video";
  image: string;
};
type MyAssetFolder = {
  name: string;
  cover: string;
  assets: { name: string; image: string }[];
  children?: MyAssetFolder[];
};

interface InspirationPreset {
  id: string;
  title: string;
  categoryKey: string;
  categoryTitle: string;
  resultType: PresetType;
  image: string;
  prompt: string;
}

const ENTRY_CARDS = [
  {
    title: "创建项目",
    desc: "还原影视化创作流程",
    path: "/projects",
    image: "https://aigc.mgtv.com/assets/project-C6cxQ_9M.png",
  },
  {
    title: "2D画布",
    desc: "精准控制画面内容",
    path: "/canvas",
    image: "https://aigc.mgtv.com/assets/canvas2d-CFhB7aY7.png",
  },
  {
    title: "AI漫剧",
    desc: "开启分镜到成片的漫剧创作",
    path: "/generate",
    image: "https://aigc.mgtv.com/assets/comic-CJhfpKJu.png",
  },
];

const TOOL_CARDS = [
  { title: "生视频", icon: Mic2 },
  { title: "对口型", icon: Clapperboard },
  { title: "图片高清", icon: ImageIcon },
  { title: "视频超分", icon: MonitorPlay },
];

const PROMPT_CHIPS = ["图片生成", "Seedream 3.0", "1:1", "高清 2K"];

const GENERATION_TABS = ["图片生成", "视频生成", "音频生成"];

const GENERATION_PRESETS = [
  "电影感人物肖像，暖色逆光，浅景深，真实皮肤质感。",
  "古装长街雨夜，青石板反光，灯笼暖光，广角镜头。",
  "赛博城市霓虹街区，雨后地面反射，电影级构图。",
  "产品黑金棚拍，边缘光，高级商业广告质感。",
];

const RESULT_SLOTS = [
  { label: "1", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=680&h=680&fit=crop&q=90" },
  { label: "2", image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=680&h=680&fit=crop&q=90" },
  { label: "3", image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=680&h=680&fit=crop&q=90" },
  { label: "4", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=680&h=680&fit=crop&q=90" },
];

const GENERATE_ASSETS = [
  "https://images.unsplash.com/photo-1550853024-fae8cd4be47f?w=360&h=360&fit=crop&q=90",
  "/community-assets/modern-plate.png",
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=360&h=360&fit=crop&q=90",
  "/community-assets/ming-table.png",
  "/community-assets/song-chair.png",
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=360&h=360&fit=crop&q=90",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=360&h=360&fit=crop&q=90",
  "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=360&h=360&fit=crop&q=90",
];

const MY_ASSET_FOLDERS: MyAssetFolder[] = [
  {
    name: "角色参考",
    cover: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=360&h=360&fit=crop&q=90",
    assets: [
      { name: "女主定妆", image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=360&h=360&fit=crop&q=90" },
      { name: "少年侧脸", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=360&h=360&fit=crop&q=90" },
      { name: "战损造型", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=360&h=360&fit=crop&q=90" },
    ],
    children: [
      {
        name: "主角组",
        cover: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=360&h=360&fit=crop&q=90",
        assets: [{ name: "主角正面", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=360&h=360&fit=crop&q=90" }],
      },
    ],
  },
  {
    name: "场景草图",
    cover: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=360&h=360&fit=crop&q=90",
    assets: [
      { name: "山谷晨雾", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=360&h=360&fit=crop&q=90" },
      { name: "古城夜雨", image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=360&h=360&fit=crop&q=90" },
      { name: "宫殿内景", image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=360&h=360&fit=crop&q=90" },
    ],
    children: [
      {
        name: "室内",
        cover: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=360&h=360&fit=crop&q=90",
        assets: [{ name: "宫殿走廊", image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=360&h=360&fit=crop&q=90" }],
      },
      {
        name: "室外",
        cover: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=360&h=360&fit=crop&q=90",
        assets: [],
      },
    ],
  },
  {
    name: "道具合集",
    cover: "/community-assets/tang-box.png",
    assets: [
      { name: "唐纹妆奁", image: "/community-assets/tang-box.png" },
      { name: "青铜器", image: "/community-assets/qin-ware.png" },
      { name: "宫灯", image: "/community-assets/han-lamp.png" },
    ],
    children: [
      {
        name: "武器",
        cover: "/community-assets/qin-ware.png",
        assets: [{ name: "短剑", image: "/community-assets/qin-ware.png" }],
      },
    ],
  },
];

const COMPOSER_REFERENCE_ASSETS: ReferenceAsset[] = [
  {
    name: "图片1",
    type: "image",
    image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=120&h=120&fit=crop&q=90",
  },
  {
    name: "视频1",
    type: "video",
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=120&h=120&fit=crop&q=90",
  },
];

const COMMUNITY_ASSETS: Record<string, { name: string; dynasty: string; image: string }[]> = {
  "服装": [
    { name: "唐风襦裙", dynasty: "唐代", image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=360&h=360&fit=crop&q=90" },
    { name: "明制长衫", dynasty: "明清", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=360&h=360&fit=crop&q=90" },
    { name: "宋制披帛", dynasty: "宋代", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=360&h=360&fit=crop&q=90" },
    { name: "汉风深衣", dynasty: "秦汉", image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=360&h=360&fit=crop&q=90" },
  ],
  "道具": [
    { name: "青铜酒器", dynasty: "秦汉", image: "/community-assets/qin-ware.png" },
    { name: "唐纹妆奁", dynasty: "唐代", image: "/community-assets/tang-box.png" },
    { name: "宫灯", dynasty: "宋代", image: "/community-assets/han-lamp.png" },
    { name: "折扇", dynasty: "明清", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=360&h=360&fit=crop&q=90" },
  ],
  "配饰": [
    { name: "金步摇", dynasty: "唐代", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=360&h=360&fit=crop&q=90" },
    { name: "玉佩", dynasty: "秦汉", image: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=360&h=360&fit=crop&q=90" },
    { name: "发簪", dynasty: "宋代", image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=360&h=360&fit=crop&q=90" },
    { name: "珠钗", dynasty: "明清", image: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=360&h=360&fit=crop&q=90" },
  ],
};

const GENERATE_FEED = [
  {
    id: "feed-1",
    title: "文生视频",
    time: "2024-11-07 16:48:45",
    prompt:
      "教练言边样比留那品难研而人近对，化事似，的不电，子云如持合化国。教练言边样比留那品难研而人近对，化事似，的不电，子云如持合化国。教练言边样比留那品难研而人近对，化事似，的不电，子云如持合化国。",
    outputs: [
      "https://images.unsplash.com/photo-1604076913837-52ab5629fba9?w=720&h=400&fit=crop&q=90",
      "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=720&h=400&fit=crop&q=90",
      "https://images.unsplash.com/photo-1557683316-973673baf926?w=720&h=400&fit=crop&q=90",
    ],
  },
  {
    id: "feed-2",
    title: "文生视频",
    time: "2024-11-07 16:48:45",
    prompt:
      "教练言边样比留那品难研而人近对，化事似，的不电，子云如持合化国。教练言边样比留那品难研而人近对，化事似，的不电，子云如持合化国。",
    outputs: [
      "https://images.unsplash.com/photo-1604076913837-52ab5629fba9?w=720&h=400&fit=crop&q=90",
      "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=720&h=400&fit=crop&q=90",
      "https://images.unsplash.com/photo-1557683316-973673baf926?w=720&h=400&fit=crop&q=90",
    ],
  },
  {
    id: "feed-3",
    title: "文生视频",
    time: "2024-11-07 16:48:45",
    prompt:
      "教练言边样比留那品难研而人近对，化事似，的不电，子云如持合化国。教练言边样比留那品难研而人近对，化事似，的不电。",
    outputs: [
      "https://images.unsplash.com/photo-1604076913837-52ab5629fba9?w=720&h=400&fit=crop&q=90",
      "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=720&h=400&fit=crop&q=90",
      "https://images.unsplash.com/photo-1557683316-973673baf926?w=720&h=400&fit=crop&q=90",
    ],
  },
];

export const INSPIRATION_PRESETS: InspirationPreset[] = [
  {
    id: "cinema-portrait",
    title: "电影感人物肖像",
    categoryKey: "image",
    categoryTitle: "生图",
    resultType: "image",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=760&h=430&fit=crop&q=90",
    prompt: "电影感人物肖像，低饱和暖光，浅景深，胶片颗粒，精致服化道。",
  },
  {
    id: "ancient-street",
    title: "古城雨夜长街",
    categoryKey: "image",
    categoryTitle: "生图",
    resultType: "image",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=760&h=430&fit=crop&q=90",
    prompt: "古城雨夜长街，青石板反光，灯笼暖光，电影级构图。",
  },
  {
    id: "fantasy-cloud",
    title: "云海仙山远景",
    categoryKey: "image",
    categoryTitle: "生图",
    resultType: "image",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=760&h=430&fit=crop&q=90",
    prompt: "云海仙山远景，晨雾，巨幅山体，东方奇幻，美术概念图。",
  },
  {
    id: "cyber-alley",
    title: "赛博霓虹街区",
    categoryKey: "image",
    categoryTitle: "生图",
    resultType: "image",
    image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=760&h=430&fit=crop&q=90",
    prompt: "赛博霓虹街区，雨后反射，未来城市，电影镜头语言。",
  },
  {
    id: "storyboard-action",
    title: "动作分镜推演",
    categoryKey: "video",
    categoryTitle: "视频",
    resultType: "video",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=760&h=430&fit=crop&q=90",
    prompt: "动作分镜推演，快速横移镜头，角色从暗处冲出，紧张节奏。",
  },
  {
    id: "food-commercial",
    title: "质感美食广告",
    categoryKey: "image",
    categoryTitle: "生图",
    resultType: "image",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=760&h=430&fit=crop&q=90",
    prompt: "质感美食广告，柔和顶光，水汽与高光，商业摄影。",
  },
  {
    id: "space-opera",
    title: "太空歌剧场景",
    categoryKey: "video",
    categoryTitle: "视频",
    resultType: "video",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=760&h=430&fit=crop&q=90",
    prompt: "太空歌剧场景，巨型飞船掠过星球，史诗感推进镜头。",
  },
  {
    id: "product-light",
    title: "产品光影棚拍",
    categoryKey: "image",
    categoryTitle: "生图",
    resultType: "image",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=760&h=430&fit=crop&q=90",
    prompt: "产品光影棚拍，黑色背景，金属边缘光，高级商业质感。",
  },
  {
    id: "manga-cut",
    title: "漫剧转场镜头",
    categoryKey: "comic",
    categoryTitle: "AI漫剧",
    resultType: "video",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=760&h=430&fit=crop&q=90",
    prompt: "漫剧转场镜头，速度线，情绪特写，镜头轻微推进。",
  },
  {
    id: "palace-prop",
    title: "宫廷道具设定",
    categoryKey: "image",
    categoryTitle: "生图",
    resultType: "image",
    image: "/community-assets/tang-box.png",
    prompt: "宫廷道具设定，螺钿首饰盒，唐代纹样，细节丰富。",
  },
  {
    id: "music-stage",
    title: "舞台灯光大片",
    categoryKey: "video",
    categoryTitle: "视频",
    resultType: "video",
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=760&h=430&fit=crop&q=90",
    prompt: "舞台灯光大片，逆光剪影，烟雾与追光，慢速推近。",
  },
  {
    id: "documentary",
    title: "纪录片自然空镜",
    categoryKey: "video",
    categoryTitle: "视频",
    resultType: "video",
    image: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=760&h=430&fit=crop&q=90",
    prompt: "纪录片自然空镜，山谷云雾流动，写实摄影，稳定航拍。",
  },
  {
    id: "character-sheet",
    title: "角色三视图设定",
    categoryKey: "image",
    categoryTitle: "生图",
    resultType: "image",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=760&h=430&fit=crop&q=90",
    prompt: "角色三视图设定，正面侧面背面，服装细节清晰，概念设计。",
  },
  {
    id: "ink-landscape",
    title: "水墨山水动画",
    categoryKey: "comic",
    categoryTitle: "AI漫剧",
    resultType: "video",
    image: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=760&h=430&fit=crop&q=90",
    prompt: "水墨山水动画，墨色晕染，纸张纹理，东方诗意镜头。",
  },
  {
    id: "modern-office",
    title: "现代办公宣传片",
    categoryKey: "video",
    categoryTitle: "视频",
    resultType: "video",
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=760&h=430&fit=crop&q=90",
    prompt: "现代办公宣传片，明亮空间，人物协作，平滑滑轨镜头。",
  },
  {
    id: "creature-design",
    title: "幻想生物概念",
    categoryKey: "image",
    categoryTitle: "生图",
    resultType: "image",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=760&h=430&fit=crop&q=90",
    prompt: "幻想生物概念，鳞片与羽毛细节，戏剧化光影，游戏美术。",
  },
];

const CATEGORY_TABS = [
  { key: "all", value: "全部", query: "" },
  ...Array.from(new Map(INSPIRATION_PRESETS.map((item) => [item.categoryKey, {
    key: item.categoryKey,
    value: item.categoryTitle,
    query: item.categoryKey,
  }])).values()),
];

function SectionHeader({
  title,
  description,
  actionText,
  onAction,
}: {
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}) {
  return (
    <header className="flex min-h-[52px] items-end justify-between">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles size={26} style={{ color: "#ff6b00" }} />
          <h2 className="m-0 text-xl font-semibold leading-none text-[#f5f7ff]">{title}</h2>
        </div>
        {description && (
          <p className="mt-2 text-sm leading-5 text-[#e6e9ffa6]">{description}</p>
        )}
      </div>
      {actionText && (
        <button
          type="button"
          onClick={onAction}
          className="text-sm leading-5 transition-colors hover:text-white"
          style={{ color: "rgba(230,233,255,0.72)" }}
        >
          {actionText}
        </button>
      )}
    </header>
  );
}

function InspirationCard({ item, onSelect }: { item: InspirationPreset; onSelect: (item: InspirationPreset) => void }) {
  return (
    <button
      type="button"
      className="group relative aspect-video w-full overflow-hidden rounded-xl text-left"
      onClick={() => onSelect(item)}
      style={{ isolation: "isolate", background: "rgba(255,255,255,0.06)" }}
    >
      <img
        src={item.image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/45" />
      <div className="absolute bottom-0 left-0 right-0 z-[1] flex items-center justify-between px-4 py-3">
        <span className="truncate text-sm font-normal text-white" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.15)" }}>
          {item.title}
        </span>
        {item.resultType === "video" && (
          <span className="ml-2 rounded bg-black/45 px-1.5 py-0.5 text-[10px] text-white/78">视频</span>
        )}
      </div>
    </button>
  );
}

export function PromptBar({ className = "" }: { className?: string }) {
  const [prompt, setPrompt] = useState("");

  return (
    <div
      className={`mx-auto w-full max-w-[1000px] ${className}`}
      style={{
        ["--prompt-glow" as string]: "rgba(255,156,82,0.2)",
      }}
    >
      <div
        className="relative flex min-h-[244px] flex-col overflow-hidden rounded-[32px] px-5 pb-4 pt-5"
        style={{
          border: "1px solid rgba(255,232,214,0.42)",
          background:
            "linear-gradient(180deg, rgba(255,236,218,0.14), rgba(255,236,218,0) 19%), linear-gradient(112deg, rgba(12,12,18,0.76), rgba(8,8,12,0.82) 42%, rgba(3,3,8,0.78))",
          backdropFilter: "blur(52px) saturate(158%)",
          WebkitBackdropFilter: "blur(52px) saturate(158%)",
          boxShadow:
            "inset 0 1px rgba(255,248,238,0.88), inset 0 2px 14px rgba(255,255,255,0.24), inset 0 12px 34px rgba(255,156,82,0.2), inset 0 0 0 1px rgba(255,241,226,0.14), 0 0 14px rgba(0,0,0,0.18)",
          isolation: "isolate",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 z-0 rounded-[inherit]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,238,224,0.62), rgba(255,226,206,0.26) 3%, rgba(255,226,206,0.08) 10%, rgba(255,226,206,0) 28%), radial-gradient(88% 62% at 0% -2%, rgba(255,168,92,0.5), rgba(255,144,64,0.2) 34%, rgba(255,132,52,0) 62%), radial-gradient(44% 28% at 46% -4%, rgba(255,220,194,0.28), rgba(255,220,194,0) 72%)",
          }}
        />

        <div className="relative z-[1] mb-3 flex min-h-16 items-start gap-2">
          <button
            type="button"
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-white/14 bg-white/[0.06] text-white/48 transition-colors hover:border-white/28 hover:text-white/70"
            aria-label="添加参考图"
          >
            <Plus size={22} />
          </button>
          <div className="flex min-w-0 gap-2 overflow-hidden">
            {["参考图", "角色图", "场景图"].map((item, index) => (
              <div
                key={item}
                className="flex h-16 w-16 shrink-0 items-end overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] p-1 text-[10px] text-white/42"
                style={{
                  background:
                    index === 0
                      ? "linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02))"
                      : "linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.12), rgba(255,255,255,0.06))",
                }}
              >
                {item}
              </div>
            ))}
          </div>
          {prompt.trim() && (
            <button
              type="button"
              onClick={() => setPrompt("")}
              className="ml-auto flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-md text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="清空"
            >
              <X size={17} />
            </button>
          )}
          <button
            type="button"
            className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-md text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="最大化"
          >
            <Maximize2 size={16} />
          </button>
        </div>

        <div className="relative z-[1] mb-4 min-h-[108px]">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="h-[108px] w-full resize-none bg-transparent text-sm leading-6 text-white/90 outline-none placeholder:text-white/34"
            style={{ caretColor: "#ff7a2a" }}
            placeholder="开始你的创作..."
          />
        </div>

        <div className="relative z-[1] flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto">
            {PROMPT_CHIPS.map((chip, index) => (
              <button
                key={chip}
                type="button"
                className="inline-flex h-[30px] shrink-0 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.08] px-3 text-xs text-white/76 transition-colors hover:bg-white/[0.13]"
              >
                {index === 0 && <Wand2 size={13} style={{ color: "#ff7a2a" }} />}
                {chip}
                {index < 2 && <ChevronDown size={12} className="text-white/42" />}
              </button>
            ))}
            <button
              type="button"
              className="inline-flex h-[30px] shrink-0 items-center gap-1 rounded-lg border border-[#ff5f0073] bg-[#ff5f001f] px-3 text-xs text-[#ffede2eb] transition-colors hover:bg-[#ff5f0033]"
            >
              镜头设计
            </button>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="inline-flex items-center gap-1 text-xs text-white/70">
              <Sparkles size={14} style={{ color: "#ff9c61" }} />
              5
            </span>
            <button
              type="button"
              onClick={() => toast.success(prompt.trim() ? "已加入生成队列" : "请输入创作描述")}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-[#f8a56d] transition-transform hover:-translate-y-px"
              style={{
                background:
                  "radial-gradient(95% 95% at 20% 10%, rgba(255,156,97,0.28), rgba(255,156,97,0.02) 48%, rgba(255,156,97,0) 70%), #1a0c05",
                boxShadow: "inset -2px 4px 8px rgba(240,165,128,0.6), 0 6px 12px rgba(0,0,0,0.26)",
              }}
              aria-label="生成"
            >
              <ArrowUp size={19} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuickEntrySection() {
  const navigate = useNavigate();

  return (
    <section className="grid items-start gap-3 min-[1201px]:grid-cols-4 max-[1200px]:grid-cols-2 max-[768px]:grid-cols-1">
      {ENTRY_CARDS.map((item) => (
        <button
          key={item.title}
          type="button"
          onClick={() => navigate(item.path)}
          className="group relative h-[124px] overflow-hidden rounded-2xl text-left transition-transform hover:-translate-y-0.5"
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            background: "linear-gradient(101deg, rgba(32,25,24,0.98), rgba(16,17,23,0.96))",
          }}
        >
          <div
            className="absolute inset-y-0 right-0 w-full opacity-95 transition-transform duration-500 group-hover:scale-[1.03]"
            style={{
              backgroundImage: `url(${item.image})`,
              backgroundSize: "cover",
              backgroundPosition: "right center",
              backgroundRepeat: "no-repeat",
              WebkitMaskImage: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.18) 28%, #000 58%)",
              maskImage: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.18) 28%, #000 58%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#15100f] via-[#15100fd6] to-transparent" />
          <div className="absolute bottom-6 left-6 max-w-[60%]">
            <h3 className="m-0 text-xl font-semibold leading-tight text-white">{item.title}</h3>
            <p className="mt-1.5 text-[13px] leading-5 text-white/70">{item.desc}</p>
          </div>
        </button>
      ))}
      <div className="grid grid-cols-2 gap-3 max-[768px]:grid-cols-1">
        {TOOL_CARDS.map(({ title, icon: Icon }) => (
          <button
            key={title}
            type="button"
            onClick={() => toast.success(`${title}已打开`)}
            className="flex h-14 w-full min-w-0 items-center gap-3 rounded-xl p-2 text-left transition-colors hover:-translate-y-px hover:bg-white/[0.12]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(255,95,0,0.14)", color: "#ff7a2a" }}>
              <Icon size={17} />
            </span>
            <span className="min-w-0 truncate text-[15px] font-medium text-white/86">{title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function InspirationSection() {
  const navigate = useNavigate();
  const visibleItems = INSPIRATION_PRESETS.slice(0, 12);

  return (
    <section>
      <SectionHeader
        title="灵感探索"
        description="做同款，释放无限创造力"
        actionText="查看全部"
        onAction={() => navigate("/inspiration")}
      />
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {visibleItems.map((item) => (
          <InspirationCard
            key={item.id}
            item={item}
            onSelect={(preset) => toast.success(`已套用「${preset.title}」`)}
          />
        ))}
      </div>
    </section>
  );
}

export function RecommendationSection() {
  const items = [
    {
      title: "影视级人物设定",
      desc: "从角色氛围、妆造到镜头质感生成一组可用概念图",
      image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&h=480&fit=crop&q=90",
    },
    {
      title: "场景美术参考",
      desc: "快速生成古装、科幻、现实题材的空间视觉方案",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=900&h=480&fit=crop&q=90",
    },
    {
      title: "视频镜头提案",
      desc: "用短提示词搭出镜头运动、节奏与画面气氛",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=900&h=480&fit=crop&q=90",
    },
  ];

  return (
    <section>
      <SectionHeader title="推荐工作流" description="从灵感到生成，快速推进创作" />
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className="overflow-hidden rounded-xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="aspect-[16/8] overflow-hidden">
              <img src={item.image} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="px-4 py-3">
              <h3 className="m-0 text-sm font-semibold text-white">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-5 text-white/50">{item.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function GenerateModeTabs() {
  const [active, setActive] = useState(GENERATION_TABS[0]);

  return (
    <div className="flex items-center justify-center gap-2">
      {GENERATION_TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => setActive(tab)}
          className="h-9 rounded-full px-4 text-sm transition-colors"
          style={{
            background: active === tab ? "rgba(255,95,0,0.18)" : "rgba(255,255,255,0.06)",
            border: active === tab ? "1px solid rgba(255,95,0,0.42)" : "1px solid rgba(255,255,255,0.08)",
            color: active === tab ? "#ff8a3d" : "rgba(255,255,255,0.68)",
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function GenerateToolbar() {
  return (
    <aside
      className="hidden w-[268px] shrink-0 flex-col rounded-2xl p-4 xl:flex"
      style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="m-0 text-sm font-semibold text-white/90">生成参数</h2>
        <button type="button" className="flex h-7 w-7 items-center justify-center rounded-md text-white/46 hover:bg-white/10 hover:text-white">
          <RotateCcw size={15} />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {[
          { label: "模型", value: "Seedream 3.0" },
          { label: "比例", value: "1:1" },
          { label: "清晰度", value: "高清 2K" },
          { label: "数量", value: "4 张" },
        ].map((item) => (
          <label key={item.label} className="flex flex-col gap-2">
            <span className="text-xs text-white/42">{item.label}</span>
            <button
              type="button"
              className="flex h-10 items-center justify-between rounded-lg border border-white/8 bg-white/[0.06] px-3 text-left text-xs text-white/78"
            >
              {item.value}
              <ChevronDown size={13} className="text-white/34" />
            </button>
          </label>
        ))}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-white/42">参考内容</span>
            <span className="text-[11px] text-white/30">0/8</span>
          </div>
          <button
            type="button"
            className="flex h-[74px] w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/14 bg-white/[0.04] text-xs text-white/42 transition-colors hover:border-white/28 hover:text-white/65"
          >
            <ImagePlus size={19} />
            上传参考图
          </button>
        </div>
      </div>
    </aside>
  );
}

function ResultGrid() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
      {RESULT_SLOTS.map((item) => (
        <button
          key={item.label}
          type="button"
          className="group relative aspect-square overflow-hidden rounded-2xl text-left"
          style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <img src={item.image} alt="" className="h-full w-full object-cover opacity-82 transition-transform duration-300 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/52 opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 transition-opacity group-hover:opacity-100">
            <span className="rounded-full bg-black/42 px-2.5 py-1 text-xs text-white/80">结果 {item.label}</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/16 text-white">
              <Check size={15} />
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

function PromptPresetStrip() {
  return (
    <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
      {GENERATION_PRESETS.map((preset) => (
        <button
          key={preset}
          type="button"
          onClick={() => toast.success("已套用提示词")}
          className="h-9 shrink-0 rounded-full border border-white/8 bg-white/[0.06] px-3 text-xs text-white/60 transition-colors hover:bg-white/[0.1] hover:text-white/84"
        >
          {preset}
        </button>
      ))}
    </div>
  );
}

function BlueFolderIcon({ className = "" }: { className?: string }) {
  return (
    <span className={`relative block ${className}`}>
      <span className="absolute left-[6%] top-[10%] h-[28%] w-[43%] rounded-t-md bg-[#2f9df0]" />
      <span className="absolute inset-x-0 bottom-0 h-[76%] rounded-md bg-[#63b7f4]" />
    </span>
  );
}

function findMyAssetFolder(folders: MyAssetFolder[], name: string | null): MyAssetFolder | null {
  if (!name) return null;
  for (const folder of folders) {
    if (folder.name === name) return folder;
    const child = findMyAssetFolder(folder.children ?? [], name);
    if (child) return child;
  }
  return null;
}

function findMyAssetFolderParentName(folders: MyAssetFolder[], name: string | null, parentName: string | null = null): string | null {
  if (!name) return null;
  for (const folder of folders) {
    if (folder.name === name) return parentName;
    const childParentName = findMyAssetFolderParentName(folder.children ?? [], name, folder.name);
    if (childParentName !== null) return childParentName;
  }
  return null;
}

function countFolderAssets(folder: MyAssetFolder): number {
  return folder.assets.length + (folder.children ?? []).reduce((sum, child) => sum + countFolderAssets(child), 0);
}

function ReferenceMentionMenu({
  currentFolder,
  expandedMore,
  menuRef,
  onEnterFolder,
  onExpandMore,
  onExitFolder,
  onSelectFolderReference,
  onSelectReference,
  references,
  style,
}: {
  currentFolder: string | null;
  expandedMore: boolean;
  menuRef: React.RefObject<HTMLDivElement>;
  onEnterFolder: (folderName: string) => void;
  onExpandMore: () => void;
  onExitFolder: () => void;
  onSelectFolderReference: (asset: ReferenceAsset) => void;
  onSelectReference: (asset: ReferenceAsset) => void;
  references: ReferenceAsset[];
  style: React.CSSProperties;
}) {
  const folderReferences: ReferenceAsset[] = [
    {
      name: `${currentFolder ?? "文件夹"}图片1`,
      type: "image",
      image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=80&h=80&fit=crop&q=90",
    },
    {
      name: `${currentFolder ?? "文件夹"}视频1`,
      type: "video",
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=80&h=80&fit=crop&q=90",
    },
  ];
  const folderRows = [
    { section: "我的资产", rows: ["收藏", "生成", "上传"] },
    { section: "社区资产", rows: ["服装", "配饰", "道具", ...(expandedMore ? ["镜头", "服装", "配饰"] : [])], more: null },
  ];
  const visibleReferences = currentFolder ? folderReferences : references;

  if (currentFolder) {
    return (
      <div
        ref={menuRef}
        className="fixed z-50 w-[280px] overflow-hidden rounded-[14px] p-0.5"
        style={{
          ...style,
          background: "rgba(47,47,47,0.98)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 18px 46px rgba(0,0,0,0.52)",
        }}
      >
        <div className="min-h-[300px] max-h-[min(520px,calc(100vh-32px))] overflow-y-auto p-2">
          <div className="mb-4 flex h-10 items-center gap-2 rounded-xl px-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <Search size={17} style={{ color: "rgba(255,255,255,0.48)" }} />
            <input className="min-w-0 flex-1 bg-transparent text-base font-medium text-white outline-none placeholder:text-white/42" placeholder="搜索" />
          </div>
          <button type="button" onClick={onExitFolder} className="mb-4 flex h-9 items-center gap-3 px-2 text-left">
            <ChevronDown size={19} className="rotate-90 text-white/55" />
            <span className="text-xl font-semibold text-white/88">{currentFolder}</span>
          </button>
          <div className="border-t pt-1" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            {visibleReferences.map((item, index) => (
              <button
                key={item.name}
                type="button"
                onClick={() => onSelectFolderReference(item)}
                className="flex h-[58px] w-full items-center gap-3 rounded-lg px-2 text-left transition-colors hover:bg-white/[0.08]"
                style={{ background: index === 0 ? "rgba(255,255,255,0.12)" : "transparent" }}
              >
                <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-md" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.18)" }}>
                  <img src={item.image} alt="" className="h-full w-full object-cover" />
                  {item.type === "video" && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/28">
                      <Play size={12} fill="white" className="text-white" />
                    </span>
                  )}
                </span>
                <span className="flex-1 text-base font-semibold text-white/86">{index === 0 ? "01.jpg" : item.name}</span>
                <ImageIcon size={16} className="text-white/42" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-[280px] overflow-hidden rounded-[14px] p-0.5"
      style={{
        ...style,
        background: "rgba(47,47,47,0.98)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 18px 46px rgba(0,0,0,0.52)",
      }}
    >
      <div className="max-h-[min(520px,calc(100vh-32px))] overflow-y-auto p-2">
        <div className="mb-3 flex h-10 items-center gap-2 rounded-xl px-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <Search size={17} style={{ color: "rgba(255,255,255,0.48)" }} />
          <input className="min-w-0 flex-1 bg-transparent text-base font-medium text-white outline-none placeholder:text-white/42" placeholder="搜索" />
        </div>

        <div className="px-2 pb-1 text-xs font-semibold text-white/42">{currentFolder ? currentFolder : "添加参考"}</div>
        <div className="mb-3 space-y-1">
          {visibleReferences.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => onSelectReference(item)}
              className="flex h-11 w-full items-center gap-3 rounded-xl px-2 text-left transition-colors hover:bg-white/[0.04]"
            >
              <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg" style={{ background: "#111", border: "1px solid rgba(255,255,255,0.2)" }}>
                <img src={item.image} alt="" className="h-full w-full object-cover" />
                {item.type === "video" && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/28">
                    <Play size={12} fill="white" className="text-white" />
                  </span>
                )}
              </span>
              <span className="flex-1 text-base font-semibold text-white/88">{item.name}</span>
              <ImageIcon size={16} className="text-white/42" />
            </button>
          ))}
        </div>

        {folderRows.map((group, groupIndex) => (
          <div key={group.section} className={groupIndex === 0 ? "border-t pt-3" : "border-t pt-3"} style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <div className="px-2 pb-2 text-xs font-semibold text-white/42">{group.section}</div>
            <div className="space-y-1">
              {group.rows.map((row) => (
                <button
                  key={`${group.section}-${row}`}
                  type="button"
                  onClick={() => onEnterFolder(row)}
                  className="flex h-10 w-full items-center gap-3 rounded-xl px-2 text-left transition-colors hover:bg-white/[0.04]"
                >
                  <Folder size={24} fill="rgba(255,255,255,0.72)" strokeWidth={0} className="text-white/70" />
                  <span className="flex-1 text-base font-semibold text-white/88">{row}</span>
                  <ChevronDown size={16} className="-rotate-90 text-white/36" />
                </button>
              ))}
            </div>
            {group.more && (
              <button
                type="button"
                onClick={onExpandMore}
                className="mt-2 flex h-9 w-full items-center rounded-lg px-4 text-left text-sm font-semibold text-white/40"
                style={{ background: expandedMore ? "rgba(232,115,34,0.12)" : "rgba(255,255,255,0.1)", color: expandedMore ? "#ff9a5c" : "rgba(255,255,255,0.4)" }}
              >
                ...  {expandedMore ? "收起" : group.more}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function PersonalGeneratePage() {
  const [promptText, setPromptText] = useState("");
  const [showReferenceMenu, setShowReferenceMenu] = useState(false);
  const [referenceMenuPosition, setReferenceMenuPosition] = useState({ left: 24, top: 120 });
  const [composerReferences, setComposerReferences] = useState<ReferenceAsset[]>(COMPOSER_REFERENCE_ASSETS);
  const [referenceTags, setReferenceTags] = useState<ReferenceAsset[]>([]);
  const [referenceFolder, setReferenceFolder] = useState<string | null>(null);
  const [referenceExpandedMore, setReferenceExpandedMore] = useState(false);
  const composerRef = useRef<HTMLDivElement>(null);
  const mentionMenuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [assetScope, setAssetScope] = useState<"mine" | "community">("mine");
  const [assetCategory, setAssetCategory] = useState("生成");
  const [assetFilter, setAssetFilter] = useState("图片");
  const [showAssetFilterMenu, setShowAssetFilterMenu] = useState(false);
  const [myAssetFolder, setMyAssetFolder] = useState<string | null>(null);
  const [myAssetViewMode, setMyAssetViewMode] = useState<"grid" | "list">("grid");
  const assetFilterRef = useRef<HTMLDivElement>(null);
  const scopeTabs = [
    { key: "mine" as const, label: "个人" },
    { key: "community" as const, label: "社区" },
  ];
  const categoryTabs = assetScope === "community" ? ["服装", "道具", "配饰"] : ["生成", "上传", "收藏"];
  const filterTabs = assetScope === "community" ? ["全部朝代", "秦汉", "唐代", "宋代", "明清"] : ["图片", "视频", "音频"];
  const visibleSidebarAssets = assetScope === "community"
    ? (COMMUNITY_ASSETS[assetCategory] ?? []).filter((asset) => assetFilter === "朝代" || asset.dynasty === assetFilter)
    : GENERATE_ASSETS.map((image, index) => ({ name: ["图片", "视频", "音频"][index % 3], dynasty: "", image }));
  const currentMyAssetFolder = findMyAssetFolder(MY_ASSET_FOLDERS, myAssetFolder);
  const currentMineFolders = currentMyAssetFolder ? (currentMyAssetFolder.children ?? []) : MY_ASSET_FOLDERS;
  const currentMineAssets = currentMyAssetFolder?.assets ?? [];
  const currentMyAssetParentName = findMyAssetFolderParentName(MY_ASSET_FOLDERS, myAssetFolder);
  const returnToParentMyFolder = () => {
    setMyAssetFolder(currentMyAssetParentName);
  };

  useEffect(() => {
    if (!showReferenceMenu) return;
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (mentionMenuRef.current?.contains(target)) return;
      if (composerRef.current?.contains(target)) return;
      setShowReferenceMenu(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [showReferenceMenu]);

  useEffect(() => {
    if (!showAssetFilterMenu) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (assetFilterRef.current?.contains(event.target as Node)) return;
      setShowAssetFilterMenu(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [showAssetFilterMenu]);

  const openReferenceMenuFromButton = (event: React.MouseEvent<HTMLButtonElement>) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    setReferenceFolder(null);
    setReferenceMenuPosition({
      left: Math.min(Math.max(buttonRect.right - 280, 12), window.innerWidth - 292),
      top: Math.max(buttonRect.top - 536, 12),
    });
    setShowReferenceMenu((value) => !value);
  };

  const openReferenceMenuFromTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setShowReferenceMenu(true);
      return;
    }
    const textareaRect = textarea.getBoundingClientRect();
    setReferenceFolder(null);
    const caretIndex = textarea.selectionStart ?? 0;
    const lineHeight = 24;
    const fontSize = 14;
    const textBeforeCaret = textarea.value.slice(0, caretIndex);
    const lines = textBeforeCaret.split("\n");
    const currentLine = lines[lines.length - 1] ?? "";
    const caretLeft = Math.min(currentLine.length * fontSize * 0.56, textarea.clientWidth - 24);
    const caretTop = Math.min((lines.length - 1) * lineHeight, textarea.clientHeight - 24);
    setReferenceMenuPosition({
      left: Math.min(Math.max(textareaRect.left + caretLeft, 12), window.innerWidth - 292),
      top: Math.min(Math.max(textareaRect.top + caretTop + 28, 12), window.innerHeight - 532),
    });
    setShowReferenceMenu(true);
  };

  const selectReferenceAsset = (asset: ReferenceAsset) => {
    setReferenceTags((current) => [...current, asset]);
    setPromptText((current) => current.replace(/@$/, ""));
    setShowReferenceMenu(false);
  };

  const selectFolderReferenceAsset = (asset: ReferenceAsset) => {
    setComposerReferences((current) => {
      if (current.some((item) => item.name === asset.name)) return current;
      return [...current, asset];
    });
    selectReferenceAsset(asset);
  };

  return (
    <div className="relative flex h-full w-full overflow-hidden" style={{ background: "#030201" }}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_34%_50%,rgba(231,100,34,0.36),rgba(43,18,8,0.38)_30%,rgba(0,0,0,0.94)_60%)]" />
      <aside
        className="relative z-10 hidden h-full w-[320px] shrink-0 flex-col border-r lg:flex"
        style={{ background: "rgba(38,25,17,0.88)", borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div className="flex h-[72px] shrink-0 items-center gap-3 border-b px-5" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          {[
            { label: "对话", icon: RotateCcw },
            { label: "资产", icon: Layers },
            { label: "虚拟IP", icon: Sparkles },
          ].map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className="flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm"
              style={{
                background: label === "资产" ? "rgba(255,255,255,0.1)" : "transparent",
                color: label === "资产" ? "#fff" : "rgba(255,255,255,0.45)",
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        <div className="shrink-0 px-5 pb-3 pt-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="grid flex-1 grid-cols-2 gap-1 rounded-xl p-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {scopeTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
		                  onClick={() => {
		                    setAssetScope(tab.key);
		                    setAssetCategory(tab.key === "community" ? "服装" : "生成");
		                    setAssetFilter(tab.key === "community" ? "朝代" : "图片");
		                    setMyAssetFolder(null);
		                    setShowAssetFilterMenu(false);
		                  }}
                  className="h-8 rounded-lg text-xs font-medium"
                  style={{
                    background: assetScope === tab.key ? "rgba(232,115,34,0.16)" : "transparent",
                    border: `1px solid ${assetScope === tab.key ? "rgba(232,115,34,0.28)" : "transparent"}`,
                    color: assetScope === tab.key ? "#ff8a3d" : "rgba(255,255,255,0.62)",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="grid flex-[1.35] grid-cols-3 gap-1 rounded-xl p-1" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              {categoryTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setAssetCategory(tab)}
                  className="h-8 rounded-lg text-xs"
                  style={{
                    background: assetCategory === tab ? "rgba(232,115,34,0.13)" : "transparent",
                    border: `1px solid ${assetCategory === tab ? "rgba(232,115,34,0.24)" : "transparent"}`,
                    color: assetCategory === tab ? "#ff8a3d" : "rgba(255,255,255,0.6)",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
	          <div className="flex gap-2">
	            <div className="flex h-9 flex-1 items-center gap-2 rounded-lg px-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
	              <Search size={14} className="text-white/36" />
	              <input className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/34" placeholder="搜索资产" />
	            </div>
	            <div ref={assetFilterRef} className="relative">
	              <button
	                type="button"
	                onClick={() => setShowAssetFilterMenu((value) => !value)}
	                className="inline-flex h-9 min-w-[58px] items-center justify-center gap-1 rounded-lg px-3 text-xs text-white/74"
	                style={{ background: showAssetFilterMenu ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
	              >
	                {assetFilter}
	                <ChevronDown size={12} className="text-white/34" />
	              </button>
	              {showAssetFilterMenu && (
	                <div
	                  className="absolute right-0 top-full z-30 mt-2 min-w-[92px] overflow-hidden rounded-xl p-1"
	                  style={{ background: "rgba(35,29,24,0.98)", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 14px 34px rgba(0,0,0,0.42)" }}
	                >
	                  {filterTabs.map((option) => {
	                    const selected = option === assetFilter || (assetScope === "community" && assetFilter === "朝代" && option === "全部朝代");
	                    return (
	                      <button
	                        key={option}
	                        type="button"
	                        onClick={() => {
	                          setAssetFilter(assetScope === "community" && option === "全部朝代" ? "朝代" : option);
	                          setShowAssetFilterMenu(false);
	                        }}
	                        className="block h-8 w-full rounded-lg px-3 text-left text-xs"
	                        style={{
	                          background: selected ? "rgba(232,115,34,0.14)" : "transparent",
	                          color: selected ? "#ff8a3d" : "rgba(255,255,255,0.68)",
	                        }}
	                      >
	                        {option}
	                      </button>
	                    );
	                  })}
	                </div>
	              )}
		            </div>
	          </div>
	          {assetScope === "mine" && (
	            <div className="mt-3 flex items-center justify-between gap-2">
	              <button
	                type="button"
	                onClick={returnToParentMyFolder}
	                className="flex min-w-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs"
	                style={{ color: myAssetFolder ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.36)" }}
	              >
	                {myAssetFolder && <ChevronDown size={13} className="rotate-90" />}
	                <span className="truncate">{myAssetFolder ?? "全部文件"}</span>
	              </button>
	              <div className="flex rounded-lg p-0.5" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
	                {[
	                  { key: "grid" as const, icon: LayoutGrid, label: "宫格" },
	                  { key: "list" as const, icon: List, label: "列表" },
	                ].map(({ key, icon: Icon, label }) => (
	                  <button
	                    key={key}
	                    type="button"
	                    onClick={() => setMyAssetViewMode(key)}
	                    className="flex h-7 w-7 items-center justify-center rounded-md"
	                    style={{ background: myAssetViewMode === key ? "rgba(232,115,34,0.16)" : "transparent", color: myAssetViewMode === key ? "#ff8a3d" : "rgba(255,255,255,0.5)" }}
	                    title={label}
	                  >
	                    <Icon size={14} />
	                  </button>
	                ))}
	              </div>
	            </div>
	          )}
	        </div>

	        <div className="min-h-0 flex-1 overflow-auto px-5 pb-8">
	          {assetScope === "mine" ? (
	            myAssetViewMode === "grid" ? (
	              <div className="grid grid-cols-2 gap-3">
	                {currentMineFolders.map((folder) => (
	                  <button
	                    key={`folder-${folder.name}`}
	                    type="button"
	                    onClick={() => setMyAssetFolder(folder.name)}
	                    className="group relative aspect-square overflow-hidden rounded-lg text-left"
	                    style={{ background: "#1c242a" }}
	                  >
	                    <div className="absolute right-2 top-2 z-[1] flex gap-1.5">
	                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 text-white/90">
	                        <span className="text-lg leading-none">...</span>
	                      </span>
	                    </div>
	                    <div className="flex h-full items-center justify-center">
	                      <BlueFolderIcon className="h-[68px] w-[88px] transition-transform duration-300 group-hover:scale-105" />
	                    </div>
	                    <div className="absolute inset-x-0 bottom-0 px-3 pb-3">
	                      <div className="truncate text-sm font-semibold text-white/92">{folder.name}</div>
	                      <div className="mt-1 text-xs text-white/54">{countFolderAssets(folder)} 张</div>
	                    </div>
	                  </button>
	                ))}
	                {currentMineAssets.map((asset) => (
	                  <button key={`asset-${asset.name}`} type="button" className="group relative aspect-square overflow-hidden rounded-lg bg-white/[0.04] text-left">
	                    <img src={asset.image} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
	                    <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded bg-black/44 text-white/70">
	                      <ImageIcon size={13} />
	                    </span>
	                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-8">
	                      <div className="truncate text-xs font-semibold text-white/90">{asset.name}</div>
	                    </div>
	                  </button>
	                ))}
	                {currentMineFolders.length === 0 && currentMineAssets.length === 0 && (
	                  <div className="col-span-2 rounded-xl border border-white/8 bg-white/[0.035] px-4 py-8 text-center text-sm font-medium text-white/38">
	                    该文件夹暂无素材
	                  </div>
	                )}
	              </div>
	            ) : (
	              <div className="space-y-2">
	                {currentMineFolders.length > 0 && (
	                  <div className="space-y-1">
	                    <div className="px-1 text-sm font-semibold text-white/42">文件夹</div>
	                    {currentMineFolders.map((folder) => (
	                      <div key={`folder-${folder.name}`} className="flex h-10 w-full items-center gap-2 text-left">
	                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-white/8">
	                          <ChevronDown size={15} className="-rotate-90 text-white/42" />
	                        </span>
	                        <button
	                          type="button"
	                          onClick={() => setMyAssetFolder(folder.name)}
	                          className="flex min-w-0 flex-1 items-center gap-3 text-left"
	                        >
	                          <Folder size={26} fill="rgba(255,255,255,0.72)" strokeWidth={0} className="shrink-0 text-white/72" />
	                          <span className="min-w-0 flex-1 truncate text-base font-semibold text-white/76">{folder.name}</span>
	                          <span className="shrink-0 text-xs font-semibold text-white/36">{countFolderAssets(folder)} 张</span>
	                        </button>
	                      </div>
	                    ))}
	                  </div>
	                )}
	                {currentMineAssets.length > 0 && (
	                  <div className={currentMineFolders.length > 0 ? "ml-[38px] border-l border-white/10 py-1 pl-4" : "space-y-1"}>
	                    {currentMineAssets.map((asset) => (
	                      <button key={`asset-${asset.name}`} type="button" className="flex h-8 w-full items-center gap-2 text-left">
	                        <img src={asset.image} alt="" className="h-6 w-6 rounded object-cover" />
	                        <span className="truncate text-sm font-semibold text-white/64">{asset.name}</span>
	                      </button>
	                    ))}
	                  </div>
	                )}
	                {currentMineFolders.length === 0 && currentMineAssets.length === 0 && (
	                  <div className="py-1 text-sm font-semibold text-white/32">
	                    该文件夹暂无素材
	                  </div>
	                )}
	              </div>
	            )
	          ) : (
	            <div className="grid grid-cols-2 gap-3">
	              {visibleSidebarAssets.map((asset) => (
	                <button key={`${asset.name}-${asset.image}`} type="button" className="group relative aspect-square overflow-hidden rounded-lg bg-white/[0.04] text-left">
	                  <img src={asset.image} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
	                  <span className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded bg-black/44 text-white/70">
	                    <ImageIcon size={13} />
	                  </span>
	                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/76 to-transparent px-2 pb-2 pt-8">
	                    <div className="truncate text-xs font-semibold text-white/90">{asset.name}</div>
	                    <div className="mt-1 inline-flex rounded bg-white/14 px-1.5 py-0.5 text-[10px] text-white/68">{asset.dynasty}</div>
	                  </div>
	                </button>
	              ))}
	            </div>
	          )}
	        </div>
      </aside>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <main className="min-h-0 flex-1 overflow-auto px-6 pb-[250px] pt-16 xl:px-24">
          <div className="mx-auto max-w-[1500px]">
            {GENERATE_FEED.map((item) => (
              <article key={item.id} className="border-b py-10" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="mb-4 flex items-start justify-between gap-8">
                  <div className="min-w-0">
                    <div className="mb-3 flex items-center gap-2">
                      <Sparkles size={20} style={{ color: "#ff6b00" }} />
                      <h2 className="m-0 text-xl font-semibold text-white/92">{item.title}</h2>
                    </div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      {[
                        { label: "图片高清", icon: ImageIcon },
                        { label: "4K" },
                        { label: "1:1", icon: Square },
                        { label: "参考图" },
                      ].map(({ label, icon: Icon }) => (
                        <span key={label} className="inline-flex h-8 items-center gap-1 rounded-lg px-3 text-sm text-white/76" style={{ background: "rgba(255,255,255,0.12)" }}>
                          {Icon && <Icon size={14} />}
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <time className="shrink-0 pt-1 text-sm text-white/24">{item.time}</time>
                </div>

                <p className="mb-4 max-w-[1480px] text-base leading-7 text-white/64">
                  {item.prompt}<button type="button" className="ml-1 text-[#ff6b00]">更多</button>
                </p>

                <div className="ml-auto grid max-w-[1120px] grid-cols-1 gap-3 md:grid-cols-3">
                  {item.outputs.map((image) => (
                    <button key={image} type="button" className="group relative aspect-[16/9] overflow-hidden rounded-lg bg-white/[0.04]">
                      <img src={image} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/48">
                  <button type="button" className="inline-flex items-center gap-1.5 hover:text-white/80"><Heart size={17} />喜欢</button>
                  <button type="button" className="inline-flex items-center gap-1.5 hover:text-white/80"><Copy size={16} />复制提示词</button>
                  <button type="button" className="inline-flex items-center gap-1.5 hover:text-white/80"><SlidersHorizontal size={16} />调整参数</button>
                  <button type="button" className="inline-flex items-center gap-1.5 hover:text-white/80"><RotateCcw size={16} />重新生成</button>
                  <button type="button" className="inline-flex items-center gap-1.5 hover:text-white/80"><Download size={16} />下载</button>
                  <button type="button" className="inline-flex items-center gap-1.5 hover:text-white/80"><Trash2 size={16} />删除</button>
                </div>
              </article>
            ))}
          </div>
        </main>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-5 pb-6">
          <div
            ref={composerRef}
            className="pointer-events-auto w-full max-w-[980px] rounded-[28px] p-5"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(22,13,10,0.92) 12%, rgba(5,4,7,0.96) 100%)",
              border: "1px solid rgba(255,255,255,0.24)",
              boxShadow: "0 30px 90px rgba(0,0,0,0.62), inset 0 1px 0 rgba(255,255,255,0.18)",
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
            }}
          >
	            <div className="flex flex-col gap-3">
	              <div className="flex items-start gap-3">
	                <button
	                  type="button"
	                  className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-xl text-white/72 transition-colors hover:bg-white/10"
	                  style={{ border: "1px solid rgba(255,255,255,0.24)", background: "rgba(255,255,255,0.04)" }}
	                  aria-label="添加参考图"
	                >
	                  <Plus size={30} />
	                </button>
	                <div className="flex min-w-0 flex-1 flex-wrap gap-3">
	                  {composerReferences.map((asset) => (
	                    <div key={asset.name} className="relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.18)" }}>
	                      <img src={asset.image} alt="" className="h-full w-full object-cover" />
	                      {asset.type === "video" && (
	                        <span className="absolute inset-0 flex items-center justify-center bg-black/25">
	                          <Play size={15} fill="white" className="text-white" />
	                        </span>
	                      )}
	                    </div>
	                  ))}
	                </div>
	              </div>
	              <div className="min-w-0">
	                <textarea
                  ref={textareaRef}
                  value={promptText}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setPromptText(nextValue);
                    if (nextValue.endsWith("@")) {
                      window.requestAnimationFrame(openReferenceMenuFromTextarea);
                    }
                  }}
                  maxLength={1000}
	                  className="h-[86px] w-full resize-none bg-transparent text-sm leading-6 text-white/88 outline-none placeholder:text-white/34"
	                  placeholder="开始你的创作..."
	                  style={{ caretColor: "#ff7a2a" }}
	                />
	                {referenceTags.length > 0 && (
	                  <div className="-mt-1 mb-2 flex flex-wrap gap-2">
	                    {referenceTags.map((asset, index) => (
	                      <span key={`${asset.name}-${index}`} className="inline-flex h-6 items-center gap-1 rounded-md px-2 text-xs font-semibold text-white/86" style={{ background: "rgba(255,255,255,0.14)" }}>
	                        <img src={asset.image} alt="" className="h-4 w-4 rounded object-cover" />
	                        {asset.name}
	                      </span>
	                    ))}
	                  </div>
	                )}
	                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    {["图片生成", "专业图片-2", "智能比例", "1K", "4张"].map((chip, index) => (
                      <button
                        key={chip}
                        type="button"
                        className="inline-flex h-8 items-center gap-1 rounded-lg px-3 text-xs text-white/74"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                      >
                        {index === 1 && <ImageIcon size={13} />}
                        {chip}
                        {index < 2 && <ChevronDown size={12} className="text-white/34" />}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={openReferenceMenuFromButton}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold text-white/68"
                      style={{ background: showReferenceMenu ? "rgba(232,115,34,0.18)" : "rgba(255,255,255,0.08)", color: showReferenceMenu ? "#ff9a5c" : "rgba(255,255,255,0.68)" }}
                      aria-label="提及"
                    >
                      @
                    </button>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <span className="text-xs text-white/60">{promptText.length} / 1000</span>
                    <span className="inline-flex items-center gap-1 text-xs text-white/68">
                      <Sparkles size={14} />
                      4
                    </span>
                    <button
                      type="button"
                      onClick={() => toast.success(promptText.trim() ? "已加入生成队列" : "请输入创作描述")}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-[#f4a06b] transition-transform hover:-translate-y-px"
                      style={{
                        background: "radial-gradient(95% 95% at 25% 10%, rgba(255,172,111,0.34), rgba(87,39,20,0.22) 56%, rgba(28,12,6,0.98))",
                        boxShadow: "inset -2px 4px 8px rgba(240,165,128,0.56), 0 10px 18px rgba(0,0,0,0.32)",
                      }}
                      aria-label="生成"
                    >
                      <ArrowUp size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {showReferenceMenu && (
          <ReferenceMentionMenu
            currentFolder={referenceFolder}
            expandedMore={referenceExpandedMore}
            menuRef={mentionMenuRef}
            onEnterFolder={setReferenceFolder}
            onExitFolder={() => setReferenceFolder(null)}
            onExpandMore={() => setReferenceExpandedMore((value) => !value)}
            onSelectFolderReference={selectFolderReferenceAsset}
            onSelectReference={selectReferenceAsset}
            references={composerReferences}
            style={{ left: referenceMenuPosition.left, top: referenceMenuPosition.top }}
          />
        )}
      </div>
    </div>
  );
}

export function InspirationExplorePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(CATEGORY_TABS[0]);
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return INSPIRATION_PRESETS.filter((item) => {
      if (activeTab.query && item.categoryKey !== activeTab.query) return false;
      if (!keyword) return true;
      return item.title.toLowerCase().includes(keyword) || item.prompt.toLowerCase().includes(keyword);
    });
  }, [activeTab, query]);

  return (
    <div className="h-full w-full overflow-auto pb-[360px]" style={{ background: "#090706" }}>
      <div className="mx-auto w-[calc(100%-48px)] max-w-[1504px]">
        <div
          className="sticky top-0 z-10 mb-4 pb-4 pt-8"
          style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
        >
          <header className="mb-4 flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white"
              style={{ background: "rgba(0,0,0,0.32)" }}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="m-0 text-[28px] font-semibold leading-none text-[#f5f7ff]">灵感探索</h1>
          </header>
          <div className="flex items-center gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORY_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className="h-[30px] rounded-md px-3.5 text-xs transition-colors"
                  style={{
                    background: activeTab.key === tab.key ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)",
                    color: activeTab.key === tab.key ? "#fe6603" : "rgba(255,255,255,0.85)",
                  }}
                >
                  {tab.value}
                </button>
              ))}
            </div>
            <div className="ml-auto flex h-8 w-[400px] max-w-[36vw] items-center gap-2 rounded-md px-3" style={{ background: "rgba(255,255,255,0.12)" }}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索灵感"
                className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/45"
              />
              <Search size={14} style={{ color: "#fe6603" }} />
            </div>
          </div>
        </div>

        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {filteredItems.map((item) => (
              <InspirationCard
                key={item.id}
                item={item}
                onSelect={(preset) => toast.success(`已套用「${preset.title}」`)}
              />
            ))}
          </div>
        ) : (
          <div className="grid min-h-[120px] place-items-center text-sm text-white/50">
            暂无灵感预设
          </div>
        )}
      </div>

      <div className="fixed bottom-6 left-[60px] right-0 z-20 px-4">
        <PromptBar />
      </div>
    </div>
  );
}
