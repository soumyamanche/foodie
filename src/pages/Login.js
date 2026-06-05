import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":    setError("No account found with this email."); break;
        case "auth/wrong-password":    setError("Incorrect password. Please try again."); break;
        case "auth/invalid-email":     setError("Please enter a valid email address."); break;
        case "auth/too-many-requests": setError("Too many attempts. Please wait a moment."); break;
        default:                       setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
      <div className="bg-white border border-gray-200 rounded-2xl px-9 py-10 w-full max-w-sm shadow-lg">

        {/* Brand */}
        <div className="font-serif text-3xl text-gray-900 mb-6">
          siw<span className="text-orange-500">ggy</span>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-1">Welcome back</h2>
        <p className="text-xs text-gray-500 mb-6">Sign in to your siwggy account</p>

        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col">

          <div className="mb-4">
            <label className="block text-[11px] text-gray-500 mb-1.5 tracking-wide">EMAIL</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-3 text-sm text-gray-900 outline-none focus:border-orange-500 placeholder:text-gray-400 transition"
            />
          </div>

          <div className="mb-2">
            <label className="block text-[11px] text-gray-500 mb-1.5 tracking-wide">PASSWORD</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-3 text-sm text-gray-900 outline-none focus:border-orange-500 placeholder:text-gray-400 transition"
            />
          </div>

          <div className="flex justify-end mb-5">
            <Link to="/forgot-password" className="text-xs text-orange-500 hover:text-orange-600">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl transition mb-4"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="flex items-center gap-2.5 mb-4">
          <hr className="flex-1 border-gray-200" />
          <span className="text-[11px] text-gray-400">or</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        <p className="text-center text-xs text-gray-500">
          Don't have an account?{" "}
          <Link to="/register" className="text-orange-500 hover:text-orange-600">Register</Link>
        </p>

      </div>
    </div>
  );
}
