import { createBrowserRouter, redirect, RouterProvider, useNavigate } from "react-router-dom";
import SignIn from "pages/auth/signIn/SignIn";
import SignUp from "pages/auth/signUp/SignUp";
import Home from "pages/Home";
import Workers from "pages/workers/Workers";
import { auth } from "firebaseConfig/firebase";
import { useAuthUser } from "@react-query-firebase/auth";
import React from "react";
import Spinner from "components/spinner/Spinner";

export const myContext = React.createContext({});

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
const App = () => {
    const user = useAuthUser(["user"], auth);
    if (!user.isLoading) {
        return (
            <myContext.Provider value={user}>
                <RouterProvider router={router} />
            </myContext.Provider>
        );
    } else {
        return <Spinner />;
    }
};

export default App;
