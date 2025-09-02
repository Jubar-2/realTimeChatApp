// import { Navigate } from "react-router-dom";
import { Navigate, Outlet } from "react-router-dom";
import useUserStore from "@/store/user.store";


export default function ProtectedRoute() {
    const { isAuthorize, user } = useUserStore();

    if (isAuthorize && user) {
        return <Navigate to={"/chat"} replace />;
    }

    return (
        <Outlet />
    );
}


