"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../stores/auth-store";
import { Check, Eye, EyeOff } from "lucide-react";
import { cn } from "../../lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [email, setEmail] = useState("javlon2677572@gmail.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    router.push("/");
  };

  const handleOAuthLogin = (provider: "google" | "telegram") => {
    login();
    router.push("/");
  };

  return (
    <div className="w-full max-w-[540px] py-4 select-none animate-fade-in">
      {/* Title */}
      <h1 className="text-base sm:text-lg font-bold text-slate-900 mb-6 tracking-tight">
        {isRegisterMode ? "Create an account" : "Sign in to account"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Email / Username Input */}
        <div>
          <input
            type="text"
            placeholder="Email or Username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full sm:w-[320px] h-[36px] bg-[#ebf2fa] border border-[#d6e3f2] rounded-md px-3 text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#456690] outline-none transition-all"
          />
        </div>

        {/* Password Input with Eye Visibility Toggle */}
        <div className="relative w-full sm:w-[320px]">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-[36px] bg-[#ebf2fa] border border-[#d6e3f2] rounded-md pl-3 pr-9 text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#456690] outline-none transition-all font-mono"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors p-0.5 focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Remember Me Checkbox */}
        <div className="pt-0.5">
          <label
            onClick={() => setRememberMe(!rememberMe)}
            className="inline-flex items-center gap-2 cursor-pointer group"
          >
            <div
              className={cn(
                "w-3.5 h-3.5 rounded-[3px] border flex items-center justify-center transition-colors",
                rememberMe
                  ? "bg-[#2563eb] border-[#2563eb] text-white"
                  : "border-slate-300 bg-white group-hover:border-slate-400"
              )}
            >
              {rememberMe && <Check className="w-2.5 h-2.5 stroke-[3]" />}
            </div>
            <span className="text-xs text-slate-600 group-hover:text-slate-900 select-none">
              Remember me
            </span>
          </label>
        </div>

        {/* Action Buttons Row (Sign in, Register, Forgot password) */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {/* Main Submit Button */}
          <button
            type="submit"
            className="h-[30px] px-5 rounded-full border border-slate-300 bg-white hover:border-[#456690] hover:text-[#456690] text-slate-800 text-xs font-semibold shadow-2xs transition-all cursor-pointer focus:outline-none"
          >
            Sign In
          </button>

          {/* Link to Register */}
          <Link
            href="/register"
            className="h-[30px] px-5 leading-[28px] rounded-full border border-slate-300 bg-white hover:border-[#456690] hover:text-[#456690] text-slate-800 text-xs font-semibold shadow-2xs transition-all text-center inline-block"
          >
            Register
          </Link>

          {/* Forgot Password Link */}
          <Link
            href="/forgot-password"
            className="h-[30px] px-5 leading-[28px] rounded-full border border-slate-300 bg-white hover:border-[#456690] hover:text-[#456690] text-slate-800 text-xs font-semibold shadow-2xs transition-all text-center inline-block"
          >
            Forgot password?
          </Link>
        </div>
      </form>

      {/* OAuth2 Social Login Buttons (Google, Telegram as requested) */}
      <div className="mt-6 pt-2">
        <div className="flex items-center gap-2.5">
          {/* Google Button */}
          <button
            type="button"
            onClick={() => handleOAuthLogin("google")}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-xs hover:shadow-md hover:scale-105 transition-all flex items-center justify-center group focus:outline-none"
            title="Continue with Google"
            aria-label="Continue with Google"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          </button>

          {/* Telegram Button */}
          <button
            type="button"
            onClick={() => handleOAuthLogin("telegram")}
            className="w-8 h-8 rounded-full bg-[#24A1DE] hover:bg-[#1f8ec4] shadow-xs hover:shadow-md hover:scale-105 transition-all flex items-center justify-center text-white focus:outline-none"
            title="Continue with Telegram"
            aria-label="Continue with Telegram"
          >
            <svg className="w-3.5 h-3.5 fill-current mr-0.5" viewBox="0 0 24 24">
              <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42 10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l-.313 4.67c.457 0 .659-.208.914-.457l2.194-2.133 4.564 3.371c.841.464 1.447.225 1.657-.781l2.997-14.125c.307-1.23-.468-1.787-1.529-1.312z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
