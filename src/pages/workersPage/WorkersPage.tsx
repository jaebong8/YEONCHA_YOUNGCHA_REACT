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
    Box,
    Button,
    Flex,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    useDisclosure,
} from "@chakra-ui/react";

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

            {/* mobile */}
            <MobileSection />
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

const MobileSection = () => {
    const workerModal = useDisclosure();
    const userUid = auth?.currentUser?.uid ?? "temp";
    const ref = doc(collection(db, "users"), userUid);
    const userInfo = useFirestoreDocumentData(["user", timeUid()], ref, {
        subscribe: true,
    });
    const workersInfo: WorkerType[] = useMemo(() => {
        return Object?.values({ ...userInfo?.data?.workers });
    }, [userInfo]);

    const [clickedWorker, setClickedWorker] = useState<WorkerType | null>(null);
    const workYear = useMemo(() => {
        if (clickedWorker !== null) {
            return differenceInYears(new Date(), new Date(clickedWorker?.workStartDate));
        }
        return 0;
    }, [clickedWorker]);
    const year = format(new Date(), "yyyy");
    const clickHandler = useCallback(
        (worker: WorkerType) => {
            setClickedWorker(() => {
                return {
                    ...worker,
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
                                    >
                                        {worker.name}
                                    </Button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </section>

            <Modal isOpen={workerModal.isOpen} onClose={workerModal.onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>직원 정보</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Flex>
                            <Box>이름</Box>
                            <Box>{clickedWorker?.name}</Box>
                        </Flex>
                        <Flex>
                            <Box>생년월일</Box>
                            <Box>{clickedWorker?.birthDate}</Box>
                        </Flex>
                        <Flex>
                            <Box>연락처</Box>
                            <Box>{clickedWorker?.phoneNumber}</Box>
                        </Flex>
                        <Flex>
                            <Box>입사일</Box>
                            <Box>{clickedWorker?.workStartDate}</Box>
                        </Flex>
                        <Flex>
                            <Box>년차</Box>
                            <Box>{`${workYear + 1}년차`}</Box>
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};
