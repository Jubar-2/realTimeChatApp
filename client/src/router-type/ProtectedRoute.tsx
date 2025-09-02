import { Outlet, Navigate, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useCheckAuthorize, useRefreshToken } from "@/helper/auth";
import useUserStore from "@/store/user.store";
import { useEffect, useCallback } from "react";

const UNAUTHORIZED_ROUTE = "/";

export default function ProtectedRoute() {
  const { isAuthorize, user, clearUser } = useUserStore();
  const navigate = useNavigate();

  const { mutate: checkAuthorize } = useCheckAuthorize();
  const { mutate: refreshToken, isPending: isRefreshing } = useRefreshToken();

  const handleRefreshError = useCallback(() => {
    clearUser();
    navigate(UNAUTHORIZED_ROUTE, { replace: true });
  }, [clearUser, navigate]);

  if (!isAuthorize || !user) {
    return <Navigate to={UNAUTHORIZED_ROUTE} replace />;
  }


  useEffect(() => {
    checkAuthorize(
      { id: user.userId },
      {
        onError: (error) => {
          if (isAxiosError(error) && !isRefreshing) {
            refreshToken(undefined, {
              onError: handleRefreshError,
            });
          } else {
            handleRefreshError();
          }
        },
      }
    );
  }, [user?.userId, checkAuthorize, refreshToken, isRefreshing]);

  // if (isChecking || isRefreshing) {
  //   return (
  //     <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
  //       Loading...
  //     </div>
  //   );
  // }

  return <Outlet />;
}
