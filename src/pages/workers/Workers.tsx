import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Stack,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import withAuth from "components/hoc/withAuth";
import Layout from "layouts/Layout";
import styles from "./Workers.module.scss";
import { useRef, useState, useCallback, useEffect, useContext, useMemo } from "react";
import DatePicker from "react-datepicker";
import ko from "date-fns/locale/ko";
import "react-datepicker/dist/react-datepicker.css";
import useDocQuery from "hooks/useDocQuery";
import { arrayRemove, arrayUnion, collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "firebaseConfig/firebase";
import { differenceInYears, format } from "date-fns";
import Spinner from "components/spinner/Spinner";
import { WorkerType } from "types/ts";

const Workers = () => {
    const addModal = useDisclosure();
    const deleteModal = useDisclosure();
    const initialRef = useRef(null);
    const finalRef = useRef(null);
    const cancelRef = useRef(null);
    const [birthDate, setBirthDate] = useState<Date | null>(null);
    const [workStartDate, setWorkStartDate] = useState<Date | null>(null);
    const [name, setName] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [clickedWorker, setClickedWorker] = useState({
        role: "",
        name: "",
        phoneNumber: "",
        birthDate: "",
        workStartDate: "x",
    });
    const userInfo = useDocQuery("users");
    const toast = useToast();
    const userUid = sessionStorage.getItem("signIn") ?? "empty";
    const onSubmitHandler = useCallback(
        (e: React.FormEvent<HTMLElement>) => {
            e.preventDefault();
            const saveUser = async () => {
                try {
                    if (birthDate !== null && workStartDate !== null) {
                        await setDoc(
                            doc(db, "users", userUid),
                            {
                                workers: arrayUnion({
                                    role: "workers",
                                    name,
                                    phoneNumber,
                                    birthDate: format(birthDate, "yyyy/MM/dd"),
                                    workStartDate: format(workStartDate, "yyyy/MM/dd"),
                                }),
                            },
                            { merge: true }
                        );
                        toast({
                            title: `직원등록을 성공하였습니다.`,
                            status: "success",
                            duration: 5000,
                            isClosable: true,
                        });
                    }
                } catch (error) {
                    console.log(error);
                    toast({
                        title: "직원등록을 실패하였습니다.",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            };
            saveUser();
            setName("");
            setPhoneNumber("");
            setBirthDate(null);
            setWorkStartDate(null);
        },
        [name, birthDate, workStartDate, phoneNumber, userUid, toast]
    );

    const deleteHandler = (worker: WorkerType) => {
        const deleteUser = async () => {
            try {
                await updateDoc(doc(db, "users", userUid), {
                    workers: arrayRemove({
                        birthDate: worker.birthDate,
                        name: worker.name,
                        phoneNumber: worker.phoneNumber,
                        role: worker.role,
                        workStartDate: worker.workStartDate,
                    }),
                });
                toast({
                    title: `직원 삭제를 성공하였습니다.`,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            } catch (error) {
                console.log(error);
                toast({
                    title: `직원 삭제를 실패하였습니다.`,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        };
        deleteUser();
        console.log(auth);
    };

    if (userInfo.isLoading) return <Spinner />;
    return (
        <>
            <Layout>
                <section className={styles.section}>
                    <Button
                        leftIcon={<AddIcon />}
                        colorScheme="teal"
                        variant="solid"
                        size="sm"
                        onClick={addModal.onOpen}
                    >
                        직원 추가하기
                    </Button>
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
                                {userInfo?.data?.workers.map((worker: WorkerType) => {
                                    const workYear = differenceInYears(new Date(), new Date(worker.workStartDate));
                                    return (
                                        <tr key={`${worker.name}${worker.birthDate}`}>
                                            <td className={styles.nameTD}>
                                                <DeleteIcon
                                                    w={4}
                                                    h={4}
                                                    color="red.300"
                                                    cursor="pointer"
                                                    onClick={() => {
                                                        deleteModal.onOpen();
                                                        setClickedWorker((prev) => {
                                                            prev = { ...worker };
                                                            return prev;
                                                        });
                                                    }}
                                                />
                                                {worker.name}
                                                <span></span>
                                            </td>
                                            <td>{worker.birthDate}</td>
                                            <td>{worker.phoneNumber}</td>
                                            <td>{worker.workStartDate}</td>
                                            <td>{`${workYear + 1}년차`}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            </Layout>
            <Modal
                initialFocusRef={initialRef}
                finalFocusRef={finalRef}
                isOpen={addModal.isOpen}
                onClose={addModal.onClose}
            >
                <ModalOverlay />
                <ModalContent>
                    <form onSubmit={onSubmitHandler}>
                        <ModalHeader>직원 추가하기</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={6}>
                            <Stack>
                                <FormControl isRequired>
                                    <FormLabel fontWeight="bold">이름</FormLabel>
                                    <Input
                                        placeholder="이름"
                                        value={name}
                                        type="text"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setName(e.target.value);
                                        }}
                                        required
                                        pattern="[a-zA-Z0-9ㄱ-ㅎ가-힣]{1,}"
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel fontWeight="bold">생년월일</FormLabel>
                                    <DatePicker
                                        selected={birthDate}
                                        onChange={(date) => setBirthDate(date)}
                                        className={styles.modalInput}
                                        dateFormat="yyyy/MM/dd"
                                        locale={ko}
                                        placeholderText={"예시) 1234/12/23"}
                                        peekNextMonth
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        required
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel fontWeight="bold">연락처</FormLabel>
                                    <Input
                                        placeholder="예시) 01012345678"
                                        value={phoneNumber}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            setPhoneNumber(e.target.value);
                                        }}
                                        required
                                        type="tel"
                                        pattern="[0-9]{7,}"
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel fontWeight="bold">입사일</FormLabel>
                                    <DatePicker
                                        selected={workStartDate}
                                        onChange={(date) => setWorkStartDate(date)}
                                        className={styles.modalInput}
                                        dateFormat="yyyy/MM/dd"
                                        locale={ko}
                                        required
                                        placeholderText={"예시) 1234/12/23"}
                                        peekNextMonth
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                    />
                                </FormControl>
                            </Stack>
                        </ModalBody>

                        <ModalFooter>
                            <Button colorScheme="blue" mr={3} type="submit">
                                저장
                            </Button>
                            <Button onClick={addModal.onClose}>취소</Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
            <AlertDialog isOpen={deleteModal.isOpen} leastDestructiveRef={cancelRef} onClose={deleteModal.onClose}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            직원 삭제
                        </AlertDialogHeader>

                        <AlertDialogBody>정말로 삭제하시겠습니까?</AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={deleteModal.onClose}>
                                취소
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={() => {
                                    deleteHandler(clickedWorker);
                                    deleteModal.onClose();
                                }}
                                ml={3}
                            >
                                삭제
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
            ;
        </>
    );
};

export default withAuth(Workers);
