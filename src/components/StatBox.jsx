export default function StatBox({ value, label, gold }) {
  return (
    <div className="flex-1 bg-[#F7F8FA] border border-[#E5E7EB] rounded-xl px-4 py-3 text-center min-w-0">
      <div className={`text-2xl font-bold ${gold ? 'text-[#F59E0B]' : 'text-[#111827]'}`}>
        {value ?? '—'}
      </div>
      <div className="text-[#9CA3AF] text-xs mt-0.5 leading-tight">{label}</div>
    </div>
  );
}
