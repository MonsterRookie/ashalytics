# ASHAlytics: Safety-Critical AI Copilot for ASHA Workers

**ASHAlytics** is a human-in-the-loop AI web application designed to assist Accredited Social Health Activists (ASHAs) in rural India. It analyzes short audio snippets of patient conversations to detect distress patterns, assisting with triage and providing safe, explainable next steps.

## Ethics & Safety (Non-Negotiable)

This system is built with **Safety First** principles:
1.  **No Diagnosis**: ASHAlytics never diagnoses conditions or prescribes medication.
2.  **Human Authority**: The ASHA worker is the final decision-maker. The AI provides *advisory* signals only.
3.  **Privacy**:
    - No audio is stored on servers permanently (processed ephemerally).
    - No patient names or biometrics are captured.
    - Patient tracking is done via **Anonymous Patient Tracking IDs (APT-ID)** stored locally on the device (LocalStorage).
4.  **No Direct Patient Interaction**: The AI never speaks to the patient. It is a tool for the ASHA worker.
5.  **Red-Level Protocol**: Immediate "Red" triage triggers a rigid Emergency Playbook (Stay, Involve Family, Contact PHC), bypassing standard conversational scripts.

## Architecture

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **AI Model**: Google Gemini flash - latest (Server-Side Analysis)
- **State Management**: React Context + LocalStorage
- **Audio**: Browser MediaRecorder API -> Base64 -> Server Action

## Features

- **Real-time Audio Analysis**: Detects emotional tone, somatic symptoms, and psychological markers.
- **Triage System**: Auto-classifies into Green (Low), Amber (Moderate), or Red (Critical) with visual status indicators.
- **White-Box AI Reasoning**: Explainable AI panel showing detected signals and rationale (not black-box).
- **Emergency Playbook**: Auto-activates for Red cases with immediate protocols (Identity confirmation, location check).
- **Training Mode (Uplift)**: Toggleable mode that provides coaching feedback ("Training Insight") instead of just clinical scores.
- **Bilingual Interface**: Seamless English/Hindi toggle for broader accessibility.
- **Supervisor Stats**: Aggregated dashboard view for monitoring high-risk cases.

## Limitations

- **Internet Dependency**: Audio analysis requires an active internet connection (Gemini API).
- **Language Nuance**: Current model supports Hindi/English but may miss specific dialectal nuances. The "Human Override" feature allows ASHAs to correct misinterpretations.
- **Device Storage**: Patient history is local to the device. Clearing browser cache loses history.

## How to Run

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Setup**:
    Create `.env.local` and add your Gemini API key:
    ```bash
    GEMINI_API_KEY=your_api_key_here
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:3000`

---
*Built for the "Advanced Agentic Coding" demonstration.*
