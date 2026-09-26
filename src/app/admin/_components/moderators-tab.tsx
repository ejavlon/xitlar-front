"use client";

import { Search, Loader2, UserPlus, Edit2, Key, Trash2 } from "lucide-react";

interface Moderator {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: "MODERATOR";
}

interface ModeratorsTabProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  loadingData: boolean;
  filteredModerators: Moderator[];
  onCreateMod: () => void;
  onEditMod: (mod: Moderator) => void;
  onPasswordReset: (mod: Moderator) => void;
  onDeleteMod: (id: number, username: string) => void;
}

export function ModeratorsTab({
  searchQuery,
  setSearchQuery,
  loadingData,
  filteredModerators,
  onCreateMod,
  onEditMod,
  onPasswordReset,
  onDeleteMod,
}: ModeratorsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search moderators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[36px] pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
          />
        </div>

        <button
          onClick={onCreateMod}
          className="h-[34px] px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          Create Moderator
        </button>
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
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredModerators.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-400 font-medium">
                    No moderators found.
                  </td>
                </tr>
              ) : (
                filteredModerators.map((mod) => (
                  <tr key={mod.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3.5 font-mono text-slate-400">{mod.id}</td>
                    <td className="p-3.5 font-semibold text-slate-850">
                      {mod.firstName} {mod.lastName}
                    </td>
                    <td className="p-3.5 text-slate-650">{mod.username}</td>
                    <td className="p-3.5 text-right space-x-1.5">
                      <button
                        onClick={() => onEditMod(mod)}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                        title="Edit details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onPasswordReset(mod)}
                        className="p-1.5 rounded-md hover:bg-slate-100 text-blue-600 hover:text-blue-75 transition-colors"
                        title="Reset password"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteMod(mod.id, mod.username)}
                        className="p-1.5 rounded-md hover:bg-red-50 text-red-500 hover:text-red-650 transition-colors"
                        title="Delete moderator"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
