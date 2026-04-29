import { useState } from "react";
import { ChevronRight, Plus, Film, Play, AlignLeft, Image as LucideImage, Video } from "lucide-react";
import { toast } from "sonner";

type StoryField = "script" | "image" | "video";

interface SBPanel {
  id: string;
  no: string;
  desc: string;
  script: string;
  imageSrc?: string;
  hasVideo: boolean;
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
      { id: "p1", no: "01", desc: "女主角出场，云雾缭绕", script: "（旁白）传闻山海之间，有人白发如雪...", imageSrc: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?w=200&q=70", hasVideo: true },
      { id: "p2", no: "02", desc: "近景，持剑回眸", script: "白发如霜，剑出惊鸿，她缓缓转过身来", imageSrc: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?w=200&q=70", hasVideo: false },
      { id: "p3", no: "03", desc: "全景，古城楼背景", script: "（无台词）城楼巍峨，暮色苍茫", imageSrc: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=200&q=70", hasVideo: false },
      { id: "p4", no: "04", desc: "战斗特效，剑气飞舞", script: "女：「你来了。」对方沉默，剑光交错", imageSrc: "https://images.unsplash.com/photo-1636075219672-a422660ce589?w=200&q=70", hasVideo: true },
    ],
  },
  {
    id: "ep2",
    name: "第二集",
    panels: [
      { id: "p5", no: "01", desc: "晨雾古道，旅人启程", script: "（旁白）山河辽阔，天涯何处是归途", imageSrc: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?w=200&q=70", hasVideo: false },
      { id: "p6", no: "02", desc: "近景，回望身后", script: "男：「这条路，只能走到头。」", imageSrc: undefined, hasVideo: false },
      { id: "p7", no: "03", desc: "远景，夕阳落山", script: "（无台词）两人并肩而立，看落日余晖", imageSrc: "https://images.unsplash.com/photo-1551264397-09c6f678a930?w=200&q=70", hasVideo: true },
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
  { key: "script", label: "草分" },
  { key: "image",  label: "静帧" },
  { key: "video",  label: "动态" },
];

export function StoryboardSidebarPanel() {
  const [fields, setFields] = useState<Record<StoryField, boolean>>({ script: true, image: true, video: false });
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({ ep3: true, ep4: true });

  const toggleField = (f: StoryField) =>
    setFields((prev) => ({ ...prev, [f]: !prev[f] }));

  const toggleEpisode = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="flex flex-col h-full">
      {/* Field toggles */}
      <div className="flex items-center gap-1 px-2 py-2 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {FIELD_CONFIG.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => toggleField(key)}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors flex-1 justify-center"
            style={{
              background: fields[key] ? "rgba(232,115,34,0.15)" : "rgba(255,255,255,0.04)",
              color: fields[key] ? "#E87322" : "rgba(255,255,255,0.35)",
              border: fields[key] ? "1px solid rgba(232,115,34,0.25)" : "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {key === "script" && <AlignLeft size={9} />}
            {key === "image"  && <LucideImage size={9} />}
            {key === "video"  && <Video size={9} />}
            {label}
          </button>
        ))}
      </div>

      {/* Episodes */}
      <div className="flex-1 overflow-auto">
        {EPISODE_STORYBOARD.map((ep) => {
          const isCollapsed = !!collapsed[ep.id];
          return (
            <div key={ep.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              {/* Episode header */}
              <button
                className="w-full flex items-center gap-1.5 px-2.5 py-2 hover:bg-white/5 transition-colors"
                onClick={() => toggleEpisode(ep.id)}
              >
                <ChevronRight
                  size={10}
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    transform: isCollapsed ? "rotate(0deg)" : "rotate(90deg)",
                    transition: "transform 0.15s",
                    flexShrink: 0,
                  }}
                />
                <Film size={10} style={{ color: "#E87322", flexShrink: 0 }} />
                <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)", flex: 1, textAlign: "left" }}>
                  {ep.name}
                </span>
                <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.25)" }}>
                  {ep.panels.length} 帧
                </span>
              </button>

              {/* Episode panels */}
              {!isCollapsed && (
                <div className="px-2 pb-2">
                  {ep.panels.length === 0 ? (
                    <div className="flex items-center justify-center rounded-lg py-3"
                      style={{ border: "1px dashed rgba(255,255,255,0.07)" }}>
                      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.2)" }}>暂无分镜</span>
                    </div>
                  ) : (
                    ep.panels.map((panel) => (
                      <div
                        key={panel.id}
                        className="rounded-lg p-1.5 mb-1 cursor-pointer hover:bg-white/5 transition-colors"
                        style={{ border: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        {/* Panel number + desc */}
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className="px-1.5 py-0.5 rounded flex-shrink-0"
                            style={{ background: "rgba(232,115,34,0.15)", color: "#E87322", fontSize: "9px" }}
                          >
                            #{panel.no}
                          </span>
                          <span className="text-xs truncate flex-1" style={{ color: "rgba(255,255,255,0.55)", fontSize: "10px" }}>
                            {panel.desc}
                          </span>
                          {panel.hasVideo && fields.video && (
                            <div className="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0"
                              style={{ background: "rgba(232,115,34,0.2)" }}>
                              <Play size={7} style={{ color: "#E87322" }} />
                            </div>
                          )}
                        </div>

                        {/* 静帧 image */}
                        {fields.image && panel.imageSrc && (
                          <div className="rounded overflow-hidden mb-1" style={{ height: "54px" }}>
                            <img src={panel.imageSrc} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        {fields.image && !panel.imageSrc && (
                          <div className="rounded flex items-center justify-center mb-1"
                            style={{ height: "36px", background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.07)" }}>
                            <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.2)" }}>暂无静帧</span>
                          </div>
                        )}

                        {/* 草分 script */}
                        {fields.script && (
                          <p className="truncate" style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
                            {panel.script}
                          </p>
                        )}

                        {/* 动态 video indicator (when no image shown) */}
                        {fields.video && !fields.image && panel.hasVideo && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Play size={8} style={{ color: "#E87322" }} />
                            <span style={{ fontSize: "9px", color: "rgba(232,115,34,0.7)" }}>含动态版本</span>
                          </div>
                        )}
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
