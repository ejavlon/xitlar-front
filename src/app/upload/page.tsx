"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../../stores/auth-store";
import { api, ApiError } from "../../lib/api/client";
import {
  UploadCloud,
  Music,
  Trash2,
  Loader2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  X,
  Lock,
  ShieldAlert
} from "lucide-react";

interface UploadResult {
  fileName: string;
  status: "SUCCESS" | "DUPLICATE" | "FAILED";
  musicId?: number;
  title?: string;
  error?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated, user, isInitialized } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);

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
        <p className="text-xs text-slate-400 font-medium">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center font-sans select-none animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-5 shadow-2xs border border-slate-200">
          <Lock className="w-6 h-6 text-slate-400" />
        </div>
        <h1 className="text-xl font-bold text-slate-850 mb-2">Sign In Required</h1>
        <p className="text-xs text-slate-500 max-w-[360px] mb-6 leading-relaxed">
          You must be signed in as an Admin or Moderator to upload tracks to Xitlar.
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

  if (!isAuthorized || permissionDenied) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center font-sans select-none animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-5 shadow-2xs border border-red-100">
          <ShieldAlert className="w-6 h-6 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-xs text-red-500 max-w-[420px] mb-6 leading-relaxed">
          Only administrators and moderators are authorized to upload tracks. Please sign in with an authorized account or contact support.
        </p>
        <button
          onClick={() => {
            setPermissionDenied(false);
            setErrorMessage("");
            setSelectedFiles([]);
          }}
          className="h-[36px] px-6 rounded-full border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-semibold shadow-2xs transition-colors cursor-pointer focus:outline-none bg-white"
        >
          Go Back
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

    const newFiles: File[] = [];
    let overLimit = false;
    let badFormat = false;
    let sizeExceeded = false;

    // Check count validation
    if (selectedFiles.length + files.length > 50) {
      setErrorMessage("Maximum 50 files can be uploaded at a time.");
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate format
      if (!file.name.toLowerCase().endsWith(".mp3") && file.type !== "audio/mpeg" && file.type !== "audio/mp3") {
        badFormat = true;
        continue;
      }

      // Validate individual size (50MB)
      if (file.size > 50 * 1024 * 1024) {
        sizeExceeded = true;
        continue;
      }

      newFiles.push(file);
    }

    if (badFormat) {
      setErrorMessage("Only MP3 audio files are allowed.");
    } else if (sizeExceeded) {
      setErrorMessage("Individual file size limit is 50MB.");
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
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

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setSelectedFiles([]);
    setErrorMessage("");
    setSuccessMsg("");
    setResults([]);
  };

  // Trigger file browser click
  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Execute bulk upload
  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) return;
    if (selectedFiles.length > 50) {
      setErrorMessage("You can only upload up to 50 files.");
      return;
    }

    setUploading(true);
    setErrorMessage("");
    setSuccessMsg("");
    setResults([]);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const data = await api.post<any>("/api/v1/musics/bulk", formData, {
        timeout: 300000, // 5 minutes upload timeout
      });

      if (data) {
        setTotalFiles(data.total || selectedFiles.length);
        setSuccessCount(data.successCount || 0);
        setDuplicateCount(data.duplicateCount || 0);
        setFailedCount(data.failedCount || 0);
        setResults(data.results || []);

        if ((data.successCount || 0) > 0) {
          setSuccessMsg(`Successfully processed ${data.successCount} tracks!`);
          setSelectedFiles([]);
        } else if ((data.duplicateCount || 0) > 0) {
          setSuccessMsg("Processing finished. All tracks were duplicates.");
          setSelectedFiles([]);
        } else {
          setErrorMessage("Failed to upload tracks. Please check the error details below.");
        }
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      if (err instanceof ApiError) {
        if (err.status === 403) {
          setPermissionDenied(true);
        } else if (err.status === 401) {
          setErrorMessage("Session expired. Please log in again.");
        } else {
          setErrorMessage(err.message || "Bulk upload failed.");
        }
      } else {
        setErrorMessage("Network error or connection refused from backend.");
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
    <div className="space-y-6 font-sans select-none animate-fade-in p-4 max-w-[800px] mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <UploadCloud className="w-6 h-6 text-[#365377]" />
          Bulk Music Upload
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Upload up to 50 MP3 tracks at once. Duplicate tracks are automatically detected.
        </p>
      </div>

      {/* Main Drag-Drop Box */}
      {!uploading && results.length === 0 && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`w-full py-12 px-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${
            isDragActive
              ? "border-amber-500 bg-amber-50/50"
              : "border-slate-200 bg-slate-50 hover:bg-slate-100/50"
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

          <UploadCloud className="w-12 h-12 text-slate-400 mb-4 animate-bounce" />
          <p className="text-sm font-semibold text-slate-800 mb-1.5 text-center">
            Drag and drop your audio files here
          </p>
          <p className="text-xs text-slate-600 mb-4 text-center">
            Only .mp3 files up to 50MB each are supported
          </p>
          <button
            type="button"
            onClick={onButtonClick}
            className="h-[32px] px-5 rounded-full border border-slate-300 bg-white hover:border-[#365377] hover:text-[#365377] text-slate-800 text-xs font-semibold shadow-2xs transition-all cursor-pointer focus:outline-none"
          >
            Browse Files
          </button>
        </div>
      )}

      {/* Errors and Warnings */}
      {errorMessage && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-500 border border-red-100 rounded-xl text-xs font-medium">
          <XCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-xl text-xs font-medium">
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
              Uploading {selectedFiles.length} files...
            </span>
            <span className="text-xs font-bold text-slate-600 animate-pulse">
              Sending to server
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div className="bg-[#365377] h-full animate-infinite-progress rounded-full w-2/3" />
          </div>
          <p className="text-[11px] text-slate-650 leading-relaxed">
            Please keep this page open. Processing audio metadata, validating checksum hashes, and writing files may take up to a few minutes depending on network bandwidth and queue size.
          </p>
        </div>
      )}

      {/* Selected Files Queue list */}
      {!uploading && selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-850">
              Queue ({selectedFiles.length} / 50)
            </span>
            <button
              onClick={clearAll}
              className="text-xs text-red-500 hover:text-red-700 hover:underline font-semibold focus:outline-none"
            >
              Clear All
            </button>
          </div>

          <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white shadow-2xs overflow-hidden">
            {selectedFiles.map((file, idx) => (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-4">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <Music className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 truncate" title={file.name}>
                      {file.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {formatSize(file.size)}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                  aria-label="Remove file"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={handleUploadSubmit}
              className="w-full h-[40px] bg-[#365377] hover:bg-[#284160] text-white text-xs font-bold rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer focus:outline-none flex items-center justify-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Tracks
            </button>
          </div>
        </div>
      )}

      {/* Summary statistics on completion */}
      {!uploading && results.length > 0 && (
        <div className="space-y-5 animate-fade-in">
          {/* Counts Cards */}
          <div className="grid grid-cols-4 gap-2.5">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <div className="text-lg font-extrabold text-slate-800">{totalFiles}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">Total</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
              <div className="text-lg font-extrabold text-emerald-600">{successCount}</div>
              <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mt-0.5">Success</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
              <div className="text-lg font-extrabold text-amber-600">{duplicateCount}</div>
              <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wide mt-0.5">Duplicate</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <div className="text-lg font-extrabold text-red-600">{failedCount}</div>
              <div className="text-[10px] font-bold text-red-500 uppercase tracking-wide mt-0.5">Failed</div>
            </div>
          </div>

          {/* Results Summary list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-850">Processing Report</span>
              <button
                onClick={clearAll}
                className="text-xs text-[#365377] hover:underline font-semibold focus:outline-none"
              >
                Upload More
              </button>
            </div>

            <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white shadow-2xs overflow-hidden">
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
                    <div className="text-xs font-semibold text-slate-800 truncate" title={res.fileName}>
                      {res.fileName}
                    </div>
                    {res.title && (
                      <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                        Title: {res.title}
                      </div>
                    )}
                    {res.status === "SUCCESS" && res.musicId && (
                      <div className="text-[10px] font-bold text-emerald-500 mt-0.5">
                        ✓ Uploaded, Music ID: {res.musicId}
                      </div>
                    )}
                    {res.status === "DUPLICATE" && res.musicId && (
                      <div className="text-[10px] font-bold text-amber-500 mt-0.5">
                        ⚠ Duplicate, Existing Music ID: {res.musicId}
                      </div>
                    )}
                    {res.status === "FAILED" && res.error && (
                      <div className="text-[10px] font-bold text-red-500 mt-0.5 leading-relaxed">
                        ✕ Failed, Reason: {res.error}
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
