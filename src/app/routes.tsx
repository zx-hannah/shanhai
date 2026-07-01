import { createBrowserRouter, useParams } from "react-router";
import { MainLayout } from "./components/MainLayout";
import { HomePage } from "./components/HomePage";
import { ProjectsPage } from "./components/ProjectsPage";
import { ProjectDetailLayout } from "./components/ProjectDetailLayout";
import { ProjectHomePage } from "./components/ProjectHomePage";
import { ProjectEditView } from "./components/ProjectEditView";
import { ProjectReadView } from "./components/ProjectReadView";
import { ProjectAssetsPage } from "./components/ProjectAssetsPage";
import { ProjectGeneratePage } from "./components/ProjectGeneratePage";
import { ProjectCanvasPage } from "./components/ProjectCanvasPage";
import { ProjectStoryboardPage } from "./components/ProjectStoryboardPage";
import { ImageReviewPage } from "./components/ImageReviewPage";
import { ProjectSubjectsPage } from "./components/ProjectSubjectsPage";
import { ProjectScriptPage } from "./components/ProjectScriptPage";
import { CanvasFilesPage } from "./components/CanvasFilesPage";
import { GlobalAssetsPage } from "./components/GlobalAssetsPage";
import { InspirationExplorePage, PersonalGeneratePage } from "./components/PersonalGeneratePage";
import { ProjectLinkAccessPage } from "./components/ProjectLinkAccessPage";
import { getProjectById } from "./data/projectsData";

function ProjectIndexPage() {
  const { id } = useParams<{ id: string }>();
  const project = getProjectById(id ?? "");
  const perm = project?.permission ?? "编辑";
  if (perm === "阅读") return <ProjectReadView />;
  if (perm === "编辑") return <ProjectEditView />;
  return <ProjectHomePage />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "inspiration", Component: InspirationExplorePage },
      { path: "projects", Component: ProjectsPage },
      { path: "generate", Component: PersonalGeneratePage },
      { path: "assets", Component: GlobalAssetsPage },
      { path: "canvas", Component: CanvasFilesPage },
      { path: "project-link", Component: ProjectLinkAccessPage },
      { path: "project-review", Component: ImageReviewPage },
      { path: "*", Component: HomePage },
    ],
  },
  {
    path: "/project/:id",
    Component: ProjectDetailLayout,
    children: [
      { index: true, element: <ProjectIndexPage /> },
      { path: "subjects", Component: ProjectSubjectsPage },
      { path: "assets", Component: ProjectAssetsPage },
      { path: "generate", Component: ProjectGeneratePage },
      { path: "canvas", Component: ProjectCanvasPage },
      { path: "storyboard", Component: ProjectStoryboardPage },
      { path: "script", Component: ProjectScriptPage },
    ],
  },
]);
