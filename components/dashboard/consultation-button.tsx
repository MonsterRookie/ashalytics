"use client";

import { useEffect, useState } from "react";
import { Loader2, Mic, Square, CheckCircle2, ArrowRight, XCircle, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ButtonProps {
  status: "idle" | "recording" | "processing" | "completed";
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  hasSessionData?: boolean; // New prop to track if session is active
}

export function ConsultationButton({ status, onStart, onStop, onReset, hasSessionData = false }: ButtonProps) {
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

  // 1. RECORDING STATE (Priority 1)
  if (status === "recording") {
    return (
      <button
        onClick={onStop}
        className="w-full h-16 rounded-xl bg-red-50 border-2 border-red-100 flex items-center justify-between px-6 transition-all shadow-inner group animate-in fade-in slide-in-from-bottom-2 duration-300"
      >
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-red-700 font-medium tracking-wide text-sm">Recording...</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-red-600 text-sm font-medium w-12 text-right">{formatTime(seconds)}</span>
          <div className="bg-red-200 p-1.5 rounded-full group-hover:bg-red-300 transition-colors">
            <Square className="h-4 w-4 text-red-700 fill-current" />
          </div>
        </div>
      </button>
    );
  }

  // 2. PROCESSING STATE (Priority 2)
  if (status === "processing") {
    return (
      <button disabled className="w-full h-16 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center gap-2 cursor-not-allowed animate-pulse">
        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        <span className="text-slate-500 font-medium text-sm">Analyzing Patterns...</span>
      </button>
    );
  }

  // 3. IDLE STATE (Only if NO session data exists)
  if (status === "idle" && !hasSessionData) {
    return (
      <button
        onClick={onStart}
        className="w-full h-16 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200/50 flex items-center justify-center gap-3 transition-all active:scale-[0.98] animate-in fade-in zoom-in-95 duration-300"
      >
        <Mic className="h-5 w-5" />
        <span className="text-base font-semibold tracking-wide">Tap to Consult</span>
      </button>
    );
  }

  // 4. ACTIVE SESSION STATE (Completed OR Idle with History)
  // This ensures buttons persist even if status reverts to 'idle' on error/timeout
  return (
    <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards">
      <Button
        onClick={onStart}
        className="flex-1 h-14 bg-blue-700 hover:bg-blue-800 text-white border-0 shadow-md transition-all active:scale-95"
      >
        <ArrowRight className="h-4 w-4 mr-2" />
        Follow Up
      </Button>

      <Button
        variant="outline"
        onClick={onReset}
        className="flex-shrink-0 h-14 px-6 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
      >
        <StopCircle className="h-4 w-4 mr-2" />
        End Conversation
      </Button>
    </div>
  );
}