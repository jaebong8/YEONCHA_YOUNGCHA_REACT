import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Stack,
    useToast,
} from "@chakra-ui/react";
import { format } from "date-fns";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "firebaseConfig/firebase";
import useInput from "hooks/useInput";
import { useRef, useState, memo } from "react";
import DatePicker from "react-datepicker";
import { useOutletContext } from "react-router-dom";
import { UserInfoContext, UserType } from "types/ts";
import { getPastelColor, getUid } from "utils/common";

const CreateDocModal = memo(({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [title, setTitle, changeTitle] = useInput("");
    const [type, setType, changeType] = useInput("");
    const initialRef = useRef(null);
    const finalRef = useRef(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const toast = useToast();
    const { userInfo } = useOutletContext<UserInfoContext>();
    const userName = userInfo?.name;
    const company = userInfo?.company;
    const { userUid } = useOutletContext<UserInfoContext>();

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
                                color: getPastelColor(),
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
            <ModalContent w="96%">
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

export default CreateDocModal;
