import withAuth from "components/hoc/withAuth";
import styles from "./Workers.module.scss";
import { useMemo } from "react";

import { collection, doc } from "firebase/firestore";
import { auth, db } from "firebaseConfig/firebase";
import { differenceInYears } from "date-fns";
import { WorkerType } from "types/ts";
import { useFirestoreDocumentData } from "@react-query-firebase/firestore";
import { timeUid } from "utils/common";
import { Spinner } from "@chakra-ui/react";
const Workers = () => {
    // const workersInfo: WorkerType[] | undefined = userInfo.data && Object.values(userInfo?.data?.workers);

    // const onSubmitHandler = useCallback(
    //     (e: React.FormEvent<HTMLElement>) => {
    //         e.preventDefault();
    //         const saveUser = async () => {
    //             let uuid = crypto.randomUUID();
    //             try {
    //                 if (birthDate !== null && workStartDate !== null) {
    //                     await setDoc(
    //                         doc(db, "users", userUid),
    //                         {
    //                             workers: {
    //                                 [uuid]: {
    //                                     name,
    //                                     phoneNumber,
    //                                     birthDate: format(birthDate, "yyyy/MM/dd"),
    //                                     workStartDate: format(workStartDate, "yyyy/MM/dd"),
    //                                     role: "worker",
    //                                     workerUid: uuid,
    //                                 },
    //                             },
    //                         },
    //                         { merge: true }
    //                     );
    //                     toast({
    //                         title: `직원등록을 성공하였습니다.`,
    //                         status: "success",
    //                         duration: 5000,
    //                         isClosable: true,
    //                     });
    //                 }
    //             } catch (error) {
    //                 console.log(error);
    //                 toast({
    //                     title: "직원등록을 실패하였습니다.",
    //                     status: "error",
    //                     duration: 5000,
    //                     isClosable: true,
    //                 });
    //             }
    //         };
    //         saveUser();
    //         setName("");
    //         setPhoneNumber("");
    //         setBirthDate(null);
    //         setWorkStartDate(null);
    //     },
    //     [name, birthDate, workStartDate, phoneNumber, userUid, toast]
    // );

    // const deleteHandler = (worker: WorkerType) => {
    //     const keyName = `workers.${clickedWorker.workerUid}`;
    //     const deleteUser = async () => {
    //         try {
    //             await updateDoc(doc(db, "users", userUid), {
    //                 [keyName]: deleteField(),
    //             });
    //             editModal.onClose();
    //             toast({
    //                 title: `직원 삭제를 성공하였습니다.`,
    //                 status: "success",
    //                 duration: 5000,
    //                 isClosable: true,
    //             });
    //         } catch (error) {
    //             console.log(error);
    //             toast({
    //                 title: `직원 삭제를 실패하였습니다.`,
    //                 status: "error",
    //                 duration: 5000,
    //                 isClosable: true,
    //             });
    //         }
    //     };
    //     deleteUser();
    // };

    // const editSubmitHandler = useCallback(
    //     async (e: React.FormEvent<HTMLElement>) => {
    //         e.preventDefault();
    //         const keyName = `workers.${clickedWorker.workerUid}`;
    //         try {
    //             await updateDoc(doc(db, "users", userUid), {
    //                 [keyName]: {
    //                     name: clickedWorker.name,
    //                     phoneNumber: clickedWorker.phoneNumber,
    //                     birthDate: clickedWorker.birthDate,
    //                     workStartDate: clickedWorker.workStartDate,
    //                     role: "worker",
    //                     workerUid: clickedWorker.workerUid,
    //                 },
    //             });
    //             toast({
    //                 title: `직원 수정을 성공하였습니다.`,
    //                 status: "success",
    //                 duration: 5000,
    //                 isClosable: true,
    //             });
    //             editModal.onClose();
    //         } catch (error) {
    //             console.log(error);
    //         }
    //     },
    //     [
    //         clickedWorker.name,
    //         clickedWorker.phoneNumber,
    //         clickedWorker.birthDate,
    //         clickedWorker.workStartDate,
    //         clickedWorker.workerUid,
    //         editModal,
    //         userUid,
    //         toast,
    //     ]
    // );

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

export default withAuth(Workers);

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
                return (
                    <tr key={`${worker.workerUid}`}>
                        <td>
                            <button className={styles.editBtn}>{worker.name}</button>
                        </td>
                        <td>{worker.birthDate}</td>
                        <td>{worker.phoneNumber}</td>
                        <td>{worker.workStartDate}</td>
                        <td>{`${workYear + 1}년차`}</td>
                    </tr>
                );
            })}
        </>
    );
};
