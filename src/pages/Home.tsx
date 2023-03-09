import Calendar from "components/calendar/Calendar";
import { auth, db } from "firebaseConfig/firebase";
import withAuth from "components/hoc/withAuth";
import { collection, query, where } from "firebase/firestore";
import { useFirestoreQuery, useFirestoreQueryData } from "@react-query-firebase/firestore";
import Layout from "layouts/Layout";
import { Outlet } from "react-router-dom";
import useDocDataQuery from "hooks/useDocDataQuery";
import Spinner from "components/spinner/Spinner";
import { Avatar, Menu, MenuButton, MenuDivider, MenuGroup, MenuItem, MenuList } from "@chakra-ui/react";
import styles from "./Home.module.scss";
import { Img } from "@chakra-ui/react";
import longIconPath from "assets/images/longIcon.png";
import { NavLink } from "react-router-dom";

import { useAuthSignOut } from "@react-query-firebase/auth";
const Home = () => {
    const userUid = auth?.currentUser?.uid ?? "temp";

    const userInfo = useDocDataQuery("users", userUid)?.data ?? {
        email: "temp",
        role: "temp",
        company: "temp",
        userUid: "temp",
        workers: {},
        documents: {},
    };

    const isLoading = useDocDataQuery("users", userUid).isLoading;
    const mutationLogOut = useAuthSignOut(auth);
    let activeStyle = {
        backgroundColor: "#BEE3F8",
    };
    // console.log(userInfo);
    return (
        <>
            <div className={styles.container}>
                <nav className={styles.topNavBar}>
                    <div className={styles.leftBox}>
                        <Img src={longIconPath} alt="longIcon" h="50px" objectFit="contain" />
                        <div className={styles.spacing}></div>
                        <ul className={styles.navLinks}>
                            <li>
                                <NavLink to="/calendar" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
                                    홈
                                </NavLink>
                            </li>
                            {userInfo?.role === "admin" && (
                                <li>
                                    <NavLink
                                        to="/workers"
                                        style={({ isActive }) => (isActive ? activeStyle : undefined)}
                                    >
                                        직원 관리
                                    </NavLink>
                                </li>
                            )}

                            <li>
                                <NavLink to="/documents" style={({ isActive }) => (isActive ? activeStyle : undefined)}>
                                    문서 관리
                                </NavLink>
                            </li>
                        </ul>
                    </div>
                    <div className={styles.rightBox}>
                        <Menu>
                            <MenuButton>
                                <Avatar bg="teal.500" />
                            </MenuButton>
                            <MenuList>
                                <MenuGroup title="Profile">
                                    <MenuItem>My Account</MenuItem>
                                    <MenuItem>Payments </MenuItem>
                                </MenuGroup>
                                <MenuDivider color="#DDD" />
                                <MenuGroup title="Help">
                                    <MenuItem>Docs</MenuItem>
                                    <MenuItem>FAQ</MenuItem>
                                </MenuGroup>
                                <MenuDivider color="#DDD" />
                                <MenuItem
                                    justifyContent={"center"}
                                    onClick={() => {
                                        mutationLogOut.mutate();
                                        sessionStorage.removeItem("signIn");
                                    }}
                                >
                                    Log Out
                                </MenuItem>
                            </MenuList>
                        </Menu>
                    </div>
                </nav>
                <Outlet context={{ userInfo, userUid, isLoading }} />
            </div>
        </>
    );
};

export default withAuth(Home);
