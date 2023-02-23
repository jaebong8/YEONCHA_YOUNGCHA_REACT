import React, { useCallback, useEffect, useState } from "react";
import styles from "pages/auth/signIn/SignIn.module.scss";
import {
    FormControl,
    FormLabel,
    FormErrorMessage,
    Input,
    InputGroup,
    InputRightElement,
    Button,
    Center,
} from "@chakra-ui/react";
import useInput from "hooks/useInput";
import { useAuthCreateUserWithEmailAndPassword } from "@react-query-firebase/auth";
import { auth } from "firebaseConfig/firebase";
import { useToast } from "@chakra-ui/react";
import LoginLink from "components/loginLink/LoginLink";
import { Img } from "@chakra-ui/react";
import logo from "assets/images/mainIcon.png";
import SignBtn from "components/SignBtn";

const SignUp = () => {
    const [email, setEmail, changeEmail] = useInput("");
    const [password, setPassword, changePassword] = useInput("");
    const [passwordCheck, setPasswordCheck, changePasswordCheck] = useInput("");
    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);
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
            setEmail("");
            setPassword("");
            setPasswordCheck("");
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
        <Center h="100vh">
            <Center bg="#FFFFFF" h="100%" w="sm" flexDir="column">
                <Img boxSize="150px" objectFit="cover" src={logo} alt="mainIcon" mb="4" />
                <form onSubmit={onSubmitHandler}>
                    <FormControl isRequired>
                        <FormLabel>Email</FormLabel>
                        <Input
                            type="email"
                            value={email}
                            onChange={changeEmail}
                            placeholder="Enter Email"
                            variant="flushed"
                        />
                    </FormControl>
                    <FormControl isRequired mt="2">
                        <FormLabel>Password</FormLabel>
                        <InputGroup>
                            <Input
                                type={show ? "text" : "password"}
                                value={password}
                                onChange={changePassword}
                                placeholder="Enter Password"
                                variant="flushed"
                                minLength={6}
                            />
                            <InputRightElement>
                                <Button h="1.75rem" size="sm" onClick={handleClick}>
                                    {show ? "Hide" : "Show"}
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                    </FormControl>
                    <FormControl isRequired mt="2">
                        <FormLabel>Password Check</FormLabel>
                        <InputGroup>
                            <Input
                                type={show ? "text" : "password"}
                                value={passwordCheck}
                                onChange={changePasswordCheck}
                                placeholder="Enter Password Check"
                                variant="flushed"
                                minLength={6}
                            />
                            <InputRightElement>
                                <Button h="1.75rem" size="sm" onClick={handleClick}>
                                    {show ? "Hide" : "Show"}
                                </Button>
                            </InputRightElement>
                        </InputGroup>
                    </FormControl>
                    <SignBtn title="회원가입" />
                    <LoginLink />
                </form>
            </Center>
        </Center>
    );
};

export default SignUp;
