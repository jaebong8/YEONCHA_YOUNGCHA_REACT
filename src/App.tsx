import { createBrowserRouter, redirect, RouterProvider, useNavigate } from "react-router-dom";
import SignIn from "pages/auth/signIn/SignIn";
import SignUp from "pages/auth/signUp/SignUp";
import Home from "pages/Home";
import Workers from "pages/workers/Workers";

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
    return <RouterProvider router={router} />;
};

export default App;
