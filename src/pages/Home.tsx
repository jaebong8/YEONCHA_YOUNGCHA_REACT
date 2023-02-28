import Calendar from "components/calendar/Calendar";
import { db } from "firebaseConfig/firebase";
import withAuth from "components/hoc/withAuth";
import { collection, query } from "firebase/firestore";
import { useFirestoreQuery } from "@react-query-firebase/firestore";
import Layout from "layouts/Layout";
import { Outlet } from "react-router-dom";
const Home = () => {
    const ref = query(collection(db, "users"));
    const queryRef = useFirestoreQuery(["users"], ref, {
        subscribe: true,
    });
    const snapshot = queryRef.data;
    snapshot?.docs.map((docSnapshot) => {
        const data = docSnapshot.data();
        console.log(data);
    });
    return (
        <>
            <Layout>
                <Calendar />
            </Layout>
            <Outlet />
        </>
    );
};

export default withAuth(Home);
