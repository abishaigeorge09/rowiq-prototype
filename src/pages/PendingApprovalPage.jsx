import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function PendingApprovalPage() {
  const navigate = useNavigate();
  const { signOut, user } = useAuthStore();

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  const isRejected = user?.status === 'rejected';

  return (
    <div className="relative min-h-dvh bg-[#0B1120] flex flex-col text-white overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2563EB]/[0.04] blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-sm">
          <div className="relative mb-8 inline-block">
            <div className={`absolute inset-0 blur-[40px] rounded-full ${isRejected ? 'bg-red-500/15' : 'bg-amber-500/15'}`} />
            <div className={`relative border rounded-full w-20 h-20 flex items-center justify-center mx-auto ${
              isRejected
                ? 'bg-red-950/30 border-red-500/30'
                : 'bg-amber-950/30 border-amber-500/30'
            }`}>
              {isRejected ? (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              ) : (
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              )}
            </div>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight mb-2">
            {isRejected ? 'Application Not Approved' : 'Pending Approval'}
          </h1>
          <p className="text-[#64748B] text-sm leading-relaxed mb-8 max-w-xs mx-auto">
            {isRejected
              ? 'Your coach application was not approved. Contact us if you believe this is an error.'
              : 'Your coach account is under review. You\'ll be able to sign in once approved — usually within 24 hours.'}
          </p>

          <button
            onClick={handleSignOut}
            className="w-full py-3 rounded-xl bg-white text-[#0B1120] text-[11px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-all"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
