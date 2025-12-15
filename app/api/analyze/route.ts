import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 1. Setup the Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ 
  model: "gemini-flash-latest", // Switch to "gemini-1.5-pro" for stability, or "gemini-pro-vision"
  generationConfig: { responseMimeType: "application/json" }
});

// 2. The "Brain" (System Prompt)
const SYSTEM_PROMPT = `
ROLE:
You are "ASHAlytics," a digital supervisor for ASHA workers in rural India.
INPUT: You will receive audio of a patient interaction.
STRICT DEFINITIONS:
1. SOMATIC SYMPTOMS: Physical body sensations ONLY (e.g., "Headache", "Chest heaviness").
2. PSYCHOLOGICAL MARKERS: Thoughts, wishes, or emotions (e.g., "Wish to die", "Hopelessness").
BOUNDARIES: DO NOT DIAGNOSE. Flag patterns only. Replace names with "[REDACTED]".
TRIAGE LOGIC:
- GREEN: Normal.
- AMBER: Somatic distress or social withdrawal.
- RED: Self-harm, suicide ("Marna"), abuse, or immediate danger.
OUTPUT SCHEMA (JSON ONLY):
{
  "analysis": {
    "transcription": "Text of what was said (redacted).",
    "emotional_tone": "Qualitative (e.g., 'Resigned', 'Agitated')",
    "somatic_indicators": ["List PHYSICAL symptoms only"],
    "psychological_markers": ["List thoughts/wishes here"],
    "confidence_score": "Low | Medium | High",
    "uncertainty_note": "Explain limitations."
  },
  "triage": {
    "status": "GREEN | AMBER | RED",
    "title": "UI Alert Title",
    "action_required": "Short instruction for the worker."
  },
  "copilot": {
    "script": "Conversational Hindi/Hinglish. Use 'Didi' or 'Amma'. Be warm.",
    "rationale": "Why this script?"
  }
}
`;

export async function POST(req: Request) {
  try {
    // 3. Receive Audio from Frontend
    const { audio } = await req.json();
    
    if (!audio) {
      return NextResponse.json({ error: "No audio data" }, { status: 400 });
    }

    // 4. Send to Gemini
    const result = await model.generateContent([
      SYSTEM_PROMPT,
      {
        inlineData: {
          mimeType: "audio/webm", // Format from MediaRecorder
          data: audio
        }
      }
    ]);

    const responseText = result.response.text();
    const jsonResponse = JSON.parse(responseText);

    return NextResponse.json(jsonResponse);

  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json(
      { error: "Analysis failed", details: String(error) }, 
      { status: 500 }
    );
  }
}