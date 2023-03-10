import React, { useState } from "react";
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
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
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
    const [birthDate, setBirthDate] = useInput(null);
    const [workStartDate, setWorkStartDate] = useInput(null);
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
            const year = format(new Date(), "yyyy");
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
                                adminUid,
                                [year]: 0,
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
                title: `${user.user.email}???`,
                description: "??????????????? ???????????????.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        },
        onError(error) {
            if (error.code === "auth/email-already-in-use") {
                toast({
                    title: "?????? ????????? ??????????????????.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }
            if (error.code === "auth/invalid-email") {
                toast({
                    title: "????????? ????????? ???????????????.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }
            toast({
                title: "??????????????? ?????????????????????.",
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
                title: "??????????????? ???????????? ????????????.",
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
                    <FormLabel>?????????</FormLabel>
                    <Input
                        type="email"
                        value={email}
                        onChange={changeEmail}
                        placeholder="????????? ???????????? ??????????????????."
                        variant="flushed"
                        _placeholder={{ fontSize: "0.9rem" }}
                    />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>????????????</FormLabel>
                    <InputGroup>
                        <Input
                            type={show ? "text" : "password"}
                            value={password}
                            onChange={changePassword}
                            placeholder="?????? 6?????? ?????? ??????????????????."
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
                    <FormLabel>???????????? ??????</FormLabel>
                    <InputGroup>
                        <Input
                            type={showCheck ? "text" : "password"}
                            value={passwordCheck}
                            onChange={changePasswordCheck}
                            placeholder="?????? ????????? ??????????????? ??????????????????."
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
                    <FormLabel>??????</FormLabel>
                    <Select
                        placeholder="????????? ??????????????????."
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
                    <FormLabel>??????</FormLabel>
                    <Input
                        placeholder="??????"
                        value={name}
                        type="text"
                        onChange={changeName}
                        required
                        pattern="[a-zA-Z0-9???-??????-???]{1,}"
                        variant="flushed"
                        _placeholder={{ fontSize: "0.9rem" }}
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>?????????</FormLabel>
                    <Input
                        placeholder="??????) 01012345678"
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
                    <FormLabel>????????????</FormLabel>
                    <DatePicker
                        selected={birthDate}
                        onChange={(date) => setBirthDate(date)}
                        dateFormat="yyyy/MM/dd"
                        locale={ko}
                        placeholderText={"??????) 1234/12/23"}
                        peekNextMonth
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        required
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>?????????</FormLabel>
                    <DatePicker
                        selected={workStartDate}
                        onChange={(date) => setWorkStartDate(date)}
                        dateFormat="yyyy/MM/dd"
                        locale={ko}
                        required
                        placeholderText={"??????) 1234/12/23"}
                        peekNextMonth
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                    />
                </FormControl>
            </Stack>
            <SignBtn title="????????????" />
            <LoginLink />
        </Box>
    );
};

export default Worker;
