import Calendar from "components/calendar/Calendar";
import Spinner from "components/spinner/Spinner";
import { auth } from "firebaseConfig/firebase";
import { useAuthSignInWithEmailAndPassword, useAuthSignOut, useAuthIdToken } from "@react-query-firebase/auth";
import withAuth from "components/hooks/withAuth";
const Home = () => {
    const mutationLogOut = useAuthSignOut(auth);
    return (
        <>
            <Calendar />
            <button
                onClick={() => {
                    mutationLogOut.mutate();
                    sessionStorage.removeItem("signIn");
                }}
            >
                로그아웃
            </button>
        </>
    );
};

export default withAuth(Home);
