import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Grid,
    GridItem,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useDisclosure,
    useToast,
} from "@chakra-ui/react";
import { format } from "date-fns";
import { arrayUnion, doc, getDoc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "firebaseConfig/firebase";
import useInput from "hooks/useInput";
import { useRef, useState, useCallback } from "react";
import DatePicker from "react-datepicker";
import { useOutletContext } from "react-router-dom";
import { UserType } from "types/ts";
const DocumentsPage = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [title, setTitle, changeTitle] = useInput("");
    const initialRef = useRef(null);
    const finalRef = useRef(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const toast = useToast();
    const userInfo: UserType = useOutletContext().userInfo;

    const onSubmitHandler = (e: React.FormEvent<HTMLElement>) => {
        e.preventDefault();
        if (startDate === null || endDate === null) return;
        if (startDate !== null && endDate !== null) {
            const saveDoc = async () => {
                const company = userInfo.company;
                const userUid = userInfo.userUid;
                await setDoc(
                    doc(db, "documents", company),
                    {
                        [userUid]: arrayUnion({
                            title,
                            startDate: format(startDate, "yyyy/MM/dd"),
                            endDate: format(endDate, "yyyy/MM/dd"),
                            userUid,
                            createdAt: new Date(),
                            status: "waiting",
                        }),
                    },
                    { merge: true }
                );
            };
            saveDoc();
            setTitle("");
            setStartDate(null);
            setEndDate(null);
            toast({
                title: "성공적으로 제출됐습니다.",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        }
    };
    return (
        <>
            <Button onClick={onOpen}>신청서 작성하기</Button>
            <Grid templateRows={"1fr 0.5fr"} templateColumns="repeat(2, 1fr)" p="1" h="100%" gap="1">
                <GridItem bg="#FEFEFE">결재 전</GridItem>
                <GridItem bg="#FEFEFE">결재 후</GridItem>
                <GridItem colSpan={2} bg="#FEFEFE">
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
                                />
                            </FormControl>
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
