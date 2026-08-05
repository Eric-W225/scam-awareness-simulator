import type { ScamScenario } from '../types/scenario';

/**
 * Scenario catalog — add new training emails here.
 * Keep branding fictional (no real bank/IRS logos, domains, or phone numbers).
 */
export const SCENARIOS: ScamScenario[] = [
  {
    id: 'bank-fraud',
    title: 'Bank Fraud',
    shortDescription:
      'Practice spotting a fake “suspicious activity” message that pressures you to verify an account.',
    accent: 'bank',
    email: {
      fromName: 'Northbridge Secure Alerts',
      fromAddress: 'alerts@northbridge-secure-example.com',
      toLabel: 'you@example.com',
      dateLabel: 'Today, 7:14 AM',
      subject: 'URGENT: Suspicious Activity Detected — Verify Within 2 Hours',
      body: [
        { text: 'Dear Customer', redFlagId: 'generic-greeting' },
        { text: ',\n\nWe detected unusual sign-in attempts on your checking account ending in ****4821 from an unrecognized device in another state.\n\n' },
        {
          text: 'Your account will be temporarily locked in 2 hours unless you verify your identity immediately.',
          redFlagId: 'urgency',
        },
        {
          text: '\n\nPlease confirm your username, password, and one-time security code so we can restore access. Failure to act may result in permanent suspension of online banking.\n\n',
          redFlagId: 'verify-request',
        },
        { text: 'If theese charges were not authorized by you, click below right away.\n\n', redFlagId: 'grammar' },
        { text: 'Thank you for banking with Northbridge Credit Union.\nCustomer Protection Desk' },
      ],
      ctaLabel: 'Verify Account',
      fakeUrlHint: 'https://northbridge-secure-example.com/verify-login',
    },
    redFlags: [
      {
        id: 'generic-greeting',
        title: 'Generic greeting',
        explanation:
          'Real banks usually greet you by name. “Dear Customer” is a mass-mail shortcut scammers use when they don’t know who you are.',
        color: 'amber',
      },
      {
        id: 'urgency',
        title: 'Artificial urgency',
        explanation:
          'Threats of a 2-hour lockout are designed to make you panic and click before thinking. Legitimate banks give you time and clear, calm next steps.',
        color: 'rose',
      },
      {
        id: 'verify-request',
        title: 'Asks you to “verify” credentials',
        explanation:
          'Banks never ask you to re-enter your password or security codes through an unexpected email link. That is how credential theft works.',
        color: 'teal',
      },
      {
        id: 'grammar',
        title: 'Awkward wording / typos',
        explanation:
          'Phrases like “theese charges” are common in phishing. Official bank communications are usually carefully proofread.',
        color: 'indigo',
      },
      {
        id: 'sender',
        title: 'Suspicious sender address',
        explanation:
          'The address uses a look-alike domain (northbridge-secure-example.com), not a real bank domain. Always expand and inspect the full From address.',
        color: 'slate',
      },
      {
        id: 'link-danger',
        title: 'Unexpected link / button',
        explanation:
          'Never click Verify buttons in surprise emails. Open your bank’s app or type the official website yourself, then check alerts there.',
        color: 'rose',
      },
    ],
  },
  {
    id: 'irs-fraud',
    title: 'IRS Fraud',
    shortDescription:
      'Practice spotting a fake tax notice about unpaid taxes or a tempting “unclaimed refund.”',
    accent: 'irs',
    email: {
      fromName: 'IRS',
      fromAddress: 'notices@irs-refunds-example.com',
      toLabel: 'you@example.com',
      dateLabel: 'Today, 6:42 AM',
      subject: 'Final Notice: Unclaimed Refund $847.00 — Action Required',
      body: [
        { text: 'Dear Taxpayer', redFlagId: 'generic-greeting' },
        {
          text: ',\n\nOur records show you are eligible for an unclaimed tax refund of $847.00. Case reference ',
        },
        { text: 'IRS-RFD-2026-77421', redFlagId: 'case-number' },
        { text: ' has been opened for review.\n\n' },
        {
          text: 'You must review your tax information within 48 hours or your refund will be forfeited and your tax account may be suspended with additional penalties.',
          redFlagId: 'urgency',
        },
        {
          text: '\n\nClick below to confirm your Social Security number and banking details for direct deposit. This mailbox is not monitored so do not reply.\n\n',
          redFlagId: 'verify-request',
        },
        { text: 'Thank you for your prompt cooporation,\nRefund Processing Unit\nU.S. Department of the Treasury' },
      ],
      ctaLabel: 'Review Your Tax Information',
      fakeUrlHint: 'https://irs-refunds-example.com/review-case',
    },
    redFlags: [
      {
        id: 'generic-greeting',
        title: 'Generic greeting',
        explanation:
          '“Dear Taxpayer” is impersonal. Scammers blast the same message to thousands of people and rarely use your real name correctly.',
        color: 'amber',
      },
      {
        id: 'case-number',
        title: 'Fake case number',
        explanation:
          'A random-looking case ID makes the email feel official. Anyone can invent a reference number — it does not prove the message is real.',
        color: 'indigo',
      },
      {
        id: 'urgency',
        title: 'Threats and urgency',
        explanation:
          'Warnings about forfeited refunds, account suspension, and penalties push you to act out of fear. The real IRS does not email sudden refund or debt threats like this.',
        color: 'rose',
      },
      {
        id: 'verify-request',
        title: 'Requests sensitive information',
        explanation:
          'Asking for SSN and bank details via an email button is a classic scam. The IRS does not initiate contact about refunds or account issues by email.',
        color: 'teal',
      },
      {
        id: 'sender',
        title: 'Suspicious sender address',
        explanation:
          'Official IRS email would use an @irs.gov address. Domains like irs-refunds-example.com are look-alikes meant to trick a quick glance.',
        color: 'slate',
      },
      {
        id: 'link-danger',
        title: 'Unexpected link / button',
        explanation:
          'Do not click tax “review” buttons in unexpected messages. Go directly to irs.gov by typing the address yourself, or call a number listed on the official site.',
        color: 'rose',
      },
    ],
  },
];

export function getScenarioById(id: string): ScamScenario | undefined {
  return SCENARIOS.find((scenario) => scenario.id === id);
}
