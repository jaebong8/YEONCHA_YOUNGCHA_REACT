import React, { useState } from "react";
import {
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    Button,
    Center,
    useToast,
    Box,
} from "@chakra-ui/react";
import useInput from "hooks/useInput";
import LoginLink from "components/loginLink/LoginLink";
import { Img } from "@chakra-ui/react";
import logo from "assets/images/mainIcon.png";
import SignBtn from "components/SignBtn";
import { useAuthSignInWithEmailAndPassword } from "@react-query-firebase/auth";
import { auth } from "firebaseConfig/firebase";
import withAuth from "components/hoc/withAuth";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

const SignIn = () => {
    const [email, setEmail, changeEmail] = useInput("");
    const [password, setPassword, changePassword] = useInput("");
    const [show, setShow] = useState(false);
    const toast = useToast();
    const handleClick = () => setShow(!show);

    const mutation = useAuthSignInWithEmailAndPassword(auth, {
        onSuccess(user) {
            toast({
                title: `${user.user.email}님`,
                description: "로그인을 환영합니다.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
            setEmail("");
            setPassword("");
            sessionStorage.setItem("signIn", user.user.uid);
        },
        onError(error) {
            if (error.code === "auth/wrong-password") {
                toast({
                    title: "잘못된 패스워드입니다.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }
            if (error.code === "auth/user-not-found") {
                toast({
                    title: "없는 회원입니다.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
                return;
            }

            toast({
                title: "로그인을 실패하였습니다.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        },
    });

    const onSubmitHandler = (e: React.FormEvent<HTMLElement>) => {
        e.preventDefault();
        mutation.mutate({
            email,
            password,
        });
    };
    return (
        <Center h="100vh">
            <Center bg="#FFFFFF" h="100%" w="sm" flexDir="column">
                <Img boxSize="150px" objectFit="cover" src={logo} alt="mainIcon" mb="4" />
                <Box as="form" onSubmit={onSubmitHandler} w="100%" p="0 30px 30px 30px">
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
                                placeholder="6글자 이상으로 입력해주세요."
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
                    <SignBtn title="로그인" />
                    <LoginLink />
                </Box>
            </Center>
        </Center>
    );
};

export default withAuth(SignIn);
