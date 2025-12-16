"use client";

import { useState } from "react";
import Image from "next/image";
import { useAshalyse } from "@/components/ashalyse-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export function LoginOverlay() {
  const { ashaID, login, t } = useAshalyse();
  const [localID, setLocalID] = useState("");
  const [district, setDistrict] = useState("");

  if (ashaID) return null; // Hide if logged in

  // FIX: Explicitly tell TypeScript this is a Form Event
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (localID && district) {
      login(localID, district);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-slate-200">
        <CardHeader className="text-center">
          <div className="mx-auto mb-6">
            <Image src="/logo.png" alt="ASHAlytics Logo" width={140} height={50} className="object-contain mx-auto" priority />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">{t('login.title')}</CardTitle>
          <CardDescription>{t('login.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">ASHA ID</label>
              <Input
                placeholder="e.g. ASHA-204"
                value={localID}
                onChange={(e) => setLocalID(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">District Code</label>
              <Input
                placeholder="e.g. RJ-04 (Jaipur)"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-lg">
              {t('login.btn')}
            </Button>
            <p className="text-xs text-center text-slate-400 mt-4">
              Authorized personnel only. Sessions are audited.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}