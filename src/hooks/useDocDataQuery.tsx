import { doc } from "firebase/firestore";
import { db } from "firebaseConfig/firebase";
import { useFirestoreDocumentData } from "@react-query-firebase/firestore";

const useDocDataQuery = (collection: string, document: string) => {
    const ref = doc(db, collection, document);
    const product = useFirestoreDocumentData([collection, document], ref, {
        subscribe: true,
    });
    return product;
};

export default useDocDataQuery;
