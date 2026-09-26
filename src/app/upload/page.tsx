"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../stores/auth-store";
import { api, ApiError } from "../../lib/api/client";
import { parseAudioFilename, cleanTitleString } from "../../lib/filename-parser";
import {
  UploadCloud,
  Music,
  Trash2,
  Loader2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Lock,
  ShieldAlert,
  Wand2,
  Users,
  Check,
  Plus
} from "lucide-react";

interface UploadResult {
  fileName: string;
  status: "SUCCESS" | "DUPLICATE" | "FAILED";
  musicId?: number;
  title?: string;
  artistName?: string;
  error?: string;
}

interface BulkTrackItem {
  id: string;
  file: File;
  fileName: string;
  title: string;
  artistName: string;
  artistId: number | null;
  size: number;
}

interface ExistingArtist {
  id: number;
  name: string;
}

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated, user, isInitialized } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [existingArtists, setExistingArtists] = useState<ExistingArtist[]>([]);

  useEffect(() => {
    setMounted(true);
    if (isAuthenticated) {
      api.get<any>("/api/v1/artists?page=0&size=100")
        .then((res) => {
          if (res?.content && Array.isArray(res.content)) {
            setExistingArtists(res.content.map((a: any) => ({ id: a.id, name: a.name })));
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const [queueItems, setQueueItems] = useState<BulkTrackItem[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Batch helper state
  const [batchArtistInput, setBatchArtistInput] = useState("");

  // Stats
  const [totalFiles, setTotalFiles] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [results, setResults] = useState<UploadResult[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAuthorized = isAuthenticated && (user?.role === "ADMIN" || user?.role === "MODERATOR");

  // Access check
  if (!mounted || !isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2 font-sans select-none">
        <Loader2 className="w-6 h-6 text-[#365377] animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center font-sans select-none animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-5 shadow-2xs border border-slate-200">
          <Lock className="w-6 h-6 text-slate-400" />
        </div>
        <h1 className="text-xl font-bold text-slate-850 mb-2">Tizimga kirish talab qilinadi</h1>
        <p className="text-xs text-slate-500 max-w-[360px] mb-6 leading-relaxed">
          Musiqa yuklash uchun Admin yoki Moderator hisobi bilan tizimga kiring.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="h-[36px] px-6 rounded-full bg-[#365377] hover:bg-[#284160] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer focus:outline-none"
        >
          Kirish
        </button>
      </div>
    );
  }

  if (!isAuthorized || permissionDenied) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center font-sans select-none animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5 shadow-2xs border border-red-100">
          <ShieldAlert className="w-6 h-6 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Ruxsat cheklangan</h1>
        <p className="text-xs text-red-500 max-w-[420px] mb-6 leading-relaxed">
          Faqat administrator va moderatorlar trek yuklash huquqiga ega.
        </p>
        <button
          onClick={() => {
            setPermissionDenied(false);
            setErrorMessage("");
            setQueueItems([]);
          }}
          className="h-[36px] px-6 rounded-full border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-semibold shadow-2xs transition-colors cursor-pointer focus:outline-none bg-white"
        >
          Ortga qaytish
        </button>
      </div>
    );
  }

  // Handle file selections
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    setErrorMessage("");
    setSuccessMsg("");
    setResults([]);

    if (queueItems.length + files.length > 50) {
      setErrorMessage("Bir vaqtning o'zida ko'pi bilan 50 ta fayl yuklash mumkin.");
      return;
    }

    const newItems: BulkTrackItem[] = [];
    let badFormat = false;
    let sizeExceeded = false;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file.name.toLowerCase().endsWith(".mp3") && file.type !== "audio/mpeg" && file.type !== "audio/mp3") {
        badFormat = true;
        continue;
      }

      if (file.size > 50 * 1024 * 1024) {
        sizeExceeded = true;
        continue;
      }

      const parsed = parseAudioFilename(file.name);
      let matchedArtistId: number | null = null;
      if (parsed.artist) {
        const found = existingArtists.find(
          (a) => a.name.toLowerCase() === parsed.artist.toLowerCase()
        );
        if (found) {
          matchedArtistId = found.id;
        }
      }

      newItems.push({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        fileName: file.name,
        title: parsed.title,
        artistName: parsed.artist,
        artistId: matchedArtistId,
        size: file.size
      });
    }

    if (badFormat) {
      setErrorMessage("Faqat MP3 formatidagi audio fayllar qo'llab-quvvatlanadi.");
    } else if (sizeExceeded) {
      setErrorMessage("Har bir fayl hajmi 50MB dan oshmasligi lozim.");
    }

    setQueueItems((prev) => [...prev, ...newItems]);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const updateItemTitle = (index: number, newTitle: string) => {
    setQueueItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], title: newTitle };
      return copy;
    });
  };

  const updateItemArtist = (index: number, newArtist: string) => {
    setQueueItems((prev) => {
      const copy = [...prev];
      const found = existingArtists.find(
        (a) => a.name.toLowerCase() === newArtist.trim().toLowerCase()
      );
      copy[index] = {
        ...copy[index],
        artistName: newArtist,
        artistId: found ? found.id : null
      };
      return copy;
    });
  };

  const removeItem = (index: number) => {
    setQueueItems((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setQueueItems([]);
    setErrorMessage("");
    setSuccessMsg("");
    setResults([]);
  };

  // Apply batch artist to all selected tracks
  const applyBatchArtist = () => {
    if (!batchArtistInput.trim()) return;
    const trimmed = batchArtistInput.trim();
    const found = existingArtists.find(
      (a) => a.name.toLowerCase() === trimmed.toLowerCase()
    );
    setQueueItems((prev) =>
      prev.map((item) => ({
        ...item,
        artistName: trimmed,
        artistId: found ? found.id : null
      }))
    );
  };

  // Clean ads, telegram links, numbering from all titles
  const cleanAllTitles = () => {
    setQueueItems((prev) =>
      prev.map((item) => ({
        ...item,
        title: cleanTitleString(item.title) || item.title
      }))
    );
  };

  // Execute bulk upload
  const handleUploadSubmit = async () => {
    if (queueItems.length === 0) return;
    if (queueItems.length > 50) {
      setErrorMessage("Bir vaqtda 50 tadan ortiq fayl yuklab bo'lmaydi.");
      return;
    }

    setUploading(true);
    setErrorMessage("");
    setSuccessMsg("");
    setResults([]);

    const formData = new FormData();
    queueItems.forEach((item) => {
      formData.append("files", item.file);
    });

    const metadata = queueItems.map((item) => ({
      fileName: item.fileName,
      title: item.title.trim() || item.fileName.replace(/\.[^/.]+$/, ""),
      artistName: item.artistName.trim() || null,
      artistId: item.artistId || null
    }));

    formData.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );

    try {
      const data = await api.post<any>("/api/v1/musics/bulk", formData, {
        timeout: 300000 // 5 minutes upload timeout
      });

      if (data) {
        setTotalFiles(data.total || queueItems.length);
        setSuccessCount(data.successCount || 0);
        setDuplicateCount(data.duplicateCount || 0);
        setFailedCount(data.failedCount || 0);
        setResults(data.results || []);

        if ((data.successCount || 0) > 0) {
          setSuccessMsg(`${data.successCount} ta musiqa muvaffaqiyatli yuklandi va tizimga qo'shildi!`);
          setQueueItems([]);
        } else if ((data.duplicateCount || 0) > 0) {
          setSuccessMsg("Jarayon yakunlandi. Barcha treklar allaqachon mavjud (takroriy).");
          setQueueItems([]);
        } else {
          setErrorMessage("Musiqalarni yuklashda xatolik yuz berdi. Tafsilotlarni quyida tekshiring.");
        }
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      if (err instanceof ApiError) {
        if (err.status === 403) {
          setPermissionDenied(true);
        } else if (err.status === 401) {
          setErrorMessage("Sessiya muddati tugadi. Iltimos, qayta kiring.");
        } else {
          setErrorMessage(err.message || "Bulk upload jarayonida xatolik yuz berdi.");
        }
      } else {
        setErrorMessage("Server bilan aloqa uzildi yoki tarmoq xatosi.");
      }
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6 font-sans select-none animate-fade-in p-4 max-w-[960px] mx-auto">
      {/* Existing Artists Datalist */}
      <datalist id="existing-artists-list">
        {existingArtists.map((a) => (
          <option key={a.id} value={a.name} />
        ))}
      </datalist>

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <UploadCloud className="w-6 h-6 text-[#365377]" />
          Smart Bulk Music Upload
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Har xil san'atkorlarning musiqalarini bir vaqtning o'zida yuklang. Nomi va ijrochilari avtomatik aniqlanadi, topilmagan san'atkorlar avtomatik yaratiladi.
        </p>
      </div>

      {/* Drag & Drop Area */}
      {!uploading && results.length === 0 && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`w-full py-10 px-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${
            isDragActive
              ? "border-[#365377] bg-blue-50/50"
              : "border-slate-200 bg-slate-50 hover:bg-slate-100/60"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".mp3,audio/mpeg,audio/mp3"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6 text-[#365377]" />
          </div>
          <p className="text-sm font-bold text-slate-800 mb-1 text-center">
            MP3 fayllarni shu yerga tashlang yoki tanlang
          </p>
          <p className="text-xs text-slate-500 mb-4 text-center">
            Maksimum 50 ta fayl, har biri 50MB gacha
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-[34px] px-5 rounded-full border border-slate-300 bg-white hover:border-[#365377] hover:text-[#365377] text-slate-800 text-xs font-bold shadow-2xs transition-all cursor-pointer focus:outline-none flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Fayllarni tanlash
          </button>
        </div>
      )}

      {/* Error & Success Messages */}
      {errorMessage && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs font-medium animate-fade-in">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs font-medium animate-fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Uploading Progress */}
      {uploading && (
        <div className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#365377]" />
              {queueItems.length} ta musiqa serverga yuklanmoqda...
            </span>
            <span className="text-xs font-bold text-slate-500 animate-pulse">
              Fayllar tahlil qilinmoqda...
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div className="bg-[#365377] h-full animate-infinite-progress rounded-full w-2/3" />
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Iltimos, sahifani yopmang. Audio metadatalari o'qilmoqda, san'atkorlar bog'lanmoqda va ID3 taglar tozalangan holda saqlanmoqda.
          </p>
        </div>
      )}

      {/* Interactive Pre-Upload Review Table */}
      {!uploading && queueItems.length > 0 && (
        <div className="space-y-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          {/* Top Batch Tools Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-800">
                Yuklash navbati ({queueItems.length} ta trek)
              </span>
              <span className="text-[10px] bg-blue-50 text-[#365377] font-bold px-2 py-0.5 rounded-full border border-blue-100">
                Har bir qator mustaqil
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Clean titles button */}
              <button
                type="button"
                onClick={cleanAllTitles}
                title="Nomlardagi reklama va prefikslarni bir klikda tozalash"
                className="h-[30px] px-3 rounded-lg border border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-600 text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
                Nomlarni tozalash
              </button>

              {/* Clear all */}
              <button
                type="button"
                onClick={clearAll}
                className="h-[30px] px-3 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 text-[11px] font-bold transition-all cursor-pointer"
              >
                Barchasini bekor qilish
              </button>
            </div>
          </div>

          {/* Batch Artist Helper (Optional) */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <Users className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="text-xs font-semibold text-slate-700 truncate">
                Barcha qatorlarga bitta san'atkor qo'yish (ixtiyoriy albom amali):
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="text"
                list="existing-artists-list"
                value={batchArtistInput}
                onChange={(e) => setBatchArtistInput(e.target.value)}
                placeholder="Xonanda nomi..."
                className="h-[30px] w-[180px] sm:w-[220px] px-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-[#365377]"
              />
              <button
                type="button"
                onClick={applyBatchArtist}
                className="h-[30px] px-3 bg-[#365377] hover:bg-[#284160] text-white text-[11px] font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" />
                Qo'llash
              </button>
            </div>
          </div>

          {/* Queue Items Table */}
          <div className="max-h-[460px] overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden">
            {queueItems.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center gap-3"
              >
                {/* File info pill */}
                <div className="flex items-center gap-2 min-w-[180px] sm:max-w-[220px] shrink-0">
                  <span className="w-5 text-[11px] font-mono text-slate-400 font-bold text-center">
                    {idx + 1}.
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Music className="w-3.5 h-3.5 text-[#365377]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-slate-700 truncate" title={item.fileName}>
                      {item.fileName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {formatSize(item.size)}
                    </div>
                  </div>
                </div>

                {/* Title Input */}
                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Qo'shiq nomi
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItemTitle(idx, e.target.value)}
                    placeholder="Qo'shiq nomi..."
                    className="w-full h-[32px] px-2.5 text-xs bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#365377] rounded-lg transition-colors focus:outline-none font-medium text-slate-800"
                  />
                </div>

                {/* Artist Input (with autocomplete & custom typing) */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Ijrochi / Artist
                    </label>
                    {item.artistId ? (
                      <span className="text-[10px] text-emerald-600 font-bold">Mavjud san'atkor</span>
                    ) : item.artistName.trim() ? (
                      <span className="text-[10px] text-blue-600 font-bold">+ Yangi yaratiladi</span>
                    ) : (
                      <span className="text-[10px] text-amber-500 font-medium">Tagdan o'qiladi</span>
                    )}
                  </div>
                  <input
                    type="text"
                    list="existing-artists-list"
                    value={item.artistName}
                    onChange={(e) => updateItemArtist(idx, e.target.value)}
                    placeholder="Ijrochini kiriting yoki tanlang..."
                    className="w-full h-[32px] px-2.5 text-xs bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#365377] rounded-lg transition-colors focus:outline-none font-medium text-slate-800"
                  />
                </div>

                {/* Remove track button */}
                <div className="shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              onClick={handleUploadSubmit}
              disabled={uploading || queueItems.length === 0}
              className="w-full h-[42px] bg-[#365377] hover:bg-[#284160] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer focus:outline-none flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              Barcha treklarni yuklash ({queueItems.length} ta)
            </button>
          </div>
        </div>
      )}

      {/* Upload Results Report */}
      {!uploading && results.length > 0 && (
        <div className="space-y-5 animate-fade-in bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-2.5">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <div className="text-lg font-extrabold text-slate-800">{totalFiles}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Jami</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
              <div className="text-lg font-extrabold text-emerald-600">{successCount}</div>
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mt-0.5">Muvaffaqiyatli</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
              <div className="text-lg font-extrabold text-amber-600">{duplicateCount}</div>
              <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mt-0.5">Takroriy</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <div className="text-lg font-extrabold text-red-600">{failedCount}</div>
              <div className="text-[10px] font-bold text-red-600 uppercase tracking-wide mt-0.5">Xato</div>
            </div>
          </div>

          {/* Results list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-800">Yuklangan treklar hisoboti</span>
              <button
                onClick={clearAll}
                className="text-xs text-[#365377] hover:underline font-bold focus:outline-none"
              >
                Yana yuklash
              </button>
            </div>

            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden">
              {results.map((res, index) => (
                <div key={`${res.fileName}-${index}`} className="p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-3">
                  {res.status === "SUCCESS" && (
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  )}
                  {res.status === "DUPLICATE" && (
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  )}
                  {res.status === "FAILED" && (
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800 truncate" title={res.fileName}>
                        {res.title || res.fileName}
                      </span>
                      {res.artistName && (
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {res.artistName}
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Fayl: {res.fileName}
                    </div>

                    {res.status === "SUCCESS" && res.musicId && (
                      <div className="text-[10px] font-bold text-emerald-600 mt-0.5">
                        ✓ Qo'shildi, Musiqa ID: #{res.musicId}
                      </div>
                    )}
                    {res.status === "DUPLICATE" && res.musicId && (
                      <div className="text-[10px] font-bold text-amber-600 mt-0.5">
                        ⚠ Mavjud musiqa (takroriy), ID: #{res.musicId}
                      </div>
                    )}
                    {res.status === "FAILED" && res.error && (
                      <div className="text-[10px] font-bold text-red-600 mt-0.5 leading-relaxed">
                        ✕ Xatolik: {res.error}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
