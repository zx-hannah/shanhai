import { createBrowserRouter } from "react-router";
import { MainLayout } from "./components/MainLayout";
import { HomePage } from "./components/HomePage";
import { ProjectsPage } from "./components/ProjectsPage";
import { ProjectDetailLayout } from "./components/ProjectDetailLayout";
import { ProjectHomePage } from "./components/ProjectHomePage";
import { ProjectAssetsPage } from "./components/ProjectAssetsPage";
import { ProjectGeneratePage } from "./components/ProjectGeneratePage";
import { ProjectCanvasPage } from "./components/ProjectCanvasPage";
import { ProjectStoryboardPage } from "./components/ProjectStoryboardPage";
import { CanvasFilesPage } from "./components/CanvasFilesPage";
import { GlobalAssetsPage } from "./components/GlobalAssetsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "projects", Component: ProjectsPage },
      { path: "assets", Component: GlobalAssetsPage },
      { path: "canvas", Component: CanvasFilesPage },
      { path: "*", Component: HomePage },
    ],
  },
  {
    path: "/project/:id",
    Component: ProjectDetailLayout,
    children: [
      { index: true, Component: ProjectHomePage },
      { path: "assets", Component: ProjectAssetsPage },
      { path: "generate", Component: ProjectGeneratePage },
      { path: "canvas", Component: ProjectCanvasPage },
      { path: "storyboard", Component: ProjectStoryboardPage },
    ],
  },
]);