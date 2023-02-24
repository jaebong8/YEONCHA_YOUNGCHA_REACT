import Calendar from "components/calendar/Calendar";
import Spinner from "components/spinner/Spinner";
import { auth, db } from "firebaseConfig/firebase";
import { useAuthSignInWithEmailAndPassword, useAuthSignOut, useAuthIdToken } from "@react-query-firebase/auth";
import withAuth from "components/hooks/withAuth";
import { collection, query } from "firebase/firestore";
import { useFirestoreQuery } from "@react-query-firebase/firestore";
import Layout from "layouts/Layout";
import { Outlet } from "react-router-dom";
const Home = () => {
    const mutationLogOut = useAuthSignOut(auth);
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
                <button
                    onClick={() => {
                        mutationLogOut.mutate();
                        sessionStorage.removeItem("signIn");
                    }}
                >
                    로그아웃
                </button>
            </Layout>
            <Outlet />
        </>
    );
};

export default withAuth(Home);
