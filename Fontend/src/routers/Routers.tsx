import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router-dom";
import SignUp from "../pages/SignUp"
import SignIn from "@/pages/SignIn";
import ProtectedRoute from "@/router-type/ProtectedRoute";
import PublicRoute from "@/router-type/PublicRoute";
import Chat from "@/pages/Chat";
import Setting from "@/pages/Setting";

function Routers() {
    const router = createBrowserRouter([
        {
            element: <PublicRoute />,
            children: [
                {
                    path: "/signup",
                    element: <SignUp />
                },
                {
                    path: "/",
                    element: <SignIn />
                },
                {
                    path: "/signin",
                    element: <SignIn />
                }
            ]
        },
        {
            element: <ProtectedRoute />,
            children: [
                {
                    path: "/chat",
                    element:  <Chat />
                }
            ]
        },
        {
            element: <ProtectedRoute />,
            children: [
                {
                    path: "/setting",
                    element:  <Setting />
                }
            ]
        }
    ]);

    return (
        <RouterProvider router={router} />
    )
}

export default Routers