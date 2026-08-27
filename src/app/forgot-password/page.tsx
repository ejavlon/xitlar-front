"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
  };

  return (
    <div className="w-full max-w-[540px] py-4 select-none animate-fade-in">
      {/* Title */}
      <h1 className="text-base sm:text-lg font-bold text-slate-900 mb-6 tracking-tight">
        Forgot Password
      </h1>

      {isSubmitted ? (
        <div className="space-y-4 max-w-[340px]">
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs leading-relaxed">
            Password reset link has been sent to <strong>{email}</strong>. Please check your inbox.
          </div>

          <Link
            href="/login"
            className="inline-block h-[32px] px-6 leading-[30px] rounded-full border border-slate-300 bg-white hover:border-[#456690] hover:text-[#456690] text-slate-800 text-xs font-semibold shadow-2xs transition-all text-center"
          >
            Back to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full sm:w-[320px] h-[36px] bg-[#ebf2fa] border border-[#d6e3f2] rounded-md px-3 text-xs sm:text-[13px] text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-[#456690] outline-none transition-all"
            />
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="h-[32px] px-6 rounded-full border border-slate-300 bg-white hover:border-[#456690] hover:text-[#456690] text-slate-800 text-xs font-semibold shadow-2xs transition-all cursor-pointer focus:outline-none"
            >
              Get new password
            </button>

            <Link
              href="/login"
              className="text-xs text-slate-500 hover:text-[#456690] hover:underline transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
