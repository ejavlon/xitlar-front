"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "../../stores/auth-store";
import { usePlayerStore } from "../../stores/player-store";
import { mapMusicToTrack } from "../../repositories/music.repository";
import { formatDuration } from "../../lib/formatters";
import { api, ApiError, buildMediaUrl, DEFAULT_AVATAR, DEFAULT_PLAYLIST_COVER } from "../../lib/api/client";
import {
  Users,
  Shield,
  UploadCloud,
  UserPlus,
  Edit2,
  Trash2,
  Key,
  ShieldCheck,
  Lock,
  Loader2,
  Search,
  CheckCircle,
  XCircle,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  Music,
  Mic2,
  ListMusic,
  ChevronLeft,
  ChevronRight,
  Upload,
  ArrowUp,
  ArrowDown,
  Play,
  Pause,
  Heart,
  HeartCrack,
  MessageSquare,
  FileText
} from "lucide-react";

// Types
interface AppUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: "USER" | "MODERATOR" | "ADMIN";
}

interface Moderator {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: "MODERATOR";
}

interface BackendCommentResponse {
  id: number;
  text: string;
  createdAt: string;
  musicId: number;
  userId: number;
  userName: string;
}

import { cn } from "../../lib/utils";
import {
  BackendImageResponse as ImageResponse,
  BackendArtistResponse as ArtistResponse,
  BackendMusicResponse as MusicResponse,
  BackendPlaylistMusicResponse as PlaylistMusicResponse,
  BackendPlaylistResponse as PlaylistResponse,
  BackendPageableResponse as PageableResponse,
  BackendLyricsResponse as LyricsResponse
} from "../../types/backend";

const AVAILABLE_GENRES = [
  { value: "POP", label: "Pop" },
  { value: "ROCK", label: "Rock" },
  { value: "HIP_HOP", label: "Hip-Hop" },
  { value: "RAP", label: "Rap" },
  { value: "JAZZ", label: "Jazz" },
  { value: "CLASSICAL", label: "Classical" },
  { value: "ELECTRONIC", label: "Electronic" },
  { value: "R_AND_B", label: "R&B" },
  { value: "K_POP", label: "K-Pop" },
  { value: "OTHER", label: "Other" }
];

function TableAudioPlayer({ track }: { track: MusicResponse }) {
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  const isCurrent = currentTrack?.id === String(track.id);
  const isThisPlaying = isCurrent && isPlaying;

  const handlePlayClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      const mappedTrack = mapMusicToTrack(track);
      playTrack(mappedTrack, [mappedTrack]);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl p-1.5 w-[110px] shadow-2xs select-none">
      <button
        onClick={handlePlayClick}
        type="button"
        className="w-7 h-7 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-2xs focus:outline-none hover:scale-105 active:scale-95"
      >
        {isThisPlaying ? (
          <Pause className="w-3.5 h-3.5 fill-current" />
        ) : (
          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
        )}
      </button>
      <div className="flex-1 flex flex-col justify-center min-w-0 pr-1">
        <span className="text-[10px] text-slate-500 font-bold leading-none">
          {isThisPlaying ? "Playing" : "Audio"}
        </span>
        <span className="text-[9px] text-slate-400 font-mono mt-1 leading-none">
          {formatDuration(track.duration || 0, true)}
        </span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Tabs
  const validTabs = ["users", "moderators", "artists", "tracks", "playlists", "upload", "lyrics", "comments"] as const;
  type TabType = typeof validTabs[number];

  const rawTab = searchParams?.get("tab");
  
  // Determine activeTab dynamically from URL and user role
  let activeTab: TabType = "users";
  if (user?.role === "MODERATOR") {
    activeTab = "artists";
  }
  if (rawTab && validTabs.includes(rawTab as any)) {
    if (user?.role === "MODERATOR" && (rawTab === "users" || rawTab === "moderators")) {
      activeTab = "artists";
    } else {
      activeTab = rawTab as TabType;
    }
  }

  // Helper function to change tab updates search params
  const handleTabChange = (tab: TabType) => {
    setErrorMsg("");
    setSuccessMsg("");
    setSearchQuery("");
    router.push(`/admin?tab=${tab}`, { scroll: false });
  };

  // Data states
  const [usersList, setUsersList] = useState<AppUser[]>([]);
  const [moderatorsList, setModeratorsList] = useState<Moderator[]>([]);
  const [artistsList, setArtistsList] = useState<ArtistResponse[]>([]);
  const [tracksList, setTracksList] = useState<MusicResponse[]>([]);
  const [playlistsList, setPlaylistsList] = useState<PlaylistResponse[]>([]);

  // Selection Lists for Dropdowns
  const [allArtistsList, setAllArtistsList] = useState<ArtistResponse[]>([]);
  const [allTracksList, setAllTracksList] = useState<MusicResponse[]>([]);

  // Paging states
  const [artistsPage, setArtistsPage] = useState(0);
  const [artistsTotalPages, setArtistsTotalPages] = useState(1);
  const [tracksPage, setTracksPage] = useState(0);
  const [tracksTotalPages, setTracksTotalPages] = useState(1);
  const [playlistsPage, setPlaylistsPage] = useState(0);
  const [playlistsTotalPages, setPlaylistsTotalPages] = useState(1);

  // Loading / Messages
  const [loadingData, setLoadingData] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Search filter (client-side matching current view)
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Form States
  // 1. Users
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

  // 2. Moderators
  const [showModModal, setShowModModal] = useState(false);
  const [isEditMod, setIsEditMod] = useState(false);
  const [selectedMod, setSelectedMod] = useState<Moderator | null>(null);
  const [modFirstName, setModFirstName] = useState("");
  const [modLastName, setModLastName] = useState("");
  const [modUsername, setModUsername] = useState("");
  const [modPassword, setModPassword] = useState("");
  const [modConfirmPassword, setModConfirmPassword] = useState("");

  // 3. Artists
  const [showArtistModal, setShowArtistModal] = useState(false);
  const [isEditArtist, setIsEditArtist] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<ArtistResponse | null>(null);
  const [artistName, setArtistName] = useState("");
  const [artistGenre, setArtistGenre] = useState("POP");
  const [artistFile, setArtistFile] = useState<File | null>(null);

  // 4. Tracks
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [isEditTrack, setIsEditTrack] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<MusicResponse | null>(null);
  const [trackTitle, setTrackTitle] = useState("");
  const [trackArtistId, setTrackArtistId] = useState("");
  const [trackGenre, setTrackGenre] = useState("POP");
  const [trackNumberInput, setTrackNumberInput] = useState("");
  const [trackLyricsText, setTrackLyricsText] = useState("");
  const [trackFile, setTrackFile] = useState<File | null>(null);

  // 5. Playlists
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [isEditPlaylist, setIsEditPlaylist] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<PlaylistResponse | null>(null);
  const [playlistTitle, setPlaylistTitle] = useState("");
  const [playlistDescription, setPlaylistDescription] = useState("");
  const [playlistFile, setPlaylistFile] = useState<File | null>(null);

  // 6. Playlist Music Management Details Modal
  const [showPlaylistDetailModal, setShowPlaylistDetailModal] = useState(false);
  const [playlistMusicToAdd, setPlaylistMusicToAdd] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [loadingPlaylistDetails, setLoadingPlaylistDetails] = useState(false);
  
  // Track adding panel states
  const [searchTrackQuery, setSearchTrackQuery] = useState("");
  const [selectedGenreFilter, setSelectedGenreFilter] = useState("");
  const [selectedArtistFilter, setSelectedArtistFilter] = useState("");
  const [checkedTrackIds, setCheckedTrackIds] = useState<number[]>([]);
  const [isBulkAdding, setIsBulkAdding] = useState(false);

  // 8. Track Details Modal
  const [showTrackDetailsModal, setShowTrackDetailsModal] = useState(false);
  const [trackDetailsItem, setTrackDetailsItem] = useState<MusicResponse | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = async (index: number) => {
    if (draggedIndex === null || draggedIndex === index || !selectedPlaylist || !selectedPlaylist.musics) return;

    const musics = [...selectedPlaylist.musics];
    const draggedItem = musics[draggedIndex];

    // Remove item from old position
    musics.splice(draggedIndex, 1);
    // Insert item at new position
    musics.splice(index, 0, draggedItem);

    // Optimistic UI updates
    const updatedPlaylistWithDragged = { ...selectedPlaylist, musics };
    setSelectedPlaylist(updatedPlaylistWithDragged);

    setErrorMsg("");
    setSuccessMsg("");
    try {
      const musicIds = musics.map((m) => Number(m.id));
      const updatedPlaylist = await api.put<PlaylistResponse>(
        `/api/v1/playlists/${selectedPlaylist.id}/musics/reorder`,
        { musicIds }
      );
      setSelectedPlaylist(updatedPlaylist);
      setSuccessMsg("Tracks reordered successfully.");
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reorder tracks.");
      // Rollback
      setSelectedPlaylist(selectedPlaylist);
    } finally {
      setDraggedIndex(null);
    }
  };

  // 7. Bulk Upload States
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<any[]>([]);

  // 8. Lyrics Modal & Form State
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [selectedTrackForLyrics, setSelectedTrackForLyrics] = useState<MusicResponse | null>(null);
  const [lyricsId, setLyricsId] = useState<number | null>(null);
  const [lyricsText, setLyricsText] = useState("");
  const [lyricsLanguage, setLyricsLanguage] = useState("uz");
  const [lyricsIsSynced, setLyricsIsSynced] = useState(false);
  const [lyricsLrcContent, setLyricsLrcContent] = useState("");

  // 9. Comments Modal & Form State
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedTrackForComments, setSelectedTrackForComments] = useState<MusicResponse | null>(null);
  const [commentsList, setCommentsList] = useState<BackendCommentResponse[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Load data based on active tab
  const loadData = async () => {
    if (!isAuthorized) return;
    setLoadingData(true);
    setErrorMsg("");
    try {
      if (activeTab === "users") {
        const data = await api.get<AppUser[]>("/api/v1/users");
        setUsersList(data || []);
      } else if (activeTab === "moderators" && isAdmin) {
        const data = await api.get<Moderator[]>("/api/v1/moderators");
        setModeratorsList(data || []);
      } else if (activeTab === "artists") {
        const res = await api.get<PageableResponse<ArtistResponse>>(
          `/api/v1/artists?page=${artistsPage}&size=10&sortBy=id&sortDirection=desc`
        );
        setArtistsList(res.content || []);
        setArtistsTotalPages(res.totalPages || 1);
      } else if (activeTab === "tracks" || activeTab === "lyrics" || activeTab === "comments") {
        const res = await api.get<PageableResponse<MusicResponse>>(
          `/api/v1/musics?page=${tracksPage}&size=10&sortBy=id&sortDirection=desc`
        );
        setTracksList(res.content || []);
        setTracksTotalPages(res.totalPages || 1);
      } else if (activeTab === "playlists") {
        const res = await api.get<PageableResponse<PlaylistResponse>>(
          `/api/v1/playlists?page=${playlistsPage}&size=10&sortBy=id&sortDirection=desc`
        );
        setPlaylistsList(res.content || []);
        setPlaylistsTotalPages(res.totalPages || 1);
      }
    } catch (err: any) {
      console.error("Failed to load admin panel data:", err);
      setErrorMsg(err.message || "Failed to load database items.");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (mounted && isAuthorized) {
      loadData();
    }
  }, [mounted, activeTab, artistsPage, tracksPage, playlistsPage, isAuthenticated]);
  if (!mounted || !isInitialized) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#365377]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center font-sans select-none animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-5 shadow-2xs border border-slate-200">
          <Lock className="w-6 h-6 text-slate-400" />
        </div>
        <h1 className="text-xl font-bold text-slate-850 mb-2">Access Restrained</h1>
        <p className="text-xs text-slate-500 max-w-[360px] mb-6 leading-relaxed">
          Please sign in with an Administrator or Moderator account to access the Control Panel.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="h-[36px] px-6 rounded-full bg-[#365377] hover:bg-[#284160] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer focus:outline-none"
        >
          Sign In
        </button>
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
        <p className="text-xs text-red-500 max-w-[420px] mb-6 leading-relaxed">
          You are not authorized to view the management area. Role permissions required: ADMIN or MODERATOR.
        </p>
        <button
          onClick={() => router.push("/")}
          className="h-[36px] px-6 rounded-full border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-semibold shadow-2xs transition-colors cursor-pointer focus:outline-none bg-white"
        >
          Return Home
        </button>
      </div>
    );
  }

  // ======================== ACTION HANDLERS ========================

  // 1. Users Actions
  const handleEditUser = (usr: AppUser) => {
    setSelectedUser(usr);
    setEditFirstName(usr.firstName);
    setEditLastName(usr.lastName);
    setEditUsername(usr.username);
    setShowEditUserModal(true);
  };

  const submitEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await api.put(`/api/v1/users/${selectedUser.id}`, {
        firstName: editFirstName,
        lastName: editLastName,
        username: editUsername
      });
      setSuccessMsg("User details successfully updated!");
      setShowEditUserModal(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update user. Try again.");
    }
  };

  const handleEditRole = (usr: AppUser) => {
    setSelectedUser(usr);
    setEditRole(usr.role);
    setShowRoleModal(true);
  };

  const submitRoleChange = async () => {
    if (!selectedUser) return;
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await api.put(`/api/v1/users/${selectedUser.id}/role`, {
        role: editRole
      });
      setSuccessMsg("User role successfully updated!");
      setShowRoleModal(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update user role.");
    }
  };

  const handleResetPassword = (usr: AppUser) => {
    setSelectedUser(usr);
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordModal(true);
  };

  const submitPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await api.put(`/api/v1/users/${selectedUser.id}/password`, {
        newPassword
      });
      setSuccessMsg("User password successfully reset!");
      setShowPasswordModal(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset password.");
    }
  };

  const handleDeleteUser = async (id: number, username: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${username}"?`)) return;
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await api.delete(`/api/v1/users/${id}`);
      setSuccessMsg("User successfully deleted.");
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete user.");
    }
  };

  // 2. Moderator Actions
  const handleCreateMod = () => {
    setIsEditMod(false);
    setSelectedMod(null);
    setModFirstName("");
    setModLastName("");
    setModUsername("");
    setModPassword("");
    setModConfirmPassword("");
    setShowModModal(true);
  };

  const handleEditMod = (mod: Moderator) => {
    setIsEditMod(true);
    setSelectedMod(mod);
    setModFirstName(mod.firstName);
    setModLastName(mod.lastName);
    setModUsername(mod.username);
    setModPassword("");
    setModConfirmPassword("");
    setShowModModal(true);
  };

  const submitModForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      if (isEditMod && selectedMod) {
        await api.put(`/api/v1/moderators/${selectedMod.id}`, {
          firstName: modFirstName,
          lastName: modLastName,
          username: modUsername
        });
        setSuccessMsg("Moderator successfully updated!");
      } else {
        if (modPassword !== modConfirmPassword) {
          setErrorMsg("Passwords do not match.");
          return;
        }
        await api.post("/api/v1/moderators", {
          firstName: modFirstName,
          lastName: modLastName,
          username: modUsername,
          password: modPassword,
          confirmPassword: modConfirmPassword
        });
        setSuccessMsg("New Moderator successfully created!");
      }
      setShowModModal(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit moderator form.");
    }
  };

  const handleDeleteMod = async (id: number, username: string) => {
    if (!confirm(`Are you sure you want to delete moderator "${username}"?`)) return;
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await api.delete(`/api/v1/moderators/${id}`);
      setSuccessMsg("Moderator successfully deleted.");
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete moderator.");
    }
  };

  const handleModPasswordReset = (mod: Moderator) => {
    setSelectedUser({
      id: mod.id,
      firstName: mod.firstName,
      lastName: mod.lastName,
      username: mod.username,
      role: "MODERATOR"
    });
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordModal(true);
  };

  // 3. Artist Actions
  const handleCreateArtist = () => {
    setIsEditArtist(false);
    setSelectedArtist(null);
    setArtistName("");
    setArtistGenre("POP");
    setArtistFile(null);
    setShowArtistModal(true);
  };

  const handleEditArtist = (art: ArtistResponse) => {
    setIsEditArtist(true);
    setSelectedArtist(art);
    setArtistName(art.name);
    setArtistGenre(art.genre || "POP");
    setArtistFile(null);
    setShowArtistModal(true);
  };

  const submitArtistForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const formData = new FormData();
      const payload = {
        name: artistName,
        genre: artistGenre
      };
      formData.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      if (artistFile) {
        formData.append("file", artistFile);
      }

      if (isEditArtist && selectedArtist) {
        await api.put(`/api/v1/artists/${selectedArtist.id}`, formData);
        setSuccessMsg("Artist details successfully updated!");
      } else {
        await api.post("/api/v1/artists", formData);
        setSuccessMsg("New Artist successfully created!");
      }
      setShowArtistModal(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit artist details.");
    }
  };

  const handleDeleteArtist = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete artist "${name}"?`)) return;
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await api.delete(`/api/v1/artists/${id}`);
      setSuccessMsg("Artist successfully deleted.");
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete artist.");
    }
  };

  // 4. Track Actions
  const handleCreateTrack = async () => {
    setIsEditTrack(false);
    setSelectedTrack(null);
    setTrackTitle("");
    setTrackArtistId("");
    setTrackGenre("POP");
    setTrackNumberInput("");
    setTrackLyricsText("");
    setTrackFile(null);
    setShowTrackModal(true);
    await loadAllArtists();
  };

  const handleEditTrack = async (trk: MusicResponse) => {
    setIsEditTrack(true);
    setSelectedTrack(trk);
    setTrackTitle(trk.title);
    setTrackArtistId(trk.artist ? String(trk.artist.id) : "");
    setTrackGenre(trk.genre || "POP");
    setTrackNumberInput(trk.trackNumber ? String(trk.trackNumber) : "");
    setTrackLyricsText("");
    setTrackFile(null);
    setShowTrackModal(true);
    await loadAllArtists();
  };

  const loadAllArtists = async () => {
    try {
      const res = await api.get<PageableResponse<ArtistResponse>>("/api/v1/artists?page=0&size=100");
      setAllArtistsList(res.content || []);
    } catch (err) {
      console.error("Failed to load artists selector list:", err);
    }
  };

  const submitTrackForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditTrack && !trackFile) {
      setErrorMsg("Audio file is required for new tracks.");
      return;
    }
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const formData = new FormData();
      const payload: any = {
        title: trackTitle,
        artistId: trackArtistId ? Number(trackArtistId) : null,
        genre: trackGenre,
        trackNumber: trackNumberInput ? Number(trackNumberInput) : null
      };

      if (!isEditTrack && trackLyricsText) {
        payload.lyrics = { text: trackLyricsText };
      }

      formData.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      if (trackFile) {
        formData.append("file", trackFile);
      }

      if (isEditTrack && selectedTrack) {
        await api.put(`/api/v1/musics/${selectedTrack.id}`, formData);
        setSuccessMsg("Track details successfully updated!");
      } else {
        await api.post("/api/v1/musics", formData);
        setSuccessMsg("New Track successfully uploaded!");
      }
      setShowTrackModal(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit track details.");
    }
  };

  const handleDeleteTrack = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete track "${title}"?`)) return;
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await api.delete(`/api/v1/musics/${id}`);
      setSuccessMsg("Track successfully deleted.");
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete track.");
    }
  };

  // 5. Playlist Actions
  const handleCreatePlaylist = () => {
    setIsEditPlaylist(false);
    setSelectedPlaylist(null);
    setPlaylistTitle("");
    setPlaylistDescription("");
    setPlaylistFile(null);
    setShowPlaylistModal(true);
  };

  const handleEditPlaylist = (pl: PlaylistResponse) => {
    setIsEditPlaylist(true);
    setSelectedPlaylist(pl);
    setPlaylistTitle(pl.title);
    setPlaylistDescription(pl.description || "");
    setPlaylistFile(null);
    setShowPlaylistModal(true);
  };

  const submitPlaylistForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const formData = new FormData();
      const payload = {
        title: playlistTitle,
        description: playlistDescription
      };
      formData.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));
      if (playlistFile) {
        formData.append("file", playlistFile);
      }

      if (isEditPlaylist && selectedPlaylist) {
        await api.put(`/api/v1/playlists/${selectedPlaylist.id}`, formData);
        setSuccessMsg("Playlist details successfully updated!");
      } else {
        await api.post("/api/v1/playlists", formData);
        setSuccessMsg("New Playlist successfully created!");
      }
      setShowPlaylistModal(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit playlist form.");
    }
  };

  const handleDeletePlaylist = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete playlist "${title}"?`)) return;
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await api.delete(`/api/v1/playlists/${id}`);
      setSuccessMsg("Playlist successfully deleted.");
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete playlist.");
    }
  };

  // 6. Playlist Music Management Details Modal
  const handlePlaylistDetails = async (pl: PlaylistResponse) => {
    setSelectedPlaylist(pl);
    setShowPlaylistDetailModal(true);
    setErrorMsg("");
    setSuccessMsg("");
    setPlaylistMusicToAdd("");
    setLoadingPlaylistDetails(true);
    try {
      const [fullPlaylist, res, artistsRes] = await Promise.all([
        api.get<PlaylistResponse>(`/api/v1/playlists/${pl.id}`),
        api.get<PageableResponse<MusicResponse>>("/api/v1/musics?page=0&size=100"),
        api.get<PageableResponse<ArtistResponse>>("/api/v1/artists?page=0&size=100")
      ]);
      setSelectedPlaylist(fullPlaylist);
      setAllTracksList(res.content || []);
      setAllArtistsList(artistsRes.content || []);
    } catch (err: any) {
      console.error("Failed to load playlist details or tracks selector list:", err);
      setErrorMsg(err.message || "Failed to load playlist details.");
    } finally {
      setLoadingPlaylistDetails(false);
    }
  };

  // 8. Lyrics Actions
  const handleManageLyrics = (trk: MusicResponse) => {
    setSelectedTrackForLyrics(trk);
    if (trk.lyrics) {
      setLyricsId(trk.lyrics.id);
      setLyricsText(trk.lyrics.text || "");
      setLyricsLanguage(trk.lyrics.language || "uz");
      setLyricsIsSynced(trk.lyrics.isSynced || false);
      setLyricsLrcContent(trk.lyrics.lrcContent || "");
    } else {
      setLyricsId(null);
      setLyricsText("");
      setLyricsLanguage("uz");
      setLyricsIsSynced(false);
      setLyricsLrcContent("");
    }
    setErrorMsg("");
    setSuccessMsg("");
    setShowLyricsModal(true);
  };

  const submitLyricsForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrackForLyrics) return;
    if (!lyricsText.trim()) {
      setErrorMsg("Lyrics text cannot be empty.");
      return;
    }
    setErrorMsg("");
    setSuccessMsg("");
    try {
      if (lyricsId) {
        await api.put(`/api/v1/lyrics/${lyricsId}`, {
          text: lyricsText,
          language: lyricsLanguage,
          isSynced: lyricsIsSynced,
          lrcContent: lyricsLrcContent
        });
        setSuccessMsg("Lyrics successfully updated!");
      } else {
        await api.post("/api/v1/lyrics", {
          musicId: selectedTrackForLyrics.id,
          text: lyricsText,
          language: lyricsLanguage,
          isSynced: lyricsIsSynced,
          lrcContent: lyricsLrcContent
        });
        setSuccessMsg("Lyrics successfully added!");
      }
      setShowLyricsModal(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit lyrics.");
    }
  };

  const handleDeleteLyrics = async (trk: MusicResponse) => {
    if (!trk.lyrics) return;
    if (!confirm(`Are you sure you want to delete lyrics for "${trk.title}"?`)) return;
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await api.delete(`/api/v1/lyrics/${trk.lyrics.id}`);
      setSuccessMsg("Lyrics successfully deleted.");
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete lyrics.");
    }
  };

  // 9. Comments Actions
  const handleManageComments = async (trk: MusicResponse) => {
    setSelectedTrackForComments(trk);
    setNewCommentText("");
    setEditingCommentId(null);
    setEditingCommentText("");
    setErrorMsg("");
    setSuccessMsg("");
    setShowCommentsModal(true);
    setLoadingComments(true);
    try {
      const res = await api.get<PageableResponse<BackendCommentResponse>>(
        `/api/v1/comments/music/${trk.id}?page=0&size=50&sortBy=id&sortDirection=desc`
      );
      setCommentsList(res.content || []);
    } catch (err: any) {
      console.error("Failed to load comments:", err);
      setErrorMsg(err.message || "Failed to load comments.");
    } finally {
      setLoadingComments(false);
    }
  };

  const submitNewComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrackForComments || !newCommentText.trim()) return;
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await api.post<BackendCommentResponse>("/api/v1/comments", {
        text: newCommentText.trim(),
        musicId: selectedTrackForComments.id
      });
      setNewCommentText("");
      // Reload comments
      const res = await api.get<PageableResponse<BackendCommentResponse>>(
        `/api/v1/comments/music/${selectedTrackForComments.id}?page=0&size=50&sortBy=id&sortDirection=desc`
      );
      setCommentsList(res.content || []);
      setSuccessMsg("Comment added successfully!");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to post comment.");
    }
  };

  const submitEditComment = async (commentId: number) => {
    if (!editingCommentText.trim()) return;
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await api.put(`/api/v1/comments/${commentId}`, {
        text: editingCommentText.trim()
      });
      setEditingCommentId(null);
      setEditingCommentText("");
      if (selectedTrackForComments) {
        const res = await api.get<PageableResponse<BackendCommentResponse>>(
          `/api/v1/comments/music/${selectedTrackForComments.id}?page=0&size=50&sortBy=id&sortDirection=desc`
        );
        setCommentsList(res.content || []);
      }
      setSuccessMsg("Comment updated successfully!");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update comment.");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await api.delete(`/api/v1/comments/${commentId}`);
      if (selectedTrackForComments) {
        const res = await api.get<PageableResponse<BackendCommentResponse>>(
          `/api/v1/comments/music/${selectedTrackForComments.id}?page=0&size=50&sortBy=id&sortDirection=desc`
        );
        setCommentsList(res.content || []);
      }
      setSuccessMsg("Comment deleted successfully.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to delete comment.");
    }
  };

  const handleAddMusicToPlaylist = async (musicId: number) => {
    if (!selectedPlaylist) return;
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const updatedPlaylist = await api.post<PlaylistResponse>(
        `/api/v1/playlists/${selectedPlaylist.id}/musics/${musicId}`
      );
      setSelectedPlaylist(updatedPlaylist);
      setSuccessMsg("Track added to playlist.");
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to add track to playlist.");
    }
  };

  const handleBulkAddMusicToPlaylist = async (musicIds: number[]) => {
    if (!selectedPlaylist || musicIds.length === 0) return;
    setErrorMsg("");
    setSuccessMsg("");
    setIsBulkAdding(true);
    try {
      await api.post(
        `/api/v1/playlists/${selectedPlaylist.id}/musics/bulk`,
        { musicIds }
      );
      const updatedPlaylist = await api.get<PlaylistResponse>(
        `/api/v1/playlists/${selectedPlaylist.id}`
      );
      setSelectedPlaylist(updatedPlaylist);
      setCheckedTrackIds([]);
      setSuccessMsg(`Successfully added ${musicIds.length} tracks to playlist.`);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to add selected tracks to playlist.");
    } finally {
      setIsBulkAdding(false);
    }
  };

  const handleRemoveMusicFromPlaylist = async (musicId: number) => {
    if (!selectedPlaylist) return;
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const updatedPlaylist = await api.delete<PlaylistResponse>(
        `/api/v1/playlists/${selectedPlaylist.id}/musics/${musicId}`
      );
      setSelectedPlaylist(updatedPlaylist);
      setSuccessMsg("Track removed from playlist.");
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to remove track from playlist.");
    }
  };

  const handleReorderPlaylistMusic = async (index: number, direction: "up" | "down") => {
    if (!selectedPlaylist || !selectedPlaylist.musics) return;
    const musics = [...selectedPlaylist.musics];
    if (direction === "up" && index > 0) {
      const temp = musics[index];
      musics[index] = musics[index - 1];
      musics[index - 1] = temp;
    } else if (direction === "down" && index < musics.length - 1) {
      const temp = musics[index];
      musics[index] = musics[index + 1];
      musics[index + 1] = temp;
    } else {
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    try {
      const musicIds = musics.map((m) => m.id);
      const updatedPlaylist = await api.put<PlaylistResponse>(
        `/api/v1/playlists/${selectedPlaylist.id}/musics/reorder`,
        { musicIds }
      );
      setSelectedPlaylist(updatedPlaylist);
      setSuccessMsg("Tracks reordered successfully.");
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reorder tracks.");
    }
  };

  // 7. Bulk Upload Handlers
  const handleBulkUploadFiles = (files: FileList | null) => {
    if (!files) return;
    const array = Array.from(files).filter(f => f.name.toLowerCase().endsWith(".mp3"));
    if (uploadFiles.length + array.length > 50) {
      setErrorMsg("Maximum 50 files can be uploaded at a time.");
      return;
    }
    setUploadFiles((prev) => [...prev, ...array]);
  };

  const submitBulkUpload = async () => {
    if (uploadFiles.length === 0) return;
    if (uploadFiles.length > 50) {
      setErrorMsg("Queue limit exceeded. Maximum 50 files allowed.");
      return;
    }
    setUploading(true);
    setUploadResults([]);
    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData();
    uploadFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await api.post<any>("/api/v1/musics/bulk", formData, {
        timeout: 300000
      });
      if (res) {
        setUploadResults(res.results || []);
        setSuccessMsg(`Processed ${res.successCount || 0} songs successfully.`);
        setUploadFiles([]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Bulk upload operation failed.");
    } finally {
      setUploading(false);
    }
  };

  // Client-side lists filtering based on search
  const filteredUsers = usersList.filter(u =>
    u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredModerators = moderatorsList.filter(m =>
    m.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArtists = artistsList.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.genre && a.genre.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredTracks = tracksList.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.artist?.name && t.artist.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (t.genre && t.genre.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredPlaylists = playlistsList.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Filter available tracks to display in the Add Tracks panel
  const filteredAvailableTracks = allTracksList
    .filter(t => {
      const alreadyInPlaylist = selectedPlaylist?.musics?.some(m => m.id === t.id);
      if (alreadyInPlaylist) return false;

      if (searchTrackQuery) {
        const query = searchTrackQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesArtist = t.artist?.name?.toLowerCase().includes(query) || false;
        const matchesGenre = t.genre?.toLowerCase().includes(query) || false;
        if (!matchesTitle && !matchesArtist && !matchesGenre) return false;
      }

      if (selectedGenreFilter && t.genre !== selectedGenreFilter) {
        return false;
      }

      if (selectedArtistFilter && String(t.artist?.id) !== selectedArtistFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => b.id - a.id);

  return (
    <div className="space-y-6 font-sans select-none animate-fade-in p-2 sm:p-4 max-w-[1100px] mx-auto text-slate-800">
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
        
        <button
          onClick={loadData}
          disabled={loadingData}
          className="self-start sm:self-center h-[32px] px-4 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-650 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingData && "animate-spin"}`} />
          Refresh
        </button>
      </div>

      {/* Success / Error Messages */}
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

      {/* Tabs navigation list */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        <button
          onClick={() => handleTabChange("users")}
          className={`px-4 py-2.5 text-xs sm:text-[13px] font-bold border-b-2 transition-all flex items-center gap-2 -mb-[2px] ${
            activeTab === "users"
              ? "border-indigo-600 text-indigo-600 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          Users 
        </button>

        {isAdmin && (
          <button
            onClick={() => handleTabChange("moderators")}
            className={`px-4 py-2.5 text-xs sm:text-[13px] font-bold border-b-2 transition-all flex items-center gap-2 -mb-[2px] ${
              activeTab === "moderators"
                ? "border-indigo-600 text-indigo-600 font-extrabold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Shield className="w-4 h-4" />
            Moderators
          </button>
        )}

        <button
          onClick={() => handleTabChange("artists")}
          className={`px-4 py-2.5 text-xs sm:text-[13px] font-bold border-b-2 transition-all flex items-center gap-2 -mb-[2px] ${
            activeTab === "artists"
              ? "border-indigo-600 text-indigo-600 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Mic2 className="w-4 h-4" />
          Artists
        </button>

        <button
          onClick={() => handleTabChange("tracks")}
          className={`px-4 py-2.5 text-xs sm:text-[13px] font-bold border-b-2 transition-all flex items-center gap-2 -mb-[2px] ${
            activeTab === "tracks"
              ? "border-indigo-600 text-indigo-600 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Music className="w-4 h-4" />
          Tracks
        </button>

        <button
          onClick={() => handleTabChange("playlists")}
          className={`px-4 py-2.5 text-xs sm:text-[13px] font-bold border-b-2 transition-all flex items-center gap-2 -mb-[2px] ${
            activeTab === "playlists"
              ? "border-indigo-600 text-indigo-600 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ListMusic className="w-4 h-4" />
          Playlists
        </button>

        <button
          onClick={() => handleTabChange("upload")}
          className={`px-4 py-2.5 text-xs sm:text-[13px] font-bold border-b-2 transition-all flex items-center gap-2 -mb-[2px] ${
            activeTab === "upload"
              ? "border-indigo-600 text-indigo-600 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          Bulk Upload
        </button>

        <button
          onClick={() => handleTabChange("lyrics")}
          className={`px-4 py-2.5 text-xs sm:text-[13px] font-bold border-b-2 transition-all flex items-center gap-2 -mb-[2px] ${
            activeTab === "lyrics"
              ? "border-indigo-600 text-indigo-600 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          Lyrics
        </button>

        <button
          onClick={() => handleTabChange("comments")}
          className={`px-4 py-2.5 text-xs sm:text-[13px] font-bold border-b-2 transition-all flex items-center gap-2 -mb-[2px] ${
            activeTab === "comments"
              ? "border-indigo-600 text-indigo-600 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Comments
        </button>
      </div>

      {/* Tab: Users Management */}
      {activeTab === "users" && (
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
                            onClick={() => handleEditUser(usr)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                            title="Edit details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleEditRole(usr)}
                                className="p-1.5 rounded-md hover:bg-slate-100 text-amber-600 hover:text-amber-700 transition-colors"
                                title="Change role"
                              >
                                <Shield className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleResetPassword(usr)}
                                className="p-1.5 rounded-md hover:bg-slate-100 text-blue-600 hover:text-blue-750 transition-colors"
                                title="Reset password"
                              >
                                <Key className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(usr.id, usr.username)}
                                disabled={usr.username === user?.email}
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
      )}

      {/* Tab: Moderator Management (ADMIN only) */}
      {activeTab === "moderators" && isAdmin && (
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
              onClick={handleCreateMod}
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
                            onClick={() => handleEditMod(mod)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                            title="Edit details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleModPasswordReset(mod)}
                            className="p-1.5 rounded-md hover:bg-slate-100 text-blue-600 hover:text-blue-75 transition-colors"
                            title="Reset password"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteMod(mod.id, mod.username)}
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
      )}

      {/* Tab: Artists Management */}
      {activeTab === "artists" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[36px] pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
              />
            </div>

            <button
              onClick={handleCreateArtist}
              className="h-[34px] px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Artist
            </button>
          </div>

          {loadingData ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-slate-200/80 rounded-2xl bg-white shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3.5">Image</th>
                      <th className="p-3.5">ID</th>
                      <th className="p-3.5">Name</th>
                      <th className="p-3.5">Genre</th>
                      <th className="p-3.5">Tracks</th>
                      <th className="p-3.5">Rating</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredArtists.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400 font-medium">
                          No artists found.
                        </td>
                      </tr>
                    ) : (
                      filteredArtists.map((art) => (
                        <tr key={art.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3.5">
                            <img
                              src={art.image ? buildMediaUrl(art.image.url) : DEFAULT_AVATAR}
                              alt={art.name}
                              className="w-8 h-8 rounded-full object-cover border border-slate-100 shadow-2xs"
                            />
                          </td>
                          <td className="p-3.5 font-mono text-slate-400">{art.id}</td>
                          <td className="p-3.5 font-semibold text-slate-850">{art.name}</td>
                          <td className="p-3.5 text-slate-650">{art.genre}</td>
                          <td className="p-3.5 text-slate-500 font-medium">{art.countOfTrack || 0}</td>
                          <td className="p-3.5 text-slate-500 font-medium">⭐ {art.averageRating ? art.averageRating.toFixed(1) : "0.0"}</td>
                          <td className="p-3.5 text-right space-x-1.5">
                            <button
                              onClick={() => handleEditArtist(art)}
                              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                              title="Edit details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteArtist(art.id, art.name)}
                              className="p-1.5 rounded-md hover:bg-red-50 text-red-500 hover:text-red-650 transition-colors"
                              title="Delete artist"
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

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="text-xs text-slate-450">
                  Page <span className="font-bold text-slate-700">{artistsPage + 1}</span> of <span className="font-bold text-slate-700">{artistsTotalPages}</span>
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={artistsPage === 0}
                    onClick={() => setArtistsPage(prev => Math.max(prev - 1, 0))}
                    className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 cursor-pointer disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={artistsPage >= artistsTotalPages - 1}
                    onClick={() => setArtistsPage(prev => prev + 1)}
                    className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 cursor-pointer disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Tracks Management */}
      {activeTab === "tracks" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tracks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[36px] pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
              />
            </div>

            <button
              onClick={handleCreateTrack}
              className="h-[34px] px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Single Upload
            </button>
          </div>

          {loadingData ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-slate-200/80 rounded-2xl bg-white shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3.5">ID</th>
                      <th className="p-3.5">Title</th>
                      <th className="p-3.5">Artist</th>
                      <th className="p-3.5">Genre</th>
                      <th className="p-3.5">Likes / Dislikes</th>
                      <th className="p-3.5">Audio</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTracks.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400 font-medium">
                          No tracks found.
                        </td>
                      </tr>
                    ) : (
                      filteredTracks.map((trk) => (
                        <tr key={trk.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3.5 font-mono text-slate-400">{trk.id}</td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-slate-200/60 bg-slate-50 flex items-center justify-center shadow-2xs">
                                {trk.artist?.image ? (
                                  <img
                                    src={buildMediaUrl(trk.artist.image.url)}
                                    alt={trk.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Music className="w-4 h-4 text-slate-450" />
                                )}
                              </div>
                              <span
                                className="font-bold text-slate-850 text-[13px] hover:text-indigo-600 transition-colors cursor-pointer"
                                onClick={() => {
                                  setTrackDetailsItem(trk);
                                  setShowTrackDetailsModal(true);
                                }}
                              >
                                {trk.title}
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5">
                            {trk.artist ? (
                              <span className="font-semibold text-slate-700">
                                {trk.artist.name}
                              </span>
                            ) : (
                              <span className="text-slate-450 font-medium">—</span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-650 border border-slate-200/50">
                              {trk.genre || "Pop"}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-red-500 bg-red-50/50 border border-red-100/60 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                                <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                                <span>{trk.likeCount || 0}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-500 bg-slate-50/50 border border-slate-200/60 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                                <HeartCrack className="w-3 h-3 text-slate-405" />
                                <span>{trk.dislikeCount || 0}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <TableAudioPlayer track={trk} />
                          </td>
                          <td className="p-3.5 whitespace-nowrap min-w-[125px]">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setTrackDetailsItem(trk);
                                  setShowTrackDetailsModal(true);
                                }}
                                className="p-1.5 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 text-indigo-650 border border-slate-200/50 transition-all cursor-pointer bg-white"
                                title="View details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditTrack(trk)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-slate-900 text-slate-650 border border-slate-200/50 transition-all cursor-pointer bg-white"
                                title="Edit details"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTrack(trk.id, trk.title)}
                                className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-650 text-red-500 border border-slate-200/50 transition-all cursor-pointer bg-white"
                                title="Delete track"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="text-xs text-slate-450">
                  Page <span className="font-bold text-slate-700">{tracksPage + 1}</span> of <span className="font-bold text-slate-700">{tracksTotalPages}</span>
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={tracksPage === 0}
                    onClick={() => setTracksPage(prev => Math.max(prev - 1, 0))}
                    className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 cursor-pointer disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={tracksPage >= tracksTotalPages - 1}
                    onClick={() => setTracksPage(prev => prev + 1)}
                    className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 cursor-pointer disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Playlists Management */}
      {activeTab === "playlists" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search playlists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[36px] pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
              />
            </div>

            <button
              onClick={handleCreatePlaylist}
              className="h-[34px] px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Playlist
            </button>
          </div>

          {loadingData ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-slate-200/80 rounded-2xl bg-white shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3.5">Cover</th>
                      <th className="p-3.5">ID</th>
                      <th className="p-3.5">Title</th>
                      <th className="p-3.5">Description</th>
                      <th className="p-3.5">Tracks Count</th>
                      <th className="p-3.5">Created By</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPlaylists.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400 font-medium">
                          No playlists found.
                        </td>
                      </tr>
                    ) : (
                      filteredPlaylists.map((pl) => (
                        <tr key={pl.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3.5">
                            <img
                              src={pl.image ? buildMediaUrl(pl.image.url) : DEFAULT_PLAYLIST_COVER}
                              alt={pl.title}
                              className="w-8 h-8 rounded-lg object-cover border border-slate-100 shadow-2xs"
                            />
                          </td>
                          <td className="p-3.5 font-mono text-slate-400">{pl.id}</td>
                          <td className="p-3.5 font-semibold text-slate-850">{pl.title}</td>
                          <td className="p-3.5 text-slate-500 max-w-[180px] truncate">{pl.description || "—"}</td>
                          <td className="p-3.5 text-slate-650 font-semibold">{pl.trackCount || 0}</td>
                          <td className="p-3.5 text-slate-500 font-medium">
                            {pl.createdBy ? `@${pl.createdBy.username}` : "System"}
                          </td>
                          <td className="p-3.5 text-right space-x-1.5">
                            <button
                              onClick={() => handlePlaylistDetails(pl)}
                              className="p-1.5 rounded-md hover:bg-slate-100 text-indigo-650 hover:text-indigo-800 transition-colors font-bold text-[11px]"
                              title="Manage Tracks"
                            >
                              Manage Tracks
                            </button>
                            <button
                              onClick={() => handleEditPlaylist(pl)}
                              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                              title="Edit details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeletePlaylist(pl.id, pl.title)}
                              className="p-1.5 rounded-md hover:bg-red-50 text-red-500 hover:text-red-650 transition-colors"
                              title="Delete playlist"
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

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="text-xs text-slate-450">
                  Page <span className="font-bold text-slate-700">{playlistsPage + 1}</span> of <span className="font-bold text-slate-700">{playlistsTotalPages}</span>
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={playlistsPage === 0}
                    onClick={() => setPlaylistsPage(prev => Math.max(prev - 1, 0))}
                    className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 cursor-pointer disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={playlistsPage >= playlistsTotalPages - 1}
                    onClick={() => setPlaylistsPage(prev => prev + 1)}
                    className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 cursor-pointer disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Bulk Upload */}
      {activeTab === "upload" && (
        <div className="space-y-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div>
            <h2 className="text-base font-bold text-slate-850 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-600" />
              Direct Bulk Upload Dashboard
            </h2>
            <p className="text-xs text-slate-450 mt-0.5">
              Select files to upload directly via backend bulk processing (Maximum 50 files allowed).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100/50 rounded-xl p-8 flex flex-col items-center justify-center text-center">
              <input
                type="file"
                multiple
                accept=".mp3"
                onChange={(e) => handleBulkUploadFiles(e.target.files)}
                className="hidden"
                id="panel-file-picker"
              />
              <UploadCloud className="w-10 h-10 text-slate-400 mb-3" />
              <p className="text-xs font-semibold text-slate-700 mb-2">Drag and drop MP3 tracks here</p>
              <label
                htmlFor="panel-file-picker"
                className="h-[30px] px-4 rounded-full border border-slate-350 bg-white hover:border-indigo-650 hover:text-indigo-650 text-slate-850 text-[11px] font-bold shadow-2xs transition-all flex items-center justify-center cursor-pointer select-none"
              >
                Choose files
              </label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Queue ({uploadFiles.length} files)</span>
                {uploadFiles.length > 0 && (
                  <button
                    onClick={() => setUploadFiles([])}
                    className="text-xs text-red-500 hover:text-red-650 hover:underline font-bold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="h-[120px] overflow-y-auto border border-slate-150 rounded-xl bg-white divide-y divide-slate-100">
                {uploadFiles.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400 font-medium">
                    Queue is empty.
                  </div>
                ) : (
                  uploadFiles.map((file, i) => (
                    <div key={`${file.name}-${i}`} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50">
                      <span className="truncate pr-4 font-medium text-slate-700" title={file.name}>
                        {file.name}
                      </span>
                      <button
                        onClick={() => setUploadFiles((p) => p.filter((_, idx) => idx !== i))}
                        className="text-slate-400 hover:text-red-500 p-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={submitBulkUpload}
                disabled={uploading || uploadFiles.length === 0}
                className="w-full h-[38px] bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading tracks...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    Upload Queue ({uploadFiles.length})
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results list */}
          {uploadResults.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-700">Upload Status Report</h3>
              <div className="max-h-[200px] overflow-y-auto border border-slate-200 rounded-xl bg-white divide-y divide-slate-100">
                {uploadResults.map((r, idx) => (
                  <div key={idx} className="p-3 flex items-start gap-2.5 text-xs hover:bg-slate-50">
                    {r.status === "SUCCESS" ? (
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <div className="font-semibold text-slate-700">{r.fileName}</div>
                      <div className={`text-[10px] font-bold ${r.status === "SUCCESS" ? "text-emerald-600" : "text-rose-500"}`}>
                        {r.status} {r.musicId && `(Music ID: ${r.musicId})`} {r.error && `- ${r.error}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Lyrics Management */}
      {activeTab === "lyrics" && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tracks by title/artist..."
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
            <div className="space-y-4">
              <div className="overflow-x-auto border border-slate-200/80 rounded-2xl bg-white shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3.5">ID</th>
                      <th className="p-3.5">Title</th>
                      <th className="p-3.5">Artist</th>
                      <th className="p-3.5">Genre</th>
                      <th className="p-3.5">Lyrics Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTracks.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400 font-medium">
                          No tracks found.
                        </td>
                      </tr>
                    ) : (
                      filteredTracks.map((trk) => (
                        <tr key={trk.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3.5 font-mono text-slate-400">{trk.id}</td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-850 text-[13px]">{trk.title}</span>
                          </td>
                          <td className="p-3.5 text-slate-650 font-semibold">{trk.artist?.name || "—"}</td>
                          <td className="p-3.5">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-650 border border-slate-200/50">
                              {trk.genre || "Pop"}
                            </span>
                          </td>
                          <td className="p-3.5">
                            {trk.lyrics ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                Has Lyrics ({trk.lyrics.language.toUpperCase()})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-450 border border-slate-200/50">
                                No Lyrics
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleManageLyrics(trk)}
                                className="px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all cursor-pointer bg-white text-indigo-650 border-slate-250 hover:bg-slate-50"
                                title={trk.lyrics ? "Edit lyrics" : "Add lyrics"}
                              >
                                {trk.lyrics ? "Edit Lyrics" : "Add Lyrics"}
                              </button>
                              {trk.lyrics && (
                                <button
                                  onClick={() => handleDeleteLyrics(trk)}
                                  className="p-1.5 rounded-md hover:bg-red-50 text-red-500 hover:text-red-650 border border-slate-200/50 transition-all cursor-pointer bg-white"
                                  title="Delete lyrics"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="text-xs text-slate-450">
                  Page <span className="font-bold text-slate-700">{tracksPage + 1}</span> of <span className="font-bold text-slate-700">{tracksTotalPages}</span>
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={tracksPage === 0}
                    onClick={() => setTracksPage(prev => Math.max(prev - 1, 0))}
                    className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 cursor-pointer disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={tracksPage >= tracksTotalPages - 1}
                    onClick={() => setTracksPage(prev => prev + 1)}
                    className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 cursor-pointer disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Comments Management */}
      {activeTab === "comments" && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tracks by title/artist..."
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
            <div className="space-y-4">
              <div className="overflow-x-auto border border-slate-200/80 rounded-2xl bg-white shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                      <th className="p-3.5">ID</th>
                      <th className="p-3.5">Title</th>
                      <th className="p-3.5">Artist</th>
                      <th className="p-3.5">Genre</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTracks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400 font-medium">
                          No tracks found.
                        </td>
                      </tr>
                    ) : (
                      filteredTracks.map((trk) => (
                        <tr key={trk.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3.5 font-mono text-slate-400">{trk.id}</td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-850 text-[13px]">{trk.title}</span>
                          </td>
                          <td className="p-3.5 text-slate-650 font-semibold">{trk.artist?.name || "—"}</td>
                          <td className="p-3.5">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-650 border border-slate-200/50">
                              {trk.genre || "Pop"}
                            </span>
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleManageComments(trk)}
                              className="px-3 py-1 rounded-md text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-650 border border-indigo-200/40 transition-all cursor-pointer"
                            >
                              Manage Comments
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="text-xs text-slate-450">
                  Page <span className="font-bold text-slate-700">{tracksPage + 1}</span> of <span className="font-bold text-slate-700">{tracksTotalPages}</span>
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={tracksPage === 0}
                    onClick={() => setTracksPage(prev => Math.max(prev - 1, 0))}
                    className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 cursor-pointer disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={tracksPage >= tracksTotalPages - 1}
                    onClick={() => setTracksPage(prev => prev + 1)}
                    className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center bg-white hover:bg-slate-50 cursor-pointer disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== MODALS ===================== */}

      {/* 1. Edit User Modal */}
      {showEditUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <form onSubmit={submitEditUser} className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900 font-sans">Edit User Details</h3>
              <button
                type="button"
                onClick={() => setShowEditUserModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm focus:outline-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Username / Phone</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEditUserModal(false)}
                className="h-[32px] px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-750 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-[32px] px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Change Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-[360px] bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900 font-sans font-extrabold">Update User Role</h3>
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm focus:outline-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose security permissions role for <span className="font-semibold text-slate-850">@{selectedUser?.username}</span>:
              </p>
              
              <div className="grid grid-cols-1 gap-2 pt-2">
                {(["USER", "MODERATOR", "ADMIN"] as const).map((rl) => (
                  <label
                    key={rl}
                    onClick={() => setEditRole(rl)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold cursor-pointer select-none transition-all ${
                      editRole === rl
                        ? "bg-indigo-50 border-indigo-400 text-indigo-650 shadow-2xs"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    <span>{rl} permissions</span>
                    <input
                      type="radio"
                      name="role-selection"
                      checked={editRole === rl}
                      onChange={() => {}}
                      className="accent-indigo-600"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="h-[32px] px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-750 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitRoleChange}
                className="h-[32px] px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Force Reset Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <form onSubmit={submitPasswordReset} className="w-full max-w-[380px] bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900 font-sans">Force Reset Password</h3>
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm focus:outline-none"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Resetting password for user: <span className="font-semibold text-slate-800">@{selectedUser?.username}</span>.
            </p>

            <div className="space-y-3">
              <div className="relative">
                <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswordText ? "text" : "password"}
                    required
                    minLength={4}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-[36px] pl-3 pr-9 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordText(!showPasswordText)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPasswordText ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Confirm New Password</label>
                <input
                  type={showPasswordText ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="h-[32px] px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-750 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-[32px] px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Reset Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Create/Edit Moderator Modal */}
      {showModModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <form onSubmit={submitModForm} className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900 font-sans">
                {isEditMod ? "Edit Moderator Details" : "Create New Moderator"}
              </h3>
              <button
                type="button"
                onClick={() => setShowModModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm focus:outline-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={modFirstName}
                  onChange={(e) => setModFirstName(e.target.value)}
                  className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={modLastName}
                  onChange={(e) => setModLastName(e.target.value)}
                  className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Username / Phone</label>
                <input
                  type="text"
                  required
                  value={modUsername}
                  onChange={(e) => setModUsername(e.target.value)}
                  className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
                />
              </div>

              {!isEditMod && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Password</label>
                    <input
                      type="password"
                      required
                      minLength={4}
                      value={modPassword}
                      onChange={(e) => setModPassword(e.target.value)}
                      className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={modConfirmPassword}
                      onChange={(e) => setModConfirmPassword(e.target.value)}
                      className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800 font-mono"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModModal(false)}
                className="h-[32px] px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-750 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-[32px] px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                {isEditMod ? "Save Changes" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. Create/Edit Artist Modal */}
      {showArtistModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <form onSubmit={submitArtistForm} className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900 font-sans">
                {isEditArtist ? "Edit Artist Details" : "Add New Artist"}
              </h3>
              <button
                type="button"
                onClick={() => setShowArtistModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm focus:outline-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Artist Name</label>
                <input
                  type="text"
                  required
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Primary Genre</label>
                <select
                  value={artistGenre}
                  onChange={(e) => setArtistGenre(e.target.value)}
                  className="w-full h-[36px] px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800 font-semibold cursor-pointer"
                >
                  {AVAILABLE_GENRES.map((g) => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">
                  Artist Avatar Image {isEditArtist && "(Optional)"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setArtistFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-indigo-50 file:text-indigo-650 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowArtistModal(false)}
                className="h-[32px] px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-750 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-[32px] px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                {isEditArtist ? "Save Changes" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. Create/Edit Track Modal */}
      {showTrackModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <form onSubmit={submitTrackForm} className="w-full max-w-[460px] bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900 font-sans">
                {isEditTrack ? "Edit Track Details" : "Upload Single Track"}
              </h3>
              <button
                type="button"
                onClick={() => setShowTrackModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm focus:outline-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Track Title</label>
                <input
                  type="text"
                  required
                  value={trackTitle}
                  onChange={(e) => setTrackTitle(e.target.value)}
                  className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
                  placeholder="e.g. Moonlight Sonata"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Artist (Optional)</label>
                <select
                  value={trackArtistId}
                  onChange={(e) => setTrackArtistId(e.target.value)}
                  className="w-full h-[36px] px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800 font-semibold cursor-pointer"
                >
                  <option value="">No Artist (Single Track)</option>
                  {allArtistsList.map((art) => (
                    <option key={art.id} value={art.id}>{art.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Genre</label>
                  <select
                    value={trackGenre}
                    onChange={(e) => setTrackGenre(e.target.value)}
                    className="w-full h-[36px] px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800 font-semibold cursor-pointer"
                  >
                    {AVAILABLE_GENRES.map((g) => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Track position / Number</label>
                  <input
                    type="number"
                    value={trackNumberInput}
                    onChange={(e) => setTrackNumberInput(e.target.value)}
                    className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
                    placeholder="e.g. 1"
                  />
                </div>
              </div>

              {!isEditTrack && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Song Lyrics (Optional)</label>
                  <textarea
                    value={trackLyricsText}
                    onChange={(e) => setTrackLyricsText(e.target.value)}
                    rows={3}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
                    placeholder="Type song lyrics here..."
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">
                  Audio file (.mp3) {!isEditTrack ? "(Required)" : "(Optional)"}
                </label>
                <input
                  type="file"
                  accept="audio/mp3, audio/mpeg"
                  required={!isEditTrack}
                  onChange={(e) => setTrackFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-indigo-50 file:text-indigo-650 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowTrackModal(false)}
                className="h-[32px] px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-750 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-[32px] px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                {isEditTrack ? "Save Changes" : "Upload Track"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Track Details Modal */}
      {showTrackDetailsModal && trackDetailsItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-[500px] bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-scale-in font-sans text-slate-805">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Track Details</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">ID: {trackDetailsItem.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowTrackDetailsModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm focus:outline-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Title</span>
                  <span className="font-semibold text-slate-800">{trackDetailsItem.title}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Artist</span>
                  <span className="font-semibold text-slate-800">{trackDetailsItem.artist?.name || "—"}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Genre</span>
                  <span className="font-semibold text-slate-800">{trackDetailsItem.genre || "—"}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Track Number</span>
                  <span className="font-semibold text-slate-800">{trackDetailsItem.trackNumber ?? "—"}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Technical Properties</h4>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                  <div>
                    <span className="text-slate-450">Format:</span>{" "}
                    <span className="font-semibold text-slate-700">{trackDetailsItem.audioFormat || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-450">Bitrate:</span>{" "}
                    <span className="font-semibold text-slate-700">{trackDetailsItem.bitrate ? `${trackDetailsItem.bitrate} kbps` : "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-450">Sample Rate:</span>{" "}
                    <span className="font-semibold text-slate-700">{trackDetailsItem.sampleRate ? `${trackDetailsItem.sampleRate} Hz` : "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-450">File Size:</span>{" "}
                    <span className="font-semibold text-slate-700">
                      {trackDetailsItem.audioSize ? `${(trackDetailsItem.audioSize / (1024 * 1024)).toFixed(2)} MB` : "—"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400">Original File Name:</span>{" "}
                    <span className="font-semibold text-slate-700 truncate block max-w-full" title={trackDetailsItem.originalFileName}>
                      {trackDetailsItem.originalFileName || "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 text-xs">
                <div>
                  <span className="text-slate-450">Date Added:</span>{" "}
                  <span className="font-semibold text-slate-700">
                    {trackDetailsItem.addedDate ? new Date(trackDetailsItem.addedDate).toLocaleString() : "—"}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <span className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Lyrics</span>
                <div className="p-3 bg-slate-50 border border-slate-150 rounded-xl max-h-[120px] overflow-y-auto text-xs text-slate-650 leading-relaxed font-mono whitespace-pre-wrap">
                  {trackDetailsItem.lyrics?.text || "No lyrics available for this track."}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowTrackDetailsModal(false)}
                className="h-[32px] px-5 bg-slate-100 hover:bg-slate-200 text-slate-750 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Create/Edit Playlist Modal */}
      {showPlaylistModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <form onSubmit={submitPlaylistForm} className="w-full max-w-[420px] bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-bold text-slate-900 font-sans">
                {isEditPlaylist ? "Edit Playlist Details" : "Create New Playlist"}
              </h3>
              <button
                type="button"
                onClick={() => setShowPlaylistModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm focus:outline-none"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Playlist Title</label>
                <input
                  type="text"
                  required
                  value={playlistTitle}
                  onChange={(e) => setPlaylistTitle(e.target.value)}
                  className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
                  placeholder="e.g. Relaxing Chill Beats"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Description</label>
                <textarea
                  value={playlistDescription}
                  onChange={(e) => setPlaylistDescription(e.target.value)}
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-800"
                  placeholder="Describe this playlist selection..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">
                  Playlist Cover Image {isEditPlaylist && "(Optional)"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPlaylistFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-indigo-50 file:text-indigo-650 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPlaylistModal(false)}
                className="h-[32px] px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-750 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-[32px] px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                {isEditPlaylist ? "Save Changes" : "Create Playlist"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 8. Playlist Music Management Details Modal */}
      {showPlaylistDetailModal && selectedPlaylist && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-[950px] bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl space-y-4 max-h-[90vh] flex flex-col font-sans">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ListMusic className="w-4.5 h-4.5 text-indigo-600" />
                  Playlist Tracks Manager: {selectedPlaylist.title}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Manage tracks, order positions, and search / bulk-add new tracks.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowPlaylistDetailModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm focus:outline-none"
              >
                ✕
              </button>
            </div>

            {/* Split View Container */}
            <div className="flex-1 flex flex-col md:flex-row gap-5 min-h-0">
              
              {/* Left Column: Playlist Tracks (current) */}
              <div className="flex-1 flex flex-col min-h-0 space-y-3">
                <div className="flex justify-between items-center shrink-0">
                  <h4 className="text-xs font-bold text-slate-700 uppercase">Tracks in Playlist ({selectedPlaylist.musics?.length || 0})</h4>
                </div>
                
                {/* Tracks list inside the playlist */}
                <div className="flex-1 overflow-y-auto border border-slate-150 rounded-xl divide-y divide-slate-100 bg-white min-h-[250px] flex flex-col">
                  {loadingPlaylistDetails ? (
                    <div className="flex-1 flex items-center justify-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    </div>
                  ) : !selectedPlaylist.musics || selectedPlaylist.musics.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-10 text-xs font-medium">
                      <Music className="w-8 h-8 text-slate-300 mb-2" />
                      Playlist is currently empty.
                    </div>
                  ) : (
                    selectedPlaylist.musics.map((pm, index) => {
                      const isDragged = draggedIndex === index;
                      return (
                        <div
                          key={pm.id}
                          draggable={true}
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDrop={() => handleDrop(index)}
                          onDragEnd={() => setDraggedIndex(null)}
                          className={cn(
                            "p-3 flex items-center justify-between text-xs hover:bg-slate-50/80 transition-all cursor-grab active:cursor-grabbing select-none border-y border-transparent",
                            isDragged && "opacity-40 bg-slate-100 border-dashed border-indigo-300",
                            draggedIndex !== null && draggedIndex !== index && "hover:border-indigo-200 hover:bg-indigo-50/20"
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                            <span className="font-mono text-slate-400 font-bold w-4">{index + 1}</span>
                            <div className="truncate">
                              <div className="font-semibold text-slate-800 truncate">{pm.title}</div>
                              <div className="text-[10px] text-slate-400 truncate">{pm.artist?.name || "—"}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {/* Ordering Arrows */}
                            <button
                              onClick={() => handleReorderPlaylistMusic(index, "up")}
                              disabled={index === 0}
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleReorderPlaylistMusic(index, "down")}
                              disabled={index === selectedPlaylist.musics!.length - 1}
                              className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleRemoveMusicFromPlaylist(pm.id)}
                              className="p-1 rounded hover:bg-red-50 text-red-500 ml-2 cursor-pointer"
                              title="Remove Track"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Add Tracks Registry */}
              <div className="flex-1 flex flex-col min-h-0 space-y-3 border-t md:border-t-0 md:border-l border-slate-150 pt-4 md:pt-0 md:pl-5">
                <div className="shrink-0 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase">Available Tracks Registry</h4>
                  
                  {/* Search and Filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <div className="col-span-1 sm:col-span-2 relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search tracks, artists, genres..."
                        value={searchTrackQuery}
                        onChange={(e) => setSearchTrackQuery(e.target.value)}
                        className="w-full h-[32px] pl-8 pr-3 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 transition-all text-slate-800"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Genre</label>
                      <select
                        value={selectedGenreFilter}
                        onChange={(e) => setSelectedGenreFilter(e.target.value)}
                        className="w-full h-[28px] px-1 bg-white border border-slate-200 rounded-md text-[11px] outline-none font-semibold cursor-pointer"
                      >
                        <option value="">All Genres</option>
                        {AVAILABLE_GENRES.map((g) => (
                          <option key={g.value} value={g.value}>{g.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Artist</label>
                      <select
                        value={selectedArtistFilter}
                        onChange={(e) => setSelectedArtistFilter(e.target.value)}
                        className="w-full h-[28px] px-1 bg-white border border-slate-200 rounded-md text-[11px] outline-none font-semibold cursor-pointer"
                      >
                        <option value="">All Artists</option>
                        {allArtistsList.map((a) => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Checkbox bulk add header controls */}
                  <div className="flex items-center justify-between text-xs font-semibold px-1 text-slate-600 h-[28px]">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={filteredAvailableTracks.length > 0 && checkedTrackIds.length === filteredAvailableTracks.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCheckedTrackIds(filteredAvailableTracks.map(t => t.id));
                          } else {
                            setCheckedTrackIds([]);
                          }
                        }}
                        className="accent-indigo-600 rounded"
                        disabled={filteredAvailableTracks.length === 0}
                      />
                      <span>Select All ({filteredAvailableTracks.length} found)</span>
                    </label>
                    
                    {checkedTrackIds.length > 0 && (
                      <button
                        type="button"
                        disabled={isBulkAdding}
                        onClick={() => handleBulkAddMusicToPlaylist(checkedTrackIds)}
                        className="h-[28px] px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isBulkAdding ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                        Add Selected ({checkedTrackIds.length})
                      </button>
                    )}
                  </div>
                </div>

                {/* Available tracks list */}
                <div className="flex-1 overflow-y-auto border border-slate-150 rounded-xl divide-y divide-slate-100 bg-white min-h-[250px] flex flex-col">
                  {loadingPlaylistDetails ? (
                    <div className="flex-1 flex items-center justify-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    </div>
                  ) : filteredAvailableTracks.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-10 text-xs font-medium">
                      <Music className="w-8 h-8 text-slate-300 mb-2" />
                      No matching tracks found.
                    </div>
                  ) : (
                    filteredAvailableTracks.map((t) => {
                      const isChecked = checkedTrackIds.includes(t.id);
                      return (
                        <div
                          key={t.id}
                          className={`p-2.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors cursor-pointer select-none ${
                            isChecked ? "bg-indigo-50/20" : ""
                          }`}
                          onClick={() => {
                            if (isChecked) {
                              setCheckedTrackIds(prev => prev.filter(id => id !== t.id));
                            } else {
                              setCheckedTrackIds(prev => [...prev, t.id]);
                            }
                          }}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // Handled by click listener on parent div
                              className="accent-indigo-600 rounded shrink-0"
                            />
                            <div className="truncate">
                              <div className="font-semibold text-slate-800 truncate">{t.title}</div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {t.artist?.name || "—"} • {t.genre || "Pop"}
                              </div>
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddMusicToPlaylist(t.id);
                            }}
                            className="h-[24px] px-2.5 border border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 text-indigo-600 text-[10px] font-bold rounded transition-all shrink-0 cursor-pointer bg-white font-sans"
                          >
                            Add
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 shrink-0 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPlaylistDetailModal(false)}
                className="h-[32px] px-5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-750 text-xs font-semibold cursor-pointer"
              >
                Close Manager
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lyrics CRUD Modal */}
      {showLyricsModal && selectedTrackForLyrics && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <form onSubmit={submitLyricsForm} className="w-full max-w-[600px] bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl space-y-4 animate-scale-in text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  {lyricsId ? "Edit Lyrics" : "Add Lyrics"} — {selectedTrackForLyrics.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLyricsModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm focus:outline-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Language</label>
                  <select
                    value={lyricsLanguage}
                    onChange={(e) => setLyricsLanguage(e.target.value)}
                    className="w-full h-[36px] px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-850 font-semibold"
                  >
                    <option value="uz">Uzbek (uz)</option>
                    <option value="en">English (en)</option>
                    <option value="ru">Russian (ru)</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-750">
                    <input
                      type="checkbox"
                      checked={lyricsIsSynced}
                      onChange={(e) => setLyricsIsSynced(e.target.checked)}
                      className="w-4 h-4 accent-indigo-600 rounded"
                    />
                    <span>Is Synced (LRC)?</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">Lyrics Text (Plain)</label>
                <textarea
                  required
                  placeholder="Paste or write track lyrics here..."
                  value={lyricsText}
                  onChange={(e) => setLyricsText(e.target.value)}
                  rows={8}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-850 font-medium"
                />
              </div>

              {lyricsIsSynced && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-450 uppercase mb-1">LRC Content (Time-synced format)</label>
                  <textarea
                    placeholder="[00:12.34] Lyrics line here..."
                    value={lyricsLrcContent}
                    onChange={(e) => setLyricsLrcContent(e.target.value)}
                    rows={5}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-850 font-mono"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowLyricsModal(false)}
                className="h-[32px] px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-750 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-[32px] px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Save Lyrics
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Comments Moderator Modal */}
      {showCommentsModal && selectedTrackForComments && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="w-full max-w-[650px] h-[80vh] bg-white rounded-2xl border border-slate-200 p-5 shadow-2xl flex flex-col animate-scale-in text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Manage Comments — {selectedTrackForComments.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCommentsModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm focus:outline-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* List of comments */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 min-h-0">
              {loadingComments ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              ) : commentsList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs font-medium">
                  <MessageSquare className="w-8 h-8 text-slate-350 mb-2" />
                  No comments posted on this track yet.
                </div>
              ) : (
                commentsList.map((comment) => (
                  <div key={comment.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl hover:bg-slate-100/50 transition-all flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-800">@{comment.userName}</span>
                        <span className="text-[10px] text-slate-450 font-semibold font-mono">
                          {new Date(comment.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {editingCommentId !== comment.id ? (
                          <>
                            <button
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditingCommentText(comment.text);
                              }}
                              className="text-[10px] text-indigo-650 hover:underline font-bold px-1 cursor-pointer"
                            >
                              Edit
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-[10px] text-red-500 hover:underline font-bold px-1 cursor-pointer"
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setEditingCommentId(null)}
                            className="text-[10px] text-slate-450 hover:underline font-bold px-1 cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    {editingCommentId === comment.id ? (
                      <div className="flex items-end gap-2 mt-1">
                        <textarea
                          rows={2}
                          value={editingCommentText}
                          onChange={(e) => setEditingCommentText(e.target.value)}
                          className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:border-indigo-500 transition-all text-slate-850 font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => submitEditComment(comment.id)}
                          className="h-[28px] px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-md shrink-0 transition-colors cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-650 leading-relaxed font-medium break-words">
                        {comment.text}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Post comment form */}
            <form onSubmit={submitNewComment} className="border-t border-slate-100 pt-3 shrink-0 flex items-end gap-2.5">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Post comment as Admin/Moderator</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Write a comment..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-indigo-500 transition-all text-slate-850 font-medium"
                />
              </div>
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="h-[38px] px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
