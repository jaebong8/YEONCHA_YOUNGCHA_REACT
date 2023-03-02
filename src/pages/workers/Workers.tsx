import { AddIcon } from "@chakra-ui/icons";
import {
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
import useInput from "hooks/useInput";
import { useAuthCreateUserWithEmailAndPassword } from "@react-query-firebase/auth";
import { arrayUnion, collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "firebaseConfig/firebase";
import { format } from "date-fns";
import Spinner from "components/spinner/Spinner";
import { WorkerType } from "types/ts";

const Workers = () => {
    const [email, setEmail, changeEmail] = useInput("");
    const [password, setPassword, changePassword] = useInput("");
    const { isOpen, onOpen, onClose } = useDisclosure();
    const initialRef = useRef(null);
    const finalRef = useRef(null);
    const [birthDate, setBirthDate] = useState<Date | null>(null);
    const [workStartDate, setWorkStartDate] = useState<Date | null>(null);
    const [name, setName] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const userInfo = useDocQuery("users");
    const toast = useToast();
    const userUid = sessionStorage.getItem("signIn") ?? "empty";
    const mutation = useAuthCreateUserWithEmailAndPassword(auth, {
        onSuccess(user) {
            toast({
                title: `직원등록을 성공하였습니다.`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            const saveUser = async () => {
                const workerUid = user.user.uid;
                if (birthDate !== null && workStartDate !== null) {
                    await setDoc(
                        doc(db, "users", userUid),
                        {
                            workers: arrayUnion({
                                userUid: workerUid,
                                role: "workers",
                                email,
                                password,
                                name,
                                phoneNumber,
                                birthDate: format(birthDate, "yyyyMMdd"),
                                workStartDate: format(workStartDate, "yyyyMMdd"),
                            }),
                        },
                        { merge: true }
                    );
                }
            };
            saveUser();
            setEmail("");
            setPassword("");
            setName("");
            setPhoneNumber("");
            setBirthDate(null);
            setWorkStartDate(null);
        },
        onError(error) {
            if (error.code === "auth/email-already-in-use") {
                toast({
                    title: "이미 가입된 이메일입니다.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }
            if (error.code === "auth/invalid-email") {
                toast({
                    title: "잘못된 이메일 형식입니다.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }
            toast({
                title: "직원등록을 실패하였습니다.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        },
    });
    const onSubmitHandler = useCallback(
        (e: React.FormEvent<HTMLElement>) => {
            e.preventDefault();
            mutation.mutate({
                email,
                password,
            });
            console.log(name, birthDate, workStartDate, phoneNumber);
        },
        [name, birthDate, workStartDate, phoneNumber, email, password, mutation]
    );
    if (userInfo.isLoading) return <Spinner />;
    return (
        <>
            <Layout>
                <section className={styles.section}>
                    <Button leftIcon={<AddIcon />} colorScheme="teal" variant="solid" size="sm" onClick={onOpen}>
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
                                    return (
                                        <tr key={worker.userUid}>
                                            <td>{worker.name}</td>
                                            <td>{worker.birthDate}</td>
                                            <td>{worker.phoneNumber}</td>
                                            <td>{worker.workStartDate}</td>
                                            <td>1년차</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            </Layout>
            <Modal initialFocusRef={initialRef} finalFocusRef={finalRef} isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <form onSubmit={onSubmitHandler}>
                        <ModalHeader>직원 추가하기</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={6}>
                            <Stack>
                                <FormControl isRequired>
                                    <FormLabel fontWeight="bold">아이디</FormLabel>
                                    <Input
                                        ref={initialRef}
                                        type="email"
                                        value={email}
                                        onChange={changeEmail}
                                        placeholder="이메일 형식으로 입력해주세요."
                                        _placeholder={{ fontSize: "0.9rem" }}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel fontWeight="bold">비밀번호</FormLabel>
                                    <InputGroup>
                                        <Input
                                            type={"text"}
                                            value={password}
                                            onChange={changePassword}
                                            placeholder="6글자 이상 입력해주세요."
                                            minLength={6}
                                            _placeholder={{ fontSize: "0.9rem" }}
                                        />
                                    </InputGroup>
                                </FormControl>
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
                            <Button onClick={onClose}>취소</Button>
                        </ModalFooter>
                    </form>
                </ModalContent>
            </Modal>
        </>
    );
};

export default withAuth(Workers);
