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
    useDisclosure,
    useToast,
    Heading,
    Text,
    StackDivider,
    VStack,
} from "@chakra-ui/react";
import { differenceInCalendarDays, format } from "date-fns";
import { deleteField, doc, increment, updateDoc } from "firebase/firestore";
import { auth, db } from "firebaseConfig/firebase";
import useInput from "hooks/useInput";
import { useRef, useCallback, useMemo } from "react";
import { DocType } from "types/ts";

const DocDetailModal = ({
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
    const [rejectReason, , changeRejectReason] = useInput("");
    const anuual = useMemo(() => {
        if (clickedData !== null) {
            return differenceInCalendarDays(new Date(clickedData?.endDate), new Date(clickedData?.startDate)) + 1;
        }
    }, [clickedData]);

    const successBtnHandler = useCallback(async () => {
        try {
            if (clickedData !== null) {
                const userUid = auth?.currentUser?.uid ?? "empty";
                const userRef = doc(db, "users", userUid);
                const year = format(new Date(clickedData?.date), "yyyy");
                const annual =
                    differenceInCalendarDays(new Date(clickedData?.endDate), new Date(clickedData?.startDate)) + 1;
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
                        color: clickedData?.color,
                    },
                });
                const keyName = `workers.${clickedData?.userUid}.${year}`;
                await updateDoc(userRef, {
                    [keyName]: increment(annual),
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
                    const userUid = auth?.currentUser?.uid ?? "empty";
                    const userRef = doc(db, "users", userUid);
                    const year = format(new Date(clickedData?.date), "yyyy");
                    const annual =
                        (differenceInCalendarDays(new Date(clickedData?.endDate), new Date(clickedData?.startDate)) +
                            1) *
                        -1;

                    if (clickedData.status === "success") {
                        const keyName = `workers.${clickedData?.userUid}.${year}`;
                        await updateDoc(userRef, {
                            [keyName]: increment(annual),
                        });
                    }
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
                            color: clickedData?.color,
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
                <ModalContent w="96%">
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
                                    {`${clickedData?.startDate} ~ ${clickedData?.endDate} (${anuual}일)`}
                                </Text>
                            </Box>
                            {clickedData?.reject && (
                                <Box>
                                    <Heading size="xs" textTransform="uppercase" color="red.500">
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
                        {clickedData?.status === "success" && role === "admin" && (
                            <Button
                                colorScheme="pink"
                                mr={3}
                                onClick={() => {
                                    rejectModal.onOpen();
                                }}
                            >
                                반려
                            </Button>
                        )}
                        {clickedData?.status === "waiting" && role === "worker" && (
                            <Button colorScheme="pink" onClick={deleteDocHandler}>
                                삭제
                            </Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <Modal isOpen={rejectModal.isOpen} onClose={rejectModal.onClose}>
                <ModalOverlay />
                <ModalContent w="96%">
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

export default DocDetailModal;
