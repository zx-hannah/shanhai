import { useState } from "react";
import {
  ChevronRight,
  Plus,
  Play,
  AlignLeft,
  Image as LucideImage,
  Video,
  User,
  Package,
  Box,
  Copy,
  Check,
  SlidersHorizontal,
  Send,
  MessageSquare,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";

type StoryField = "script" | "referenceImages" | "storyboardImages" | "videoAssets" | "characters" | "subjects" | "props";

interface StoryAsset {
  id: string;
  label: string;
  src: string;
}

interface StoryEntity {
  id: string;
  name: string;
  src: string;
}

interface SBPanel {
  id: string;
  no: string;
  desc: string;
  script: string;
  referenceImages: StoryAsset[];
  storyboardImages: StoryAsset[];
  videoAssets: StoryAsset[];
  characters: StoryEntity[];
  subjects: StoryEntity[];
  props: StoryEntity[];
}

interface EpisodeGroup {
  id: string;
  name: string;
  panels: SBPanel[];
}

const EPISODE_STORYBOARD: EpisodeGroup[] = [
  {
    id: "ep1",
    name: "第一集",
    panels: [
      {
        id: "p1",
        no: "01",
        desc: "女主角出场，云雾缭绕",
        script: "（旁白）传闻山海之间，有人白发如雪，踏云海而来。",
        referenceImages: [
          { id: "p1-r1", label: "云海参考", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=300&q=80" },
          { id: "p1-r2", label: "山门光线", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=300&q=80" },
        ],
        storyboardImages: [],
        videoAssets: [
          { id: "p1-v1", label: "出场动效 v1", src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?w=200&q=70" },
        ],
        characters: [
          { id: "char-linyue", name: "林月", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=120&q=70" },
          { id: "char-heiyi", name: "黑衣人", src: "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?w=120&q=70" },
        ],
        subjects: [
          { id: "sub-yunhai", name: "云海", src: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=120&q=70" },
          { id: "sub-shanmen", name: "昆仑山门", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=120&q=70" },
        ],
        props: [
          { id: "prop-liuyun", name: "流云剑", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=120&q=70" },
        ],
      },
      {
        id: "p2",
        no: "02",
        desc: "近景，持剑回眸",
        script: "白发如霜，剑出惊鸿，她缓缓转过身来。",
        referenceImages: [
          { id: "p2-r1", label: "人物近景", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=300&q=80" },
        ],
        storyboardImages: [
          { id: "p2-s1", label: "回眸构图", src: "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?w=200&q=70" },
        ],
        videoAssets: [],
        characters: [
          { id: "char-linyue", name: "林月", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=120&q=70" },
        ],
        subjects: [
          { id: "sub-closeup", name: "近景特写", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=120&q=70" },
          { id: "sub-snow", name: "风雪", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=120&q=70" },
        ],
        props: [
          { id: "prop-liuyun", name: "流云剑", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=120&q=70" },
          { id: "prop-yupei", name: "玉佩", src: "https://images.unsplash.com/photo-1758930908621-550b64b0b1c1?w=120&q=70" },
        ],
      },
      {
        id: "p3",
        no: "03",
        desc: "全景，古城楼背景",
        script: "（无台词）城楼巍峨，暮色苍茫。",
        referenceImages: [
          { id: "p3-r1", label: "古城楼", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=300&q=80" },
        ],
        storyboardImages: [],
        videoAssets: [],
        characters: [
          { id: "char-linyue", name: "林月", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=120&q=70" },
          { id: "char-guard", name: "守城军", src: "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?w=120&q=70" },
        ],
        subjects: [
          { id: "sub-city", name: "古城楼", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=120&q=70" },
          { id: "sub-dusk", name: "暮色天空", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=120&q=70" },
        ],
        props: [
          { id: "prop-flag", name: "城旗", src: "https://images.unsplash.com/photo-1748838602679-32d82ccf188e?w=120&q=70" },
          { id: "prop-torch", name: "火把", src: "https://images.unsplash.com/photo-1758930908621-550b64b0b1c1?w=120&q=70" },
        ],
      },
      {
        id: "p4",
        no: "04",
        desc: "战斗特效，剑气飞舞",
        script: "女：「你来了。」对方沉默，剑光交错。",
        referenceImages: [
          { id: "p4-r1", label: "剑气参考", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=300&q=80" },
          { id: "p4-r2", label: "能量爆发", src: "https://images.unsplash.com/photo-1748838602679-32d82ccf188e?w=300&q=80" },
        ],
        storyboardImages: [
          { id: "p4-s1", label: "剑气 A", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=200&q=70" },
          { id: "p4-s2", label: "剑气 B", src: "https://images.unsplash.com/photo-1758930908621-550b64b0b1c1?w=200&q=70" },
        ],
        videoAssets: [
          { id: "p4-v1", label: "剑气飞舞 v1", src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?w=200&q=70" },
          { id: "p4-v2", label: "剑光交错 v2", src: "https://images.unsplash.com/photo-1748838602679-32d82ccf188e?w=200&q=70" },
        ],
        characters: [
          { id: "char-linyue", name: "林月", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=120&q=70" },
          { id: "char-heiyi", name: "黑衣人", src: "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?w=120&q=70" },
        ],
        subjects: [
          { id: "sub-sword-effect", name: "剑气特效", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=120&q=70" },
          { id: "sub-snowfield", name: "雪地", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=120&q=70" },
        ],
        props: [
          { id: "prop-liuyun", name: "流云剑", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=120&q=70" },
          { id: "prop-black-sword", name: "黑铁剑", src: "https://images.unsplash.com/photo-1758930908621-550b64b0b1c1?w=120&q=70" },
        ],
      },
    ],
  },
  {
    id: "ep2",
    name: "第二集",
    panels: [
      {
        id: "p5",
        no: "01",
        desc: "晨雾古道，旅人启程",
        script: "（旁白）山河辽阔，天涯何处是归途。",
        referenceImages: [
          { id: "p5-r1", label: "晨雾古道", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=300&q=80" },
        ],
        storyboardImages: [
          { id: "p5-s1", label: "古道远景", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=200&q=70" },
        ],
        videoAssets: [],
        characters: [
          { id: "char-luchen", name: "陆沉", src: "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?w=120&q=70" },
          { id: "char-linyue", name: "林月", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=120&q=70" },
        ],
        subjects: [
          { id: "sub-road", name: "晨雾古道", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=120&q=70" },
          { id: "sub-carriage", name: "马车", src: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=120&q=70" },
        ],
        props: [
          { id: "prop-bag", name: "行囊", src: "https://images.unsplash.com/photo-1758930908621-550b64b0b1c1?w=120&q=70" },
          { id: "prop-hat", name: "斗笠", src: "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?w=120&q=70" },
        ],
      },
      {
        id: "p6",
        no: "02",
        desc: "近景，回望身后",
        script: "男：「这条路，只能走到头。」",
        referenceImages: [],
        storyboardImages: [],
        videoAssets: [],
        characters: [
          { id: "char-luchen", name: "陆沉", src: "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?w=120&q=70" },
        ],
        subjects: [
          { id: "sub-mountain-road", name: "山路", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=120&q=70" },
          { id: "sub-back", name: "背影", src: "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?w=120&q=70" },
        ],
        props: [
          { id: "prop-hat", name: "斗笠", src: "https://images.unsplash.com/photo-1772371272152-d1806d4351e0?w=120&q=70" },
        ],
      },
      {
        id: "p7",
        no: "03",
        desc: "远景，夕阳落山",
        script: "（无台词）两人并肩而立，看落日余晖。",
        referenceImages: [
          { id: "p7-r1", label: "夕阳山脊", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=300&q=80" },
        ],
        storyboardImages: [
          { id: "p7-s1", label: "夕阳站位", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=200&q=70" },
        ],
        videoAssets: [
          { id: "p7-v1", label: "夕阳推镜", src: "https://images.unsplash.com/photo-1662103631385-a56dcaee528b?w=200&q=70" },
        ],
        characters: [
          { id: "char-luchen", name: "陆沉", src: "https://images.unsplash.com/photo-1772490184368-d6c7d8001fa6?w=120&q=70" },
          { id: "char-linyue", name: "林月", src: "https://images.unsplash.com/photo-1743951896798-2936f661f939?w=120&q=70" },
        ],
        subjects: [
          { id: "sub-sunset", name: "夕阳", src: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=120&q=70" },
          { id: "sub-ridge", name: "山脊", src: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=120&q=70" },
        ],
        props: [
          { id: "prop-liuyun", name: "流云剑", src: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=120&q=70" },
          { id: "prop-bag", name: "行囊", src: "https://images.unsplash.com/photo-1758930908621-550b64b0b1c1?w=120&q=70" },
        ],
      },
    ],
  },
  {
    id: "ep3",
    name: "第三集",
    panels: [],
  },
  {
    id: "ep4",
    name: "第四集",
    panels: [],
  },
];

const FIELD_CONFIG: { key: StoryField; label: string }[] = [
  { key: "script", label: "文字脚本" },
  { key: "referenceImages", label: "画面参考" },
  { key: "storyboardImages", label: "分镜图" },
  { key: "videoAssets", label: "分镜视频" },
  { key: "characters", label: "人物" },
  { key: "subjects", label: "主体" },
  { key: "props", label: "道具" },
];

export function StoryboardSidebarPanel({ onSendToChat }: { onSendToChat?: (content: string) => void }) {
  const [fields, setFields] = useState<Record<StoryField, boolean>>({
    script: true,
    referenceImages: true,
    storyboardImages: true,
    videoAssets: true,
    characters: true,
    subjects: true,
    props: true,
  });
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({ ep3: true, ep4: true });
  const [assetIndexes, setAssetIndexes] = useState<Record<string, number>>({});
  const [copiedPanelId, setCopiedPanelId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [storySearch, setStorySearch] = useState("");

  const toggleField = (f: StoryField) =>
    setFields((prev) => ({ ...prev, [f]: !prev[f] }));

  const toggleEpisode = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  const activeFieldCount = FIELD_CONFIG.filter(({ key }) => fields[key]).length;
  const flatPanels = EPISODE_STORYBOARD.flatMap((episode) =>
    episode.panels.map((panel) => ({ episode, panel }))
  );
  const totalPanelCount = flatPanels.length;
  const totalEpisodeCount = EPISODE_STORYBOARD.length;
  const normalizedSearch = storySearch.trim().toLowerCase();
  const visibleEpisodes = EPISODE_STORYBOARD.map((episode) => {
    if (!normalizedSearch) return episode;
    const episodeMatched = episode.name.toLowerCase().includes(normalizedSearch);
    return {
      ...episode,
      panels: episodeMatched
        ? episode.panels
        : episode.panels.filter((panel) =>
            [panel.no, panel.desc, panel.script].some((value) => value.toLowerCase().includes(normalizedSearch))
          ),
    };
  }).filter((episode) => !normalizedSearch || episode.name.toLowerCase().includes(normalizedSearch) || episode.panels.length > 0);

  const renderFieldIcon = (key: StoryField) => {
    if (key === "script") return <AlignLeft size={9} />;
    if (key === "referenceImages" || key === "storyboardImages") return <LucideImage size={9} />;
    if (key === "videoAssets") return <Video size={9} />;
    if (key === "characters") return <User size={9} />;
    if (key === "subjects") return <Box size={9} />;
    return <Package size={9} />;
  };

  const moveAsset = (key: string, total: number, direction: -1 | 1) => {
    if (total <= 1) return;
    setAssetIndexes((prev) => {
      const current = prev[key] ?? 0;
      return { ...prev, [key]: (current + direction + total) % total };
    });
  };

  const copyScript = (panelId: string, script: string) => {
    navigator.clipboard.writeText(script).then(() => {
      setCopiedPanelId(panelId);
      toast.success("文字脚本已复制");
      window.setTimeout(() => setCopiedPanelId((current) => current === panelId ? null : current), 1200);
    }).catch(() => toast.error("复制失败"));
  };

  const sendToChat = (content: string) => {
    if (!content.trim()) return;
    onSendToChat?.(content);
    toast.success("已填入右侧对话框");
  };

  const getPanelAssetTotal = (panel: SBPanel) =>
    panel.referenceImages.length +
    panel.storyboardImages.length +
    panel.videoAssets.length +
    panel.characters.length +
    panel.subjects.length +
    panel.props.length;

  const getEpisodeAssetTotal = (panels: SBPanel[]) =>
    panels.reduce((sum, panel) => sum + getPanelAssetTotal(panel), 0);

  const renderFieldToggle = ({ key, label }: { key: StoryField; label: string }) => (
    <button
      key={key}
      onClick={() => toggleField(key)}
      className="w-full flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-white/6"
      style={{ color: fields[key] ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.38)" }}
    >
      <span className="flex h-4 w-4 items-center justify-center rounded" style={{ background: fields[key] ? "rgba(232,115,34,0.18)" : "rgba(255,255,255,0.04)", color: fields[key] ? "#E87322" : "rgba(255,255,255,0.3)", flexShrink: 0 }}>
        {renderFieldIcon(key)}
      </span>
      <span className="flex-1 truncate" style={{ fontSize: "10px" }}>{label}</span>
      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-sm" style={{ border: fields[key] ? "1px solid rgba(232,115,34,0.72)" : "1px solid rgba(255,255,255,0.16)", background: fields[key] ? "#E87322" : "transparent" }}>
        {fields[key] && <Check size={9} style={{ color: "#140F09" }} />}
      </span>
    </button>
  );

  const SendButton = ({ content, title = "发送到对话", guideTarget, guideScriptSend }: { content: string; title?: string; guideTarget?: string; guideScriptSend?: boolean }) => (
    <button
      className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-white/12"
      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.62)" }}
      data-generate-guide-target={guideTarget}
      data-storyboard-script-send={guideScriptSend ? "true" : undefined}
      onClick={(event) => {
        event.stopPropagation();
        sendToChat(content);
      }}
      title={title}
    >
      <Send size={11} />
    </button>
  );

  const renderAssetCarousel = (panelId: string, field: StoryField, label: string, assets: StoryAsset[], isVideo = false) => {
    const carouselKey = `${panelId}-${field}`;
    const currentIndex = Math.min(assetIndexes[carouselKey] ?? 0, Math.max(assets.length - 1, 0));
    const currentAsset = assets[currentIndex];
    return (
      <div className="mt-2 rounded-lg p-2" style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.055)" }}>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            {isVideo ? <Video size={11} style={{ color: "rgba(255,255,255,0.42)" }} /> : <LucideImage size={11} style={{ color: "rgba(255,255,255,0.42)" }} />}
            <span className="truncate" style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>{label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="rounded-md px-1.5 py-0.5" style={{ fontSize: "10px", color: "rgba(255,255,255,0.32)", background: "rgba(255,255,255,0.04)" }}>
              {assets.length > 0 ? `${currentIndex + 1}/${assets.length}` : "0"}
            </span>
            {currentAsset && (
              <SendButton
                content={`${label}：${currentAsset.label}\n参考图地址：${currentAsset.src}`}
                guideTarget={panelId === "p1" && field === "referenceImages" ? "storyboard-send" : undefined}
              />
            )}
          </div>
        </div>
        {currentAsset ? (
          <div className="relative overflow-hidden rounded-md" style={{ height: "96px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <img src={currentAsset.src} alt="" className="w-full h-full object-cover" />
            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-lg px-2 py-1" style={{ background: "rgba(54,42,34,0.78)", border: "1px solid rgba(232,115,34,0.4)", color: "rgba(255,255,255,0.72)" }}>
              <MessageSquare size={12} />
              <span style={{ fontSize: "10px", fontWeight: 600 }}>0/0</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 px-3 py-2" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.72) 100%)" }}>
              <span className="min-w-0 flex-1 truncate" style={{ color: "#fff", fontSize: "11px", fontWeight: 600 }}>{currentAsset.label}</span>
              {assets.length > 1 && (
                <span style={{ color: "#fff", fontSize: "11px", fontWeight: 700 }}>{currentIndex + 1}/{assets.length}</span>
              )}
            </div>
            {isVideo && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.12)" }}>
                <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: "rgba(0,0,0,0.48)" }}>
                  <Play size={13} style={{ color: "rgba(255,255,255,0.9)" }} />
                </span>
              </div>
            )}
            {assets.length > 1 && (
              <>
                <button
                  className="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center hover:bg-black/65 transition-colors"
                  style={{ background: "rgba(0,0,0,0.42)", color: "rgba(255,255,255,0.86)" }}
                  onClick={(event) => { event.stopPropagation(); moveAsset(carouselKey, assets.length, -1); }}
                  title={`上一张${label}`}
                >
                  <ChevronRight size={11} style={{ transform: "rotate(180deg)" }} />
                </button>
                <button
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center hover:bg-black/65 transition-colors"
                  style={{ background: "rgba(0,0,0,0.42)", color: "rgba(255,255,255,0.86)" }}
                  onClick={(event) => { event.stopPropagation(); moveAsset(carouselKey, assets.length, 1); }}
                  title={`下一张${label}`}
                >
                  <ChevronRight size={11} />
                </button>
              </>
            )}
          </div>
        ) : (
          <div
            className="rounded-md px-3 py-3"
            data-empty-storyboard-image-drop={field === "storyboardImages" && panelId === "p1" ? "true" : undefined}
            style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.07)", minHeight: field === "storyboardImages" ? "76px" : undefined }}
          >
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.28)" }}>未填写</span>
          </div>
        )}
      </div>
    );
  };

  const renderEntityList = (label: string, values: StoryEntity[]) => (
    <div className="mt-2 rounded-lg p-2" style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.055)" }}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {label === "人物" ? <User size={11} style={{ color: "rgba(255,255,255,0.42)" }} /> : label === "道具" ? <Package size={11} style={{ color: "rgba(255,255,255,0.42)" }} /> : <Box size={11} style={{ color: "rgba(255,255,255,0.42)" }} />}
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>{label}</span>
        </div>
        {values.length > 0 && <SendButton content={`${label}：${values.map((value) => value.name).join("、")}`} />}
      </div>
      {values.length > 0 ? (
        <div className="grid grid-cols-2 gap-1.5">
          {values.map((value) => (
            <div
              key={value.id}
              className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 min-w-0"
              style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div className="rounded-md overflow-hidden flex-shrink-0" style={{ width: "30px", height: "30px", background: "rgba(255,255,255,0.06)" }}>
                <img src={value.src} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="truncate" style={{ fontSize: "10px", color: "rgba(255,255,255,0.58)" }}>{value.name}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg px-3 py-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.07)" }}>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.28)" }}>未填写</span>
        </div>
      )}
    </div>
  );

  const renderScriptCard = (panel: SBPanel) => (
    <div className="mt-2 rounded-lg p-2" style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.055)" }}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <AlignLeft size={11} style={{ color: "rgba(255,255,255,0.42)" }} />
          <span className="truncate" style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>文字脚本</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors hover:bg-white/12"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)", color: copiedPanelId === panel.id ? "#56C48A" : "rgba(255,255,255,0.62)" }}
            onClick={(event) => {
              event.stopPropagation();
              copyScript(panel.id, panel.script);
            }}
            title="复制脚本"
          >
            {copiedPanelId === panel.id ? <Check size={12} /> : <Copy size={12} />}
          </button>
          <SendButton content={`文字脚本：${panel.script}`} guideScriptSend={panel.id === "p1"} />
        </div>
      </div>
      <p style={{ color: "rgba(255,255,255,0.66)", fontSize: "11px", lineHeight: 1.6 }}>
        {panel.script}
      </p>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-shrink-0 px-2 py-1.5" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center gap-1.5">
          <div className="flex min-w-0 flex-1 items-center gap-1 rounded px-1.5 py-1" style={{ background: "rgba(255,255,255,0.06)" }}>
            <Search size={8} style={{ color: "rgba(255,255,255,0.25)" }} />
            <input
              className="min-w-0 flex-1 bg-transparent outline-none"
              style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", caretColor: "#E87322", padding: 0 }}
              placeholder="搜索分镜..."
              value={storySearch}
              onChange={(event) => setStorySearch(event.target.value)}
            />
            {storySearch && (
              <button onClick={() => setStorySearch("")}>
                <X size={8} style={{ color: "rgba(255,255,255,0.25)" }} />
              </button>
            )}
          </div>
          <button
            className="flex items-center gap-1 rounded px-2 py-1 text-[10px] transition-colors hover:bg-white/10"
            style={{ color: filterOpen ? "#E87322" : "rgba(255,255,255,0.4)", background: filterOpen ? "rgba(232,115,34,0.12)" : "rgba(255,255,255,0.04)", border: filterOpen ? "1px solid rgba(232,115,34,0.22)" : "1px solid rgba(255,255,255,0.07)" }}
            onClick={() => setFilterOpen((open) => !open)}
            title="字段筛选"
          >
            <SlidersHorizontal size={8} />{activeFieldCount}/{FIELD_CONFIG.length}
          </button>
        </div>

        {filterOpen && (
          <div className="absolute left-2 right-2 top-full z-20 mt-1 rounded-xl p-2 shadow-xl" style={{ background: "#2A2018", border: "1px solid rgba(255,255,255,0.1)" }}>
            {FIELD_CONFIG.map(renderFieldToggle)}
            <div className="mt-1 flex gap-1 border-t pt-1" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <button
                className="flex-1 rounded px-2 py-1 text-center hover:bg-white/6"
                style={{ color: "rgba(255,255,255,0.42)", fontSize: "9px" }}
                onClick={() => setFields({
                  script: true,
                  referenceImages: true,
                  storyboardImages: true,
                  videoAssets: true,
                  characters: true,
                  subjects: true,
                  props: true,
                })}
              >
                全选
              </button>
              <button
                className="flex-1 rounded px-2 py-1 text-center hover:bg-white/6"
                style={{ color: "rgba(255,255,255,0.42)", fontSize: "9px" }}
                onClick={() => setFilterOpen(false)}
              >
                收起
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Episodes */}
      <div className="flex-1 overflow-auto px-2 pb-2 pt-1">
        {visibleEpisodes.map((ep) => {
          const isCollapsed = !!collapsed[ep.id];
          const episodeTotal = getEpisodeAssetTotal(ep.panels);
          return (
            <div key={ep.id} className="mb-2 overflow-hidden rounded-xl" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.055)" }}>
              {/* Episode header */}
              <button
                className="w-full flex items-center gap-2 px-2.5 py-2 transition-colors hover:bg-white/5"
                onClick={() => toggleEpisode(ep.id)}
              >
                <ChevronRight
                  size={13}
                  style={{
                    color: "rgba(255,255,255,0.42)",
                    transform: isCollapsed ? "rotate(0deg)" : "rotate(90deg)",
                    transition: "transform 0.15s",
                    flexShrink: 0,
                  }}
                />
                <span className="min-w-0 flex-1 truncate text-xs font-medium" style={{ color: "rgba(255,255,255,0.82)", textAlign: "left" }}>
                  {ep.name}
                </span>
                <span className="rounded px-1.5 py-0.5 text-[10px]" style={{ color: "rgba(255,255,255,0.32)", background: "rgba(255,255,255,0.04)" }}>
                  {episodeTotal || ep.panels.length}
                </span>
              </button>

              {/* Episode panels */}
              {!isCollapsed && (
                <div className="px-2 pb-2">
                  {ep.panels.length === 0 ? (
                    <div className="flex items-center justify-center rounded-lg py-3"
                      style={{ border: "1px dashed rgba(255,255,255,0.07)" }}>
                      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.28)" }}>暂无分镜</span>
                    </div>
                  ) : (
                    ep.panels.map((panel) => (
                      <div
                        key={panel.id}
                        className="mb-2 overflow-hidden rounded-lg p-2"
                        data-storyboard-guide-drop={panel.id === "p1" ? "true" : undefined}
                        style={{
                          background: "rgba(13,14,12,0.62)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        {/* Panel number + desc */}
                        <div className="flex items-center gap-2">
                          <ChevronRight size={12} style={{ color: "rgba(255,255,255,0.42)", transform: "rotate(90deg)", flexShrink: 0 }} />
                          <span className="min-w-0 flex-1 truncate text-xs font-medium" style={{ color: "rgba(255,255,255,0.82)" }}>
                            场次1_分镜{panel.no}
                          </span>
                        </div>
                        {fields.script && renderScriptCard(panel)}
                        {fields.referenceImages && renderAssetCarousel(panel.id, "referenceImages", "画面参考", panel.referenceImages)}
                        {fields.storyboardImages && renderAssetCarousel(panel.id, "storyboardImages", "分镜图", panel.storyboardImages)}
                        {fields.videoAssets && renderAssetCarousel(panel.id, "videoAssets", "分镜视频", panel.videoAssets, true)}
                        {fields.characters && renderEntityList("人物", panel.characters)}
                        {fields.subjects && renderEntityList("场景", panel.subjects)}
                        {fields.props && renderEntityList("道具", panel.props)}
                      </div>
                    ))
                  )}

                  <button
                    className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-white/5 transition-colors mt-0.5"
                    style={{ border: "1px dashed rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.25)", fontSize: "9px" }}
                    onClick={() => toast.success(`已在 ${ep.name} 新增分镜`)}
                  >
                    <Plus size={9} /> 新增分镜
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
