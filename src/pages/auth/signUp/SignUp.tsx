import { Button, Center, Stack } from "@chakra-ui/react";
import { Img } from "@chakra-ui/react";
import logo from "assets/images/mainIcon.png";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const SignUp = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const pathName = location.pathname;

    return (
        <Center h="100vh">
            <Center bg="#FFFFFF" h="100%" w="sm" flexDir="column">
                <Img boxSize="150px" objectFit="cover" src={logo} alt="mainIcon" mb="4" />
                {pathName === "/auth/signup" && (
                    <Stack w="80%" minW="180px" spacing="4">
                        <Button
                            colorScheme="pink"
                            onClick={() => {
                                navigate("admin");
                            }}
                        >
                            관리자로 가입하기
                        </Button>
                        <Button
                            colorScheme="teal"
                            onClick={() => {
                                navigate("worker");
                            }}
                        >
                            직원으로 가입하기
                        </Button>
                    </Stack>
                )}
                <Outlet />
            </Center>
        </Center>
    );
};

export default SignUp;
