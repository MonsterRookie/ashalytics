"use client";

import { useState } from "react";
import { User, MapPin, Ruler, Shirt, AlertOctagon, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function RedIdentityModule() {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [formData, setFormData] = useState({
        landmark: "",
        ageRange: "",
        heightRange: "",
        marks: "",
        clothing: ""
    });
    const [saved, setSaved] = useState(false);

    if (!isUnlocked) {
        return (
            <div className="border border-red-200 bg-[#FFF5F5] rounded-2xl p-6 flex flex-col items-center text-center gap-3 shadow-sm">
                <div className="bg-red-100 p-3 rounded-full ring-4 ring-red-50">
                    <AlertOctagon className="h-6 w-6 text-red-600" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-xs font-bold text-red-900 uppercase tracking-wide">Emergency Identification Locked</h3>
                    <p className="text-[10px] text-red-700/80 max-w-[220px] mx-auto leading-relaxed">
                        Identity module is restricted. Unlock only if emergency responders need descriptive details.
                    </p>
                </div>
                <Button size="sm" className="w-full max-w-[200px] mt-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs h-9 shadow-md shadow-red-200" onClick={() => setIsUnlocked(true)}>
                    Unlock Identity Module
                </Button>
            </div>
        )
    }

    if (saved) {
        return (
            <div className="border border-emerald-200 bg-emerald-50 rounded-2xl p-6 flex flex-col items-center text-center gap-2 animate-in fade-in zoom-in-95">
                <div className="bg-emerald-100 p-2.5 rounded-full">
                    <User className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-emerald-800">Details Encrypted & Saved</p>
                <p className="text-[10px] text-emerald-600">Available to District Helpline via secure handoff.</p>
            </div>
        )
    }

    return (
        <Card className="border-red-200 shadow-sm animate-in slide-in-from-top-4 rounded-2xl overflow-hidden bg-white">
            <CardHeader className="pb-3 bg-red-50/50 border-b border-red-100">
                <CardTitle className="text-xs font-bold text-red-800 uppercase tracking-wide flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Descriptive ID (Non-Biometric)
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100 text-[10px] text-amber-800 mb-2 leading-relaxed">
                    ⚠️ <strong>SAFEGUARDS ACTIVE:</strong> Do not enter exact address, names, Aadhaar, or face images. Use approximations only.
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label className="text-[9px] uppercase font-bold text-stone-400">Landmark</Label>
                        <div className="relative">
                            <MapPin className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
                            <Input className="pl-8 h-9 text-xs rounded-xl bg-[#FCFCFA] border-stone-200" placeholder="e.g. Near Old Banyan"
                                value={formData.landmark} onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[9px] uppercase font-bold text-stone-400">Visible Marks</Label>
                        <Input className="h-9 text-xs rounded-xl bg-[#FCFCFA] border-stone-200" placeholder="e.g. Scar on chin"
                            value={formData.marks} onChange={e => setFormData({ ...formData, marks: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                        <Label className="text-[9px] uppercase font-bold text-stone-400">Age</Label>
                        <Select onValueChange={(v) => setFormData({ ...formData, ageRange: v })}>
                            <SelectTrigger className="h-9 text-xs rounded-xl bg-[#FCFCFA] border-stone-200"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="child">Child (0-12)</SelectItem>
                                <SelectItem value="teen">Teen (13-19)</SelectItem>
                                <SelectItem value="adult">Adult (20-60)</SelectItem>
                                <SelectItem value="elder">Elderly (60+)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[9px] uppercase font-bold text-stone-400">Height</Label>
                        <div className="relative">
                            <Ruler className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
                            <Input className="pl-8 h-9 text-xs rounded-xl bg-[#FCFCFA] border-stone-200" placeholder="5'2"
                                value={formData.heightRange} onChange={e => setFormData({ ...formData, heightRange: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[9px] uppercase font-bold text-stone-400">Clothing</Label>
                        <div className="relative">
                            <Shirt className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-stone-400" />
                            <Input className="pl-8 h-9 text-xs rounded-xl bg-[#FCFCFA] border-stone-200" placeholder="Saree"
                                value={formData.clothing} onChange={e => setFormData({ ...formData, clothing: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-0 pb-4">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-xs font-semibold h-10 rounded-xl shadow-md shadow-red-100" onClick={() => setSaved(true)}>
                    <Save className="h-3.5 w-3.5 mr-2" />
                    Securely Save for Handover
                </Button>
            </CardFooter>
        </Card>
    );
}