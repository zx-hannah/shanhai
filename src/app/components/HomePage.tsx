import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowUpRight, Clock, Play } from "lucide-react";
import { PROJECTS_DATA, type ProjectData } from "../data/projectsData";
import { useSpace } from "../context/SpaceContext";
import { PromptBar, QuickEntrySection, InspirationSection } from "./PersonalGeneratePage";

const STATUS_COLOR: Record<ProjectData["status"], { bg: string; color: string }> = {
  "进行中": { bg: "rgba(17,91,53,0.78)", color: "#31df86" },
  "已完成": { bg: "rgba(36,93,155,0.78)", color: "#7dbcff" },
  "暂停": { bg: "rgba(118,86,28,0.78)", color: "#f4b638" },
};

const ACTIVITY_ITEMS = [
  {
    tagName: "新功能",
    tagBgColor: "#ff5f00",
    title: "AI漫剧工作流上线",
    desc: "从分镜、角色到成片，一站式完成漫剧内容生产。",
    image: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=760&h=500&fit=crop&q=90",
  },
  {
    tagName: "活动",
    tagBgColor: "#7b3fc4",
    title: "创作挑战赛",
    desc: "提交你的影视级 AI 作品，解锁团队协作奖励。",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=760&h=500&fit=crop&q=90",
  },
  {
    tagName: "模板",
    tagBgColor: "#1a5cc4",
    title: "影视预设模板库",
    desc: "新增人物、场景、道具、镜头运动等多类模板。",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=760&h=500&fit=crop&q=90",
  },
  {
    tagName: "升级",
    tagBgColor: "#c45c1a",
    title: "视频生成效果优化",
    desc: "提升人物稳定性、镜头连贯性与画面质感。",
    image: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=760&h=500&fit=crop&q=90",
  },
];

const CASE_ITEMS = [
  {
    name: "THE AWAKENING",
    tag: "AI短片",
    intro: "以写实影像语言呈现角色觉醒，展示多镜头连续叙事能力。",
    duration: "01:42",
    cover: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1500&h=840&fit=crop&q=90",
  },
  {
    name: "ORIENTAL DREAM",
    tag: "东方奇幻",
    intro: "云海、宫阙、角色特写组合成完整东方幻想世界。",
    duration: "02:18",
    cover: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=900&h=510&fit=crop&q=90",
  },
  {
    name: "CITY LIGHTS",
    tag: "广告样片",
    intro: "霓虹城市与产品光影结合，适合商业创意提案。",
    duration: "00:58",
    cover: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=900&h=510&fit=crop&q=90",
  },
  {
    name: "INK MOTION",
    tag: "漫剧",
    intro: "水墨风转场和角色动作设计，适合国风漫剧预演。",
    duration: "01:09",
    cover: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?w=900&h=510&fit=crop&q=90",
  },
];

function SectionHeader({
  title,
  description,
  actionText,
  onAction,
}: {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}) {
  return (
    <header className="flex min-h-[52px] items-end justify-between">
      <div>
        <h2 className="m-0 text-xl font-semibold leading-none text-[#f5f7ff]">{title}</h2>
        <p className="mt-2 text-sm leading-5 text-[#e6e9ffa6]">{description}</p>
      </div>
      {actionText && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1 text-sm transition-colors hover:text-white"
          style={{ color: "rgba(230,233,255,0.72)" }}
        >
          {actionText}
          <ArrowUpRight size={13} />
        </button>
      )}
    </header>
  );
}

function RecentProjectCard({ project }: { project: ProjectData }) {
  const status = STATUS_COLOR[project.status];
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/project/${project.id}`)}
      className="group relative min-h-[164px] overflow-hidden rounded-xl text-left transition-transform hover:-translate-y-0.5"
      style={{
        backgroundImage: `linear-gradient(180deg, transparent 42%, rgba(7,6,5,0.8)), url(${project.cover})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)",
      }}
    >
      <span className="absolute left-0 top-0 rounded-br-xl px-3 py-1 text-xs font-semibold" style={{ background: status.bg, color: status.color }}>
        {project.status}
      </span>
      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
        <h3 className="m-0 min-w-0 truncate text-sm font-normal text-white">{project.name}</h3>
        <span className="inline-flex flex-shrink-0 items-center gap-1 text-[13px] text-white/54">
          <Clock size={13} />
          {project.lastEdit}
        </span>
      </div>
    </button>
  );
}

function RecentProjectsSection() {
  const navigate = useNavigate();
  const projects = PROJECTS_DATA.slice(0, 4);

  return (
    <section>
      <SectionHeader
        title="最近项目"
        description="继续你的创作"
        actionText="查看全部"
        onAction={() => navigate("/projects")}
      />
      <div className="mt-[18px] grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {projects.map((project) => (
          <RecentProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
}

function ActivityTutorialCard({
  item,
  showTag = false,
}: {
  item: typeof ACTIVITY_ITEMS[number];
  showTag?: boolean;
}) {
  const activity = item as typeof ACTIVITY_ITEMS[number];

  return (
    <button type="button" className="group flex w-full flex-col gap-3 text-left">
      <div className="relative aspect-[367/240] overflow-hidden rounded-xl bg-white/[0.04] shadow-[0_8px_20px_rgba(0,0,0,0.16)] transition-transform group-hover:-translate-y-0.5">
        <img src={item.image} alt="" className="h-full w-full object-cover" loading="lazy" />
        {showTag && activity.tagName && (
          <span className="absolute left-0 top-0 rounded-br-xl px-3 py-1 text-xs font-semibold text-white" style={{ background: activity.tagBgColor }}>
            {activity.tagName}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="m-0 text-base font-semibold leading-snug text-white/90">{item.title}</h3>
        <p className="m-0 line-clamp-2 text-[13px] leading-snug text-white/50">{item.desc}</p>
      </div>
    </button>
  );
}

function ActivitiesSection() {
  return (
    <section>
      <SectionHeader title="更新与活动" description="新功能介绍与近期精彩活动" />
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {ACTIVITY_ITEMS.map((item) => (
          <ActivityTutorialCard key={item.title} item={item} showTag />
        ))}
      </div>
    </section>
  );
}

function RecommendSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = CASE_ITEMS[activeIndex];
  const navigate = useNavigate();

  return (
    <section>
      <SectionHeader title="精品案例" description="精选行业佳作，启发无限可能" />
      <div className="mt-6 flex flex-col gap-6">
        <button
          type="button"
          className="group relative h-[520px] overflow-hidden rounded-3xl bg-black text-left max-[1280px]:h-[420px]"
          onClick={() => navigate("/generate")}
        >
          <img src={active.cover} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-b from-black/10 via-black/45 to-black/80 p-8">
            <div className="max-w-[720px]">
              <h2 className="m-0 text-5xl font-normal uppercase leading-tight tracking-[0.02em] text-white max-[1280px]:text-4xl">
                {active.name}
              </h2>
              <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/70">{active.intro}</p>
            </div>
            <div className="flex items-center justify-between gap-3 text-xs text-white/70">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-white/12 px-3 py-1">{active.tag}</span>
                <span>{active.duration}</span>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 transition-transform group-hover:scale-110">
                <Play size={20} fill="white" />
              </span>
            </div>
          </div>
        </button>
        <div className="grid grid-cols-1 gap-5 px-2 md:grid-cols-2 xl:grid-cols-4">
          {CASE_ITEMS.map((item, index) => (
            <button
              type="button"
              key={item.name}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => setActiveIndex(index)}
              className="group flex flex-col gap-3 text-left transition-transform hover:-translate-y-0.5"
            >
              <div
                className="aspect-video overflow-hidden rounded-lg border-2 transition-colors"
                style={{ borderColor: activeIndex === index ? "#ff5f00" : "transparent", background: "#2c2c2c" }}
              >
                <img src={item.cover} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div>
                <h3 className="m-0 truncate text-base font-normal uppercase leading-tight text-white">{item.name}</h3>
                <p className="mt-1 line-clamp-1 text-xs leading-snug text-white/60">{item.tag || item.intro}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomePage() {
  const { spaceId } = useSpace();
  const showRecentProjects = useMemo(() => spaceId !== "personal", [spaceId]);

  return (
    <div className="h-full w-full overflow-auto" style={{ background: "#090706" }}>
      <div
        className="mx-auto flex w-[calc(100%-48px)] max-w-[1504px] flex-col gap-[60px] pb-80 pt-20"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(255,117,38,0.2), rgba(255,117,38,0) 38%)",
        }}
      >
        <section className="mx-auto mt-4 w-full max-w-[1200px]">
          <PromptBar />
        </section>
        <QuickEntrySection />
        {showRecentProjects && <RecentProjectsSection />}
        <ActivitiesSection />
        <InspirationSection />
        <RecommendSection />
      </div>
    </div>
  );
}
