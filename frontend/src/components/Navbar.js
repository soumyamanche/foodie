import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between bg-white px-8 py-4 shadow-md">
      
      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        className="flex cursor-pointer items-center gap-2 text-[22px]"
      >
        🍔
        <span className="text-[22px] font-bold text-orange-500">
          Swiggy
        </span>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search for restaurants, food..."
        className="mx-6 flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-orange-500"
      />

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="text-sm font-medium text-gray-700">
              👤 {user.displayName || user.email}
            </span>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-red-600 px-5 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="rounded-lg bg-orange-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}