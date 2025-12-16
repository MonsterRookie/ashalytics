"use client";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function TranscriptTimeline({ text, markers }: { text: string, markers: string[] }) {
  // SIMULATION: Since we don't have word-level timestamps from the backend yet,
  // we simulate a single "block" timeline entry for the MVP.
  
  if (!text) return <div className="text-slate-300 text-sm italic p-4">Waiting for live audio...</div>;

  return (
    <div className="space-y-6 pl-2 pr-4">
      <TooltipProvider>
        {/* Timeline Item 1 */}
        <div className="flex gap-3 text-sm group">
            <span className="text-[10px] text-slate-400 font-mono pt-1 min-w-[35px]">0:05</span>
            <div className="flex-1 pb-6 border-l border-slate-200 pl-5 relative">
              {/* Timeline Dot */}
              <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-slate-300 ring-4 ring-white" />
              
              <p className="text-slate-600 leading-relaxed">
                {text}
              </p>
            </div>
        </div>

        {/* Detected Insights Section */}
        {markers?.length > 0 && (
           <div className="pt-2">
             <div className="flex items-center gap-2 mb-3">
               <span className="h-px bg-slate-100 flex-1"></span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detected Risk Patterns</span>
               <span className="h-px bg-slate-100 flex-1"></span>
             </div>

             {markers.map((m, i) => (
                <div key={i} className="flex gap-3 text-sm mb-3 animate-in slide-in-from-left-2 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                    <span className="text-[10px] text-amber-500 font-mono pt-1 min-w-[35px] text-right">AI</span>
                    <div className="flex-1 pl-5 relative border-l border-dashed border-slate-200">
                         {/* Highlight Dot */}
                        <div className="absolute -left-[3px] top-2 h-1.5 w-1.5 rounded-full bg-amber-400" />
                        
                        <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="bg-amber-50 text-slate-800 px-2 py-1.5 rounded-md text-xs cursor-help border border-amber-100 hover:bg-amber-100 transition-colors inline-block">
                            "{m}"
                            </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-slate-900 text-slate-50 border-none text-xs shadow-xl">
                            <p>Flagged as potential distress marker</p>
                        </TooltipContent>
                        </Tooltip>
                    </div>
                </div>
             ))}
           </div>
        )}
      </TooltipProvider>
    </div>
  );
}