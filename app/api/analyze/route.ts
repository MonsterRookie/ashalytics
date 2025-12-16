import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 1. Setup the Gemini Client
// Using gemini-1.5-pro for best reasoning capabilities in safety-critical tasks
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
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

BOUNDARIES (NON-NEGOTIABLE):
- DO NOT DIAGNOSE.
- DO NOT PRESCRIBE MEDICATION.
- DO NOT PROVIDE SUICIDE PROBABILITY SCORES.
- Flag patterns only. 
- Replace names with "[REDACTED]".

ESTIMATE CONTEXT:
- Detect Life-stage from voice/content: Child | Adolescent | Adult | Elderly
- Detect Communication Style: Hesitant | Formal | Aggressive | Resigned

TRIAGE LOGIC:
- GREEN: Normal / Low Distress.
- AMBER: Somatic distress, social withdrawal, or moderate anxiety.
- RED: Self-harm content, suicide ideation ("Marna", "Khatam karna"), domestic abuse, or immediate danger.

OUTPUT SCHEMA (STRICT JSON):
{
  "context_analysis": {
     "estimated_age_group": "Child | Adolescent | Adult | Elderly",
     "communication_style": "String description",
     "tone_adaptation": "Why this script tone?"
  },
  "analysis": {
    "transcription": "Text of what was said (redacted).",
    "emotional_tone": "Qualitative (e.g., 'Resigned', 'Agitated')",
    "signals": ["List critical signals found"],
    "confidence": "High | Medium | Low",
    "uncertainty_note": "Explain limitations or if audio was unclear."
  },
  "triage": {
    "status": "GREEN | AMBER | RED",
    "rationale": ["Reason 1", "Reason 2"]
  },
  "copilot": {
    "suggested_script": "Conversational Hindi/Hinglish. Use 'Didi', 'Amma', or 'Beta' based on age. ADAPT TONE to estimated context.",
    "next_steps": ["Step 1", "Step 2"]
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