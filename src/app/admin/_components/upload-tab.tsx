"use client";

import { UploadCloud, Loader2, Users, Wand2, Trash2, Music, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { BackendArtistResponse as ArtistResponse } from "../../../types/backend";

interface AdminBulkTrackItem {
  id: string;
  file: File;
  fileName: string;
  title: string;
  artistName: string;
  artistId: number | null;
  size: number;
}

interface UploadTabProps {
  allArtistsList: ArtistResponse[];
  bulkQueue: AdminBulkTrackItem[];
  setBulkQueue: (fn: (prev: AdminBulkTrackItem[]) => AdminBulkTrackItem[]) => void;
  batchAdminArtist: string;
  setBatchAdminArtist: (v: string) => void;
  uploading: boolean;
  uploadResults: any[];
  setUploadResults: (v: any[]) => void;
  onBulkUploadFiles: (files: FileList | null) => void;
  onUpdateBulkItemTitle: (index: number, newTitle: string) => void;
  onUpdateBulkItemArtist: (index: number, newArtist: string) => void;
  onRemoveBulkItem: (index: number) => void;
  onApplyAdminBatchArtist: () => void;
  onCleanAdminBulkTitles: () => void;
  onSubmitBulkUpload: () => void;
}

export function UploadTab({
  allArtistsList,
  bulkQueue,
  setBulkQueue,
  batchAdminArtist,
  setBatchAdminArtist,
  uploading,
  uploadResults,
  setUploadResults,
  onBulkUploadFiles,
  onUpdateBulkItemTitle,
  onUpdateBulkItemArtist,
  onRemoveBulkItem,
  onApplyAdminBatchArtist,
  onCleanAdminBulkTitles,
  onSubmitBulkUpload,
}: UploadTabProps) {
  return (
    <div className="space-y-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
      <datalist id="admin-existing-artists-list">
        {allArtistsList.map((a) => (
          <option key={a.id} value={a.name} />
        ))}
      </datalist>

      <div>
        <h2 className="text-base font-bold text-slate-850 flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-indigo-600" />
          Smart Bulk Upload Dashboard
        </h2>
        <p className="text-xs text-slate-450 mt-0.5">
          Har xil ijrochilarning MP3 fayllarini birdaniga yuklang. Nomi va san'atkorlari avtomatik ajratiladi, yangi san'atkorlar avtomatik yaratiladi.
        </p>
      </div>

      {/* Drag & Drop Area */}
      <div className="border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100/50 rounded-xl p-8 flex flex-col items-center justify-center text-center">
        <input
          type="file"
          multiple
          accept=".mp3,audio/mpeg,audio/mp3"
          onChange={(e) => onBulkUploadFiles(e.target.files)}
          className="hidden"
          id="panel-file-picker"
        />
        <UploadCloud className="w-10 h-10 text-indigo-500 mb-2.5 animate-bounce" />
        <p className="text-xs font-bold text-slate-800 mb-1">MP3 audio fayllarni shu yerga tashlang yoki tanlang</p>
        <p className="text-[11px] text-slate-500 mb-3.5">Maksimum 50 ta fayl, har biri 50MB gacha</p>
        <label
          htmlFor="panel-file-picker"
          className="h-[32px] px-5 rounded-full border border-slate-350 bg-white hover:border-indigo-600 hover:text-indigo-600 text-slate-850 text-[11px] font-bold shadow-2xs transition-all flex items-center justify-center cursor-pointer select-none"
        >
          Fayllarni tanlash
        </label>
      </div>

      {/* Interactive Pre-Upload Table */}
      {bulkQueue.length > 0 && (
        <div className="space-y-4 pt-2">
          {/* Batch Action Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 min-w-0">
              <Users className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="text-xs font-semibold text-slate-700">
                Barcha qatorlarga bitta san'atkor qo'yish (ixtiyoriy):
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  list="admin-existing-artists-list"
                  value={batchAdminArtist}
                  onChange={(e) => setBatchAdminArtist(e.target.value)}
                  placeholder="Xonanda nomi..."
                  className="h-[28px] w-[160px] sm:w-[200px] px-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={onApplyAdminBatchArtist}
                  className="h-[28px] px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Qo'llash
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={onCleanAdminBulkTitles}
                className="h-[28px] px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Reklama va sayt teglari tozalash"
              >
                <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
                Nomlarni tozalash
              </button>
              <button
                type="button"
                onClick={() => setBulkQueue(() => [])}
                className="h-[28px] px-2.5 text-red-500 hover:text-red-700 text-[11px] font-bold transition-colors cursor-pointer"
              >
                Tozalash
              </button>
            </div>
          </div>

          {/* Table of items */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden">
            {bulkQueue.map((item, idx) => (
              <div key={item.id} className="p-3 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 min-w-[180px] sm:max-w-[220px] shrink-0">
                  <span className="w-5 text-[11px] font-mono text-slate-400 font-bold text-center">
                    {idx + 1}.
                  </span>
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                    <Music className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 truncate" title={item.fileName}>
                      {item.fileName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {(item.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                    Qo'shiq nomi
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => onUpdateBulkItemTitle(idx, e.target.value)}
                    placeholder="Nomi..."
                    className="w-full h-[30px] px-2.5 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-lg outline-none font-medium text-slate-800"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      San'atkor / Ijrochi
                    </label>
                    {item.artistId ? (
                      <span className="text-[9px] text-emerald-600 font-bold">Mavjud</span>
                    ) : item.artistName.trim() ? (
                      <span className="text-[9px] text-indigo-600 font-bold">+ Yangi</span>
                    ) : (
                      <span className="text-[9px] text-amber-500 font-medium">Tagdan o'qiladi</span>
                    )}
                  </div>
                  <input
                    type="text"
                    list="admin-existing-artists-list"
                    value={item.artistName}
                    onChange={(e) => onUpdateBulkItemArtist(idx, e.target.value)}
                    placeholder="San'atkor nomi..."
                    className="w-full h-[30px] px-2.5 text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 rounded-lg outline-none font-medium text-slate-800"
                  />
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => onRemoveBulkItem(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="O'chirish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <button
            onClick={onSubmitBulkUpload}
            disabled={uploading || bulkQueue.length === 0}
            className="w-full h-[40px] bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Musiqalar yuklanmoqda va qayta ishlanmoqda...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                Barcha treklarni yuklash ({bulkQueue.length} ta)
              </>
            )}
          </button>
        </div>
      )}

      {/* Results list */}
      {uploadResults.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700">Yuklangan treklar hisoboti</h3>
            <button
              type="button"
              onClick={() => setUploadResults([])}
              className="text-[11px] text-indigo-600 hover:underline font-bold"
            >
              Yopish
            </button>
          </div>
          <div className="max-h-[260px] overflow-y-auto border border-slate-200 rounded-xl bg-white divide-y divide-slate-100">
            {uploadResults.map((r, idx) => (
              <div key={idx} className="p-3 flex items-start gap-2.5 text-xs hover:bg-slate-50">
                {r.status === "SUCCESS" ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                ) : r.status === "DUPLICATE" ? (
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 truncate">{r.title || r.fileName}</span>
                    {r.artistName && (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {r.artistName}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">{r.fileName}</div>
                  <div className={`text-[10px] font-bold mt-0.5 ${
                    r.status === "SUCCESS" ? "text-emerald-600" : r.status === "DUPLICATE" ? "text-amber-600" : "text-rose-500"
                  }`}>
                    {r.status === "SUCCESS" && `✓ Muvaffaqiyatli saqlandi (ID: #${r.musicId})`}
                    {r.status === "DUPLICATE" && `⚠ Takroriy audio (ID: #${r.musicId})`}
                    {r.status === "FAILED" && `✕ Xatolik: ${r.error || "Noma'lum"}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
