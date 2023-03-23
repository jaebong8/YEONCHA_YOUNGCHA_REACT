import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignIn from "pages/auth/signIn/SignIn";
import SignUp from "pages/auth/signUp/SignUp";
import Home from "pages/Home";
import Admin from "pages/auth/signUp/Admin";
import Worker from "pages/auth/signUp/Worker";
import Calendar from "components/calendar/Calendar";
import DocumentsPage from "pages/documentsPage/DocumentsPage";
import WorkersPage from "pages/workersPage/WorkersPage";
import MyPage from "pages/myPage/MyPage";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home />,
        children: [
            {
                path: "calendar",
                element: <Calendar />,
            },
            {
                path: "workers",
                element: <WorkersPage />,
            },
            {
                path: "documents",
                element: <DocumentsPage />,
            },
            {
                path: "myPage",
                element: <MyPage />,
            },
        ],
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
]);
const App = () => {
    return <RouterProvider router={router} />;
};

export default App;
