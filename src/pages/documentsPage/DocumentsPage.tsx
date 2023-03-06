import {
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
} from "@chakra-ui/react";
import { useRef } from "react";
const DocumentsPage = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const initialRef = useRef(null);
    const finalRef = useRef(null);
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
                    <ModalHeader>연차 신청서</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl>
                            <FormLabel>제목</FormLabel>
                            <Input ref={initialRef} placeholder="제목을 입력해주세요." />
                        </FormControl>

                        <FormControl mt={4}>
                            <FormLabel>날짜</FormLabel>
                            <Input placeholder="날짜를 선택해주세요." />
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme="blue" mr={3}>
                            신청
                        </Button>
                        <Button onClick={onClose}>취소</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default DocumentsPage;
