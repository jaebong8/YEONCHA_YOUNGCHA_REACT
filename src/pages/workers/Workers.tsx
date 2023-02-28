import { AddIcon } from "@chakra-ui/icons";
import {
    Button,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useDisclosure,
} from "@chakra-ui/react";
import withAuth from "components/hoc/withAuth";
import Layout from "layouts/Layout";
import styles from "./Workers.module.scss";
import { useRef, useState, useCallback, useEffect, useContext } from "react";
import DatePicker from "react-datepicker";
import ko from "date-fns/locale/ko";
import "react-datepicker/dist/react-datepicker.css";
import { auth, db } from "firebaseConfig/firebase";
import { doc } from "firebase/firestore";
import { useFirestoreDocumentData } from "@react-query-firebase/firestore";
import { useAuthUser } from "@react-query-firebase/auth";
import { myContext } from "App";

const Workers = () => {
    const user = useContext(myContext);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const initialRef = useRef(null);
    const finalRef = useRef(null);
    const [birthDate, setBirthDate] = useState<Date | null>();
    const [workStartDate, setWorkStartDate] = useState<Date | null>();
    const [name, setName] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const ref = doc(db, "users", "default");
    const product = useFirestoreDocumentData(["users", "default"], ref, {
        subscribe: true,
    });
    const onSubmitHandler = useCallback(
        (e: React.FormEvent<HTMLElement>) => {
            e.preventDefault();
            console.log(name, birthDate, workStartDate, phoneNumber);
        },
        [name, birthDate, workStartDate, phoneNumber]
    );
    console.log(product);

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
                                <tr>
                                    <td>박재현</td>
                                    <td>900803</td>
                                    <td>01099571597</td>
                                    <td>2023년 1월 1일</td>
                                    <td>1년차</td>
                                </tr>
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
                            <FormControl>
                                <FormLabel fontWeight="bold" className="test">
                                    이름
                                </FormLabel>
                                <Input
                                    ref={initialRef}
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

                            <FormControl mt={4}>
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
                            <FormControl mt={4}>
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
                            <FormControl mt={4}>
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
