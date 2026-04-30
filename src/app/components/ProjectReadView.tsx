import { ProjectHomePage } from "./ProjectHomePage";

/**
 * 阅读权限下的项目总览：
 * - 完全只读，所有编辑操作已禁用
 * - 不显示参与成员和效率诊断卡片
 * - 不显示生成预警 tab
 * - 只能看到自己的消耗和进度
 */
export function ProjectReadView() {
  return <ProjectHomePage />;
}
