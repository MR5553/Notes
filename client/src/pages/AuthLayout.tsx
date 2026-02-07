import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../store/auth.store";
import Loader from "../components/Loader";
import { useWorkspace } from "../store/workspace.store";

export default function AuthLayout() {
    const { isAuthenticated, hydrated } = useAuth();
    const { currentWorkspaceId } = useWorkspace();

    if (!hydrated) {
        return <Loader />;
    }

    if (isAuthenticated) {
        return <Navigate to={`/workspaces/${currentWorkspaceId}`} replace />;
    }

    return <Outlet />;
}