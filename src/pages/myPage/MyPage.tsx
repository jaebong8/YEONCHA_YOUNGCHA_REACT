import { Avatar, Badge, Center, Flex, Heading, List, ListItem, Spinner } from "@chakra-ui/react";
import { useFirestoreDocumentData } from "@react-query-firebase/firestore";
import { format } from "date-fns";
import { doc } from "firebase/firestore";
import { db } from "firebaseConfig/firebase";
import { useOutletContext } from "react-router-dom";
import { UserInfoContext } from "types/ts";

const MyPage = () => {
    const { userInfo } = useOutletContext<UserInfoContext>();
    const { userUid } = useOutletContext<UserInfoContext>();
    const adminUid = userInfo.adminUid ?? "temp";
    const ref = doc(db, "users", adminUid);
    const product = useFirestoreDocumentData(["adminInfo", adminUid], ref, { subscribe: true });
    const year = format(new Date(), "yyyy");
    const annual = product?.data?.workers[userUid][year];

    return (
        <Center w="100%" h="100%">
            <Flex w="360px" h="100%" flexDirection="column">
                <Flex
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    flexBasis="30%"
                    mt="1rem"
                    bg="whiteAlpha.600"
                >
                    <Avatar bg="teal.500" w="60px" h="60px" />
                    <Heading size="lg">{userInfo.email}</Heading>
                    <Badge mt="1" bg="blue.50" p="0.25rem 0.75rem">
                        {userInfo.role === "admin" ? "관리자" : "직원"}
                    </Badge>
                </Flex>
                {userInfo.role === "worker" && (
                    <Flex
                        flexDirection="column"
                        justifyContent="flex-start"
                        alignItems="center"
                        flexBasis="70%"
                        mt="1rem"
                    >
                        {annual === undefined ? (
                            <Spinner />
                        ) : (
                            <List w="100%" display="flex" flexDir="column" gap="0.5rem">
                                <ListItemComponent title={"이름"} value={userInfo.name} />
                                <ListItemComponent title={"생년월일"} value={userInfo.birthDate} />
                                <ListItemComponent title={"회사"} value={userInfo.company} />
                                <ListItemComponent title={"연락처"} value={userInfo.phoneNumber} />
                                <ListItemComponent title={"입사일"} value={userInfo.workStartDate} />
                                <ListItemComponent title={"연차 사용 횟수"} value={annual} />
                            </List>
                        )}
                    </Flex>
                )}
            </Flex>
        </Center>
    );
};

const ListItemComponent = ({ title, value }: { title: string | undefined; value: string | undefined }) => {
    return (
        <ListItem display="flex" alignItems="center" w="100%" bg="whiteAlpha.600" gap="1rem">
            <Flex
                flexBasis="30%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                h="100%"
                p="1rem 0.5rem"
                borderRight="1px solid #eee"
                fontSize="0.8rem"
                fontWeight="700"
            >
                {title}
            </Flex>

            <Flex flexBasis="70%" display="flex" alignItems="center" justifyContent="center" p="1rem 0.5rem">
                <Badge fontSize="0.9rem" bg="gray.100">
                    {value}
                </Badge>
            </Flex>
        </ListItem>
    );
};

export default MyPage;
