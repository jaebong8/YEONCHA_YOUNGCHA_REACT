import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "styles/global.scss";
import App from "./App";
import SignIn from "pages/auth/signIn/SignIn";
import SignUp from "pages/auth/signUp/SignUp";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

const queryClient = new QueryClient();

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
    },
    {
        path: "/auth/signin",
        element: <SignIn />,
    },
    {
        path: "/auth/signUp",
        element: <SignUp />,
    },
]);

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);
root.render(
    <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools initialIsOpen={true} />
        <ChakraProvider>
            <RouterProvider router={router} />
        </ChakraProvider>
    </QueryClientProvider>
);
