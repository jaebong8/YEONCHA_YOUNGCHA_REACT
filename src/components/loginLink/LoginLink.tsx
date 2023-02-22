import styles from "./LoginLink.module.scss";
import { memo } from "react";
import { Link, useLocation } from "react-router-dom";

const LoginLink = () => {
    const location = useLocation();
    const pathName = location.pathname;
    return (
        <div className={styles.loginLink}>
            <span>{pathName === "/auth/signin" ? "아이디가 없으신가요?" : "아이디가 이미 있으신가요?"}</span>
            <Link to={pathName === "/auth/signin" ? "/auth/signup" : "/auth/signin"}>
                {pathName === "/auth/signin" ? "회원가입" : "로그인"}
            </Link>
        </div>
    );
};

export default memo(LoginLink);
