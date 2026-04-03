import { useState, useRef } from 'react';
import { parseCSV } from '../utils/helpers';

export default function CSVUpload({ onImport, onLoadSample }) {
  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [batchName, setBatchName] = useState('');
  const fileRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const rawName = file.name.replace(/\.csv$/i, '');
    setFileName(rawName);
    setBatchName(rawName);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result);
      if (parsed.length > 0) setPreview(parsed);
    };
    reader.readAsText(file);
  }

  function confirmImport() {
    if (preview) {
      onImport(preview, batchName || fileName || 'Roster');
      setPreview(null);
      setBatchName('');
      setFileName('');
    }
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center py-14 gap-4">
        <div className="w-14 h-14 rounded-full bg-[#EFF6FF] flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <div className="text-center">
          <h3 className="text-[#111827] font-semibold text-base">Upload your roster CSV</h3>
          <p className="text-[#9CA3AF] text-sm mt-1">Columns: name, email, position (optional)</p>
        </div>

        <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />

        <button
          onClick={() => fileRef.current?.click()}
          className="bg-[#2563EB] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#1d4ed8] transition-colors"
        >
          Choose CSV File
        </button>

        <button
          onClick={onLoadSample}
          className="text-[#6B7280] text-sm hover:text-[#2563EB] transition-colors"
        >
          Load sample roster
        </button>
      </div>

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-[#111827] font-bold text-lg mb-1">Found {preview.length} athletes</h3>
            <p className="text-[#6B7280] text-sm mb-4">Name this batch to filter by it later.</p>

            <div className="mb-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] block mb-1.5">Batch Name</label>
              <input
                type="text"
                value={batchName}
                onChange={(e) => setBatchName(e.target.value)}
                placeholder="e.g. Varsity Spring 2026"
                className="w-full bg-[#F8FAFC] border border-[#E5E7EB] focus:border-[#2563EB] text-[#111827] placeholder:text-[#9CA3AF] rounded-xl h-11 px-4 outline-none transition-colors text-sm"
              />
            </div>

            <div className="max-h-48 overflow-y-auto mb-4 space-y-1">
              {preview.map((a, i) => (
                <div key={i} className="text-sm flex justify-between px-2 py-1 rounded-lg hover:bg-[#F9FAFB]">
                  <span className="text-[#111827] font-medium">{a.name}</span>
                  <span className="text-[#9CA3AF]">{a.position || a.email}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setPreview(null); setBatchName(''); setFileName(''); }}
                className="flex-1 px-4 py-2.5 rounded-xl text-[#6B7280] bg-[#F3F4F6] hover:bg-[#E5E7EB] transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmImport}
                className="flex-1 px-4 py-2.5 rounded-xl text-white bg-[#2563EB] hover:bg-[#1d4ed8] transition-colors font-semibold text-sm"
              >
                Import {preview.length} Athletes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
