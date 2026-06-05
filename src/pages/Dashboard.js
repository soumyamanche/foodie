import { useState } from "react";
import { useNavigate } from "react-router-dom";//navigates over pages
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  //runs when logout button is clicked
  const handleLogout = async () => {
    try {
      setError(""); 
      await logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setError(`Logout failed: ${err.code || err.message}`);
    }
  };

  const displayName = user?.displayName || user?.email || "User";
  const initials    = displayName[0].toUpperCase();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
      <div className="bg-white border border-gray-200 rounded-2xl px-9 py-10 w-full max-w-sm shadow-lg text-center">

        {/* Brand */}
        <div className="font-serif text-3xl text-gray-900 mb-6">
          siw<span className="text-orange-500">ggy</span>
        </div>

        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-orange-50 border-2 border-orange-500 flex items-center justify-center font-serif text-2xl text-orange-500 mx-auto mb-4">
          {initials}
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          Welcome, {displayName}!
        </h2>
        <p className="text-xs text-gray-500 mb-1">{user?.email}</p>
        <p className="text-xs text-gray-500 mb-7">You are logged in via Firebase ✓</p>

        {/* Error */}
        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 mb-4">
            {error}
          </div>
        )}

        {/* Placeholder */}
        <div className="bg-orange-50 dark:bg-gray-800 border border-orange-100 dark:border-gray-700 rounded-xl p-5 text-left mb-5">
  <h3 className="text-orange-600 font-semibold text-sm mb-2">
    🤖 AI Food Suggestion
  </h3>

  <p className="text-gray-700 dark:text-gray-300 text-sm leading-6">
    Based on popular orders near you, try
    <span className="font-semibold text-orange-500">
      {" "}Butter Chicken
    </span>
    {" "}with
    <span className="font-semibold text-orange-500">
      {" "}Garlic Naan
    </span>
    today.
  </p>

  <button
    onClick={() => navigate("/")}
    className="mt-4 px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition"
  >
    Order Now
  </button>
</div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="bg-transparent text-orange-500 border border-orange-500 hover:bg-orange-50 px-7 py-3 rounded-xl text-sm cursor-pointer transition mt-2"
        >
          Logout
        </button>

      </div>
    </div>
  );
}