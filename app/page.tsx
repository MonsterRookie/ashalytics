"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Activity, AlertTriangle, ShieldCheck, CheckCircle, Copy, Languages } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useAudioRecorder } from "@/hooks/use-audio-recorder"; 

// IMPORT NEW COMPONENTS
import { TriageReasoning } from "@/components/ui/dashboard/triage-reasoning";
import { TranscriptTimeline } from "@/components/ui/dashboard/transcript-timeline";
import { ConsultationButton } from "@/components/ui/dashboard/consultation-button";

export default function Dashboard() {
  const { isRecording, startRecording, stopRecording, audioBase64 } = useAudioRecorder();
  const [analysis, setAnalysis] = useState<any>(null);
  const [status, setStatus] = useState<"idle" | "recording" | "processing" | "completed">("idle");
  const [error, setError] = useState<string | null>(null);

  // Sync Button Status with Recorder Hook
  useEffect(() => {
    if (isRecording) setStatus("recording");
    else if (status === "recording" && !isRecording) setStatus("processing");
  }, [isRecording, status]);

  // Handle Audio Analysis
  useEffect(() => {
    if (!audioBase64) return;

    const analyzeAudio = async () => {
      setStatus("processing");
      setAnalysis(null);
      setError(null);
      
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          body: JSON.stringify({ audio: audioBase64 }),
        });
        
        const data = await response.json();
        
        if (data.error) throw new Error(data.details || "AI Analysis Failed");
        
        setAnalysis(data);
        setStatus("idle");
        
        // FEATURE 6: HAPTIC FEEDBACK (Micro-interaction)
        if (typeof navigator !== "undefined" && navigator.vibrate) {
            if (data.triage?.status === "RED") navigator.vibrate([100, 50, 100]); // Double Pulse
            else if (data.triage?.status === "AMBER") navigator.vibrate([100]);   // Single Pulse
        }

      } catch (err: any) {
        console.error("Analysis Error:", err);
        setError(err.message || "Connection failed");
        setStatus("idle");
      }
    };

    analyzeAudio();
  }, [audioBase64]);

  // FEATURE 6: DYNAMIC GLOW (No flashing, just soft persistent glow)
  const riskGlowClass = 
    analysis?.triage?.status === "RED" ? "shadow-[inset_0_0_60px_-15px_rgba(239,68,68,0.15)]" : // Red Glow
    analysis?.triage?.status === "AMBER" ? "shadow-[inset_0_0_60px_-15px_rgba(245,158,11,0.1)]" : ""; // Amber Glow

  // FEATURE 4: SCRIPT UTILITIES
  const handleCopyScript = () => {
    if (analysis?.copilot?.script) {
      navigator.clipboard.writeText(analysis.copilot.script);
      alert("Script copied to clipboard!"); 
    }
  };

  return (
    <main className={`min-h-screen bg-slate-50 p-4 md:p-8 font-sans transition-all duration-1000 ${riskGlowClass}`}>
      
      {/* SUPERVISOR BANNER */}
      <div className="fixed top-0 left-0 w-full bg-slate-900 text-slate-300 text-[10px] uppercase tracking-widest text-center py-1 z-50 font-medium">
        Supervisor Mode Active • Final judgment remains with ASHA worker
      </div>

      <header className="mx-auto max-w-5xl flex items-center justify-between mb-8 mt-6">
        <div className="flex items-center gap-4"> 
          {/* INTRINSIC SIZING FOR LOGO */}
          <Image 
            src="/logo.png" 
            alt="ASHAlytics Logo" 
            width={180} 
            height={60} 
            className="object-contain" 
            priority 
          />
          <span className="text-slate-400 font-normal text-xl border-l-2 border-slate-300 pl-4 py-1 h-8 flex items-center">
            Supervisor
          </span>
        </div>

        <Badge variant="outline" className="bg-white text-slate-500 border-slate-200 shadow-sm">
          Online • Gemini 3 Pro
        </Badge>
      </header>

      {error && (
        <Alert variant="destructive" className="mx-auto max-w-5xl mb-6 bg-red-50 border-red-200 text-red-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>System Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: INTERACTIVE TRANSCRIPT */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-[60vh] flex flex-col shadow-sm border-slate-200 overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100 bg-white">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                Live Session Transcript
                {status === "recording" && <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 bg-slate-50/50">
              <ScrollArea className="h-full p-6">
                <TranscriptTimeline 
                    text={analysis?.analysis?.transcription} 
                    markers={analysis?.analysis?.psychological_markers || []} 
                />
              </ScrollArea>
            </CardContent>
          </Card>

          {/* FEATURE 5: STATEFUL BUTTON */}
          <ConsultationButton 
            status={status} 
            onClick={status === "recording" ? stopRecording : startRecording} 
          />
        </div>

        {/* RIGHT COLUMN: TRIAGE & EXPLAINABILITY */}
        <div className="space-y-6">
          <Card className={`border-l-4 shadow-md transition-colors duration-500 overflow-hidden
            ${analysis?.triage?.status === "RED" ? "border-l-red-500 ring-1 ring-red-100" : 
              analysis?.triage?.status === "AMBER" ? "border-l-amber-400 ring-1 ring-amber-100" : 
              "border-l-slate-300 ring-1 ring-slate-100"}`}>
            
            <CardHeader className="pb-2 bg-white">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Triage Status</CardTitle>
            </CardHeader>
            
            <CardContent className="pt-2">
              {analysis && !error ? (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    {analysis.triage.status === "RED" && <AlertTriangle className="h-6 w-6 text-red-500" />}
                    {analysis.triage.status === "AMBER" && <AlertTriangle className="h-6 w-6 text-amber-500" />}
                    {analysis.triage.status === "GREEN" && <CheckCircle className="h-6 w-6 text-emerald-500" />}
                    
                    <span className={`text-2xl font-bold tracking-tight
                      ${analysis.triage.status === "RED" ? "text-red-600" : 
                        analysis.triage.status === "AMBER" ? "text-amber-600" : "text-emerald-600"}`}>
                      {analysis.triage.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-6 font-medium leading-normal">{analysis.triage.title}</p>
                  
                  {/* FEATURE 4: SUGGESTED SCRIPT WITH UTILITIES */}
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 relative group">
                    <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase">Suggested Script</p>
                    <p className="text-sm text-slate-800 italic leading-relaxed">"{analysis.copilot.script}"</p>
                    
                    {/* Hover Actions */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white" onClick={handleCopyScript} title="Copy Script">
                         <Copy className="h-3 w-3 text-slate-400" />
                       </Button>
                       <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white" title="Translate (Coming Soon)">
                         <Languages className="h-3 w-3 text-slate-400" />
                       </Button>
                    </div>
                  </div>

                  {/* FEATURE 1 & 2: EXPLAINABILITY & OVERRIDE */}
                  <TriageReasoning analysis={analysis} />

                </>
              ) : (
                <div className="h-40 flex flex-col items-center justify-center text-slate-300 gap-2">
                  <Activity className="h-8 w-8 opacity-20" />
                  <span className="text-sm italic">Waiting for consultation data...</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Alert className="bg-white border-slate-200 shadow-sm">
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            <AlertTitle className="text-xs font-semibold text-slate-600">Advisory Only</AlertTitle>
            <AlertDescription className="text-[10px] text-slate-500 leading-tight mt-1">
              AI verification required. Do not rely solely on digital triage for critical diagnoses.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </main>
  );
}