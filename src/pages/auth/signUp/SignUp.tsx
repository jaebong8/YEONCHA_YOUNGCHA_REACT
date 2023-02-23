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
} from "@chakra-ui/react";
import useInput from "hooks/useInput";
import { useAuthCreateUserWithEmailAndPassword } from "@react-query-firebase/auth";
import { auth } from "../../../firebase/firebase";
import { useToast } from "@chakra-ui/react";
import LoginLink from "components/loginLink/LoginLink";

const SignUp = () => {
    const [email, setEmail, changeEmail] = useInput("");
    const [password, setPassword, changePassword] = useInput("");
    const [passwordCheck, setPasswordCheck, changePasswordCheck] = useInput("");
    const [show, setShow] = useState(false);
    const [emailErrMsg, setEmailErrMsg] = useState("");
    const [passwordErrMsg, setPasswordErrMsg] = useState("");
    const [passwordCheckErrMsg, setPasswordCheckErrMsg] = useState("");
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
        },
        onError(error) {
            if (error.code === "auth/email-already-in-use") {
                setEmailErrMsg("이미 가입된 이메일입니다.");
            }
            if (error.code === "auth/invalid-email") {
                setEmailErrMsg("잘못된 이메일 형식입니다.");
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
            setPasswordCheckErrMsg("비밀번호가 일치하지 않습니다.");
            return;
        }

        mutation.mutate({
            email,
            password,
        });
        setEmail("");
        setPassword("");
        setPasswordCheck("");
        setEmailErrMsg("");
        setPasswordErrMsg("");
        setPasswordCheckErrMsg("");
    };

    return (
        <div className={styles.container}>
            <form onSubmit={onSubmitHandler}>
                <FormControl isRequired isInvalid={emailErrMsg !== ""}>
                    <FormLabel>Email</FormLabel>
                    <Input
                        type="email"
                        value={email}
                        onChange={changeEmail}
                        placeholder="Enter Email"
                        variant="flushed"
                    />
                    {emailErrMsg && <FormErrorMessage>{emailErrMsg}</FormErrorMessage>}
                </FormControl>
                <FormControl isRequired isInvalid={passwordErrMsg !== ""} mt="2">
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
                    {passwordErrMsg && <FormErrorMessage>{passwordErrMsg}</FormErrorMessage>}
                </FormControl>
                <FormControl isRequired isInvalid={passwordCheckErrMsg !== ""} mt="2">
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
                    {passwordCheckErrMsg && <FormErrorMessage>{passwordCheckErrMsg}</FormErrorMessage>}
                </FormControl>
                <Button colorScheme="linkedin" mt="5" type="submit">
                    회원가입
                </Button>
                <LoginLink />
            </form>
        </div>
    );
};

export default SignUp;
