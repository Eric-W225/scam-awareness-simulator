# Scam Awareness Simulator

A React + TypeScript training app where users practice spotting **fictional** phishing emails in a safe sandbox. No credentials are collected. Trainers may optionally email a scenario to consented trainees.

## Features

- Homepage titled **Scam Awareness Simulator** with two scenarios: **Bank Fraud** and **IRS Fraud**
- Professionally formatted simulated emails with common phishing red flags
- Interactive highlights — click colored phrases in the email to reveal explanations
- **Red Flags You Should Notice** analysis panel
- **Send to Email** on every scenario (EmailJS or `.eml` download) for authorized training only
- Deep links (`?scenario=<id>&entry=email`) so emailed buttons open the matching scenario
- Reset control to return to scenario selection
- All in-app email buttons/links are disabled (teaching only)
- Easy to extend with more scenarios via `src/data/scenarios.ts`

Branding is fictional on purpose (example domains like `northbridge-secure-example.com` and `irs-refunds-example.com`). No real bank or IRS logos, phone numbers, or official URLs.

## Run locally

Requires [Node.js](https://nodejs.org/) (LTS).

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build    # production build
npm run preview  # preview the build
```

## Project structure

```text
src/
  App.tsx                 # Switches between home and scenario view
  components/
    HomePage.tsx          # Title, description, scenario cards
    ScenarioCard.tsx      # Reusable selection card
    ScenarioView.tsx      # Email + analysis layout
    SendToEmailPanel.tsx  # Per-scenario training email sender
    SimulatedEmail.tsx    # Fake inbox message
    EmailHighlight.tsx    # Clickable red-flag span
    RedFlagsPanel.tsx     # Educational explanations
  lib/sendTrainingEmail.ts
  data/scenarios.ts       # Add new scam scenarios here
  types/scenario.ts       # Shared TypeScript types
```

## Send training emails

**Step 1 — Consent & allowlist email** (home page): asks the recipient to reply **I AGREE**, mark the message **Not spam**, and add your address to Contacts. This message often lands in Spam on purpose.

**Step 2 — Practice scenario email**: open a scenario → **Send to Email** after they allowlist you.

Configure EmailJS (`to_email`, `subject`, `{{{message_html}}}`, `from_name`) or download a `.eml` and send from your mail app. Only train people who have agreed.

## Add another scenario

1. Open `src/data/scenarios.ts`
2. Append a new object to the `SCENARIOS` array (same shape as Bank / IRS)
3. The homepage card grid updates automatically

## Legacy

The previous static HTML simulation lives in `legacy-static/` for reference.
