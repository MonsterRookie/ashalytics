"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// 1. Define Types
type Language = "en" | "hi";
type AppMode = "normal" | "uplift";

interface PatientData {
  aptID: string;
  visits: number;
  lastTriage: string;
  lastVisitDate: string;
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
  t: (key: string) => string;
}

const AshalyseContext = createContext<AshalyseContextType | undefined>(undefined);

// 2. Translations
const TRANSLATIONS = {
  en: {
    "app.title": "ASHAlytics",
    "app.supervisor": "Supervisor",
    "status.red": "RED: Critical Risk",
    "status.amber": "AMBER: Moderate Risk",
    "status.green": "GREEN: Low Risk",
    "btn.consult": "Tap to Consult",
    "btn.listening": "Listening...",
    "btn.analyzing": "Analyzing Patterns...",
    "mode.uplift": "Training Simulation Active",
    "login.title": "ASHA Secure Login",
    "login.subtitle": "Enter your credentials to start a session",
    "login.btn": "Start Session",
  },
  hi: {
    "app.title": "आशा-लिटिक्स",
    "app.supervisor": "पर्यवेक्षक",
    "status.red": "लाल: गंभीर जोखिम",
    "status.amber": "पीला: मध्यम जोखिम",
    "status.green": "हरा: कम जोखिम",
    "btn.consult": "सलाह के लिए टैप करें",
    "btn.listening": "सुन रहा है...",
    "btn.analyzing": "विश्लेषण चल रहा है...",
    "mode.uplift": "प्रशिक्षण सिमुलेशन सक्रिय",
    "login.title": "आशा सुरक्षित लॉगिन",
    "login.subtitle": "सत्र शुरू करने के लिए अपना विवरण दर्ज करें",
    "login.btn": "सत्र शुरू करें",
  },
};

export function AshalyseProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [mode, setMode] = useState<AppMode>("normal");
  const [ashaID, setAshaID] = useState<string | null>(null);
  const [aptID, setAptID] = useState<string | null>(null);
  const [currentPatient, setCurrentPatient] = useState<PatientData | null>(null);

  const generateAptID = (district: string) => {
    const randomHex = Math.floor(Math.random() * 0xfff).toString(16).toUpperCase().padStart(3, '0');
    return `APT-${district.toUpperCase().slice(0, 3)}-${randomHex}`;
  };

  const login = (id: string, district: string) => {
    setAshaID(id);
    const newAptID = generateAptID(district);
    setAptID(newAptID);

    // Check if patient exists in LS (Normally would search, here we mimic retrieval/new)
    // For this demo, we assume a new patient or retrieve if ID accidentally matches (unlikely)
    const storedPatients = JSON.parse(localStorage.getItem("ashalyse_patients") || "{}");
    if (storedPatients[newAptID]) {
      setCurrentPatient(storedPatients[newAptID]);
    } else {
      const newPatient = { aptID: newAptID, visits: 0, lastTriage: "N/A", lastVisitDate: new Date().toISOString() };
      setCurrentPatient(newPatient);
      // Don't save yet, save on session end
    }
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

  const t = (key: string) => {
    return TRANSLATIONS[language][key as keyof typeof TRANSLATIONS['en']] || key;
  };

  return (
    <AshalyseContext.Provider value={{ language, setLanguage, mode, setMode, ashaID, login, aptID, currentPatient, saveSession, t }}>
      {children}
    </AshalyseContext.Provider>
  );
}

export function useAshalyse() {
  const context = useContext(AshalyseContext);
  if (context === undefined) {
    throw new Error("useAshalyse must be used within an AshalyseProvider");
  }
  return context;
}