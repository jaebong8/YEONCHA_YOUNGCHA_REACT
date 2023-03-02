import { doc, DocumentData } from "firebase/firestore";
import { auth, db } from "firebaseConfig/firebase";
import { useFirestoreDocumentData } from "@react-query-firebase/firestore";
import { useAuthUser } from "@react-query-firebase/auth";
import { UseQueryResult } from "react-query/types/react";

const userUid = sessionStorage.getItem("signIn") ?? "empty";

const useDocQuery = (collection: string) => {
    const ref = doc(db, collection, userUid);
    const product = useFirestoreDocumentData([collection, userUid], ref, {
        subscribe: true,
    });
    return product;
};

export default useDocQuery;
