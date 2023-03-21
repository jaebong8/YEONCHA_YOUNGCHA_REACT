import withAuth from "components/hoc/withAuth";
import styles from "./Workers.module.scss";
import { useMemo, useState, useCallback } from "react";

import { collection, doc } from "firebase/firestore";
import { auth, db } from "firebaseConfig/firebase";
import { differenceInYears, format } from "date-fns";
import { WorkerType } from "types/ts";
import { useFirestoreDocumentData } from "@react-query-firebase/firestore";
import { timeUid } from "utils/common";
import {
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    useDisclosure,
} from "@chakra-ui/react";

const WorkersPage = () => {
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
                            <WorkersComponent workersInfo={workersInfo} />
                        </tbody>
                    </table>
                </div>
            </section>

            {/* mobile */}
            <MobileSection workersInfo={workersInfo} />
        </>
    );
};

export default withAuth(WorkersPage);

const WorkersComponent = ({ workersInfo }: { workersInfo: WorkerType[] }) => {
    return (
        <>
            {workersInfo?.map((worker: WorkerType) => {
                const year = format(new Date(), "yyyy");
                return (
                    <tr key={`${worker.workerUid}`}>
                        <td>{worker.name}</td>
                        <td>{worker.birthDate}</td>
                        <td>{worker.phoneNumber}</td>
                        <td>{worker.workStartDate}</td>
                        <td>{`${worker.workYear}년차`}</td>
                        <td>{worker[year]}</td>
                    </tr>
                );
            })}
        </>
    );
};

const MobileSection = ({ workersInfo }: { workersInfo: WorkerType[] }) => {
    const workerModal = useDisclosure();

    const [clickedWorker, setClickedWorker] = useState<WorkerType | null>(null);

    const year = format(new Date(), "yyyy");
    const clickHandler = useCallback(
        (worker: WorkerType) => {
            const workYear = differenceInYears(new Date(), new Date(worker.workStartDate));
            setClickedWorker(() => {
                return {
                    ...worker,
                    workYear,
                };
            });
            workerModal.onOpen();
        },
        [workerModal]
    );

    return (
        <>
            <section className={styles.mobileSection}>
                <div className={styles.mobileContainer}>
                    <ul>
                        {workersInfo.map((worker, index) => {
                            return (
                                <li key={`${worker.userUid}+${index}`}>
                                    <span className={styles.index}>{index + 1}.</span>
                                    <Button
                                        className={styles.name}
                                        onClick={() => {
                                            clickHandler(worker);
                                        }}
                                        bg="gray.50"
                                    >
                                        {worker.name}
                                    </Button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <Modal isOpen={workerModal.isOpen} onClose={workerModal.onClose}>
                    <ModalOverlay />
                    <ModalContent className={styles.mobileModal} w="95%">
                        <ModalHeader bg="blue.100" fontSize="1.2rem">
                            직원 정보
                        </ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb="8">
                            <ul className={styles.modalContainer}>
                                <li>
                                    <div>이름:</div>
                                    <div>{clickedWorker?.name}</div>
                                </li>
                                <li>
                                    <div>생년월일:</div>
                                    <div>{clickedWorker?.birthDate}</div>
                                </li>
                                <li>
                                    <div>연락처:</div>
                                    <div>{clickedWorker?.phoneNumber}</div>
                                </li>
                                <li>
                                    <div>입사일:</div>
                                    <div>{clickedWorker?.workStartDate}</div>
                                </li>
                                <li>
                                    <div>년차:</div>
                                    <div>{clickedWorker?.workYear}</div>
                                </li>
                                <li>
                                    <div>연차 사용 횟수:</div>
                                    <div>{clickedWorker?.[year]}</div>
                                </li>
                            </ul>
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </section>
        </>
    );
};
