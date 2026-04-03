import { useState } from 'react';

export default function AddBoatModal({ onClose, onAdd, boats, onDelete }) {
  const [name, setName] = useState(`Shell ${boats.length + 1}`);
  const [size, setSize] = useState(8);

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), size);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 w-full max-w-sm mx-4">
        <h3 className="text-[#111827] font-bold text-lg mb-4">Add New Shell</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[#9CA3AF] text-xs font-semibold tracking-wider uppercase block mb-1.5">
              Boat Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#111827] text-sm focus:outline-none focus:border-[#2563EB] transition-colors"
              placeholder="e.g. Shell 4"
            />
          </div>

          <div>
            <label className="text-[#9CA3AF] text-xs font-semibold tracking-wider uppercase block mb-1.5">
              Size
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSize(4)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  size === 4
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                4× (Four)
              </button>
              <button
                type="button"
                onClick={() => setSize(8)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  size === 8
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-[#F3F4F6] text-[#6B7280] hover:text-[#111827]'
                }`}
              >
                8× (Eight)
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg text-[#6B7280] bg-[#F3F4F6] border border-[#E5E7EB] hover:text-[#111827] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg text-[#111827] bg-[#2563EB] hover:bg-[#1d4ed8] transition-colors font-medium"
            >
              Add Shell
            </button>
          </div>
        </form>

        {/* Delete existing boats */}
        {boats.length > 0 && (
          <div className="mt-6 pt-4 border-t border-[#E5E7EB]">
            <p className="text-[#9CA3AF] text-xs font-semibold tracking-wider uppercase mb-2">
              Remove Empty Boats
            </p>
            <div className="space-y-1">
              {boats.map((boat) => {
                const hasAthletes = boat.seats.some((s) => s.athleteId !== null);
                return (
                  <div key={boat.id} className="flex items-center justify-between text-sm py-1">
                    <span className="text-[#374151]">{boat.name} ({boat.size}×)</span>
                    {!hasAthletes ? (
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${boat.name}?`)) {
                            onDelete(boat.id);
                          }
                        }}
                        className="text-[#EF4444] text-xs hover:text-[#f87171] transition-colors"
                      >
                        Delete
                      </button>
                    ) : (
                      <span className="text-[#9CA3AF] text-xs">Has athletes</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
