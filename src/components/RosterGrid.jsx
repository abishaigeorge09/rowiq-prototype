import { useState, useRef } from 'react';
import AthleteChip from './AthleteChip';
import CSVUpload from './CSVUpload';
import ImportRosterSheet from './ImportRosterSheet';
import { getTotalAssigned, parseCSV } from '../utils/helpers';

export default function RosterGrid({ athletes, boats, onImport, onLoadSample, isAssigned, published, batches = [] }) {
  const assignedCount = getTotalAssigned(boats);
  const [activeBatch, setActiveBatch] = useState(null);
  const [showImportSheet, setShowImportSheet] = useState(false);
  const fileRef = useRef(null);

  function handleReuploadFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    const rawName = file.name.replace(/\.csv$/i, '');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result);
      if (parsed.length > 0) onImport(parsed, rawName);
    };
    reader.readAsText(file);
  }

  const displayedAthletes = activeBatch
    ? athletes.filter((a) => a.batchId === activeBatch)
    : athletes;

  if (athletes.length === 0) {
    return (
      <div className="bg-white border border-[#E5E7EB] rounded-xl">
        <div className="px-5 pt-4 pb-2">
          <span className="text-[#9CA3AF] text-xs font-semibold tracking-wider uppercase">Athlete Roster</span>
        </div>
        <CSVUpload onImport={onImport} onLoadSample={onLoadSample} />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-[#E5E7EB] rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#F3F4F6]">
          <div className="flex items-center gap-3">
            <span className="text-[#9CA3AF] text-xs font-semibold tracking-wider uppercase">Roster</span>
            <span className="text-[#6B7280] text-sm">{assignedCount}/{athletes.length} assigned</span>
          </div>
          <div className="flex items-center gap-3">
            <input ref={fileRef} type="file" accept=".csv" onChange={handleReuploadFile} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              className="text-[#6B7280] text-xs font-medium hover:text-[#2563EB] transition-colors"
            >
              Upload CSV
            </button>
            <button
              onClick={() => setShowImportSheet(true)}
              className="px-3 py-1.5 rounded-lg bg-[#EFF6FF] text-[#2563EB] text-xs font-semibold hover:bg-blue-100 transition-colors"
            >
              + Import
            </button>
          </div>
        </div>

        {/* Batch filter chips */}
        {batches.length > 1 && (
          <div className="flex gap-2 px-5 py-3 overflow-x-auto scrollbar-none border-b border-[#F3F4F6]">
            <button
              onClick={() => setActiveBatch(null)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                activeBatch === null ? 'bg-[#2563EB] text-white' : 'bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827]'
              }`}
            >
              All ({athletes.length})
            </button>
            {batches.map((b) => (
              <button
                key={b.id}
                onClick={() => setActiveBatch(activeBatch === b.id ? null : b.id)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  activeBatch === b.id ? 'bg-[#2563EB] text-white' : 'bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                {b.name} ({b.count})
              </button>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="px-5 pb-5 pt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {displayedAthletes.map((athlete) => (
            <AthleteChip key={athlete.id} athlete={athlete} isAssigned={isAssigned(athlete.id)} />
          ))}
        </div>
      </div>

      {showImportSheet && (
        <ImportRosterSheet
          athletes={athletes}
          batches={batches}
          boats={boats}
          isAssigned={isAssigned}
          onImport={(selected) => { onImport(selected, 'Roster Import'); setShowImportSheet(false); }}
          onClose={() => setShowImportSheet(false)}
        />
      )}
    </>
  );
}
