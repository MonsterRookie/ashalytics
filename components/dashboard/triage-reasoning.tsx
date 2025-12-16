"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, AlertTriangle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function TriageReasoning({ analysis }: { analysis: any }) {
  const [isOpen, setIsOpen] = useState(true); // Default open for visibility

  if (!analysis) return null;

  // Derive Confidence Badge Color
  const confidence = analysis.analysis?.confidence || "Medium";
  const confidenceColor = confidence === "High"
    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
    : "bg-amber-100 text-amber-800 border-amber-200";

  const signals = analysis.analysis?.signals || [];
  const rationale = analysis.triage?.rationale || [];

  return (
    <div className="space-y-4 mt-4">

      {/* A) AI CONFIDENCE & UNCERTAINTY */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className={`${confidenceColor} flex gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wide`}>
          {confidence} Confidence
        </Badge>
        {analysis.analysis?.uncertainty_note && (
          <div className="flex items-center text-[10px] text-slate-400 gap-1 max-w-[60%] text-right leading-tight">
            <HelpCircle className="h-3 w-3 flex-shrink-0" />
            <span>{analysis.analysis.uncertainty_note}</span>
          </div>
        )}
      </div>

      <Separator className="bg-slate-100" />

      {/* B) COLLAPSIBLE EXPLANATION */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border border-slate-200 rounded-md bg-white">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider bg-slate-50/50">
          <span>AI Pattern Observations</span>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>

        <CollapsibleContent className="px-3 pb-3 pt-2">
          <p className="text-[10px] text-slate-400 italic mb-3">Assistive signals, not medical conclusions.</p>
          <div className="space-y-3">
            {/* SIGNALS DETECTED */}
            {signals.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Signals Detected</h4>
                <ul className="space-y-1.5">
                  {signals.map((signal: string, i: number) => (
                    <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0 shadow-sm" />
                      <span className="leading-snug">{signal}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* RATIONALE */}
            {rationale.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase mt-3">Triage Basis</h4>
                <ul className="space-y-1.5">
                  {rationale.map((r: string, i: number) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-2 italic">
                      <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="leading-snug">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {signals.length === 0 && rationale.length === 0 && (
              <p className="text-xs text-slate-400 italic">No specific risk patterns identified.</p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}