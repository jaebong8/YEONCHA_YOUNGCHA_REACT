import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
    fonts: {
        body: `'Noto Sans KR', 'Roboto'`,
    },
    styles: {
        global: {
            body: {
                bg: "blackAlpha.50",
            },
        },
    },
});

export default theme;
