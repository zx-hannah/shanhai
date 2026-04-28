import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "sonner";

export default function App() {
  useEffect(() => {
    const redirect = sessionStorage.getItem("spa-redirect");
    if (redirect) {
      sessionStorage.removeItem("spa-redirect");
      const path = redirect.replace(/^\/shanhai/, "") || "/";
      router.navigate(path, { replace: true });
    }
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </>
  );
}
