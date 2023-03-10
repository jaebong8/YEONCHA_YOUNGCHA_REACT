import withAuth from "components/hoc/withAuth";
import styles from "./Workers.module.scss";
import { useMemo } from "react";

import { collection, doc } from "firebase/firestore";
import { auth, db } from "firebaseConfig/firebase";
import { differenceInYears, format } from "date-fns";
import { WorkerType } from "types/ts";
import { useFirestoreDocumentData } from "@react-query-firebase/firestore";
import { timeUid } from "utils/common";

const WorkersPage = () => {
    return (
        <>
            <section className={styles.section}>
                <div className={styles.tableContainer}>
                    <table>
                        <caption>직원 목록</caption>
                        <thead>
                            <tr>
                                <th>이름</th>
                                <th>생년월일</th>
                                <th>연락처</th>
                                <th>입사일</th>
                                <th>년차</th>
                                <th>연차 사용 횟수</th>
                            </tr>
                        </thead>
                        <tbody>
                            <WorkersComponent />
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
};

export default withAuth(WorkersPage);

const WorkersComponent = () => {
    const userUid = auth?.currentUser?.uid ?? "temp";
    const ref = doc(collection(db, "users"), userUid);
    const userInfo = useFirestoreDocumentData(["user", timeUid()], ref, {
        subscribe: true,
    });
    const workersInfo: WorkerType[] = useMemo(() => {
        return Object?.values({ ...userInfo?.data?.workers });
    }, [userInfo]);
    return (
        <>
            {workersInfo?.map((worker: WorkerType) => {
                const workYear = differenceInYears(new Date(), new Date(worker.workStartDate));
                const year = format(new Date(), "yyyy");
                return (
                    <tr key={`${worker.workerUid}`}>
                        <td>
                            <button className={styles.editBtn}>{worker.name}</button>
                        </td>
                        <td>{worker.birthDate}</td>
                        <td>{worker.phoneNumber}</td>
                        <td>{worker.workStartDate}</td>
                        <td>{`${workYear + 1}년차`}</td>
                        <td>{worker[year]}</td>
                    </tr>
                );
            })}
        </>
    );
};
