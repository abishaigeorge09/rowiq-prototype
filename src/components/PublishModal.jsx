import { useState } from 'react';

export default function PublishModal({ onClose, onPublish }) {
  const [title, setTitle] = useState('Morning Practice');
  const [date, setDate] = useState('2026-03-30');
  const [time, setTime] = useState('06:00');
  const [note, setNote] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onPublish({ title, date, time, note });
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 w-full max-w-md mx-4">
        <h3 className="text-[#111827] font-bold text-xl mb-5">Publish Lineup</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[#9CA3AF] text-xs font-semibold tracking-wider uppercase block mb-1.5">
              Session Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[#111827] text-sm focus:outline-none focus:border-[#2563EB] transition-colors"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[#9CA3AF] text-xs font-semibold tracking-wider uppercase block mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[#111827] text-sm focus:outline-none focus:border-[#2563EB] transition-colors [color-scheme:dark]"
                required
              />
            </div>
            <div>
              <label className="text-[#9CA3AF] text-xs font-semibold tracking-wider uppercase block mb-1.5">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[#111827] text-sm focus:outline-none focus:border-[#2563EB] transition-colors [color-scheme:dark]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-[#9CA3AF] text-xs font-semibold tracking-wider uppercase block mb-1.5">
              Coach's Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full bg-[#F7F8FA] border border-[#E5E7EB] rounded-lg px-3 py-2.5 text-[#111827] text-sm focus:outline-none focus:border-[#2563EB] transition-colors resize-none"
              placeholder="Optional message to the crew..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg text-[#6B7280] bg-[#F3F4F6] border border-[#E5E7EB] hover:text-[#111827] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg text-[#111827] bg-[#2563EB] hover:bg-[#1d4ed8] transition-colors font-bold"
            >
              Publish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
