import ReactDOM from "react-dom/client";

import "./index.scss";
import App from "./App";

import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import theme from "styles/theme";
import Fonts from "styles/Fonts";

const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={true} />
        <ChakraProvider theme={theme}>
            <Fonts />
            <App />
        </ChakraProvider>
    </QueryClientProvider>
);
