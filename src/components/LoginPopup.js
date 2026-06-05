import { useNavigate } from "react-router-dom";

export default function LoginPopup({ onClose }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4"
    >
      {/* POPUP */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm scale-100 rounded-3xl bg-white p-8 shadow-2xl transition-all duration-300"
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-xl text-gray-400 hover:text-black"
        >
          ✕
        </button>

        {/* ICON */}
        <div className="mb-4 text-center text-5xl">
          🔐
        </div>

        {/* TITLE */}
        <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">
          Login to continue
        </h2>

        {/* SUBTITLE */}
        <p className="mb-6 text-center text-sm leading-6 text-gray-500">
          Please login or create an account
          to add items to your cart
        </p>

        {/* LOGIN BUTTON */}
        <button
          onClick={() => {
            onClose();
            navigate("/login");
          }}
          className="mb-3 w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
        >
          Login
        </button>

        {/* REGISTER BUTTON */}
        <button
          onClick={() => {
            onClose();
            navigate("/register");
          }}
          className="mb-5 w-full rounded-xl border-2 border-orange-500 py-3 text-sm font-semibold text-orange-500 transition hover:bg-orange-50"
        >
          Create Account
        </button>

        {/* CONTINUE */}
        <p
          onClick={onClose}
          className="cursor-pointer text-center text-sm text-gray-400 underline hover:text-gray-600"
        >
          Continue browsing →
        </p>
      </div>
    </div>
  );
}