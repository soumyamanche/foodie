import ReactDOM from "react-dom/client";
import Header from "./components/Header";
import Body from "./components/Body";
import Error from "./components/Error";
import RestaurantMenu from "./components/RestaurantMenu";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import { Provider } from "react-redux";
import appStore from "./store/appStore";
import React, { useState, useEffect, lazy, Suspense } from "react";

const About        = lazy(() => import("./components/About"));
const SmartAssist  = lazy(() => import("./components/SmartAssist"));
const HelpCenter   = lazy(() => import("./components/HelpCentre"));
const Cart         = lazy(() => import("./components/Cart"));
const Login        = lazy(() => import("./pages/Login"));
const Register     = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Dashboard    = lazy(() => import("./pages/Dashboard"));

const PageLoader = () => (
  <div className="flex items-center justify-center py-20">
    <h2 className="text-lg font-semibold text-gray-600">Loading...</h2>
  </div>
);

const AppLayout = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
      <Header toggleTheme={toggleTheme} theme={theme} />
      <main>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <Error />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageLoader />}>
            <Body />
          </Suspense>
        ),
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "smart-assist",
        element: <SmartAssist />,
      },
      {
        path: "help",
        element: <HelpCenter />,
      },
      {
        path: "cart",
        element: (
          <PrivateRoute>
            <Cart />
          </PrivateRoute>
        ),
      },
      {
        path: "restaurants/:resId",
        element: (
          <Suspense fallback={<PageLoader />}>
            <RestaurantMenu />
          </Suspense>
        ),
      },
      {
        path: "dashboard",
        element: (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        ),
      },
    ],
  },

  // Auth pages — outside AppLayout, each needs its own Suspense
  {
    path: "/login",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Register />
      </Suspense>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ForgotPassword />
      </Suspense>
    ),
  },

  // Fallback
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Provider store={appStore}>
    <AuthProvider>
      <RouterProvider router={appRouter} />
    </AuthProvider>
  </Provider>
);
