"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Activity, AlertTriangle, CheckCircle, GraduationCap, BarChart3, ChevronRight, ChevronDown } from "lucide-react";
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
  const { mode, setMode, saveSession, ashaID, clearCurrentInteraction } = useAshalyse();
  const { isRecording, startRecording, stopRecording, audioBase64 } = useAudioRecorder();

  const [analysis, setAnalysis] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "recording" | "processing" | "completed">("idle");
  const [error, setError] = useState<string | null>(null);
  const [overrideState, setOverrideState] = useState<string | null>(null);
  const [followUp, setFollowUp] = useState<string | null>(null);
  const [showUpliftFeedback, setShowUpliftFeedback] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

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

        // 1. Append to UI Transcript History
        setTranscriptHistory(prev => [
          ...prev,
          {
            text: data.analysis.transcription,
            markers: data.analysis.signals || []
          }
        ]);

        // 2. Update Contextual Memory String for the Model
        const newEntry = `Turn: Individual said "${data.analysis.transcription}". AI Observed: ${data.triage.status}.`;
        setSessionSummary(prev => prev ? `${prev}\n${newEntry}` : newEntry);

        if (data.triage?.status) {
          saveSession(data.triage.status);
        }

        if (mode === 'uplift') {
          setTimeout(() => setShowUpliftFeedback(true), 1500);
        }
      } catch (err: any) {
        console.error("Analysis Error:", err);
        setError(err.message || "Connection failed");
        setStatus("idle");
      }
    };
    analyzeAudio();
  }, [audioBase64]);

  const resetSession = () => {
    setAnalysis(null);
    setTranscriptHistory([]);
    setSessionSummary("");
    setStatus("idle");
    setError(null);
    setOverrideState(null);
    setFollowUp(null);
    setShowUpliftFeedback(false);
    clearCurrentInteraction();
  };

  const riskGlowClass =
    analysis?.triage?.status === "RED" ? "shadow-[inset_0_0_60px_-15px_rgba(239,68,68,0.15)]" :
      analysis?.triage?.status === "AMBER" ? "shadow-[inset_0_0_60px_-15px_rgba(245,158,11,0.1)]" : "";

  return (
    <main className={`h-screen w-full bg-slate-50 p-0 font-sans transition-all duration-1000 overflow-hidden flex flex-col ${riskGlowClass}`}>
      <LoginOverlay />

      {/* TOP BANNER */}
      <div className={`w-full text-[10px] uppercase tracking-widest text-center py-1.5 font-medium shrink-0 transition-colors
        ${mode === 'uplift' ? 'bg-teal-900 text-teal-100' : 'bg-slate-900 text-slate-300'}`}>
        {mode === 'uplift' ? `• Training Simulation Active • Coaching Enabled` : "Supervisor Mode Active • Final judgment remains with ASHA worker"}
      </div>

      {/* MAIN CARD: Changed pt-3 to pt-0 to remove gap between banner and header */}
      <div className="w-full flex-1 border-none shadow-none bg-slate-50 rounded-none flex flex-col pt-0 px-0 pb-0 gap-0 min-h-0">

        {/* HEADER */}
        <div className="bg-white border-b border-slate-200 shrink-0">
          {/* Changed max-w-7xl to w-full and px-4 to ensure perfect left/right alignment with content below */}
          <div className="w-full px-4 h-14 flex items-center justify-between">

            {/* Left Section: Logo and ID */}
            <div className="flex items-center gap-4 h-full">
              <div className="flex items-center h-full pt-1">
                <Image
                  src="/logo.png"
                  alt="ASHAlytics Logo"
                  width={130}
                  height={34}
                  className="object-contain block"
                  priority
                />
              </div>
              <Separator orientation="vertical" className="h-5 bg-slate-200" />
              <span className="text-slate-500 font-medium text-sm flex items-center gap-2">
                ASHA ID: <span className="text-slate-900 font-semibold">{ashaID || "Guest"}</span>
              </span>
            </div>

            {/* Right Section: Buttons (Language Button Removed) */}
            <div className="flex items-center gap-2 h-full">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-teal-600 transition-colors h-8 w-8 p-0 flex items-center justify-center"
                onClick={() => setStatsOpen(true)}
              >
                <BarChart3 className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                className={`h-8 text-xs font-semibold px-3 transition-all border flex items-center gap-2 ${mode === 'uplift'
                  ? "border-teal-500 text-teal-700 bg-teal-50/50"
                  : "text-slate-500 border-slate-200"
                  }`}
                onClick={() => setMode(mode === 'normal' ? 'uplift' : 'normal')}
              >
                <GraduationCap className={`h-3.5 w-3.5 ${mode === 'uplift' ? "text-teal-600" : ""}`} />
                <span>Training</span>
              </Button>
            </div>
          </div>
        </div>

        {/* DASHBOARD CONTENT */}
        <div className="flex-1 pt-3 pb-3 px-4 flex flex-row gap-3 overflow-hidden min-h-0">

          {/* COLUMN 1: TRIAGE STATUS */}
          <div className="w-[30%] space-y-2 h-full flex flex-col overflow-hidden">
            <Card className={`border-r-4 shadow-sm flex-1 flex flex-col overflow-hidden rounded-xl gap-0
                    ${analysis?.triage?.status === "RED" ? "border-r-red-500" :
                analysis?.triage?.status === "AMBER" ? "border-r-amber-400" :
                  analysis?.triage?.status === "GREEN" ? "border-r-emerald-500" :
                    "border-r-slate-300"}`}>
              <CardHeader className="pb-2 bg-white flex flex-row justify-between items-center shrink-0">
                <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Triage Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-2 flex-1 overflow-y-auto p-3">
                {analysis && !error ? (
                  <>
                    <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      {analysis.triage.status === "RED" && <AlertTriangle className="h-8 w-8 text-red-500" />}
                      {analysis.triage.status === "AMBER" && <AlertTriangle className="h-8 w-8 text-amber-500" />}
                      {analysis.triage.status === "GREEN" && <CheckCircle className="h-8 w-8 text-emerald-500" />}
                      <div>
                        <span className={`text-2xl font-bold tracking-tight block
                                    ${analysis.triage.status === "RED" ? "text-red-600" :
                            analysis.triage.status === "AMBER" ? "text-amber-600" : "text-emerald-600"}`}>
                          {analysis.triage.status}
                        </span>
                      </div>
                    </div>
                    {analysis.triage.status === "RED" ? (
                      <><EmergencyPlaybook /><RedIdentityModule /></>
                    ) : (
                      <div className="bg-teal-50/50 p-4 rounded-lg border border-teal-100 mb-4">
                        <p className="text-[10px] font-bold text-teal-500 uppercase mb-1">Suggested Script</p>
                        <p className="text-sm text-slate-800 italic leading-relaxed">"{analysis.copilot?.suggested_script}"</p>
                      </div>
                    )}
                    <TriageReasoning analysis={analysis} />
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                    <Activity className="h-10 w-10 opacity-20" />
                    <span className="text-sm italic">Waiting for live patterns...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* COLUMN 2: CUMULATIVE TRANSCRIPT */}
          <div className="w-[40%] flex flex-col h-full bg-slate-100/50 rounded-xl border border-slate-200/60 overflow-hidden shadow-sm">
            <div className="p-2 border-b border-slate-200/60 bg-slate-100/30 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-700 uppercase">Session Transcript</h3>
              {sessionSummary && <Badge variant="secondary" className="text-[9px] bg-blue-100 text-blue-700">Context Active</Badge>}
            </div>

            <ScrollArea className="flex-1 p-2 pt-1">
              {transcriptHistory.length > 0 ? (
                transcriptHistory.map((item, index) => (
                  <div key={index} className={index > 0 ? "mt-4 pt-4 border-t border-slate-200" : ""}>
                    <TranscriptTimeline
                      text={item.text}
                      markers={item.markers}
                    />
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 py-10">
                  <Activity className="h-8 w-8 mb-2 opacity-20" />
                  <span className="text-sm italic text-center px-4">Start recording to see live transcription</span>
                </div>
              )}
            </ScrollArea>

            <div className="p-2 bg-slate-100 border-t border-slate-200">
              <ConsultationButton status={status} onStart={startRecording} onStop={stopRecording} onReset={resetSession} />
            </div>
          </div>

          {/* COLUMN 3: DECISION PANEL */}
          <div className="w-[30%] flex flex-col h-full gap-2">
            <Card className="h-full border-t-4 border-t-slate-600 shadow-md flex flex-col overflow-hidden rounded-xl">
              <CardHeader className="pb-2 border-b bg-slate-50/50 shrink-0">
                <CardTitle className="text-xs font-bold text-slate-700 uppercase tracking-wider flex justify-between">
                  Decision Panel
                  <span className="text-[9px] text-slate-400 font-normal lowercase">(ASHA Control)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4 flex-1 overflow-y-auto">
                <div className="space-y-2">
                  <Button onClick={() => setStatus("idle")} className="w-full justify-between h-auto py-3 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white">
                    Proceed with Guided Questions <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => setOverrideState('monitor')} className="w-full justify-between h-auto py-3 text-sm font-medium bg-[#FDF2D0] hover:bg-amber-100 text-amber-900 border border-amber-200">
                    Continue Monitoring <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-tight">Action Plan</h4>
                  <div className="flex flex-col gap-2">
                    {['Follow-up in 2 days', 'Follow-up in 1 week', 'Escalate to Supervisor'].map((opt) => (
                      <button key={opt} onClick={() => setFollowUp(opt)} className={`w-full flex items-center justify-between px-2 py-2 text-xs font-medium rounded-md ${followUp === opt ? 'bg-teal-100 ring-1 ring-teal-400 text-teal-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {opt} <ChevronDown className="h-3 w-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
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