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
import { useRef, memo } from "react";
import DatePicker from "react-datepicker";
import { useOutletContext } from "react-router-dom";
import { IDoc, UserInfoContext } from "types/ts";
import { getPastelColor, getUid } from "utils/common";
import { useForm, Controller } from "react-hook-form";

const CreateDocModal = memo(({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const { register, handleSubmit, control, reset } = useForm<IDoc>();
    const { ref, ...rest } = register("title");
    const initialRef = useRef<HTMLInputElement | null>(null);
    const finalRef = useRef(null);
    const toast = useToast();
    const { userInfo } = useOutletContext<UserInfoContext>();
    const userName = userInfo?.name;
    const company = userInfo?.company;
    const { userUid } = useOutletContext<UserInfoContext>();

    const onSubmit = (data: IDoc) => {
        const { title, type, selectDate } = data;
        const [startDate, endDate] = selectDate;

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
            reset();
        }
    };
    return (
        <Modal initialFocusRef={initialRef} finalFocusRef={finalRef} isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent w="96%">
                <Box as="form" onSubmit={handleSubmit(onSubmit)}>
                    <ModalHeader>연차 신청서</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <Stack gap={2}>
                            <FormControl isRequired>
                                <FormLabel>제목</FormLabel>
                                <Input
                                    type="text"
                                    {...register("title")}
                                    name="title"
                                    placeholder="제목을 입력해주세요."
                                    variant="flushed"
                                    _placeholder={{ fontSize: "0.9rem" }}
                                    ref={(e) => {
                                        ref(e);
                                        initialRef.current = e;
                                    }}
                                />
                            </FormControl>

                            <FormControl isRequired>
                                <FormLabel>종류</FormLabel>
                                <Select placeholder="종류를 선택해주세요." {...register("type")} variant="flushed">
                                    <option value="full">연차</option>
                                    <option value="half">반차</option>
                                </Select>
                            </FormControl>

                            <FormControl mt={4} isRequired>
                                <FormLabel>날짜</FormLabel>
                                <Controller
                                    name="selectDate"
                                    control={control}
                                    render={({ field }) => {
                                        return (
                                            <DatePicker
                                                selected={field?.value?.[0]}
                                                onChange={(dates) => {
                                                    return field.onChange(dates);
                                                }}
                                                startDate={field?.value?.[0]}
                                                endDate={field?.value?.[1]}
                                                selectsRange
                                                placeholderText="기간을 선택해주세요."
                                            />
                                        );
                                    }}
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
