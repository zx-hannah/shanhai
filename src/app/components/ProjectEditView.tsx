import { ProjectHomePage } from "./ProjectHomePage";

/**
 * 编辑权限下的项目总览：
 * - 不显示参与成员和效率诊断卡片
 * - 不显示生成预警 tab
 * - 成本和进度只显示自己的消耗
 * - 所有编辑操作（配额、权限、成员管理）已禁用
 */
export function ProjectEditView() {
  return <ProjectHomePage />;
}
