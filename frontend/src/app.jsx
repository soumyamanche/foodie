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
const About = lazy(() => import("./components/About"));
const SmartAssist = lazy(() => import("./components/SmartAssist"));
const HelpCenter = lazy(() => import("./components/HelpCentre"));
const Cart = lazy(() => import("./components/Cart"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));


const AppLayout = () => {
  const [theme, setTheme] = useState(() => {
  return localStorage.getItem("theme") || "light";
});


 useEffect(() => {
  localStorage.setItem("theme", theme);

  document.documentElement.classList.toggle(
    "dark",
    theme === "dark"
  );
}, [theme]);


  // Toggle cycle
 const toggleTheme = () => {
  setTheme((prev) => (prev === "light" ? "dark" : "light"));
};

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors duration-300">
        <Header toggleTheme={toggleTheme} theme={theme} />
      <main>
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <h2 className="text-lg font-semibold text-gray-600">
                Loading...
              </h2>
            </div>
          }
        >
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
        element: <Body />,       
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
        element: <RestaurantMenu />, 
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

  // Auth pages (outside AppLayout so no Header shown) 
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },

  //  Fallback: unknown routes go to home (Option 2) 
  {
    path: "*",
    element: <Navigate to="/" replace />, 
  },
]);


const root = ReactDOM.createRoot(document.getElementById("root"));//Used for Client-Side Routing

root.render(
  <Provider store={appStore}>
    <AuthProvider>
      <RouterProvider router={appRouter} />
    </AuthProvider>
  </Provider>
);