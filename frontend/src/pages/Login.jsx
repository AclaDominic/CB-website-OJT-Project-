import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import bgHeader from "../assets/bg-header-about-us.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate("/system");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login({ email, password });
      // navigate('/system'); // Handled by AuthContext or useEffect
    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans">
      {/* Dynamic Background Elements from Header */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage: `url(${bgHeader})`,
          backgroundPosition: 'center 60%',
        }}
      >
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[4px]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-sky-100/40 via-emerald-100/20 to-teal-100/40"></div>
      </div>

      <div
        className="max-w-md w-full 
    bg-white/60        /* light white with transparency */
    p-10 
    rounded-2xl 
    shadow-[0_10px_20px_-10px_rgba(0,0,0,0.2)] /* lighter shadow */
    border border-white/20  /* softer border */
    relative z-10 mx-4"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2 font-sans tracking-tight drop-shadow-sm">
            System Login
          </h2>
          <div className="w-16 h-1.5 bg-green-500 mx-auto rounded-full"></div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-xl mb-6 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
            <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="font-bold">!</span>
            </div>
            <p className="font-medium text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-5">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 ml-1">Email</label>
            <input
              type="email"
              className="w-full px-5 py-3.5 bg-white/50 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-green-400 focus:border-green-400 focus:bg-white transition-all duration-300 outline-none placeholder:text-gray-400 text-gray-900"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-8">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2 ml-1">Password</label>
            <input
              type="password"
              className="w-full px-5 py-3.5 bg-white/50 border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-green-400 focus:border-green-400 focus:bg-white transition-all duration-300 outline-none placeholder:text-gray-400 text-gray-900"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
                Signing in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
