import { createBrowserRouter, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import NotFound from "./components/NotFound";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";
import ErrorBoundry from "./components/ErrorBoundry";
import Invoices from "./pages/Invoices";
import SalesOrdersPage from "./pages/SalesOrdersPage";
import QuotationsPage from "./pages/Quotation";
import DeliveryNotesPage from "./pages/DeliveryNote";
import Ledger from "./pages/Ledger";
import Inventory from "./pages/Inventory";
export const router = createBrowserRouter(
    [
        {
            path: "/login",
            element: <Login currentPath="/login" />,
        },
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
                    path: "orders",
                    element: <SalesOrdersPage />,
                },
                {
                    path: "quotes",
                    element: <QuotationsPage />,
                },
                {
                    path: "delivery",
                    element: <DeliveryNotesPage />,
                },
                {
                    path: "ledger",
                    element: <Ledger />,
                },
                {
                    path: "inventory",
                    element: <Inventory />,
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
