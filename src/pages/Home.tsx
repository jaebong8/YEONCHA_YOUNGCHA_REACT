import Calendar from "components/calendar/Calendar";
import { db } from "firebaseConfig/firebase";
import withAuth from "components/hoc/withAuth";
import { collection, query, where } from "firebase/firestore";
import { useFirestoreQuery, useFirestoreQueryData } from "@react-query-firebase/firestore";
import Layout from "layouts/Layout";
import { Outlet } from "react-router-dom";
import useDocDataQuery from "hooks/useDocDataQuery";
const Home = () => {
    const userUid = sessionStorage.getItem("signIn") ?? "empty";
    const userInfo = useDocDataQuery("users", userUid);
    console.log(userInfo);

    return (
        <>
            <Layout>
                <Outlet />
            </Layout>
        </>
    );
};

export default withAuth(Home);
