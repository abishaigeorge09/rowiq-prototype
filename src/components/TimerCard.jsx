import { useState, useEffect, useRef, useCallback } from 'react';
import { formatTimer, formatTimerShort, getAvatarColor, generateId } from '../utils/helpers';

export default function TimerCard({
  boat, athletes, startTime, onStart, onFinish, finishTime, placement, allFinished
}) {
  const [elapsed, setElapsed] = useState(0);
  const [splits, setSplits] = useState([]);
  const [notes, setNotes] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [notesOpen, setNotesOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioSupported, setAudioSupported] = useState(true);
  const rafRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recordTimerRef = useRef(null);

  const isRunning = startTime && !finishTime;
  const isFinished = !!finishTime;

  // Timer animation loop
  const updateTimer = useCallback(() => {
    if (!startTime || finishTime) return;
    setElapsed(Date.now() - startTime);
    rafRef.current = requestAnimationFrame(updateTimer);
  }, [startTime, finishTime]);

  useEffect(() => {
    if (isRunning) {
      rafRef.current = requestAnimationFrame(updateTimer);
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isRunning, updateTimer]);

  useEffect(() => {
    if (finishTime && startTime) {
      setElapsed(finishTime - startTime);
    }
  }, [finishTime, startTime]);

  function handleSplit() {
    if (!isRunning) return;
    const now = Date.now();
    const cumulative = now - startTime;
    const lastSplit = splits.length > 0 ? splits[splits.length - 1].cumulative : 0;
    setSplits((prev) => [...prev, {
      num: prev.length + 1,
      cumulative,
      interval: cumulative - lastSplit,
    }]);
  }

  function handleFinish() {
    if (!isRunning) return;
    onFinish(boat.id, Date.now());
  }

  function handleSaveNote() {
    if (!noteText.trim()) return;
    setNotes((prev) => [...prev, {
      id: generateId(),
      type: 'text',
      content: noteText.trim(),
      time: new Date().toLocaleTimeString(),
    }]);
    setNoteText('');
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setNotes((prev) => [...prev, {
          id: generateId(),
          type: 'audio',
          url,
          time: new Date().toLocaleTimeString(),
          duration: recordingDuration,
        }]);
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        setRecordingDuration(0);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      let sec = 0;
      recordTimerRef.current = setInterval(() => {
        sec++;
        setRecordingDuration(sec);
      }, 1000);
    } catch {
      setAudioSupported(false);
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      clearInterval(recordTimerRef.current);
      mediaRecorderRef.current.stop();
    }
  }

  const crew = boat.seats
    .filter((s) => s.athleteId)
    .map((s) => athletes.find((a) => a.id === s.athleteId))
    .filter(Boolean);

  return (
    <div className="bg-[#111A2E] border border-white/[0.08] rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-white font-bold text-lg">{boat.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            {crew.map((a) => (
              <div
                key={a.id}
                className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                style={{ backgroundColor: getAvatarColor(a.colorIndex) }}
                title={a.name}
              >
                {a.initials}
              </div>
            ))}
          </div>
        </div>
        {placement && (
          <div className={`px-3 py-1 rounded-full text-sm font-bold ${
            placement === 1
              ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
              : placement === 2
              ? 'bg-[#94a3b8]/20 text-[#94a3b8]'
              : 'bg-[#CD7F32]/20 text-[#CD7F32]'
          }`}>
            {placement === 1 ? '🥇 1st' : placement === 2 ? '🥈 2nd' : `${placement}${placement === 3 ? 'rd' : 'th'}`}
          </div>
        )}
      </div>

      {/* Giant Timer */}
      <div className="text-center py-4">
        <div className={`font-mono text-5xl md:text-6xl font-bold tracking-wider ${
          isFinished ? 'text-[#22C55E]' : 'text-white'
        }`}>
          {formatTimer(elapsed)}
        </div>
      </div>

      {/* Controls */}
      {!startTime && !finishTime && (
        <div className="flex justify-center mb-4">
          <button
            onClick={() => onStart?.(boat.id)}
            className="px-8 py-2.5 rounded-lg bg-[#2563EB] text-white font-bold hover:bg-[#1d4ed8] transition-colors"
          >
            START
          </button>
        </div>
      )}
      {isRunning && (
        <div className="flex gap-3 mb-4">
          <button
            onClick={handleSplit}
            className="flex-1 py-2.5 rounded-lg bg-[#1E293B] border border-white/[0.08] text-white font-medium hover:bg-[#243049] transition-colors"
          >
            SPLIT
          </button>
          <button
            onClick={handleFinish}
            className="flex-1 py-2.5 rounded-lg bg-[#EF4444] text-white font-bold hover:bg-[#dc2626] transition-colors"
          >
            FINISH
          </button>
        </div>
      )}

      {/* Splits Log */}
      {splits.length > 0 && (
        <div className="mb-4">
          <div className="text-[#475569] text-xs font-semibold tracking-wider uppercase mb-2">Splits</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {splits.map((s) => (
              <div key={s.num} className="flex items-center justify-between text-sm bg-[#0B1120] rounded-lg px-3 py-1.5">
                <span className="text-[#64748B]">Split {s.num}</span>
                <span className="text-white font-mono">{formatTimerShort(s.cumulative)}</span>
                <span className="text-[#2563EB] font-mono text-xs">+{formatTimerShort(s.interval)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes Toggle */}
      <button
        onClick={() => setNotesOpen(!notesOpen)}
        className="text-[#64748B] text-xs hover:text-white transition-colors flex items-center gap-1"
      >
        <span>{notesOpen ? '▾' : '▸'}</span>
        Notes ({notes.length})
      </button>

      {notesOpen && (
        <div className="mt-3 space-y-3">
          {/* Text Note Input */}
          <div className="flex gap-2">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onBlur={handleSaveNote}
              placeholder="Add a note..."
              rows={2}
              className="flex-1 bg-[#0B1120] border border-white/[0.08] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#2563EB] transition-colors resize-none"
            />
            <button
              onClick={handleSaveNote}
              className="px-3 py-2 rounded-lg bg-[#1E293B] border border-white/[0.08] text-[#64748B] hover:text-white transition-colors text-sm self-end"
            >
              Save
            </button>
          </div>

          {/* Audio Recording */}
          {audioSupported ? (
            <div className="flex items-center gap-2">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1E293B] border border-white/[0.08] text-[#64748B] hover:text-white transition-colors text-sm"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                  Record Audio
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EF4444]/20 border border-[#EF4444]/30 text-[#EF4444] text-sm animate-pulse"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                  Stop ({recordingDuration}s)
                </button>
              )}
            </div>
          ) : (
            <p className="text-[#64748B] text-xs">Microphone access needed for audio notes.</p>
          )}

          {/* Saved Notes */}
          {notes.length > 0 && (
            <div className="space-y-2">
              {notes.map((n) => (
                <div key={n.id} className="bg-[#0B1120] rounded-lg px-3 py-2 text-sm">
                  <div className="text-[#475569] text-[10px] mb-1">{n.time}</div>
                  {n.type === 'text' ? (
                    <p className="text-[#94a3b8]">{n.content}</p>
                  ) : (
                    <audio controls src={n.url} className="w-full h-8" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
