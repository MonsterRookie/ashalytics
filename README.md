# ASHAlytics: Deep Contextual AI Copilot for ASHA Workers

**ASHAlytics** is a safety-critical, human-in-the-loop AI decision support system designed for Accredited Social Health Activists (ASHAs) in India. By moving beyond simple keyword triggers, it employs a **Conflict Resolution Layer** to distinguish between genuine clinical distress, cultural idioms, and dark humour.

## 🚀 Advanced Clinical Intelligence

### 1. Conflict Resolution Layer (Risk Scoring)
The system calculates triage risk by merging literal content with emotional context to eliminate false positives like sarcastic mentions of "death":
- **Mathematical Logic**: `Final Risk = [Keyword Weight] × [Sentiment Multiplier]`
- **18-Point Sentiment Spectrum**: Includes granular multipliers such as:
    - **Hyperbolic Joy (0.1x)**: Neutralizes "death" keywords used in happy metaphors.
    - **Cultural Fatalism (1.1x)**: Recognizes "God's will" (*Bhagwan ki marzi*) as a unique coping context.
    - **Confusion/Disorientation (1.5x)**: High-priority multiplier for potential neurological/physiological emergencies.
    - **Despair (2.5x)**: Maximal risk escalation for active hopelessness.

### 2. Live Stress Engine & Pattern Analysis
The system monitors speech patterns in real-time to generate a **Stress Index (0–100)**:
- **Linguistic Flux (25%)**: Tracks stuttering and filler word frequency (*matlab, um, ah*).
- **Fragmentation (35%)**: Detects shifts from structured speech to broken "panic" phrases.
- **Volatility (40%)**: Measures the velocity of shifts from neutral to negative sentiment.
- **Pattern Mismatch Alert**: Explictly warns the ASHA worker if Tone (Affect) does not match the severity of words (e.g., laughing while reporting pain).

### 3. Decision Co-Pilot (ASHA Control Cockpit)
- **Internal Check-Questions**: Generates turn-specific clinical probes for the ASHA worker to resolve ambiguity.
- **Final ASHA Override**: Provides explicit **Stable | Monitor | Crisis** buttons. An ASHA override immediately updates the global triage status and is logged for safety audits.
- **Emergency Playbook**: Instant activation of rigid protocols for **RED** status, including "Stay with Patient" and "Call TeleMANAS".

## 🛡️ Non-Negotiable Safety Protocols

1.  **Safety Override Rule**: Specific physiological symptoms (e.g., "can't breathe") bypass all multipliers and trigger immediate escalation.
2.  **Human Authority**: The AI is purely advisory; the ASHA worker retains final clinical authority via manual override.
3.  **Privacy-First Design**:
    - **Statelessness**: No long-term memory; context is re-supplied per turn to ensure no data persistence.
    - **Anonymous Tracking**: Patients are identified via locally stored **APT-IDs**; no biometrics or names are processed.

## 🏗️ Technical Architecture

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + Shadcn UI.
- **AI Engine**: Google Gemini Flash (Latest) with custom CDSS prompting.
- **State**: React Context with Running Average Stress tracking.
- **Audio**: Web MediaRecorder API -> Base64 Ephemeral Processing.

## 📦 Getting Started

1. **Install Dependencies**: `npm install`
2. **Environment**: Add `GEMINI_API_KEY` to `.env.local`
3. **Run Dev**: `npm run dev`

---
*Developed for Advanced Agentic Coding demonstrations. Safety-critical CDSS implementation.*