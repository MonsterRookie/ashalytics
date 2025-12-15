"use client";

import { useState } from "react";
import { ChevronDown, Check, Eye, X, HelpCircle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function TriageReasoning({ analysis }: { analysis: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [actionTaken, setActionTaken] = useState<string | null>(null);

  if (!analysis) return null;

  // Derive Confidence Badge Color
  const confidence = analysis.analysis.confidence_score || "Medium";
  const confidenceColor = confidence === "High" 
    ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
    : "bg-amber-100 text-amber-800 border-amber-200";

  return (
    <div className="space-y-4 mt-4">
      
      {/* A) AI CONFIDENCE & UNCERTAINTY */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className={`${confidenceColor} flex gap-1`}>
          {confidence} Confidence
        </Badge>
        {analysis.analysis.uncertainty_note && (
          <div className="flex items-center text-[10px] text-slate-400 gap-1">
            <HelpCircle className="h-3 w-3" />
            <span>{analysis.analysis.uncertainty_note}</span>
          </div>
        )}
      </div>

      <Separator className="bg-slate-100" />

      {/* B) COLLAPSIBLE EXPLANATION */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border border-slate-200 rounded-md bg-slate-50">
        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">
          <span>WHY THIS WAS FLAGGED</span>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-3 pb-3">
          <ul className="space-y-2 mt-1">
            {analysis.analysis.somatic_indicators?.length > 0 ? (
              analysis.analysis.somatic_indicators.map((m: string, i: number) => (
                <li key={`som-${i}`} className="text-xs text-slate-600 flex gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                  <span>Physical: <span className="font-medium text-slate-800">"{m}"</span></span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-400 italic pl-3">No somatic markers detected.</li>
            )}
            
            {analysis.analysis.psychological_markers?.length > 0 && (
               analysis.analysis.psychological_markers.map((m: string, i: number) => (
                <li key={`psy-${i}`} className="text-xs text-slate-600 flex gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                  <span>Emotional: <span className="font-medium text-slate-800">"{m}"</span></span>
                </li>
              ))
            )}
          </ul>
        </CollapsibleContent>
      </Collapsible>

      {/* C) HUMAN OVERRIDE ACTIONS */}
      {!actionTaken ? (
        <div className="grid grid-cols-3 gap-2 pt-2">
          <Button variant="outline" size="sm" className="h-auto py-2 flex flex-col gap-1 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all"
             onClick={() => setActionTaken("Asked")}>
            <Check className="h-4 w-4" /> 
            <span className="text-[10px] font-medium">Ask Now</span>
          </Button>
          <Button variant="outline" size="sm" className="h-auto py-2 flex flex-col gap-1 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all"
             onClick={() => setActionTaken("Monitoring")}>
            <Eye className="h-4 w-4" /> 
            <span className="text-[10px] font-medium">Monitor</span>
          </Button>
          <Button variant="outline" size="sm" className="h-auto py-2 flex flex-col gap-1 hover:bg-slate-100 text-slate-500 transition-all"
             onClick={() => setActionTaken("Dismissed")}>
            <X className="h-4 w-4" /> 
            <span className="text-[10px] font-medium">Dismiss</span>
          </Button>
        </div>
      ) : (
        <div className="text-center text-xs text-slate-500 py-3 bg-slate-50 rounded-md border border-slate-100 animate-in fade-in zoom-in duration-300">
          <span className="text-emerald-600 font-bold">✓ Feedback Logged:</span> {actionTaken}
        </div>
      )}
    </div>
  );
}