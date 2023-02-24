import { Avatar, Box, Tab, TabList, Tabs } from "@chakra-ui/react";
import styles from "./Layout.module.scss";
import { Img } from "@chakra-ui/react";
import longIconPath from "assets/images/longIcon.png";
import { NavLink, useLocation } from "react-router-dom";
import { useMemo } from "react";

const Layout = (props: { children: React.ReactNode }) => {
    const location = useLocation();
    const pathName = location.pathname;
    const title = useMemo(() => {
        if (pathName === "/") return "연차 관리";
        if (pathName === "/workers") return "직원 관리";
    }, [pathName]);
    let activeStyle = {
        backgroundColor: "#319795",
        color: "#fff",
    };

    return (
        <div className={styles.container}>
            <nav className={styles.topNavBar}>
                <div className={styles.leftBox}>
                    <Img src={longIconPath} alt="longIcon" h="50px" objectFit="contain" />
                    <div className={styles.spacing}></div>
                    <ul className={styles.navLinks}>
                        <li>
                            <NavLink to="/" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
                                홈
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/workers" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
                                직원 관리
                            </NavLink>
                        </li>
                    </ul>
                </div>
                <div className={styles.rightBox}>
                    <Avatar src="https://bit.ly/broken-link" />
                </div>
            </nav>
            {props.children}
        </div>
    );
};

export default Layout;
