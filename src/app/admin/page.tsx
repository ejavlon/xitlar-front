"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "../../stores/auth-store";
import { api } from "../../lib/api/client";
import { parseAudioFilename, cleanTitleString } from "../../lib/filename-parser";
import {
  Users, Shield, UploadCloud, ShieldCheck, Lock, Loader2,
  CheckCircle, XCircle, RefreshCw, Music, Mic2, ListMusic,
  FileText, MessageSquare
} from "lucide-react";
import {
  BackendArtistResponse as ArtistResponse,
  BackendMusicResponse as MusicResponse,
  BackendPlaylistResponse as PlaylistResponse,
  BackendPageableResponse as PageableResponse,
} from "../../types/backend";

// Tab components
import { UsersTab } from "./_components/users-tab";
import { ModeratorsTab } from "./_components/moderators-tab";
import { ArtistsTab } from "./_components/artists-tab";
import { TracksTab } from "./_components/tracks-tab";
import { PlaylistsTab } from "./_components/playlists-tab";
import { UploadTab } from "./_components/upload-tab";
import { LyricsTab } from "./_components/lyrics-tab";
import { CommentsTab } from "./_components/comments-tab";

// Modal components
import {
  EditUserModal, RoleModal, PasswordModal, ModeratorModal,
  ArtistModal, TrackModal, TrackDetailsModal, PlaylistModal,
  PlaylistDetailModal, LyricsModal, CommentsModal,
} from "./_components/admin-modals";

// ──────────── Local types ────────────
interface AdminBulkTrackItem {
  id: string; file: File; fileName: string; title: string;
  artistName: string; artistId: number | null; size: number;
}
interface AppUser { id: number; firstName: string; lastName: string; username: string; role: "USER" | "MODERATOR" | "ADMIN"; }
interface Moderator { id: number; firstName: string; lastName: string; username: string; role: "MODERATOR"; }
interface BackendCommentResponse { id: number; text: string; createdAt: string; musicId: number; userId: number; userName: string; }

export default function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Tabs
  const validTabs = ["users", "moderators", "artists", "tracks", "playlists", "upload", "lyrics", "comments"] as const;
  type TabType = typeof validTabs[number];
  const rawTab = searchParams?.get("tab");
  let activeTab: TabType = "users";
  if (user?.role === "MODERATOR") activeTab = "artists";
  if (rawTab && validTabs.includes(rawTab as any)) {
    if (user?.role === "MODERATOR" && (rawTab === "users" || rawTab === "moderators")) {
      activeTab = "artists";
    } else {
      activeTab = rawTab as TabType;
    }
  }

  const handleTabChange = (tab: TabType) => {
    setErrorMsg(""); setSuccessMsg(""); setSearchQuery("");
    router.push(`/admin?tab=${tab}`, { scroll: false });
  };

  // Data states
  const [usersList, setUsersList] = useState<AppUser[]>([]);
  const [moderatorsList, setModeratorsList] = useState<Moderator[]>([]);
  const [artistsList, setArtistsList] = useState<ArtistResponse[]>([]);
  const [tracksList, setTracksList] = useState<MusicResponse[]>([]);
  const [playlistsList, setPlaylistsList] = useState<PlaylistResponse[]>([]);
  const [allArtistsList, setAllArtistsList] = useState<ArtistResponse[]>([]);
  const [allTracksList, setAllTracksList] = useState<MusicResponse[]>([]);

  // Paging states
  const [artistsPage, setArtistsPage] = useState(0);
  const [artistsTotalPages, setArtistsTotalPages] = useState(1);
  const [tracksPage, setTracksPage] = useState(0);
  const [tracksTotalPages, setTracksTotalPages] = useState(1);
  const [tracksSortBy, setTracksSortBy] = useState<"id" | "title" | "artist" | "genre" | "likes" | "dislikes">("id");
  const [tracksSortDirection, setTracksSortDirection] = useState<"asc" | "desc">("desc");
  const [playlistsPage, setPlaylistsPage] = useState(0);
  const [playlistsTotalPages, setPlaylistsTotalPages] = useState(1);

  // Loading / Messages
  const [loadingData, setLoadingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal: Users
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editRole, setEditRole] = useState<"USER" | "MODERATOR" | "ADMIN">("USER");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordText, setShowPasswordText] = useState(false);

  // Modal: Moderators
  const [showModModal, setShowModModal] = useState(false);
  const [isEditMod, setIsEditMod] = useState(false);
  const [selectedMod, setSelectedMod] = useState<Moderator | null>(null);
  const [modFirstName, setModFirstName] = useState("");
  const [modLastName, setModLastName] = useState("");
  const [modUsername, setModUsername] = useState("");
  const [modPassword, setModPassword] = useState("");
  const [modConfirmPassword, setModConfirmPassword] = useState("");

  // Modal: Artists
  const [showArtistModal, setShowArtistModal] = useState(false);
  const [isEditArtist, setIsEditArtist] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<ArtistResponse | null>(null);
  const [artistName, setArtistName] = useState("");
  const [artistGenre, setArtistGenre] = useState("POP");
  const [artistFile, setArtistFile] = useState<File | null>(null);

  // Modal: Tracks
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [isEditTrack, setIsEditTrack] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<MusicResponse | null>(null);
  const [trackTitle, setTrackTitle] = useState("");
  const [trackArtistId, setTrackArtistId] = useState("");
  const [trackGenre, setTrackGenre] = useState("POP");
  const [trackNumberInput, setTrackNumberInput] = useState("");
  const [trackLyricsText, setTrackLyricsText] = useState("");
  const [trackFile, setTrackFile] = useState<File | null>(null);
  const [showTrackDetailsModal, setShowTrackDetailsModal] = useState(false);
  const [trackDetailsItem, setTrackDetailsItem] = useState<MusicResponse | null>(null);

  // Modal: Playlists
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [isEditPlaylist, setIsEditPlaylist] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistResponse | null>(null);
  const [playlistTitle, setPlaylistTitle] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [playlistFile, setPlaylistFile] = useState<File | null>(null);
  const [showPlaylistDetailModal, setShowPlaylistDetailModal] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [loadingPlaylistDetails, setLoadingPlaylistDetails] = useState(false);
  const [searchTrackQuery, setSearchTrackQuery] = useState("");
  const [selectedGenreFilter, setSelectedGenreFilter] = useState("");
  const [selectedArtistFilter, setSelectedArtistFilter] = useState("");
  const [checkedTrackIds, setCheckedTrackIds] = useState<number[]>([]);
  const [isBulkAdding, setIsBulkAdding] = useState(false);

  // Bulk Upload
  const [bulkQueue, setBulkQueue] = useState<AdminBulkTrackItem[]>([]);
  const [batchAdminArtist, setBatchAdminArtist] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<any[]>([]);

  // Lyrics
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [selectedTrackForLyrics, setSelectedTrackForLyrics] = useState<MusicResponse | null>(null);
  const [lyricsId, setLyricsId] = useState<number | null>(null);
  const [lyricsText, setLyricsText] = useState("");
  const [lyricsLanguage, setLyricsLanguage] = useState("uz");
  const [lyricsIsSynced, setLyricsIsSynced] = useState(false);
  const [lyricsLrcContent, setLyricsLrcContent] = useState("");

  // Comments
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedTrackForComments, setSelectedTrackForComments] = useState<MusicResponse | null>(null);
  const [commentsList, setCommentsList] = useState<BackendCommentResponse[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted) {
      const currentTabInUrl = searchParams?.get("tab");
      if (currentTabInUrl !== activeTab) {
        router.replace(`/admin?tab=${activeTab}`, { scroll: false });
      }
    }
  }, [mounted, activeTab, searchParams, router]);

  const isAuthorized = isAuthenticated && (user?.role === "ADMIN" || user?.role === "MODERATOR");
  const isAdmin = isAuthenticated && user?.role === "ADMIN";

  // ──── Data loading ────
  const loadData = async () => {
    if (!isAuthorized) return;
    setLoadingData(true); setErrorMsg("");
    try {
      if (activeTab === "users") {
        const data = await api.get<AppUser[]>("/api/v1/users");
        setUsersList(data || []);
      } else if (activeTab === "moderators" && isAdmin) {
        const data = await api.get<Moderator[]>("/api/v1/moderators");
        setModeratorsList(data || []);
      } else if (activeTab === "artists") {
        const res = await api.get<PageableResponse<ArtistResponse>>(`/api/v1/artists?page=${artistsPage}&size=10&sortBy=id&sortDirection=desc`);
        setArtistsList(res.content || []); setArtistsTotalPages(res.totalPages || 1);
      } else if (activeTab === "tracks" || activeTab === "lyrics" || activeTab === "comments") {
        const res = await api.get<PageableResponse<MusicResponse>>(`/api/v1/musics?page=${tracksPage}&size=10&sortBy=${tracksSortBy}&sortDirection=${tracksSortDirection}`);
        setTracksList(res.content || []); setTracksTotalPages(res.totalPages || 1);
      } else if (activeTab === "playlists") {
        const res = await api.get<PageableResponse<PlaylistResponse>>(`/api/v1/playlists?isCollection=true&page=${playlistsPage}&size=10&sortBy=id&sortDirection=desc`);
        setPlaylistsList(res.content || []); setPlaylistsTotalPages(res.totalPages || 1);
      }
    } catch (err: any) {
      console.error("Failed to load admin panel data:", err);
      setErrorMsg(err.message || "Failed to load database items.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (mounted && isAuthorized) loadData();
  }, [mounted, activeTab, artistsPage, tracksPage, playlistsPage, tracksSortBy, tracksSortDirection, isAuthenticated]);

  // ──── Auth guards ────
  if (!mounted || !isInitialized) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#365377]" /></div>;
  }
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center font-sans select-none animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-5 shadow-2xs border border-slate-200">
          <Lock className="w-6 h-6 text-slate-400" />
        </div>
        <h1 className="text-xl font-bold text-slate-850 mb-2">Access Restrained</h1>
        <p className="text-xs text-slate-500 max-w-[360px] mb-6 leading-relaxed">Please sign in with an Administrator or Moderator account to access the Control Panel.</p>
        <button onClick={() => router.push("/login")} className="h-[36px] px-6 rounded-full bg-[#365377] hover:bg-[#284160] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer focus:outline-none">Sign In</button>
      </div>
    );
  }
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center font-sans select-none animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5 shadow-2xs border border-red-100">
          <Shield className="w-6 h-6 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-xs text-red-500 max-w-[420px] mb-6 leading-relaxed">You are not authorized to view the management area. Role permissions required: ADMIN or MODERATOR.</p>
        <button onClick={() => router.push("/")} className="h-[36px] px-6 rounded-full border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-semibold shadow-2xs transition-colors cursor-pointer focus:outline-none bg-white">Return Home</button>
      </div>
    );
  }

  // ──────────── Action Handlers ────────────

  // Users
  const handleEditUser = (usr: AppUser) => { setSelectedUser(usr); setEditFirstName(usr.firstName); setEditLastName(usr.lastName); setEditUsername(usr.username); setShowEditUserModal(true); };
  const submitEditUser = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selectedUser) return;
    setErrorMsg(""); setSuccessMsg("");
    try { await api.put(`/api/v1/users/${selectedUser.id}`, { firstName: editFirstName, lastName: editLastName, username: editUsername }); setSuccessMsg("User details successfully updated!"); setShowEditUserModal(false); loadData(); }
    catch (err: any) { setErrorMsg(err.message || "Failed to update user. Try again."); }
  };
  const handleEditRole = (usr: AppUser) => { setSelectedUser(usr); setEditRole(usr.role); setShowRoleModal(true); };
  const submitRoleChange = async () => {
    if (!selectedUser) return; setErrorMsg(""); setSuccessMsg("");
    try { await api.put(`/api/v1/users/${selectedUser.id}/role`, { role: editRole }); setSuccessMsg("User role successfully updated!"); setShowRoleModal(false); loadData(); }
    catch (err: any) { setErrorMsg(err.message || "Failed to update user role."); }
  };
  const handleResetPassword = (usr: AppUser) => { setSelectedUser(usr); setNewPassword(""); setConfirmPassword(""); setShowPasswordModal(true); };
  const submitPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selectedUser) return;
    if (newPassword !== confirmPassword) { setErrorMsg("Passwords do not match."); return; }
    setErrorMsg(""); setSuccessMsg("");
    try { await api.put(`/api/v1/users/${selectedUser.id}/password`, { newPassword }); setSuccessMsg("User password successfully reset!"); setShowPasswordModal(false); loadData(); }
    catch (err: any) { setErrorMsg(err.message || "Failed to reset password."); }
  };
  const handleDeleteUser = async (id: number, username: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${username}"?`)) return;
    setErrorMsg(""); setSuccessMsg("");
    try { await api.delete(`/api/v1/users/${id}`); setSuccessMsg("User successfully deleted."); loadData(); }
    catch (err: any) { setErrorMsg(err.message || "Failed to delete user."); }
  };

  // Moderators
  const handleCreateMod = () => { setIsEditMod(false); setSelectedMod(null); setModFirstName(""); setModLastName(""); setModUsername(""); setModPassword(""); setModConfirmPassword(""); setShowModModal(true); };
  const handleEditMod = (mod: Moderator) => { setIsEditMod(true); setSelectedMod(mod); setModFirstName(mod.firstName); setModLastName(mod.lastName); setModUsername(mod.username); setModPassword(""); setModConfirmPassword(""); setShowModModal(true); };
  const submitModForm = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMsg(""); setSuccessMsg("");
    try {
      if (isEditMod && selectedMod) { await api.put(`/api/v1/moderators/${selectedMod.id}`, { firstName: modFirstName, lastName: modLastName, username: modUsername }); setSuccessMsg("Moderator successfully updated!"); }
      else { if (modPassword !== modConfirmPassword) { setErrorMsg("Passwords do not match."); return; } await api.post("/api/v1/moderators", { firstName: modFirstName, lastName: modLastName, username: modUsername, password: modPassword, confirmPassword: modConfirmPassword }); setSuccessMsg("New Moderator successfully created!"); }
      setShowModModal(false); loadData();
    } catch (err: any) { setErrorMsg(err.message || "Failed to submit moderator form."); }
  };
  const handleDeleteMod = async (id: number, username: string) => {
    if (!confirm(`Are you sure you want to delete moderator "${username}"?`)) return;
    setErrorMsg(""); setSuccessMsg("");
    try { await api.delete(`/api/v1/moderators/${id}`); setSuccessMsg("Moderator successfully deleted."); loadData(); }
    catch (err: any) { setErrorMsg(err.message || "Failed to delete moderator."); }
  };
  const handleModPasswordReset = (mod: Moderator) => { setSelectedUser({ id: mod.id, firstName: mod.firstName, lastName: mod.lastName, username: mod.username, role: "MODERATOR" }); setNewPassword(""); setConfirmPassword(""); setShowPasswordModal(true); };

  // Artists
  const handleCreateArtist = () => { setIsEditArtist(false); setSelectedArtist(null); setArtistName(""); setArtistGenre("POP"); setArtistFile(null); setShowArtistModal(true); };
  const handleEditArtist = (art: ArtistResponse) => { setIsEditArtist(true); setSelectedArtist(art); setArtistName(art.name); setArtistGenre(art.genre || "POP"); setArtistFile(null); setShowArtistModal(true); };
  const submitArtistForm = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMsg(""); setSuccessMsg("");
    try {
      const formData = new FormData();
      formData.append("data", new Blob([JSON.stringify({ name: artistName, genre: artistGenre })], { type: "application/json" }));
      if (artistFile) formData.append("file", artistFile);
      if (isEditArtist && selectedArtist) { await api.put(`/api/v1/artists/${selectedArtist.id}`, formData); setSuccessMsg("Artist details successfully updated!"); }
      else { await api.post("/api/v1/artists", formData); setSuccessMsg("New Artist successfully created!"); }
      setShowArtistModal(false); loadData();
    } catch (err: any) { setErrorMsg(err.message || "Failed to submit artist details."); }
  };
  const handleDeleteArtist = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete artist "${name}"?`)) return;
    setErrorMsg(""); setSuccessMsg("");
    try { await api.delete(`/api/v1/artists/${id}`); setSuccessMsg("Artist successfully deleted."); loadData(); }
    catch (err: any) { setErrorMsg(err.message || "Failed to delete artist."); }
  };

  // Tracks
  const loadAllArtists = async () => {
    try { const res = await api.get<PageableResponse<ArtistResponse>>("/api/v1/artists?page=0&size=100"); setAllArtistsList(res.content || []); }
    catch (err) { console.error("Failed to load artists selector list:", err); }
  };
  const handleCreateTrack = async () => { setIsEditTrack(false); setSelectedTrack(null); setTrackTitle(""); setTrackArtistId(""); setTrackGenre("POP"); setTrackNumberInput(""); setTrackLyricsText(""); setTrackFile(null); setShowTrackModal(true); await loadAllArtists(); };
  const handleEditTrack = async (trk: MusicResponse) => { setIsEditTrack(true); setSelectedTrack(trk); setTrackTitle(trk.title); setTrackArtistId(trk.artist ? String(trk.artist.id) : ""); setTrackGenre(trk.genre || "POP"); setTrackNumberInput(trk.trackNumber ? String(trk.trackNumber) : ""); setTrackLyricsText(""); setTrackFile(null); setShowTrackModal(true); await loadAllArtists(); };
  const submitTrackForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditTrack && !trackFile) { setErrorMsg("Audio file is required for new tracks."); return; }
    setErrorMsg(""); setSuccessMsg("");
    try {
      const formData = new FormData();
      const payload: any = { title: trackTitle, artistId: trackArtistId ? Number(trackArtistId) : null, genre: trackGenre, trackNumber: trackNumberInput ? Number(trackNumberInput) : null };
      if (!isEditTrack && trackLyricsText) payload.lyrics = { text: trackLyricsText };
      formData.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      if (trackFile) formData.append("file", trackFile);
      if (isEditTrack && selectedTrack) { await api.put(`/api/v1/musics/${selectedTrack.id}`, formData); setSuccessMsg("Track details successfully updated!"); }
      else { await api.post("/api/v1/musics", formData); setSuccessMsg("New Track successfully uploaded!"); }
      setShowTrackModal(false); loadData();
    } catch (err: any) { setErrorMsg(err.message || "Failed to submit track details."); }
  };
  const handleDeleteTrack = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete track "${title}"?`)) return;
    setErrorMsg(""); setSuccessMsg("");
    try { await api.delete(`/api/v1/musics/${id}`); setSuccessMsg("Track successfully deleted."); loadData(); }
    catch (err: any) { setErrorMsg(err.message || "Failed to delete track."); }
  };
  const handleSortTracks = (field: "id" | "title" | "artist" | "genre" | "likes" | "dislikes") => {
    if (tracksSortBy === field) { setTracksSortDirection((prev) => (prev === "asc" ? "desc" : "asc")); }
    else { setTracksSortBy(field); setTracksSortDirection(field === "likes" || field === "dislikes" || field === "id" ? "desc" : "asc"); }
    setTracksPage(0);
  };

  // Playlists
  const handleCreatePlaylist = () => { setIsEditPlaylist(false); setSelectedPlaylist(null); setPlaylistTitle(""); setPlaylistDescription(""); setPlaylistFile(null); setShowPlaylistModal(true); };
  const handleEditPlaylist = (pl: PlaylistResponse) => { setIsEditPlaylist(true); setSelectedPlaylist(pl); setPlaylistTitle(pl.title); setPlaylistDescription(pl.description || ""); setPlaylistFile(null); setShowPlaylistModal(true); };
  const submitPlaylistForm = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMsg(""); setSuccessMsg("");
    try {
      const formData = new FormData();
      formData.append("data", new Blob([JSON.stringify({ title: playlistTitle, description: playlistDescription, isCollection: true })], { type: "application/json" }));
      if (playlistFile) formData.append("file", playlistFile);
      if (isEditPlaylist && selectedPlaylist) { await api.put(`/api/v1/playlists/${selectedPlaylist.id}`, formData); setSuccessMsg("Playlist details successfully updated!"); }
      else { await api.post("/api/v1/playlists", formData); setSuccessMsg("New Playlist successfully created!"); }
      setShowPlaylistModal(false); loadData();
    } catch (err: any) { setErrorMsg(err.message || "Failed to submit playlist form."); }
  };
  const handleDeletePlaylist = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete playlist "${title}"?`)) return;
    setErrorMsg(""); setSuccessMsg("");
    try { await api.delete(`/api/v1/playlists/${id}`); setSuccessMsg("Playlist successfully deleted."); loadData(); }
    catch (err: any) { setErrorMsg(err.message || "Failed to delete playlist."); }
  };
  const handlePlaylistDetails = async (pl: PlaylistResponse) => {
    setSelectedPlaylist(pl); setShowPlaylistDetailModal(true); setErrorMsg(""); setSuccessMsg(""); setLoadingPlaylistDetails(true);
    try {
      const [fullPlaylist, res, artistsRes] = await Promise.all([
        api.get<PlaylistResponse>(`/api/v1/playlists/${pl.id}`),
        api.get<PageableResponse<MusicResponse>>("/api/v1/musics?page=0&size=100"),
        api.get<PageableResponse<ArtistResponse>>("/api/v1/artists?page=0&size=100"),
      ]);
      setSelectedPlaylist(fullPlaylist); setAllTracksList(res.content || []); setAllArtistsList(artistsRes.content || []);
    } catch (err: any) { setErrorMsg(err.message || "Failed to load playlist details."); }
    finally { setLoadingPlaylistDetails(false); }
  };
  const handleAddMusicToPlaylist = async (musicId: number) => {
    if (!selectedPlaylist) return; setErrorMsg(""); setSuccessMsg("");
    try { const updated = await api.post<PlaylistResponse>(`/api/v1/playlists/${selectedPlaylist.id}/musics/${musicId}`); setSelectedPlaylist(updated); setSuccessMsg("Track added to playlist."); loadData(); }
    catch (err: any) { setErrorMsg(err.message || "Failed to add track to playlist."); }
  };
  const handleBulkAddMusicToPlaylist = async (musicIds: number[]) => {
    if (!selectedPlaylist || musicIds.length === 0) return; setErrorMsg(""); setSuccessMsg(""); setIsBulkAdding(true);
    try {
      await api.post(`/api/v1/playlists/${selectedPlaylist.id}/musics/bulk`, { musicIds });
      const updated = await api.get<PlaylistResponse>(`/api/v1/playlists/${selectedPlaylist.id}`);
      setSelectedPlaylist(updated); setCheckedTrackIds([]); setSuccessMsg(`Successfully added ${musicIds.length} tracks to playlist.`); loadData();
    } catch (err: any) { setErrorMsg(err.message || "Failed to add selected tracks to playlist."); }
    finally { setIsBulkAdding(false); }
  };
  const handleRemoveMusicFromPlaylist = async (musicId: number) => {
    if (!selectedPlaylist) return; setErrorMsg(""); setSuccessMsg("");
    try { const updated = await api.delete<PlaylistResponse>(`/api/v1/playlists/${selectedPlaylist.id}/musics/${musicId}`); setSelectedPlaylist(updated); setSuccessMsg("Track removed from playlist."); loadData(); }
    catch (err: any) { setErrorMsg(err.message || "Failed to remove track from playlist."); }
  };
  const handleReorderPlaylistMusic = async (index: number, direction: "up" | "down") => {
    if (!selectedPlaylist || !selectedPlaylist.musics) return;
    const musics = [...selectedPlaylist.musics];
    if (direction === "up" && index > 0) { const t = musics[index]; musics[index] = musics[index - 1]; musics[index - 1] = t; }
    else if (direction === "down" && index < musics.length - 1) { const t = musics[index]; musics[index] = musics[index + 1]; musics[index + 1] = t; }
    else return;
    setErrorMsg(""); setSuccessMsg("");
    try { const updated = await api.put<PlaylistResponse>(`/api/v1/playlists/${selectedPlaylist.id}/musics/reorder`, { musicIds: musics.map((m) => m.id) }); setSelectedPlaylist(updated); setSuccessMsg("Tracks reordered successfully."); loadData(); }
    catch (err: any) { setErrorMsg(err.message || "Failed to reorder tracks."); }
  };
  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = async (index: number) => {
    if (draggedIndex === null || draggedIndex === index || !selectedPlaylist || !selectedPlaylist.musics) return;
    const musics = [...selectedPlaylist.musics];
    const dragged = musics[draggedIndex]; musics.splice(draggedIndex, 1); musics.splice(index, 0, dragged);
    const updatedOptimistic = { ...selectedPlaylist, musics }; setSelectedPlaylist(updatedOptimistic); setErrorMsg(""); setSuccessMsg("");
    try { const updated = await api.put<PlaylistResponse>(`/api/v1/playlists/${selectedPlaylist.id}/musics/reorder`, { musicIds: musics.map((m) => Number(m.id)) }); setSelectedPlaylist(updated); setSuccessMsg("Tracks reordered successfully."); loadData(); }
    catch (err: any) { setErrorMsg(err.message || "Failed to reorder tracks."); setSelectedPlaylist(selectedPlaylist); }
    finally { setDraggedIndex(null); }
  };

  // Bulk Upload
  const handleBulkUploadFiles = (files: FileList | null) => {
    if (!files) return;
    const array = Array.from(files).filter((f) => f.name.toLowerCase().endsWith(".mp3"));
    if (bulkQueue.length + array.length > 50) { setErrorMsg("Bir vaqtda maksimum 50 ta fayl yuklash mumkin."); return; }
    const newItems: AdminBulkTrackItem[] = array.map((file) => {
      const parsed = parseAudioFilename(file.name);
      const found = allArtistsList.find((a) => a.name.toLowerCase() === parsed.artist?.toLowerCase());
      return { id: `${file.name}-${Date.now()}-${Math.random()}`, file, fileName: file.name, title: parsed.title, artistName: parsed.artist, artistId: found ? found.id : null, size: file.size };
    });
    setBulkQueue((prev) => [...prev, ...newItems]);
  };
  const updateBulkItemTitle = (index: number, newTitle: string) => setBulkQueue((prev) => { const copy = [...prev]; copy[index] = { ...copy[index], title: newTitle }; return copy; });
  const updateBulkItemArtist = (index: number, newArtist: string) => setBulkQueue((prev) => { const copy = [...prev]; const found = allArtistsList.find((a) => a.name.toLowerCase() === newArtist.trim().toLowerCase()); copy[index] = { ...copy[index], artistName: newArtist, artistId: found ? found.id : null }; return copy; });
  const removeBulkItem = (index: number) => setBulkQueue((prev) => prev.filter((_, i) => i !== index));
  const applyAdminBatchArtist = () => {
    if (!batchAdminArtist.trim()) return;
    const trimmed = batchAdminArtist.trim();
    const found = allArtistsList.find((a) => a.name.toLowerCase() === trimmed.toLowerCase());
    setBulkQueue((prev) => prev.map((item) => ({ ...item, artistName: trimmed, artistId: found ? found.id : null })));
  };
  const cleanAdminBulkTitles = () => setBulkQueue((prev) => prev.map((item) => ({ ...item, title: cleanTitleString(item.title) || item.title })));
  const submitBulkUpload = async () => {
    if (bulkQueue.length === 0) return;
    if (bulkQueue.length > 50) { setErrorMsg("Navbat limiti oshib ketdi. Maksimum 50 ta fayl ruxsat etiladi."); return; }
    setUploading(true); setUploadResults([]); setErrorMsg(""); setSuccessMsg("");
    const formData = new FormData();
    bulkQueue.forEach((item) => formData.append("files", item.file));
    formData.append("metadata", new Blob([JSON.stringify(bulkQueue.map((item) => ({ fileName: item.fileName, title: item.title.trim() || item.fileName.replace(/\.[^/.]+$/, ""), artistName: item.artistName.trim() || null, artistId: item.artistId || null })))], { type: "application/json" }));
    try { const res = await api.post<any>("/api/v1/musics/bulk", formData, { timeout: 300000 }); if (res) { setUploadResults(res.results || []); setSuccessMsg(`Jami ${res.successCount || 0} ta musiqa muvaffaqiyatli yuklandi!`); setBulkQueue([]); loadData(); } }
    catch (err: any) { setErrorMsg(err.message || "Bulk upload jarayonida xatolik yuz berdi."); }
    finally { setUploading(false); }
  };

  // Lyrics
  const handleManageLyrics = (trk: MusicResponse) => {
    setSelectedTrackForLyrics(trk);
    if (trk.lyrics) { setLyricsId(trk.lyrics.id); setLyricsText(trk.lyrics.text || ""); setLyricsLanguage(trk.lyrics.language || "uz"); setLyricsIsSynced(trk.lyrics.isSynced || false); setLyricsLrcContent(trk.lyrics.lrcContent || ""); }
    else { setLyricsId(null); setLyricsText(""); setLyricsLanguage("uz"); setLyricsIsSynced(false); setLyricsLrcContent(""); }
    setErrorMsg(""); setSuccessMsg(""); setShowLyricsModal(true);
  };
  const submitLyricsForm = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selectedTrackForLyrics) return;
    if (!lyricsText.trim()) { setErrorMsg("Lyrics text cannot be empty."); return; }
    setErrorMsg(""); setSuccessMsg("");
    try {
      if (lyricsId) { await api.put(`/api/v1/lyrics/${lyricsId}`, { text: lyricsText, language: lyricsLanguage, isSynced: lyricsIsSynced, lrcContent: lyricsLrcContent }); setSuccessMsg("Lyrics successfully updated!"); }
      else { await api.post("/api/v1/lyrics", { musicId: selectedTrackForLyrics.id, text: lyricsText, language: lyricsLanguage, isSynced: lyricsIsSynced, lrcContent: lyricsLrcContent }); setSuccessMsg("Lyrics successfully added!"); }
      setShowLyricsModal(false); loadData();
    } catch (err: any) { setErrorMsg(err.message || "Failed to submit lyrics."); }
  };
  const handleDeleteLyrics = async (trk: MusicResponse) => {
    if (!trk.lyrics) return;
    if (!confirm(`Are you sure you want to delete lyrics for "${trk.title}"?`)) return;
    setErrorMsg(""); setSuccessMsg("");
    try { await api.delete(`/api/v1/lyrics/${trk.lyrics.id}`); setSuccessMsg("Lyrics successfully deleted."); loadData(); }
    catch (err: any) { setErrorMsg(err.message || "Failed to delete lyrics."); }
  };

  // Comments
  const handleManageComments = async (trk: MusicResponse) => {
    setSelectedTrackForComments(trk); setNewCommentText(""); setEditingCommentId(null); setEditingCommentText(""); setErrorMsg(""); setSuccessMsg(""); setShowCommentsModal(true); setLoadingComments(true);
    try { const res = await api.get<PageableResponse<BackendCommentResponse>>(`/api/v1/comments/music/${trk.id}?page=0&size=50&sortBy=id&sortDirection=desc`); setCommentsList(res.content || []); }
    catch (err: any) { setErrorMsg(err.message || "Failed to load comments."); }
    finally { setLoadingComments(false); }
  };
  const submitNewComment = async (e: React.FormEvent) => {
    e.preventDefault(); if (!selectedTrackForComments || !newCommentText.trim()) return;
    setErrorMsg(""); setSuccessMsg("");
    try { await api.post<BackendCommentResponse>("/api/v1/comments", { text: newCommentText.trim(), musicId: selectedTrackForComments.id }); setNewCommentText(""); const res = await api.get<PageableResponse<BackendCommentResponse>>(`/api/v1/comments/music/${selectedTrackForComments.id}?page=0&size=50&sortBy=id&sortDirection=desc`); setCommentsList(res.content || []); setSuccessMsg("Comment added successfully!"); }
    catch (err: any) { setErrorMsg(err.message || "Failed to post comment."); }
  };
  const submitEditComment = async (commentId: number) => {
    if (!editingCommentText.trim()) return; setErrorMsg(""); setSuccessMsg("");
    try { await api.put(`/api/v1/comments/${commentId}`, { text: editingCommentText.trim() }); setEditingCommentId(null); setEditingCommentText(""); if (selectedTrackForComments) { const res = await api.get<PageableResponse<BackendCommentResponse>>(`/api/v1/comments/music/${selectedTrackForComments.id}?page=0&size=50&sortBy=id&sortDirection=desc`); setCommentsList(res.content || []); } setSuccessMsg("Comment updated successfully!"); }
    catch (err: any) { setErrorMsg(err.message || "Failed to update comment."); }
  };
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return; setErrorMsg(""); setSuccessMsg("");
    try { await api.delete(`/api/v1/comments/${commentId}`); if (selectedTrackForComments) { const res = await api.get<PageableResponse<BackendCommentResponse>>(`/api/v1/comments/music/${selectedTrackForComments.id}?page=0&size=50&sortBy=id&sortDirection=desc`); setCommentsList(res.content || []); } setSuccessMsg("Comment deleted successfully."); }
    catch (err: any) { setErrorMsg(err.message || "Failed to delete comment."); }
  };

  // ──────────── Filtered lists ────────────
  const filteredUsers = usersList.filter((u) =>
    u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredModerators = moderatorsList.filter((m) =>
    m.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredArtists = artistsList.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.genre && a.genre.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const filteredTracks = tracksList
    .filter((t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.artist?.name && t.artist.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.genre && t.genre.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      const dir = tracksSortDirection === "asc" ? 1 : -1;
      if (tracksSortBy === "id") return (a.id - b.id) * dir;
      if (tracksSortBy === "title") return (a.title || "").localeCompare(b.title || "") * dir;
      if (tracksSortBy === "artist") return (a.artist?.name || "").localeCompare(b.artist?.name || "") * dir;
      if (tracksSortBy === "genre") return (a.genre || "").localeCompare(b.genre || "") * dir;
      if (tracksSortBy === "likes") return ((a.likeCount || 0) - (b.likeCount || 0)) * dir;
      if (tracksSortBy === "dislikes") return ((a.dislikeCount || 0) - (b.dislikeCount || 0)) * dir;
      return 0;
    });
  const filteredPlaylists = playlistsList.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const filteredAvailableTracks = allTracksList
    .filter((t) => {
      if (selectedPlaylist?.musics?.some((m) => m.id === t.id)) return false;
      if (searchTrackQuery) { const q = searchTrackQuery.toLowerCase(); if (!t.title.toLowerCase().includes(q) && !t.artist?.name?.toLowerCase().includes(q) && !t.genre?.toLowerCase().includes(q)) return false; }
      if (selectedGenreFilter && t.genre !== selectedGenreFilter) return false;
      if (selectedArtistFilter && String(t.artist?.id) !== selectedArtistFilter) return false;
      return true;
    })
    .sort((a, b) => b.id - a.id);

  // ──────────── Render ────────────
  return (
    <div className="space-y-6 font-sans select-none animate-fade-in p-2 sm:p-4 w-full text-slate-800">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            Management Control Panel
          </h1>
          <p className="text-xs text-slate-450 mt-1">
            Signed in as: <span className="font-semibold text-slate-700">{user?.name}</span> ({user?.role})
          </p>
        </div>
        <button onClick={loadData} disabled={loadingData}
          className="self-start sm:self-center h-[32px] px-4 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loadingData && "animate-spin"}`} />
          Refresh
        </button>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-semibold animate-fade-in">
          <CheckCircle className="w-4.5 h-4.5 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-semibold animate-fade-in">
          <XCircle className="w-4.5 h-4.5 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {[
          { key: "users", label: "Users", icon: <Users className="w-4 h-4" />, adminOnly: false },
          { key: "moderators", label: "Moderators", icon: <Shield className="w-4 h-4" />, adminOnly: true },
          { key: "artists", label: "Artists", icon: <Mic2 className="w-4 h-4" />, adminOnly: false },
          { key: "tracks", label: "Tracks", icon: <Music className="w-4 h-4" />, adminOnly: false },
          { key: "playlists", label: "Playlists", icon: <ListMusic className="w-4 h-4" />, adminOnly: false },
          { key: "upload", label: "Bulk Upload", icon: <UploadCloud className="w-4 h-4" />, adminOnly: false },
          { key: "lyrics", label: "Lyrics", icon: <FileText className="w-4 h-4" />, adminOnly: false },
          { key: "comments", label: "Comments", icon: <MessageSquare className="w-4 h-4" />, adminOnly: false },
        ]
          .filter(({ adminOnly }) => !adminOnly || isAdmin)
          .map(({ key, label, icon }) => (
            <button key={key} onClick={() => handleTabChange(key as TabType)}
              className={`px-4 py-2.5 text-xs sm:text-[13px] font-bold border-b-2 transition-all flex items-center gap-2 -mb-[2px] ${
                activeTab === key ? "border-indigo-600 text-indigo-600 font-extrabold" : "border-transparent text-slate-500 hover:text-slate-800"
              }`}>
              {icon}{label}
            </button>
          ))}
      </div>

      {/* Tab content */}
      {activeTab === "users" && (
        <UsersTab searchQuery={searchQuery} setSearchQuery={setSearchQuery} loadingData={loadingData}
          filteredUsers={filteredUsers} isAdmin={isAdmin} currentUsername={user?.email}
          onEditUser={handleEditUser} onEditRole={handleEditRole} onResetPassword={handleResetPassword} onDeleteUser={handleDeleteUser} />
      )}
      {activeTab === "moderators" && isAdmin && (
        <ModeratorsTab searchQuery={searchQuery} setSearchQuery={setSearchQuery} loadingData={loadingData}
          filteredModerators={filteredModerators} onCreateMod={handleCreateMod} onEditMod={handleEditMod}
          onPasswordReset={handleModPasswordReset} onDeleteMod={handleDeleteMod} />
      )}
      {activeTab === "artists" && (
        <ArtistsTab searchQuery={searchQuery} setSearchQuery={setSearchQuery} loadingData={loadingData}
          filteredArtists={filteredArtists} artistsPage={artistsPage} artistsTotalPages={artistsTotalPages}
          setArtistsPage={setArtistsPage} onCreateArtist={handleCreateArtist} onEditArtist={handleEditArtist} onDeleteArtist={handleDeleteArtist} />
      )}
      {activeTab === "tracks" && (
        <TracksTab searchQuery={searchQuery} setSearchQuery={setSearchQuery} loadingData={loadingData}
          filteredTracks={filteredTracks} tracksPage={tracksPage} tracksTotalPages={tracksTotalPages}
          setTracksPage={setTracksPage} tracksSortBy={tracksSortBy} tracksSortDirection={tracksSortDirection}
          onSortTracks={handleSortTracks} onCreateTrack={handleCreateTrack} onEditTrack={handleEditTrack}
          onDeleteTrack={handleDeleteTrack} onViewDetails={(trk) => { setTrackDetailsItem(trk); setShowTrackDetailsModal(true); }} />
      )}
      {activeTab === "playlists" && (
        <PlaylistsTab searchQuery={searchQuery} setSearchQuery={setSearchQuery} loadingData={loadingData}
          filteredPlaylists={filteredPlaylists} playlistsPage={playlistsPage} playlistsTotalPages={playlistsTotalPages}
          setPlaylistsPage={setPlaylistsPage} onCreatePlaylist={handleCreatePlaylist} onEditPlaylist={handleEditPlaylist}
          onDeletePlaylist={handleDeletePlaylist} onPlaylistDetails={handlePlaylistDetails} />
      )}
      {activeTab === "upload" && (
        <UploadTab allArtistsList={allArtistsList} bulkQueue={bulkQueue} setBulkQueue={setBulkQueue}
          batchAdminArtist={batchAdminArtist} setBatchAdminArtist={setBatchAdminArtist}
          uploading={uploading} uploadResults={uploadResults} setUploadResults={setUploadResults}
          onBulkUploadFiles={handleBulkUploadFiles} onUpdateBulkItemTitle={updateBulkItemTitle}
          onUpdateBulkItemArtist={updateBulkItemArtist} onRemoveBulkItem={removeBulkItem}
          onApplyAdminBatchArtist={applyAdminBatchArtist} onCleanAdminBulkTitles={cleanAdminBulkTitles}
          onSubmitBulkUpload={submitBulkUpload} />
      )}
      {activeTab === "lyrics" && (
        <LyricsTab searchQuery={searchQuery} setSearchQuery={setSearchQuery} loadingData={loadingData}
          filteredTracks={filteredTracks} tracksPage={tracksPage} tracksTotalPages={tracksTotalPages}
          setTracksPage={setTracksPage} onManageLyrics={handleManageLyrics} onDeleteLyrics={handleDeleteLyrics} />
      )}
      {activeTab === "comments" && (
        <CommentsTab searchQuery={searchQuery} setSearchQuery={setSearchQuery} loadingData={loadingData}
          filteredTracks={filteredTracks} tracksPage={tracksPage} tracksTotalPages={tracksTotalPages}
          setTracksPage={setTracksPage} onManageComments={handleManageComments} />
      )}

      {/* ─── Modals ─── */}
      <EditUserModal show={showEditUserModal} selectedUser={selectedUser}
        editFirstName={editFirstName} editLastName={editLastName} editUsername={editUsername}
        setEditFirstName={setEditFirstName} setEditLastName={setEditLastName} setEditUsername={setEditUsername}
        onClose={() => setShowEditUserModal(false)} onSubmit={submitEditUser} />

      <RoleModal show={showRoleModal} selectedUser={selectedUser} editRole={editRole}
        setEditRole={setEditRole} onClose={() => setShowRoleModal(false)} onSubmit={submitRoleChange} />

      <PasswordModal show={showPasswordModal} selectedUser={selectedUser}
        newPassword={newPassword} confirmPassword={confirmPassword} showPasswordText={showPasswordText}
        setNewPassword={setNewPassword} setConfirmPassword={setConfirmPassword} setShowPasswordText={setShowPasswordText}
        onClose={() => setShowPasswordModal(false)} onSubmit={submitPasswordReset} />

      <ModeratorModal show={showModModal} isEdit={isEditMod}
        modFirstName={modFirstName} modLastName={modLastName} modUsername={modUsername}
        modPassword={modPassword} modConfirmPassword={modConfirmPassword}
        setModFirstName={setModFirstName} setModLastName={setModLastName} setModUsername={setModUsername}
        setModPassword={setModPassword} setModConfirmPassword={setModConfirmPassword}
        onClose={() => setShowModModal(false)} onSubmit={submitModForm} />

      <ArtistModal show={showArtistModal} isEdit={isEditArtist}
        artistName={artistName} artistGenre={artistGenre}
        setArtistName={setArtistName} setArtistGenre={setArtistGenre} setArtistFile={setArtistFile}
        onClose={() => setShowArtistModal(false)} onSubmit={submitArtistForm} />

      <TrackModal show={showTrackModal} isEdit={isEditTrack}
        trackTitle={trackTitle} trackArtistId={trackArtistId} trackGenre={trackGenre}
        trackNumberInput={trackNumberInput} trackLyricsText={trackLyricsText} allArtistsList={allArtistsList}
        setTrackTitle={setTrackTitle} setTrackArtistId={setTrackArtistId} setTrackGenre={setTrackGenre}
        setTrackNumberInput={setTrackNumberInput} setTrackLyricsText={setTrackLyricsText} setTrackFile={setTrackFile}
        onClose={() => setShowTrackModal(false)} onSubmit={submitTrackForm} />

      <TrackDetailsModal show={showTrackDetailsModal} track={trackDetailsItem}
        onClose={() => setShowTrackDetailsModal(false)} />

      <PlaylistModal show={showPlaylistModal} isEdit={isEditPlaylist}
        playlistTitle={playlistTitle} playlistDescription={playlistDescription}
        setPlaylistTitle={setPlaylistTitle} setPlaylistDescription={setPlaylistDescription} setPlaylistFile={setPlaylistFile}
        onClose={() => setShowPlaylistModal(false)} onSubmit={submitPlaylistForm} />

      <PlaylistDetailModal show={showPlaylistDetailModal} selectedPlaylist={selectedPlaylist}
        loadingPlaylistDetails={loadingPlaylistDetails} filteredAvailableTracks={filteredAvailableTracks}
        allArtistsList={allArtistsList} searchTrackQuery={searchTrackQuery} setSearchTrackQuery={setSearchTrackQuery}
        selectedGenreFilter={selectedGenreFilter} setSelectedGenreFilter={setSelectedGenreFilter}
        selectedArtistFilter={selectedArtistFilter} setSelectedArtistFilter={setSelectedArtistFilter}
        checkedTrackIds={checkedTrackIds} setCheckedTrackIds={setCheckedTrackIds}
        isBulkAdding={isBulkAdding} draggedIndex={draggedIndex} setDraggedIndex={setDraggedIndex}
        onClose={() => setShowPlaylistDetailModal(false)} onAddMusic={handleAddMusicToPlaylist}
        onBulkAddMusic={handleBulkAddMusicToPlaylist} onRemoveMusic={handleRemoveMusicFromPlaylist}
        onReorderMusic={handleReorderPlaylistMusic} onDragStart={handleDragStart}
        onDragOver={handleDragOver} onDrop={handleDrop} />

      <LyricsModal show={showLyricsModal} selectedTrack={selectedTrackForLyrics} lyricsId={lyricsId}
        lyricsText={lyricsText} lyricsLanguage={lyricsLanguage} lyricsIsSynced={lyricsIsSynced} lyricsLrcContent={lyricsLrcContent}
        setLyricsText={setLyricsText} setLyricsLanguage={setLyricsLanguage} setLyricsIsSynced={setLyricsIsSynced} setLyricsLrcContent={setLyricsLrcContent}
        onClose={() => setShowLyricsModal(false)} onSubmit={submitLyricsForm} />

      <CommentsModal show={showCommentsModal} selectedTrack={selectedTrackForComments}
        commentsList={commentsList} loadingComments={loadingComments}
        newCommentText={newCommentText} editingCommentId={editingCommentId} editingCommentText={editingCommentText}
        setNewCommentText={setNewCommentText} setEditingCommentId={setEditingCommentId} setEditingCommentText={setEditingCommentText}
        onClose={() => setShowCommentsModal(false)} onSubmitNew={submitNewComment}
        onSubmitEdit={submitEditComment} onDeleteComment={handleDeleteComment} />
    </div>
  );
}
