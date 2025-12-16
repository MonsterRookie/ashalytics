import React from "react";
import { CheckCircle, Phone, Users, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EmergencyPlaybook() {
    return (
        <Card className="bg-red-50 border-red-200 mt-4 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-red-700 font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" />
                    Emergency Playbook (Red Protocol)
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    {[
                        { id: 1, text: "Stay with the patient. Do not leave them alone.", icon: Users },
                        { id: 2, text: "Involve a trusted family member immediately.", icon: Users },
                        { id: 3, text: "Contact PHC Medical Officer or Supervisor.", icon: Phone },
                    ].map((step) => (
                        <div key={step.id} className="flex items-start gap-3 p-3 bg-white rounded-md border border-red-100">
                            <div className="mt-0.5 min-w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold border border-red-200">
                                {step.id}
                            </div>
                            <p className="text-sm font-medium text-slate-700 leading-snug">{step.text}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button variant="destructive" className="w-full bg-red-600 hover:bg-red-700 shadow-md">
                        <Phone className="h-4 w-4 mr-2" />
                        Call TeleMANAS
                    </Button>
                    <Button variant="outline" className="w-full border-red-300 text-red-700 hover:bg-red-50">
                        <Phone className="h-4 w-4 mr-2" />
                        District Helpline
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
