"use client";

import { useEffect, useState } from "react";
import { Loader2, Mic, Square, CheckCircle2 } from "lucide-react";

interface ButtonProps {
  status: "idle" | "recording" | "processing" | "completed";
  onClick: () => void;
}

export function ConsultationButton({ status, onClick }: ButtonProps) {
  const [seconds, setSeconds] = useState(0);

  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (status === "recording") {
      setSeconds(0);
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  // State: RECORDING
  if (status === "recording") {
    return (
        <button onClick={onClick} className="w-full h-20 rounded-xl bg-red-50 border-2 border-red-100 flex items-center justify-between px-8 transition-all shadow-inner group">
          <div className="flex items-center gap-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-red-700 font-semibold tracking-wide">Recording Session...</span>
          </div>
          <div className="flex items-center gap-4">
             <span className="font-mono text-red-600 text-lg font-medium w-12 text-right">{formatTime(seconds)}</span>
             <div className="bg-red-200 p-2 rounded-full group-hover:bg-red-300 transition-colors">
                <Square className="h-5 w-5 text-red-700 fill-current" />
             </div>
          </div>
        </button>
    );
  }

  // State: PROCESSING
  if (status === "processing") {
    return (
        <button disabled className="w-full h-20 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center gap-3 cursor-not-allowed">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-slate-500 font-medium">Analyzing Patterns...</span>
        </button>
    );
  }
  
  // State: IDLE (Default)
  return (
    <button onClick={onClick} className="w-full h-20 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200/50 flex items-center justify-center gap-3 transition-all active:scale-[0.98]">
        <Mic className="h-6 w-6" />
        <span className="text-lg font-semibold tracking-tight">Tap to Consult</span>
    </button>
  );
}