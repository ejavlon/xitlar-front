"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User as UserType } from "../../types/user";
import { userService } from "../../services/user.service";
import { useAuthStore } from "../../stores/auth-store";
import { api, ApiError } from "../../lib/api/client";
import { ArrowLeft, Check, Lock, Trash2, X, Shield, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { logout, isAuthenticated, isInitialized } = useAuthStore();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  // Settings Checkboxes
  const [sendImportantNews, setSendImportantNews] = useState(true);
  const [sendSiteNotifications, setSendSiteNotifications] = useState(true);
  const [newSearchDesign, setNewSearchDesign] = useState(true);

  // Modals for Actions
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const user = await userService.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [isInitialized, isAuthenticated, router]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match!");
      return;
    }

    setChangingPassword(true);
    try {
      await api.put("/api/v1/users/me/password", {
        currentPassword,
        newPassword,
        confirmPassword
      });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPasswordSuccess(false);
        setPasswordModalOpen(false);
      }, 1500);
    } catch (err: any) {
      console.error("Password change failed:", err);
      setPasswordError(err.message || "Failed to change password. Make sure current password is correct.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRealLogout = () => {
    logout();
    router.push("/login");
  };

  const handleDeleteAccount = () => {
    alert("Account deletion is not supported by the backend.");
    setDeleteModalOpen(false);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-2">
        <div className="flex gap-6 items-center">
          <div className="w-24 h-24 rounded-full bg-slate-200" />
          <div className="space-y-2">
            <div className="h-5 w-32 bg-slate-200 rounded" />
            <div className="h-3 w-48 bg-slate-200 rounded" />
          </div>
        </div>
        <div className="h-32 bg-slate-100 rounded-lg" />
      </div>
    );
  }

  const userName = currentUser ? (currentUser.name || `${currentUser.firstName || ""} ${currentUser.lastName || ""}`.trim() || currentUser.username) : "Guest";
  const userEmail = currentUser?.username || "";

  return (
    <div className="space-y-6 select-none animate-fade-in font-sans">
      {/* 1. TOP PROFILE HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-7 pt-2">
        {/* Grey User Silhouette Avatar */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#cbd5e1] flex items-end justify-center overflow-hidden shrink-0 shadow-inner">
          <svg
            className="w-20 h-20 sm:w-24 sm:h-24 text-white fill-current translate-y-1"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>

        {/* User Details & 2-Column Menu Links */}
        <div className="space-y-2.5 min-w-0">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
              {userName}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">{userEmail}</p>
          </div>

          {/* Sub Navigation Links Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-slate-600 pt-1">
            {/* Column 1 */}
            <div className="space-y-1">
              <Link
                href="#messages"
                className="flex items-center gap-1.5 hover:text-[#365377] transition-colors"
              >
                <span>Messages</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              </Link>
              <div>
                <Link href="#news" className="hover:text-[#365377] transition-colors">
                  News
                </Link>
              </div>
              <div>
                <Link href="#orders" className="hover:text-[#365377] transition-colors">
                  Requests
                </Link>
              </div>
              <div>
                <Link href="#updates" className="hover:text-[#365377] transition-colors">
                  Updates
                </Link>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-1">
              <div>
                <Link href="#help" className="hover:text-[#365377] transition-colors">
                  Help
                </Link>
              </div>
              <div>
                <Link href="/settings" className="font-semibold text-[#365377] transition-colors">
                  Settings
                </Link>
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleRealLogout}
                  className="hover:text-red-500 transition-colors text-left cursor-pointer focus:outline-none"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Thin Horizontal Divider */}
      <div className="border-t border-slate-200/80 pt-4" />

      {/* 2. SETTINGS TITLE & BACK ARROW */}
      <div className="flex items-center gap-2 text-slate-800">
        <Link
          href="/"
          className="p-1 -ml-1 text-slate-600 hover:text-[#365377] transition-colors rounded"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h2 className="text-sm sm:text-base font-bold tracking-tight text-slate-900">
          My Settings
        </h2>
      </div>

      {/* 3. SETTINGS 2-COLUMN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 pt-2">
        {/* Column 1: General */}
        <div className="space-y-3">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
            General
          </h3>

          <div className="space-y-2.5 text-xs text-slate-700">
            {/* Checkbox 1 */}
            <label className="flex items-start gap-2.5 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={sendImportantNews}
                onChange={(e) => setSendImportantNews(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded-[3px] border border-[#70a4db] text-[#365377] focus:ring-0 focus:outline-none accent-[#365377] cursor-pointer"
              />
              <span className="group-hover:text-slate-900 transition-colors leading-tight">
                Send important news via email
              </span>
            </label>

            {/* Checkbox 2 */}
            <label className="flex items-start gap-2.5 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={sendSiteNotifications}
                onChange={(e) => setSendSiteNotifications(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded-[3px] border border-[#70a4db] text-[#365377] focus:ring-0 focus:outline-none accent-[#365377] cursor-pointer"
              />
              <span className="group-hover:text-slate-900 transition-colors leading-tight">
                Send site notifications via email
              </span>
            </label>

            {/* Checkbox 3 */}
            <label className="flex items-start gap-2.5 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={newSearchDesign}
                onChange={(e) => setNewSearchDesign(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded-[3px] border border-[#70a4db] text-[#365377] focus:ring-0 focus:outline-none accent-[#365377] cursor-pointer"
              />
              <span className="group-hover:text-slate-900 transition-colors leading-tight">
                New search suggestion design
              </span>
            </label>
          </div>
        </div>

        {/* Column 2: Account */}
        <div className="space-y-3">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
            Account
          </h3>

          <div className="space-y-2 text-xs text-slate-700">
            <div>
              <button
                type="button"
                onClick={() => setPasswordModalOpen(true)}
                className="hover:text-[#365377] hover:underline transition-colors text-left focus:outline-none cursor-pointer"
              >
                Change password
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="hover:text-red-600 hover:underline transition-colors text-left focus:outline-none cursor-pointer"
              >
                Delete account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Management Section (For ADMIN or MODERATOR) */}
      {(currentUser?.role === "ADMIN" || currentUser?.role === "MODERATOR") && (
        <div className="border-t border-slate-200/80 pt-6 space-y-3 animate-fade-in">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-indigo-650" />
            Management
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {currentUser?.role === "ADMIN" && (
              <Link
                href="/admin?tab=users"
                className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 hover:text-slate-950 font-semibold transition-colors"
              >
                <span>Administration</span>
              </Link>
            )}
            <Link
              href="/admin?tab=artists"
              className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 hover:text-slate-950 font-semibold transition-colors"
            >
              <span>Artists</span>
            </Link>
            <Link
              href="/admin?tab=tracks"
              className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 hover:text-slate-950 font-semibold transition-colors"
            >
              <span>Music</span>
            </Link>
            <Link
              href="/admin?tab=playlists"
              className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 hover:text-slate-950 font-semibold transition-colors"
            >
              <span>Playlists</span>
            </Link>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-fade-in p-4">
          <div className="w-full max-w-sm bg-white rounded-lg shadow-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-800">
                <Lock className="w-4 h-4 text-[#365377]" />
                <h4 className="text-sm font-bold">Change Password</h4>
              </div>
              <button
                type="button"
                onClick={() => { setPasswordModalOpen(false); setPasswordError(""); }}
                className="text-slate-400 hover:text-slate-700 p-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordError && (
              <div className="flex items-start gap-1.5 p-2 bg-red-50 text-red-650 rounded border border-red-100 text-[11px] font-medium leading-tight">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-500" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  Password updated successfully!
                </p>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Current password
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 outline-none focus:border-[#365377]"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    New password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 outline-none focus:border-[#365377]"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 outline-none focus:border-[#365377]"
                    placeholder="••••••••"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setPasswordModalOpen(false); setPasswordError(""); }}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="px-4 py-1.5 bg-[#365377] hover:bg-[#2d4665] text-white rounded font-medium transition-colors disabled:opacity-50"
                  >
                    {changingPassword ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DELETE ACCOUNT CONFIRMATION MODAL */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-fade-in p-4">
          <div className="w-full max-w-sm bg-white rounded-lg shadow-2xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center gap-2 text-red-600 border-b border-slate-100 pb-3">
              <Trash2 className="w-5 h-5" />
              <h4 className="text-sm font-bold">Delete Account?</h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete your account? All your saved playlists, history, and settings will be permanently removed.
            </p>

            <div className="pt-2 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}