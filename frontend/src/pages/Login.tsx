import React, { useState } from "react";
import { useAuth } from "../Hooks/useAuth";
import { Clock, Key, LogIn, Mail } from "lucide-react";
import { Navigate } from "react-router-dom";
import Logo from "../components/Logo";

const Login = ({ currentPath }: { currentPath?: string }) => {
  const auth = useAuth();

  const [email, setEmail] = useState("Administrator");
  const [password, setPassword] = useState("admin");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(""); 
    try {
      await auth.login({ username: email, password: password });
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          "Invalid credentials. Please check your username and password."
      );
    }
  };

  if (auth.currentUser) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600" />
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-slate-200/50 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center mb-10">
          <Logo fullLogo={true} />
        </div>

        <div className="bg-white border border-slate-200 rounded-[48px] p-10 shadow-2xl shadow-indigo-100/50">
          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm font-medium flex items-center gap-2">
              <Clock size={16} className="animate-pulse" />
              {errorMessage}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  size={18}
                />
                <input
                  type={email.includes("@") ? "email" : "text"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                Security Key
              </label>
              <div className="relative">
                <Key
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"
                  size={18}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-indigo-600 transition-all outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={auth.isLoading}
              className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
            >
              {auth.isLoading ? (
                <Clock className="animate-spin" size={18} />
              ) : (
                <LogIn size={18} />
              )}
              {auth.isLoading ? "Authenticating..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
