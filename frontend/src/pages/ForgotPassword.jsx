import { useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPassword() {
  const [email, setEmail]     = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();//stops the page from refreshing.
    setError("");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);//Creates reset token
      setSuccess(true);
    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":         setError("No account found with this email."); break;
        case "auth/invalid-email":          setError("Please enter a valid email address."); break;
        case "auth/operation-not-allowed":  setError("Email/password login is not enabled in Firebase Console."); break;
        case "auth/network-request-failed": setError("Network error. Check your internet connection."); break;
        default:                            setError(`Something went wrong: ${err.code || err.message}`);
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

        {/* Back link */}
        <Link to="/login" className="inline-block text-xs text-orange-500 hover:text-orange-600 mb-5">
          ← Back to login
        </Link>

        <h2 className="text-xl font-semibold text-gray-900 mb-1">Reset password</h2>
        <p className="text-xs text-gray-500 mb-6">
          Firebase will send a real reset link to your email
        </p>

        {/* Error */}
        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 mb-4">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3.5 py-2.5 mb-4">
            ✓ Reset link sent to <strong>{email}</strong>. Check your inbox!
            <br /><br />
            <Link to="/login" className="text-orange-500 hover:text-orange-600">
              Back to login →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="mb-4">
              <label className="block text-[11px] text-gray-500 mb-1.5 tracking-wide">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-3 text-sm text-gray-900 outline-none focus:border-orange-500 placeholder:text-gray-400 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl transition"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}