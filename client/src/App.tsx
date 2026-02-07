import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { RouterProvider } from "react-router-dom"
import { Toaster } from "sonner";
import Loader from "./components/Loader";


const Landing = lazy(() => import("./pages/Landing"));
const Signup = lazy(() => import("./pages/Signup"));
const Signin = lazy(() => import("./pages/Signin"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/PasswordReset"));
const Home = lazy(() => import("./components/Home"));
const Editor = lazy(() => import("./components/Editor/Editor"));
const AuthLayout = lazy(() => import("./pages/AuthLayout"));
const WorkspaceLayout = lazy(() => import("./pages/WorkspaceLayout"));
const AppLayout = lazy(() => import("./pages/AppLayout"));
const NotFound = lazy(() => import("./pages/NotFound"));
const RouteError = lazy(() => import("./pages/RouteError"));
const AddWorkspace = lazy(() => import("./components/AddWorkspace"));
const Notification = lazy(() => import("./components/Notification"));
const Setting = lazy(() => import("./components/Setting"));
const Archived = lazy(() => import("./components/Archived"));


const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: "sign-up", element: <Signup /> },
      { path: "sign-in", element: <Signin /> },
      { path: "verifyemail/:id", element: <VerifyEmail /> },
      { path: "forget-password/:id", element: <ForgotPassword /> },
      { path: "reset-password/:id", element: <ResetPassword /> },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      { path: "/workspaces/create-workspace", element: <AddWorkspace /> },
      {
        path: "workspaces/:workspaceId",
        element: <WorkspaceLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: "pages/:pageId", element: <Editor /> },
          { path: "notification", element: <Notification /> },
          { path: "setting", element: <Setting /> },
          { path: "archived", element: <Archived /> },
        ]
      }
    ],
  },
  { path: "*", element: <NotFound /> },
  { ErrorBoundary: RouteError }
]);


export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <Toaster position="bottom-right" richColors duration={3000} closeButton={true} />
      <RouterProvider router={router} />
    </Suspense>
  )
}