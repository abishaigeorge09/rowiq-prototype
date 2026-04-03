import { useRef, useState } from 'react';
import BoatCard from './BoatCard';

export default function BoatSection({
  boats, athletes, onToggleSize, onRemove, published, onAddBoat, onTapSelect, onFillSeats
}) {
  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function scrollTo(dir) {
    if (!scrollRef.current) return;
    const cardWidth = 376;
    const newIndex = dir === 'left'
      ? Math.max(0, activeIndex - 1)
      : Math.min(boats.length - 1, activeIndex + 1);
    setActiveIndex(newIndex);
    scrollRef.current.scrollTo({ left: newIndex * cardWidth, behavior: 'smooth' });
  }

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-[#9CA3AF] text-xs font-semibold tracking-wider uppercase">Boats</span>
          {!published && (
            <button
              onClick={onAddBoat}
              className="text-[#2563EB] text-xs font-semibold hover:text-[#1d4ed8] transition-colors"
            >
              + Add Shell
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollTo('left')}
            className="w-7 h-7 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:text-[#111827] hover:border-[#D1D5DB] transition-colors"
          >
            ←
          </button>
          <div className="flex items-center gap-1.5">
            {boats.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeIndex ? 'w-4 bg-[#2563EB]' : 'w-1.5 bg-[#D1D5DB]'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => scrollTo('right')}
            className="w-7 h-7 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:text-[#111827] hover:border-[#D1D5DB] transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {/* Boat Cards Scroll */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth scrollbar-none"
      >
        {boats.map((boat) => (
          <div key={boat.id} className="snap-start">
            <BoatCard
              boat={boat}
              athletes={athletes}
              onToggleSize={onToggleSize}
              onRemove={onRemove}
              published={published}
              onTapSelect={onTapSelect}
              onFillSeats={onFillSeats}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
