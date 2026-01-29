import { createBrowserRouter, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import NotFound from "./components/NotFound";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import ErrorBoundry from "./components/ErrorBoundry";
import Invoices from "./pages/Invoices";
export const router = createBrowserRouter(
    [
        {
            path: "/",
            element: <MainLayout />,
            errorElement: <ErrorBoundry />,
            // loader: rootLoader,
            children: [
                // {
                //   path: "auth",
                //   element: <PublicLayout />,
                //   children: [
                //     {
                //       path: "login",
                //       element: <Login />,
                //     }
                //   ],
                // },
                {
                    path: "",
                    element: <Navigate to={`dashboard`} />,
                },
                {
                    path: "dashboard",
                    element: <Dashboard />,
                },
                 {
                    path: "analytics",
                    element: <Analytics />,
                },
                 {
                    path: "invoices",
                    element: <Invoices />,
                },
                {
                    path : "*",
                    element: <NotFound />
                }

            ],


        },
    ],
    {
        basename: `/${import.meta.env.VITE_BASE_NAME}`,
    }
);
