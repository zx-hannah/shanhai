import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronDown, Send, Coins, ArrowUpRight, FolderOpen, Clock, Megaphone, Palette, Zap, Video, Layout, Mic, Image as LucideImage } from "lucide-react";
import { PROJECTS_DATA } from "../data/projectsData";
import { useSpace } from "../context/SpaceContext";

const ACTIVITY_CARDS = [
  { tag: "无限画布", title: "活动", color: "#C45C1A", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80" },
  { tag: "无限画布", title: "活动", color: "#4A1A8C", image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=300&q=80" },
  { tag: "活动", title: "限时挑战", color: "#1A5CC4", image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&q=80" },
  { tag: "活动", title: "花开富贵", color: "#8C1A1A", image: "https://images.unsplash.com/photo-1490750967868-88df5691cc6f?w=300&q=80" },
];
const FEATURE_CARDS = [
  { label: "无限画布", sub: "释放你的AI创造力", color: "#7B3FC4", gradient: "linear-gradient(135deg, #7B3FC4, #4A1A8C)" },
  { label: "创建项目", sub: "还原影视化创作流程", color: "#2A6FC4", gradient: "linear-gradient(135deg, #2A6FC4, #1A3A8C)" },
  { label: "生音频", icon: Mic, color: "#1E1A14" },
  { label: "对口型", icon: Layout, color: "#1E1A14" },
  { label: "图片高清", icon: LucideImage, color: "#1E1A14" },
  { label: "视频超分", icon: Video, color: "#1E1A14" },
];

const STATUS_COLOR: Record<string, string> = {
  "进行中": "#22c55e",
  "已完成": "#3b82f6",
  "暂停": "#f59e0b",
};

function RecentProjectCard({ project }: { project: typeof PROJECTS_DATA[number] }) {
  const statusColor = STATUS_COLOR[project.status] || "#6b7280";
  return (
    <div
      className="rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.01] h-full"
      style={{ background: "#1E1A14", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Cover */}
      <div className="relative h-36">
        <img src={project.cover} alt={project.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)" }} />
        <div className="absolute top-2 left-2">
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${statusColor}33`, color: statusColor, border: `1px solid ${statusColor}44` }}>
            {project.status}
          </span>
        </div>
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
          <span className="text-sm text-white font-medium truncate">{project.name}</span>
          <span className="flex items-center gap-1 text-xs flex-shrink-0" style={{ color: "rgba(255,255,255,0.4)" }}>
            <Clock size={10} />{project.lastEdit}
          </span>
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("图片生成");
  const navigate = useNavigate();
  const { spaceId } = useSpace();

  const recentProjects = PROJECTS_DATA.slice(0, 4);

  return (
    <div className="h-full w-full overflow-auto" style={{
      background: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(140,70,20,0.5) 0%, rgba(20,15,9,0) 70%), #140F09"
    }}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Creation Input Box */}
        <div className="rounded-2xl p-4 mb-6 mt-4"
          style={{ background: "rgba(30,26,20,0.8)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(10px)" }}>

          {/* Plus area */}
          <div className="flex items-start gap-3 mb-4">
            <button className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-opacity hover:opacity-80"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <FolderOpen size={14} style={{ color: "rgba(255,255,255,0.5)" }} />
            </button>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="开始你的创作吧..."
              className="flex-1 bg-transparent outline-none resize-none text-sm"
              style={{ color: "rgba(255,255,255,0.8)", minHeight: "60px", caretColor: "#E87322" }}
            />
          </div>

          {/* Bottom toolbar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Mode selector */}
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span>{mode}</span>
                <ChevronDown size={12} />
              </button>
              {/* Model selector */}
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span>seedream3.0</span>
                <ChevronDown size={12} />
              </button>
              {/* Size */}
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span>1:1</span>
              </button>
              {/* Quality */}
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span>高清 2K</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Credits */}
              <div className="flex items-center gap-1 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                <Coins size={12} style={{ color: "#E87322" }} />
                <span>500</span>
              </div>
              {/* Send button */}
              <button className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-80"
                style={{ background: prompt.trim() ? "#E87322" : "rgba(232,115,34,0.4)" }}>
                <Send size={14} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Projects */}
        {spaceId !== "personal" && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-white">最近项目</h3>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                继续你的创作
              </p>
            </div>
            <button
              className="flex items-center gap-1 text-xs transition-opacity hover:opacity-80"
              style={{ color: "#E87322" }}
              onClick={() => navigate("/projects")}
            >
              <span>全部项目</span>
              <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {recentProjects.map((project) => (
              <RecentProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
        )}
      {/* Recent Projects */}
        {spaceId == "personal" && (
       <div className="grid grid-cols-4 gap-3 mb-8">
          {/* Large cards */}
          <div
            className="col-span-1 rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] relative h-32"
            style={{ background: FEATURE_CARDS[0].gradient }}
            onClick={() => navigate("/canvas")}
          >
            <div className="p-3 h-full flex flex-col justify-between">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.2)" }}>
                <Layout size={16} className="text-white" />
              </div>
              <div>
                <div className="text-white text-sm">{FEATURE_CARDS[0].label}</div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{FEATURE_CARDS[0].sub}</div>
              </div>
            </div>
          </div>
          
          <div className="col-span-1 rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] relative h-32"
            style={{ background: FEATURE_CARDS[1].gradient }}>
            <div className="p-3 h-full flex flex-col justify-between">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.2)" }}>
                <Video size={16} className="text-white" />
              </div>
              <div>
                <div className="text-white text-sm">{FEATURE_CARDS[1].label}</div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{FEATURE_CARDS[1].sub}</div>
              </div>
            </div>
          </div>

          {/* Right 2x2 grid */}
          <div className="col-span-2 grid grid-cols-2 gap-3">
            {[
              { label: "生音频", icon: Mic },
              { label: "对口型", icon: Layout },
              { label: "图片高清", icon: LucideImage },
              { label: "视频超分", icon: Video },
            ].map(({ label, icon: Icon }) => (
              <button key={label}
                className="rounded-xl flex items-center gap-2 px-3 cursor-pointer transition-colors h-14 text-left"
                style={{ background: "rgba(30,26,20,0.8)", border: "1px solid rgba(255,255,255,0.08)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(232,115,34,0.3)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)"; }}>
                <Icon size={16} style={{ color: "#E87322" }} />
                <span className="text-sm text-white">{label}</span>
              </button>
            ))}
          </div>
        </div>
        )}
        {/* 更新与活动 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-white">更新与活动</h3>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                产品动态与通知
              </p>
            </div>
          </div>
         <div className="grid grid-cols-4 gap-3">
            {ACTIVITY_CARDS.map((card, i) => (
              <div key={i} className="rounded-xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] relative h-36"
                style={{ background: "#1E1A14" }}>
                <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }} />
                <div className="absolute top-2 left-2">
                  <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background: card.color }}>
                    {card.tag}
                  </span>
                </div>
                <div className="absolute bottom-2 left-2 right-2">
                  <span className="text-xs text-white">{card.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}