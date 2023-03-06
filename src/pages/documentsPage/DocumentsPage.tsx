import { Grid, GridItem } from "@chakra-ui/react";

const DocumentsPage = () => {
    return (
        <Grid templateRows={"1fr 0.5fr"} templateColumns="repeat(2, 1fr)" p="1" h="100%" gap="1">
            <GridItem bg="#FEFEFE">결재 전</GridItem>
            <GridItem bg="#FEFEFE">결재 후</GridItem>
            <GridItem colSpan={2} bg="#FEFEFE">
                반려함
            </GridItem>
        </Grid>
    );
};

export default DocumentsPage;
