# 山海 AI 视频创作平台 — 产品需求文档（PRD）

> 版本：v1.0 | 日期：2026-05-08 | 状态：已实现

---

## 一、产品概述

山海是一个 AI 驱动的视频创作管理平台，面向影视制作团队和企业用户，提供从剧本编写、角色/场景资产管理、AI 生成、分镜编排到画布编辑的端到端创作工具链。核心特色：

- **多空间架构**：个人空间 / 企业空间（所有者/成员）
- **Token 经济**："生产栗"作为 AI 生成消耗单位，支持企业级、项目级、成员级配额管理
- **权限体系**：管理 / 编辑 / 阅读三级权限，控制页面访问和操作能力
- **AI 生成**：接入 Seedream 3.0 等模型，支持图片、视频生成

---

## 二、全局架构

### 2.1 路由结构

```
/                           → HomePage（主页/创作入口）
  /projects                 → ProjectsPage（项目列表）
  /assets                   → GlobalAssetsPage（全局资产库）
  /canvas                   → CanvasFilesPage（画布文件管理）

/project/:id                → ProjectDetailLayout（项目容器）
  /                         → ProjectIndexPage（按权限分发）
  /subjects                 → ProjectSubjectsPage（主体管理）
  /assets                   → ProjectAssetsPage（项目资产）
  /generate                 → ProjectGeneratePage（AI 生成）
  /canvas                   → ProjectCanvasPage（画布编辑器）
  /storyboard               → ProjectStoryboardPage（分镜管理）
  /script                   → ProjectScriptPage（剧本编辑）
```

### 2.2 空间体系

| 空间类型 | 说明 | 关键差异 |
|---------|------|---------|
| **个人空间** | 用户个人创作环境 | "项目"导航隐藏；无企业 Token；不可新建企业空间项目 |
| **企业所有者空间** | 企业管理员 | 可创建项目、分配 Token、管理成员、审批设置 |
| **企业成员空间** | 企业普通成员 | 可见项目受权限限制；不可创建新项目；只能查看个人消耗 |

空间切换入口：左侧导航底部用户头像 → 弹出 SpaceSwitcher → 选择空间或打开企业设置。

### 2.3 权限体系

| 权限 | 剧本 | 主体 | 生成 | 分镜 | 成员管理 | 配额管理 | 项目编辑 |
|-----|------|------|------|------|---------|---------|---------|
| **管理** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **编辑** | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌（仅自己消耗） |
| **阅读** | ✅（只读） | ✅（只读） | ❌ | ✅（只读） | ❌ | ❌ | ❌ |

---

## 三、用户流程

### 流程一：创建项目

**入口**：
- 主页 → "创建项目"功能卡片
- 项目列表页 → "新建项目"卡片

**创建表单**（CreateProjectDialog）：
1. **项目名称** — 必填，示例提示"东方神话·第二季"
2. **项目额度** — 必填，数字输入，单位"颗"（生产栗），从企业 Token 池中扣除
3. **封面图片**（可选）— 支持 JPG/PNG/WebP，最大 5MB，可上传/替换/移除

**创建成功后**：
- Toast 提示"项目创建成功"
- 自动跳转到项目详情页 `/project/:id`
- 项目状态默认为"进行中"

**限制**：
- 个人空间下"新建项目"按钮不显示
- 只读空间下"新建项目"按钮禁用，hover 显示 Tooltip 提示无权限

---

### 流程二：进入项目 — 项目总览（ProjectHomePage）

**权限分发**：
- 管理权限 → ProjectHomePage（完整看板）
- 编辑权限 → ProjectEditView（隐藏成员卡片、效率诊断、生成预警标签）
- 阅读权限 → ProjectReadView（只读模式，无操作按钮）

#### 2.1 项目头部

- **封面图** — 横向宽幅展示
- **项目名称** — 可编辑（管理权限）
- **状态标签** — 进行中 / 已完成 / 暂停
- **项目描述** — 可编辑
- **快捷操作按钮** — 剧本 / 主体 / 生成 / 分镜 / 资产 / 画布，点击跳转到对应子页面

#### 2.2 数据标签页

**标签一：项目成本**
- 消耗趋势图（Recharts AreaChart，支持按周期切换：全部/本周/本月/本年/自定义）
- 消耗明细（按日/按模块 BarChart）
- 成员消耗饼图（PieChart）
- 交易记录列表（时间/成员/操作/消耗量）

**标签二：分镜进度**
- 剧集进度表格（集数/完成状态/分镜数）
- 可视化进度条

**标签三：生成预警**（仅管理权限可见）
- Token 消耗预警
- 异常生成任务提示

#### 2.3 成员管理区域

- **成员列表** — 头像/名称/角色/生成次数/消耗量
- **成员 Token 配额** — 三种类型：
  - 无限（unlimited）— 不限制
  - 周期性（periodic）— 按周/月/年重置
  - 固定额度（fixed）— 一次性分配
- **成员贡献统计** — 生成次数、消耗排行

#### 2.4 管理操作（管理权限）

- **编辑项目基本信息** — EditProjectBasicInfoDialog（名称/描述/封面/状态）
- **编辑项目成员** — EditProjectMembersDialog（添加/移除/修改角色）
- **分配成员 Token** — AllocateMemberTokenDialog
- **编辑项目总额度** — EditProjectTotalQuotaDialog
- **项目配额管理** — ProjectQuotaDialog

#### 2.5 AI 效率诊断（管理权限）

- 生成成功率分析
- 平均生成时间
- Token 利用率评估

---

### 流程三：剧本模块（ProjectScriptPage）

**入口**：项目左侧导航 → 剧本

**左侧导航**：
- 可展开/收起
- 章节/剧集树形结构
- 支持新建章节、重命名、删除
- "资产"Tab 切换

**中央编辑器**：
- 剧本内容编辑区域
- 顶部显示当前集名称
- 字数统计 / 上限 2000 字
- 编辑模式切换（编辑/预览）

**顶部操作栏**：
- **全剧本解析** — AI 分析剧本内容，提取场景、角色等信息
- **上传剧本** — 支持 .txt / .doc / .docx / .pdf 格式

**右侧全局设置**：
- 总字数统计
- 总集数
- 视频比例：16:9 / 9:16 / 4:3 / 3:4
- 分辨率：720p / 1080p / 2K / 4K
- 帧率：24fps / 30fps / 60fps

---

### 流程四：主体管理（ProjectSubjectsPage）

**入口**：项目左侧导航 → 主体

**左侧资产栏**（可展开/收起，240px 宽）：

**Tab 一：生成**
- 从 AI 生成的资产图片网格
- 每张卡片左上角显示类型图标（图片/视频/音频）
- 部分卡片显示"已应用"标签
- Hover：收藏（Star）+ 更多（下载/删除）
- 支持拖拽到右侧创建区域

**Tab 二：上传**
- 本地上传的资产
- 顶部有"上传资产"按钮
- 其余同生成 Tab

**Tab 三：主体**（核心）
- 按四个分类分组，支持展开/收起：
  - **SD 虚拟 IP** — 橙色标签，显示审核状态
  - **角色** — 紫色标签
  - **场景** — 蓝色标签
  - **道具** — 粉色标签
- 点击卡片 → 显示详情面板（大图、名称、描述、大小/日期）
- 点击"返回" → 回到资产网格

**Tab 四：收藏**
- 用户手动收藏的资产
- 交互同生成 Tab

**右侧主内容区**：

**类型筛选标签**：SD虚拟IP / 角色 / 场景 / 道具，各有数量统计

**搜索框**：按名称搜索

**创建卡片**：当前类型下显示一个虚线边框的创建按钮

**主体创建**：
- 点击类型创建卡片 → 进入创建页面
- SD 虚拟 IP：极简流程，上传照片 + 自动填充名称
- 角色/场景/道具：单栏居中布局（最大 560px）
  - 图片上传区（虚线边框，支持上传/拖拽/前往生成）
  - 名称输入
  - 描述输入

**主体详情页**（查看模式）：
- 左侧大图（3:4 比例）
- 右侧信息：
  - 名称（可编辑）
  - 描述（可编辑、可复制）
  - 剧集数据（出现集数、占比）
  - 图片信息（来源：本地上传/AI生成）
    - AI 生成时额外显示：模型名称、比例、提示词、参考图

**SD 虚拟 IP 详情页**：
- 全屏大图展示
- 顶部栏：名称（可编辑）+ 审核状态标签
- 图片支持替换（上传/拖拽）

**SD 虚拟 IP 卡片展示**：
- 左上角：审核状态标签（审核中/审核通过/审核失败/已过期）
- 审核中/审核失败：全屏蒙层覆盖
- Hover：右上角编辑 + 删除图标

---

### 流程五：AI 生成（ProjectGeneratePage）

**入口**：项目左侧导航 → 生成（仅管理/编辑权限可见）

**左侧导航**（三 Tab）：
- **文件** — 文件夹树形结构（美术设定/第一集/第二集…）
  - 固定分类展示（macOS Finder 风格侧边栏分组）
  - 展开显示 Session 列表
  - "新建 Session" 按钮在文件夹底部
- **资产** — 生成/上传/主体/收藏（同主体模块侧边栏）
- **故事板** — 剧集/场景树

**主区域 — AI 对话式生成**：
- 对话历史展示
  - 用户消息（Prompt 文本）
  - AI 回复（生成的图片网格 / 视频带播放按钮）
- 图片 Hover：收藏 / 下载 / 重新生成变体
- 筛选面板：成员筛选 / 类型筛选（图片/视频/全部）/ 时间筛选 / 关键词搜索

**底部输入区**：
- Prompt 输入框
- "+" 按钮（附加选项）
- 分辨率选择
- 数量选择
- 发送按钮

---

### 流程六：画布编辑器（ProjectCanvasPage）

**入口**：项目左侧导航 → 画布

**左侧导航**（三 Tab）：
- **文件** — 页面列表 + 图层树（前景/中景/背景分组）
- **资产** — 同主体模块侧边栏
- **故事板** — 剧集/场景树

**工具栏**：
- 选择/移动工具
- 图片/文字工具
- 缩放控制（10% - 200%）

**画布区域**：
- 网格背景
- 合成图像展示
- 尺寸标注显示

---

### 流程七：分镜管理（ProjectStoryboardPage）

**入口**：项目左侧导航 → 分镜

**左侧导航**：
- **文件** Tab
- **资产** Tab
- 剧集/场景树形结构

**两种视图模式**：
1. **画面表**（表格视图）
   - 列：事件 / 场次 / 分镜号 / 文字脚本 / 画面参考 / 分镜图 / 人员 / 时长 / 画面进度 / 备注
   - 双击单元格可编辑
2. **卡片视图**
   - 分镜卡片网格展示

**顶部操作**：
- **上传剧本** — 从文件解析分镜
- **分享** — ShareModal（选择剧集/场景 + 设置只读/编辑权限 + 复制链接）
- **导出** — 导出分镜数据

---

### 流程八：项目资产（ProjectAssetsPage）

**入口**：项目左侧导航 → 资产

**Tab 栏**：全部生成 / 历史上传 / 主体资产 / 全部收藏

**筛选栏**：
- 搜索
- 类型下拉（图片/视频/音频）
- 排序切换
- 批量模式开关
- 网格/列表切换

**批量模式**：
- 全选
- 批量收藏/下载/删除

**网格视图**：
- 方形卡片，带预览图
- 类型标签（图片/视频/音频）
- Hover 操作：收藏 / 删除

**列表视图**：
- 行展示：缩略图 / 名称 / 大小 / 日期 / 操作

**详情弹窗**：
- 完整大图
- 元数据信息
- 下载按钮

---

### 流程九：全局资产（GlobalAssetsPage）

**入口**：主页左侧导航 → 资产

**左侧导航**（个人空间隐藏）：
- 个人资产
- 共享资产
- 成员资产

**主区域**：
- 项目文件夹层级视图
- 资产网格/列表
- 丰富筛选：Tab / 类型 / 成员 / 已收藏 / 日期范围 / 排序

---

### 流程十：画布文件（CanvasFilesPage）

**入口**：主页左侧导航 → 画布

**顶部**：搜索 + "新建画布"按钮

**画布卡片网格**：
- 缩略图预览
- Hover 叠加："打开编辑"
- 更多菜单：重命名 / 删除
- "新建画布"卡片始终排在第一位

---

## 四、核心组件清单

| 组件 | 文件 | 职责 |
|-----|------|------|
| MainLayout | MainLayout.tsx | 根布局：全局左侧导航、SpaceSwitcher、TokenModal、TaskQueue |
| HomePage | HomePage.tsx | 主页：AI 输入框、近期项目、功能卡片 |
| ProjectsPage | ProjectsPage.tsx | 项目列表页：项目网格 + 新建项目入口 |
| ProjectDetailLayout | ProjectDetailLayout.tsx | 项目容器布局：图标侧栏 + 面包屑头部 |
| ProjectHomePage | ProjectHomePage.tsx | 项目总览看板：成本/进度/成员/效率 |
| ProjectEditView | ProjectEditView.tsx | 编辑权限视图（ProjectHomePage 的受限版本） |
| ProjectReadView | ProjectReadView.tsx | 只读权限视图（ProjectEditView 的进一步受限版本） |
| ProjectSubjectsPage | ProjectSubjectsPage.tsx | 主体管理：四类型创建、资产侧栏、详情页 |
| ProjectGeneratePage | ProjectGeneratePage.tsx | AI 生成：对话式生成 + 文件夹侧栏 |
| ProjectCanvasPage | ProjectCanvasPage.tsx | 画布编辑器 |
| ProjectStoryboardPage | ProjectStoryboardPage.tsx | 分镜管理：表格/卡片双视图 |
| ProjectScriptPage | ProjectScriptPage.tsx | 剧本编辑：章节树 + 编辑器 + 全局设置 |
| ProjectAssetsPage | ProjectAssetsPage.tsx | 项目资产库 |
| GlobalAssetsPage | GlobalAssetsPage.tsx | 跨项目全局资产库 |
| CanvasFilesPage | CanvasFilesPage.tsx | 画布文件管理 |
| CreateProjectDialog | CreateProjectDialog.tsx | 创建项目弹窗 |
| TokenModal | TokenModal.tsx | Token 详情弹窗 |
| SpaceSwitcher | SpaceSwitcher.tsx | 空间切换器 |
| EnterpriseSettings | EnterpriseSettings.tsx | 企业设置（成员/项目/审批/消费/订单） |

---

## 五、数据模型

### ProjectData
```
id: string              // 项目唯一标识
name: string            // 项目名称
description: string     // 项目描述
cover: string           // 封面图 URL
status: "进行中"|"已完成"|"暂停"
progress: number        // 进度百分比
episodes: number        // 总集数
completedEpisodes: number // 已完成集数
totalAssets: number     // 资产总数
tokenUsed: number       // 已消耗 Token
tokenTotal: number      // 总分配 Token
startDate: string       // 开始日期
members: Member[]       // 成员列表
permission: "管理"|"编辑"|"阅读"
```

### SubjectItem
```
id: string
name: string
type: "sd_ip"|"character"|"scene"|"prop"
image: string
description?: string
reviewStatus?: "pending"|"approved"|"rejected"|"expired"
episodes?: string[]
imageSource?: "local"|"ai"
modelName?: string
imageRatio?: string
referenceImage?: string
promptText?: string
```

### SidebarAsset
```
id: string
name: string
type: "image"|"video"|"audio"
src: string
size: string
date: string
```

---

## 六、UI 设计规范

### 色彩系统
| 用途 | 色值 |
|-----|------|
| 主色调 | `#E87322` 橙色 |
| 辅助色 | `#7B3FC4` 紫色 / `#2A6FC4` 蓝色 / `#C42A6F` 粉色 |
| 成功 | `#4AC678` |
| 警告/失败 | `#ff6b6b` |
| 背景 | `#140F09` / `#1A1510` / `#110E0A` |
| 边框 | `rgba(255,255,255,0.05)` ~ `rgba(255,255,255,0.1)` |
| 文字层级 | `rgba(255,255,255,0.85)` 主要 / `0.7` 次要 / `0.4` 辅助 / `0.25` 弱化 |

### 字号层级
- 8px：资产卡片名称
- 9px：侧栏类型标签
- 10px：侧栏 Tab 文字
- 11px：标签/小徽标
- 12px：正文辅助
- 13px：正文
- 14px：标题/输入
- 15px：强调名称
- 18px：详情页标题

---

## 七、技术栈

- **前端框架**：React 18 + TypeScript
- **路由**：React Router v6（createBrowserRouter）
- **构建工具**：Vite 6（ESBuild JSX 转换）
- **样式**：Tailwind CSS + 内联样式（CSS-in-JS）
- **图标**：lucide-react
- **图表**：Recharts（AreaChart / BarChart / PieChart）
- **通知**：sonner（Toast）
- **主题**：深色主题，无暗色切换

---

## 八、交互细节备忘

### 主体创建流程
1. 在主体页面顶部选择类型标签（SD虚拟IP/角色/场景/道具）
2. 点击对应类型的创建卡片
3. SD虚拟IP：上传照片 → 自动取文件名 → 创建
4. 角色/场景/道具：上传图片（支持上传/拖拽/从生成模块跳转） → 填写名称 → 填写描述 → 创建
5. 创建后新主体出现在列表中，可点击查看详情

### 拖拽流程
1. 左侧资产栏的图片支持 `draggable`
2. 拖拽时 `dataTransfer` 传递 `{ src, name }` JSON
3. 右侧创建/编辑区的上传区域支持 `onDrop`
4. 从资产拖入：直接使用 `src` URL
5. 从本地拖入：`URL.createObjectURL` 处理

### Token 消耗流程
1. 企业级 Token 池 → 分配给项目 → 分配给成员
2. AI 生成时扣除对应 Token
3. 项目总览页可查看消耗趋势、成员消耗排行
4. 管理权限可调整项目总额度和成员配额

### 审核流程（SD 虚拟 IP）
1. 创建后进入"审核中"状态
2. 卡片显示蒙层覆盖 + 沙漏图标
3. 审核通过 → 蒙层消失，绿色标签
4. 审核失败 → 红色蒙层 + 叉号 + "请重新提交审核"提示
