import { useState } from "react";
import {
  Layers, Eye, EyeOff, Lock, Unlock, ChevronRight, Plus, Image as LucideImage, Type,
  Minus, ZoomIn, ZoomOut, Move, MousePointer, Maximize2, MoreHorizontal,
  ChevronLeft,
} from "lucide-react";
import { ProjectAssetsSidebarPanel } from "./ProjectAssetsSidebarPanel";
import { StoryboardSidebarPanel } from "./StoryboardSidebarPanel";

type LayerType = "group" | "image" | "text" | "shape";
type CanvasSidebarTab = "files" | "assets" | "storyboard";

interface Layer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  children?: Layer[];
  expanded?: boolean;
}

const INITIAL_LAYERS: Layer[] = [
  { id: "g1", name: "前景元素", type: "group", visible: true, locked: false, expanded: true, children: [
    { id: "l1", name: "白发女侠_v3", type: "image", visible: true, locked: false },
    { id: "l2", name: "剑气特效", type: "image", visible: true, locked: false },
    { id: "l3", name: "角色名称", type: "text", visible: true, locked: false },
  ]},
  { id: "g2", name: "中景", type: "group", visible: true, locked: false, expanded: false, children: [
    { id: "l4", name: "古城楼", type: "image", visible: true, locked: false },
    { id: "l5", name: "云雾", type: "image", visible: false, locked: false },
  ]},
  { id: "l6", name: "背景-山林", type: "image", visible: true, locked: true },
  { id: "l7", name: "天空渐变", type: "shape", visible: true, locked: false },
];

const CANVAS_PAGES = [
  { id: "p1", name: "封面设计" },
  { id: "p2", name: "角色展示页" },
  { id: "p3", name: "场景合成" },
];

const TYPE_COLORS: Record<LayerType, string> = {
  group: "#E87322", image: "#4A9EE0", text: "#7BC47A", shape: "#9B59B6",
};

export function ProjectCanvasPage() {
  const [layers, setLayers] = useState<Layer[]>(INITIAL_LAYERS);
  const [selectedLayerId, setSelectedLayerId] = useState<string>("l1");
  const [activePage, setActivePage] = useState("p1");
  const [zoom, setZoom] = useState(75);
  const [tool, setTool] = useState<"select" | "move">("select");
  const [sidebarTab, setSidebarTab] = useState<CanvasSidebarTab>("files");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleLayerProp = (layerList: Layer[], id: string, prop: "visible" | "locked" | "expanded"): Layer[] => {
    return layerList.map((layer) => {
      if (layer.id === id) return { ...layer, [prop]: !layer[prop] };
      if (layer.children) return { ...layer, children: toggleLayerProp(layer.children, id, prop) };
      return layer;
    });
  };

  const renderLayer = (layer: Layer, depth = 0) => {
    const isSelected = selectedLayerId === layer.id;
    const isGroup = layer.type === "group";
    return (
      <div key={layer.id}>
        <div
          className="flex items-center gap-1 py-1 px-2 rounded cursor-pointer group transition-colors"
          style={{ paddingLeft: `${8 + depth * 12}px`, background: isSelected ? "rgba(232,115,34,0.15)" : "transparent", color: isSelected ? "#E87322" : "rgba(255,255,255,0.65)" }}
          onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.05)"; }}
          onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
          onClick={() => { setSelectedLayerId(layer.id); if (isGroup) setLayers(toggleLayerProp(layers, layer.id, "expanded")); }}
        >
          {isGroup && <ChevronRight size={10} style={{ color: "rgba(255,255,255,0.35)", transform: layer.expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s", flexShrink: 0 }} />}
          <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: TYPE_COLORS[layer.type], marginLeft: isGroup ? "0" : "14px" }} />
          <span className="flex-1 min-w-0 text-xs truncate ml-1.5">{layer.name}</span>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
            <button onClick={(e) => { e.stopPropagation(); setLayers(toggleLayerProp(layers, layer.id, "visible")); }} className="w-5 h-5 flex items-center justify-center">
              {layer.visible ? <Eye size={10} style={{ color: "rgba(255,255,255,0.5)" }} /> : <EyeOff size={10} style={{ color: "rgba(255,255,255,0.2)" }} />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); setLayers(toggleLayerProp(layers, layer.id, "locked")); }} className="w-5 h-5 flex items-center justify-center">
              {layer.locked ? <Lock size={10} style={{ color: "#E87322" }} /> : <Unlock size={10} style={{ color: "rgba(255,255,255,0.5)" }} />}
            </button>
          </div>
          {!layer.visible && <EyeOff size={9} style={{ color: "rgba(255,255,255,0.2)", marginLeft: "4px" }} />}
          {layer.locked && <Lock size={9} style={{ color: "rgba(232,115,34,0.5)", marginLeft: "2px" }} />}
        </div>
        {isGroup && layer.expanded && layer.children?.map((child) => renderLayer(child, depth + 1))}
      </div>
    );
  };

  const renderSidebarContent = () => {
    if (sidebarTab === "files") {
      return (
        <>
          {/* Pages */}
          <div className="px-3 py-2 border-b flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>页面</span>
              <button title="新建页面"><Plus size={12} style={{ color: "rgba(255,255,255,0.3)" }} /></button>
            </div>
            {CANVAS_PAGES.map((page) => (
              <button key={page.id} onClick={() => setActivePage(page.id)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors text-xs mb-0.5"
                style={{ background: activePage === page.id ? "rgba(232,115,34,0.12)" : "transparent", color: activePage === page.id ? "#E87322" : "rgba(255,255,255,0.5)" }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: activePage === page.id ? "#E87322" : "rgba(255,255,255,0.2)" }} />
                {page.name}
              </button>
            ))}
          </div>

          {/* Layers */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-3 py-2 border-b flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-1.5">
                <Layers size={12} style={{ color: "rgba(255,255,255,0.35)" }} />
                <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>图层</span>
              </div>
              <button title="新建图层"><Plus size={12} style={{ color: "rgba(255,255,255,0.3)" }} /></button>
            </div>
            <div className="flex-1 overflow-auto py-1">
              {layers.map((layer) => renderLayer(layer))}
            </div>
          </div>
        </>
      );
    }

    if (sidebarTab === "assets") {
      return <ProjectAssetsSidebarPanel />;
    }

    if (sidebarTab === "storyboard") {
      return <StoryboardSidebarPanel />;
    }

    return null;
  };

  return (
    <div className="flex h-full" style={{ background: "#140F09" }}>
      {/* Secondary Sidebar */}
      <div
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
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-2 right-1 z-10 w-5 h-5 rounded flex items-center justify-center hover:bg-white/10"
          style={{ color: "rgba(255,255,255,0.35)" }}
          title={sidebarCollapsed ? "展开侧边栏" : "收起侧边栏"}
        >
          {sidebarCollapsed ? <ChevronRight size={11} /> : <ChevronLeft size={11} />}
        </button>

        {!sidebarCollapsed && (
          <>
            {/* Tab bar */}
            <div className="flex flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {(["files", "assets", "storyboard"] as CanvasSidebarTab[]).map((tab) => {
                const labels = { files: "文件", assets: "资产", storyboard: "故事板" };
                return (
                  <button key={tab} onClick={() => setSidebarTab(tab)} className="flex-1 py-2.5 text-xs transition-colors relative"
                    style={{ color: sidebarTab === tab ? "#E87322" : "rgba(255,255,255,0.4)", borderBottom: sidebarTab === tab ? "2px solid #E87322" : "2px solid transparent" }}>
                    {labels[tab]}
                  </button>
                );
              })}
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
              {renderSidebarContent()}
            </div>
          </>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Canvas Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 flex-shrink-0 border-b" style={{ borderColor: "rgba(255,255,255,0.05)", background: "#0D0A06" }}>
          <div className="flex items-center gap-1">
            <button onClick={() => setTool("select")} className="w-7 h-7 rounded flex items-center justify-center transition-colors"
              style={{ background: tool === "select" ? "rgba(232,115,34,0.2)" : "rgba(255,255,255,0.05)", color: tool === "select" ? "#E87322" : "rgba(255,255,255,0.4)" }} title="选择">
              <MousePointer size={13} />
            </button>
            <button onClick={() => setTool("move")} className="w-7 h-7 rounded flex items-center justify-center transition-colors"
              style={{ background: tool === "move" ? "rgba(232,115,34,0.2)" : "rgba(255,255,255,0.05)", color: tool === "move" ? "#E87322" : "rgba(255,255,255,0.4)" }} title="移动">
              <Move size={13} />
            </button>
          </div>

          <div style={{ width: "1px", height: "16px", background: "rgba(255,255,255,0.08)" }} />

          <div className="flex items-center gap-1">
            <button className="w-7 h-7 rounded flex items-center justify-center transition-colors hover:bg-white/10">
              <LucideImage size={13} style={{ color: "rgba(255,255,255,0.4)" }} />
            </button>
            <button className="w-7 h-7 rounded flex items-center justify-center transition-colors hover:bg-white/10">
              <Type size={13} style={{ color: "rgba(255,255,255,0.4)" }} />
            </button>
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <button onClick={() => setZoom(Math.max(10, zoom - 10))} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10">
              <Minus size={11} style={{ color: "rgba(255,255,255,0.4)" }} />
            </button>
            <span className="text-xs px-2" style={{ color: "rgba(255,255,255,0.5)", minWidth: "48px", textAlign: "center" }}>{zoom}%</span>
            <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10">
              <Plus size={11} style={{ color: "rgba(255,255,255,0.4)" }} />
            </button>
            <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10">
              <Maximize2 size={11} style={{ color: "rgba(255,255,255,0.4)" }} />
            </button>
          </div>

          <button className="ml-2">
            <MoreHorizontal size={15} style={{ color: "rgba(255,255,255,0.3)" }} />
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-hidden relative flex items-center justify-center"
          style={{ backgroundImage: "radial-gradient(circle at 50% 50%, rgba(30,21,16,0.8) 0%, transparent 70%), repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.02) 39px, rgba(255,255,255,0.02) 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.02) 39px, rgba(255,255,255,0.02) 40px)", background: "radial-gradient(circle at 50% 50%, #1A1510 0%, #0D0A06 100%)" }}>
          <div className="relative rounded-lg shadow-2xl overflow-hidden"
            style={{ width: `${Math.round(560 * zoom / 100)}px`, height: `${Math.round(315 * zoom / 100)}px`, background: "#1A1510", border: "1px solid rgba(232,115,34,0.3)", transition: "all 0.2s" }}>
            <img src="https://images.unsplash.com/photo-1775193823752-84a3c871f93a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800&q=75" alt="canvas" className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.7 }} />
            <div className="absolute inset-0 flex items-end justify-center pb-4">
              <img src="https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=300&q=80" alt="character" className="h-4/5 object-contain" style={{ filter: "drop-shadow(0 0 20px rgba(232,115,34,0.3))" }} />
            </div>
            <div className="absolute top-0 left-0 right-0 h-4 flex items-center" style={{ background: "rgba(0,0,0,0.4)" }}>
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="flex-1 text-center" style={{ fontSize: "7px", color: "rgba(255,255,255,0.2)" }}>
                  {Math.round((i / 9) * (560 * zoom / 100))}
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-4 right-4 text-xs px-2 py-1 rounded" style={{ background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.4)" }}>
            1920 × 1080 · {zoom}%
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: "rgba(0,0,0,0.5)" }}>
            <button onClick={() => setZoom(Math.max(10, zoom - 25))} className="w-5 h-5 flex items-center justify-center hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
              <ZoomOut size={11} />
            </button>
            <span className="text-xs px-1" style={{ color: "rgba(255,255,255,0.5)" }}>{zoom}%</span>
            <button onClick={() => setZoom(Math.min(200, zoom + 25))} className="w-5 h-5 flex items-center justify-center hover:text-white transition-colors" style={{ color: "rgba(255,255,255,0.4)" }}>
              <ZoomIn size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
