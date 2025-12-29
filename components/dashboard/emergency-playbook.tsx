import React from "react";
import { Phone, Users, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EmergencyPlaybook() {
    return (
        <Card className="bg-[#FFF5F5] border-red-200 shadow-none rounded-2xl overflow-hidden ring-1 ring-red-100">
            <CardHeader className="pb-3 border-b border-red-100 bg-red-50/50">
                <CardTitle className="text-red-800 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-red-600" />
                    Protocol (Red)
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                <div className="space-y-2.5">
                    {[
                        { id: 1, text: "Stay with the patient. Do not leave them alone.", icon: Users },
                        { id: 2, text: "Involve a trusted family member immediately.", icon: Users },
                        { id: 3, text: "Contact PHC Medical Officer or Supervisor.", icon: Phone },
                    ].map((step) => (
                        <div key={step.id} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-red-100 shadow-sm">
                            <div className="mt-0.5 min-w-5 h-5 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-[10px] font-bold border border-red-200">
                                {step.id}
                            </div>
                            <p className="text-xs font-medium text-stone-700 leading-snug">{step.text}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                    <Button variant="destructive" className="w-full h-11 bg-red-600 hover:bg-red-700 shadow-md shadow-red-200 rounded-xl text-xs font-semibold">
                        <Phone className="h-3.5 w-3.5 mr-2" />
                        Call TeleMANAS
                    </Button>
                    <Button variant="outline" className="w-full h-11 border-red-200 bg-white text-red-700 hover:bg-red-50 hover:text-red-800 rounded-xl text-xs font-semibold">
                        <Phone className="h-3.5 w-3.5 mr-2" />
                        District Helpline
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}