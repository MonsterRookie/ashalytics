"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Activity, AlertTriangle, CheckCircle, GraduationCap, BarChart3, HelpCircle, ShieldAlert, Gavel } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  const [statsOpen, setStatsOpen] = useState(false); // Kept for future use

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

  const riskGlowClass =
    currentStatus === "RED" ? "shadow-[inset_0_0_60px_-15px_rgba(239,68,68,0.15)]" :
    currentStatus === "AMBER" ? "shadow-[inset_0_0_60px_-15px_rgba(245,158,11,0.1)]" : "";

  return (
    <main className={`h-screen w-full bg-slate-50 p-0 font-sans transition-all duration-1000 overflow-hidden flex flex-col ${riskGlowClass}`}>
      <LoginOverlay />

      {/* TOP BANNER */}
      <div className={`w-full text-[10px] uppercase tracking-widest text-center py-1.5 font-medium shrink-0 transition-colors
        ${mode === 'uplift' ? 'bg-teal-900 text-teal-100' : 'bg-slate-900 text-slate-300'}`}>
        {mode === 'uplift' ? `• Training Simulation Active • Coaching Enabled` : "Supervisor Mode Active • Final judgment remains with ASHA worker"}
      </div>

      <div className="w-full flex-1 border-none shadow-none bg-slate-50 rounded-none flex flex-col pt-0 px-0 pb-0 gap-0 min-h-0">

        {/* HEADER */}
        <div className="bg-white border-b border-slate-200 shrink-0">
          <div className="w-full px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-4 h-full">
              <div className="flex items-center h-full pt-1">
                <Image src="/logo.png" alt="ASHAlytics Logo" width={130} height={34} className="object-contain block" priority />
              </div>
              <Separator orientation="vertical" className="h-5 bg-slate-200" />
              <span className="text-slate-500 font-medium text-sm flex items-center gap-2">
                ASHA ID: <span className="text-slate-900 font-semibold">{ashaID || "Guest"}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 h-full">
              <Button variant="outline" size="sm" className={`h-8 text-xs font-semibold px-3 transition-all border flex items-center gap-2 ${mode === 'uplift' ? "border-teal-500 text-teal-700 bg-teal-50/50" : "text-slate-500 border-slate-200"}`} onClick={() => setMode(mode === 'normal' ? 'uplift' : 'normal')}>
                <GraduationCap className={`h-3.5 w-3.5 ${mode === 'uplift' ? "text-teal-600" : ""}`} />
                <span>Training</span>
              </Button>
            </div>
          </div>
        </div>

        {/* DASHBOARD CONTENT */}
        <div className="flex-1 pt-3 pb-3 px-4 flex flex-row gap-3 overflow-hidden min-h-0">

          {/* COLUMN 1: SESSION CONTEXT (Left Panel) */}
          <div className="w-[30%] space-y-2 h-full flex flex-col overflow-hidden">
            <Card className={`border-r-4 shadow-sm flex-1 flex flex-col overflow-hidden rounded-xl gap-0
                    ${currentStatus === "RED" ? "border-r-red-500" :
                      currentStatus === "AMBER" ? "border-r-amber-400" :
                      currentStatus === "GREEN" ? "border-r-emerald-500" :
                    "border-r-slate-300"}`}>
              <CardHeader className="pb-2 bg-white flex flex-row justify-between items-center shrink-0">
                <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Session Context</CardTitle>
              </CardHeader>
              <CardContent className="pt-2 flex-1 overflow-y-auto p-3">
                {analysis && !error ? (
                  <>
                    {/* Status Badge */}
                    <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      {currentStatus === "RED" && <AlertTriangle className="h-8 w-8 text-red-500" />}
                      {currentStatus === "AMBER" && <AlertTriangle className="h-8 w-8 text-amber-500" />}
                      {currentStatus === "GREEN" && <CheckCircle className="h-8 w-8 text-emerald-500" />}
                      <div>
                        <span className={`text-2xl font-bold tracking-tight block
                                    ${currentStatus === "RED" ? "text-red-600" :
                                      currentStatus === "AMBER" ? "text-amber-600" : "text-emerald-600"}`}>
                          {currentStatus}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                          {manualOverride ? "ASHA Override" : "AI Recommendation"}
                        </span>
                      </div>
                    </div>
                    
                    {/* AI REASONING & STRESS METER (Moved Above Emergency Playbook) */}
                    <TriageReasoning analysis={analysis} />

                    {/* EMERGENCY MODULES (Below Reasoning, Only if RED) */}
                    {currentStatus === "RED" && (
                      <div className="mt-4 animate-in slide-in-from-top-2">
                        <EmergencyPlaybook />
                        <RedIdentityModule />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                    <Activity className="h-10 w-10 opacity-20 animate-pulse" />
                    <span className="text-sm italic">Listening for clinical patterns...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* COLUMN 2: LIVE TRANSCRIPT */}
          <div className="w-[40%] flex flex-col h-full bg-slate-100/50 rounded-xl border border-slate-200/60 overflow-hidden shadow-sm">
            <div className="p-2 border-b border-slate-200/60 bg-slate-100/30 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-700 uppercase">Live Session</h3>
              {sessionSummary && <Badge variant="secondary" className="text-[9px] bg-blue-100 text-blue-700">Context Memory Active</Badge>}
            </div>

            <ScrollArea className="flex-1 p-2 pt-1">
              {transcriptHistory.length > 0 ? (
                transcriptHistory.map((item, index) => (
                  <div key={index} className={index > 0 ? "mt-4 pt-4 border-t border-slate-200" : ""}>
                    <TranscriptTimeline text={item.text} markers={item.markers} />
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 py-10">
                  <Activity className="h-8 w-8 mb-2 opacity-20" />
                  <span className="text-sm italic text-center px-4">Start recording to begin analysis</span>
                </div>
              )}
            </ScrollArea>

            <div className="p-2 bg-slate-100 border-t border-slate-200">
              <ConsultationButton status={status} onStart={startRecording} onStop={stopRecording} onReset={resetSession} />
            </div>
          </div>

          {/* COLUMN 3: DECISION CO-PILOT */}
          <div className="w-[30%] flex flex-col h-full gap-2">
            <Card className="h-full border-t-4 border-t-slate-600 shadow-md flex flex-col overflow-hidden rounded-xl">
              <CardHeader className="pb-2 border-b bg-slate-50/50 shrink-0">
                <CardTitle className="text-xs font-bold text-slate-700 uppercase tracking-wider flex justify-between items-center">
                  Decision Co-Pilot
                  <Badge variant="outline" className="text-[9px] border-slate-300 text-slate-500 font-normal">Human-in-the-loop</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-5 flex-1 overflow-y-auto">
                
                {/* 1. DYNAMIC GUIDED QUESTIONS */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <HelpCircle className="h-3 w-3" />
                    Internal Check-Questions
                  </h4>
                  {analysis?.copilot?.internal_guided_questions?.length > 0 ? (
                    <div className="space-y-2">
                      {analysis.copilot.internal_guided_questions.map((q: string, i: number) => (
                        <div key={i} className="p-2 bg-blue-50/50 border border-blue-100 rounded-md text-xs text-slate-700 leading-snug flex gap-2">
                          <span className="font-bold text-blue-400">{i+1}.</span>
                          {q}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded border border-slate-100">
                      No ambiguity detected. Waiting for next turn...
                    </p>
                  )}
                </div>

                <Separator />

                {/* 2. MANUAL OVERRIDE PROTOCOL */}
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Gavel className="h-3 w-3" />
                    Final ASHA Override
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handleOverride("GREEN")}
                      className={`h-14 flex flex-col gap-1 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-all group ${currentStatus === 'GREEN' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : ''}`}
                    >
                      <CheckCircle className="h-4 w-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold">Stable</span>
                    </Button>

                    <Button 
                      variant="outline" 
                      onClick={() => handleOverride("AMBER")}
                      className={`h-14 flex flex-col gap-1 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 transition-all group ${currentStatus === 'AMBER' ? 'bg-amber-50 border-amber-500 text-amber-700' : ''}`}
                    >
                      <AlertTriangle className="h-4 w-4 text-amber-500 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold">Monitor</span>
                    </Button>

                    <Button 
                      variant="outline" 
                      onClick={() => handleOverride("RED")}
                      className={`h-14 flex flex-col gap-1 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all group ${currentStatus === 'RED' ? 'bg-red-50 border-red-500 text-red-700' : ''}`}
                    >
                      <ShieldAlert className="h-4 w-4 text-red-500 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold">Crisis</span>
                    </Button>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-2 text-center">
                    Selecting an override will log a deviation report.
                  </p>
                </div>

              </CardContent>
            </Card>
          </div>
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