"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "hi";
type AppMode = "normal" | "uplift";

interface PatientData {
  aptID: string;
  visits: number;
  lastTriage: string;
  lastVisitDate: string;
}

// New Interface for updating session analytics
interface AnalysisUpdate {
  stressScore: number;
  intent: string;
  mismatch: boolean;
}

interface AshalyseContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  ashaID: string | null;
  login: (id: string, district: string) => void;
  aptID: string | null;
  currentPatient: PatientData | null;
  saveSession: (triageStatus: string) => void;
  
  // Safety & State Management
  clearCurrentInteraction: () => void;
  t: (key: string) => string;

  // --- NEW: Deep Context Fields ---
  stressScoreAverage: number; // The running average (0-100)
  stressHistory: number[];    // Full history of scores for this session
  currentIntent: string | null;
  aiReasoningMismatch: boolean;
  updateSessionAnalysis: (data: AnalysisUpdate) => void;
}

const AshalyseContext = createContext<AshalyseContextType | undefined>(undefined);

const TRANSLATIONS = {
  en: {
    "login.title": "ASHA Secure Login",
    "login.subtitle": "Enter credentials to start a session",
    "login.btn": "Start Session",
  },
  hi: {
    "login.title": "आशा सुरक्षित लॉगिन",
    "login.subtitle": "सत्र शुरू करने के लिए विवरण दर्ज करें",
    "login.btn": "सत्र शुरू करें",
  },
};

export function AshalyseProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [mode, setMode] = useState<AppMode>("normal");
  const [ashaID, setAshaID] = useState<string | null>(null);
  const [aptID, setAptID] = useState<string | null>(null);
  const [currentPatient, setCurrentPatient] = useState<PatientData | null>(null);

  // --- NEW: Session Analytical State ---
  const [stressHistory, setStressHistory] = useState<number[]>([]);
  const [currentIntent, setCurrentIntent] = useState<string | null>(null);
  const [aiReasoningMismatch, setAiReasoningMismatch] = useState(false);

  // Calculate Running Average
  const stressScoreAverage = stressHistory.length > 0 
    ? Math.round(stressHistory.reduce((a, b) => a + b, 0) / stressHistory.length) 
    : 0;

  const generateAptID = (district: string) => {
    const randomHex = Math.floor(Math.random() * 0xfff).toString(16).toUpperCase().padStart(3, '0');
    return `APT-${district.toUpperCase().slice(0, 3)}-${randomHex}`;
  };

  const login = (id: string, district: string) => {
    setAshaID(id);
    const newAptID = generateAptID(district);
    setAptID(newAptID);
    const newPatient = { aptID: newAptID, visits: 0, lastTriage: "N/A", lastVisitDate: new Date().toISOString() };
    setCurrentPatient(newPatient);
  };

  const saveSession = (triageStatus: string) => {
    if (!aptID || !currentPatient) return;
    const updatedPatient = {
      ...currentPatient,
      visits: currentPatient.visits + 1,
      lastTriage: triageStatus,
      lastVisitDate: new Date().toISOString()
    };
    setCurrentPatient(updatedPatient);
    const storedPatients = JSON.parse(localStorage.getItem("ashalyse_patients") || "{}");
    storedPatients[aptID] = updatedPatient;
    localStorage.setItem("ashalyse_patients", JSON.stringify(storedPatients));
  };

  // --- Update Analytical State per Turn ---
  const updateSessionAnalysis = ({ stressScore, intent, mismatch }: AnalysisUpdate) => {
    setStressHistory(prev => [...prev, stressScore]);
    setCurrentIntent(intent);
    setAiReasoningMismatch(mismatch);
  };

  // --- SAFETY METHOD: CLEAR SESSION ---
  const clearCurrentInteraction = () => {
    setAptID(null);
    setCurrentPatient(null);
    // Reset Analytical Context
    setStressHistory([]);
    setCurrentIntent(null);
    setAiReasoningMismatch(false);
  };

  const t = (key: string) => {
    return TRANSLATIONS[language][key as keyof typeof TRANSLATIONS['en']] || key;
  };

  return (
    <AshalyseContext.Provider value={{ 
      language, 
      setLanguage, 
      mode, 
      setMode, 
      ashaID, 
      login, 
      aptID, 
      currentPatient, 
      saveSession, 
      clearCurrentInteraction, 
      t,
      // New Exports
      stressScoreAverage,
      stressHistory,
      currentIntent,
      aiReasoningMismatch,
      updateSessionAnalysis
    }}>
      {children}
    </AshalyseContext.Provider>
  );
}

export function useAshalyse() {
  const context = useContext(AshalyseContext);
  if (context === undefined) throw new Error("useAshalyse must be used within AshalyseProvider");
  return context;
}