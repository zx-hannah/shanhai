import { useState } from "react";
import { useNavigate } from "react-router";
import { PenTool, Plus, MoreHorizontal, Pencil, Trash2, Search, X } from "lucide-react";
import { toast } from "sonner";

interface CanvasFile {
  id: string;
  name: string;
  cover: string;
  updatedAt: string;
  size: string;
  projectName?: string;
}

const INITIAL_CANVAS_FILES: CanvasFile[] = [
  { id: "c1", name: "主角封面设计", cover: "https://images.unsplash.com/photo-1686747513617-ccd391daa3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", updatedAt: "2分钟前", size: "1920×1080", projectName: "东方神话·第一季" },
  { id: "c2", name: "场景合成-山林", cover: "https://images.unsplash.com/photo-1775193823752-84a3c871f93a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", updatedAt: "1小时前", size: "1920×1080", projectName: "东方神话·第一季" },
  { id: "c3", name: "角色立绘展示", cover: "https://images.unsplash.com/photo-1743951896798-2936f661f939?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", updatedAt: "昨天", size: "2048×1152", projectName: "星际征途" },
  { id: "c4", name: "片头背景合成", cover: "https://images.unsplash.com/photo-1760256993941-ec41ccc6e376?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", updatedAt: "3天前", size: "1920×1080", projectName: "星际征途" },
  { id: "c5", name: "神兽拟人角色", cover: "https://images.unsplash.com/photo-1636075219672-a422660ce589?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400&q=80", updatedAt: "一周前", size: "1920×1080", projectName: "山海奇谭" },
];

export function CanvasFilesPage() {
  const navigate = useNavigate();
  const [canvasFiles, setCanvasFiles] = useState<CanvasFile[]>(INITIAL_CANVAS_FILES);
  const [searchText, setSearchText] = useState("");
  const [moreMenuId, setMoreMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const filtered = canvasFiles.filter((f) =>
    !searchText || f.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleRename = (id: string) => {
    const f = canvasFiles.find((c) => c.id === id);
    if (f) { setRenamingId(id); setRenameValue(f.name); setMoreMenuId(null); }
  };

  const confirmRename = (id: string) => {
    if (renameValue.trim())
      setCanvasFiles((prev) => prev.map((f) => f.id === id ? { ...f, name: renameValue.trim() } : f));
    setRenamingId(null);
  };

  const handleDelete = (id: string) => {
    setCanvasFiles((prev) => prev.filter((f) => f.id !== id));
    setMoreMenuId(null);
    toast.success("已删除画布");
  };

  const handleCreate = () => {
    const newId = `c${Date.now()}`;
    const newCanvas: CanvasFile = {
      id: newId,
      name: `新画布 ${canvasFiles.length + 1}`,
      cover: "",
      updatedAt: "刚刚",
      size: "1920×1080",
    };
    setCanvasFiles((prev) => [...prev, newCanvas]);
    // In a real app, navigate to canvas editor: navigate(`/canvas/${newId}`)
    toast.success("新画布已创建，即将进入编辑器");
  };

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: "#140F09" }}
      onClick={() => setMoreMenuId(null)}
    >
      {/* Header */}
      <div
        className="flex items-center gap-4 px-6 py-4 flex-shrink-0"
        style={{ background: "#0D0A06", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="flex items-center gap-2">
          <PenTool size={16} style={{ color: "#E87322" }} />
          <span className="text-sm text-white">所有画布</span>
          <span
            className="px-2 py-0.5 rounded-full text-xs"
            style={{ background: "rgba(232,115,34,0.1)", color: "#E87322" }}
          >
            {canvasFiles.length} 个
          </span>
        </div>

        <div className="flex-1" />

        {/* Search */}
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-1.5"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", width: "200px" }}
        >
          <Search size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
          <input
            className="bg-transparent text-xs flex-1 outline-none"
            style={{ color: "rgba(255,255,255,0.7)", caretColor: "#E87322" }}
            placeholder="搜索画布..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          {searchText && (
            <button onClick={() => setSearchText("")}>
              <X size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
            </button>
          )}
        </div>

        {/* New canvas button */}
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-xs hover:opacity-80 transition-opacity"
          style={{ background: "#E87322" }}
        >
          <Plus size={13} />
          新建画布
        </button>
      </div>

      {/* Cards grid */}
      <div className="flex-1 overflow-auto px-6 py-5">
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
        >
          {/* New Canvas card — always first */}
          <button
            onClick={handleCreate}
            className="rounded-xl overflow-hidden flex flex-col items-center justify-center gap-3 transition-colors hover:bg-white/5 group"
            style={{
              background: "#1A1510",
              border: "2px dashed rgba(232,115,34,0.25)",
              aspectRatio: "16/10",
              minHeight: "140px",
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(232,115,34,0.1)", border: "1.5px dashed rgba(232,115,34,0.4)" }}
            >
              <Plus size={18} style={{ color: "#E87322" }} />
            </div>
            <span className="text-sm" style={{ color: "#E87322" }}>新建画布</span>
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>1920 × 1080</span>
          </button>

          {/* Existing canvas cards */}
          {filtered.map((file) => (
            <div
              key={file.id}
              className="rounded-xl overflow-hidden cursor-pointer group relative"
              style={{
                background: "#1A1510",
                border: "2px solid rgba(255,255,255,0.06)",
                transition: "border-color 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(232,115,34,0.35)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.06)"; }}
              onClick={() => toast.success(`打开「${file.name}」`)}
            >
              {/* Thumbnail */}
              <div className="relative overflow-hidden" style={{ aspectRatio: "16/9" }}>
                {file.cover ? (
                  <img
                    src={file.cover}
                    alt={file.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: "#231E17" }}>
                    <PenTool size={28} style={{ color: "rgba(255,255,255,0.15)" }} />
                  </div>
                )}
                {/* Hover overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.4)" }}
                >
                  <span className="px-3 py-1.5 rounded-lg text-xs text-white" style={{ background: "#E87322" }}>
                    打开编辑
                  </span>
                </div>

                {/* More menu button */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="relative">
                    <button
                      className="w-6 h-6 rounded-md flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
                      onClick={(e) => { e.stopPropagation(); setMoreMenuId(moreMenuId === file.id ? null : file.id); }}
                    >
                      <MoreHorizontal size={12} className="text-white" />
                    </button>
                    {moreMenuId === file.id && (
                      <div
                        className="absolute right-0 top-full mt-1 z-30 rounded-xl overflow-hidden"
                        style={{
                          background: "#2A2018",
                          border: "1px solid rgba(255,255,255,0.1)",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.7)",
                          minWidth: "130px",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleRename(file.id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left hover:bg-white/5"
                          style={{ color: "rgba(255,255,255,0.7)" }}
                        >
                          <Pencil size={11} />重命名
                        </button>
                        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left hover:bg-red-900/20"
                          style={{ color: "#ff6b6b" }}
                        >
                          <Trash2 size={11} />删除
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="px-3 py-2.5">
                {renamingId === file.id ? (
                  <input
                    autoFocus
                    className="w-full bg-transparent text-xs outline-none px-1 py-0.5 rounded"
                    style={{ border: "1px solid rgba(232,115,34,0.5)", color: "rgba(255,255,255,0.8)", caretColor: "#E87322" }}
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={() => confirmRename(file.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmRename(file.id);
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                  />
                ) : (
                  <div className="text-xs text-white truncate">{file.name}</div>
                )}
                <div
                  className="flex items-center justify-between mt-1"
                  style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}
                >
                  
                  <span>{file.updatedAt}</span>
                </div>
                {file.projectName && (
                  null
                )}
              </div>
            </div>
          ))}

          {/* Empty state */}
          {filtered.length === 0 && searchText && (
            <div
              className="col-span-full flex flex-col items-center justify-center py-16"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              <PenTool size={32} />
              <p className="mt-3 text-sm">未找到匹配的画布</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
