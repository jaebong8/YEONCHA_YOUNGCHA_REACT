import React, { useCallback, useState } from "react";
import styles from "./SignIn.module.scss";
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

const SignIn = () => {
    const [email, , changeEmail] = useInput("");
    const [password, , changePassword] = useInput("");
    const [emailErrMsg, setEmailErrMsg] = useState("");
    const [passwordErrMsg, setPasswordErrMsg] = useState("");

    const [show, setShow] = useState(false);

    const handleClick = () => setShow(!show);

    const onSubmitHandler = (e: React.FormEvent<HTMLElement>) => {
        e.preventDefault();
        console.log(email, password);
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
                <Button colorScheme="linkedin" mt="5" type="submit">
                    로그인
                </Button>
            </form>
        </div>
    );
};

export default SignIn;
