import { useNavigate, Link } from 'react-router-dom';
import ViewToggle from './ViewToggle';
import { useAuthStore } from '../stores/authStore.js';

export default function Header({
  screen, onScreenChange, published, hasSession,
  viewMode, viewingAthlete, athletes, onSwitchToAthlete, onSwitchToCoach,
}) {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  const tabs = [
    { id: 'lineup', label: 'Lineup' },
    { id: 'roster', label: 'Roster' },
    { id: 'session', label: 'Session' },
    { id: 'history', label: 'History' },
  ];

  const isGuest = !user;
  const isAthlete = user?.role === 'athlete';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB]">
      <div className="flex items-center justify-between px-4 sm:px-6 h-14">
        {/* Logo */}
        <div className="flex items-center gap-0.5 shrink-0">
          <span className="text-lg font-black text-[#111827] tracking-tight">ROW</span>
          <span className="text-lg font-black text-[#2563EB] tracking-tight">IQ</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {isGuest && (
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1d4ed8] transition-colors"
            >
              Sign In
            </Link>
          )}

          {!isGuest && isAthlete && (
            <>
              <span className="hidden sm:inline text-[#6B7280] text-sm font-medium">
                {user.name}
              </span>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-[#DC2626] hover:bg-red-50 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </>
          )}

          {!isGuest && !isAthlete && (
            <>
              <ViewToggle
                viewMode={viewMode}
                viewingAthlete={viewingAthlete}
                athletes={athletes}
                onSwitchToAthlete={onSwitchToAthlete}
                onSwitchToCoach={onSwitchToCoach}
              />
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-[#DC2626] hover:bg-red-50 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs — only show in coach view */}
      {viewMode === 'coach' && !isAthlete && (
        <div className="flex items-center gap-0 px-4 sm:px-6 overflow-x-auto scrollbar-none border-t border-[#F3F4F6]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onScreenChange(tab.id)}
              disabled={tab.disabled}
              className={`text-sm font-medium px-4 py-3 border-b-2 transition-all whitespace-nowrap shrink-0 ${
                screen === tab.id
                  ? 'text-[#2563EB] border-[#2563EB]'
                  : tab.disabled
                  ? 'text-[#D1D5DB] border-transparent cursor-not-allowed'
                  : 'text-[#6B7280] border-transparent hover:text-[#111827]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {viewMode === 'athlete' && viewingAthlete && (
        <div className="hidden sm:flex items-center gap-3 px-6 py-2 border-t border-[#F3F4F6]">
          <span className="text-[#9CA3AF] text-xs font-semibold tracking-wider uppercase">Viewing as</span>
          <span className="text-[#111827] text-sm font-medium">{viewingAthlete.name}</span>
        </div>
      )}
    </header>
  );
}
