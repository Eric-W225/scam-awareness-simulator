/**
 * Send training / consent emails (authorized use only).
 *
 * Two outbound types:
 *  1) Consent + allowlist email — ask recipient to opt in and whitelist sender
 *  2) Scenario simulation email — sample scam for practice (after consent)
 */

import type { ScamScenario } from '../types/scenario';

export const EMAILJS_STORAGE_KEY = 'phishing-sim-emailjs-config';
export const TRAINER_FROM_NAME_KEY = 'phishing-sim-trainer-from-name';
export const TRAINER_EMAIL_KEY = 'phishing-sim-trainer-email';
const EMAILJS_CDN =
  'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';

export interface EmailjsConfig {
  publicKey: string;
  serviceId: string;
  templateId: string;
}

export interface OutboundMessage {
  subject: string;
  html: string;
  plain: string;
  fromName: string;
  downloadName: string;
}

interface EmailjsSdk {
  init: (options: { publicKey: string }) => void;
  send: (
    serviceId: string,
    templateId: string,
    params: Record<string, string>,
  ) => Promise<unknown>;
}

declare global {
  interface Window {
    emailjs?: EmailjsSdk;
  }
}

export function loadEmailjsConfig(): EmailjsConfig {
  try {
    const saved = JSON.parse(
      localStorage.getItem(EMAILJS_STORAGE_KEY) || '{}',
    ) as Partial<EmailjsConfig>;
    return {
      publicKey: saved.publicKey?.trim() ?? '',
      serviceId: saved.serviceId?.trim() ?? '',
      templateId: saved.templateId?.trim() ?? '',
    };
  } catch {
    return { publicKey: '', serviceId: '', templateId: '' };
  }
}

export function saveEmailjsConfig(config: EmailjsConfig): void {
  localStorage.setItem(EMAILJS_STORAGE_KEY, JSON.stringify(config));
}

export function loadTrainerFromName(): string {
  return (
    localStorage.getItem(TRAINER_FROM_NAME_KEY)?.trim() ||
    'Security Awareness Training'
  );
}

export function saveTrainerFromName(name: string): void {
  localStorage.setItem(TRAINER_FROM_NAME_KEY, name.trim());
}

export function loadTrainerEmail(): string {
  return localStorage.getItem(TRAINER_EMAIL_KEY)?.trim() || '';
}

export function saveTrainerEmail(email: string): void {
  localStorage.setItem(TRAINER_EMAIL_KEY, email.trim());
}

export function isEmailjsConfigured(config: EmailjsConfig): boolean {
  return Boolean(config.publicKey && config.serviceId && config.templateId);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Default link: current app origin/path with scenario deep-link params. */
export function defaultSimulationLink(scenarioId: string): string {
  const url = new URL(window.location.href);
  url.hash = '';
  url.search = '';
  url.searchParams.set('scenario', scenarioId);
  url.searchParams.set('entry', 'email');
  return url.toString();
}

export function buildOutboundSubject(scenario: ScamScenario): string {
  return `Training exercise: review this sample “${scenario.title}” email`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function plainBody(scenario: ScamScenario): string {
  return scenario.email.body.map((segment) => segment.text).join('');
}

/**
 * Consent email — separate from the practice scam.
 * Often lands in Spam/Junk; asks the recipient to opt in and stop filtering this address.
 */
export function buildConsentOutboundMessage(
  trainerFromName: string,
  trainerEmail: string,
): OutboundMessage {
  const name = escapeHtml(trainerFromName);
  const address = escapeHtml(trainerEmail);
  const replyHref = `mailto:${encodeURIComponent(trainerEmail)}?subject=${encodeURIComponent('I AGREE to scam awareness training emails')}&body=${encodeURIComponent(`I AGREE to be sent scam / phishing-awareness training practice emails from ${trainerEmail}.\n\nI will mark this message as Not spam and add ${trainerEmail} to my contacts so future training emails do not go to Spam.`)}`;

  const subject =
    'Please check Spam: agree to scam training emails + allowlist this address';

  const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;font-size:15px;line-height:1.65;color:#374151;max-width:640px;margin:0 auto;">
      <div style="background:#7f1d1d;color:#fff;padding:12px 16px;border-radius:8px;margin-bottom:18px;font-weight:700;">
        This email often goes to Spam or Junk — that is expected. Open it there, then follow the steps.
      </div>

      <p>Hello,</p>
      <p>
        This message is from <strong>${name}</strong>
        (<a href="mailto:${address}" style="color:#1d4ed8;">${address}</a>).
        It is <strong>not</strong> a scam. It asks for your permission before any
        <strong>scam-awareness training</strong> practice emails are sent.
      </p>

      <p><strong>Please do these two things:</strong></p>
      <ol style="padding-left:1.2rem;">
        <li style="margin-bottom:14px;">
          <strong>Agree</strong> to be sent scam training practice emails from this address.
          Reply with <strong>I AGREE</strong>, or click:
          <p style="margin:10px 0;">
            <a href="${replyHref}"
               style="display:inline-block;padding:12px 20px;background:#1d4ed8;color:#fff;font-weight:700;text-decoration:none;border-radius:6px;">
              I Agree — Reply Now
            </a>
          </p>
        </li>
        <li style="margin-bottom:14px;">
          <strong>Stop this email address from going to Spam</strong>
          (<strong>${address}</strong>):
          <ul style="margin:8px 0 0;padding-left:1.1rem;">
            <li style="margin-bottom:6px;">
              <strong>Remove this message from Spam:</strong>
              Gmail → three dots → <em>Not spam</em>;
              Outlook / others → <em>Not junk</em> / <em>Not spam</em>
            </li>
            <li>
              <strong>Allowlist the address:</strong> add
              <strong>${address}</strong> to Contacts or Safe Senders so future training
              emails stay in your Inbox instead of Spam.
            </li>
          </ul>
        </li>
      </ol>

      <p>
        After you agree and allowlist <strong>${address}</strong>, you may receive a
        separate <strong>practice scam email</strong> for training. Those messages are
        fictional and for education only — not real IRS, bank, or government notices.
      </p>

      <p style="font-size:13px;color:#6b7280;">
        If you do not want this training, ignore this message or reply <strong>NO</strong>.
        Never share passwords or personal information in response to emails that claim
        to be from the IRS or your bank.
      </p>
    </div>
  `.trim();

  const plain = [
    'This email often goes to Spam or Junk — that is expected. Open it there, then follow the steps.',
    '',
    `This message is from ${trainerFromName} (${trainerEmail}). It is NOT a scam.`,
    'It asks for your permission before any scam-awareness training practice emails are sent.',
    '',
    'Please do these two things:',
    '1) Agree to be sent scam training practice emails — reply "I AGREE".',
    `2) Stop ${trainerEmail} from going to Spam: mark this message Not spam / Not junk, then add ${trainerEmail} to Contacts or Safe Senders.`,
    '',
    'After you agree, you may receive a separate practice scam email for training (fictional / educational only).',
    '',
    'If you do not want this training, ignore this message or reply NO.',
  ].join('\r\n');

  return {
    subject,
    html,
    plain,
    fromName: trainerFromName,
    downloadName: 'consent-allowlist-training.eml',
  };
}

export function buildSimulationOutboundMessage(
  scenario: ScamScenario,
  simulationUrl: string,
  trainerFromName: string,
): OutboundMessage {
  const { email } = scenario;
  const bodyHtml = escapeHtml(plainBody(scenario)).replace(/\n/g, '<br>');
  const ctaUrl = escapeHtml(simulationUrl);
  const ctaLabel = escapeHtml(email.ctaLabel);
  const subjectLine = escapeHtml(email.subject);
  const fromName = escapeHtml(email.fromName);
  const fromAddress = escapeHtml(email.fromAddress);
  const trainer = escapeHtml(trainerFromName);

  const html = `
    <div style="font-family:Segoe UI,Arial,sans-serif;font-size:15px;line-height:1.6;color:#374151;max-width:640px;margin:0 auto;">
      <p style="margin:0 0 12px;">Hi — this is a <strong>consented phishing-awareness training</strong> exercise from ${trainer}.</p>
      <p style="margin:0 0 18px;">
        Below is a <strong>sample scam email</strong> (not a real IRS/bank message).
        Notice the fake sender, urgency, and button — then open the practice page.
      </p>

      <div style="border:1px solid #d1d5db;border-radius:10px;overflow:hidden;margin:0 0 20px;background:#ffffff;">
        <div style="background:#f3f4f6;padding:10px 14px;font-size:12px;color:#4b5563;border-bottom:1px solid #e5e7eb;">
          Sample phishing email (simulation)
        </div>
        <div style="padding:16px 18px;">
          <p style="margin:0 0 6px;font-size:12px;color:#6b7280;">
            From: <strong style="color:#111827;">${fromName}</strong> &lt;${fromAddress}&gt;
          </p>
          <p style="margin:0 0 14px;font-size:16px;font-weight:700;color:#111827;">${subjectLine}</p>
          <div style="margin:0 0 18px;">${bodyHtml}</div>
          <p style="text-align:center;margin:20px 0 8px;">
            <a href="${ctaUrl}"
               style="display:inline-block;padding:14px 28px;background:#1d4ed8;color:#ffffff;font-weight:700;text-decoration:none;border-radius:6px;">
              ${ctaLabel}
            </a>
          </p>
          <p style="margin:0;font-size:12px;color:#6b7280;text-align:center;">
            Practice link (opens the training app):<br>
            <a href="${ctaUrl}" style="color:#1d4ed8;">${ctaUrl}</a>
          </p>
        </div>
      </div>

      <p style="margin:0;font-size:12px;color:#6b7280;">
        If you were not expecting this training exercise, you can ignore this message.
      </p>
    </div>
  `.trim();

  const plain = [
    `Hi — this is a consented phishing-awareness training exercise from ${trainerFromName}.`,
    '',
    `Sample scam (“${scenario.title}”) for practice:`,
    `Simulated From: ${email.fromName} <${email.fromAddress}>`,
    `Simulated Subject: ${email.subject}`,
    '',
    plainBody(scenario),
    '',
    `${email.ctaLabel}: ${simulationUrl}`,
  ].join('\r\n');

  return {
    subject: buildOutboundSubject(scenario),
    html,
    plain,
    fromName: trainerFromName,
    downloadName: `${scenario.id}-training-simulation.eml`,
  };
}

function buildEmlFile(recipient: string, message: OutboundMessage): string {
  const boundary = `bound_${Date.now()}`;

  return [
    `To: ${recipient}`,
    `From: ${message.fromName}`,
    `Subject: ${message.subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    'X-Training-Simulation: educational-phishing-awareness',
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="utf-8"',
    '',
    message.plain,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="utf-8"',
    '',
    message.html,
    '',
    `--${boundary}--`,
    '',
  ].join('\r\n');
}

export function downloadOutboundEml(
  recipient: string,
  message: OutboundMessage,
): void {
  const eml = buildEmlFile(recipient, message);
  const blob = new Blob([eml], { type: 'message/rfc822' });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = message.downloadName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

/** @deprecated Prefer downloadOutboundEml */
export function downloadEml(
  scenario: ScamScenario,
  recipient: string,
  simulationUrl: string,
  trainerFromName: string,
): void {
  downloadOutboundEml(
    recipient,
    buildSimulationOutboundMessage(scenario, simulationUrl, trainerFromName),
  );
}

async function ensureEmailjsSdk(): Promise<EmailjsSdk> {
  if (window.emailjs) {
    return window.emailjs;
  }

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-emailjs-sdk="true"]',
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('EmailJS library failed to load.')),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.src = EMAILJS_CDN;
    script.async = true;
    script.dataset.emailjsSdk = 'true';
    script.onload = () => resolve();
    script.onerror = () =>
      reject(
        new Error(
          'EmailJS library failed to load. Check your network connection.',
        ),
      );
    document.head.appendChild(script);
  });

  if (!window.emailjs) {
    throw new Error('EmailJS library failed to initialize.');
  }

  return window.emailjs;
}

export async function sendOutboundWithEmailjs(
  recipient: string,
  message: OutboundMessage,
  config: EmailjsConfig,
): Promise<void> {
  const sdk = await ensureEmailjsSdk();
  sdk.init({ publicKey: config.publicKey });

  await sdk.send(config.serviceId, config.templateId, {
    to_email: recipient,
    subject: message.subject,
    message_html: message.html,
    from_name: message.fromName,
  });
}

export async function sendWithEmailjs(
  scenario: ScamScenario,
  recipient: string,
  simulationUrl: string,
  config: EmailjsConfig,
  trainerFromName: string,
): Promise<void> {
  await sendOutboundWithEmailjs(
    recipient,
    buildSimulationOutboundMessage(scenario, simulationUrl, trainerFromName),
    config,
  );
}
