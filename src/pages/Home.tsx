import Calendar from "components/calendar/Calendar";
import { auth, db } from "firebaseConfig/firebase";
import withAuth from "components/hoc/withAuth";
import { collection, query, where } from "firebase/firestore";
import { useFirestoreQuery, useFirestoreQueryData } from "@react-query-firebase/firestore";
import Layout from "layouts/Layout";
import { Outlet } from "react-router-dom";
import useDocDataQuery from "hooks/useDocDataQuery";
import Spinner from "components/spinner/Spinner";
const Home = () => {
    const userUid = auth?.currentUser?.uid ?? "";
    const userInfo = useDocDataQuery("users", userUid)?.data ?? {
        email: "",
        role: "",
        company: "",
        userUid: "",
        workers: {},
    };
    return (
        <>
            <Layout>
                <Outlet context={{ userInfo, userUid }} />
            </Layout>
        </>
    );
};

export default withAuth(Home);
