import { doc } from "firebase/firestore";
import { db } from "firebaseConfig/firebase";
import { useFirestoreDocumentData } from "@react-query-firebase/firestore";
import { timeUid } from "utils/common";

const useDocDataQuery = (collection: string, document: string) => {
    const ref = doc(db, collection, document);
    const product = useFirestoreDocumentData([collection, timeUid()], ref, {
        subscribe: true,
    });

    return product;
};

export default useDocDataQuery;
