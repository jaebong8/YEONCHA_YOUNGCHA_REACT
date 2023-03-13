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
    Heading,
    Text,
    StackDivider,
    VStack,
} from "@chakra-ui/react";
import { format } from "date-fns";
import {
    arrayUnion,
    collection,
    deleteField,
    doc,
    getDoc,
    query,
    serverTimestamp,
    setDoc,
    Timestamp,
    updateDoc,
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
    const role = userInfo?.role;
    return (
        <>
            {role === "worker" && (
                <Button onClick={docModal.onOpen} p="6" bg="blue.600" color="#fff">
                    신청서 작성하기
                </Button>
            )}
            <Grid templateRows={"1fr 0.5fr"} templateColumns="repeat(2, 1fr)" p="1" h="100%" gap="1">
                <GridItem bg="#FEFEFE" overflow="auto" p="2">
                    <Center>
                        <Badge colorScheme="red" fontSize="0.6rem">
                            결재 전
                        </Badge>
                    </Center>
                    <Box>
                        <List>
                            <DocumentList type="waiting" />
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
                            <DocumentList type="success" />
                        </List>
                    </Box>
                </GridItem>
                <GridItem colSpan={2} bg="#FEFEFE" overflow="auto" p="2">
                    <Center>
                        <Badge colorScheme="red" fontSize="0.6rem">
                            반려함
                        </Badge>
                    </Center>
                    <Box>
                        <List>
                            <DocumentList type="reject" />
                        </List>
                    </Box>
                </GridItem>
            </Grid>
            <CreateDocModal isOpen={docModal.isOpen} onClose={docModal.onClose} />
        </>
    );
};

export default DocumentsPage;
// { workerDocList, type }: { workerDocList: DocType[] | undefined; type: string }
const DocumentList = ({ type }: { type: string }): JSX.Element => {
    const userInfo: UserType = useOutletContext().userInfo;
    const company = userInfo?.company;
    const role = userInfo?.role;
    const userUid = useOutletContext().userUid;
    const detailModal = useDisclosure();
    const docInfo = useDocDataQuery(company, userUid)?.data;

    const adminDocRef = collection(db, company);
    const adminDocInfo = useFirestoreQueryData([company], adminDocRef, { subscribe: true })?.data;

    const [clickedData, setClickedData] = useState<DocType | null>(null);

    const workerDocList = useMemo(() => {
        if (role === "worker") {
            const documentList = Object?.values({ ...docInfo });
            documentList.sort((a, b) => a?.createdAt?.toDate() - b?.createdAt?.toDate());
            return documentList;
        }
        if (role === "admin" && adminDocInfo !== undefined) {
            const mergeObj = adminDocInfo?.[0];
            for (let i = 1; i < adminDocInfo.length; i++) {
                Object.assign(mergeObj, adminDocInfo?.[i]);
            }

            const adminArray: any[] = Object.values({ ...mergeObj });
            adminArray.sort((a, b) => a?.createdAt?.toDate() - b?.createdAt?.toDate());
            return adminArray;
        }
    }, [docInfo, adminDocInfo, role]);

    const onClickHandler = useCallback(
        (doc: DocType): any => {
            setClickedData(() => {
                const newData = { ...doc };
                return newData;
            });
            detailModal.onOpen();
        },
        [detailModal]
    );
    return (
        <>
            {workerDocList?.map((doc) => {
                if (doc?.status === type && doc.createdAt !== null) {
                    const date = format(doc?.createdAt?.toDate(), "yyyy/MM/dd HH:mm");
                    return (
                        <ListItem
                            borderBottom="1px solid #efefef"
                            key={doc.documentUid}
                            onClick={() => {
                                onClickHandler(doc);
                            }}
                            cursor="pointer"
                            _hover={{ backgroundColor: "#f7f7f7" }}
                        >
                            {doc?.status === "reject" ? (
                                <>
                                    <Flex alignItems="center" p="8px 0">
                                        <Flex flexBasis="50%" justifyContent="space-between" alignItems="center">
                                            <Badge fontSize="1rem" whiteSpace="pre-wrap">
                                                {doc?.title}
                                            </Badge>

                                            <Flex gap="2" alignItems="center" pr="4" borderRight="1px solid #eee">
                                                <Badge bg="green.50">{doc?.name}</Badge>
                                                <Badge bg="blue.50">{date}</Badge>
                                            </Flex>
                                        </Flex>

                                        <Flex flexBasis="50%" alignItems="center" pl="4">
                                            <Badge bg="red.50">반려 사유 : {doc?.reject}</Badge>
                                        </Flex>
                                    </Flex>
                                </>
                            ) : (
                                <Flex justifyContent="space-between" alignItems="center" p="8px 0">
                                    <Badge fontSize="1rem" whiteSpace="pre-wrap">
                                        {doc?.title}
                                    </Badge>

                                    <Flex gap="2" alignItems="center">
                                        <Badge bg="green.50">{doc?.name}</Badge>
                                        <Badge bg="blue.50">{date}</Badge>
                                    </Flex>
                                </Flex>
                            )}
                        </ListItem>
                    );
                }
            })}
            <DetailModal detailModal={detailModal} clickedData={clickedData} company={company} role={role} />
        </>
    );
};

const CreateDocModal = memo(({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
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

const DetailModal = ({
    detailModal,
    clickedData,
    company,
    role,
}: {
    detailModal: {
        isOpen: boolean;
        onOpen: () => void;
        onClose: () => void;
        onToggle: () => void;
        isControlled: boolean;
        getButtonProps: (props?: any) => any;
        getDisclosureProps: (props?: any) => any;
    };
    clickedData: DocType | null;
    company: string;
    role: string;
}) => {
    const toast = useToast();
    const initialRef = useRef(null);
    const rejectModal = useDisclosure();
    const [rejectReason, setRejectReason, changeRejectReason] = useInput("");
    const successBtnHandler = useCallback(async () => {
        console.log(clickedData);
        try {
            if (clickedData !== null) {
                await updateDoc(doc(db, company, clickedData?.userUid), {
                    [clickedData?.documentUid]: {
                        createdAt: clickedData?.createdAt,
                        documentUid: clickedData?.documentUid,
                        endDate: clickedData?.endDate,
                        name: clickedData?.name,
                        startDate: clickedData?.startDate,
                        status: "success",
                        title: clickedData?.title,
                        type: clickedData?.type,
                        userUid: clickedData?.userUid,
                        date: clickedData?.date,
                    },
                });
                toast({
                    title: `결재를 완료하였습니다.`,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                detailModal.onClose();
            }
        } catch (error) {
            console.log(error);
        }
    }, [clickedData, toast, company, detailModal]);

    const rejectSubmitHandler = useCallback(
        async (e: React.FormEvent<HTMLElement>) => {
            e.preventDefault();
            try {
                if (clickedData !== null) {
                    await updateDoc(doc(db, company, clickedData?.userUid), {
                        [clickedData?.documentUid]: {
                            createdAt: clickedData?.createdAt,
                            documentUid: clickedData?.documentUid,
                            endDate: clickedData?.endDate,
                            name: clickedData?.name,
                            startDate: clickedData?.startDate,
                            status: "reject",
                            title: clickedData?.title,
                            type: clickedData?.type,
                            userUid: clickedData?.userUid,
                            date: clickedData?.date,
                            reject: rejectReason,
                        },
                    });
                    toast({
                        title: `결재를 완료하였습니다.`,
                        status: "success",
                        duration: 5000,
                        isClosable: true,
                    });
                    rejectModal.onClose();
                    detailModal.onClose();
                }
            } catch (error) {
                console.log(error);
            }
        },
        [clickedData, company, rejectModal, rejectReason, toast, detailModal]
    );

    const deleteDocHandler = useCallback(async () => {
        try {
            if (clickedData !== null) {
                await updateDoc(doc(db, company, clickedData?.userUid), {
                    [clickedData?.documentUid]: deleteField(),
                });
                detailModal.onClose();
                toast({
                    title: `문서 삭제를 성공하였습니다.`,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.log(error);
            toast({
                title: `문서 삭제를 실패하였습니다.`,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    }, [clickedData, company, detailModal, toast]);

    return (
        <>
            <Modal isOpen={detailModal.isOpen} onClose={detailModal.onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>신청서</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <VStack divider={<StackDivider bg="gray.200" h="1px" />} spacing="2" align="stretch">
                            <Box>
                                <Heading size="xs" textTransform="uppercase" color="gray.500">
                                    제목
                                </Heading>
                                <Text pt="2" fontSize="md">
                                    {clickedData?.title}
                                </Text>
                            </Box>
                            <Box>
                                <Heading size="xs" textTransform="uppercase" color="gray.500">
                                    신청자
                                </Heading>
                                <Text pt="2" fontSize="md">
                                    {clickedData?.name}
                                </Text>
                            </Box>
                            <Box>
                                <Heading size="xs" textTransform="uppercase" color="gray.500">
                                    종류
                                </Heading>
                                <Text pt="2" fontSize="md">
                                    {clickedData?.type === "full" ? "연차" : "반차"}
                                </Text>
                            </Box>
                            <Box>
                                <Heading size="xs" textTransform="uppercase" color="gray.500">
                                    신청 날짜
                                </Heading>
                                <Text pt="2" fontSize="md">
                                    {`${clickedData?.startDate} ~ ${clickedData?.endDate}`}
                                </Text>
                            </Box>
                            {clickedData?.reject && (
                                <Box>
                                    <Heading size="xs" textTransform="uppercase" color="gray.500">
                                        반려 사유
                                    </Heading>
                                    <Text pt="2" fontSize="md">
                                        {clickedData?.reject}
                                    </Text>
                                </Box>
                            )}
                        </VStack>
                    </ModalBody>

                    <ModalFooter>
                        {clickedData?.status === "waiting" && role === "admin" && (
                            <>
                                <Button
                                    colorScheme="pink"
                                    mr={3}
                                    onClick={() => {
                                        rejectModal.onOpen();
                                    }}
                                >
                                    반려
                                </Button>

                                <Button colorScheme="blue" onClick={successBtnHandler}>
                                    승인
                                </Button>
                            </>
                        )}
                        {((clickedData?.status === "success" && role === "admin") ||
                            (clickedData?.status === "waiting" && role === "worker")) && (
                            <Button colorScheme="pink" onClick={deleteDocHandler}>
                                삭제
                            </Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={rejectModal.isOpen} onClose={rejectModal.onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>반려</ModalHeader>
                    <ModalCloseButton />
                    <Box as="form" onSubmit={rejectSubmitHandler}>
                        <ModalBody>
                            <FormControl isRequired>
                                <FormLabel>사유</FormLabel>
                                <Input
                                    type="text"
                                    placeholder="사유를 입력해주세요."
                                    variant="flushed"
                                    _placeholder={{ fontSize: "0.9rem" }}
                                    ref={initialRef}
                                    value={rejectReason}
                                    onChange={changeRejectReason}
                                />
                            </FormControl>
                        </ModalBody>

                        <ModalFooter>
                            <Button colorScheme="pink" mr={3} type="submit">
                                반려
                            </Button>
                        </ModalFooter>
                    </Box>
                </ModalContent>
            </Modal>
        </>
    );
};
