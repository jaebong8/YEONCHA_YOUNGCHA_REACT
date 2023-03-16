import { auth, db } from "firebaseConfig/firebase";
import withAuth from "components/hoc/withAuth";
import { Outlet } from "react-router-dom";

import { Avatar, Menu, MenuButton, MenuDivider, MenuGroup, MenuItem, MenuList } from "@chakra-ui/react";
import styles from "./Home.module.scss";
import { Img } from "@chakra-ui/react";
import longIconPath from "assets/images/longIcon.png";
import { NavLink } from "react-router-dom";
import { useFirestoreDocumentData } from "@react-query-firebase/firestore";
import { useAuthSignOut } from "@react-query-firebase/auth";
import { doc } from "firebase/firestore";

const Home = () => {
    const userUid = auth?.currentUser?.uid ?? "temp";
    const ref = doc(db, "users", userUid);
    const userInfo = useFirestoreDocumentData(["user", userUid], ref, {
        subscribe: true,
    }).data ?? {
        email: "temp",
        role: "temp",
        company: "temp",
        userUid: "temp",
        workers: {},
        documents: {},
    };
    const email = auth?.currentUser?.email;
    console.log(email);

    const mutationLogOut = useAuthSignOut(auth);
    let activeStyle = {
        backgroundColor: "#BEE3F8",
    };
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
                                    <MenuItem>{email}</MenuItem>
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
                <Outlet context={{ userInfo, userUid }} />
            </div>
        </>
    );
};

export default withAuth(Home);
