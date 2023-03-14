import { Badge, Box, Button, Center, Flex, Grid, GridItem, List, ListItem, useDisclosure } from "@chakra-ui/react";
import { format } from "date-fns";
import { collection } from "firebase/firestore";
import { db } from "firebaseConfig/firebase";
import useDocDataQuery from "hooks/useDocDataQuery";
import { useState, useCallback, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { DocType, UserType } from "types/ts";
import { useFirestoreQueryData } from "@react-query-firebase/firestore";
import DocDetailModal from "./DocDetailModal";
import CreateDocModal from "./CreateDocModal";

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
            <DocDetailModal detailModal={detailModal} clickedData={clickedData} company={company} role={role} />
        </>
    );
};
