"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Activity, AlertTriangle, ShieldCheck, CheckCircle, Copy, Languages, GraduationCap, User, BarChart3, X, MessageSquareWarning, ChevronRight, Info, Sparkles, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
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

// --- INNER DASHBOARD (Logic) ---
function DashboardContent() {
  const { language, setLanguage, mode, setMode, aptID, currentPatient, saveSession, t, ashaID } = useAshalyse();
  const { isRecording, startRecording, stopRecording, audioBase64 } = useAudioRecorder();
  const [analysis, setAnalysis] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "recording" | "processing" | "completed">("idle");
  const [error, setError] = useState<string | null>(null);
  const [overrideState, setOverrideState] = useState<string | null>(null);
  const [followUp, setFollowUp] = useState<string | null>(null);
  const [showUpliftFeedback, setShowUpliftFeedback] = useState(false);
  const [misinterpretationReason, setMisinterpretationReason] = useState<string | null>(null);

  // Supervisor Stats State (Mock Data)
  const [statsOpen, setStatsOpen] = useState(false);

  useEffect(() => {
    if (isRecording) setStatus("recording");
    else if (status === "recording" && !isRecording) setStatus("processing");
  }, [isRecording, status]);

  useEffect(() => {
    if (!audioBase64) return;
    const analyzeAudio = async () => {
      setStatus("processing");
      setAnalysis(null);
      setError(null);
      setOverrideState(null);
      setFollowUp(null);
      setMisinterpretationReason(null);
      setShowUpliftFeedback(false);
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          body: JSON.stringify({ audio: audioBase64 }),
        });
        const data = await response.json();
        if (data.error) throw new Error(data.details || "AI Analysis Failed");
        setAnalysis(data);
        setStatus("completed");

        // Auto-save session if valid
        if (data.triage?.status) {
          saveSession(data.triage.status);
        }

        if (mode === 'uplift') {
          setTimeout(() => setShowUpliftFeedback(true), 1500);
        }

        if (typeof navigator !== "undefined" && navigator.vibrate) {
          if (data.triage?.status === "RED") navigator.vibrate([100, 50, 100]);
          else if (data.triage?.status === "AMBER") navigator.vibrate([100]);
        }
      } catch (err: any) {
        console.error("Analysis Error:", err);
        setError(err.message || "Connection failed");
        setStatus("idle"); // Reset to idle to allow retry
      }
    };
    analyzeAudio();
  }, [audioBase64]);

  // Reset session functionality
  const resetSession = () => {
    setAnalysis(null);
    setStatus("idle");
    setError(null);
    setOverrideState(null);
    setFollowUp(null);
    setMisinterpretationReason(null);
    setShowUpliftFeedback(false);
  };

  const riskGlowClass =
    analysis?.triage?.status === "RED" ? "shadow-[inset_0_0_60px_-15px_rgba(239,68,68,0.15)]" :
      analysis?.triage?.status === "AMBER" ? "shadow-[inset_0_0_60px_-15px_rgba(245,158,11,0.1)]" : "";

  return (
    <main className={`h-screen w-full bg-slate-50 p-0 font-sans transition-all duration-1000 overflow-hidden ${riskGlowClass}`}>
      <LoginOverlay />

      {/* MODE BANNER (Training) */}
      <div className={`fixed top-0 left-0 w-full text-[10px] uppercase tracking-widest text-center py-1 z-50 font-medium transition-colors
        ${mode === 'uplift' ? 'bg-teal-900 text-teal-100' : 'bg-slate-900 text-slate-300'}`}>
        {mode === 'uplift' ? `� Training Simulation Active • Coaching Enabled` : "Supervisor Mode Active • Final judgment remains with ASHA worker"}
      </div>

      {/* TRAINING FEEDBACK TOAST */}
      {showUpliftFeedback && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-teal-800 text-white px-6 py-3 rounded-full shadow-lg animate-in slide-in-from-bottom-5 fade-in duration-700 flex items-center gap-3">
          <GraduationCap className="h-5 w-5 text-teal-300" />
          <span className="font-medium text-sm">You handled a difficult situation with care.</span>
          <Button size="icon" variant="ghost" className="h-4 w-4 text-teal-300 hover:text-white rounded-full ml-2" onClick={() => setShowUpliftFeedback(false)}>×</Button>
        </div>
      )}

      {/* SUPERVISOR STATS DIALOG */}
      <Dialog open={statsOpen} onOpenChange={setStatsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-500" />
              Weekly Summary
            </DialogTitle>
            <DialogDescription>aggregated data • no personal identities</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="bg-emerald-50 p-4 rounded-lg flex flex-col items-center border border-emerald-100">
              <span className="text-2xl font-bold text-emerald-600">12</span>
              <span className="text-xs text-emerald-700 uppercase font-bold mt-1">Green</span>
            </div>
            <div className="bg-amber-50 p-4 rounded-lg flex flex-col items-center border border-amber-100">
              <span className="text-2xl font-bold text-amber-600">3</span>
              <span className="text-xs text-amber-700 uppercase font-bold mt-1">Amber</span>
            </div>
            <div className="bg-red-50 p-4 rounded-lg flex flex-col items-center border border-red-100">
              <span className="text-2xl font-bold text-red-600">1</span>
              <span className="text-xs text-red-700 uppercase font-bold mt-1">Red</span>
            </div>
          </div>
          <div className="bg-slate-100 p-3 rounded text-[10px] text-slate-500 font-mono">
            Common Themes: #Anxiety, #SocialIsolation, #SomaticPain
          </div>
        </DialogContent>
      </Dialog>

      <Card className="w-full h-full border-none shadow-none bg-slate-50 rounded-none flex flex-col pt-3 pb-0 px-0 gap-0">

        {/* HEADER */}
        <div className="bg-white border-b border-slate-200 px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0 rounded-t-lg">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="ASHAlytics Logo" width={140} height={40} className="object-contain h-10 w-auto" priority />
            <div className="hidden md:flex flex-col border-l-2 border-slate-200 pl-4 justify-center h-10">
              <span className="text-slate-600 font-medium text-sm">
                ASHA ID: {ashaID || "Guest"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-teal-600 h-8 w-8 p-0"
              onClick={() => setStatsOpen(true)}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 text-xs transition-all border-2 ${mode === 'uplift' ? "border-teal-500 text-teal-700 bg-teal-50/50" : "text-slate-500 border-slate-200"}`}
              onClick={() => setMode(mode === 'normal' ? 'uplift' : 'normal')}
            >
              <GraduationCap className={`h-3 w-3 mr-2 ${mode === 'uplift' ? "text-teal-600" : ""}`} />
              Training Mode
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="h-8 font-bold text-slate-600 border-slate-200 text-xs"
            >
              <Languages className="h-3 w-3 mr-2" />
              {language === 'en' ? "EN" : "हिंदी"}
            </Button>
          </div>
        </div>

        {/* MAIN CONTENT GRID (FLEX NOW) */}
        <div className="flex-1 pt-3 pb-3 px-4 flex flex-row gap-3 overflow-hidden min-h-0">

          {/* COLUMN 1: TRIAGE STATUS (30%) */}
          <div className="w-[30%] space-y-2 h-full flex flex-col overflow-hidden">
            <Card className={`border-r-4 shadow-sm flex-1 flex flex-col overflow-hidden rounded-xl gap-0
                    ${analysis?.triage?.status === "RED" ? "border-r-red-500" :
                analysis?.triage?.status === "AMBER" ? "border-r-amber-400" :
                  analysis?.triage?.status === "GREEN" ? "border-r-emerald-500" :
                    "border-r-slate-300"}`}>

              <CardHeader className="pb-2 bg-white flex flex-row justify-between items-center shrink-0">
                <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Triage Status</CardTitle>
                {analysis?.analysis?.confidence && (
                  <Badge variant="outline" className="text-[10px] font-normal text-slate-400 border-slate-200">
                    {analysis.analysis.confidence} Confidence
                  </Badge>
                )}
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
                        {analysis?.analysis?.confidence && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            Confidence: {analysis.analysis.confidence}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* RED PLAYBOOK OR SCRIPT */}
                    {analysis.triage.status === "RED" ? (
                      <>
                        <EmergencyPlaybook />
                        <RedIdentityModule />
                      </>
                    ) : (
                      <div className="bg-teal-50/50 p-4 rounded-lg border border-teal-100 relative group mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-[10px] font-bold text-teal-500 uppercase">Suggested Script</p>
                          {analysis.context_analysis?.estimated_age_group && (
                            <span className="text-[10px] bg-white px-1.5 py-0.5 rounded text-teal-700 font-medium border border-teal-100 shadow-sm">
                              Tone: {analysis.context_analysis.estimated_age_group}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-800 italic leading-relaxed">
                          "{analysis.copilot?.suggested_script || analysis.copilot?.script}"
                        </p>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white"
                            onClick={() => navigator.clipboard.writeText(analysis.copilot?.suggested_script || analysis.copilot?.script)}>
                            <Copy className="h-3 w-3 text-slate-400" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <TriageReasoning analysis={analysis} />

                    {/* TRAINING INSIGHT */}
                    {mode === 'uplift' && analysis && (
                      <div className="mt-4 bg-teal-50 border border-teal-100 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-2 mb-2">
                          <GraduationCap className="h-4 w-4 text-teal-600" />
                          <h4 className="text-xs font-bold text-teal-800 uppercase">Training Insight</h4>
                        </div>
                        <p className="text-xs text-teal-700 italic">
                          "You handled the individual's anxiety well by remaining calm. A good tip for next time: Validate their specific physical complaint before moving to emotional questions."
                        </p>
                      </div>
                    )}

                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 min-h-[200px]">
                    <Activity className="h-10 w-10 opacity-20" />
                    <span className="text-sm italic">Waiting for consultation data...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* COLUMN 2: TRANSCRIPT */}
          <div className="w-[40%] flex flex-col h-full bg-slate-100/50 rounded-xl border border-slate-200/60 overflow-hidden shadow-sm">
            <div className="p-2 border-b border-slate-200/60 bg-slate-100/30">
              <h3 className="text-xs font-bold text-slate-700 uppercase">Live Session Transcript</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Shown for clarity. Not saved.</p>
            </div>

            <div className="flex-1 overflow-hidden relative flex flex-col">
              {/* CASE REF BAR INSIDE TRANSCRIPT */}
              {aptID && (
                <div className="mx-2 mt-2 mb-1 bg-slate-200/50 rounded-md p-1.5 flex items-center text-[10px] text-slate-500 font-mono border border-slate-200">
                  <span className="font-semibold mr-2">Case Ref:</span>
                  {aptID}
                </div>
              )}

              <ScrollArea className="flex-1 p-2 pt-1">
                <TranscriptTimeline
                  text={analysis?.analysis?.transcription}
                  markers={analysis?.analysis?.signals || analysis?.analysis?.psychological_markers || []}
                />
              </ScrollArea>
            </div>

            <div className="p-2 bg-slate-100 border-t border-slate-200">
              <ConsultationButton
                status={status}
                onStart={startRecording}
                onStop={stopRecording}
                onReset={resetSession}
              />
            </div>
          </div>

          {/* COLUMN 3: DECISION PANEL */}
          <div className="w-[30%] flex flex-col h-full gap-2 overflow-hidden">
            <Card className="h-full border-t-4 border-t-slate-600 shadow-md flex flex-col overflow-hidden rounded-xl gap-0">
              <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/50 shrink-0">
                <CardTitle className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  DECISION PANEL
                  <span className="text-[10px] text-slate-400 font-normal normal-case">(Final ASHA Authority)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4 flex-1 overflow-y-auto">

                {/* PRIMARY ACTIONS */}
                <div className="space-y-2">
                  <Button
                    onClick={() => setOverrideState('ask')}
                    className={`w-full justify-between h-auto py-3 text-sm font-medium shadow-sm transition-all
                      ${overrideState === 'ask'
                        ? 'bg-blue-800 text-white ring-2 ring-blue-400 ring-offset-2'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                  >
                    Proceed with Guided Questions
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={() => setOverrideState('monitor')}
                    className={`w-full justify-between h-auto py-3 text-sm font-medium shadow-sm transition-all
                      ${overrideState === 'monitor'
                        ? 'bg-amber-200 text-amber-900 ring-2 ring-amber-400 ring-offset-2'
                        : 'bg-[#FDF2D0] hover:bg-amber-100 text-amber-900 border border-amber-200'}`}
                  >
                    Continue Monitoring
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                {/* ...Rest of content... */}


                {/* ACTION PLAN SELECTION */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-700">Action Plan</h4>
                  <div className="flex flex-col gap-2">
                    {['Follow-up in 2 days', 'Follow-up in 1 week', 'Escalate to Supervisor / PHC'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setFollowUp(opt)}
                        className={`w-full flex items-center justify-between px-2 py-2 text-xs font-medium rounded-md transition-colors
                          ${followUp === opt
                            ? 'bg-teal-100 text-teal-900 ring-1 ring-teal-400'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                      >
                        {opt}
                        <ChevronDown className="h-3 w-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI SUMMARY / STATS */}
                <div>
                  <div className="flex items-center gap-2 mb-2 text-slate-400">
                    <Sparkles className="h-3 w-3" />
                    <span className="text-[10px] font-bold">3</span>
                    <Info className="h-3 w-3" />
                  </div>

                  <div className="bg-teal-50 rounded-lg p-3 border border-teal-100/50">
                    <h5 className="text-[10px] font-bold text-teal-800 uppercase mb-2 flex items-center gap-1">
                      <span className="text-teal-500">•</span> Action Plan :
                    </h5>
                    <div className="space-y-1">
                      {analysis?.copilot?.next_steps?.length > 0 ? (
                        analysis.copilot.next_steps.map((step: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                            <CheckCircle className="h-3 w-3 text-teal-600 mt-0.5 flex-shrink-0" />
                            <span>{step}</span>
                          </div>
                        ))
                      ) : (
                        // Default Fallback matching image if no analysis yet
                        <>
                          <div className="flex items-start gap-2 text-xs text-slate-700">
                            <CheckCircle className="h-3 w-3 text-teal-600 mt-0.5 flex-shrink-0" />
                            <span>Follow-up in 2 days</span>
                          </div>
                          <div className="flex items-start gap-2 text-xs text-slate-700">
                            <CheckCircle className="h-3 w-3 text-teal-600 mt-0.5 flex-shrink-0" />
                            <span>Follow-up in 1 week</span>
                          </div>
                          <div className="flex items-start gap-2 text-xs text-slate-700">
                            <CheckCircle className="h-3 w-3 text-teal-600 mt-0.5 flex-shrink-0" />
                            <span>Escalate to Supervisor / PHC</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* FAILURE-FIRST OVERRIDE BUTTON (Small at bottom) */}
                <div className="mt-auto pt-2">
                  {!misinterpretationReason && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-[10px] text-slate-300 hover:text-red-500 hover:bg-transparent h-auto py-1 justify-start px-0"
                      onClick={() => setMisinterpretationReason('selecting')}
                    >
                      <MessageSquareWarning className="h-3 w-3 mr-1.5" />
                      Report Issue
                    </Button>
                  )}
                  {misinterpretationReason && (
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <div className="flex items-center justify-between text-[10px] text-slate-600">
                        <span>Reported: {misinterpretationReason}</span>
                        <Button size="icon" variant="ghost" className="h-4 w-4" onClick={() => setMisinterpretationReason(null)}><X className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  )}
                </div>

              </CardContent>
            </Card>
          </div>

        </div>

        {/* FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 py-1 px-4 text-center shrink-0 flex h-8 items-center justify-center">
          <span className="text-[10px] text-slate-400">
            ASHAlytics supports case-based decision-making. It does not diagnose, prescribe, store audio, or replace human judgment.
          </span>
        </div>
      </Card>

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