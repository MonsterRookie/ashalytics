"use client";

import { useState } from "react";
import { ChevronDown, AlertTriangle, Activity, BrainCircuit } from "lucide-react";
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
      
      {/* A) STRESS ENGINE METER (HEAVY ROUNDED) */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-2.5">
        <div className="flex justify-between items-end mb-1">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-stone-400" /> Stress Index
          </span>
          <span className="text-sm font-mono font-bold text-stone-700">{stressScore}/100</span>
        </div>
        <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out rounded-full ${getStressColor(stressScore)}`} 
            style={{ width: `${stressScore}%` }}
          />
        </div>
        <p className="text-[9px] text-stone-400 text-right pt-0.5">
          Based on linguistic flux & fragmentation
        </p>
      </div>

      {/* B) INTENT & SENTIMENT BADGES */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="text-[10px] uppercase bg-stone-100 text-stone-600 border-stone-200 px-2.5 py-1 rounded-lg">
          <BrainCircuit className="h-3 w-3 mr-1.5 text-stone-400" />
          Intent: {intent}
        </Badge>
        <Badge variant="outline" className="text-[10px] uppercase border-stone-200 text-stone-500 px-2.5 py-1 rounded-lg">
          Context: {sentimentCat}
        </Badge>
      </div>

      {/* C) PATTERN MISMATCH ALERT */}
      {mismatch && (
        <Alert variant="destructive" className="bg-amber-50 border-amber-200 py-3 rounded-2xl">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800 text-xs font-bold ml-2">Pattern Mismatch Detected</AlertTitle>
          <AlertDescription className="text-amber-700 text-[10px] leading-tight ml-2 mt-1">
            Patient tone (Affect) does not match the severity of words spoken. Potential masking or stoicism. Investigate deeper.
          </AlertDescription>
        </Alert>
      )}

      <Separator className="bg-stone-100" />

      {/* D) EXPLAINABLE AI PANEL (HEAVY ROUNDED) */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border border-stone-200 rounded-2xl bg-white shadow-sm overflow-hidden">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 text-xs font-bold text-stone-500 hover:text-stone-800 transition-colors uppercase tracking-wider bg-stone-50/30">
          <div className="flex items-center gap-2">
            <span>AI Reasoning</span>
            {analysis.analysis?.confidence === "Low" && (
              <Badge variant="outline" className="h-4 px-1 text-[8px] border-amber-300 text-amber-600 bg-amber-50">Low Confidence</Badge>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>

        <CollapsibleContent className="px-4 pb-4 pt-2">
          <div className="space-y-4">
            
            {/* 1. SIGNALS */}
            {signals.length > 0 ? (
              <div>
                <h4 className="text-[9px] font-bold text-stone-400 mb-2 uppercase tracking-wide">No specific distress signals isolated.</h4>
                {/* Note: If signals ARE present, logic allows rendering them here. Typically signals is empty if "No specific distress..." */}
                <div className="flex flex-wrap gap-1.5">
                  {signals.map((signal: string, i: number) => (
                    <span key={i} className="inline-flex items-center px-2 py-1 rounded-md bg-stone-50 text-stone-600 text-[10px] border border-stone-100 font-medium">
                      {signal}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
               <p className="text-[10px] text-stone-400 italic">No specific distress signals isolated.</p>
            )}

            {/* 2. RATIONALE */}
            {rationale.length > 0 && (
              <div className="pt-1">
                <h4 className="text-[9px] font-bold text-stone-400 mb-2 uppercase tracking-wide">Logic Trace</h4>
                <ul className="space-y-2.5 relative border-l border-stone-200 ml-1.5 pl-4">
                  {rationale.map((r: string, i: number) => (
                    <li key={i} className="text-[11px] text-stone-600 leading-snug relative">
                      <div className="absolute -left-[19px] top-1.5 h-1.5 w-1.5 rounded-full bg-stone-300" />
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