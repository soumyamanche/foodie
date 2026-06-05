import { useState, startTransition } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

export default function Register() {
  const [form, setForm]       = useState({ username: "", email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(user, { displayName: form.username });
      startTransition(() => navigate("/dashboard"));
    } catch (err) {
      switch (err.code) {
        case "auth/email-already-in-use": setError("An account with this email already exists."); break;
        case "auth/weak-password":        setError("Password must be at least 6 characters."); break;
        case "auth/invalid-email":        setError("Please enter a valid email address."); break;
        default:                          setError(`Registration failed: ${err.code || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-sans">
      <div className="bg-white border border-gray-200 rounded-2xl px-9 py-10 w-full max-w-sm shadow-lg">
        <div className="font-serif text-3xl text-gray-900 mb-6">
          siw<span className="text-orange-500">ggy</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-1">Create account</h2>
        <p className="text-xs text-gray-500 mb-6">Join siwggy today</p>
        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="mb-4">
            <label className="block text-[11px] text-gray-500 mb-1.5 tracking-wide">USERNAME</label>
            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-3 text-sm text-gray-900 outline-none focus:border-orange-500 placeholder:text-gray-400 transition"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[11px] text-gray-500 mb-1.5 tracking-wide">EMAIL</label>
            <input
              type="email"
              name="email"
              placeholder="Your email address"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-3 text-sm text-gray-900 outline-none focus:border-orange-500 placeholder:text-gray-400 transition"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[11px] text-gray-500 mb-1.5 tracking-wide">PASSWORD</label>
            <input
              type="password"
              name="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-3 text-sm text-gray-900 outline-none focus:border-orange-500 placeholder:text-gray-400 transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl transition mt-2 mb-4"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <div className="flex items-center gap-2.5 mb-4">
          <hr className="flex-1 border-gray-200" />
          <span className="text-[11px] text-gray-400">or</span>
          <hr className="flex-1 border-gray-200" />
        </div>
        <p className="text-center text-xs text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-500 hover:text-orange-600">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
