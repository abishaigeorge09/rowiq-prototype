import { useState } from 'react';
import { getAvatarColor } from '../utils/helpers';

export default function CreateRunSwapModal({ initialBoats, athletes, onClose, onCreate }) {
  // Deep clone so we don't mutate the parent state until saved
  const [boats, setBoats] = useState(() => JSON.parse(JSON.stringify(initialBoats)));
  const [swapSource, setSwapSource] = useState(null);

  function handleSeatClick(boatId, seatNum, athleteId) {
    if (!swapSource) {
      if (athleteId) setSwapSource({ boatId, seatNum, athleteId });
    } else {
      if (swapSource.boatId === boatId && swapSource.seatNum === seatNum) {
        // Deselect
        setSwapSource(null);
        return;
      }
      
      // Perform Swap across boats
      setBoats(prev => prev.map(boat => {
        const inA = boat.id === swapSource.boatId;
        const inB = boat.id === boatId;
        if (!inA && !inB) return boat;
        
        return {
          ...boat,
          seats: boat.seats.map(seat => {
            if (inA && seat.seatNum === swapSource.seatNum) return { ...seat, athleteId };
            if (inB && seat.seatNum === seatNum) return { ...seat, athleteId: swapSource.athleteId };
            return seat;
          })
        };
      }));
      setSwapSource(null);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#F7F8FA] w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh]">
        
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#E5E7EB] shrink-0">
          <div>
            <h2 className="text-[#111827] text-xl font-bold">New Run Lineup</h2>
            <p className="text-[#6B7280] text-sm mt-0.5">
              {swapSource ? 'Tap another athlete to swap' : 'Tap an athlete to swap their seat'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] hover:bg-[#E5E7EB] transition-colors">
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {boats.map((boat) => (
            <div key={boat.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-sm">
              <h3 className="text-[#111827] font-bold mb-4">{boat.name}</h3>
              <div className="flex flex-wrap gap-2">
                {boat.seats.map((seat) => {
                  const athlete = athletes.find(a => a.id === seat.athleteId);
                  const isSelected = swapSource?.boatId === boat.id && swapSource?.seatNum === seat.seatNum;
                  
                  return (
                    <button
                      key={seat.seatNum}
                      onClick={() => handleSeatClick(boat.id, seat.seatNum, seat.athleteId)}
                      className={`relative w-14 h-14 rounded-full flex flex-col items-center justify-center border-2 transition-all ${
                        isSelected 
                          ? 'border-[#2563EB] scale-110 shadow-lg z-10' 
                          : 'border-transparent hover:border-[#D1D5DB]'
                      } ${!athlete ? 'bg-[#F3F4F6] border-dashed border-[#D1D5DB]' : ''}`}
                      style={athlete ? { backgroundColor: getAvatarColor(athlete.colorIndex) } : {}}
                    >
                      {athlete ? (
                         <>
                           <span className="text-white text-sm font-bold">{athlete.initials}</span>
                         </>
                      ) : (
                         <span className="text-[#9CA3AF] text-xs font-semibold">{seat.seatNum}</span>
                      )}
                      
                      {/* Seat indicator */}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border border-[#E5E7EB] shadow-sm">
                        <span className="text-[9px] font-bold text-[#6B7280]">{seat.seatNum}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-white border-t border-[#E5E7EB] flex gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-[#F3F4F6] text-[#374151] font-semibold hover:bg-[#E5E7EB] transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onCreate(boats)}
            className="flex-1 py-3 rounded-xl bg-[#2563EB] text-white font-bold tracking-wide hover:bg-[#1d4ed8] transition-colors shadow-sm active:scale-95"
          >
            Create Run
          </button>
        </div>
      </div>
    </div>
  );
}
