import { useState } from "react";
import { FormControl, FormLabel, Input, InputGroup, InputRightElement, Button, Box } from "@chakra-ui/react";
import { auth, db } from "firebaseConfig/firebase";
import { useToast } from "@chakra-ui/react";
import LoginLink from "components/loginLink/LoginLink";
import SignBtn from "components/SignBtn";
import { arrayUnion, doc, setDoc, updateDoc } from "firebase/firestore";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import useDocDataQuery from "hooks/useDocDataQuery";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { RegisterAdmin } from "types/ts";

const Admin = () => {
    const { register, handleSubmit } = useForm<RegisterAdmin>();
    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);
    const [showCheck, setShowCheck] = useState(false);
    const handleClickCheck = () => setShowCheck(!showCheck);
    const toast = useToast();
    const companysInfo = useDocDataQuery("companys", "company");
    const navigate = useNavigate();

    const onSubmit = (data: RegisterAdmin) => {
        const { email, password, passwordCheck, companyName } = data;
        if (password !== passwordCheck) {
            toast({
                title: "비밀번호가 일치하지 않습니다.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }
        if (companysInfo?.data?.companys.includes(companyName)) {
            toast({
                title: "이미 존재하는 회사입니다.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then((user) => {
                toast({
                    title: `${user.user.email}님`,
                    description: "회원가입을 환영합니다.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                const saveUser = async () => {
                    const uid = user.user.uid;
                    await setDoc(doc(db, "users", uid), {
                        userUid: uid,
                        role: "admin",
                        email: email,
                        company: companyName,
                        workers: [],
                    });
                    await updateDoc(doc(db, "companys", "company"), {
                        companys: arrayUnion(companyName),
                    });
                };

                saveUser();
                sessionStorage.removeItem("signIn");
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
            <FormControl isRequired>
                <FormLabel>이메일</FormLabel>
                <Input
                    type="email"
                    placeholder="이메일 형식으로 입력해주세요."
                    {...inputBasicProps}
                    {...register("email")}
                />
            </FormControl>
            <FormControl isRequired mt="3">
                <FormLabel>비밀번호</FormLabel>
                <InputGroup>
                    <Input
                        type={show ? "text" : "password"}
                        placeholder="최소 6자리 이상 입력해주세요."
                        minLength={6}
                        {...register("password")}
                        {...inputBasicProps}
                    />
                    <InputRightElement>
                        <Button h="1.75rem" size="sm" onClick={handleClick}>
                            {show ? <ViewOffIcon /> : <ViewIcon />}
                        </Button>
                    </InputRightElement>
                </InputGroup>
            </FormControl>
            <FormControl isRequired mt="3">
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
            <FormControl isRequired mt="3">
                <FormLabel>회사 이름</FormLabel>
                <Input
                    type="text"
                    {...register("companyName")}
                    placeholder="회사 이름을 입력해주세요."
                    {...inputBasicProps}
                />
            </FormControl>
            <SignBtn title="회원가입" />
            <LoginLink />
        </Box>
    );
};

export default Admin;
