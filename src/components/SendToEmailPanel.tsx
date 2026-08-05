/**
 * SendToEmailPanel
 * ----------------
 * Trainer UI to email the current scenario to a consented recipient.
 * Sends from the trainer’s real mailbox identity for better inbox delivery;
 * the fake IRS/bank “From” appears inside the sample email body.
 */

import { useEffect, useState, type FormEvent } from 'react';
import type { ScamScenario } from '../types/scenario';
import {
  defaultSimulationLink,
  downloadEml,
  isEmailjsConfigured,
  isValidEmail,
  loadEmailjsConfig,
  loadTrainerFromName,
  saveEmailjsConfig,
  saveTrainerFromName,
  sendWithEmailjs,
  type EmailjsConfig,
} from '../lib/sendTrainingEmail';

interface SendToEmailPanelProps {
  scenario: ScamScenario;
}

type StatusKind = 'idle' | 'info' | 'success' | 'error';

export function SendToEmailPanel({ scenario }: SendToEmailPanelProps) {
  const [open, setOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [simulationLink, setSimulationLink] = useState('');
  const [trainerFromName, setTrainerFromName] = useState(() =>
    loadTrainerFromName(),
  );
  const [consent, setConsent] = useState(false);
  const [emailjsConfig, setEmailjsConfig] = useState<EmailjsConfig>(() =>
    loadEmailjsConfig(),
  );
  const [status, setStatus] = useState<{ kind: StatusKind; message: string }>({
    kind: 'idle',
    message: '',
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setSimulationLink(defaultSimulationLink(scenario.id));
    setStatus({ kind: 'idle', message: '' });
    setConsent(false);
  }, [scenario.id]);

  function updateEmailjsField<K extends keyof EmailjsConfig>(
    key: K,
    value: string,
  ) {
    setEmailjsConfig((prev) => {
      const next = { ...prev, [key]: value };
      saveEmailjsConfig(next);
      return next;
    });
  }

  function validate(): {
    recipient: string;
    simulationUrl: string;
    fromName: string;
  } | null {
    const recipient = recipientEmail.trim();
    const simulationUrl = simulationLink.trim();
    const fromName = trainerFromName.trim() || 'Security Awareness Training';

    if (!isValidEmail(recipient)) {
      setStatus({
        kind: 'error',
        message: 'Enter a valid recipient email address.',
      });
      return null;
    }

    if (!simulationUrl) {
      setStatus({
        kind: 'error',
        message: 'Enter the training page link recipients should open.',
      });
      return null;
    }

    if (!consent) {
      setStatus({
        kind: 'error',
        message: 'Confirm recipient consent before sending.',
      });
      return null;
    }

    return { recipient, simulationUrl, fromName };
  }

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    const payload = validate();
    if (!payload) return;

    saveTrainerFromName(payload.fromName);
    setSending(true);
    setStatus({ kind: 'info', message: 'Sending…' });

    try {
      if (isEmailjsConfigured(emailjsConfig)) {
        saveEmailjsConfig(emailjsConfig);
        await sendWithEmailjs(
          scenario,
          payload.recipient,
          payload.simulationUrl,
          emailjsConfig,
          payload.fromName,
        );
        setStatus({
          kind: 'success',
          message: `Training email sent to ${payload.recipient} from “${payload.fromName}”. Ask them to check Inbox (and Spam once if needed), then mark Not spam / add you to contacts.`,
        });
      } else {
        downloadEml(
          scenario,
          payload.recipient,
          payload.simulationUrl,
          payload.fromName,
        );
        setStatus({
          kind: 'info',
          message: `Downloaded a .eml for ${payload.recipient}. Open it in Outlook/Gmail from YOUR account and send — that is the most reliable way to land in their Inbox.`,
        });
      }
    } catch (error) {
      console.error(error);
      downloadEml(
        scenario,
        payload.recipient,
        payload.simulationUrl,
        payload.fromName,
      );
      const detail = error instanceof Error ? error.message : 'unknown error';
      setStatus({
        kind: 'error',
        message: `Auto-send failed (${detail}). Downloaded a .eml — send it from your mail app instead.`,
      });
    } finally {
      setSending(false);
    }
  }

  function handleDownloadEml() {
    const payload = validate();
    if (!payload) return;

    saveTrainerFromName(payload.fromName);
    downloadEml(
      scenario,
      payload.recipient,
      payload.simulationUrl,
      payload.fromName,
    );
    setStatus({
      kind: 'success',
      message: `Downloaded .eml for ${payload.recipient}. Open it in your mail app (signed in as yourself) and click Send.`,
    });
  }

  return (
    <section className="send-email">
      <button
        type="button"
        className="send-toggle-btn"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        {open ? 'Hide send panel' : 'Send to Email'}
      </button>

      {open ? (
        <div className="send-panel">
          <h2>Send “{scenario.title}” practice email</h2>
          <p className="send-panel-lead">
            <strong>Step 2:</strong> Send only after they received the home-page
            <em> consent &amp; allowlist</em> email, replied <strong>I AGREE</strong>, and
            marked that message Not spam. This message is the practice scam sample
            (fake “{scenario.email.fromName}” appears inside the body).
          </p>

          <div className="deliverability-tips">
            <strong>To land in Inbox:</strong>
            <ol>
              <li>
                In EmailJS, set template <strong>From Name</strong> to{' '}
                <code>{'{{from_name}}'}</code> and use your connected Gmail/Outlook
                as From Email (default service email).
              </li>
              <li>
                Ask the recipient to add your address to Contacts before you send.
              </li>
              <li>
                Prefer <strong>Download .eml</strong> and send from Outlook/Gmail
                yourself if EmailJS still hits Spam.
              </li>
            </ol>
          </div>

          <form className="send-form" onSubmit={handleSend}>
            <div className="form-row">
              <label htmlFor="trainerFromName">Your From name (shown in their inbox)</label>
              <input
                id="trainerFromName"
                type="text"
                required
                autoComplete="name"
                placeholder="Your name or Security Awareness Training"
                value={trainerFromName}
                onChange={(event) => setTrainerFromName(event.target.value)}
              />
              <span className="field-hint">
                Use your real name — not “IRS” or a bank. Spoofed sender names are why
                these emails go to Spam.
              </span>
            </div>

            <div className="form-row">
              <label htmlFor="recipientEmail">Recipient email address</label>
              <input
                id="recipientEmail"
                type="email"
                required
                autoComplete="email"
                placeholder="trainee@example.com"
                value={recipientEmail}
                onChange={(event) => setRecipientEmail(event.target.value)}
              />
            </div>

            <div className="form-row">
              <label htmlFor="simulationLink">
                Training page link (used in the email button)
              </label>
              <input
                id="simulationLink"
                type="url"
                required
                value={simulationLink}
                onChange={(event) => setSimulationLink(event.target.value)}
              />
              <span className="field-hint">
                Recipients must be able to open this URL. Localhost only works on this
                computer.
              </span>
            </div>

            <label className="consent-check">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                required
              />
              <span>
                I confirm the recipient consented to receive this phishing-awareness
                training simulation, and I will not use this for any real scam.
              </span>
            </label>

            <details className="emailjs-setup">
              <summary>Optional: auto-send with EmailJS</summary>
              <p className="field-hint">
                Template fields:{' '}
                <code>to_email</code>, <code>subject</code>,{' '}
                <code>{'{{{message_html}}}'}</code>, <code>from_name</code>.
                From Email must be your connected account (not a fake IRS address).
              </p>
              <div className="form-row">
                <label htmlFor="emailjsPublicKey">Public Key</label>
                <input
                  id="emailjsPublicKey"
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={emailjsConfig.publicKey}
                  onChange={(event) =>
                    updateEmailjsField('publicKey', event.target.value)
                  }
                />
              </div>
              <div className="form-row form-row-split">
                <div>
                  <label htmlFor="emailjsServiceId">Service ID</label>
                  <input
                    id="emailjsServiceId"
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    value={emailjsConfig.serviceId}
                    onChange={(event) =>
                      updateEmailjsField('serviceId', event.target.value)
                    }
                  />
                </div>
                <div>
                  <label htmlFor="emailjsTemplateId">Template ID</label>
                  <input
                    id="emailjsTemplateId"
                    type="text"
                    autoComplete="off"
                    spellCheck={false}
                    value={emailjsConfig.templateId}
                    onChange={(event) =>
                      updateEmailjsField('templateId', event.target.value)
                    }
                  />
                </div>
              </div>
            </details>

            <div className="send-actions">
              <button
                type="submit"
                className="send-primary-btn"
                disabled={sending}
              >
                {sending ? 'Sending…' : 'Send Simulation Email'}
              </button>
              <button
                type="button"
                className="send-secondary-btn"
                onClick={handleDownloadEml}
                disabled={sending}
              >
                Download .eml instead
              </button>
            </div>

            {status.message ? (
              <p
                className={`send-status is-${status.kind}`}
                role="status"
                aria-live="polite"
              >
                {status.message}
              </p>
            ) : null}
          </form>
        </div>
      ) : null}
    </section>
  );
}
