import { LOGO_URL } from "../utils/constants";
import { useState, startTransition } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useOnlineStatus from "../utils/useOnlineStatus";
import { useAuth } from "../context/AuthContext";
import { useSelector } from "react-redux";

const Header = ({ toggleTheme, theme }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const onlineStatus = useOnlineStatus();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  //subscribing to (only items) the store using selector(for reading)
  const cartItems = useSelector((state) => state.cart.items); //selector hook ==>access to our store
  const totalQty = cartItems.reduce((sum, i) => sum + i.qty, 0);

  const handleAuthBtn = async () => {
    if (user) {
      await logout();
      startTransition(() => navigate("/"));
    } else {
      startTransition(() => navigate("/login"));
    }
    setMenuOpen(false);
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/smart-assist", label: "Smart Assist", badge: "AI" },
    { to: "/help", label: "Help", badge: "?" },
  ];

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const navLinkClass = (path) =>
    `relative text-sm font-medium transition-colors duration-200 ${
      isActive(path) ? "text-orange-500" : "text-gray-600 hover:text-orange-500"
    }`;

  return (
    <>
      <header className="flex justify-between items-center px-4 md:px-8 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm sticky top-0 z-50 w-full border-b border-gray-100 dark:border-gray-800">
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <img className="w-14 h-14 object-contain" alt="res-logo" src={LOGO_URL} />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:block text-gray-900 dark:text-white">
          <ul className="flex items-center gap-6">
            {/* Online status */}
            <li>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  onlineStatus ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                }`}
              >
                {onlineStatus ? "● Online" : "● Offline"}
              </span>
            </li>

            {navLinks.map(({ to, label, badge }) => (
              <li key={to}>
                <Link to={to} className={navLinkClass(to)}>
                  <span className="flex items-center gap-1.5">
                    {label}
                    {badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                          badge === "AI"
                            ? "bg-orange-100 text-orange-500"
                            : "bg-blue-100 text-blue-500"
                        }`}
                      >
                        {badge}
                      </span>
                    )}
                  </span>
                  {isActive(to) && (
                    <span className="absolute -bottom-[18px] left-0 right-0 h-0.5 bg-orange-500 rounded-full" />
                  )}
                </Link>
              </li>
            ))}

            {/* Cart — FIX: wrapped navigate with startTransition */}
            <li>
              <div
                className="relative cursor-pointer text-2xl"
                onClick={() => startTransition(() => navigate("/cart"))}
              >
                🛒
                {totalQty > 0 && (
                  <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {totalQty}
                  </span>
                )}
              </div>
            </li>

            {/* Theme Toggle */}
            <li>
              <button
                onClick={toggleTheme}
                className="w-full text-left px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm font-medium transition"
              >
                {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
              </button>
            </li>

            {/* Login / Logout */}
            <li className="flex items-center gap-2">
              {user && (
                <span className="text-sm text-gray-500 max-w-[120px] truncate">
                  👤 {user.displayName || user.email}
                </span>
              )}
              <button
                className="px-5 py-2 bg-orange-500 text-white text-sm font-semibold rounded-full hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition shadow-sm"
                onClick={handleAuthBtn}
              >
                {user ? "Logout" : "Login"}
              </button>
            </li>
          </ul>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Open menu"
          className="md:hidden p-2 text-2xl text-gray-700 hover:text-orange-500 transition rounded-lg hover:bg-orange-50"
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>
      </header>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 ${
          menuOpen ? "right-0" : "-right-72"
        } w-72 h-full bg-white p-6 shadow-2xl transition-all duration-300 z-50 flex flex-col gap-4 border-l border-gray-100`}
      >
        <button
          type="button"
          aria-label="Close menu"
          className="text-xl text-gray-500 hover:text-gray-800 self-end p-1 rounded-lg hover:bg-gray-100 transition"
          onClick={() => setMenuOpen(false)}
        >
          ✖
        </button>

        <p className="text-sm text-gray-500 pb-2 border-b border-gray-100">
          Status:{" "}
          <span className={onlineStatus ? "text-green-600" : "text-red-500"}>
            {onlineStatus ? "Online" : "Offline"}
          </span>
        </p>

        {navLinks.map(({ to, label, badge }) => (
          <Link
            key={to}
            to={to}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              isActive(to) ? "text-orange-500" : "text-gray-600 hover:text-orange-500"
            }`}
            onClick={() => setMenuOpen(false)}
          >
            {label}
            {badge && (
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${
                  badge === "AI"
                    ? "bg-orange-100 text-orange-500"
                    : "bg-blue-100 text-blue-500"
                }`}
              >
                {badge}
              </span>
            )}
          </Link>
        ))}

        {/* Mobile Cart — FIX: wrapped navigate with startTransition */}
        <div
          className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-orange-500 font-medium text-sm transition"
          onClick={() => {
            startTransition(() => navigate("/cart"));
            setMenuOpen(false);
          }}
        >
          <span className="text-xl">🛒</span>
          Cart
          {totalQty > 0 && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {totalQty}
            </span>
          )}
        </div>

        {user && (
          <p className="text-sm text-gray-500 truncate">
            👤 {user.displayName || user.email}
          </p>
        )}

        <button
          className="mt-2 px-5 py-2.5 bg-orange-500 text-white font-semibold rounded-full hover:bg-orange-600 transition shadow-sm"
          onClick={handleAuthBtn}
        >
          {user ? "Logout" : "Login"}
        </button>
      </aside>
    </>
  );
};

export default Header;
