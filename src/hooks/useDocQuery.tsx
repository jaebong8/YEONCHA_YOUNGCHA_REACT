import { doc } from "firebase/firestore";
import { db } from "firebaseConfig/firebase";
import { useFirestoreDocumentData } from "@react-query-firebase/firestore";

const useDocQuery = (collection: string) => {
    const userUid = sessionStorage.getItem("signIn") ?? "empty";
    const ref = doc(db, collection, userUid);
    const product = useFirestoreDocumentData([collection, userUid], ref, {
        subscribe: true,
    });
    return product;
};

export default useDocQuery;
