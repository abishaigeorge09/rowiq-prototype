import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { getAvatarColor } from '../utils/helpers';
import { useAuthStore } from '../stores/authStore.js';

export default function ViewToggle({ viewMode, viewingAthlete, athletes, onSwitchToAthlete, onSwitchToCoach }) {
  const navigate = useNavigate();
  const { signOut, user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = athletes.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelectAthlete(id) {
    setShowPicker(false);
    setOpen(false);
    setSearch('');
    onSwitchToAthlete(id);
  }

  function openPicker() {
    setOpen(false);
    setShowPicker(true);
  }

  // Picker modal rendered via portal to escape header stacking context
  const pickerModal = showPicker && createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 200 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => { setShowPicker(false); setSearch(''); }}
      />
      {/* Modal */}
      <div className="relative bg-white border border-[#E5E7EB] rounded-2xl w-full max-w-sm mx-4 overflow-hidden shadow-2xl shadow-black/60">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <h3 className="text-[#111827] font-bold">View As Athlete</h3>
          <button
            onClick={() => { setShowPicker(false); setSearch(''); }}
            className="text-[#6B7280] hover:text-[#111827] text-xl leading-none transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="px-4 py-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search athletes…"
            autoFocus
            className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#111827] text-sm placeholder-[#475569] focus:outline-none focus:border-[#2563EB] transition-colors"
          />
        </div>
        <div className="overflow-y-auto max-h-72 pb-3">
          {filtered.map((a) => (
            <button
              key={a.id}
              onClick={() => handleSelectAthlete(a.id)}
              className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-[#F3F4F6] transition-colors text-left"
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#111827] text-xs font-bold shrink-0"
                style={{ backgroundColor: getAvatarColor(a.colorIndex) }}
              >
                {a.initials}
              </div>
              <div>
                <div className="text-[#111827] text-sm font-medium">{a.name}</div>
                <div className="text-[#6B7280] text-xs">{a.position}</div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-5 py-4 text-[#6B7280] text-sm">No athletes found.</div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Toggle button */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 bg-[#F3F4F6] border border-[#E5E7EB] rounded-lg px-3 py-1.5 hover:border-[#D1D5DB] transition-colors"
        >
          {viewMode === 'athlete' && viewingAthlete ? (
            <>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[#111827] text-[9px] font-bold shrink-0"
                style={{ backgroundColor: getAvatarColor(viewingAthlete.colorIndex) }}
              >
                {viewingAthlete.initials}
              </div>
              <span className="text-[#111827] text-sm truncate max-w-[100px]">
                {viewingAthlete.name.split(' ')[0]}
              </span>
            </>
          ) : (
            <span className="text-[#111827] text-sm">Coach View</span>
          )}
          <svg
            width="12" height="12" viewBox="0 0 12 12"
            className={`text-[#6B7280] transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
            fill="currentColor"
          >
            <path d="M6 8L1 3h10L6 8z" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {open && (
          <div className="absolute right-0 top-full mt-1 w-56 bg-white border border-[#E5E7EB] rounded-xl shadow-xl shadow-black/50 overflow-hidden" style={{ zIndex: 100 }}>
            {viewMode === 'athlete' ? (
              <>
                <button
                  onClick={() => { onSwitchToCoach(); setOpen(false); }}
                  className="w-full text-left px-4 py-3 text-sm text-[#111827] hover:bg-[#F3F4F6] transition-colors flex items-center gap-2"
                >
                  <span className="text-[#6B7280]">←</span>
                  Back to Coach View
                </button>
                <div className="border-t border-[#E5E7EB]" />
                <button
                  onClick={openPicker}
                  className="w-full text-left px-4 py-3 text-sm text-[#2563EB] hover:bg-[#F3F4F6] transition-colors"
                >
                  Switch athlete…
                </button>
              </>
            ) : (
              <>
                {user && (
                  <div className="px-4 py-2.5 border-b border-[#E5E7EB]">
                    <p className="text-[#111827] text-xs font-semibold truncate">{user.name}</p>
                    <p className="text-[#9CA3AF] text-[10px] truncate">{user.email}</p>
                  </div>
                )}
                <div className="px-4 py-2 border-b border-[#E5E7EB]">
                  <p className="text-[#9CA3AF] text-xs font-semibold tracking-wider uppercase">View As Athlete</p>
                </div>
                {athletes.length === 0 ? (
                  <div className="px-4 py-3 text-[#6B7280] text-sm">No athletes loaded yet.</div>
                ) : (
                  <button
                    onClick={openPicker}
                    className="w-full text-left px-4 py-3 text-sm text-[#111827] hover:bg-[#F3F4F6] transition-colors"
                  >
                    Select an athlete…
                  </button>
                )}
                <div className="border-t border-[#E5E7EB]" />
                <button
                  onClick={async () => { setOpen(false); await signOut(); navigate('/login'); }}
                  className="w-full text-left px-4 py-3 text-sm text-[#EF4444] hover:bg-[#F3F4F6] transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Portal-rendered picker — escapes header stacking context */}
      {pickerModal}
    </>
  );
}
