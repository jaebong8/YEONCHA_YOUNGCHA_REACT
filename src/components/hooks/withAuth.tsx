import { useEffect, useState, useMemo } from "react";
import { ComponentType } from "react";
import { auth } from "firebaseConfig/firebase";
import { useAuthIdToken } from "@react-query-firebase/auth";
import Spinner from "components/spinner/Spinner";
import { useLocation, useNavigate } from "react-router-dom";

function withAuth(Component: ComponentType) {
    return () => {
        const userUid = sessionStorage.getItem("signIn");
        const tokenResult = useAuthIdToken(["token"], auth);
        const navigate = useNavigate();
        const [isLoading, setIsLoading] = useState(true);
        const location = useLocation();
        const pathName = location.pathname;

        useEffect(() => {
            if (tokenResult.isLoading) return;
            //로그인한 상태
            if (tokenResult.data && userUid !== null && pathName === "/auth/signin") {
                navigate("/");
            }
            //로그아웃 상태
            if (tokenResult.data === null && pathName === "/") {
                navigate("/auth/signin");
            }
            setIsLoading(false);
        }, [tokenResult, userUid, navigate, pathName]);

        return isLoading ? <Spinner /> : <Component />;
    };
}

export default withAuth;
