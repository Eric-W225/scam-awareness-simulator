/**
 * ConsentEmailPanel
 * -----------------
 * Separate email (often lands in Spam) that asks the recipient to:
 *  1) Agree to receive scam-training practice emails
 *  2) Mark this message Not spam / Not junk
 *  3) Allowlist the trainer’s address
 */

import { useState, type FormEvent } from 'react';
import {
  buildConsentOutboundMessage,
  downloadOutboundEml,
  isEmailjsConfigured,
  isValidEmail,
  loadEmailjsConfig,
  loadTrainerEmail,
  loadTrainerFromName,
  saveEmailjsConfig,
  saveTrainerEmail,
  saveTrainerFromName,
  sendOutboundWithEmailjs,
  type EmailjsConfig,
} from '../lib/sendTrainingEmail';

type StatusKind = 'idle' | 'info' | 'success' | 'error';

export function ConsentEmailPanel() {
  const [open, setOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [trainerFromName, setTrainerFromName] = useState(() =>
    loadTrainerFromName(),
  );
  const [trainerEmail, setTrainerEmail] = useState(() => loadTrainerEmail());
  const [emailjsConfig, setEmailjsConfig] = useState<EmailjsConfig>(() =>
    loadEmailjsConfig(),
  );
  const [status, setStatus] = useState<{ kind: StatusKind; message: string }>({
    kind: 'idle',
    message: '',
  });
  const [sending, setSending] = useState(false);

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
    fromName: string;
    fromEmail: string;
  } | null {
    const recipient = recipientEmail.trim();
    const fromName = trainerFromName.trim() || 'Security Awareness Training';
    const fromEmail = trainerEmail.trim();

    if (!isValidEmail(recipient)) {
      setStatus({
        kind: 'error',
        message: 'Enter a valid recipient email address.',
      });
      return null;
    }

    if (!isValidEmail(fromEmail)) {
      setStatus({
        kind: 'error',
        message:
          'Enter the trainer email address they should allowlist (your sending address).',
      });
      return null;
    }

    return { recipient, fromName, fromEmail };
  }

  async function deliver(downloadOnly: boolean) {
    const payload = validate();
    if (!payload) return;

    saveTrainerFromName(payload.fromName);
    saveTrainerEmail(payload.fromEmail);

    const message = buildConsentOutboundMessage(
      payload.fromName,
      payload.fromEmail,
    );

    if (downloadOnly || !isEmailjsConfigured(emailjsConfig)) {
      downloadOutboundEml(payload.recipient, message);
      setStatus({
        kind: 'info',
        message: downloadOnly
          ? `Downloaded consent .eml for ${payload.recipient}. Open it and send from your mail app. Tell them to check Spam.`
          : `No EmailJS setup — downloaded consent .eml for ${payload.recipient}. Send it from your mail app. Tell them to check Spam.`,
      });
      return;
    }

    setSending(true);
    setStatus({ kind: 'info', message: 'Sending consent email…' });

    try {
      saveEmailjsConfig(emailjsConfig);
      await sendOutboundWithEmailjs(payload.recipient, message, emailjsConfig);
      setStatus({
        kind: 'success',
        message: `Consent email sent to ${payload.recipient}. Tell them to check Spam/Junk, mark Not spam, add ${payload.fromEmail} to Contacts, and reply I AGREE.`,
      });
    } catch (error) {
      console.error(error);
      downloadOutboundEml(payload.recipient, message);
      const detail = error instanceof Error ? error.message : 'unknown error';
      setStatus({
        kind: 'error',
        message: `Auto-send failed (${detail}). Downloaded a .eml — send it from your mail app instead.`,
      });
    } finally {
      setSending(false);
    }
  }

  function handleSend(event: FormEvent) {
    event.preventDefault();
    void deliver(false);
  }

  return (
    <section className="consent-email">
      <div className="consent-email-intro">
        <div>
          <p className="consent-step-label">Step 1 · Often lands in Spam</p>
          <h2>Send consent &amp; allowlist email</h2>
          <p>
            Separate from the scam simulation. Asks the recipient to agree to training
            emails, mark this message <strong>Not spam</strong>, and allowlist your address
            before you send practice scam emails.
          </p>
        </div>
        <button
          type="button"
          className="send-toggle-btn consent-toggle"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
        >
          {open ? 'Hide panel' : 'Compose consent email'}
        </button>
      </div>

      {open ? (
        <div className="send-panel consent-panel">
          <form className="send-form" onSubmit={handleSend}>
            <div className="form-row">
              <label htmlFor="consentTrainerFromName">Your From name</label>
              <input
                id="consentTrainerFromName"
                type="text"
                required
                value={trainerFromName}
                onChange={(event) => setTrainerFromName(event.target.value)}
              />
            </div>

            <div className="form-row">
              <label htmlFor="consentTrainerEmail">
                Your email address (they must allowlist this)
              </label>
              <input
                id="consentTrainerEmail"
                type="email"
                required
                autoComplete="email"
                placeholder="you@gmail.com"
                value={trainerEmail}
                onChange={(event) => setTrainerEmail(event.target.value)}
              />
              <span className="field-hint">
                Use the same address EmailJS / your mail app will send from.
              </span>
            </div>

            <div className="form-row">
              <label htmlFor="consentRecipientEmail">Recipient email address</label>
              <input
                id="consentRecipientEmail"
                type="email"
                required
                autoComplete="email"
                placeholder="trainee@example.com"
                value={recipientEmail}
                onChange={(event) => setRecipientEmail(event.target.value)}
              />
            </div>

            <details className="emailjs-setup">
              <summary>Optional: auto-send with EmailJS</summary>
              <p className="field-hint">
                Same template as training emails: <code>to_email</code>,{' '}
                <code>subject</code>, <code>{'{{{message_html}}}'}</code>,{' '}
                <code>from_name</code>.
              </p>
              <div className="form-row">
                <label htmlFor="consentEmailjsPublicKey">Public Key</label>
                <input
                  id="consentEmailjsPublicKey"
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
                  <label htmlFor="consentEmailjsServiceId">Service ID</label>
                  <input
                    id="consentEmailjsServiceId"
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
                  <label htmlFor="consentEmailjsTemplateId">Template ID</label>
                  <input
                    id="consentEmailjsTemplateId"
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
                {sending ? 'Sending…' : 'Send Consent Email'}
              </button>
              <button
                type="button"
                className="send-secondary-btn"
                disabled={sending}
                onClick={() => void deliver(true)}
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
