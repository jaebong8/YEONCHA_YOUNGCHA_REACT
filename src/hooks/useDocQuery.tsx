import { doc } from "firebase/firestore";
import { auth, db } from "firebaseConfig/firebase";
import { useFirestoreDocumentData } from "@react-query-firebase/firestore";
import { useAuthUser } from "@react-query-firebase/auth";

const useDocQuery = (collection: string) => {
    // const user = useAuthUser(["user"], auth);
    // const ref = doc(db, collection, user?.data?.uid);
    // const product = useFirestoreDocumentData([collection, user?.data?.uid], ref, {
    //     subscribe: true,
    // });
    // return product;
    return null;
};

export default useDocQuery;
