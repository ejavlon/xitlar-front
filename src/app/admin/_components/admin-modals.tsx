"use client";

import {
  Eye, EyeOff, Shield, Loader2, Trash2, Music, ArrowUp, ArrowDown, Search,
  ListMusic, FileText, MessageSquare, CheckCircle
} from "lucide-react";
import { cn } from "../../../lib/utils";
import {
  BackendArtistResponse as ArtistResponse,
  BackendMusicResponse as MusicResponse,
  BackendPlaylistResponse as PlaylistResponse,
} from "../../../types/backend";

// ──────────── Local types ────────────
interface AppUser { id: number; firstName: string; lastName: string; username: string; role: "USER" | "MODERATOR" | "ADMIN"; }
interface Moderator { id: number; firstName: string; lastName: string; username: string; role: "MODERATOR"; }
interface BackendCommentResponse { id: number; text: string; createdAt: string; musicId: number; userId: number; userName: string; }

const AVAILABLE_GENRES = [
  { value: "POP", label: "Pop" }, { value: "ROCK", label: "Rock" },
  { value: "HIP_HOP", label: "Hip-Hop" }, { value: "RAP", label: "Rap" },
  { value: "JAZZ", label: "Jazz" }, { value: "CLASSICAL", label: "Classical" },
  { value: "ELECTRONIC", label: "Electronic" }, { value: "R_AND_B", label: "R&B" },
  { value: "K_POP", label: "K-Pop" }, { value: "OTHER", label: "Other" },
];

// ──────────── Modal Wrapper ────────────
function ModalBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      {children}
    </div>
  );
}

// ──────────── 1. Edit User Modal ────────────
export function EditUserModal({
  show, selectedUser, editFirstName, editLastName, editUsername,
  setEditFirstName, setEditLastName, setEditUsername,
  onClose, onSubmit,
}: {
  show: boolean; selectedUser: AppUser | null;
  editFirstName: string; editLastName: string; editUsername: string;
  setEditFirstName: (v: string) => void; setEditLastName: (v: string) => void; setEditUsername: (v: string) => void;
  onClose: () => void; onSubmit: (e: React.FormEvent) => void;
}) {
  if (!show) return null;
  return (
    <ModalBackdrop>
      <form onSubmit={onSubmit} className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl space-y-4 animate-scale-in">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-900 font-sans">Edit User Details</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-sm focus:outline-none">✕</button>
        </div>
        <div className="space-y-3">
          {[
            { label: "First Name", value: editFirstName, onChange: setEditFirstName },
            { label: "Last Name", value: editLastName, onChange: setEditLastName },
            { label: "Username / Phone", value: editUsername, onChange: setEditUsername },
          ].map(({ label, value, onChange }) => (
            <div key={label}>
              <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">{label}</label>
              <input type="text" required value={value} onChange={(e) => onChange(e.target.value)}
                className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800" />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="h-[32px] px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-750 text-xs font-semibold cursor-pointer">Cancel</button>
          <button type="submit" className="h-[32px] px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer">Save Changes</button>
        </div>
      </form>
    </ModalBackdrop>
  );
}

// ──────────── 2. Change Role Modal ────────────
export function RoleModal({
  show, selectedUser, editRole, setEditRole, onClose, onSubmit,
}: {
  show: boolean; selectedUser: AppUser | null; editRole: "USER" | "MODERATOR" | "ADMIN";
  setEditRole: (v: "USER" | "MODERATOR" | "ADMIN") => void; onClose: () => void; onSubmit: () => void;
}) {
  if (!show) return null;
  return (
    <ModalBackdrop>
      <div className="w-full max-w-[360px] bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-900 font-sans font-extrabold">Update User Role</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-sm focus:outline-none">✕</button>
        </div>
        <div className="space-y-2">
          <p className="text-xs text-slate-500 leading-relaxed">
            Choose security permissions role for <span className="font-semibold text-slate-850">@{selectedUser?.username}</span>:
          </p>
          <div className="grid grid-cols-1 gap-2 pt-2">
            {(["USER", "MODERATOR", "ADMIN"] as const).map((rl) => (
              <label key={rl} onClick={() => setEditRole(rl)}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold cursor-pointer select-none transition-all ${
                  editRole === rl ? "bg-indigo-50 border-indigo-400 text-indigo-650 shadow-2xs" : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                }`}>
                <span>{rl} permissions</span>
                <input type="radio" name="role-selection" checked={editRole === rl} onChange={() => {}} className="accent-indigo-600" />
              </label>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="h-[32px] px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-750 text-xs font-semibold cursor-pointer">Cancel</button>
          <button type="button" onClick={onSubmit} className="h-[32px] px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer">Update Role</button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

// ──────────── 3. Reset Password Modal ────────────
export function PasswordModal({
  show, selectedUser, newPassword, confirmPassword, showPasswordText,
  setNewPassword, setConfirmPassword, setShowPasswordText,
  onClose, onSubmit,
}: {
  show: boolean; selectedUser: AppUser | null; newPassword: string; confirmPassword: string; showPasswordText: boolean;
  setNewPassword: (v: string) => void; setConfirmPassword: (v: string) => void; setShowPasswordText: (v: boolean) => void;
  onClose: () => void; onSubmit: (e: React.FormEvent) => void;
}) {
  if (!show) return null;
  return (
    <ModalBackdrop>
      <form onSubmit={onSubmit} className="w-full max-w-[380px] bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-900 font-sans">Force Reset Password</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-sm focus:outline-none">✕</button>
        </div>
        <p className="text-xs text-slate-500">Resetting password for user: <span className="font-semibold text-slate-800">@{selectedUser?.username}</span>.</p>
        <div className="space-y-3">
          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">New Password</label>
            <div className="relative">
              <input type={showPasswordText ? "text" : "password"} required minLength={4} value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-[36px] pl-3 pr-9 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800 font-mono" />
              <button type="button" onClick={() => setShowPasswordText(!showPasswordText)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1">
                {showPasswordText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Confirm New Password</label>
            <input type={showPasswordText ? "text" : "password"} required value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800 font-mono" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="h-[32px] px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-750 text-xs font-semibold cursor-pointer">Cancel</button>
          <button type="submit" className="h-[32px] px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer">Reset Password</button>
        </div>
      </form>
    </ModalBackdrop>
  );
}

// ──────────── 4. Create/Edit Moderator Modal ────────────
export function ModeratorModal({
  show, isEdit, modFirstName, modLastName, modUsername, modPassword, modConfirmPassword,
  setModFirstName, setModLastName, setModUsername, setModPassword, setModConfirmPassword,
  onClose, onSubmit,
}: {
  show: boolean; isEdit: boolean; modFirstName: string; modLastName: string; modUsername: string; modPassword: string; modConfirmPassword: string;
  setModFirstName: (v: string) => void; setModLastName: (v: string) => void; setModUsername: (v: string) => void;
  setModPassword: (v: string) => void; setModConfirmPassword: (v: string) => void;
  onClose: () => void; onSubmit: (e: React.FormEvent) => void;
}) {
  if (!show) return null;
  return (
    <ModalBackdrop>
      <form onSubmit={onSubmit} className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-900 font-sans">{isEdit ? "Edit Moderator Details" : "Create New Moderator"}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-sm focus:outline-none">✕</button>
        </div>
        <div className="space-y-3">
          {[
            { label: "First Name", value: modFirstName, onChange: setModFirstName },
            { label: "Last Name", value: modLastName, onChange: setModLastName },
            { label: "Username / Phone", value: modUsername, onChange: setModUsername },
          ].map(({ label, value, onChange }) => (
            <div key={label}>
              <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">{label}</label>
              <input type="text" required value={value} onChange={(e) => onChange(e.target.value)}
                className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800" />
            </div>
          ))}
          {!isEdit && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Password</label>
                <input type="password" required minLength={4} value={modPassword} onChange={(e) => setModPassword(e.target.value)}
                  className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800 font-mono" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Confirm Password</label>
                <input type="password" required value={modConfirmPassword} onChange={(e) => setModConfirmPassword(e.target.value)}
                  className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800 font-mono" />
              </div>
            </>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="h-[32px] px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-750 text-xs font-semibold cursor-pointer">Cancel</button>
          <button type="submit" className="h-[32px] px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer">{isEdit ? "Save Changes" : "Create"}</button>
        </div>
      </form>
    </ModalBackdrop>
  );
}

// ──────────── 5. Create/Edit Artist Modal ────────────
export function ArtistModal({
  show, isEdit, artistName, artistGenre, setArtistName, setArtistGenre, setArtistFile, onClose, onSubmit,
}: {
  show: boolean; isEdit: boolean; artistName: string; artistGenre: string;
  setArtistName: (v: string) => void; setArtistGenre: (v: string) => void; setArtistFile: (f: File | null) => void;
  onClose: () => void; onSubmit: (e: React.FormEvent) => void;
}) {
  if (!show) return null;
  return (
    <ModalBackdrop>
      <form onSubmit={onSubmit} className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-900 font-sans">{isEdit ? "Edit Artist Details" : "Add New Artist"}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-sm focus:outline-none">✕</button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Artist Name</label>
            <input type="text" required value={artistName} onChange={(e) => setArtistName(e.target.value)} placeholder="e.g. John Doe"
              className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Primary Genre</label>
            <select value={artistGenre} onChange={(e) => setArtistGenre(e.target.value)}
              className="w-full h-[36px] px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800 font-semibold cursor-pointer">
              {AVAILABLE_GENRES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Artist Avatar Image {isEdit && "(Optional)"}</label>
            <input type="file" accept="image/*" onChange={(e) => setArtistFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-indigo-50 file:text-indigo-650 hover:file:bg-indigo-100 cursor-pointer" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="h-[32px] px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-750 text-xs font-semibold cursor-pointer">Cancel</button>
          <button type="submit" className="h-[32px] px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer">{isEdit ? "Save Changes" : "Create"}</button>
        </div>
      </form>
    </ModalBackdrop>
  );
}

// ──────────── 6. Create/Edit Track Modal ────────────
export function TrackModal({
  show, isEdit, trackTitle, trackArtistId, trackGenre, trackNumberInput, trackLyricsText,
  allArtistsList, setTrackTitle, setTrackArtistId, setTrackGenre, setTrackNumberInput, setTrackLyricsText, setTrackFile,
  onClose, onSubmit,
}: {
  show: boolean; isEdit: boolean; trackTitle: string; trackArtistId: string; trackGenre: string; trackNumberInput: string; trackLyricsText: string;
  allArtistsList: ArtistResponse[];
  setTrackTitle: (v: string) => void; setTrackArtistId: (v: string) => void; setTrackGenre: (v: string) => void;
  setTrackNumberInput: (v: string) => void; setTrackLyricsText: (v: string) => void; setTrackFile: (f: File | null) => void;
  onClose: () => void; onSubmit: (e: React.FormEvent) => void;
}) {
  if (!show) return null;
  return (
    <ModalBackdrop>
      <form onSubmit={onSubmit} className="w-full max-w-[460px] bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-900 font-sans">{isEdit ? "Edit Track Details" : "Upload Single Track"}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-sm focus:outline-none">✕</button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Track Title</label>
            <input type="text" required value={trackTitle} onChange={(e) => setTrackTitle(e.target.value)} placeholder="e.g. Moonlight Sonata"
              className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Artist (Optional)</label>
            <select value={trackArtistId} onChange={(e) => setTrackArtistId(e.target.value)}
              className="w-full h-[36px] px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800 font-semibold cursor-pointer">
              <option value="">No Artist (Single Track)</option>
              {allArtistsList.map((art) => <option key={art.id} value={art.id}>{art.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Genre</label>
              <select value={trackGenre} onChange={(e) => setTrackGenre(e.target.value)}
                className="w-full h-[36px] px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800 font-semibold cursor-pointer">
                {AVAILABLE_GENRES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Track position / Number</label>
              <input type="number" value={trackNumberInput} onChange={(e) => setTrackNumberInput(e.target.value)} placeholder="e.g. 1"
                className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800" />
            </div>
          </div>
          {!isEdit && (
            <div>
              <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Song Lyrics (Optional)</label>
              <textarea value={trackLyricsText} onChange={(e) => setTrackLyricsText(e.target.value)} rows={3} placeholder="Type song lyrics here..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800" />
            </div>
          )}
          <div>
            <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Audio file (.mp3) {!isEdit ? "(Required)" : "(Optional)"}</label>
            <input type="file" accept="audio/mp3, audio/mpeg" required={!isEdit} onChange={(e) => setTrackFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-indigo-50 file:text-indigo-650 hover:file:bg-indigo-100 cursor-pointer" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className="h-[32px] px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-750 text-xs font-semibold cursor-pointer">Cancel</button>
          <button type="submit" className="h-[32px] px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer">{isEdit ? "Save Changes" : "Upload Track"}</button>
        </div>
      </form>
    </ModalBackdrop>
  );
}

// ──────────── 7. Track Details Modal ────────────
export function TrackDetailsModal({
  show, track, onClose,
}: { show: boolean; track: MusicResponse | null; onClose: () => void }) {
  if (!show || !track) return null;
  return (
    <ModalBackdrop>
      <div className="w-full max-w-[500px] bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scale-in font-sans text-slate-805">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Track Details</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">ID: {track.id}</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-sm focus:outline-none">✕</button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            {[
              { label: "Title", value: track.title },
              { label: "Artist", value: track.artist?.name || "—" },
              { label: "Genre", value: track.genre || "—" },
              { label: "Track Number", value: track.trackNumber ?? "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">{label}</span>
                <span className="font-semibold text-slate-800">{value}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Technical Properties</h4>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
              <div><span className="text-slate-450">Format:</span> <span className="font-semibold text-slate-700">{track.audioFormat || "—"}</span></div>
              <div><span className="text-slate-450">Bitrate:</span> <span className="font-semibold text-slate-700">{track.bitrate ? `${track.bitrate} kbps` : "—"}</span></div>
              <div><span className="text-slate-450">Sample Rate:</span> <span className="font-semibold text-slate-700">{track.sampleRate ? `${track.sampleRate} Hz` : "—"}</span></div>
              <div><span className="text-slate-450">File Size:</span> <span className="font-semibold text-slate-700">{track.audioSize ? `${(track.audioSize / (1024 * 1024)).toFixed(2)} MB` : "—"}</span></div>
              <div className="col-span-2"><span className="text-slate-400">Original File Name:</span> <span className="font-semibold text-slate-700 truncate block max-w-full" title={track.originalFileName}>{track.originalFileName || "—"}</span></div>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-3 text-xs">
            <span className="text-slate-450">Date Added:</span> <span className="font-semibold text-slate-700">{track.addedDate ? new Date(track.addedDate).toLocaleString() : "—"}</span>
          </div>
          <div className="border-t border-slate-100 pt-3">
            <span className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Lyrics</span>
            <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl max-h-[120px] overflow-y-auto text-xs text-slate-650 leading-relaxed font-mono whitespace-pre-wrap">
              {track.lyrics?.text || "No lyrics available for this track."}
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className="h-[32px] px-5 bg-slate-100 hover:bg-slate-200 text-slate-750 text-xs font-semibold rounded-lg transition-colors cursor-pointer">Close Details</button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

// ──────────── 8. Create/Edit Playlist Modal ────────────
export function PlaylistModal({
  show, isEdit, playlistTitle, playlistDescription, setPlaylistTitle, setPlaylistDescription, setPlaylistFile, onClose, onSubmit,
}: {
  show: boolean; isEdit: boolean; playlistTitle: string; playlistDescription: string;
  setPlaylistTitle: (v: string) => void; setPlaylistDescription: (v: string) => void; setPlaylistFile: (f: File | null) => void;
  onClose: () => void; onSubmit: (e: React.FormEvent) => void;
}) {
  if (!show) return null;
  return (
    <ModalBackdrop>
      <form onSubmit={onSubmit} className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-bold text-slate-900 font-sans">{isEdit ? "Edit Playlist Details" : "Create New Playlist"}</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-sm focus:outline-none">✕</button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Playlist Title</label>
            <input type="text" required value={playlistTitle} onChange={(e) => setPlaylistTitle(e.target.value)} placeholder="e.g. Relaxing Chill Beats"
              className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Description</label>
            <textarea value={playlistDescription} onChange={(e) => setPlaylistDescription(e.target.value)} rows={3} placeholder="Describe this playlist selection..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800" />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Playlist Cover Image {isEdit && "(Optional)"}</label>
            <input type="file" accept="image/*" onChange={(e) => setPlaylistFile(e.target.files?.[0] || null)}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-indigo-50 file:text-indigo-650 hover:file:bg-indigo-100 cursor-pointer" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="h-[32px] px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-750 text-xs font-semibold cursor-pointer">Cancel</button>
          <button type="submit" className="h-[32px] px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer">{isEdit ? "Save Changes" : "Create Playlist"}</button>
        </div>
      </form>
    </ModalBackdrop>
  );
}

// ──────────── 9. Playlist Music Management Modal ────────────
export function PlaylistDetailModal({
  show, selectedPlaylist, loadingPlaylistDetails, filteredAvailableTracks, allArtistsList,
  searchTrackQuery, setSearchTrackQuery, selectedGenreFilter, setSelectedGenreFilter,
  selectedArtistFilter, setSelectedArtistFilter, checkedTrackIds, setCheckedTrackIds,
  isBulkAdding, draggedIndex, setDraggedIndex,
  onClose, onAddMusic, onBulkAddMusic, onRemoveMusic, onReorderMusic, onDragStart, onDragOver, onDrop,
}: {
  show: boolean; selectedPlaylist: PlaylistResponse | null; loadingPlaylistDetails: boolean;
  filteredAvailableTracks: MusicResponse[]; allArtistsList: ArtistResponse[];
  searchTrackQuery: string; setSearchTrackQuery: (v: string) => void;
  selectedGenreFilter: string; setSelectedGenreFilter: (v: string) => void;
  selectedArtistFilter: string; setSelectedArtistFilter: (v: string) => void;
  checkedTrackIds: number[]; setCheckedTrackIds: (fn: (prev: number[]) => number[]) => void;
  isBulkAdding: boolean; draggedIndex: number | null; setDraggedIndex: (v: number | null) => void;
  onClose: () => void; onAddMusic: (id: number) => void; onBulkAddMusic: (ids: number[]) => void;
  onRemoveMusic: (id: number) => void; onReorderMusic: (index: number, dir: "up" | "down") => void;
  onDragStart: (index: number) => void; onDragOver: (e: React.DragEvent, index: number) => void; onDrop: (index: number) => void;
}) {
  if (!show || !selectedPlaylist) return null;
  return (
    <ModalBackdrop>
      <div className="w-full max-w-[950px] bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col font-sans">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <ListMusic className="w-4.5 h-4.5 text-indigo-600" />
              Playlist Tracks Manager: {selectedPlaylist.title}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Manage tracks, order positions, and search / bulk-add new tracks.</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-sm focus:outline-none">✕</button>
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-5 min-h-0">
          {/* Left: Current playlist tracks */}
          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            <div className="flex justify-between items-center shrink-0">
              <h4 className="text-xs font-bold text-slate-700 uppercase">Tracks in Playlist ({selectedPlaylist.musics?.length || 0})</h4>
            </div>
            <div className="flex-1 overflow-y-auto border border-slate-150 rounded-xl divide-y divide-slate-100 bg-white min-h-[250px] flex flex-col">
              {loadingPlaylistDetails ? (
                <div className="flex-1 flex items-center justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
              ) : !selectedPlaylist.musics || selectedPlaylist.musics.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-10 text-xs font-medium">
                  <Music className="w-8 h-8 text-slate-300 mb-2" />Playlist is currently empty.
                </div>
              ) : (
                selectedPlaylist.musics.map((pm, index) => {
                  const isDragged = draggedIndex === index;
                  return (
                    <div key={pm.id} draggable onDragStart={() => onDragStart(index)} onDragOver={(e) => onDragOver(e, index)}
                      onDrop={() => onDrop(index)} onDragEnd={() => setDraggedIndex(null)}
                      className={cn("p-3 flex items-center justify-between text-xs hover:bg-slate-50/80 transition-all cursor-grab active:cursor-grabbing select-none border-y border-transparent",
                        isDragged && "opacity-40 bg-slate-100 border-dashed border-indigo-300",
                        draggedIndex !== null && draggedIndex !== index && "hover:border-indigo-200 hover:bg-indigo-50/20"
                      )}>
                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                        <span className="font-mono text-slate-400 font-bold w-4">{index + 1}</span>
                        <div className="truncate">
                          <div className="font-semibold text-slate-800 truncate">{pm.title}</div>
                          <div className="text-[10px] text-slate-400 truncate">{pm.artist?.name || "—"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => onReorderMusic(index, "up")} disabled={index === 0}
                          className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer" title="Move Up">
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => onReorderMusic(index, "down")} disabled={index === selectedPlaylist.musics!.length - 1}
                          className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer" title="Move Down">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => onRemoveMusic(pm.id)}
                          className="p-1 rounded hover:bg-red-50 text-red-500 ml-2 cursor-pointer" title="Remove Track">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: Available tracks registry */}
          <div className="flex-1 flex flex-col min-h-0 space-y-3 border-t md:border-t-0 md:border-l border-slate-150 pt-4 md:pt-0 md:pl-5">
            <div className="shrink-0 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase">Available Tracks Registry</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-150">
                <div className="col-span-1 sm:col-span-2 relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input type="text" placeholder="Search tracks, artists, genres..." value={searchTrackQuery}
                    onChange={(e) => setSearchTrackQuery(e.target.value)}
                    className="w-full h-[32px] pl-8 pr-3 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 transition-all text-slate-800" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Genre</label>
                  <select value={selectedGenreFilter} onChange={(e) => setSelectedGenreFilter(e.target.value)}
                    className="w-full h-[28px] px-1 bg-white border border-slate-200 rounded-md text-[11px] outline-none font-semibold cursor-pointer">
                    <option value="">All Genres</option>
                    {AVAILABLE_GENRES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Artist</label>
                  <select value={selectedArtistFilter} onChange={(e) => setSelectedArtistFilter(e.target.value)}
                    className="w-full h-[28px] px-1 bg-white border border-slate-200 rounded-md text-[11px] outline-none font-semibold cursor-pointer">
                    <option value="">All Artists</option>
                    {allArtistsList.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold px-1 text-slate-600 h-[28px]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox"
                    checked={filteredAvailableTracks.length > 0 && checkedTrackIds.length === filteredAvailableTracks.length}
                    onChange={(e) => setCheckedTrackIds(() => e.target.checked ? filteredAvailableTracks.map((t) => t.id) : [])}
                    className="accent-indigo-600 rounded" disabled={filteredAvailableTracks.length === 0} />
                  <span>Select All ({filteredAvailableTracks.length} found)</span>
                </label>
                {checkedTrackIds.length > 0 && (
                  <button type="button" disabled={isBulkAdding} onClick={() => onBulkAddMusic(checkedTrackIds)}
                    className="h-[28px] px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50">
                    {isBulkAdding ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                    Add Selected ({checkedTrackIds.length})
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto border border-slate-150 rounded-xl divide-y divide-slate-100 bg-white min-h-[250px] flex flex-col">
              {loadingPlaylistDetails ? (
                <div className="flex-1 flex items-center justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
              ) : filteredAvailableTracks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-10 text-xs font-medium">
                  <Music className="w-8 h-8 text-slate-300 mb-2" />No matching tracks found.
                </div>
              ) : (
                filteredAvailableTracks.map((t) => {
                  const isChecked = checkedTrackIds.includes(t.id);
                  return (
                    <div key={t.id}
                      className={`p-2.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors cursor-pointer select-none ${isChecked ? "bg-indigo-50/20" : ""}`}
                      onClick={() => setCheckedTrackIds((prev) => isChecked ? prev.filter((id) => id !== t.id) : [...prev, t.id])}>
                      <div className="flex items-center gap-2.5 min-w-0 pr-3">
                        <input type="checkbox" checked={isChecked} onChange={() => {}} className="accent-indigo-600 rounded shrink-0" />
                        <div className="truncate">
                          <div className="font-semibold text-slate-800 truncate">{t.title}</div>
                          <div className="text-[10px] text-slate-400 truncate">{t.artist?.name || "—"} • {t.genre || "Pop"}</div>
                        </div>
                      </div>
                      <button type="button"
                        onClick={(e) => { e.stopPropagation(); onAddMusic(t.id); }}
                        className="h-[24px] px-2.5 border border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 text-indigo-600 text-[10px] font-bold rounded transition-all shrink-0 cursor-pointer bg-white font-sans">
                        Add
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 shrink-0 border-t border-slate-100">
          <button type="button" onClick={onClose} className="h-[32px] px-5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-750 text-xs font-semibold cursor-pointer">Close Manager</button>
        </div>
      </div>
    </ModalBackdrop>
  );
}

// ──────────── 10. Lyrics Modal ────────────
export function LyricsModal({
  show, selectedTrack, lyricsId, lyricsText, lyricsLanguage, lyricsIsSynced, lyricsLrcContent,
  setLyricsText, setLyricsLanguage, setLyricsIsSynced, setLyricsLrcContent,
  onClose, onSubmit,
}: {
  show: boolean; selectedTrack: MusicResponse | null; lyricsId: number | null;
  lyricsText: string; lyricsLanguage: string; lyricsIsSynced: boolean; lyricsLrcContent: string;
  setLyricsText: (v: string) => void; setLyricsLanguage: (v: string) => void;
  setLyricsIsSynced: (v: boolean) => void; setLyricsLrcContent: (v: string) => void;
  onClose: () => void; onSubmit: (e: React.FormEvent) => void;
}) {
  if (!show || !selectedTrack) return null;
  return (
    <ModalBackdrop>
      <form onSubmit={onSubmit} className="w-full max-w-[600px] bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl space-y-4 animate-scale-in text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">{lyricsId ? "Edit Lyrics" : "Add Lyrics"} — {selectedTrack.title}</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-sm focus:outline-none cursor-pointer">✕</button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Language</label>
              <select value={lyricsLanguage} onChange={(e) => setLyricsLanguage(e.target.value)}
                className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-850 font-semibold">
                <option value="uz">Uzbek (uz)</option>
                <option value="en">English (en)</option>
                <option value="ru">Russian (ru)</option>
              </select>
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-750">
                <input type="checkbox" checked={lyricsIsSynced} onChange={(e) => setLyricsIsSynced(e.target.checked)} className="w-4 h-4 accent-indigo-600 rounded" />
                <span>Is Synced (LRC)?</span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Lyrics Text (Plain)</label>
            <textarea required placeholder="Paste or write track lyrics here..." value={lyricsText} onChange={(e) => setLyricsText(e.target.value)} rows={8}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-850 font-medium" />
          </div>
          {lyricsIsSynced && (
            <div>
              <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">LRC Content (Time-synced format)</label>
              <textarea placeholder="[00:12.34] Lyrics line here..." value={lyricsLrcContent} onChange={(e) => setLyricsLrcContent(e.target.value)} rows={5}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-850 font-mono" />
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className="h-[32px] px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-750 text-xs font-semibold cursor-pointer">Cancel</button>
          <button type="submit" className="h-[32px] px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer">Save Lyrics</button>
        </div>
      </form>
    </ModalBackdrop>
  );
}

// ──────────── 11. Comments Modal ────────────
export function CommentsModal({
  show, selectedTrack, commentsList, loadingComments, newCommentText, editingCommentId, editingCommentText,
  setNewCommentText, setEditingCommentId, setEditingCommentText,
  onClose, onSubmitNew, onSubmitEdit, onDeleteComment,
}: {
  show: boolean; selectedTrack: MusicResponse | null; commentsList: BackendCommentResponse[]; loadingComments: boolean;
  newCommentText: string; editingCommentId: number | null; editingCommentText: string;
  setNewCommentText: (v: string) => void; setEditingCommentId: (v: number | null) => void; setEditingCommentText: (v: string) => void;
  onClose: () => void; onSubmitNew: (e: React.FormEvent) => void; onSubmitEdit: (id: number) => void; onDeleteComment: (id: number) => void;
}) {
  if (!show || !selectedTrack) return null;
  return (
    <ModalBackdrop>
      <div className="w-full max-w-[650px] h-[80vh] bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl flex flex-col animate-scale-in text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Manage Comments — {selectedTrack.title}</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold text-sm focus:outline-none cursor-pointer">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-3 min-h-0">
          {loadingComments ? (
            <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
          ) : commentsList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs font-medium">
              <MessageSquare className="w-8 h-8 text-slate-350 mb-2" />No comments posted on this track yet.
            </div>
          ) : (
            commentsList.map((comment) => (
              <div key={comment.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl hover:bg-slate-100/50 transition-all flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-800">@{comment.userName}</span>
                    <span className="text-[10px] text-slate-450 font-semibold font-mono">{new Date(comment.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {editingCommentId !== comment.id ? (
                      <>
                        <button onClick={() => { setEditingCommentId(comment.id); setEditingCommentText(comment.text); }}
                          className="text-[10px] text-indigo-650 hover:underline font-bold px-1 cursor-pointer">Edit</button>
                        <span className="text-slate-300">|</span>
                        <button onClick={() => onDeleteComment(comment.id)} className="text-[10px] text-red-500 hover:underline font-bold px-1 cursor-pointer">Delete</button>
                      </>
                    ) : (
                      <button onClick={() => setEditingCommentId(null)} className="text-[10px] text-slate-450 hover:underline font-bold px-1 cursor-pointer">Cancel</button>
                    )}
                  </div>
                </div>
                {editingCommentId === comment.id ? (
                  <div className="flex items-end gap-2 mt-1">
                    <textarea rows={2} value={editingCommentText} onChange={(e) => setEditingCommentText(e.target.value)}
                      className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 transition-all text-slate-850 font-medium" />
                    <button type="button" onClick={() => onSubmitEdit(comment.id)}
                      className="h-[28px] px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-md shrink-0 transition-colors cursor-pointer">Save</button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-650 leading-relaxed font-medium break-words">{comment.text}</p>
                )}
              </div>
            ))
          )}
        </div>

        <form onSubmit={onSubmitNew} className="border-t border-slate-100 pt-3 shrink-0 flex items-end gap-2.5">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Post comment as Admin/Moderator</label>
            <textarea required rows={2} placeholder="Write a comment..." value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-850 font-medium" />
          </div>
          <button type="submit" disabled={!newCommentText.trim()}
            className="h-[38px] px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer">Post</button>
        </form>
      </div>
    </ModalBackdrop>
  );
}
