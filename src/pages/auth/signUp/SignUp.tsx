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

const SignUp = () => {
    const [email, , changeEmail] = useInput("");
    const [password, , changePassword] = useInput("");
    const [passwordCheck, , changePasswordCheck] = useInput("");
    const [show, setShow] = useState(false);
    const [emailErrMsg, setEmailErrMsg] = useState("");
    const [passwordErrMsg, setPasswordErrMsg] = useState("");
    const [passwordCheckErrMsg, setPasswordCheckErrMsg] = useState("");
    const handleClick = () => setShow(!show);

    const mutation = useAuthCreateUserWithEmailAndPassword(auth, {
        onError(error) {
            console.log("회원가입 실패");
        },
    });

    const onSubmitHandler = (e: React.FormEvent<HTMLElement>) => {
        e.preventDefault();
        console.log(email, password);
        if (password !== passwordCheck) {
            setPasswordCheckErrMsg("비밀번호가 일치하지 않습니다.");
            return;
        }
        mutation.mutate({
            email,
            password,
        });
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
            </form>
        </div>
    );
};

export default SignUp;
