/**
 * Shared types for scam scenarios.
 * To add a new scenario later, create a ScamScenario object in src/data/scenarios.ts
 * and append it to the SCENARIOS array — no component changes required.
 */

export type RedFlagColor = 'amber' | 'rose' | 'teal' | 'indigo' | 'slate';

export interface RedFlag {
  id: string;
  title: string;
  explanation: string;
  color: RedFlagColor;
}

/** A clickable / highlightable span inside the simulated email body. */
export interface EmailSegment {
  text: string;
  /** When set, this segment is a clickable red-flag highlight. */
  redFlagId?: string;
}

export interface EmailContent {
  fromName: string;
  fromAddress: string;
  toLabel: string;
  dateLabel: string;
  subject: string;
  /** Ordered body segments; some may link to redFlagId for interactive teaching. */
  body: EmailSegment[];
  ctaLabel: string;
  /** Fictional URL shown near the CTA — never navigates. */
  fakeUrlHint: string;
}

export interface ScamScenario {
  id: string;
  title: string;
  shortDescription: string;
  /** Accent used on the homepage selection card. */
  accent: 'bank' | 'irs' | 'generic';
  email: EmailContent;
  redFlags: RedFlag[];
}
