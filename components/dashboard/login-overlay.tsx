"use client";

import { useState } from "react";
import Image from "next/image";
import { useAshalyse } from "@/components/ashalyse-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export function LoginOverlay() {
  const { ashaID, login, t } = useAshalyse();
  const [localID, setLocalID] = useState("");
  const [district, setDistrict] = useState("");

  if (ashaID) return null; // Hide if logged in

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (localID && district) {
      login(localID, district);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-stone-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-500">
      <Card className="w-full max-w-md shadow-2xl shadow-teal-900/20 border-white/60 bg-[#FCFCFA]/90 backdrop-blur-xl rounded-3xl overflow-hidden ring-1 ring-stone-200">
        <CardHeader className="text-center pt-10 pb-2">
          <div className="mx-auto mb-6 bg-white p-3 rounded-2xl shadow-sm border border-stone-100 w-fit">
            <Image src="/logo.png" alt="ASHAlytics Logo" width={140} height={50} className="object-contain" priority />
          </div>
          <CardTitle className="text-2xl font-bold text-stone-800 tracking-tight">{t('login.title')}</CardTitle>
          <CardDescription className="text-stone-500">{t('login.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">ASHA ID</label>
              <Input
                placeholder="e.g. ASHA-204"
                value={localID}
                onChange={(e) => setLocalID(e.target.value)}
                required
                className="h-12 rounded-xl border-stone-200 bg-white focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">District Code</label>
              <Input
                placeholder="e.g. RJ-04 (Jaipur)"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
                className="h-12 rounded-xl border-stone-200 bg-white focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <Button type="submit" className="w-full h-12 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-base font-semibold shadow-md shadow-teal-600/20 transition-all mt-2">
              {t('login.btn')}
            </Button>
            
            <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-stone-100">
                <Lock className="h-3 w-3 text-stone-400" />
                <p className="text-[10px] text-center text-stone-400 font-medium">
                Official Government Access Only • 256-bit Encrypted
                </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}