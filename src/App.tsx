import { createBrowserRouter, redirect, RouterProvider, useNavigate } from "react-router-dom";
import SignIn from "pages/auth/signIn/SignIn";
import SignUp from "pages/auth/signUp/SignUp";
import Home from "pages/Home";
import Workers from "pages/workers/Workers";
import Admin from "pages/auth/signUp/Admin";
import Worker from "pages/auth/signUp/Worker";

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
        children: [
            {
                path: "admin",
                element: <Admin />,
            },
            {
                path: "worker",
                element: <Worker />,
            },
        ],
    },
    {
        path: "/workers",
        element: <Workers />,
    },
]);
const App = () => {
    return <RouterProvider router={router} />;
};

export default App;
