import React, { useState } from "react";
import styles from "pages/auth/signIn/SignIn.module.scss";
import { FormControl, FormLabel, Input, InputGroup, InputRightElement, Button } from "@chakra-ui/react";
import useInput from "hooks/useInput";
import { useAuthCreateUserWithEmailAndPassword } from "@react-query-firebase/auth";
import { auth, db } from "firebaseConfig/firebase";
import { useToast } from "@chakra-ui/react";
import LoginLink from "components/loginLink/LoginLink";
import SignBtn from "components/SignBtn";
import { doc, setDoc } from "firebase/firestore";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

const Worker = () => {
    const [email, setEmail, changeEmail] = useInput("");
    const [password, setPassword, changePassword] = useInput("");
    const [passwordCheck, setPasswordCheck, changePasswordCheck] = useInput("");
    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);
    const [showCheck, setShowCheck] = useState(false);
    const handleClickCheck = () => setShowCheck(!showCheck);
    const toast = useToast();

    const mutation = useAuthCreateUserWithEmailAndPassword(auth, {
        onSuccess(user) {
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
                    workers: [],
                });
            };
            saveUser();
            setEmail("");
            setPassword("");
            setPasswordCheck("");
            sessionStorage.removeItem("signIn");
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
        <form onSubmit={onSubmitHandler} className={styles.form}>
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
            <FormControl isRequired mt="2">
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
            <FormControl isRequired mt="2">
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
            <SignBtn title="회원가입" />
            <LoginLink />
        </form>
    );
};

export default Worker;
