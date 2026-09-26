"use client";

import { Search, Loader2, Edit2, Shield, Key, Trash2 } from "lucide-react";

interface AppUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: "USER" | "MODERATOR" | "ADMIN";
}

interface UsersTabProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  loadingData: boolean;
  filteredUsers: AppUser[];
  isAdmin: boolean;
  currentUsername?: string;
  onEditUser: (usr: AppUser) => void;
  onEditRole: (usr: AppUser) => void;
  onResetPassword: (usr: AppUser) => void;
  onDeleteUser: (id: number, username: string) => void;
}

export function UsersTab({
  searchQuery,
  setSearchQuery,
  loadingData,
  filteredUsers,
  isAdmin,
  currentUsername,
  onEditUser,
  onEditRole,
  onResetPassword,
  onDeleteUser,
}: UsersTabProps) {
  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search current users list..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-[36px] pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
        />
      </div>

      {loadingData ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-200/80 rounded-2xl bg-white shadow-2xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="p-3.5">ID</th>
                <th className="p-3.5">Full Name</th>
                <th className="p-3.5">Username</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400 font-medium">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3.5 font-mono text-slate-400">{usr.id}</td>
                    <td className="p-3.5 font-semibold text-slate-850">
                      {usr.firstName} {usr.lastName}
                    </td>
                    <td className="p-3.5 text-slate-650">{usr.username}</td>
                    <td className="p-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide ${
                        usr.role === "ADMIN"
                          ? "bg-rose-50 text-rose-600 border border-rose-100"
                          : usr.role === "MODERATOR"
                          ? "bg-amber-50 text-amber-600 border border-amber-100"
                          : "bg-slate-100 text-slate-600 border border-slate-150"
                      }`}>
                        {usr.role}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => onEditUser(usr)}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                        title="Edit details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            onClick={() => onEditRole(usr)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-amber-600 hover:text-amber-700 transition-colors"
                            title="Change role"
                          >
                            <Shield className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onResetPassword(usr)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-blue-600 hover:text-blue-750 transition-colors"
                            title="Reset password"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteUser(usr.id, usr.username)}
                            disabled={usr.username === currentUsername}
                            className="p-1.5 rounded-md hover:bg-red-50 text-red-500 hover:text-red-650 transition-colors disabled:opacity-30"
                            title="Delete user"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
