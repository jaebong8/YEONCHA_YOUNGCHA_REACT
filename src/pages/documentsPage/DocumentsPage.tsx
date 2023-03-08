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
import { useRef, useState, useCallback } from "react";
import DatePicker from "react-datepicker";
import { useOutletContext } from "react-router-dom";
import { DocType, UserType } from "types/ts";
import { getUid } from "utils/common";
import { useFirestoreQueryData } from "@react-query-firebase/firestore";

const DocumentsPage = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [title, setTitle, changeTitle] = useInput("");
    const [type, setType, changeType] = useInput("");
    const initialRef = useRef(null);
    const finalRef = useRef(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const toast = useToast();
    const userInfo: UserType = useOutletContext().userInfo;
    const company = userInfo?.company;
    const userUid = useOutletContext().userUid;
    const userName = userInfo?.name;
    const documentsInfo = useDocDataQuery("documents", userUid)?.data ?? {};
    const documentList: DocType[] = Object?.values({ ...documentsInfo?.documents }) ?? [];

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
                try {
                    await setDoc(
                        doc(db, "documents", userUid),
                        {
                            company,
                            documents: {
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
                                },
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
        <>
            <Button onClick={onOpen} p="6" bg="blue.600" color="#fff">
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
                            <DocumentList documentList={documentList} type="waiting" />
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
                            <DocumentList documentList={documentList} type="success" />
                        </List>
                    </Box>
                </GridItem>
                <GridItem colSpan={2} bg="#FEFEFE" overflow="auto">
                    반려함
                </GridItem>
            </Grid>

            <Modal initialFocusRef={initialRef} finalFocusRef={finalRef} isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <Box as="form" onSubmit={onSubmitHandler}>
                        <ModalHeader>연차 신청서</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={6}>
                            <Stack gap={2}>
                                <FormControl isRequired>
                                    <FormLabel>이메일</FormLabel>
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
        </>
    );
};

export default DocumentsPage;

const DocumentList = ({ documentList, type }: { documentList: DocType[]; type: string }): JSX.Element => {
    return (
        <>
            {documentList?.map((doc: DocType) => {
                if (doc?.status === type && doc.createdAt !== null) {
                    const date = format(doc?.createdAt?.toDate(), "yyyy/MM/dd hh:mm");
                    return (
                        <ListItem key={doc?.documentUid} borderBottom="1px solid #efefef">
                            <Flex justifyContent="space-between" alignItems="center" p="8px 0">
                                <Badge fontSize="1rem">{doc?.title}</Badge>

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
