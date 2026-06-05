import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged( //component mounts(Component appears for the first time)
      auth,
      (firebaseUser) => {
        setUser(firebaseUser);//updates the user state
        setAuthError("");
        setLoading(false);
      },
      //runs if the firebase fails
      (error) => {
        console.error("Firebase auth state error:", error);
        setAuthError(error?.message || "Unable to load authentication state.");
        setLoading(false);
      }
    );
    return unsubscribe; //component unmounts( Component is removed)
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, logout, loading, authError }}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}