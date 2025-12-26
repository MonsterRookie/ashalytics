"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, AlertTriangle, Activity, BrainCircuit } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function TriageReasoning({ analysis }: { analysis: any }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!analysis) return null;

  // 1. Extract New Contextual Fields
  const stressScore = analysis.analysis?.stress_score || 0;
  const intent = analysis.analysis?.intent_flag || "Unknown Intent";
  const mismatch = analysis.analysis?.mismatch_detected || false;
  const sentimentCat = analysis.analysis?.sentiment_category || "Neutral";
  
  // 2. Determine Color Logic
  const getStressColor = (score: number) => {
    if (score > 80) return "bg-red-500";
    if (score > 40) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const signals = analysis.analysis?.signals || [];
  const rationale = analysis.triage?.rationale || [];

  return (
    <div className="space-y-4 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* A) STRESS ENGINE METER */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm space-y-2">
        <div className="flex justify-between items-end mb-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <Activity className="h-3 w-3" /> Stress Index
          </span>
          <span className="text-xs font-mono font-bold text-slate-700">{stressScore}/100</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${getStressColor(stressScore)}`} 
            style={{ width: `${stressScore}%` }}
          />
        </div>
        <p className="text-[9px] text-slate-400 text-right pt-1">
          Based on linguistic flux & fragmentation
        </p>
      </div>

      {/* B) INTENT & SENTIMENT BADGES */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="text-[10px] uppercase bg-slate-100 text-slate-600 border-slate-200">
          <BrainCircuit className="h-3 w-3 mr-1 text-slate-400" />
          Intent: {intent}
        </Badge>
        <Badge variant="outline" className="text-[10px] uppercase border-slate-200 text-slate-500">
          Context: {sentimentCat}
        </Badge>
      </div>

      {/* C) PATTERN MISMATCH ALERT (Safety Critical) */}
      {mismatch && (
        <Alert variant="destructive" className="bg-amber-50 border-amber-200 py-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 text-xs font-bold ml-2">Pattern Mismatch Detected</AlertTitle>
          <AlertDescription className="text-amber-700 text-[10px] leading-tight ml-2 mt-1">
            Patient tone (Affect) does not match the severity of words spoken. Potential masking or stoicism. Investigate deeper.
          </AlertDescription>
        </Alert>
      )}

      <Separator className="bg-slate-100" />

      {/* D) EXPLAINABLE AI PANEL */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border border-slate-200 rounded-md bg-white shadow-sm">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span>AI Reasoning</span>
            {analysis.analysis?.confidence === "Low" && (
              <Badge variant="outline" className="h-4 px-1 text-[8px] border-amber-300 text-amber-600 bg-amber-50">Low Confidence</Badge>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>

        <CollapsibleContent className="px-3 pb-3 pt-2">
          <div className="space-y-3">
            
            {/* 1. SIGNALS */}
            {signals.length > 0 ? (
              <div>
                <h4 className="text-[9px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Key Signals</h4>
                <div className="flex flex-wrap gap-1.5">
                  {signals.map((signal: string, i: number) => (
                    <span key={i} className="inline-flex items-center px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-[10px] border border-indigo-100">
                      {signal}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
               <p className="text-[10px] text-slate-400 italic">No specific distress signals isolated.</p>
            )}

            {/* 2. RATIONALE */}
            {rationale.length > 0 && (
              <div className="pt-1">
                <h4 className="text-[9px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Logic Trace</h4>
                <ul className="space-y-2 relative border-l border-slate-200 ml-1 pl-3">
                  {rationale.map((r: string, i: number) => (
                    <li key={i} className="text-[11px] text-slate-600 leading-snug relative">
                      <div className="absolute -left-[17px] top-1.5 h-1.5 w-1.5 rounded-full bg-slate-300" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}