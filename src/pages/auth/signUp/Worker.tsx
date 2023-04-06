import { useState } from "react";
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
import { differenceInYears, format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { RegisterWorker } from "types/ts";

const Worker = () => {
    const { register, handleSubmit, control } = useForm<RegisterWorker>();
    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);
    const [showCheck, setShowCheck] = useState(false);
    const handleClickCheck = () => setShowCheck(!showCheck);
    const toast = useToast();
    const companysInfo = useDocDataQuery("companys", "company");
    const navigate = useNavigate();

    const onSubmit = (data: RegisterWorker) => {
        const { email, password, passwordCheck, companyName, birthDate, workStartDate, name, phoneNumber } = data;
        if (password !== passwordCheck) {
            toast({
                title: "비밀번호가 일치하지 않습니다.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then((user) => {
                const uid = user.user.uid;
                const year = format(new Date(), "yyyy");
                const saveUser = async () => {
                    const ref = query(
                        collection(db, "users"),
                        where("company", "==", companyName),
                        where("role", "==", "admin")
                    );
                    const adminInfo = await getDocs(ref);
                    const workYear = differenceInYears(new Date(), new Date(workStartDate)) + 1;
                    adminInfo.forEach(async (docData) => {
                        const adminUid = docData.id;
                        await setDoc(doc(db, "users", uid), {
                            userUid: uid,
                            role: "worker",
                            email: email,
                            company: companyName,
                            name,
                            birthDate: format(birthDate, "yyyy/MM/dd"),
                            workStartDate: format(workStartDate, "yyyy/MM/dd"),
                            phoneNumber,
                            adminUid: docData.id,
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
                                        workYear,
                                    },
                                },
                            },
                            { merge: true }
                        );
                    });
                };
                saveUser();
                sessionStorage.removeItem("signIn");

                toast({
                    title: `${user.user.email}님`,
                    description: "회원가입을 환영합니다.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });

                navigate("/auth/signIn");
            })
            .catch((error) => {
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
            });
    };

    const inputBasicProps = {
        variant: "flushed",
        _placeholder: { fontSize: "0.9rem" },
        autoComplete: "on",
    };
    return (
        <Box as="form" onSubmit={handleSubmit(onSubmit)} p="0 30px 30px 30px" w="100%">
            <Stack>
                <FormControl isRequired>
                    <FormLabel>이메일</FormLabel>
                    <Input
                        type="email"
                        {...register("email")}
                        placeholder="이메일 형식으로 입력해주세요."
                        {...inputBasicProps}
                    />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>비밀번호</FormLabel>
                    <InputGroup>
                        <Input
                            type={show ? "text" : "password"}
                            {...register("password")}
                            placeholder="최소 6자리 이상 입력해주세요."
                            minLength={6}
                            {...inputBasicProps}
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
                            {...register("passwordCheck")}
                            placeholder="위와 동일한 비밀번호를 입력해주세요."
                            minLength={6}
                            {...inputBasicProps}
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
                    <Select placeholder="회사를 선택해주세요." {...register("companyName")} {...inputBasicProps}>
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
                        type="text"
                        {...register("name")}
                        required
                        pattern="[a-zA-Z0-9ㄱ-ㅎ가-힣]{1,}"
                        {...inputBasicProps}
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>연락처</FormLabel>
                    <Input
                        placeholder="예시) 01012345678"
                        {...register("phoneNumber")}
                        required
                        type="tel"
                        pattern="[0-9]{7,}"
                        {...inputBasicProps}
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>생년월일</FormLabel>
                    <Controller
                        name="birthDate"
                        control={control}
                        render={({ field }) => {
                            return (
                                <DatePicker
                                    selected={field.value}
                                    onChange={(date) => field.onChange(date)}
                                    dateFormat="yyyy/MM/dd"
                                    locale={ko}
                                    placeholderText={"예시) 1234/12/23"}
                                    peekNextMonth
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    required
                                />
                            );
                        }}
                    />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>입사일</FormLabel>
                    <Controller
                        name="workStartDate"
                        control={control}
                        render={({ field }) => {
                            return (
                                <DatePicker
                                    selected={field.value}
                                    onChange={(date) => field.onChange(date)}
                                    dateFormat="yyyy/MM/dd"
                                    locale={ko}
                                    required
                                    placeholderText={"예시) 1234/12/23"}
                                    peekNextMonth
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                />
                            );
                        }}
                    />
                </FormControl>
            </Stack>
            <SignBtn title="회원가입" />
            <LoginLink />
        </Box>
    );
};

export default Worker;
