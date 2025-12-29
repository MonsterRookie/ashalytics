"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Activity, AlertTriangle, CheckCircle, GraduationCap, HelpCircle, ShieldAlert, Gavel, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";

// CONTEXT
import { AshalyseProvider, useAshalyse } from "@/components/ashalyse-context";

// COMPONENTS
import { LoginOverlay } from "@/components/dashboard/login-overlay";
import { TriageReasoning } from "@/components/dashboard/triage-reasoning";
import { TranscriptTimeline } from "@/components/dashboard/transcript-timeline";
import { ConsultationButton } from "@/components/dashboard/consultation-button";
import { EmergencyPlaybook } from "@/components/dashboard/emergency-playbook";
import { RedIdentityModule } from "@/components/dashboard/red-identity-module";

function DashboardContent() {
  const { mode, setMode, saveSession, ashaID, clearCurrentInteraction, updateSessionAnalysis } = useAshalyse();
  const { isRecording, startRecording, stopRecording, audioBase64 } = useAudioRecorder();

  const [analysis, setAnalysis] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "recording" | "processing" | "completed">("idle");
  const [error, setError] = useState<string | null>(null);
  const [manualOverride, setManualOverride] = useState<string | null>(null);

  // --- CUMULATIVE STATE FOR TRANSCRIPT AND MEMORY ---
  const [transcriptHistory, setTranscriptHistory] = useState<{ text: string, markers: string[] }[]>([]);
  const [sessionSummary, setSessionSummary] = useState<string>("");

  useEffect(() => {
    if (isRecording) setStatus("recording");
    else if (status === "recording" && !isRecording) setStatus("processing");
  }, [isRecording, status]);

  useEffect(() => {
    if (!audioBase64) return;
    const analyzeAudio = async () => {
      setStatus("processing");
      setError(null);
      
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            audio: audioBase64,
            sessionContext: sessionSummary
          }),
        });

        const data = await response.json();
        if (data.error) throw new Error(data.details || "AI Analysis Failed");

        setAnalysis(data);
        setStatus("completed");

        updateSessionAnalysis({
          stressScore: data.analysis.stress_score || 0,
          intent: data.analysis.intent_flag || "Unspecified",
          mismatch: data.analysis.mismatch_detected || false
        });

        setTranscriptHistory(prev => [
          ...prev,
          {
            text: data.analysis.transcription,
            markers: data.analysis.signals || []
          }
        ]);

        const intentLog = data.analysis.intent_flag ? `[Intent: ${data.analysis.intent_flag}]` : "";
        const riskLog = `Risk Score: ${data.analysis.stress_score}/100`;
        const newEntry = `Turn: "${data.analysis.transcription}". AI Tags: ${intentLog} ${riskLog}. Triage: ${data.triage.status}.`;
        
        setSessionSummary(prev => prev ? `${prev}\n${newEntry}` : newEntry);

      } catch (err: any) {
        console.error("Analysis Error:", err);
        setError(err.message || "Connection failed");
        setStatus("idle");
      }
    };
    analyzeAudio();
  }, [audioBase64]);

  // --- MANUAL OVERRIDE HANDLER ---
  const handleOverride = (overrideStatus: string) => {
    setManualOverride(overrideStatus); 
    saveSession(overrideStatus);
  };

  const resetSession = () => {
    setAnalysis(null);
    setTranscriptHistory([]);
    setSessionSummary("");
    setManualOverride(null);
    setStatus("idle");
    setError(null);
    clearCurrentInteraction();
  };

  const currentStatus = manualOverride || analysis?.triage?.status;

  // Aesthetic Risk Glows (Deepened Colors for better visibility)
  const riskGlowClass =
    currentStatus === "RED" ? "shadow-[inset_0_0_120px_-30px_rgba(239,68,68,0.2)] bg-[#FFE4E6]" : // Rose-100
    currentStatus === "AMBER" ? "shadow-[inset_0_0_120px_-30px_rgba(245,158,11,0.2)] bg-[#FEF3C7]" : // Amber-100
    currentStatus === "GREEN" ? "shadow-[inset_0_0_120px_-30px_rgba(16,185,129,0.15)] bg-[#D1FAE5]" : // Emerald-100
    "bg-[#ECEAE4]"; // Deepened Stone/Beige

  return (
    <main className={`h-screen w-full font-sans transition-all duration-1000 overflow-hidden flex flex-col ${riskGlowClass}`}>
      <LoginOverlay />

      {/* TOP BANNER */}
      <div className={`w-full text-[10px] uppercase tracking-[0.2em] text-center py-2 font-semibold shrink-0 transition-colors z-50
        ${mode === 'uplift' ? 'bg-teal-800 text-teal-100' : 'bg-stone-900 text-stone-300'}`}>
        {mode === 'uplift' ? `Training Simulation Active • Coaching Enabled` : "Supervisor Mode Active • Final judgment remains with ASHA worker"}
      </div>

      {/* HEADER - Floating & Clean */}
      <header className="px-6 pt-4 pb-2 shrink-0">
        <div className="max-w-[1700px] mx-auto w-full bg-[#FCFCFA]/80 backdrop-blur-md border border-stone-200/50 shadow-sm rounded-2xl px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-6 h-full">
              <div className="flex items-center h-full pt-1 opacity-90 hover:opacity-100 transition-opacity">
                <Image src="/logo.png" alt="ASHAlytics Logo" width={140} height={38} className="object-contain block" priority />
              </div>
              <div className="h-6 w-px bg-stone-200 rounded-full" />
              <div className="flex flex-col justify-center">
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Active Session</span>
                <span className="text-stone-700 font-semibold text-sm flex items-center gap-2">
                  ID: <span className="text-teal-900 font-bold font-mono bg-teal-50 px-1.5 rounded border border-teal-100">{ashaID || "Guest"}</span>
                </span>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className={`h-9 rounded-full px-4 text-xs font-semibold border transition-all gap-2 shadow-sm
                ${mode === 'uplift' 
                  ? "border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100" 
                  : "border-stone-200 text-stone-500 hover:bg-stone-50 bg-[#FCFCFA]"}`} 
              onClick={() => setMode(mode === 'normal' ? 'uplift' : 'normal')}
            >
              <GraduationCap className={`h-4 w-4 ${mode === 'uplift' ? "text-teal-600" : ""}`} />
              <span>Training Mode</span>
            </Button>
        </div>
      </header>

      {/* MAIN DASHBOARD CONTENT (Locked Layout) */}
      <div className="flex-1 p-4 overflow-hidden w-full overflow-x-auto">
        <div className="max-w-[1700px] h-full mx-auto flex gap-4 min-w-[1280px]">

          {/* COLUMN 1: CONTEXT (Wider Fixed Width) */}
          <section className="w-[30rem] shrink-0 h-full flex flex-col transition-[width] duration-300">
            <Card className={`h-full border-0 shadow-lg shadow-stone-200/40 rounded-3xl overflow-hidden flex flex-col bg-[#FCFCFA]/80 backdrop-blur-xl ring-1 ring-stone-100
                    ${currentStatus === "RED" ? "ring-red-200 bg-red-50/40" :
                      currentStatus === "AMBER" ? "ring-amber-200 bg-amber-50/40" :
                      currentStatus === "GREEN" ? "ring-emerald-200 bg-emerald-50/40" : ""}`}>
              
              <CardHeader className="pb-3 border-b border-stone-100/50 bg-white/40">
                <CardTitle className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="h-3 w-3 text-teal-500" />
                  Session Context
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-4 flex-1 overflow-y-auto px-5 space-y-4">
                {analysis && !error ? (
                  <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                    {/* Status Badge */}
                    <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 shadow-sm
                        ${currentStatus === "RED" ? "bg-red-100 border-red-200" :
                          currentStatus === "AMBER" ? "bg-amber-100 border-amber-200" :
                          "bg-emerald-100 border-emerald-200"}`}>
                      
                      <div className={`p-3 rounded-full shadow-sm ${currentStatus === "RED" ? "bg-white text-red-600" : currentStatus === "AMBER" ? "bg-white text-amber-600" : "bg-white text-emerald-600"}`}>
                        {currentStatus === "RED" && <ShieldAlert className="h-6 w-6" />}
                        {currentStatus === "AMBER" && <AlertTriangle className="h-6 w-6" />}
                        {currentStatus === "GREEN" && <CheckCircle className="h-6 w-6" />}
                      </div>
                      
                      <div>
                        <span className={`text-xl font-bold tracking-tight block
                                    ${currentStatus === "RED" ? "text-red-800" :
                                      currentStatus === "AMBER" ? "text-amber-800" : "text-emerald-800"}`}>
                          {currentStatus}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wide
                                    ${currentStatus === "RED" ? "text-red-700/70" :
                                      currentStatus === "AMBER" ? "text-amber-700/70" : "text-emerald-700/70"}`}>
                          {manualOverride ? "Override Active" : "AI Recommended"}
                        </span>
                      </div>
                    </div>
                    
                    {/* Reasoning Modules */}
                    <TriageReasoning analysis={analysis} />

                    {/* Emergency Modules */}
                    {currentStatus === "RED" && (
                      <div className="mt-6 animate-in slide-in-from-bottom-2 pt-4 border-t border-red-200/50 space-y-4">
                        <EmergencyPlaybook />
                        <RedIdentityModule />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-[40vh] flex flex-col items-center justify-center text-stone-300 gap-3">
                    <div className="h-16 w-16 rounded-full bg-stone-100/50 border border-stone-200 flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-stone-300" />
                    </div>
                    <span className="text-xs font-medium text-stone-400">Waiting for clinical input...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* COLUMN 2: LIVE SESSION (Fluid Center) */}
          <section className="flex-1 min-w-[450px] h-full flex flex-col">
            <div className="h-full bg-[#FCFCFA]/80 backdrop-blur-xl rounded-3xl border border-white/60 shadow-xl shadow-stone-200/30 flex flex-col overflow-hidden relative">
              
              {/* Header */}
              <div className="px-6 py-3 border-b border-stone-100/80 flex justify-between items-center bg-white/40">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest">Live Transcript</h3>
                {sessionSummary && <Badge variant="secondary" className="text-[9px] bg-teal-50 text-teal-700 border-teal-100 px-2 py-0.5 font-semibold tracking-wide">Context Active</Badge>}
              </div>

              {/* Scrollable Area */}
              <ScrollArea className="flex-1 p-6 relative">
                {transcriptHistory.length > 0 ? (
                  <div className="space-y-6 pb-20">
                    {transcriptHistory.map((item, index) => (
                      <div key={index} className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                        <TranscriptTimeline text={item.text} markers={item.markers} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 pointer-events-none">
                     <Image src="/logo.png" alt="Watermark" width={200} height={60} className="grayscale opacity-20 mb-4" />
                     <p className="text-sm font-medium text-stone-400">Secure Environment Ready</p>
                  </div>
                )}
              </ScrollArea>

              {/* Floating Action Bar */}
              <div className="p-4 bg-gradient-to-t from-[#FCFCFA] via-[#FCFCFA]/90 to-transparent absolute bottom-0 left-0 right-0 z-10">
                 <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-stone-100 ring-1 ring-stone-200/50">
                    <ConsultationButton 
                      status={status} 
                      onStart={startRecording} 
                      onStop={stopRecording} 
                      onReset={resetSession} 
                      hasSessionData={transcriptHistory.length > 0} 
                    />
                 </div>
              </div>
            </div>
          </section>

          {/* COLUMN 3: CO-PILOT (Increased Width) */}
          <section className="w-[28rem] shrink-0 h-full flex flex-col transition-[width] duration-300">
            <Card className="h-full border-0 shadow-lg shadow-stone-200/40 rounded-3xl overflow-hidden flex flex-col bg-[#FCFCFA]/80 backdrop-blur-xl ring-1 ring-stone-100">
              
              <CardHeader className="pb-3 border-b border-stone-100/50 bg-white/40">
                <CardTitle className="text-xs font-bold text-stone-400 uppercase tracking-widest flex justify-between items-center">
                  Decision Co-Pilot
                  <Badge variant="outline" className="text-[9px] border-stone-200 text-stone-400 font-medium bg-stone-50/50">HITL Active</Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-8 flex-1 overflow-y-auto">
                
                {/* 1. DYNAMIC GUIDED QUESTIONS */}
                <div>
                  <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <HelpCircle className="h-3 w-3 text-teal-500" />
                    Recommended Probes
                  </h4>
                  {analysis?.copilot?.internal_guided_questions?.length > 0 ? (
                    <div className="space-y-3">
                      {analysis.copilot.internal_guided_questions.map((q: string, i: number) => (
                        <div key={i} className="p-3 bg-teal-50/40 border border-teal-100/60 rounded-xl text-xs text-stone-600 leading-relaxed flex gap-3 shadow-sm transition-all hover:bg-teal-50 hover:shadow-md cursor-default">
                          <span className="font-bold text-teal-700 bg-white h-5 w-5 rounded-full flex items-center justify-center shadow-sm text-[10px] shrink-0">{i+1}</span>
                          {q}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 bg-stone-50/50 border border-stone-100 rounded-2xl text-center">
                      <p className="text-xs text-stone-400 italic">
                        Listening for ambiguity...
                      </p>
                    </div>
                  )}
                </div>

                <div className="h-px bg-stone-100 w-full" />

                {/* 2. MANUAL OVERRIDE PROTOCOL */}
                <div>
                  <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Gavel className="h-3 w-3 text-teal-500" />
                    Clinical Override
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => handleOverride("GREEN")}
                      className={`h-20 rounded-2xl flex flex-col gap-1.5 border transition-all duration-300 group bg-white
                        ${currentStatus === 'GREEN' 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-inner' 
                          : 'border-stone-200 text-stone-500 hover:border-emerald-200 hover:bg-emerald-50/50 hover:text-emerald-600'}`}
                    >
                      <CheckCircle className={`h-5 w-5 ${currentStatus === 'GREEN' ? 'text-emerald-600' : 'text-stone-300 group-hover:text-emerald-400'}`} />
                      <span className="text-[10px] font-bold">Stable</span>
                    </Button>

                    <Button 
                      variant="outline" 
                      onClick={() => handleOverride("AMBER")}
                      className={`h-20 rounded-2xl flex flex-col gap-1.5 border transition-all duration-300 group bg-white
                        ${currentStatus === 'AMBER' 
                          ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-inner' 
                          : 'border-stone-200 text-stone-500 hover:border-amber-200 hover:bg-amber-50/50 hover:text-amber-600'}`}
                    >
                      <AlertTriangle className={`h-5 w-5 ${currentStatus === 'AMBER' ? 'text-amber-600' : 'text-stone-300 group-hover:text-amber-400'}`} />
                      <span className="text-[10px] font-bold">Monitor</span>
                    </Button>

                    <Button 
                      variant="outline" 
                      onClick={() => handleOverride("RED")}
                      className={`h-20 rounded-2xl flex flex-col gap-1.5 border transition-all duration-300 group bg-white
                        ${currentStatus === 'RED' 
                          ? 'bg-red-50 border-red-300 text-red-800 shadow-inner' 
                          : 'border-stone-200 text-stone-500 hover:border-red-200 hover:bg-red-50/50 hover:text-red-600'}`}
                    >
                      <ShieldAlert className={`h-5 w-5 ${currentStatus === 'RED' ? 'text-red-600' : 'text-stone-300 group-hover:text-red-400'}`} />
                      <span className="text-[10px] font-bold">Crisis</span>
                    </Button>
                  </div>
                  <p className="text-[9px] text-stone-400 mt-3 text-center opacity-70">
                    *Override logs are audited for safety compliance.
                  </p>
                </div>

              </CardContent>
            </Card>
          </section>

        </div>
      </div>
    </main>
  );
}

export default function Dashboard() {
  return (
    <AshalyseProvider>
      <DashboardContent />
    </AshalyseProvider>
  );
}