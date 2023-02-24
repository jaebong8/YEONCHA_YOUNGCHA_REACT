import ReactDOM from "react-dom/client";

import "./index.scss";

import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import theme from "styles/theme";
import Fonts from "styles/Fonts";
import { createBrowserRouter, redirect, RouterProvider, useNavigate } from "react-router-dom";
import SignIn from "pages/auth/signIn/SignIn";
import SignUp from "pages/auth/signUp/SignUp";
import Home from "pages/Home";
import Workers from "pages/Workers";

const queryClient = new QueryClient();

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
    },
    {
        path: "/auth/signin",
        element: <SignIn />,
    },
    {
        path: "/auth/signUp",
        element: <SignUp />,
    },
    {
        path: "/workers",
        element: <Workers />,
    },
]);

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={true} />
        <ChakraProvider theme={theme}>
            <Fonts />
            <RouterProvider router={router} />
        </ChakraProvider>
    </QueryClientProvider>
);
