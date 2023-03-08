import React, { useState, useMemo, useEffect } from "react";
import {
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    Button,
    Select,
    Stack,
    Box,
} from "@chakra-ui/react";
import useInput from "hooks/useInput";
import { useAuthCreateUserWithEmailAndPassword } from "@react-query-firebase/auth";
import { auth, db } from "firebaseConfig/firebase";
import { useToast } from "@chakra-ui/react";
import LoginLink from "components/loginLink/LoginLink";
import SignBtn from "components/SignBtn";
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import useDocDataQuery from "hooks/useDocDataQuery";
import DatePicker from "react-datepicker";
import ko from "date-fns/locale/ko";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const Worker = () => {
    const [email, setEmail, changeEmail] = useInput("");
    const [password, setPassword, changePassword] = useInput("");
    const [passwordCheck, setPasswordCheck, changePasswordCheck] = useInput("");
    const [companyName, setCompanyName, changeCompanyName] = useInput("");
    const [birthDate, setBirthDate, changeBirthDate] = useInput(null);
    const [workStartDate, setWorkStartDate, changeWorkStartDate] = useInput(null);
    const [name, setName, changeName] = useInput("");
    const [phoneNumber, setPhoneNumber, changePhoneNumber] = useInput("");
    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);
    const [showCheck, setShowCheck] = useState(false);
    const handleClickCheck = () => setShowCheck(!showCheck);
    const toast = useToast();
    const companysInfo = useDocDataQuery("companys", "company");

    const mutation = useAuthCreateUserWithEmailAndPassword(auth, {
        onSuccess(user) {
            const uid = user.user.uid;
            const saveUser = async () => {
                await setDoc(doc(db, "users", uid), {
                    userUid: uid,
                    role: "worker",
                    email: email,
                    company: companyName,
                    name,
                    birthDate: format(birthDate, "yyyy/MM/dd"),
                    workStartDate: format(workStartDate, "yyyy/MM/dd"),
                    phoneNumber,
                });
            };
            const saveInAdmin = async () => {
                let adminUid = "";
                const ref = query(
                    collection(db, "users"),
                    where("company", "==", companyName),
                    where("role", "==", "admin")
                );
                const adminInfo = await getDocs(ref);

                adminInfo.forEach((doc) => {
                    adminUid = doc.id;
                });
                await setDoc(
                    doc(db, "users", adminUid),
                    {
                        workers: {
                            [uid]: {
                                name,
                                phoneNumber,
                                birthDate: format(birthDate, "yyyy/MM/dd"),
                                workStartDate: format(workStartDate, "yyyy/MM/dd"),
                                role: "worker",
                                workerUid: uid,
                            },
                        },
                    },
                    { merge: true }
                );
            };
            saveUser();
            saveInAdmin();
            setEmail("");
            setPassword("");
            setPasswordCheck("");
            setCompanyName("");
            setName("");
            setPhoneNumber("");
            setBirthDate(null);
            setWorkStartDate(null);
            sessionStorage.removeItem("signIn");

            toast({
                title: `${user.user.email}님`,
                description: "회원가입을 환영합니다.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
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
                title: "회원가입을 실패하였습니다.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        },
    });

    const onSubmitHandler = (e: React.FormEvent<HTMLElement>) => {
        e.preventDefault();
        if (password !== passwordCheck) {
            toast({
                title: "비밀번호가 일치하지 않습니다.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        mutation.mutate({
            email,
            password,
        });
    };
    return (
        <Box as="form" onSubmit={onSubmitHandler} p="0 30px 30px 30px" w="100%">
            <Stack>
                <FormControl isRequired>
                    <FormLabel>이메일</FormLabel>
                    <Input
                        type="email"
                        value={email}
                        onChange={changeEmail}
                        placeholder="이메일 형식으로 입력해주세요."
                        variant="flushed"
                        _placeholder={{ fontSize: "0.9rem" }}
                    />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>비밀번호</FormLabel>
                    <InputGroup>
                        <Input
                            type={show ? "text" : "password"}
                            value={password}
                            onChange={changePassword}
                            placeholder="최소 6자리 이상 입력해주세요."
                            variant="flushed"
                            minLength={6}
                            _placeholder={{ fontSize: "0.9rem" }}
                        />
                        <InputRightElement>
                            <Button h="1.75rem" size="sm" onClick={handleClick}>
                                {show ? <ViewOffIcon /> : <ViewIcon />}
                            </Button>
                        </InputRightElement>
                    </InputGroup>
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>비밀번호 확인</FormLabel>
                    <InputGroup>
                        <Input
                            type={showCheck ? "text" : "password"}
                            value={passwordCheck}
                            onChange={changePasswordCheck}
                            placeholder="위와 동일한 비밀번호를 입력해주세요."
                            variant="flushed"
                            minLength={6}
                            _placeholder={{ fontSize: "0.9rem" }}
                        />
                        <InputRightElement>
                            <Button h="1.75rem" size="sm" onClick={handleClickCheck}>
                                {showCheck ? <ViewOffIcon /> : <ViewIcon />}
                            </Button>
                        </InputRightElement>
                    </InputGroup>
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>회사</FormLabel>
                    <Select
                        placeholder="회사를 선택해주세요."
                        variant="flushed"
                        onChange={changeCompanyName}
                        value={companyName}
                        _placeholder={{ fontSize: "0.9rem" }}
                    >
                        {companysInfo?.data?.companys?.map((company: string) => {
                            return (
                                <option value={company} key={company}>
                                    {company}
                                </option>
                            );
                        })}
                    </Select>
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>이름</FormLabel>
                    <Input
                        placeholder="이름"
                        value={name}
                        type="text"
                        onChange={changeName}
                        required
                        pattern="[a-zA-Z0-9ㄱ-ㅎ가-힣]{1,}"
                        variant="flushed"
                        _placeholder={{ fontSize: "0.9rem" }}
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>연락처</FormLabel>
                    <Input
                        placeholder="예시) 01012345678"
                        value={phoneNumber}
                        onChange={changePhoneNumber}
                        required
                        type="tel"
                        pattern="[0-9]{7,}"
                        variant="flushed"
                        _placeholder={{ fontSize: "0.9rem" }}
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>생년월일</FormLabel>
                    <DatePicker
                        selected={birthDate}
                        onChange={(date) => setBirthDate(date)}
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
                    <FormLabel>입사일</FormLabel>
                    <DatePicker
                        selected={workStartDate}
                        onChange={(date) => setWorkStartDate(date)}
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
            <SignBtn title="회원가입" />
            <LoginLink />
        </Box>
    );
};

export default Worker;
