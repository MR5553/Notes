import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../store/auth.store";
import Loader from "../components/Loader";


export default function AppLayout() {
    const { isAuthenticated, hydrated } = useAuth();
    const location = useLocation();

    if (!hydrated) {
        return <Loader />;
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/sign-in"
                replace
                state={{ from: location }}
            />
        );
    }

    return <Outlet />;
}