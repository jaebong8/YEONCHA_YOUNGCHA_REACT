import {
    Badge,
    Box,
    Button,
    Center,
    Flex,
    FormControl,
    FormLabel,
    Grid,
    GridItem,
    Input,
    List,
    ListItem,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Spacer,
    Stack,
    useDisclosure,
    useToast,
    Spinner,
    Skeleton,
} from "@chakra-ui/react";
import { format } from "date-fns";
import {
    arrayUnion,
    collection,
    doc,
    getDoc,
    query,
    serverTimestamp,
    setDoc,
    Timestamp,
    where,
} from "firebase/firestore";
import { auth, db } from "firebaseConfig/firebase";
import useDocDataQuery from "hooks/useDocDataQuery";
import useInput from "hooks/useInput";
import { useRef, useState, useCallback, useMemo, memo } from "react";
import DatePicker from "react-datepicker";
import { useOutletContext } from "react-router-dom";
import { DocType, UserType } from "types/ts";
import { getUid } from "utils/common";
import { useFirestoreQueryData } from "@react-query-firebase/firestore";

const DocumentsPage = () => {
    const docModal = useDisclosure();
    const userInfo: UserType = useOutletContext().userInfo;
    const company = userInfo?.company;
    const role = userInfo?.role;
    const userUid = useOutletContext().userUid;
    const userName = userInfo?.name;

    const docInfo = useDocDataQuery(company, userUid)?.data;

    const adminDocRef = collection(db, company);
    const adminDocInfo = useFirestoreQueryData([company], adminDocRef, { subscribe: true })?.data;

    const workerDocList = useMemo(() => {
        const documentList = Object?.values({ ...docInfo });
        documentList.sort((a, b) => a?.createdAt?.toDate() - b?.createdAt?.toDate());
        return documentList;
    }, [docInfo]);

    const adminDocList = useMemo(() => {
        if (adminDocInfo !== undefined) {
            const mergeObj = adminDocInfo?.[0];
            for (let i = 1; i < adminDocInfo.length; i++) {
                Object.assign(mergeObj, adminDocInfo?.[i]);
            }

            const adminArray: any[] = Object.values({ ...mergeObj });
            adminArray.sort((a, b) => a?.createdAt?.toDate() - b?.createdAt?.toDate());
            return adminArray;
        }
    }, [adminDocInfo]);

    return (
        <>
            <Button onClick={docModal.onOpen} p="6" bg="blue.600" color="#fff">
                신청서 작성하기
            </Button>
            <Grid templateRows={"1fr 0.5fr"} templateColumns="repeat(2, 1fr)" p="1" h="100%" gap="1">
                <GridItem bg="#FEFEFE" overflow="auto" p="2">
                    <Center>
                        <Badge colorScheme="red" fontSize="0.6rem">
                            결재 전
                        </Badge>
                    </Center>
                    <Box>
                        <List>
                            <DocumentList
                                workerDocList={role === "worker" ? workerDocList : adminDocList}
                                type="waiting"
                            />
                        </List>
                    </Box>
                </GridItem>
                <GridItem bg="#FEFEFE" overflow="auto" p="2">
                    <Center>
                        <Badge colorScheme="green" fontSize="0.6rem">
                            결재 완료
                        </Badge>
                    </Center>
                    <Box>
                        <List>
                            <DocumentList
                                workerDocList={role === "worker" ? workerDocList : adminDocList}
                                type="success"
                            />
                        </List>
                    </Box>
                </GridItem>
                <GridItem colSpan={2} bg="#FEFEFE" overflow="auto">
                    반려함
                </GridItem>
            </Grid>
            <DocModal isOpen={docModal.isOpen} onClose={docModal.onClose} />
        </>
    );
};

export default DocumentsPage;

const DocumentList = ({ workerDocList, type }: { workerDocList: DocType[] | undefined; type: string }): JSX.Element => {
    return (
        <>
            {workerDocList?.map((doc) => {
                if (doc?.status === type && doc.createdAt !== null) {
                    const date = format(doc?.createdAt?.toDate(), "yyyy/MM/dd HH:mm");
                    return (
                        <ListItem borderBottom="1px solid #efefef" key={doc.documentUid}>
                            <Flex justifyContent="space-between" alignItems="center" p="8px 0">
                                <Badge fontSize="1rem" whiteSpace="pre-wrap">
                                    {doc?.title}
                                </Badge>

                                <Flex gap="2" alignItems="center">
                                    <Badge bg="green.50">{doc?.name}</Badge>
                                    <Badge bg="blue.50">{date}</Badge>
                                </Flex>
                            </Flex>
                        </ListItem>
                    );
                }
            })}
        </>
    );
};

const DocModal = memo(({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [title, setTitle, changeTitle] = useInput("");
    const [type, setType, changeType] = useInput("");
    const initialRef = useRef(null);
    const finalRef = useRef(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const toast = useToast();
    const userInfo: UserType = useOutletContext().userInfo;
    const userName = userInfo?.name;
    const company = userInfo?.company;
    const userUid = useOutletContext().userUid;

    const onSubmitHandler = (e: React.FormEvent<HTMLElement>) => {
        e.preventDefault();
        if (startDate === null || endDate === null) {
            toast({
                title: "기간을 선택해주세요.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }
        if (startDate !== null && endDate !== null) {
            const saveDoc = async () => {
                const documentUid = getUid();
                const date = format(new Date(), "yyyy-MM-dd");
                try {
                    await setDoc(
                        doc(db, company, userUid),
                        {
                            [documentUid]: {
                                title,
                                startDate: format(startDate, "yyyy/MM/dd"),
                                endDate: format(endDate, "yyyy/MM/dd"),
                                userUid,
                                createdAt: serverTimestamp(),
                                status: "waiting",
                                documentUid,
                                type,
                                name: userName,
                                date,
                            },
                        },
                        { merge: true }
                    );
                    toast({
                        title: "성공적으로 제출됐습니다.",
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                    });
                } catch (error) {
                    console.log(error);
                    toast({
                        title: "제출 실패",
                        status: "error",
                        duration: 5000,
                        isClosable: true,
                    });
                }
            };
            saveDoc();
            onClose();
            setTitle("");
            setType("");
            setStartDate(null);
            setEndDate(null);
        }
    };
    return (
        <Modal initialFocusRef={initialRef} finalFocusRef={finalRef} isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <Box as="form" onSubmit={onSubmitHandler}>
                    <ModalHeader>연차 신청서</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <Stack gap={2}>
                            <FormControl isRequired>
                                <FormLabel>제목</FormLabel>
                                <Input
                                    type="text"
                                    value={title}
                                    onChange={changeTitle}
                                    placeholder="제목을 입력해주세요."
                                    variant="flushed"
                                    _placeholder={{ fontSize: "0.9rem" }}
                                    ref={initialRef}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>종류</FormLabel>
                                <Select
                                    placeholder="종류를 선택해주세요."
                                    value={type}
                                    onChange={changeType}
                                    variant="flushed"
                                >
                                    <option value="full">연차</option>
                                    <option value="half">반차</option>
                                </Select>
                            </FormControl>

                            <FormControl mt={4} isRequired>
                                <FormLabel>날짜</FormLabel>
                                <DatePicker
                                    selected={startDate}
                                    onChange={(dates: any) => {
                                        const [start, end] = dates;
                                        setStartDate(start);
                                        setEndDate(end);
                                    }}
                                    startDate={startDate}
                                    endDate={endDate}
                                    selectsRange
                                    placeholderText="기간을 선택해주세요."
                                />
                            </FormControl>
                        </Stack>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} type="submit">
                            신청
                        </Button>
                        <Button onClick={onClose}>취소</Button>
                    </ModalFooter>
                </Box>
            </ModalContent>
        </Modal>
    );
});
